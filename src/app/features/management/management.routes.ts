import { Routes } from '@angular/router';

export const managementRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/management-dashboard.component').then((m) => m.ManagementDashboardComponent)
  }
];
