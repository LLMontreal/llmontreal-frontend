import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ChatMessage } from '@shared/models/chat-message';
import { ChatMessageResponseDto } from '@shared/models/chat-message-response-dto';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getResponse(documentId: string, prompt: string): Observable<ChatMessage> {
    const body = {
      model: 'gemma3:4b',
      prompt: prompt,
      stream: false
    };

    return this.http.post<ChatMessageResponseDto>(
      `${this.apiUrl}/chat/${documentId}`,
      body
    ).pipe(
      map(res => {
        const mapped: ChatMessage = {
          sender: res.author === 'MODEL' ? 'Montreal Bot' : 'Você',
          text: res.response,
          createdAt: res.createdAt
        };
        return mapped;
      }),
      catchError(() => throwError(() => new Error('Falha na comunicação com o servidor.')))
    );
  }

  getSummary(documentId: string): Observable<string> {
    return this.http.get(`${this.apiUrl}/documents/${documentId}/summary`, {
      responseType: 'text'
    }).pipe(
      catchError(() => throwError(() => new Error('Falha ao carregar o resumo.')))
    );
  }

  regenerateSummary(documentId: string): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/documents/${documentId}/summary/regenerate`,
      {}
    );
  }
}