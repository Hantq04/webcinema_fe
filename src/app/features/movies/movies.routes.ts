import { Routes } from '@angular/router';

export const moviesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./movies.component').then((m) => m.MoviesComponent)
  },
  {
    path: ':code',
    loadComponent: () => import('./movie-detail/movie-detail.component').then((m) => m.MovieDetailComponent)
  }
];