import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ChatMessage } from '@shared/models/chat-message';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getSummary(documentId: string): Observable<string> {
    const url = `${this.apiUrl}/documents/${documentId}/summary`;
    return this.http.get(url, { responseType: 'text' })
      .pipe(catchError(this.handleError));
  }

  getResponse(documentId: string, prompt: string): Observable<ChatMessage> {
    const requestBody = {
      model: 'deepseek-r1:1.5b',
      prompt: prompt,
      stream: false
    };

    const url = `${this.apiUrl}/chat/${documentId}`;

    return this.http.post<any>(url, requestBody).pipe(
      map(res => ({
        sender: res.author === 'MODEL' ? 'Montreal Bot' : res.author,
        text: res.response
      })),
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    return throwError(() => new Error('Falha na comunicação com o servidor. Tente novamente mais tarde.'));
  }
}