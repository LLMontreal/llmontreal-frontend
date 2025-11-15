import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
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
export class DocSummaryChatComponent implements OnInit, AfterViewInit, AfterViewChecked {

  documentId: string | null = null;
  messages: ChatMessage[] = [];
  newMessage = '';
  isLoading = false;
  isChatFullscreen = false;

  summaryText = '';
  summaryError: string | null = null;
  isSummaryOverflowing = false;
  showFullSummaryModal = false;

  private summaryNeedsCheck = false;

  @ViewChild('messagesContainer') messagesContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('summaryParagraph') summaryParagraph!: ElementRef<HTMLParagraphElement>;
  @ViewChild('messageInput') messageInput!: ElementRef<HTMLTextAreaElement>;

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.documentId = this.route.snapshot.paramMap.get('id');

    this.loadSummary();

    this.messages.push({
      sender: 'Montreal Bot',
      text: 'Olá! Faça uma pergunta sobre o documento para começar.'
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.scrollToBottom(true);

      if (this.messageInput?.nativeElement) {
        this.messageInput.nativeElement.style.height = '48px';
      }
    });
  }

  ngAfterViewChecked(): void {
    if (this.summaryNeedsCheck) {
    
      this.summaryNeedsCheck = false;
    }
  }

loadSummary(): void {
  if (!this.documentId) {
    this.summaryText = '';
    this.summaryError = "ID do documento não encontrado.";
    return;
  }

  this.summaryError = null;
  this.summaryText = ''; 

  this.chatService.getSummary(this.documentId).subscribe({
    next: (data) => {
      this.summaryText = data;
      this.summaryNeedsCheck = true;
    },
    error: (err) => {
      this.summaryText = ''; 
      this.summaryError = 'Não foi possível carregar o resumo do documento.';
    }
  });
}

  openSummaryModal(): void {
    this.showFullSummaryModal = true;
  }

  closeSummaryModal(): void {
    this.showFullSummaryModal = false;
  }

  toggleChatFullscreen(): void {
    this.isChatFullscreen = !this.isChatFullscreen;
    setTimeout(() => this.scrollToBottom(false), 0);
  }

  autoResize(textarea: HTMLTextAreaElement): void {
    const minHeight = 48;
    const maxHeight = 160;

    textarea.style.height = minHeight + 'px';
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = newHeight + 'px';

    this.scrollToBottom(false);
  }

 onEnter(event: KeyboardEvent | Event): void {
  const e = event as KeyboardEvent;

  if (e.shiftKey) {
    return;
  }

  e.preventDefault();

  if (!this.newMessage.trim() || this.isLoading || !this.documentId) {
    return;
  }

  this.sendMessage();
}

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.documentId) return;

    this.messages.push({ sender: 'Você', text: this.newMessage });
    const currentMessage = this.newMessage;
    this.newMessage = '';
    this.isLoading = true;

    setTimeout(() => {
      if (this.messageInput?.nativeElement) {
        this.messageInput.nativeElement.style.height = '48px';
      }
    });

    this.scrollToBottom(true);

    this.chatService.getResponse(this.documentId, currentMessage).subscribe({
      next: (iaResponse) => {
        this.messages.push(iaResponse);
        this.isLoading = false;
        this.scrollToBottom(true);
      },
      error: (err) => {
        this.messages.push({
          sender: 'Montreal Bot',
          text: 'Desculpe, ocorreu um erro ao processar sua pergunta. Por favor, tente novamente.'
        });
        this.isLoading = false;
        this.scrollToBottom(true);
      }
    });
  }

  private scrollToBottom(_: boolean): void {
    if (!this.messagesContainer) return;
    this.cdr.detectChanges();
    const el = this.messagesContainer.nativeElement;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }
}