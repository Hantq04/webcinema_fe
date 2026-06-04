import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { LanguageService } from '../../../core/services/language.service';
import { EventService } from '../../../core/services/event.service';
import { Event } from '../../../core/models/event.model';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-management-event',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './management-event.component.html',
  styleUrls: ['./management-event.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManagementEventComponent implements OnInit {
  protected readonly language = inject(LanguageService);
  protected readonly eventService = inject(EventService);
  protected readonly fb = inject(FormBuilder);
  protected readonly apiService = inject(ApiService);
  protected readonly t = this.language.t.bind(this.language);

  events = signal<Event[]>([]);
  isLoading = signal(false);
  searchQuery = signal('');

  // Modal state
  showFormModal = signal(false);
  showDeleteModal = signal(false);

  eventForm: FormGroup;
  selectedFile = signal<File | null>(null);
  imagePreview = signal<string | null>(null);
  eventToDelete = signal<Event | null>(null);
  fieldErrors = signal<Record<string, string>>({});

  filteredEvents = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.events();
    return this.events().filter(e =>
      e.name.toLowerCase().includes(q)
    );
  });

  constructor() {
    this.eventForm = this.fb.group({
      name: [''],
      image: [null]
    });
  }

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents() {
    this.isLoading.set(true);
    this.eventService.getEvents().subscribe({
      next: (data) => {
        this.events.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile.set(file);
      const reader = new FileReader();
      reader.onload = (e: any) => this.imagePreview.set(e.target.result);
      reader.readAsDataURL(file);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) {
      this.selectedFile.set(file);
      const reader = new FileReader();
      reader.onload = (e: any) => this.imagePreview.set(e.target.result);
      reader.readAsDataURL(file);
    }
  }

  openAddModal() {
    this.eventForm.reset();
    this.selectedFile.set(null);
    this.imagePreview.set(null);
    this.fieldErrors.set({});
    this.showFormModal.set(true);
  }

  submitForm() {
    const formData = new FormData();
    formData.append('name', this.eventForm.get('name')?.value || '');
    const file = this.selectedFile();
    if (file) {
      formData.append('image', file);
    }

    this.eventService.saveEvent(formData).subscribe({
      next: () => {
        this.showFormModal.set(false);
        this.fieldErrors.set({});
        this.loadEvents();
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

  openDeleteModal(event: Event) {
    this.eventToDelete.set(event);
    this.showDeleteModal.set(true);
  }

  confirmDelete() {
    const event = this.eventToDelete();
    if (event) {
      this.eventService.deleteEvent(event.name).subscribe({
        next: () => {
          this.showDeleteModal.set(false);
          this.loadEvents();
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
