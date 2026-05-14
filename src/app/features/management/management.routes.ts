import { Routes } from '@angular/router';

export const managementRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/management-layout.component').then((m) => m.ManagementLayoutComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/management-dashboard.component').then((m) => m.ManagementDashboardComponent)
      },
      {
        path: 'seats',
        loadComponent: () => import('./seats/management-seats.component').then((m) => m.ManagementSeatsComponent)
      },
      {
        path: 'cinemas',
        loadComponent: () => import('./cinemas/management-cinemas.component').then((m) => m.ManagementCinemasComponent)
      },
      {
        path: 'movies',
        loadComponent: () => import('./movies/management-movies.component').then((m) => m.ManagementMoviesComponent)
      },
      {
        path: 'schedules',
        loadComponent: () => import('./schedules/management-schedules.component').then((m) => m.ManagementSchedulesComponent)
      },
      {
        path: 'bills',
        loadComponent: () => import('./bills/management-bills.component').then((m) => m.ManagementBillsComponent)
      },
      {
        path: 'food-beverages',
        loadComponent: () => import('./food-beverages/management-food-beverages.component').then((m) => m.ManagementFoodBeveragesComponent)
      },
      {
        path: 'promotions',
        loadComponent: () => import('./promotions/management-promotion.component').then((m) => m.ManagementPromotionComponent)
      },
      {
        path: 'banners',
        loadComponent: () => import('./banners/management-banner.component').then((m) => m.ManagementBannerComponent)
      },
      {
        path: 'events',
        loadComponent: () => import('./events/management-event.component').then((m) => m.ManagementEventComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./users/management-users.component').then((m) => m.ManagementUsersComponent)
      }
    ]
  }
];
