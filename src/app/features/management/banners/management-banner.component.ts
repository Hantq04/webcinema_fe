import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { LanguageService } from '../../../core/services/language.service';
import { BannerService } from '../../../core/services/banner.service';
import { BannerResponse } from '../../../core/models/banner.model';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-management-banner',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './management-banner.component.html',
  styleUrls: ['./management-banner.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManagementBannerComponent implements OnInit {
  protected readonly language = inject(LanguageService);
  protected readonly bannerService = inject(BannerService);
  protected readonly fb = inject(FormBuilder);
  protected readonly apiService = inject(ApiService);
  protected readonly t = this.language.t.bind(this.language);

  banners = signal<BannerResponse[]>([]);
  isLoading = signal(false);
  searchQuery = signal('');

  // Modal state
  showFormModal = signal(false);
  showDeleteModal = signal(false);
  
  bannerForm: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  bannerToDelete = signal<BannerResponse | null>(null);

  filteredBanners = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.banners();
    return this.banners().filter(b => 
      b.title.toLowerCase().includes(q) || 
      b.titleEn.toLowerCase().includes(q)
    );
  });

  constructor() {
    this.bannerForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      titleEn: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      image: [null]
    });
  }

  ngOnInit(): void {
    this.loadBanners();
  }

  loadBanners() {
    this.isLoading.set(true);
    this.bannerService.getAllBanners().subscribe({
      next: (data) => {
        this.banners.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => this.imagePreview = e.target.result;
      reader.readAsDataURL(file);
    }
  }

  openAddModal() {
    this.bannerForm.reset();
    this.selectedFile = null;
    this.imagePreview = null;
    this.showFormModal.set(true);
  }

  submitForm() {
    if (this.bannerForm.invalid || !this.selectedFile) {
      this.bannerForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    const rawValue = this.bannerForm.getRawValue();
    
    formData.append('title', rawValue.title);
    formData.append('titleEn', rawValue.titleEn);
    formData.append('image', this.selectedFile);
    
    this.bannerService.saveBanner(formData).subscribe({
      next: () => {
        this.showFormModal.set(false);
        this.loadBanners();
      }
    });
  }

  openDeleteModal(banner: BannerResponse) {
    this.bannerToDelete.set(banner);
    this.showDeleteModal.set(true);
  }

  confirmDelete() {
    const banner = this.bannerToDelete();
    if (banner) {
      this.bannerService.deleteBanner(banner.id).subscribe({
        next: () => {
          this.showDeleteModal.set(false);
          this.loadBanners();
        }
      });
    }
  }

  resolveImageUrl(path: string): string {
    if (!path) return 'assets/images/no-image.png';
    if (path.startsWith('http')) return path;
    return this.apiService.apiUrl(path.startsWith('/') ? path : `/${path}`);
  }
}
