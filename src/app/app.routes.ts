import { Routes } from '@angular/router';
import { authGuard, invitadoGuard } from './core/guards/auth-guard';
export const routes: Routes = [
  {
    path: 'login',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./features/auth/pages/login/login').then((m) => m.Login),
  },
  {
    path: '',
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    loadComponent: () => import('./layout/main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
      {
        path: 'inicio',
        loadComponent: () => import('./features/inicio/inicio').then((m) => m.Inicio),
      },
      {
        path: 'servicios',
        loadChildren: () =>
          import('./features/servicios/servicios.routes').then((m) => m.SERVICIOS_ROUTES),
      },
      {
        path: 'vehiculos',
        loadChildren: () =>
          import('./features/vehiculos/vehiculos.routes').then((m) => m.VEHICULOS_ROUTES),
      },
      {
        path: 'ordenes',
        loadChildren: () =>
          import('./features/ordenes/ordenes.routes').then((m) => m.ORDENES_ROUTES),
      },
      {
        path: 'reportes',
        loadChildren: () =>
          import('./features/reportes/reportes.routes').then((m) => m.REPORTES_ROUTES),
      },
      {
        path: 'acceso-denegado',
        loadComponent: () =>
          import('./shared/pages/acceso-denegado/acceso-denegado').then((m) => m.AccesoDenegado),
      },
      {
        path: '**',
        loadComponent: () =>
          import('./shared/pages/no-encontrado/no-encontrado').then((m) => m.NoEncontrado),
      },
    ],
  },
];
