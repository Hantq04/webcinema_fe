import { Routes } from '@angular/router';

import { authGuard } from '../../core/guards/auth.guard';

export const accountRoutes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./account.component').then((m) => m.AccountComponent)
  }
];