import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { ChatService } from '@services/chat.service';
import { ChatMessage } from '@shared/models/chat-message';

@Component({
  selector: 'app-doc-summary-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './doc-summary-chat.component.html',
  styleUrls: ['./doc-summary-chat.component.scss']
})
export class DocSummaryChatComponent implements OnInit, AfterViewInit {

  // vindo da rota /document/:id (ou similar)
  documentId: string | null = null;

  // Estado do "chat"
  messages: ChatMessage[] = [];
  newMessage = '';
  isLoading = false;

  @ViewChild('messagesContainer') messagesContainer!: ElementRef<HTMLDivElement>;

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    // Lê o parâmetro 'id' caso exista na URL
    this.documentId = this.route.snapshot.paramMap.get('id');
    console.log('DOC-SUMMARY-CHAT: carregado para documento:', this.documentId);

    // Mensagem inicial
    this.messages.push({
      sender: 'IA',
      text: 'Olá! Faça uma pergunta sobre o documento para começar.'
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.scrollToBottom(true));
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) return;

    // Adiciona mensagem do usuário
    this.messages.push({ sender: 'Você', text: this.newMessage });
    const currentMessage = this.newMessage;
    this.newMessage = '';
    this.isLoading = true;

    // Já rola para baixo para mostrar a última mensagem
    this.scrollToBottom(true);

    // Chama serviço para resposta mock da IA
    this.chatService.getResponse(this.documentId, currentMessage).subscribe((iaResponse: ChatMessage) => {
      this.messages.push(iaResponse);
      this.isLoading = false;
      this.scrollToBottom(true);
    });
  }

  private scrollToBottom(_: boolean): void {
    if (!this.messagesContainer) return;
    const el = this.messagesContainer.nativeElement;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }
}