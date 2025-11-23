import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ChatService } from '@services/chat.service';
import { ChatMessage } from '@shared/models/chat-message';

@Component({
  selector: 'app-doc-summary-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatSnackBarModule],
  templateUrl: './doc-summary-chat.component.html',
  styleUrls: ['./doc-summary-chat.component.scss']
})
export class DocSummaryChatComponent implements OnInit, AfterViewInit {

  documentId: string | null = null;
  messages: ChatMessage[] = [];
  newMessage = '';
  isLoading = false;
  isChatFullscreen = false;

  summaryText = '';
  summaryError: string | null = null;
  showFullSummaryModal = false;

  confirmRegenerateModalOpen = false;
  isRegeneratingSummary = false;
  regenerateError: string | null = null;

  @ViewChild('messagesContainer') messagesContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('summaryParagraph') summaryParagraph!: ElementRef<HTMLParagraphElement>;
  @ViewChild('messageInput') messageInput!: ElementRef<HTMLTextAreaElement>;

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService,
    private snackBar: MatSnackBar
  ) { }

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
      this.scrollToBottom();

      if (this.messageInput?.nativeElement) {
        this.messageInput.nativeElement.style.height = '48px';
      }
    });
  }

  loadSummary(): void {
    if (!this.documentId) {
      this.summaryText = '';
      this.summaryError = 'ID do documento não encontrado.';
      return;
    }

    this.summaryError = null;
    this.summaryText = '';

    this.chatService.getSummary(this.documentId).subscribe({
      next: (data) => {
        this.summaryText = data;
      },
      error: () => {
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

  openConfirmRegenerateModal(): void {
    this.regenerateError = null;
    this.confirmRegenerateModalOpen = true;
  }

  closeConfirmRegenerateModal(): void {
    if (this.isRegeneratingSummary) return;
    this.confirmRegenerateModalOpen = false;
  }

  confirmRegenerateSummary(): void {
    if (!this.documentId || this.isRegeneratingSummary) return;

    this.isRegeneratingSummary = true;
    this.regenerateError = null;
    this.summaryText = 'Gerando novo resumo, aguarde alguns instantes...';

    this.chatService.regenerateSummary(this.documentId).subscribe({
      next: () => {
        setTimeout(() => {
          this.loadSummary();
          this.isRegeneratingSummary = false;
          this.confirmRegenerateModalOpen = false;
          this.snackBar.open('Resumo regenerado com sucesso!', 'Fechar', {
            duration: 3000,
            horizontalPosition: 'center',
            panelClass: ['custom-snackbar'],
            verticalPosition: 'bottom',
          });
        }, 5000);
      },
      error: () => {
        this.isRegeneratingSummary = false;
        this.summaryText = '';
        this.regenerateError = 'Não foi possível solicitar a regeneração do resumo.';

        this.snackBar.open('Erro ao regenerar resumo.', 'Fechar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['custom-snackbar']
        });
      }
    });
  }

  toggleChatFullscreen(): void {
    this.isChatFullscreen = !this.isChatFullscreen;
    setTimeout(() => this.scrollToBottom(), 0);
  }

  autoResize(textarea: HTMLTextAreaElement): void {
    const minHeight = 48;
    const maxHeight = 160;

    textarea.style.height = minHeight + 'px';
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = newHeight + 'px';

    this.scrollToBottom();
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

    this.scrollToBottom();

    this.chatService.getResponse(this.documentId, currentMessage).subscribe({
      next: (iaResponse) => {
        this.messages.push(iaResponse);
        this.isLoading = false;
        this.scrollToBottom();
      },
      error: () => {
        this.messages.push({
          sender: 'Montreal Bot',
          text: 'Desculpe, ocorreu um erro ao processar sua pergunta. Por favor, tente novamente.'
        });
        this.isLoading = false;
        this.scrollToBottom();
      }
    });
  }

  private scrollToBottom(): void {
    if (!this.messagesContainer) return;

    setTimeout(() => {
      const el = this.messagesContainer.nativeElement;
      el.scrollTo({
        top: el.scrollHeight,
        behavior: 'smooth'
      });
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
      });
    }, 0);
  }
}