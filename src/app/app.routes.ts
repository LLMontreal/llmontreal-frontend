import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';

export const routes: Routes = [

	{ path: '', redirectTo: 'upload', pathMatch: 'full' },
	{ path: 'dashboard', component: DashboardComponent },
	{ path: 'upload', component: DashboardComponent },
	{ path: '**', redirectTo: '' }
];

