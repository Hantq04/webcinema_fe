import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { LanguageService } from '../../../core/services/language.service';
import { ManagementBillService } from '../../../core/services/management-bill.service';
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

  t(key: string) { return this.language.t(key); }
  isEn() { return this.language.isActive('en'); }

  // State
  bills = signal<BillResponse[]>([]);
  statuses = signal<any[]>([]);
  
  // Filters
  searchQuery = signal<string>('');
  filterStatus = signal<string>('');
  isStatusDropdownOpen = signal(false);

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
    return result;
  });

  totalElements = computed(() => this.filteredBills().length);

  ngOnInit(): void {
    this.initForm();
    this.loadStatuses();
    this.loadMockBills(); // Load mock data since GET list endpoint is missing
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
        foods: []
      },
      {
        tradingCode: 'BILL-1002',
        customerName: 'Trần Thị B',
        name: 'Trần Thị B',
        createTime: new Date(Date.now() - 3600000).toISOString(),
        totalMoney: 300000,
        status: { code: 'HOLD', name: 'Đang giữ chỗ', descriptionEn: 'Hold', descriptionVi: 'Đang giữ chỗ' },
        tickets: [{ id: 2, code: 'T2', price: 150000 }, { id: 3, code: 'T3', price: 150000 }],
        foods: []
      },
      {
        tradingCode: 'BILL-1003',
        customerName: 'Lê Văn C',
        name: 'Lê Văn C',
        createTime: new Date(Date.now() - 86400000).toISOString(),
        totalMoney: 0,
        status: { code: 'CANCELLED', name: 'Đã hủy', descriptionEn: 'Cancelled', descriptionVi: 'Đã hủy' },
        tickets: [],
        foods: []
      }
    ];
    this.bills.set(mockData);
  }

  selectBill(code: string) {
    this.selectedBillCode.set(code);
    const detail = this.bills().find(b => b.tradingCode === code) || null;
    this.selectedBillDetail.set(detail);
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
