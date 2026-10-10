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
        path: 'stops',
        canActivate: [permissionGuard],
        data: { permission: 'ROUTE_READ' },
        loadComponent: () =>
          import('./features/routes/pages/stop-point-list-page/stop-point-list-page.component').then(
            (m) => m.StopPointListPageComponent
          ),
      },
      {
        path: 'routes/stops',
        redirectTo: 'stops',
        pathMatch: 'full',
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
      {
        path: 'drivers',
        canActivate: [permissionGuard],
        data: { permission: 'FLEET_READ' },
        loadComponent: () =>
          import('./features/fleet/pages/driver-list-page/driver-list-page.component').then(
            (m) => m.DriverListPageComponent
          ),
      },
      {
        path: 'vehicles/drivers',
        redirectTo: 'drivers',
        pathMatch: 'full',
      },
      {
        path: 'trips',
        canActivate: [permissionGuard],
        data: { permission: 'TRIP_READ' },
        loadComponent: () =>
          import('./features/trips/pages/trip-management-page/trip-management-page.component').then(
            (m) => m.TripManagementPageComponent
          ),
      },
      {
        path: 'trip-runs',
        canActivate: [permissionGuard],
        data: { permission: 'TRIP_READ' },
        loadComponent: () =>
          import('./features/trips/pages/trip-run-list-page/trip-run-list-page.component').then(
            (m) => m.TripRunListPageComponent
          ),
      },
      {
        path: 'trips/runs',
        redirectTo: 'trip-runs',
        pathMatch: 'full',
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
