import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
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

  documentId: string | null = null;
  messages: ChatMessage[] = [];
  newMessage = '';
  isLoading = false;
  isChatFullscreen = false;

  summaryText = '';
  isSummaryLoading = true;
  summaryError: string | null = null;
  isSummaryOverflowing = false;
  showFullSummaryModal = false;

  @ViewChild('messagesContainer') messagesContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('summaryParagraph') summaryParagraph!: ElementRef<HTMLParagraphElement>;

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.documentId = this.route.snapshot.paramMap.get('id');
    console.log('DOC-SUMMARY-CHAT: carregado para documento:', this.documentId);

    this.loadSummary();

    this.messages.push({
      sender: 'IA',
      text: 'Olá! Faça uma pergunta sobre o documento para começar.'
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.scrollToBottom(true));
  }

  loadSummary(): void {
    if (!this.documentId) {
      this.summaryError = "ID do documento não encontrado.";
      this.isSummaryLoading = false;
      return;
    }

    this.isSummaryLoading = true;
    this.summaryError = null;

    this.chatService.getSummary(this.documentId).subscribe({
      next: (data) => {
        this.summaryText = data;
        this.isSummaryLoading = false;
        setTimeout(() => this.checkSummaryOverflow());
      },
      error: (err) => {
        console.error('Falha ao carregar o resumo:', err);
        this.summaryError = 'Não foi possível carregar o resumo do documento.';
        this.isSummaryLoading = false;
      }
    });
  }

  checkSummaryOverflow(): void {
    if (this.summaryParagraph) {
      const el = this.summaryParagraph.nativeElement;
      if (el.scrollHeight > el.clientHeight) {
        this.isSummaryOverflowing = true;
        this.cdr.detectChanges();
      }
    }
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

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.documentId) return;

    this.messages.push({ sender: 'Você', text: this.newMessage });
    const currentMessage = this.newMessage;
    this.newMessage = '';
    this.isLoading = true;

    this.scrollToBottom(true);

    this.chatService.getResponse(this.documentId, currentMessage).subscribe({
        next: (iaResponse) => {
            this.messages.push(iaResponse);
            this.isLoading = false;
            this.scrollToBottom(true);
        },
        error: (err) => {
            console.error('Falha ao obter resposta da IA:', err);
            this.messages.push({
                sender: 'IA',
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