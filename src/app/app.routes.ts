import { Routes } from '@angular/router';
import { UploadDocumentComponent } from './components/upload-document/upload-document.component';

export const routes: Routes = [
  {
    path: 'upload',
    component: UploadDocumentComponent,
  },
    { path: '', redirectTo: '/upload', pathMatch: 'full' },


  {
    path: '',
    redirectTo: '/upload',
    pathMatch: 'full',
  },
];
