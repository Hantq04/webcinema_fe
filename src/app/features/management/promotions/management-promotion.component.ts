import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { LanguageService } from '../../../core/services/language.service';
import { PromotionService } from '../../../core/services/promotion.service';
import { PromotionResponse, PromotionRequest } from '../../../core/models/promotion.model';

@Component({
  selector: 'app-management-promotion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './management-promotion.component.html',
  styleUrls: ['./management-promotion.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManagementPromotionComponent implements OnInit {
  protected readonly language = inject(LanguageService);
  protected readonly promotionService = inject(PromotionService);
  protected readonly fb = inject(FormBuilder);
  protected readonly t = this.language.t.bind(this.language);

  promotions = signal<PromotionResponse[]>([]);
  isLoading = signal(false);
  searchQuery = signal('');

  // Modal state
  showFormModal = signal(false);
  showDeleteModal = signal(false);
  
  promotionForm: FormGroup;
  promotionToDelete = signal<PromotionResponse | null>(null);
  fieldErrors = signal<Record<string, string>>({});

  isTypeDropdownOpen = signal(false);
  isRankDropdownOpen = signal(false);

  filteredPromotions = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.promotions();
    return this.promotions().filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.code.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  });

  constructor() {
    this.promotionForm = this.fb.group({
      name: [''],
      percent: [null],
      quantity: [null],
      promotionType: [''],
      startTime: [''],
      endTime: [''],
      description: [''],
      nameRankCustomer: ['']
    });
  }

  ngOnInit(): void {
    this.loadPromotions();
  }

  loadPromotions() {
    this.isLoading.set(true);
    this.promotionService.getAllPromotions().subscribe({
      next: (data) => {
        this.promotions.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  openAddModal() {
    this.promotionForm.reset();
    this.fieldErrors.set({});
    this.showFormModal.set(true);
  }

  submitForm() {
    const val = this.promotionForm.value;
    
    // Format dates: YYYY-MM-DDTHH:mm -> YYYY-MM-DD HH:mm:ss
    const formatDate = (dateStr: string) => {
      if (!dateStr) return '';
      let formatted = dateStr.replace('T', ' ');
      if (formatted.length === 16) formatted += ':00';
      return formatted;
    };

    const payload: PromotionRequest = {
      name: val.name,
      percent: val.percent,
      quantity: val.quantity,
      promotionType: val.promotionType,
      startTime: formatDate(val.startTime),
      endTime: formatDate(val.endTime),
      description: val.description,
      nameRankCustomer: val.nameRankCustomer
    };

    this.promotionService.savePromotion(payload).subscribe({
      next: () => {
        this.showFormModal.set(false);
        this.fieldErrors.set({});
        this.loadPromotions();
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

  openDeleteModal(promotion: PromotionResponse) {
    this.promotionToDelete.set(promotion);
    this.showDeleteModal.set(true);
  }

  confirmDelete() {
    const promotion = this.promotionToDelete();
    if (promotion) {
      this.promotionService.deletePromotion(promotion.name).subscribe({
        next: () => {
          this.showDeleteModal.set(false);
          this.loadPromotions();
        }
      });
    }
  }
}
