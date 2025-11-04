import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
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
    const mockSummary = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque varius, dui sed scelerisque sollicitudin, tellus sapien ultricies dolor, vitae finibus libero lorem vitae ipsum. Phasellus volutpat eget mauris ut scelerisque. Ut lectus dolor, hendrerit et fringilla sed, imperdiet nec metus. Aliquam tristique sed massa sit amet sollicitudin. Curabitur ipsum nibh, bibendum sit amet facilisis sit amet, rutrum et dui. Morbi congue elit id arcu feugiat, quis commodo ipsum commodo. Mauris sagittis purus sit amet facilisis fermentum. Ut lobortis sollicitudin erat, condimentum suscipit purus efficitur quis. Mauris faucibus id eros congue cursus.

Aliquam fermentum, neque quis auctor mollis, lectus turpis ornare turpis, vitae semper tortor leo vel ipsum. Mauris sit amet rutrum orci, egestas sodales ante. Integer congue placerat ante, sit amet bibendum turpis malesuada ac. Aliquam porta, est sit amet pharetra`;

    // Simula uma chamada de API com 1 segundo de atraso
    of(mockSummary).pipe(delay(1000)).subscribe(data => {
      this.summaryText = data;
      this.isSummaryLoading = false;

      setTimeout(() => this.checkSummaryOverflow());
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