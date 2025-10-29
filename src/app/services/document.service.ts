import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  private baseUrl = 'http://localhost:8080/api/documents';

  constructor(private http: HttpClient) { }

  uploadDocument(file: File): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();
    formData.append('file', file);

    return this.http.post<any>(`${this.baseUrl}/upload`, formData, {
      reportProgress: true,
      observe: 'events'  
    });

  }
}