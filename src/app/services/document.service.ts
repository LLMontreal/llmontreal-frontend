import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment';
import { DocumentDTO, Page } from '../models/document.model';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  private apiUrl = `${environment.apiUrl}/documents`;

  constructor(private http: HttpClient, private snackBar: MatSnackBar) { }

  getDocuments(page: number, size: number, status?: string): Observable<Page<DocumentDTO>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (status) params = params.set('status', status);

    return this.http.get<Page<DocumentDTO>>(this.apiUrl, { params }).pipe(
      catchError((err) => this.handleError('Não foi possível carregar os documentos.', err))
    );
  }

  uploadDocument(file: File): Observable<HttpEvent<any>> {
    const form = new FormData();
    form.append('file', file);

    return this.http
      .post<HttpEvent<any>>(`${this.apiUrl}/upload`, form, {
        reportProgress: true,
        observe: 'events',
      })
      .pipe(catchError((err) => this.handleError('Erro ao enviar o documento.', err)));
  }

  getDocumentById(id: number): Observable<DocumentDTO> {
    return this.http
      .get<DocumentDTO>(`${this.apiUrl}/${id}`)
      .pipe(catchError((err) => this.handleError('Erro ao buscar o documento.', err)));
  }

  private handleError(userMessage: string, error: HttpErrorResponse) {
    let technicalMessage = 'Erro inesperado.';

    if (error.error instanceof ErrorEvent) {

      technicalMessage = `Erro de conexão: ${error.error.message}`;
      this.showSnack(userMessage + ' Verifique sua conexão e tente novamente.');
    } else {
      switch (error.status) {
        case 400:
          this.showSnack('Requisição inválida. Verifique os dados enviados.');
          break;
        case 404:
          this.showSnack('Documento não encontrado.');
          break;
        case 500:
          this.showSnack('Erro interno do servidor. Tente novamente mais tarde.');
          break;
        default:
          this.showSnack(userMessage);
      }

      technicalMessage = `HTTP ${error.status} — ${error.message}`;
    }
    return throwError(() => error);
  }

private showSnack(msg: string): void {
  this.snackBar.open(msg, 'Fechar', {
    duration: 5000,
    horizontalPosition: 'center',
    verticalPosition: 'bottom',
    panelClass: ['custom-snackbar'] 
  });
}
}