import { ChangeDetectionStrategy, Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { LanguageService } from '../../../core/services/language.service';
import { ManagementMovieService, MovieDTO, MovieDetailResponse, MovieTypeDTO, RateDTO, BannerDTO } from '../../../core/services/management-movie.service';
import { ApiService } from '../../../core/services/api.service';

type FilterTab = 'ALL' | 'NOW_SHOWING' | 'HOT' | 'COMING_SOON' | 'TOP_SALES';

@Component({
  selector: 'app-management-movies',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './management-movies.component.html',
  styleUrls: ['./management-movies.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManagementMoviesComponent implements OnInit {
  protected readonly language = inject(LanguageService);
  protected readonly movieService = inject(ManagementMovieService);
  protected readonly platformId = inject(PLATFORM_ID);
  protected readonly fb = inject(FormBuilder);
  protected readonly apiService = inject(ApiService);
  protected readonly t = this.language.t.bind(this.language);

  // Filter State
  activeTab = signal<FilterTab>('ALL');
  searchQuery = signal<string>('');
  
  // Pagination State
  currentPage = signal(0);
  pageSize = signal(10);
  totalPages = signal(0);
  totalElements = signal(0);

  // Data State
  movies = signal<any[]>([]); // Using any[] because list APIs return different DTOs
  selectedMovieCode = signal<string | null>(null);
  selectedMovieDetail = signal<MovieDetailResponse | null>(null);
  isLoadingList = signal(false);
  isLoadingDetail = signal(false);

  // Dropdown Data
  movieTypes = signal<MovieTypeDTO[]>([]);
  rates = signal<RateDTO[]>([]);
  banners = signal<BannerDTO[]>([]);

  // Modals visibility
  showFormModal = signal(false);
  showDeleteModal = signal(false);

  // Forms
  movieForm: FormGroup;
  isEditMode = signal(false);
  deleteMovieName = signal<string>('');

  isRateDropdownOpen = signal(false);
  isBannerDropdownOpen = signal(false);

  constructor() {
    // Regex for URL validation
    const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

    this.movieForm = this.fb.group({
      code: [{ value: '', disabled: true }],
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      nameEn: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      director: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      actor: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      description: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(5000)]],
      descriptionEn: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(5000)]],
      language: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      subtitle: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      trailer: ['', [Validators.required, Validators.pattern(urlRegex)]],
      movieDuration: ['', [Validators.required, Validators.min(1)]],
      premiereDate: ['', Validators.required],
      endDate: ['', Validators.required],
      bannerId: ['', Validators.required],
      rate: ['', Validators.required],
      movieTypeIds: [[], [Validators.required, Validators.minLength(1)]]
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadDropdownData();
      this.loadMovies();
    }
  }

  // --- Data Loading ---
  loadDropdownData() {
    this.movieService.getAllMovieTypes().subscribe(res => {
      // Assuming response wraps data
      this.movieTypes.set(res?.data || res || []);
    });
    this.movieService.getAllRates().subscribe(res => {
      this.rates.set(res?.data || res || []);
    });
    this.movieService.getAllBanners().subscribe(res => {
      this.banners.set(res?.data || res || []);
    });
  }

  loadMovies() {
    this.isLoadingList.set(true);
    let obs$;

    switch(this.activeTab()) {
      case 'ALL':
        obs$ = this.movieService.getMoviePage(this.currentPage(), this.pageSize());
        break;
      case 'TOP_SALES':
        obs$ = this.movieService.sortMovieByTicketSales(this.currentPage(), this.pageSize());
        break;
      case 'NOW_SHOWING':
        obs$ = this.movieService.getNowShowingMovies();
        break;
      case 'HOT':
        obs$ = this.movieService.getNowShowingMoviesHot();
        break;
      case 'COMING_SOON':
        obs$ = this.movieService.getComingSoonMovies();
        break;
    }

    obs$.subscribe({
      next: (res: any) => {
        const data = res?.data || res;
        let dataList = [];
        let total = 0;
        let totalP = 1;

        if (data?.content) {
          dataList = data.content;
          total = data.totalElements ?? dataList.length;
          totalP = data.totalPages ?? 1;
        } else if (Array.isArray(data)) {
          dataList = data;
          total = dataList.length;
          totalP = 1;
        } else if (res?.content) {
          dataList = res.content;
          total = res.totalElements ?? dataList.length;
          totalP = res.totalPages ?? 1;
        }

        // Apply custom sorting for 'ALL' tab: Now Showing (1) -> Coming Soon (2) -> Ended (3)
        // Within each category, sort by premiereDate descending
        if (this.activeTab() === 'ALL') {
          dataList.sort((a: any, b: any) => {
            const getPriority = (m: any) => {
              const nowTime = new Date().getTime();
              const p = m.premiereDate || m.releaseDate;
              const e = m.endDate;
              const pTime = p ? new Date(p.replace(' ', 'T')).getTime() : 0;
              const eTime = e ? new Date(e.replace(' ', 'T')).getTime() : 0;
              
              if (eTime && nowTime > eTime) return 3; // Ended
              if (pTime && nowTime < pTime) return 2; // Coming Soon
              return 1; // Now Showing
            };

            const pA = getPriority(a);
            const pB = getPriority(b);

            if (pA !== pB) return pA - pB;

            const dateA = new Date((a.premiereDate || a.releaseDate || '').replace(' ', 'T')).getTime();
            const dateB = new Date((b.premiereDate || b.releaseDate || '').replace(' ', 'T')).getTime();
            return dateB - dateA;
          });
        }

        this.totalElements.set(total);
        this.totalPages.set(totalP);
        this.movies.set(dataList);
        this.isLoadingList.set(false);

        // Auto select first movie if none selected
        if (dataList.length > 0 && !this.selectedMovieCode()) {
          this.selectMovie(dataList[0].code);
        } else if (dataList.length === 0) {
          this.selectedMovieCode.set(null);
          this.selectedMovieDetail.set(null);
        }
      },
      error: () => this.isLoadingList.set(false)
    });
  }

  selectMovie(code: string) {
    this.selectedMovieCode.set(code);
    this.loadMovieDetail(code);
  }

  loadMovieDetail(code: string) {
    this.isLoadingDetail.set(true);
    this.movieService.getMovieDetail(code).subscribe({
      next: (res: any) => {
        const detail = res?.data || res;
        this.selectedMovieDetail.set(detail);
        this.isLoadingDetail.set(false);
      },
      error: () => {
        this.selectedMovieDetail.set(null);
        this.isLoadingDetail.set(false);
      }
    });
  }

  // --- Filtering & Pagination ---
  setTab(tab: FilterTab) {
    this.activeTab.set(tab);
    this.currentPage.set(0); // Reset pagination on tab change
    this.loadMovies();
  }

  nextPage() {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.update(p => p + 1);
      this.loadMovies();
    }
  }

  prevPage() {
    if (this.currentPage() > 0) {
      this.currentPage.update(p => p - 1);
      this.loadMovies();
    }
  }

  filteredMovies = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.movies();
    return this.movies().filter(m => 
      (m.name && m.name.toLowerCase().includes(q)) || 
      (m.nameEn && m.nameEn.toLowerCase().includes(q)) ||
      (m.code && m.code.toLowerCase().includes(q))
    );
  });

  isEn(): boolean {
    return this.language.currentLanguage() === 'en';
  }

  // --- Forms ---
  openAddModal() {
    this.isEditMode.set(false);
    this.movieForm.reset();
    
    // Set some defaults
    this.movieForm.patchValue({
      movieTypeIds: []
    });

    // Make premiereDate required for create
    this.movieForm.get('premiereDate')?.setValidators([Validators.required]);
    this.movieForm.get('premiereDate')?.updateValueAndValidity();

    this.showFormModal.set(true);
  }

  openEditModal() {
    const detail = this.selectedMovieDetail();
    if (!detail) return;

    this.isEditMode.set(true);
    
    // For edit, premiereDate might be read-only or optional depending on logic, keeping it required for now
    this.movieForm.get('premiereDate')?.setValidators([Validators.required]);
    this.movieForm.get('premiereDate')?.updateValueAndValidity();

    // Format date for input[type="date"] if needed. Assuming yyyy-MM-dd HH:mm:ss or yyyy-MM-dd'T'HH:mm:ss
    let formattedDate = detail.premiereDate || (detail as any).releaseDate;
    if (formattedDate) {
      formattedDate = formattedDate.split('T')[0].split(' ')[0];
    }

    // Map movieType strings back to IDs since API might only return string arrays
    let mappedTypeIds = detail.movieTypeIds || [];
    if (mappedTypeIds.length === 0 && ((detail as any).movieType || (detail as any).movieTypeEn)) {
      const allTypes = this.movieTypes();
      const typeStrVi = (detail as any).movieType || [];
      const typeStrEn = (detail as any).movieTypeEn || [];
      
      mappedTypeIds = allTypes
        .filter(t => typeStrVi.includes(t.movieTypeNameVi) || typeStrEn.includes(t.movieTypeNameEn))
        .map(t => t.id);
    }
    let formattedEndDate = detail.endDate;
    if (formattedEndDate) {
      formattedEndDate = formattedEndDate.split('T')[0].split(' ')[0];
    }

    this.movieForm.patchValue({
      code: detail.code,
      name: detail.name,
      nameEn: detail.nameEn,
      director: detail.director,
      actor: detail.actor,
      description: detail.description,
      descriptionEn: detail.descriptionEn,
      language: detail.language,
      subtitle: detail.subtitle,
      trailer: detail.trailer || (detail as any).trailerUrl,
      movieDuration: detail.movieDuration || (detail as any).durationMinutes || (detail as any).duration,
      premiereDate: formattedDate,
      endDate: formattedEndDate,
      bannerId: detail.bannerId,
      rate: detail.rate,
      movieTypeIds: mappedTypeIds
    });

    this.showFormModal.set(true);
  }

  submitForm() {
    if (this.movieForm.invalid) {
      this.movieForm.markAllAsTouched();
      return;
    }

    const payload = this.movieForm.getRawValue();
    
    // Format payload if needed (e.g. date conversion)
    if (payload.premiereDate && payload.premiereDate.length === 10) {
      payload.premiereDate = `${payload.premiereDate}T00:00:00`;
    }
    if (payload.endDate && payload.endDate.length === 10) {
      payload.endDate = `${payload.endDate}T00:00:00`;
    }

    const obs$ = this.isEditMode() 
      ? this.movieService.updateMovie(payload)
      : this.movieService.saveMovie(payload);

    obs$.subscribe({
      next: () => {
        this.showFormModal.set(false);
        this.loadMovies(); // Refresh list
        if (this.isEditMode() && this.selectedMovieCode()) {
          this.loadMovieDetail(this.selectedMovieCode()!); // Refresh detail
        }
      },
      error: (err) => {
        console.error('Save failed', err);
        // Handle error (show toast)
      }
    });
  }

  // --- Deletion ---
  openDeleteModal() {
    const detail = this.selectedMovieDetail();
    if (!detail) return;
    this.deleteMovieName.set(detail.name); // Delete API uses name!
    this.showDeleteModal.set(true);
  }

  submitDelete() {
    this.movieService.deleteMovieByName(this.deleteMovieName()).subscribe({
      next: () => {
        this.showDeleteModal.set(false);
        this.selectedMovieCode.set(null);
        this.selectedMovieDetail.set(null);
        this.loadMovies();
      },
      error: (err) => {
         console.error('Delete failed', err);
      }
    });
  }

  // --- Helpers ---
  resolveImageUrl(movie: any): string {
    if (!movie) return 'https://via.placeholder.com/300x450?text=No+Poster';
    
    // If movie is a string, assume it's the URL
    if (typeof movie === 'string') {
      if (movie.startsWith('http') || movie.startsWith('data:')) return movie;
      return this.apiService.apiUrl(movie.startsWith('/') ? movie : `/${movie}`);
    }

    // Try various property names, including nested movie object
    let url = movie?.posterUrl || movie?.posterPath || movie?.poster || 
                movie?.imageUrl || movie?.image || movie?.imagePath || 
                movie?.thumbnailUrl || movie?.thumbnail ||
                movie?.movie?.poster || movie?.movie?.posterUrl || movie?.movie?.image;

    // Handle object-type poster properties
    if (url && typeof url === 'object') {
      url = url.url || url.path || url.link || url.imageUrl || url.posterUrl || url.toString();
    }

    if (typeof url === 'string') {
      url = url.trim();
      // Filter out garbage strings
      if (url === '[object Object]' || url === 'null' || url === 'undefined' || url === '') {
        url = null;
      }
    }

    // Fallback to movie code if no poster is found
    if (!url && movie?.code) {
      // In many cinema systems, there's a predictable endpoint for images by code
      // We'll try to guess it or just use placeholder
      return 'https://via.placeholder.com/300x450?text=' + encodeURIComponent(movie.name || 'No Poster');
    }

    if (!url) return 'https://via.placeholder.com/300x450?text=No+Poster';

    if (url.startsWith('http') || url.startsWith('data:')) return url;
    
    // Final check for garbage
    if (url.includes('[object Object]')) return 'https://via.placeholder.com/300x450?text=No+Poster';

    // If the url is just a filename (no slashes), it is likely missing the /uploads/ path
    if (!url.includes('/')) {
      url = `/uploads/${url}`;
    }

    return this.apiService.apiUrl(url.startsWith('/') ? url : `/${url}`);
  }

  toggleMovieType(typeId: number) {
    const currentTypes: number[] = this.movieForm.get('movieTypeIds')?.value || [];
    const index = currentTypes.indexOf(typeId);
    
    if (index > -1) {
      // Remove
      this.movieForm.patchValue({
        movieTypeIds: currentTypes.filter(id => id !== typeId)
      });
    } else {
      // Add
      this.movieForm.patchValue({
        movieTypeIds: [...currentTypes, typeId]
      });
    }
    this.movieForm.get('movieTypeIds')?.markAsTouched();
  }

  hasMovieType(typeId: number): boolean {
    const currentTypes: number[] = this.movieForm.get('movieTypeIds')?.value || [];
    return currentTypes.includes(typeId);
  }

  getBannerTitle(id: any): string {
    const banner = this.banners().find(b => b.id === id);
    return banner ? banner.title : '';
  }

  protected movieRateCode(movie: any): string {
    if (!movie) return 'P';
    const rate = (movie.rate || movie.ageRating || '').toUpperCase();
    if (rate.includes('PG-13')) return 'PG-13';
    if (rate.includes('NC-17')) return 'NC-17';
    if (rate.startsWith('PG')) return 'PG';
    if (rate.startsWith('G')) return 'G';
    if (rate.startsWith('R')) return 'R';
    // For P, T13, T16, T18, K
    if (rate.startsWith('P')) return 'P';
    if (rate.startsWith('K')) return 'K';
    if (rate.startsWith('C13') || rate.startsWith('T13')) return 'T13';
    if (rate.startsWith('C16') || rate.startsWith('T16')) return 'T16';
    if (rate.startsWith('C18') || rate.startsWith('T18')) return 'T18';
    return (rate.split(/[\s-]/)[0] || '').trim();
  }

  protected getRateClass(movie: any): string {
    const r = this.movieRateCode(movie);
    if (r === 'G' || r === 'P') return 'rate-g';
    if (r === 'PG' || r === 'K') return 'rate-pg';
    if (r === 'PG-13' || r === 'T13') return 'rate-pg13';
    if (r === 'R' || r === 'T16') return 'rate-r';
    if (r === 'NC-17' || r === 'T18') return 'rate-nc17';
    return '';
  }

  protected getMovieStatus(movie: any): { label: string, class: string } {
    if (!movie) return { label: '', class: '' };
    
    const nowTime = new Date().getTime();
    
    const premiere = movie.premiereDate || movie.releaseDate;
    const end = movie.endDate;

    // Convert strings like "2026-04-01 00:00:00" to Date objects
    const pTime = premiere ? new Date(premiere.replace(' ', 'T')).getTime() : 0;
    const eTime = end ? new Date(end.replace(' ', 'T')).getTime() : 0;

    // 1. If today is after endDate -> Ended
    if (eTime && nowTime > eTime) {
      return { label: this.t('management.statusEnded'), class: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' };
    }

    // 2. If today is before premiereDate -> Coming Soon
    if (pTime && nowTime < pTime) {
      return { label: this.t('management.statusComingSoon'), class: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' };
    }

    // 3. Otherwise (in between or no end date) -> Now Showing
    return { label: this.t('management.statusNowShowing'), class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' };
  }
}
