import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError, Subject } from 'rxjs';
import { DocSummaryChatComponent } from './doc-summary-chat.component';
import { ChatService } from '../../services/chat.service';
import { ChatMessage } from '@shared/models/chat-message';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ChangeDetectorRef, ElementRef } from '@angular/core';

describe('DocSummaryChatComponent', () => {
  let component: DocSummaryChatComponent;
  let fixture: ComponentFixture<DocSummaryChatComponent>;
  let mockChatService: jasmine.SpyObj<ChatService>;
  let mockActivatedRoute: any;
  let mockChangeDetectorRef: jasmine.SpyObj<ChangeDetectorRef>;

  const mockDocumentId = '123';

  beforeEach(async () => {
    const chatServiceSpy = jasmine.createSpyObj('ChatService', ['getSummary', 'getResponse']);
    mockChangeDetectorRef = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue(mockDocumentId)
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        MatIconModule,
        DocSummaryChatComponent
      ],
      providers: [
        { provide: ChatService, useValue: chatServiceSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: ChangeDetectorRef, useValue: mockChangeDetectorRef }
      ]
    }).compileComponents();

    mockChatService = TestBed.inject(ChatService) as jasmine.SpyObj<ChatService>;
    mockChatService.getSummary.and.returnValue(of('Resumo do documento teste'));

    fixture = TestBed.createComponent(DocSummaryChatComponent);
    component = fixture.componentInstance;
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have correct initial state before ngOnInit', () => {
      expect(component.documentId).toBeNull();
      expect(component.messages).toEqual([]);
      expect(component.newMessage).toBe('');
      expect(component.isLoading).toBeFalse();
      expect(component.isChatFullscreen).toBeFalse();
      expect(component.summaryText).toBe('');
      expect(component.summaryError).toBeNull();
      expect(component.isSummaryOverflowing).toBeFalse();
      expect(component.showFullSummaryModal).toBeFalse();
    });
  });

  describe('ngOnInit', () => {
    it('should get documentId from route params', () => {
      fixture.detectChanges();
      expect(component.documentId).toBe(mockDocumentId);
      expect(mockActivatedRoute.snapshot.paramMap.get).toHaveBeenCalledWith('id');
    });

    it('should load summary on init', () => {
      fixture.detectChanges();
      expect(mockChatService.getSummary).toHaveBeenCalledWith(mockDocumentId);
    });

    it('should add initial welcome message', () => {
      fixture.detectChanges();
      expect(component.messages.length).toBe(1);
      expect(component.messages[0].sender).toBe('Montreal Bot');
      expect(component.messages[0].text).toBe('Olá! Faça uma pergunta sobre o documento para começar.');
    });

    it('should handle missing documentId', () => {
      mockActivatedRoute.snapshot.paramMap.get.and.returnValue(null);
      fixture = TestBed.createComponent(DocSummaryChatComponent);
      component = fixture.componentInstance;

      component.ngOnInit();

      expect(component.documentId).toBeNull();
      expect(mockChatService.getSummary).not.toHaveBeenCalled();
      expect(component.summaryError).toBe('ID do documento não encontrado.');
    });
  });

  describe('loadSummary', () => {
    beforeEach(() => {
      component.documentId = mockDocumentId;
    });

    it('should load summary successfully', () => {
      const mockSummary = 'Este é um resumo de teste do documento.';
      mockChatService.getSummary.and.returnValue(of(mockSummary));

      component.loadSummary();

      expect(mockChatService.getSummary).toHaveBeenCalledWith(mockDocumentId);
      expect(component.summaryText).toBe(mockSummary);
      expect(component.summaryError).toBeNull();
    });

    it('should handle summary loading error', () => {
      mockChatService.getSummary.and.returnValue(throwError(() => new Error('Erro ao carregar')));

      component.loadSummary();

      expect(component.summaryText).toBe('');
      expect(component.summaryError).toBe('Não foi possível carregar o resumo do documento.');
    });

    it('should set error when documentId is null', () => {
      component.documentId = null;
      component.loadSummary();

      expect(mockChatService.getSummary).not.toHaveBeenCalled();
      expect(component.summaryText).toBe('');
      expect(component.summaryError).toBe('ID do documento não encontrado.');
    });

    it('should reset summaryError before loading', () => {
      component.summaryError = 'Erro anterior';
      component.summaryText = 'Texto anterior';
      mockChatService.getSummary.and.returnValue(of('Novo resumo'));

      component.loadSummary();

      expect(component.summaryError).toBeNull();
      expect(component.summaryText).toBe('Novo resumo');
    });
  });

  describe('Summary Modal', () => {
    it('should open summary modal', () => {
      component.openSummaryModal();
      expect(component.showFullSummaryModal).toBeTrue();
    });

    it('should close summary modal', () => {
      component.showFullSummaryModal = true;
      component.closeSummaryModal();
      expect(component.showFullSummaryModal).toBeFalse();
    });
  });

  describe('Chat Fullscreen', () => {
    it('should toggle fullscreen on', () => {
      component.isChatFullscreen = false;
      component.toggleChatFullscreen();
      expect(component.isChatFullscreen).toBeTrue();
    });

    it('should toggle fullscreen off', () => {
      component.isChatFullscreen = true;
      component.toggleChatFullscreen();
      expect(component.isChatFullscreen).toBeFalse();
    });

    it('should scroll to bottom after toggle', (done) => {
      const scrollSpy = spyOn(component as any, 'scrollToBottom');
      component.toggleChatFullscreen();

      setTimeout(() => {
        expect(scrollSpy).toHaveBeenCalled();
        done();
      }, 10);
    });
  });

  describe('autoResize', () => {
    it('should set minimum height', () => {
      const mockTextarea = {
        style: { height: '' },
        scrollHeight: 30
      } as HTMLTextAreaElement;

      component.autoResize(mockTextarea);

      expect(mockTextarea.style.height).toBe('48px');
    });

    it('should set height based on scrollHeight up to max', () => {
      const mockTextarea = {
        style: { height: '' },
        scrollHeight: 100
      } as HTMLTextAreaElement;

      component.autoResize(mockTextarea);

      expect(mockTextarea.style.height).toBe('100px');
    });

    it('should cap height at maximum', () => {
      const mockTextarea = {
        style: { height: '' },
        scrollHeight: 200
      } as HTMLTextAreaElement;

      component.autoResize(mockTextarea);

      expect(mockTextarea.style.height).toBe('160px');
    });

    it('should scroll to bottom after resize', () => {
      const mockTextarea = {
        style: { height: '' },
        scrollHeight: 100
      } as HTMLTextAreaElement;

      const scrollSpy = spyOn(component as any, 'scrollToBottom');
      component.autoResize(mockTextarea);

      expect(scrollSpy).toHaveBeenCalledWith(false);
    });
  });

  describe('onEnter', () => {
    let mockEvent: KeyboardEvent;

    beforeEach(() => {
      component.documentId = mockDocumentId;
      component.newMessage = 'Test message';
      mockEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    });

    it('should not send message if shift is pressed', () => {
      const shiftEvent = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true });
      spyOn(component, 'sendMessage');

      component.onEnter(shiftEvent);

      expect(component.sendMessage).not.toHaveBeenCalled();
    });

    it('should prevent default and send message on Enter', () => {
      spyOn(component, 'sendMessage');
      spyOn(mockEvent, 'preventDefault');

      component.onEnter(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(component.sendMessage).toHaveBeenCalled();
    });

    it('should not send if message is empty', () => {
      component.newMessage = '   ';
      spyOn(component, 'sendMessage');

      component.onEnter(mockEvent);

      expect(component.sendMessage).not.toHaveBeenCalled();
    });

    it('should not send if isLoading', () => {
      component.isLoading = true;
      spyOn(component, 'sendMessage');

      component.onEnter(mockEvent);

      expect(component.sendMessage).not.toHaveBeenCalled();
    });

    it('should not send if documentId is null', () => {
      component.documentId = null;
      spyOn(component, 'sendMessage');

      component.onEnter(mockEvent);

      expect(component.sendMessage).not.toHaveBeenCalled();
    });
  });

  describe('sendMessage', () => {
    beforeEach(() => {
      component.documentId = mockDocumentId;
      component.ngOnInit();
    });

    it('should not send if message is empty', () => {
      component.newMessage = '';
      component.sendMessage();

      expect(mockChatService.getResponse).not.toHaveBeenCalled();
      expect(component.messages.length).toBe(1);
    });

    it('should not send if message is only whitespace', () => {
      component.newMessage = '   ';
      component.sendMessage();

      expect(mockChatService.getResponse).not.toHaveBeenCalled();
    });

    it('should not send if documentId is null', () => {
      component.documentId = null;
      component.newMessage = 'Test message';
      component.sendMessage();

      expect(mockChatService.getResponse).not.toHaveBeenCalled();
    });

    it('should send message successfully', () => {
      const userMessage = 'Qual é o resumo?';
      const mockResponse: ChatMessage = {
        sender: 'Montreal Bot',
        text: 'Este é o resumo do documento.'
      };

      component.newMessage = userMessage;
      mockChatService.getResponse.and.returnValue(of(mockResponse));

      component.sendMessage();

      expect(component.messages.length).toBe(3);
      expect(component.messages[1].sender).toBe('Você');
      expect(component.messages[1].text).toBe(userMessage);
      expect(component.messages[2]).toEqual(mockResponse);
      expect(component.newMessage).toBe('');
      expect(component.isLoading).toBeFalse();
    });

    it('should set isLoading while sending', () => {
      const userMessage = 'Test message';
      const responseSubject = new Subject<ChatMessage>();

      component.newMessage = userMessage;
      mockChatService.getResponse.and.returnValue(responseSubject.asObservable());

      component.sendMessage();

      expect(component.isLoading).toBeTrue();
      expect(component.messages.length).toBe(2);

      responseSubject.next({
        sender: 'Montreal Bot',
        text: 'Response'
      });
      responseSubject.complete();

      expect(component.isLoading).toBeFalse();
    });

    it('should handle send message error', () => {
      const userMessage = 'Test message';
      component.newMessage = userMessage;
      mockChatService.getResponse.and.returnValue(throwError(() => new Error('Erro')));

      component.sendMessage();

      expect(component.messages.length).toBe(3);
      expect(component.messages[2].sender).toBe('Montreal Bot');
      expect(component.messages[2].text).toBe(
        'Desculpe, ocorreu um erro ao processar sua pergunta. Por favor, tente novamente.'
      );
      expect(component.isLoading).toBeFalse();
    });

    it('should reset textarea height after sending', (done) => {
      const mockTextarea = {
        nativeElement: { style: { height: '100px' } }
      } as ElementRef<HTMLTextAreaElement>;
      component.messageInput = mockTextarea;

      component.newMessage = 'Test message';
      mockChatService.getResponse.and.returnValue(of({
        sender: 'Montreal Bot',
        text: 'Response'
      }));

      component.sendMessage();

      setTimeout(() => {
        expect(mockTextarea.nativeElement.style.height).toBe('48px');
        done();
      }, 10);
    });

    it('should scroll to bottom after sending', () => {
      const scrollSpy = spyOn(component as any, 'scrollToBottom');
      component.newMessage = 'Test message';
      mockChatService.getResponse.and.returnValue(of({
        sender: 'Montreal Bot',
        text: 'Response'
      }));

      component.sendMessage();

      expect(scrollSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('scrollToBottom', () => {
    it('should not scroll if messagesContainer is not available', () => {
      component['messagesContainer'] = undefined!;
      (component as any).scrollToBottom(true);

      expect(mockChangeDetectorRef.detectChanges).not.toHaveBeenCalled();
    });

    it('should scroll messages container to bottom', () => {
      const scrollSpy = jasmine.createSpy('scrollTo');

      const mockContainer = {
        nativeElement: {
          scrollTo: scrollSpy,
          scrollHeight: 1000
        }
      } as unknown as ElementRef<HTMLDivElement>;

      component['messagesContainer'] = mockContainer;

      (component as any).scrollToBottom(true);

      expect(mockChangeDetectorRef.detectChanges).toHaveBeenCalled();
      expect(scrollSpy).toHaveBeenCalledWith({
        top: 1000,
        behavior: 'smooth'
      });
    });
  });
  describe('ngAfterViewInit', () => {
    it('should scroll to bottom after view init and set textarea height', (done) => {
      const mockContainer = {
        nativeElement: {
          scrollTo: jasmine.createSpy('scrollTo'),
          scrollHeight: 500
        }
      } as unknown as ElementRef<HTMLDivElement>;
      component['messagesContainer'] = mockContainer;

      const mockTextarea = {
        nativeElement: { style: { height: '' } }
      } as ElementRef<HTMLTextAreaElement>;
      component.messageInput = mockTextarea;

      component.ngAfterViewInit();

      setTimeout(() => {
        expect(mockContainer.nativeElement.scrollTo).toHaveBeenCalled();
        expect(mockTextarea.nativeElement.style.height).toBe('48px');
        done();
      }, 10);
    });
  });

  describe('ngAfterViewChecked', () => {
    it('should be callable without errors', () => {
      expect(() => component.ngAfterViewChecked()).not.toThrow();
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete flow: load summary and send message', () => {
      const mockSummary = 'Resumo completo do documento';
      const mockResponse: ChatMessage = {
        sender: 'Montreal Bot',
        text: 'Resposta do bot'
      };

      mockChatService.getSummary.and.returnValue(of(mockSummary));
      mockChatService.getResponse.and.returnValue(of(mockResponse));

      component.ngOnInit();

      expect(component.summaryText).toBe(mockSummary);
      expect(component.messages.length).toBe(1);

      component.newMessage = 'Qual é o resumo?';
      component.sendMessage();

      expect(component.messages.length).toBe(3);
      expect(component.summaryText).toBe(mockSummary);
    });

    it('should handle error flow: summary fails then message succeeds', () => {
      mockChatService.getSummary.and.returnValue(throwError(() => new Error('Erro')));
      mockChatService.getResponse.and.returnValue(of({
        sender: 'Montreal Bot',
        text: 'Resposta'
      }));

      component.ngOnInit();

      expect(component.summaryError).toBeTruthy();
      expect(component.summaryText).toBe('');

      component.newMessage = 'Test';
      component.sendMessage();

      expect(component.messages.length).toBe(3);
    });
  });
});