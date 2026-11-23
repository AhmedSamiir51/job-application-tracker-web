import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/auth/auth.page').then((m) => m.AuthPage),
    data: { mode: 'login' },
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/auth/auth.page').then((m) => m.AuthPage),
    data: { mode: 'register' },
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'applications',
        loadComponent: () =>
          import('./pages/applications/applications.page').then((m) => m.ApplicationsPage),
      },
      {
        path: 'applications/new',
        loadComponent: () =>
          import('./pages/application-form/application-form.page').then((m) => m.ApplicationFormPage),
      },
      {
        path: 'applications/:id',
        loadComponent: () =>
          import('./pages/application-detail/application-detail.page').then((m) => m.ApplicationDetailPage),
      },
      {
        path: 'applications/:id/edit',
        loadComponent: () =>
          import('./pages/application-form/application-form.page').then((m) => m.ApplicationFormPage),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
