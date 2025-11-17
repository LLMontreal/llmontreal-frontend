import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DocSummaryChatComponent } from './doc-summary-chat.component';
import { ChatService } from '../../services/chat.service';
import { ChangeDetectorRef, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of, throwError, Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ChatMessage } from '@shared/models/chat-message';

describe('DocSummaryChatComponent', () => {
  let component: DocSummaryChatComponent;
  let fixture: ComponentFixture<DocSummaryChatComponent>;
  let chatServiceSpy: jasmine.SpyObj<ChatService>;
  let mockCdr: jasmine.SpyObj<ChangeDetectorRef>;
  let mockActivatedRoute: any;

  const mockDocumentId = 'doc-123';

  beforeEach(async () => {
    chatServiceSpy = jasmine.createSpyObj('ChatService', ['getSummary', 'getResponse']);
    mockCdr = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue(mockDocumentId)
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, MatIconModule, DocSummaryChatComponent],
      providers: [
        { provide: ChatService, useValue: chatServiceSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: ChangeDetectorRef, useValue: mockCdr }
      ]
    }).compileComponents();

    chatServiceSpy.getSummary.and.returnValue(of('Resumo do documento teste'));

    fixture = TestBed.createComponent(DocSummaryChatComponent);
    component = fixture.componentInstance;
    (component as any).cdr = mockCdr;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have correct initial state after init', () => {
    expect(component.messages).toBeDefined();
    expect(component.newMessage).toEqual('');
    expect(component.isLoading).toBeFalse();
    expect(component.isChatFullscreen).toBeFalse();
    expect(component.summaryText).toBeDefined();
    expect(component.summaryError).toBeNull();
    expect(component.showFullSummaryModal).toBeFalse();
  });

  describe('ngOnInit and loadSummary', () => {
    it('should read document id from route and load summary', () => {
      expect(mockActivatedRoute.snapshot.paramMap.get).toHaveBeenCalledWith('id');
      expect(chatServiceSpy.getSummary).toHaveBeenCalledWith(mockDocumentId);
      expect(component.summaryText).toBe('Resumo do documento teste');
    });

    it('should set summaryError when getSummary fails', () => {
      chatServiceSpy.getSummary.and.returnValue(throwError(() => new Error('Erro')));
      component.documentId = mockDocumentId;
      component.loadSummary();

      expect(component.summaryText).toBe('');
      expect(component.summaryError).toBe('Não foi possível carregar o resumo do documento.');
    });

    it('should set error when documentId is null', () => {
      chatServiceSpy.getSummary.calls.reset();

      component.documentId = null;
      component.loadSummary();

      expect(chatServiceSpy.getSummary).not.toHaveBeenCalled();
      expect(component.summaryText).toBe('');
      expect(component.summaryError).toBe('ID do documento não encontrado.');
    });

    it('should reset previous summaryError before requesting a new summary', () => {
      component.documentId = mockDocumentId;
      component.summaryError = 'Erro anterior';
      chatServiceSpy.getSummary.and.returnValue(of('Novo resumo'));

      component.loadSummary();

      expect(component.summaryError).toBeNull();
      expect(component.summaryText).toBe('Novo resumo');
    });
  });

  describe('Summary modal', () => {
    it('openSummaryModal should set flag true', () => {
      component.openSummaryModal();
      expect(component.showFullSummaryModal).toBeTrue();
    });

    it('closeSummaryModal should set flag false', () => {
      component.showFullSummaryModal = true;
      component.closeSummaryModal();
      expect(component.showFullSummaryModal).toBeFalse();
    });

    it('modal state shows error when summaryError is set (state-only)', () => {
      component.summaryError = 'Algo deu errado';
      component.openSummaryModal();
      expect(component.showFullSummaryModal).toBeTrue();
      expect(component.summaryError).toBe('Algo deu errado');
    });
  });

  describe('toggleChatFullscreen', () => {
    it('should toggle fullscreen mode and call scrollToBottom via setTimeout', fakeAsync(() => {
      const spyScroll = spyOn<any>(component, 'scrollToBottom');
      component.isChatFullscreen = false;

      component.toggleChatFullscreen();
      tick(0);

      expect(component.isChatFullscreen).toBeTrue();
      expect(spyScroll).toHaveBeenCalledWith(false);
    }));

    it('toggling twice returns to original state', fakeAsync(() => {
      component.isChatFullscreen = false;
      component.toggleChatFullscreen();
      tick(0);
      component.toggleChatFullscreen();
      tick(0);
      expect(component.isChatFullscreen).toBeFalse();
    }));
  });

  describe('autoResize', () => {
    it('should set minimum height (when scrollHeight < min)', () => {
      const mockTextarea: any = {
        style: { height: '' },
        scrollHeight: 30
      };
      component.autoResize(mockTextarea as HTMLTextAreaElement);
      expect(mockTextarea.style.height).toBe('30px');
    });

    it('should set to scrollHeight if between min and max', () => {
      const mockTextarea: any = {
        style: { height: '' },
        scrollHeight: 100
      };

      component.autoResize(mockTextarea as HTMLTextAreaElement);
      expect(mockTextarea.style.height).toBe('100px');
    });

    it('should cap height at maximum', () => {
      const mockTextarea: any = {
        style: { height: '' },
        scrollHeight: 500
      };

      component.autoResize(mockTextarea as HTMLTextAreaElement);
      expect(mockTextarea.style.height).toBe('160px');
    });

    it('should call scrollToBottom(false) after resizing', () => {
      const mockTextarea: any = {
        style: { height: '' },
        scrollHeight: 120
      };

      const spyScroll = spyOn<any>(component, 'scrollToBottom');
      component.autoResize(mockTextarea as HTMLTextAreaElement);
      expect(spyScroll).toHaveBeenCalledWith(false);
    });
  });

  describe('onEnter', () => {
    let enterEvent: KeyboardEvent;
    beforeEach(() => {
      component.documentId = mockDocumentId;
      component.newMessage = 'Teste';
      enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    });

    it('should not send message when Shift+Enter is pressed', () => {
      const shiftEvent = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true });
      const spySend = spyOn(component, 'sendMessage');
      component.onEnter(shiftEvent as any);
      expect(spySend).not.toHaveBeenCalled();
    });

    it('should prevent default and call sendMessage on Enter', () => {
      const spySend = spyOn(component, 'sendMessage');
      const preventSpy = spyOn(enterEvent, 'preventDefault');
      component.onEnter(enterEvent as any);
      expect(preventSpy).toHaveBeenCalled();
      expect(spySend).toHaveBeenCalled();
    });

    it('should not send if message is empty or whitespace', () => {
      component.newMessage = '   ';
      const spySend = spyOn(component, 'sendMessage');
      component.onEnter(enterEvent as any);
      expect(spySend).not.toHaveBeenCalled();
    });

    it('should not send if loading or no documentId', () => {
      component.isLoading = true;
      const spySend = spyOn(component, 'sendMessage');
      component.onEnter(enterEvent as any);
      expect(spySend).not.toHaveBeenCalled();

      component.isLoading = false;
      component.documentId = null;
      component.newMessage = 'ok';
      component.onEnter(enterEvent as any);
      expect(spySend).not.toHaveBeenCalled();
    });
  });

  describe('sendMessage', () => {
    beforeEach(() => {
      component.documentId = mockDocumentId;
      component.messages = [{
        sender: 'Montreal Bot',
        text: 'Olá! Faça uma pergunta sobre o documento para começar.'
      }];
    });

    it('should not send if newMessage is empty or whitespace', () => {
      component.newMessage = '';
      component.sendMessage();
      expect(chatServiceSpy.getResponse).not.toHaveBeenCalled();
      expect(component.messages.length).toBe(1);

      component.newMessage = '   ';
      component.sendMessage();
      expect(chatServiceSpy.getResponse).not.toHaveBeenCalled();
    });

    it('should push user message and receive IA response (sync Observable)', fakeAsync(() => {
      const userMsg = 'Qual é o resumo?';
      const iaResponse: ChatMessage = { sender: 'Montreal Bot', text: 'Aqui está o resumo' };

      chatServiceSpy.getResponse.and.returnValue(of(iaResponse));

      component.newMessage = userMsg;
      component.sendMessage();
      tick();
      expect(component.messages.length).toBe(3);
      expect(component.messages[1].sender).toBe('Você');
      expect(component.messages[1].text).toBe(userMsg);
      expect(component.messages[2]).toEqual(iaResponse);
      expect(component.isLoading).toBeFalse();
      expect(component.newMessage).toBe('');
    }));

    it('should set isLoading true while awaiting response (Observable via Subject)', fakeAsync(() => {
      const subj = new Subject<ChatMessage>();
      chatServiceSpy.getResponse.and.returnValue(subj.asObservable());

      component.newMessage = 'msg';
      component.sendMessage();

      expect(component.isLoading).toBeTrue();
      expect(component.messages.length).toBe(2);

      subj.next({ sender: 'Montreal Bot', text: 'Resposta' });
      subj.complete();
      tick();

      expect(component.isLoading).toBeFalse();
      expect(component.messages.length).toBe(3);
    }));

    it('should handle getResponse error and push error bot message', fakeAsync(() => {
      chatServiceSpy.getResponse.and.returnValue(throwError(() => new Error('erro')));

      component.newMessage = 'erro';
      component.sendMessage();
      tick();

      const last = component.messages[component.messages.length - 1];
      expect(last.sender).toBe('Montreal Bot');
      expect(last.text).toContain('Desculpe, ocorreu um erro');
      expect(component.isLoading).toBeFalse();
    }));

    it('should reset textarea height after sending (via setTimeout)', fakeAsync(() => {
      const mockTextarea: any = {
        nativeElement: { style: { height: '100px' } }
      };
      component.messageInput = mockTextarea as ElementRef<HTMLTextAreaElement>;

      chatServiceSpy.getResponse.and.returnValue(of({ sender: 'Montreal Bot', text: 'OK' }));

      component.newMessage = 'z';
      component.sendMessage();
      tick(0);

      expect(mockTextarea.nativeElement.style.height).toBe('48px');
    }));

    it('should call scrollToBottom twice (before and after response)', fakeAsync(() => {
      const spyScroll = spyOn<any>(component, 'scrollToBottom');
      chatServiceSpy.getResponse.and.returnValue(of({ sender: 'Montreal Bot', text: 'OK' }));

      component.newMessage = 'x';
      component.sendMessage();
      tick();
      expect(spyScroll).toHaveBeenCalledTimes(2);
    }));
  });

  describe('scrollToBottom low-level', () => {
    it('should not call detectChanges when messagesContainer is not set', () => {
      (component as any).messagesContainer = undefined;
      (component as any).scrollToBottom(true);
      expect(mockCdr.detectChanges).not.toHaveBeenCalled();
    });

    it('should call detectChanges and scroll when messagesContainer is present', () => {
      const scrollSpy = jasmine.createSpy('scrollTo');
      const mockContainer = {
        nativeElement: {
          scrollTo: scrollSpy,
          scrollHeight: 1000,
          clientHeight: 200
        }
      } as unknown as ElementRef<HTMLDivElement>;

      (component as any).messagesContainer = mockContainer;

      (component as any).scrollToBottom(true);

      expect(mockCdr.detectChanges).toHaveBeenCalled();
      expect(scrollSpy).toHaveBeenCalledWith({
        top: 1000,
        behavior: 'smooth'
      });
    });
  });

  describe('ngAfterViewInit behaviour', () => {
    it('should call scrollToBottom and set textarea height in setTimeout', fakeAsync(() => {
      const scrollSpy = jasmine.createSpy('scrollTo');
      const mockContainer = {
        nativeElement: {
          scrollTo: scrollSpy,
          scrollHeight: 500,
          clientHeight: 200
        }
      } as unknown as ElementRef<HTMLDivElement>;

      (component as any).messagesContainer = mockContainer;

      const mockTextarea: any = {
        nativeElement: { style: { height: '' }, scrollHeight: 30 }
      };
      component.messageInput = mockTextarea as ElementRef<HTMLTextAreaElement>;
      component.ngAfterViewInit();
      tick(0);
      expect(scrollSpy).toHaveBeenCalled();
      expect(mockTextarea.nativeElement.style.height).toBe('48px');
    }));
  });

  it('ngAfterViewChecked should not throw', () => {
    expect(() => component.ngAfterViewChecked()).not.toThrow();
  });

  describe('integration flows', () => {
    it('should load summary then send a question and get response', fakeAsync(() => {
      chatServiceSpy.getSummary.calls.reset();
      chatServiceSpy.getSummary.and.returnValue(of('Resumo integrado'));
      chatServiceSpy.getResponse.and.returnValue(of({ sender: 'Montreal Bot', text: 'Resposta integrada' }));
      component.loadSummary();
      tick();

      expect(component.summaryText).toBe('Resumo integrado');

      component.messages = [{
        sender: 'Montreal Bot',
        text: 'Olá! Faça uma pergunta sobre o documento para começar.'
      }];

      component.newMessage = 'Qual é o resumo?';
      component.sendMessage();
      tick();
      expect(component.messages.length).toBe(3);
      expect(component.messages[2].text).toBe('Resposta integrada');
    }));

    it('should handle summary error then allow sending a message', fakeAsync(() => {
      chatServiceSpy.getSummary.calls.reset();
      chatServiceSpy.getSummary.and.returnValue(throwError(() => new Error('err')));
      chatServiceSpy.getResponse.and.returnValue(of({ sender: 'Montreal Bot', text: 'Ok' }));

      component.loadSummary();
      tick();

      expect(component.summaryError).toBeTruthy();
      expect(component.summaryText).toBe('');
      component.messages = [{
        sender: 'Montreal Bot',
        text: 'Olá! Faça uma pergunta sobre o documento para começar.'
      }];

      component.newMessage = 'Test';
      component.sendMessage();
      tick();

      expect(component.messages.length).toBe(3);
    }));
  });
});
