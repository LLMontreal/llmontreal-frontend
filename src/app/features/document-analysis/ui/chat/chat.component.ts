import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatMessage } from '../../models/chat-message';
import { ChatService } from '../../../../core/services/chat.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, AfterViewInit {
  
  @Input() documentId: string | null = null;

  messages: ChatMessage[] = [];
  newMessage: string = '';
  isLoading: boolean = false;

  @ViewChild('messagesContainer') messagesContainer!: ElementRef<HTMLDivElement>;

  constructor(private chatService: ChatService) { }

  ngOnInit(): void {
    this.messages.push({
      sender: 'IA',
      text: 'Olá! Faça uma pergunta sobre o documento para começar.'
    });
  }

  ngAfterViewInit(): void {
    // Garante que a primeira mensagem fique visível
    setTimeout(() => this.scrollToBottom(true));
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) return;

    this.messages.push({ sender: 'Você', text: this.newMessage });
    const currentMessage = this.newMessage;
    this.newMessage = '';
    this.isLoading = true;
    this.chatService.getResponse(this.documentId, currentMessage)
      .subscribe((iaResponse: ChatMessage) => {
        this.messages.push(iaResponse);
        this.isLoading = false;
        this.scrollToBottom(true);
      });
    // Ao enviar, já rola para o final para mostrar a mensagem do usuário
    this.scrollToBottom(true);
  }

  private scrollToBottom(smooth: boolean): void {
    if (!this.messagesContainer) return;
    const el = this.messagesContainer.nativeElement;
    // Sempre usa smooth para uma animação suave
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }
}