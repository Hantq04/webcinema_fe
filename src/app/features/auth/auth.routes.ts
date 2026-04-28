import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./auth.component').then((m) => m.AuthComponent),
    data: { tab: 'login' }
  },
  {
    path: 'register',
    loadComponent: () => import('./auth.component').then((m) => m.AuthComponent),
    data: { tab: 'register' }
  },
  {
    path: 'forgotpassword',
    loadComponent: () => import('./auth.component').then((m) => m.AuthComponent),
    data: { tab: 'forgotpassword' }
  },
  {
    path: 'changepassword',
    loadComponent: () => import('./auth.component').then((m) => m.AuthComponent),
    data: { tab: 'changepassword' }
  }
];