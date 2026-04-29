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
      }
    ]
  }
];
