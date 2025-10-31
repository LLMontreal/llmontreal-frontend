import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ChangeDetectorRef } from '@angular/core';

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

  documentId: string | null = null;

  messages: ChatMessage[] = [];
  newMessage = '';
  isLoading = false;

  @ViewChild('messagesContainer') messagesContainer!: ElementRef<HTMLDivElement>;

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.documentId = this.route.snapshot.paramMap.get('id');
    console.log('DOC-SUMMARY-CHAT: carregado para documento:', this.documentId);

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

    this.messages.push({ sender: 'Você', text: this.newMessage });
    const currentMessage = this.newMessage;
    this.newMessage = '';
    this.isLoading = true;

    this.scrollToBottom(true);

    this.chatService.getResponse(this.documentId, currentMessage).subscribe((iaResponse: ChatMessage) => {
      this.messages.push(iaResponse);
      this.isLoading = false;
      this.scrollToBottom(true);
    });
  }

 private scrollToBottom(_: boolean): void {
  if (!this.messagesContainer) return;
  this.cdr.detectChanges(); 
  const el = this.messagesContainer.nativeElement;
  el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
}
}