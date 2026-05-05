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
      nameOfFood: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      price: [null, [Validators.required, Validators.min(1000)]],
      description: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(50)]],
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
    this.showFormModal.set(true);
  }

  submitForm() {
    if (this.foodForm.invalid || (!this.isEditMode() && !this.selectedFile)) {
      this.foodForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    const rawValue = this.foodForm.getRawValue();
    
    formData.append('nameOfFood', rawValue.nameOfFood);
    formData.append('price', rawValue.price.toString());
    formData.append('description', rawValue.description);
    
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }
    
    if (this.isEditMode()) {
      formData.append('id', rawValue.id.toString());
      this.foodService.updateFood(formData).subscribe({
        next: () => {
          this.showFormModal.set(false);
          this.loadFoods();
        }
      });
    } else {
      this.foodService.saveFood(formData).subscribe({
        next: () => {
          this.showFormModal.set(false);
          this.loadFoods();
        }
      });
    }
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
