import { Routes } from '@angular/router';

export const bookingRoutes: Routes = [
  {
    path: ':scheduleCode',
    loadComponent: () => import('./booking.component').then((m) => m.BookingComponent)
  },
  {
    path: '',
    loadComponent: () => import('./booking.component').then((m) => m.BookingComponent)
  }
];