import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { LanguageService } from '../../../core/services/language.service';
import { FoodService } from '../../../core/services/food.service';
import { FoodDTO } from '../../../core/models/food.model';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-management-food-beverages',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './management-food-beverages.component.html',
  styleUrls: ['./management-food-beverages.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManagementFoodBeveragesComponent implements OnInit {
  protected readonly language = inject(LanguageService);
  protected readonly foodService = inject(FoodService);
  protected readonly fb = inject(FormBuilder);
  protected readonly apiService = inject(ApiService);
  protected readonly t = this.language.t.bind(this.language);

  foods = signal<FoodDTO[]>([]);
  isLoading = signal(false);
  searchQuery = signal('');

  // Modal state
  showFormModal = signal(false);
  showDeleteModal = signal(false);
  isEditMode = signal(false);
  
  foodForm: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  foodToDelete = signal<FoodDTO | null>(null);
  fieldErrors = signal<Record<string, string>>({});

  filteredFoods = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.foods();
    return this.foods().filter(f => 
      f.nameOfFood.toLowerCase().includes(q) || 
      f.description.toLowerCase().includes(q)
    );
  });

  constructor() {
    this.foodForm = this.fb.group({
      id: [null],
      nameOfFood: [''],
      price: [null],
      description: [''],
      image: [null]
    });
  }

  ngOnInit(): void {
    this.loadFoods();
  }

  loadFoods() {
    this.isLoading.set(true);
    this.foodService.getAllFood().subscribe({
      next: (data) => {
        this.foods.set(data);
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
    this.isEditMode.set(false);
    this.foodForm.reset();
    this.selectedFile = null;
    this.imagePreview = null;
    this.fieldErrors.set({});
    this.showFormModal.set(true);
  }

  openEditModal(food: FoodDTO) {
    this.isEditMode.set(true);
    this.foodForm.patchValue({
      id: food.id,
      nameOfFood: food.nameOfFood,
      price: food.price,
      description: food.description
    });
    this.selectedFile = null;
    this.imagePreview = this.resolveImageUrl(food.image);
    this.fieldErrors.set({});
    this.showFormModal.set(true);
  }

  submitForm() {
    const formData = new FormData();
    const rawValue = this.foodForm.getRawValue();
    
    formData.append('nameOfFood', rawValue.nameOfFood);
    formData.append('price', (rawValue.price || 0).toString());
    formData.append('description', rawValue.description || '');
    
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }
    
    const obs = this.isEditMode() 
      ? this.foodService.updateFood(formData) 
      : this.foodService.saveFood(formData);

    obs.subscribe({
      next: () => {
        this.showFormModal.set(false);
        this.fieldErrors.set({});
        this.loadFoods();
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

  openDeleteModal(food: FoodDTO) {
    this.foodToDelete.set(food);
    this.showDeleteModal.set(true);
  }

  confirmDelete() {
    const food = this.foodToDelete();
    if (food) {
      this.foodService.deleteFood(food.nameOfFood).subscribe({
        next: () => {
          this.showDeleteModal.set(false);
          this.loadFoods();
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
