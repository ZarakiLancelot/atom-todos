import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'tasks',
    loadComponent: () =>
      import('./features/tasks/tasks.component').then(m => m.TasksComponent),
    canActivate: [() => import('./core/guards/auth.guard').then(m => m.authGuard)]
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then(m => m.NotFoundComponent)
  },
  { path: '**', redirectTo: 'login' }
];
