import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () => import('./layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
		children: [
			{
				path: '',
				pathMatch: 'full',
				loadChildren: () => import('./features/home/home.routes').then((m) => m.homeRoutes)
			},
			{
				path: 'home',
				loadChildren: () => import('./features/home/home.routes').then((m) => m.homeRoutes)
			},
			{
				path: 'movies',
				loadChildren: () => import('./features/movies/movies.routes').then((m) => m.moviesRoutes)
			},
			{
				path: 'booking',
				loadChildren: () => import('./features/booking/booking.routes').then((m) => m.bookingRoutes)
			},
			{
				path: 'customer/account',
				loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes)
			},
			{
				path: 'staff/account',
				loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes),
				data: { staff: true }
			},
			{
				path: 'account',
				loadChildren: () => import('./features/account/account.routes').then((m) => m.accountRoutes)
			},
			{
				path: 'admin',
				loadChildren: () => import('./features/admin/admin.routes').then((m) => m.adminRoutes)
			}
		]
	},
	{
		path: 'management',
		loadChildren: () => import('./features/management/management.routes').then((m) => m.managementRoutes)
	},
	{
		path: '**',
		redirectTo: ''
	}
];
