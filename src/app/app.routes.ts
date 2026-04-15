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
				path: 'movies',
				loadChildren: () => import('./features/movies/movies.routes').then((m) => m.moviesRoutes)
			},
			{
				path: 'booking',
				loadChildren: () => import('./features/booking/booking.routes').then((m) => m.bookingRoutes)
			},
			{
				path: 'auth',
				loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes)
			},
			{
				path: 'admin',
				loadChildren: () => import('./features/admin/admin.routes').then((m) => m.adminRoutes)
			}
		]
	},
	{
		path: '**',
		redirectTo: ''
	}
];
