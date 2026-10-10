import { Routes } from '@angular/router';
import { LayoutShellComponent } from './layout/layout-shell.component';
import { NotFoundComponent } from './core/error-handling/not-found/not-found.component';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { permissionGuard } from './core/guards/permission.guard';

export const routes: Routes = [
  {
    path: '',
    component: LayoutShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard-page/dashboard-page.component').then(
            (m) => m.DashboardPageComponent
          ),
      },
      {
        path: 'users',
        canActivate: [permissionGuard],
        data: { permission: 'USER_READ' },
        loadComponent: () =>
          import('./features/users/pages/user-list-page/user-list-page.component').then(
            (m) => m.UserListPageComponent
          ),
      },
      {
        path: 'roles',
        canActivate: [permissionGuard],
        data: { permission: 'ROLE_READ' },
        loadComponent: () =>
          import('./features/users/pages/role-list-page/role-list-page.component').then(
            (m) => m.RoleListPageComponent
          ),
      },
      {
        path: 'routes',
        canActivate: [permissionGuard],
        data: { permission: 'ROUTE_READ' },
        loadComponent: () =>
          import('./features/routes/pages/route-list-page/route-list-page.component').then(
            (m) => m.RouteListPageComponent
          ),
      },
      {
        path: 'vehicles',
        canActivate: [permissionGuard],
        data: { permission: 'FLEET_READ' },
        loadComponent: () =>
          import('./features/fleet/pages/fleet-list-page/fleet-list-page.component').then(
            (m) => m.FleetListPageComponent
          ),
      },
    ],
  },
  {
    path: 'auth',
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
      {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./features/auth/pages/login-page/login-page.component').then(
            (m) => m.LoginPageComponent
          ),
      },
    ],
  },
  {
    path: 'login',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  {
    path: '404',
    component: NotFoundComponent,
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];
