import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/documents`;

   uploadDocument(file: File): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();
    formData.append('file', file);

    return this.http.post<any>(this.baseUrl, formData, {
      reportProgress: true,
      observe: 'events',
    });
  }
}