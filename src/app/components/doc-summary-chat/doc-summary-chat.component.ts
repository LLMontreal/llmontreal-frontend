import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ChatService } from '@services/chat.service';
import { ChatMessage } from '@shared/models/chat-message';
import { Subscription, interval, of } from 'rxjs';
import { take, switchMap, filter, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-doc-summary-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatSnackBarModule],
  templateUrl: './doc-summary-chat.component.html',
  styleUrls: ['./doc-summary-chat.component.scss']
})
export class DocSummaryChatComponent implements OnInit, AfterViewInit, OnDestroy {

  documentId: string | null = null;
  messages: ChatMessage[] = [];
  newMessage = '';
  isLoading = false;
  isChatFullscreen = false;

  summaryText = '';
  summaryError: string | null = null;

  confirmRegenerateModalOpen = false;
  isRegeneratingSummary = false;
  regenerateError: string | null = null;
  private pollSubscription: Subscription | null = null;

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

  ngOnDestroy(): void {
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
    }
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
    const oldSummary = this.summaryText;
    this.summaryText = 'Gerando novo resumo, aguarde alguns instantes...';

    this.chatService.regenerateSummary(this.documentId).subscribe({
      next: () => this.pollForSummaryUpdate(oldSummary),
      error: () => {
        // Assume timeout/async processing, start polling
        this.pollForSummaryUpdate(oldSummary);
      }
    });
  }

  private pollForSummaryUpdate(oldSummary: string): void {
    if (!this.documentId) return;

    this.pollSubscription = interval(2000).pipe(
      take(30), // 60 seconds max
      switchMap(() => this.chatService.getSummary(this.documentId!).pipe(
        catchError(() => of(oldSummary))
      )),
      filter(newSummary => newSummary !== oldSummary && newSummary !== ''),
      take(1)
    ).subscribe({
      next: (newSummary) => {
        this.summaryText = newSummary;
        this.finishRegeneration(true);
      },
      complete: () => {
        if (this.isRegeneratingSummary) {
          this.finishRegeneration(false);
        }
      }
    });
  }

  private finishRegeneration(success: boolean): void {
    this.isRegeneratingSummary = false;
    if (success) {
      this.confirmRegenerateModalOpen = false;
      this.snackBar.open('Resumo regerado com sucesso!', 'Fechar', {
        duration: 3000,
        horizontalPosition: 'center',
        panelClass: ['custom-snackbar'],
        verticalPosition: 'bottom',
      });
    } else {
      this.regenerateError = 'Não foi possível regerar o resumo. Tente novamente.';
      this.summaryText = 'Falha ao atualizar o resumo.';
    }
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
      this.pollSubscription = null;
    }
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