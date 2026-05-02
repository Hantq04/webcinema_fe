import { ChangeDetectionStrategy, Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LanguageService } from '../../../core/services/language.service';
import { CinemaService, CinemaDTO } from '../../../core/services/cinema.service';
import { RoomService, RoomDTO } from '../../../core/services/room.service';

@Component({
  selector: 'app-management-cinemas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './management-cinemas.component.html',
  styleUrls: ['./management-cinemas.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManagementCinemasComponent implements OnInit {
  protected readonly language = inject(LanguageService);
  protected readonly cinemaService = inject(CinemaService);
  protected readonly roomService = inject(RoomService);
  protected readonly platformId = inject(PLATFORM_ID);
  protected readonly fb = inject(FormBuilder);
  protected readonly t = this.language.t.bind(this.language);

  // Filter State
  addresses = signal<string[]>([]);
  selectedAddress = signal<string>('');
  isAddressDropdownOpen = signal(false);
  searchQuery = signal<string>('');

  // Data State
  cinemas = signal<CinemaDTO[]>([]);
  selectedCinema = signal<CinemaDTO | null>(null);
  rooms = signal<RoomDTO[]>([]);
  isLoadingCinemas = signal(false);
  isLoadingRooms = signal(false);

  // Modals visibility
  showCinemaModal = signal(false);
  showRoomModal = signal(false);
  showDeleteCinemaModal = signal(false);
  showDeleteRoomModal = signal(false);

  // Forms
  cinemaForm: FormGroup;
  roomForm: FormGroup;
  isEditCinemaMode = signal(false);
  isEditRoomMode = signal(false);
  deleteCinemaCode = signal<string>('');
  deleteRoomCode = signal<string>('');

  constructor() {
    this.cinemaForm = this.fb.group({
      code: [{ value: '', disabled: true }], // Backend generated
      nameOfCinema: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      address: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(30)]],
      description: ['', [Validators.minLength(6), Validators.maxLength(50)]]
    });

    this.roomForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(5)]],
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      cinemaName: [{ value: '', disabled: true }],
      capacity: [100, [Validators.required, Validators.min(50), Validators.max(400)]],
      type: ['STANDARD', Validators.required],
      description: ['', [Validators.minLength(6), Validators.maxLength(50)]]
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadAddresses();
      this.loadCinemas('');
    }
  }

  // --- Address Filter ---
  loadAddresses() {
    this.cinemaService.getAllAddresses().subscribe(addresses => {
      this.addresses.set(addresses);
    });
  }

  toggleAddressDropdown() {
    this.isAddressDropdownOpen.update(v => !v);
  }

  onAddressChange(address: string) {
    this.selectedAddress.set(address);
    this.selectedCinema.set(null);
    this.rooms.set([]);
    this.loadCinemas(address);
  }

  // --- Cinemas ---
  loadCinemas(address: string) {
    this.isLoadingCinemas.set(true);
    // Use mock method until backend provides CinemaDTO[]
    this.cinemaService.mockGetCinemas(address).subscribe({
      next: (data) => {
        this.cinemas.set(data);
        this.isLoadingCinemas.set(false);
        if (data.length > 0 && !this.selectedCinema()) {
          this.selectCinema(data[0]);
        }
      },
      error: () => this.isLoadingCinemas.set(false)
    });
  }

  selectCinema(cinema: CinemaDTO) {
    this.selectedCinema.set(cinema);
    this.loadRooms(cinema.nameOfCinema);
  }

  filteredCinemas = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.cinemas();
    return this.cinemas().filter(c => 
      c.nameOfCinema.toLowerCase().includes(q) || 
      c.code.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q)
    );
  });

  // --- Rooms ---
  loadRooms(cinemaName: string) {
    this.isLoadingRooms.set(true);
    // Use mock method until backend provides RoomDTO[]
    this.roomService.mockGetRoomsByCinema(cinemaName).subscribe({
      next: (data) => {
        this.rooms.set(data);
        this.isLoadingRooms.set(false);
      },
      error: () => this.isLoadingRooms.set(false)
    });
  }

  filteredRooms = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.rooms();
    return this.rooms().filter(r => 
      r.name.toLowerCase().includes(q) || 
      r.code.toLowerCase().includes(q)
    );
  });

  // --- Cinema Actions ---
  openAddCinemaModal() {
    this.isEditCinemaMode.set(false);
    this.cinemaForm.reset();
    if (this.selectedAddress()) {
      this.cinemaForm.patchValue({ address: this.selectedAddress() });
    }
    this.showCinemaModal.set(true);
  }

  openEditCinemaModal(cinema: CinemaDTO) {
    this.isEditCinemaMode.set(true);
    this.cinemaForm.patchValue({
      code: cinema.code,
      nameOfCinema: cinema.nameOfCinema,
      address: cinema.address,
      description: cinema.description
    });
    this.showCinemaModal.set(true);
  }

  submitCinema() {
    if (this.cinemaForm.invalid) {
      this.cinemaForm.markAllAsTouched();
      return;
    }
    
    const payload = this.cinemaForm.getRawValue(); // gets disabled fields too
    const obs$ = this.isEditCinemaMode() 
      ? this.cinemaService.updateCinema(payload)
      : this.cinemaService.saveCinema(payload);

    obs$.subscribe(() => {
      this.showCinemaModal.set(false);
      this.loadCinemas(this.selectedAddress());
      this.loadAddresses(); // Refresh addresses in case a new one was added
    });
  }

  openDeleteCinemaModal(code: string) {
    this.deleteCinemaCode.set(code);
    this.showDeleteCinemaModal.set(true);
  }

  submitDeleteCinema() {
    this.cinemaService.deleteCinema(this.deleteCinemaCode()).subscribe(() => {
      this.showDeleteCinemaModal.set(false);
      if (this.selectedCinema()?.code === this.deleteCinemaCode()) {
        this.selectedCinema.set(null);
        this.rooms.set([]);
      }
      this.loadCinemas(this.selectedAddress());
    });
  }

  // --- Room Actions ---
  openAddRoomModal() {
    if (!this.selectedCinema()) return;
    
    this.isEditRoomMode.set(false);
    this.roomForm.reset({
      cinemaName: this.selectedCinema()!.nameOfCinema,
      capacity: 100,
      type: 'STANDARD'
    });
    this.roomForm.get('code')?.enable();
    this.showRoomModal.set(true);
  }

  openEditRoomModal(room: RoomDTO) {
    this.isEditRoomMode.set(true);
    this.roomForm.patchValue({
      code: room.code,
      name: room.name,
      cinemaName: room.cinemaName,
      capacity: room.capacity,
      type: room.type,
      description: room.description
    });
    this.roomForm.get('code')?.disable(); // Code shouldn't be edited
    this.showRoomModal.set(true);
  }

  submitRoom() {
    if (this.roomForm.invalid) {
      this.roomForm.markAllAsTouched();
      return;
    }

    const payload = this.roomForm.getRawValue();
    const obs$ = this.isEditRoomMode()
      ? this.roomService.updateRoom(payload)
      : this.roomService.saveRoom(payload);

    obs$.subscribe(() => {
      this.showRoomModal.set(false);
      if (this.selectedCinema()) {
        this.loadRooms(this.selectedCinema()!.nameOfCinema);
      }
    });
  }

  openDeleteRoomModal(code: string) {
    this.deleteRoomCode.set(code);
    this.showDeleteRoomModal.set(true);
  }

  submitDeleteRoom() {
    this.roomService.deleteRoom(this.deleteRoomCode()).subscribe(() => {
      this.showDeleteRoomModal.set(false);
      if (this.selectedCinema()) {
        this.loadRooms(this.selectedCinema()!.nameOfCinema);
      }
    });
  }

  // Helpers
  getBadgeClass(status: string | undefined): string {
    if (!status) return 'bg-gray-100 text-gray-800';
    if (status.toUpperCase() === 'ACTIVE') return 'bg-emerald-100 text-emerald-800';
    if (status.toUpperCase() === 'MAINTENANCE') return 'bg-amber-100 text-amber-800';
    return 'bg-gray-100 text-gray-800';
  }
}
