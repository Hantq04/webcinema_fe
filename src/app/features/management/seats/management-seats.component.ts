import { ChangeDetectionStrategy, Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../../core/services/language.service';
import { SeatByScheduleDTO, SeatResponse, SeatService } from '../../../core/services/seat.service';

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
  protected readonly platformId = inject(PLATFORM_ID);
  protected readonly t = this.language.t.bind(this.language);

  // State
  allSeats = signal<SeatResponse[]>([]);
  mapSeats = signal<SeatByScheduleDTO[]>([]);
  scheduleCodeInput = signal<string>('');
  searchQuery = signal<string>('');
  
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
  editData = signal({ id: 0, line: '', number: 1, roomName: '', roomCode: '' });
  deleteId = signal<number>(0);
  refreshTradingCode = signal('');

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadAllSeats();
    }
  }

  loadAllSeats() {
    this.seatService.getAllSeats().subscribe(seats => {
      this.allSeats.set(seats);
      this.currentPage.set(1);
    });
  }

  loadSeatMap() {
    if (!this.scheduleCodeInput().trim()) return;
    this.seatService.getSeatsBySchedule(this.scheduleCodeInput()).subscribe(seats => {
      this.mapSeats.set(seats);
    });
  }

  // Computed data for table
  filteredAndPaginatedSeats = computed(() => {
    let filtered = this.allSeats();
    const query = this.searchQuery().toLowerCase().trim();
    
    if (query) {
      filtered = filtered.filter(s => 
        (s.line && s.line.toLowerCase().includes(query)) ||
        (s.number && s.number.toString().includes(query)) ||
        (s.room && s.room.toLowerCase().includes(query)) ||
        (s.seatType && s.seatType.toLowerCase().includes(query))
      );
    }
    
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    return filtered.slice(start, start + this.itemsPerPage());
  });

  totalPages = computed(() => {
    let filtered = this.allSeats();
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      filtered = filtered.filter(s => 
        (s.line && s.line.toLowerCase().includes(query)) ||
        (s.number && s.number.toString().includes(query)) ||
        (s.room && s.room.toLowerCase().includes(query)) ||
        (s.seatType && s.seatType.toLowerCase().includes(query))
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
    const seats = this.mapSeats();
    const groups: { [line: string]: SeatByScheduleDTO[] } = {};
    
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

  // Modal actions
  openGenerateModal() {
    this.generateData.set({ roomName: '', roomCode: '' });
    this.showGenerateModal.set(true);
  }

  submitGenerate() {
    this.seatService.generateSeats(this.generateData()).subscribe(() => {
      this.showGenerateModal.set(false);
      this.loadAllSeats();
    });
  }

  openEditModal(seat: SeatResponse) {
    this.editData.set({
      id: seat.id,
      line: seat.line,
      number: seat.number,
      roomName: seat.room,
      roomCode: seat.room // assuming room string is roomName or roomCode. API expects both.
    });
    this.showEditModal.set(true);
  }

  submitEdit() {
    this.seatService.updateSeat(this.editData()).subscribe(() => {
      this.showEditModal.set(false);
      this.loadAllSeats();
    });
  }

  openDeleteModal(id: number) {
    this.deleteId.set(id);
    this.showDeleteModal.set(true);
  }

  submitDelete() {
    this.seatService.deleteSeat(this.deleteId()).subscribe(() => {
      this.showDeleteModal.set(false);
      this.loadAllSeats();
    });
  }

  openRefreshModal() {
    this.refreshTradingCode.set('');
    this.showRefreshModal.set(true);
  }

  submitRefresh() {
    this.seatService.refreshSeatStatus(this.refreshTradingCode()).subscribe(() => {
      this.showRefreshModal.set(false);
      this.loadAllSeats();
      if (this.scheduleCodeInput().trim()) {
        this.loadSeatMap();
      }
    });
  }

  // Pagination actions
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  getBadgeClass(status: string): string {
    if (status === 'Available') return 'badge-success';
    if (status === 'Held') return 'badge-warning';
    return 'badge-danger'; // Occupied
  }

  getTypeTranslation(type: string): string {
    if (type === 'Standard') return this.t('management.seatStandard');
    if (type === 'VIP') return this.t('management.seatVip');
    if (type === 'Sweet Box') return this.t('management.seatSweetBox');
    return type;
  }
}
