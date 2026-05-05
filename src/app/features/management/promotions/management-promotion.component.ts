import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { LanguageService } from '../../../core/services/language.service';
import { PromotionService } from '../../../core/services/promotion.service';
import { PromotionResponse } from '../../../core/models/promotion.model';

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
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      percent: [null, [Validators.required]],
      quantity: [null, [Validators.required]],
      promotionType: ['', [Validators.required]],
      startTime: ['', [Validators.required]],
      endTime: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(50)]],
      nameRankCustomer: ['', [Validators.required]]
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
    this.showFormModal.set(true);
  }

  submitForm() {
    if (this.promotionForm.invalid) {
      this.promotionForm.markAllAsTouched();
      return;
    }

    const payload = this.promotionForm.value;
    this.promotionService.savePromotion(payload).subscribe({
      next: () => {
        this.showFormModal.set(false);
        this.loadPromotions();
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
