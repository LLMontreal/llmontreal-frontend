import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ChatMessage } from '@shared/models/chat-message';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor() { }

  getResponse(documentId: string | null, prompt: string): Observable<ChatMessage> {
    console.log(`CHAMADA DE SERVIÇO: Buscando resposta para o doc [${documentId}] com a pergunta: "${prompt}"`);

    // Resposta mockada 
    const response: ChatMessage = {
      sender: 'IA',
      text: `Analisando o documento ${documentId}, a principal conclusão é que a IA tem o potencial de automatizar tarefas repetitivas, liberando os seres humanos para se concentrarem em atividades mais criativas e estratégicas.`,
      citation: '"... a automação via IA não visa substituir, mas sim aumentar a capacidade humana." (p. 15)'
    };

    // Simula a latência da rede (1.5 segundos)
    return of(response).pipe(delay(1500));
  }
}