import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UploadDocumentComponent } from './components/upload-document/upload-document.component';
import { DocSummaryChatComponent } from '@components/doc-summary-chat/doc-summary-chat.component';
import { LogDownload } from './components/log-download/log-download';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
	{ path: 'login', component: LoginComponent },
	{ path: 'register', component: RegisterComponent },
	{ path: '', redirectTo: '/login', pathMatch: 'full' },
	{ path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
	{ path: 'upload-document', component: UploadDocumentComponent, canActivate: [authGuard] },
	{ path: 'chat/:id', component: DocSummaryChatComponent, canActivate: [authGuard] },
	{ path: 'logs', component: LogDownload, canActivate: [authGuard] },
	{ path: '**', redirectTo: '/login' }
];

