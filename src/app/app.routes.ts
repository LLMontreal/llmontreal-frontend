import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UploadDocumentComponent } from './components/upload-document/upload-document.component';

export const routes: Routes = [

	{ path: '', component: UploadDocumentComponent, pathMatch: 'full' },
	{ path: 'dashboard', component: DashboardComponent },
	{ path: 'upload-document', component: UploadDocumentComponent },
	{ path: '**', redirectTo: '' }
];

