import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DocumentDTO, DocumentStatus, Page } from '../models/document.model';
import { HttpEvent } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  private baseUrl = 'http://localhost:8080/api/documents';

  constructor(private http: HttpClient) {}

    if (status) {
      params = params.set('status', status);
    }

    
    return this.http.post<any>(this.baseUrl, formData, {
      reportProgress: true,
      observe: 'events',
    });
  }
}
