import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DocumentDTO, DocumentStatus, Page } from '../models/document.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  constructor(private http: HttpClient) {}

  // URL base da sua API. Ajuste se for diferente.
  private apiUrl = '/documents';

  /**
   * Busca documentos paginados e opcionalmente filtrados por status.
   * @param page O número da página (base 0)
   * @param size O tamanho da página
   * @param status O status para filtrar (opcional)
   */
  getDocuments(page: number, size: number, status?: DocumentStatus | null): Observable<Page<DocumentDTO>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<Page<DocumentDTO>>(this.apiUrl, { params }).pipe(
      catchError(err => {
        console.error("Erro ao buscar documentos:", err);
        // Retorna uma página vazia em caso de erro para não quebrar a UI
        return of({
          content: [],
          totalPages: 0,
          totalElements: 0,
          size: size,
          number: page,
          numberOfElements: 0,
          first: true,
          last: true,
          empty: true
        } as Page<DocumentDTO>);
      })
    );
  }

  /**
   * Busca um único documento pelo ID.
   * (Assumindo que você terá um endpoint /documents/{id})
   */
  getDocumentById(id: number): Observable<DocumentDTO | null> {
    return this.http.get<DocumentDTO>(`${this.apiUrl}/${id}`).pipe(
      catchError(err => {
        console.error(`Erro ao buscar documento ${id}:`, err);
        return of(null);
      })
    );
  }
}
