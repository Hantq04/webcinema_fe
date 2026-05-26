import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { LanguageService } from '../../../core/services/language.service';
import { ManagementBillService } from '../../../core/services/management-bill.service';
import { CinemaService, CinemaDTO } from '../../../core/services/cinema.service';
import { BillResponse, BillHoldResponse } from '../../../core/models/bill.model';

@Component({
  selector: 'app-management-bills',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './management-bills.component.html',
  styleUrls: ['./management-bills.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManagementBillsComponent implements OnInit {
  protected readonly language = inject(LanguageService);
  private fb = inject(FormBuilder);
  private billService = inject(ManagementBillService);
  private cinemaService = inject(CinemaService);

  t(key: string) { return this.language.t(key); }
  isEn() { return this.language.isActive('en'); }

  // State
  bills = signal<BillResponse[]>([]);
  statuses = signal<any[]>([]);
  allCinemas = signal<CinemaDTO[]>([]);
  
  // Filters
  searchQuery = signal<string>('');
  filterStatus = signal<string>('');
  isStatusDropdownOpen = signal(false);
  addresses = signal<string[]>([]);
  filterAddress = signal<string>('');
  filterCinemaName = signal<string>('');
  filterCinemas = signal<string[]>([]);
  isFilterAddressOpen = signal(false);
  isFilterCinemaOpen = signal(false);

  // Pagination & Loading State
  currentPage = signal(0);
  pageSize = signal(100);
  totalPages = signal(0);
  totalElements = signal(0);
  isLoadingList = signal(false);
  isLoadingDetail = signal(false);
  listError = signal<string | null>(null);
  detailError = signal<string | null>(null);

  // Modals & Selection
  selectedBillCode = signal<string | null>(null);
  selectedBillDetail = signal<BillResponse | null>(null);
  
  showFormModal = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  
  showCancelModal = signal<boolean>(false);
  showDeleteModal = signal<boolean>(false);
  actionTargetCode = signal<string | null>(null);

  // Form
  billForm!: FormGroup;
  fieldErrors = signal<Record<string, string>>({});
  holdInfo = signal<BillHoldResponse | null>(null);
  
  // Computed
  filteredBills = computed(() => {
    let result = this.bills();
    const query = this.searchQuery().toLowerCase();
    if (query) {
      result = result.filter(b => 
        (b.tradingCode && b.tradingCode.toLowerCase().includes(query)) ||
        (b.customerName && b.customerName.toLowerCase().includes(query))
      );
    }
    const status = this.filterStatus();
    if (status) {
      result = result.filter(b => b.status && b.status.code === status);
    }

    // Note: Area (Address) is primarily used for loading Cinemas from backend, 
    // but we can also filter locally as a fallback.
    const addr = this.filterAddress();
    if (addr) {
      result = result.filter(b => !b.address || b.address === addr);
    }

    return result;
  });

  ngOnInit(): void {
    this.initForm();
    this.loadStatuses();
    this.loadDropdownData();
    this.loadBills();
  }

  private initForm() {
    this.billForm = this.fb.group({
      customerName: [''],
      tickets: [''], 
      foods: [''],
      promotionCode: ['']
    });
  }

  private loadStatuses() {
    this.billService.getAllStatus().subscribe({
      next: (data) => {
        const mapped = data.map(s => {
          const name = s.name.toLowerCase();
          let code = s.name.toUpperCase();
          
          // Map to codes used in template
          if (name === 'success') code = 'PAID';
          if (name === 'pending') code = 'HOLD';
          if (name === 'fail') code = 'FAILURE';
          if (name === 'cancel') code = 'CANCELLED';
          
          return {
            ...s,
            code: code,
            descriptionVi: this.getStatusName(code),
            descriptionEn: code.charAt(0) + code.slice(1).toLowerCase()
          };
        });
        this.statuses.set(mapped);
      },
      error: (err) => console.error('Error loading statuses', err)
    });
  }

  private loadMockBills() {
    // Generate some mock data for UI
    const mockData: BillResponse[] = [
      {
        tradingCode: 'BILL-1001',
        customerName: 'Nguyễn Văn A',
        name: 'Nguyễn Văn A',
        createTime: new Date().toISOString(),
        totalMoney: 150000,
        status: { code: 'PAID', name: 'Đã thanh toán', descriptionEn: 'Paid', descriptionVi: 'Đã thanh toán' },
        tickets: [{ id: 1, code: 'T1', price: 150000 }],
        foods: [],
        address: 'Hà Nội',
        cinemaName: 'CineGo Ocean Park'
      },
      {
        tradingCode: 'BILL-1002',
        customerName: 'Trần Thị B',
        name: 'Trần Thị B',
        createTime: new Date(Date.now() - 3600000).toISOString(),
        totalMoney: 300000,
        status: { code: 'HOLD', name: 'Đang giữ chỗ', descriptionEn: 'Hold', descriptionVi: 'Đang giữ chỗ' },
        tickets: [{ id: 2, code: 'T2', price: 150000 }, { id: 3, code: 'T3', price: 150000 }],
        foods: [],
        address: 'Hà Nội',
        cinemaName: 'CineGo Ba Đình'
      },
      {
        tradingCode: 'BILL-1003',
        customerName: 'Lê Văn C',
        name: 'Lê Văn C',
        createTime: new Date(Date.now() - 86400000).toISOString(),
        totalMoney: 0,
        status: { code: 'CANCELLED', name: 'Đã hủy', descriptionEn: 'Cancelled', descriptionVi: 'Đã hủy' },
        tickets: [],
        foods: [],
        address: 'Hồ Chí Minh',
        cinemaName: 'CineGo Hùng Vương'
      }
    ];
    this.bills.set(mockData);
  }

  private loadDropdownData() {
    this.cinemaService.getAllAddresses().subscribe({
      next: (a) => this.addresses.set(a),
      error: (err) => console.error('Error loading addresses', err)
    });
    this.cinemaService.getAllCinemas().subscribe({
      next: (c) => this.allCinemas.set(c),
      error: (err) => console.error('Error loading cinemas', err)
    });
  }

  private mapBillResponse(b: any): BillResponse {
    if (!b) return b;
    const statusStr = (b.billStatus || b.status?.code || b.status || '').toLowerCase();
    let mappedStatus = {
      code: 'HOLD',
      name: 'Đang giữ chỗ',
      descriptionVi: 'Đang giữ chỗ',
      descriptionEn: 'Hold'
    };

    if (statusStr === 'success' || statusStr === 'paid') {
      mappedStatus = {
        code: 'PAID',
        name: 'Đã thanh toán',
        descriptionVi: 'Đã thanh toán',
        descriptionEn: 'Paid'
      };
    } else if (statusStr === 'cancel' || statusStr === 'cancelled') {
      mappedStatus = {
        code: 'CANCELLED',
        name: 'Đã hủy',
        descriptionVi: 'Đã hủy',
        descriptionEn: 'Cancelled'
      };
    } else if (statusStr === 'fail' || statusStr === 'failure') {
      mappedStatus = {
        code: 'FAILURE',
        name: 'Thất bại',
        descriptionVi: 'Thất bại',
        descriptionEn: 'Failure'
      };
    } else if (statusStr === 'pending' || statusStr === 'hold') {
      mappedStatus = {
        code: 'HOLD',
        name: 'Đang giữ chỗ',
        descriptionVi: 'Đang giữ chỗ',
        descriptionEn: 'Hold'
      };
    }

    return {
      tradingCode: b.tradingCode || b.id?.toString(),
      customerName: b.customerName || b.name || '',
      createTime: b.createTime,
      updateTime: b.updateTime,
      paidAt: b.paidAt,
      totalMoney: b.totalMoney || 0,
      name: b.name || b.customerName || '',
      status: mappedStatus,
      tickets: b.tickets && b.tickets.length > 0 ? b.tickets : (b.items ? b.items.map((it: any) => ({ code: it.seatCode, price: it.unitPrice, cinemaName: it.cinemaName, roomCode: it.roomCode, showTime: it.showTime })) : []),
      foods: b.foods || [],
      promotionCode: b.promotionCode,
      cinemaName: b.cinemaName,
      address: b.address,
      items: b.items || []
    } as any;
  }

  loadBills() {
    this.isLoadingList.set(true);
    this.listError.set(null);

    const cinemaName = this.filterCinemaName() || undefined;

    this.billService.getBills({
      cinemaName,
      page: this.currentPage(),
      size: this.pageSize()
    }).subscribe({
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

        const mappedList = dataList.map((b: any) => this.mapBillResponse(b));

        this.totalElements.set(total);
        this.totalPages.set(totalP);
        this.bills.set(mappedList);
        this.isLoadingList.set(false);

        // Auto select first invoice if data exists
        if (mappedList.length > 0) {
          this.selectBill(mappedList[0].tradingCode);
        } else {
          this.selectedBillCode.set(null);
          this.selectedBillDetail.set(null);
        }
      },
      error: (err) => {
        console.error('Error loading bills from API, using fallback mock data:', err);
        this.listError.set('Không thể tải danh sách hóa đơn từ máy chủ.');
        this.isLoadingList.set(false);
        this.loadMockBills();
        
        // Auto select first mock bill if exists
        const dataList = this.bills();
        if (dataList.length > 0) {
          this.selectBill(dataList[0].tradingCode);
        }
      }
    });
  }

  loadBillDetail(code: string) {
    this.isLoadingDetail.set(true);
    this.detailError.set(null);
    this.billService.getBillDetail(code).subscribe({
      next: (res: any) => {
        const detail = res?.data || res;
        const mappedDetail = this.mapBillResponse(detail);
        this.selectedBillDetail.set(mappedDetail);
        this.isLoadingDetail.set(false);
      },
      error: (err) => {
        console.error('Error loading bill detail from API:', err);
        this.detailError.set('Không thể tải chi tiết hóa đơn từ máy chủ.');
        this.isLoadingDetail.set(false);
        
        // Fallback to local search in bills list
        const localDetail = this.bills().find(b => b.tradingCode === code) || null;
        this.selectedBillDetail.set(localDetail);
      }
    });
  }

  onAddressFilterChange(address: string) {
    this.filterAddress.set(address);
    this.filterCinemaName.set(''); // Reset cinema filter when address changes
    this.currentPage.set(0); // Reset page
    if (address) {
      this.cinemaService.getCinemasByAddress(address).subscribe({
        next: (cList) => {
          this.filterCinemas.set(cList);
          this.loadBills();
        },
        error: (err) => console.error('Error loading cinemas', err)
      });
    } else {
      this.filterCinemas.set([]);
      this.loadBills();
    }
  }

  onCinemaFilterChange(cinema: string) {
    this.filterCinemaName.set(cinema);
    this.currentPage.set(0); // Reset page
    this.loadBills();
  }

  selectBill(code: string) {
    this.selectedBillCode.set(code);
    this.loadBillDetail(code);
  }

  nextPage() {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.update(p => p + 1);
      this.loadBills();
    }
  }

  prevPage() {
    if (this.currentPage() > 0) {
      this.currentPage.update(p => p - 1);
      this.loadBills();
    }
  }

  // --- Form Actions ---
  
  openAddModal() {
    this.isEditMode.set(false);
    this.fieldErrors.set({});
    this.holdInfo.set(null);
    this.billForm.reset();
    this.showFormModal.set(true);
  }

  openEditModal() {
    const detail = this.selectedBillDetail();
    if (!detail) return;
    
    this.isEditMode.set(true);
    this.fieldErrors.set({});
    this.holdInfo.set(null);
    
    this.billForm.patchValue({
      customerName: detail.customerName,
      tickets: detail.tickets.map(t => t.code || t.id).join(', '),
      foods: detail.foods.map(f => f.code || f.id).join(', '),
      promotionCode: detail.promotionCode || ''
    });
    
    this.showFormModal.set(true);
  }

  closeFormModal() {
    this.showFormModal.set(false);
  }

  submitForm() {
    const val = this.billForm.value;
    const payload = {
      customerName: val.customerName,
      tickets: val.tickets.split(',').map((s: string) => s.trim()).filter((s: string) => s),
      foods: val.foods ? val.foods.split(',').map((s: string) => s.trim()).filter((s: string) => s) : [],
      promotionCode: val.promotionCode || undefined
    };

    if (this.isEditMode()) {
      // API Update
      const code = this.selectedBillDetail()?.tradingCode;
      if (code) {
        this.billService.updateBill({ ...payload, tradingCode: code }).subscribe({
          next: () => {
            alert(this.t('management.invoiceUpdatedSuccessMock'));
            this.fieldErrors.set({});
            this.closeFormModal();
          },
          error: (err) => {
            const apiError = err.error;
            if (apiError && apiError.errors && Array.isArray(apiError.errors)) {
              const newErrors: Record<string, string> = {};
              apiError.errors.forEach((e: any) => {
                if (e.field) newErrors[e.field] = e.message;
              });
              this.fieldErrors.set(newErrors);
            } else {
              this.fieldErrors.set({ _general: apiError?.message || 'Có lỗi xảy ra' });
            }
          }
        });
      }
    } else {
      // API Create
      this.billService.createBill(payload).subscribe({
        next: (res: BillHoldResponse) => {
          this.fieldErrors.set({});
          this.holdInfo.set(res);
          // Auto add to mock list for UX
          const newBill: BillResponse = {
            tradingCode: res.tradingCode,
            customerName: payload.customerName,
            name: payload.customerName,
            createTime: res.createTime,
            totalMoney: 0, // Mock
            status: { code: 'HOLD', descriptionVi: 'Đang giữ chỗ', descriptionEn: 'Hold' },
            tickets: payload.tickets.map((t: string) => ({code: t})),
            foods: payload.foods.map((f: string) => ({code: f}))
          };
          this.bills.update(b => [newBill, ...b]);
          alert(this.t('management.invoiceCreatedSuccess') + res.tradingCode);
          this.closeFormModal();
        },
        error: (err) => {
          const apiError = err.error;
          if (apiError && apiError.errors && Array.isArray(apiError.errors)) {
            const newErrors: Record<string, string> = {};
            apiError.errors.forEach((e: any) => {
              if (e.field) newErrors[e.field] = e.message;
            });
            this.fieldErrors.set(newErrors);
          } else {
            this.fieldErrors.set({ _general: apiError?.message || 'Có lỗi xảy ra' });
          }
        }
      });
    }
  }

  // --- Actions ---

  openCancelModal() {
    const detail = this.selectedBillDetail();
    if (detail) {
      this.actionTargetCode.set(detail.tradingCode);
      this.showCancelModal.set(true);
    }
  }

  closeCancelModal() {
    this.showCancelModal.set(false);
    this.actionTargetCode.set(null);
  }

  executeCancel() {
    const code = this.actionTargetCode();
    if (code) {
      this.billService.cancelBill(code).subscribe({
        next: () => {
          alert(this.t('management.invoiceCancelledSuccess'));
          this.closeCancelModal();
          // Update mock data
          this.bills.update(list => list.map(b => b.tradingCode === code ? { ...b, status: {code: 'CANCELLED', descriptionVi: 'Đã hủy', descriptionEn: 'Cancelled'} } : b));
          if (this.selectedBillDetail()?.tradingCode === code) {
            this.selectBill(code);
          }
        },
        error: (err) => {
          console.error(err);
          alert(this.t('management.errorPrefix') + (err.error?.message || this.t('management.cannotCancel')));
        }
      });
    }
  }

  openDeleteModal() {
    const detail = this.selectedBillDetail();
    if (detail) {
      this.actionTargetCode.set(detail.tradingCode);
      this.showDeleteModal.set(true);
    }
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.actionTargetCode.set(null);
  }

  executeDelete() {
    const code = this.actionTargetCode();
    if (code) {
      this.billService.deleteBill(code).subscribe({
        next: () => {
          alert(this.t('management.invoiceDeletedSuccess'));
          this.closeDeleteModal();
          // Update mock data
          this.bills.update(list => list.filter(b => b.tradingCode !== code));
          this.selectedBillCode.set(null);
          this.selectedBillDetail.set(null);
        },
        error: (err) => {
          console.error(err);
          alert(this.t('management.errorPrefix') + (err.error?.message || this.t('management.cannotDelete')));
        }
      });
    }
  }

  processPayment() {
    const code = this.selectedBillDetail()?.tradingCode;
    if (code) {
      this.billService.submitPayment(code).subscribe({
        next: (url: string) => {
          if (url && url.startsWith('http')) {
            window.location.href = url;
          } else {
            alert(this.t('management.paymentSuccessPrefix') + url);
          }
        },
        error: (err) => {
          console.error(err);
          alert(this.t('management.errorCreatingVNPayUrl'));
        }
      });
    }
  }

  getStatusName(code: string): string {
    if (!code) return '';
    
    const s = this.statuses().find(x => x.code === code);
    if (s && (this.isEn() ? s.descriptionEn : s.descriptionVi)) {
      return this.isEn() ? s.descriptionEn : s.descriptionVi;
    }
    
    const mapping: any = {
      'SUCCESS': 'Thành công',
      'PAID': 'Đã thanh toán',
      'PENDING': 'Đang chờ',
      'HOLD': 'Đang giữ chỗ',
      'FAILURE': 'Thất bại',
      'FAIL': 'Thất bại',
      'EXPIRED': 'Hết hạn',
      'CANCEL': 'Đã hủy',
      'CANCELLED': 'Đã hủy'
    };
    
    // Check translation service too
    const tKey = `management.status${code.charAt(0).toUpperCase() + code.slice(1).toLowerCase()}`;
    const translated = this.t(tKey);
    if (translated !== tKey) return translated;

    return mapping[code.toUpperCase()] || code;
  }
}
