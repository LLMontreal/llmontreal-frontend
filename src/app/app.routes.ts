import { Routes } from '@angular/router';
import { DocSummaryChatComponent } from '@components/doc-summary-chat/doc-summary-chat.component'; 

export const routes: Routes = [
 
  { path: 'chat/:id', component: DocSummaryChatComponent }, 
  
  { path: '**', redirectTo: '' }
];