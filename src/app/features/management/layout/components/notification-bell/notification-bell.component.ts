import { Component, OnInit, OnDestroy, ElementRef, HostListener, inject, signal, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { NotificationService } from '../../../../../core/services/notification.service';
import { LanguageService } from '../../../../../core/services/language.service';
import { AppNotification } from '../../../../../core/models/notification.model';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  providers: [DatePipe],
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  private readonly notificationService = inject(NotificationService);
  protected readonly language = inject(LanguageService);
  private readonly elementRef = inject(ElementRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);

  // Signals for state management
  unreadCount = signal<number>(0);
  notifications = signal<AppNotification[]>([]);
  isOpen = signal<boolean>(false);
  isLoading = signal<boolean>(false);

  // Modal State Signals
  showAllModal = signal<boolean>(false);
  modalNotifications = signal<AppNotification[]>([]);
  modalCurrentPage = signal<number>(0);
  modalTotalPages = signal<number>(0);
  modalIsLoading = signal<boolean>(false);

  private autoRefreshSub?: Subscription;

  protected readonly t = this.language.t.bind(this.language);

  isVi(): boolean {
    return this.language.currentLanguage() === 'vi';
  }

  get textNotifications() { return this.isVi() ? 'Thông báo' : 'Notifications'; }
  get textMarkAllRead() { return this.isVi() ? 'Đánh dấu tất cả' : 'Mark all as read'; }
  get textViewAll() { return this.isVi() ? 'Xem tất cả' : 'View all'; }
  get textNoNotifications() { return this.isVi() ? 'Không có thông báo nào' : 'No notifications available'; }
  get textLoading() { return this.isVi() ? 'Đang tải...' : 'Loading...'; }

  ngOnInit(): void {
    // Initial fetch of unread count, and poll every 30 seconds for new notification counts
    this.autoRefreshSub = interval(30000)
      .pipe(
        startWith(0),
        switchMap(() => this.notificationService.getUnreadCount())
      )
      .subscribe({
        next: (count) => {
          this.unreadCount.set(count);
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error fetching unread notification count:', err)
      });
  }

  ngOnDestroy(): void {
    if (this.autoRefreshSub) {
      this.autoRefreshSub.unsubscribe();
    }
    if (typeof document !== 'undefined') {
      document.body.classList.remove('modal-open');
    }
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.isOpen.update(open => !open);
    
    if (this.isOpen()) {
      this.loadNotifications();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Close dropdown when clicking outside the component
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
      this.cdr.detectChanges();
    }
  }

  loadNotifications(): void {
    this.isLoading.set(true);
    this.cdr.detectChanges();

    // Fetch the 5 most recent notifications for the quick access panel
    this.notificationService.getAllNotifications(0, 5).subscribe({
      next: (res) => {
        this.notifications.set(res.content);
        this.isLoading.set(false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading notifications:', err);
        this.isLoading.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  markRead(notification: AppNotification, event: Event): void {
    event.stopPropagation();
    if (notification.read) return;

    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        // Update local status
        this.notifications.update(list => 
          list.map(n => n.id === notification.id ? { ...n, read: true } : n)
        );
        // Update modal status
        this.modalNotifications.update(list => 
          list.map(n => n.id === notification.id ? { ...n, read: true } : n)
        );
        // Decrease count
        this.unreadCount.update(count => Math.max(0, count - 1));
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error marking notification as read:', err)
    });
  }

  markAllRead(event: Event): void {
    event.stopPropagation();
    if (this.unreadCount() === 0) {
      alert(this.t('management.allNotificationsRead'));
      return;
    }

    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        // Update local list
        this.notifications.update(list => 
          list.map(n => ({ ...n, read: true }))
        );
        // Update modal list
        this.modalNotifications.update(list => 
          list.map(n => ({ ...n, read: true }))
        );
        // Reset unread count
        this.unreadCount.set(0);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error marking all notifications as read:', err)
    });
  }

  viewAll(event: Event): void {
    event.stopPropagation();
    this.isOpen.set(false);
    this.showAllModal.set(true);
    if (typeof document !== 'undefined') {
      document.body.classList.add('modal-open');
    }
    this.modalCurrentPage.set(0);
    this.loadModalNotifications();
    this.cdr.detectChanges();
  }

  loadModalNotifications(): void {
    this.modalIsLoading.set(true);
    this.cdr.detectChanges();

    this.notificationService.getAllNotifications(this.modalCurrentPage(), 10).subscribe({
      next: (res) => {
        this.modalNotifications.set(res.content);
        // Cap total pages at 20 as requested
        const total = Math.min(20, res.totalPages);
        this.modalTotalPages.set(total);
        this.modalIsLoading.set(false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading modal notifications:', err);
        this.modalIsLoading.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  modalPrevPage(): void {
    if (this.modalCurrentPage() > 0) {
      this.modalCurrentPage.update(p => p - 1);
      this.loadModalNotifications();
    }
  }

  modalNextPage(): void {
    if (this.modalCurrentPage() < this.modalTotalPages() - 1) {
      this.modalCurrentPage.update(p => p + 1);
      this.loadModalNotifications();
    }
  }

  closeModal(): void {
    this.showAllModal.set(false);
    if (typeof document !== 'undefined') {
      document.body.classList.remove('modal-open');
    }
    this.cdr.detectChanges();
  }

  onNotificationClick(notification: AppNotification, event: Event): void {
    this.markRead(notification, event);
    // Add additional handling here if notification contains action links
  }

  getNotificationIcon(type: string): string {
    switch (type?.toUpperCase()) {
      case 'SYSTEM':
        return 'settings';
      case 'BOOKING':
        return 'ticket';
      case 'REVENUE':
        return 'trending-up';
      case 'USER':
        return 'user';
      default:
        return 'bell';
    }
  }
}
