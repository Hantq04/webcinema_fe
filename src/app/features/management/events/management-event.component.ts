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
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  eventToDelete = signal<Event | null>(null);

  filteredEvents = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.events();
    return this.events().filter(e => 
      e.name.toLowerCase().includes(q)
    );
  });

  constructor() {
    this.eventForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
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
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => this.imagePreview = e.target.result;
      reader.readAsDataURL(file);
    }
  }

  openAddModal() {
    this.eventForm.reset();
    this.selectedFile = null;
    this.imagePreview = null;
    this.showFormModal.set(true);
  }

  submitForm() {
    if (this.eventForm.invalid || !this.selectedFile) {
      this.eventForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    formData.append('name', this.eventForm.get('name')?.value);
    formData.append('image', this.selectedFile);
    
    this.eventService.saveEvent(formData).subscribe({
      next: () => {
        this.showFormModal.set(false);
        this.loadEvents();
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
