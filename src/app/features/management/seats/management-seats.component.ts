import { ChangeDetectionStrategy, Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../../core/services/language.service';
import { SeatResponse, SeatService } from '../../../core/services/seat.service';
import { CinemaService } from '../../../core/services/cinema.service';
import { RoomService } from '../../../core/services/room.service';

@Component({
  selector: 'app-management-seats',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './management-seats.component.html',
  styleUrls: ['./management-seats.component.css']
})
export class ManagementSeatsComponent implements OnInit {
  protected readonly language = inject(LanguageService);
  protected readonly seatService = inject(SeatService);
  protected readonly cinemaService = inject(CinemaService);
  protected readonly roomService = inject(RoomService);
  protected readonly platformId = inject(PLATFORM_ID);
  protected readonly t = this.language.t.bind(this.language);

  // Filter State
  addresses = signal<string[]>([]);
  selectedAddress = signal<string>('');
  isAddressDropdownOpen = signal(false);

  cinemas = signal<string[]>([]);
  selectedCinema = signal<string>('');
  isCinemaDropdownOpen = signal(false);

  rooms = signal<string[]>([]);
  selectedRoomCode = signal<string>('');
  isRoomDropdownOpen = signal(false);

  toggleAddressDropdown() {
    this.isAddressDropdownOpen.set(!this.isAddressDropdownOpen());
    this.isCinemaDropdownOpen.set(false);
    this.isRoomDropdownOpen.set(false);
  }

  toggleCinemaDropdown() {
    if (this.selectedAddress()) {
      this.isCinemaDropdownOpen.set(!this.isCinemaDropdownOpen());
      this.isAddressDropdownOpen.set(false);
      this.isRoomDropdownOpen.set(false);
    }
  }

  toggleRoomDropdown() {
    this.isRoomDropdownOpen.set(!this.isRoomDropdownOpen());
    this.isAddressDropdownOpen.set(false);
    this.isCinemaDropdownOpen.set(false);
  }

  // Seats State
  roomSeats = signal<SeatResponse[]>([]);
  searchQuery = signal<string>('');
  selectedSeatIds = signal<number[]>([]);
  isSelectionMode = signal(false);

  // Pagination
  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(15);

  // Modals visibility
  showGenerateModal = signal(false);
  showEditModal = signal(false);
  showDeleteModal = signal(false);
  showRefreshModal = signal(false);

  // Forms Data
  generateData = signal({ roomName: '', roomCode: '' });
  editData = signal({
    id: 0,
    line: '',
    number: 1,
    roomName: '',
    roomCode: '',
    status: '',
    seatType: '',
    priceTicket: 0,
    notes: ''
  });
  deleteId = signal<number>(0);
  isRefreshing = signal(false);
  isStatusDropdownOpen = signal(false);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadAddresses();
    }
  }

  // --- Filter Logic ---

  loadAddresses() {
    this.cinemaService.getAllAddresses().subscribe(addresses => {
      this.addresses.set(addresses);
    });
  }

  onAddressChange(address: string) {
    this.selectedAddress.set(address);
    this.selectedCinema.set('');
    this.selectedRoomCode.set('');
    this.cinemas.set([]);
    this.rooms.set([]);
    this.roomSeats.set([]);

    if (address) {
      this.loadCinemas(address);
    }
  }

  loadCinemas(address: string) {
    this.cinemaService.getCinemasByAddress(address).subscribe(cinemas => {
      this.cinemas.set(cinemas);
    });
  }

  onCinemaChange(cinema: string) {
    this.selectedCinema.set(cinema);
    this.selectedRoomCode.set('');
    this.rooms.set([]);
    this.roomSeats.set([]);

    if (cinema) {
      this.loadRooms(cinema);
    }
  }

  loadRooms(cinema: string) {
    this.roomService.getRoomsByCinema(cinema).subscribe(rooms => {
      this.rooms.set(rooms);
      if (rooms && rooms.length > 0) {
        this.onRoomChange(rooms[0]);
      }
    });
  }

  onRoomChange(roomCode: string) {
    this.selectedRoomCode.set(roomCode);
    this.selectedSeatIds.set([]); // Clear selection when room changes
    if (roomCode) {
      this.loadSeats(roomCode);
    } else {
      this.roomSeats.set([]);
    }
  }

  loadSeats(roomCode: string) {
    this.seatService.getSeatsByRoom(roomCode).subscribe(seats => {
      this.roomSeats.set(seats);
      this.currentPage.set(1);
    });
  }

  refreshSeats() {
    if (this.selectedRoomCode()) {
      this.loadSeats(this.selectedRoomCode());
    }
  }

  // --- Computed Data ---

  filteredAndPaginatedSeats = computed(() => {
    let filtered = this.roomSeats();
    const query = this.searchQuery().toLowerCase().trim();

    if (query) {
      filtered = filtered.filter(s =>
        (s.line && s.line.toLowerCase().includes(query)) ||
        (s.number && s.number.toString().includes(query)) ||
        (s.room && s.room.toLowerCase().includes(query)) ||
        (s.seatType && s.seatType.toLowerCase().includes(query)) ||
        (s.id && s.id.toString().includes(query))
      );
    }

    const start = (this.currentPage() - 1) * this.itemsPerPage();
    return filtered.slice(start, start + this.itemsPerPage());
  });

  totalPages = computed(() => {
    let filtered = this.roomSeats();
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      filtered = filtered.filter(s =>
        (s.line && s.line.toLowerCase().includes(query)) ||
        (s.number && s.number.toString().includes(query)) ||
        (s.room && s.room.toLowerCase().includes(query)) ||
        (s.seatType && s.seatType.toLowerCase().includes(query)) ||
        (s.id && s.id.toString().includes(query))
      );
    }
    return Math.max(1, Math.ceil(filtered.length / this.itemsPerPage()));
  });

  pageNumbers = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  // Computed data for seat map (grouped by line)
  groupedMapSeats = computed(() => {
    const seats = this.roomSeats();
    const groups: { [line: string]: SeatResponse[] } = {};

    seats.forEach(seat => {
      const line = seat.line || '?';
      if (!groups[line]) groups[line] = [];
      groups[line].push(seat);
    });

    // Sort lines alphabetically
    const lines = Object.keys(groups).sort();
    return lines.map(line => {
      // Sort numbers numerically
      const sortedSeats = groups[line].sort((a, b) => a.number - b.number);
      return { line, seats: sortedSeats };
    });
  });

  // --- Modal actions ---

  openGenerateModal() {
    this.generateData.set({
      roomName: this.selectedRoomCode(),
      roomCode: this.selectedRoomCode()
    });
    this.showGenerateModal.set(true);
  }

  submitGenerate() {
    this.seatService.generateSeats(this.generateData()).subscribe(() => {
      this.showGenerateModal.set(false);
      this.refreshSeats();
    });
  }

  openEditModal(seat: SeatResponse) {
    this.editData.set({
      id: seat.id,
      line: seat.line,
      number: seat.number,
      roomName: seat.room,
      roomCode: seat.room,
      status: seat.status,
      seatType: seat.seatType,
      priceTicket: seat.priceTicket || 0,
      notes: seat.notes || ''
    });
    this.showEditModal.set(true);
    this.isStatusDropdownOpen.set(false);
  }

  submitEdit() {
    this.seatService.updateSeat(this.editData()).subscribe(() => {
      this.showEditModal.set(false);
      this.refreshSeats();
    });
  }

  openDeleteModal(id: number) {
    this.deleteId.set(id);
    this.showDeleteModal.set(true);
  }

  submitDelete() {
    this.seatService.deleteSeat(this.deleteId()).subscribe(() => {
      this.showDeleteModal.set(false);
      this.refreshSeats();
    });
  }

  openRefreshModal() {
    this.showRefreshModal.set(true);
  }

  submitRefresh() {
    const roomCode = this.selectedRoomCode();
    if (!roomCode) return;

    this.isRefreshing.set(true);
    this.seatService.refreshSeatStatus(roomCode).subscribe({
      next: () => {
        this.isRefreshing.set(false);
        this.showRefreshModal.set(false);
        this.refreshSeats();
      },
      error: () => {
        this.isRefreshing.set(false);
      }
    });
  }

  toggleSelectionMode() {
    this.isSelectionMode.update(v => !v);
    if (!this.isSelectionMode()) {
      this.selectedSeatIds.set([]);
    }
  }

  onSeatClick(seat: SeatResponse) {
    if (this.isSelectionMode()) {
      const ids = this.selectedSeatIds();
      if (ids.includes(seat.id)) {
        this.selectedSeatIds.set(ids.filter(id => id !== seat.id));
      } else {
        this.selectedSeatIds.set([...ids, seat.id]);
      }
    } else {
      this.openEditModal(seat);
    }
  }

  submitRefreshSelected() {
    const roomCode = this.selectedRoomCode();
    const seatIds = this.selectedSeatIds();
    if (!roomCode || seatIds.length === 0) return;

    this.isRefreshing.set(true);
    this.seatService.refreshSelectedSeats({ roomCode, seatIds }).subscribe({
      next: () => {
        this.isRefreshing.set(false);
        this.selectedSeatIds.set([]);
        this.isSelectionMode.set(false);
        this.refreshSeats();
        alert('Làm mới các ghế đã chọn thành công!');
      },
      error: (err) => {
        this.isRefreshing.set(false);
        alert('Lỗi khi làm mới ghế: ' + (err.error?.message || 'Không rõ lỗi'));
      }
    });
  }

  // --- Pagination actions ---
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  // --- UI Helpers ---
  getBadgeClass(status: string): string {
    if (status === 'Available' || status === 'Ghế trống') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (status === 'Held' || status === 'Reserved' || status === 'Đang giữ') return 'bg-amber-100 text-amber-800 border-amber-200';
    if (status === 'Occupied' || status === 'Đã đặt') return 'bg-rose-100 text-rose-800 border-rose-200';
    if (status === 'Maintenance' || status === 'Bảo trì') return 'bg-gray-100 text-gray-800 border-gray-200';
    if (status === 'Disabled' || status === 'Khóa') return 'bg-slate-800 text-white border-slate-900';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  }

  getTypeTranslation(type: string | undefined): string {
    if (!type) return this.t('management.seatStandard') || 'Standard';
    const typeUpper = type.toUpperCase();
    if (typeUpper === 'STANDARD') return this.t('management.seatStandard') || 'Standard';
    if (typeUpper === 'VIP') return this.t('management.seatVip') || 'VIP';
    if (typeUpper === 'SWEET BOX' || typeUpper === 'COUPLE') return this.t('management.seatSweetBox') || 'Couple';
    if (typeUpper === 'ACCESSIBLE') return 'Accessible';
    return type;
  }

  isStatus(status: string | undefined, expectedStatuses: string[]): boolean {
    if (!status) return false;
    const sUpper = status.toUpperCase();
    return expectedStatuses.some(s => s.toUpperCase() === sUpper);
  }

  isType(type: string | undefined, expectedTypes: string[]): boolean {
    const tUpper = type ? type.toUpperCase() : 'STANDARD'; // Default to standard if empty
    // Also if expectedTypes contains empty string, it matches empty type
    if (!type && expectedTypes.includes('')) return true;
    return expectedTypes.some(t => t.toUpperCase() === tUpper);
  }
}
