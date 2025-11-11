import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpEvent } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { DocumentDTO, DocumentStatus, Page } from '../models/document.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = `${environment.apiUrl}/documents`;

  constructor(private http: HttpClient) {}

  getDocuments(
    page: number,
    size: number,
    status?: DocumentStatus | null,

  ): Observable<Page<DocumentDTO>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (status) params = params.set('status', status);

    return this.http.get<Page<DocumentDTO>>(this.apiUrl, { params }).pipe(
      catchError((err) => this.handleError('Ao buscar documentos', err))
    );
  }

  uploadDocument(file: File): Observable<HttpEvent<any>> {
    const form = new FormData();
    form.append('file', file);

    return this.http.post<HttpEvent<any>>(`${this.apiUrl}/upload`, form, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      catchError((err) => this.handleError('Ao enviar documento', err))
    );
  }

  getDocumentById(id: number): Observable<DocumentDTO> {
    return this.http.get<DocumentDTO>(`${this.apiUrl}/${id}`).pipe(
      catchError((err) => this.handleError(`Ao buscar documento ${id}`, err))
    );
  }
  
  private handleError(_operation: string, err: unknown): Observable<never> {
    return throwError(() => err);
  }
}
