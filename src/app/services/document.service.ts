import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DocumentUploadResponse } from '../models/document-upload-response.model';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/documents`;

   uploadDocument(file: File): Observable<HttpEvent<DocumentUploadResponse>> {
    const formData: FormData = new FormData();
    formData.append('file', file);

    return this.http.post<DocumentUploadResponse>(this.baseUrl, formData, {
      reportProgress: true,
      observe: 'events',
    });
  }
}