import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UploadDocumentComponent } from './components/upload-document/upload-document.component';
import { DocSummaryChatComponent } from '@components/doc-summary-chat/doc-summary-chat.component';

export const routes: Routes = [

	{ path: '', component: UploadDocumentComponent, pathMatch: 'full' },
	{ path: 'dashboard', component: DashboardComponent },
	{ path: 'upload-document', component: UploadDocumentComponent },
	{ path: 'chat/:id', component: DocSummaryChatComponent }, 
	{ path: '**', redirectTo: '' }
];

