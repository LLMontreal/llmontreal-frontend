import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment';
import { DocumentDTO, DocumentStatus, Page } from '../models/document.model';
import { DocumentUploadResponse } from '../models/document-upload-response.model';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  private apiUrl = `${environment.apiUrl}/documents`;

  getDocuments(
    page: number,
    size: number,
    status?: DocumentStatus | null
  ): Observable<Page<DocumentDTO>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (status) params = params.set('status', status);

    return this.http.get<Page<DocumentDTO>>(this.apiUrl, { params });
  }

  uploadDocument(file: File): Observable<HttpEvent<DocumentUploadResponse>> {
    const formData: FormData = new FormData();
    formData.append('file', file);

    return this.http.post<DocumentUploadResponse>(`${this.apiUrl}/upload`, formData, {
      reportProgress: true,
      observe: 'events',
    });
  }

  getDocumentById(id: number): Observable<DocumentDTO> {
    return new Observable<DocumentDTO>((observer) => {
      this.http.get<DocumentDTO>(`${this.apiUrl}/${id}`).subscribe({
        next: (doc) => observer.next(doc),
        error: () => {
          this.snackBar.open(`Erro ao buscar documento ${id}`, 'Fechar', {
            duration: 3000,
          });
          observer.complete();
        },
        complete: () => observer.complete(),
      });
    });
  }
}
