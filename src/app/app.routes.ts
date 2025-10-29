import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';

export const routes: Routes = [
	{ path: '', component: DashboardComponent },
	{ path: 'dashboard', redirectTo: '', pathMatch: 'full' },
	{ path: 'config', loadComponent: () => import('./components/config/config.component').then(m => m.ConfigComponent) },
	{ path: '**', redirectTo: '' }
];

