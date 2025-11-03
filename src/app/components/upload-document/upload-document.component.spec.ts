import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { Subject, of, throwError } from 'rxjs';

import { UploadDocumentComponent } from './upload-document.component';
import { DocumentService } from '../../services/document.service';

// Helper para criar um arquivo mock
function createMockFile(name: string, size: number, type: string): File {
  const blob = new Blob(['a'.repeat(size)], { type });
  return new File([blob], name, { type });
}

// Helper para criar um mock de DragEvent
function createMockDragEvent(files: File[]): DragEvent {
  // base do objeto FileList
  const fileListLikeObject = {
    length: files.length,
    item: (index: number) => files[index],
  };
  
  // 2. Copiamos as propriedades indexadas (0, 1, ...) do array para o nosso objeto
  Object.assign(fileListLikeObject, files);

  return {
    preventDefault: () => {},
    dataTransfer: {
      files: fileListLikeObject as any, // Usamos o objeto construído
    },
  } as any;
}

describe('UploadDocumentComponent', () => {
  let component: UploadDocumentComponent;
  let fixture: ComponentFixture<UploadDocumentComponent>;
  let documentService: jasmine.SpyObj<DocumentService>;
  
  let uploadSubject: Subject<HttpEvent<any>>;

  const mockFilePDF = createMockFile('documento.pdf', 1024, 'application/pdf');
  const mockFileLarge = createMockFile('grande.pdf', 30 * 1024 * 1024, 'application/pdf'); // 30MB
  const mockFileInvalid = createMockFile('script.zip', 1024, 'application/zip');

  beforeEach(async () => {
    const documentServiceSpy = jasmine.createSpyObj('DocumentService', ['uploadDocument']);
    uploadSubject = new Subject<HttpEvent<any>>();

    await TestBed.configureTestingModule({
      imports: [CommonModule, UploadDocumentComponent],
      providers: [
        { provide: DocumentService, useValue: documentServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadDocumentComponent);
    component = fixture.componentInstance;
    documentService = TestBed.inject(DocumentService) as jasmine.SpyObj<DocumentService>;
    documentService.uploadDocument.and.returnValue(uploadSubject.asObservable());

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have correct initial state', () => {
    expect(component.status).toBe('IDLE');
    expect(component.progress).toBe(0);
    expect(component.selectedFile).toBeUndefined();
    expect(component.isDragging).toBeFalse();
  });

  //Testes de Validação

  describe('File Validation', () => {
    
    it('should set ERROR status if file type is invalid', () => {
      component.onFileSelected({
        target: { files: [mockFileInvalid] },
      } as any);

      expect(component.status).toBe('ERROR');
      expect(component.statusMessage).toContain('Tipo de arquivo inválido');
      expect(documentService.uploadDocument).not.toHaveBeenCalled();
    });

    it('should set ERROR status if file size is too large', () => {
      component.onFileSelected({ // Corrigido
        target: { files: [mockFileLarge] },
      } as any);

      expect(component.status).toBe('ERROR');
      expect(component.statusMessage).toContain('ultrapassa o limite de 25MB');
      expect(documentService.uploadDocument).not.toHaveBeenCalled();
    });

    it('should call uploadFile when file is valid', () => {
  spyOn(component, 'uploadFile').and.callThrough();

  component.onFileSelected({ target: { files: [mockFilePDF] } } as any);

  expect(component.selectedFile).toBe(mockFilePDF);
  expect(component.uploadFile).toHaveBeenCalled();
  expect(component.status).toBe('UPLOADING'); 
});

  });

  //Testes de Drag & Drop

  describe('Drag and Drop Events', () => {
    it('onDragOver should set isDragging to true', () => {
      component.onDragOver(new DragEvent('dragover'));
      expect(component.isDragging).toBeTrue();
    });

    it('onDragLeave should set isDragging to false', () => {
      component.isDragging = true;
      component.onDragLeave(new DragEvent('dragleave'));
      expect(component.isDragging).toBeFalse();
    });

    it('onFileDrop should handle valid file', () => {
      spyOn(component, 'uploadFile').and.callThrough(); // Espionando uploadFile
      const mockEvent = createMockDragEvent([mockFilePDF]);

      component.onFileDrop(mockEvent);

      expect(component.isDragging).toBeFalse();
      expect(component.uploadFile).toHaveBeenCalled(); // Verifica se o upload foi chamado
      expect(component.status).toBe('UPLOADING'); // Status deve mudar para UPLOADING
    });

    it('onFileDrop should handle invalid file and set ERROR', () => {
      const mockEvent = createMockDragEvent([mockFileInvalid]);
      component.onFileDrop(mockEvent);

      expect(component.status).toBe('ERROR');
      expect(documentService.uploadDocument).not.toHaveBeenCalled();
    });
  });

  //Testes do Processo de Upload 

  describe('Upload Process (uploadFile)', () => {
    
    beforeEach(() => {
      // Simula a seleção de um arquivo válido, que chama uploadFile()
      component.onFileSelected({ target: { files: [mockFilePDF] } } as any);
    });

    it('should set UPLOADING status and call service on uploadFile', () => {
      expect(component.status).toBe('UPLOADING');
      expect(component.progress).toBe(0);
      expect(documentService.uploadDocument).toHaveBeenCalledWith(mockFilePDF);
    });

    it('should update progress on UploadProgress event', () => {
      uploadSubject.next({
        type: HttpEventType.UploadProgress,
        loaded: 512,
        total: 1024,
      });

      expect(component.progress).toBe(50);
      expect(component.status).toBe('UPLOADING');
    });

    it('should set SUCCESS status on Response event', () => {
      const mockResponse = new HttpResponse({
        status: 200,
        body: { id: 1, message: 'Sucesso' },
      });
      uploadSubject.next(mockResponse);
      uploadSubject.complete();

      expect(component.progress).toBe(100);
      expect(component.status).toBe('SUCCESS');
      expect(component.statusMessage).toContain('sucesso');
      expect(component.selectedFile).toBeUndefined();
    });

    it('should set ERROR status when service throws error', () => {
      const errorResponse = { status: 500, statusText: 'Server Error' };
      uploadSubject.error(errorResponse);

      expect(component.status).toBe('ERROR');
      expect(component.statusMessage).toContain('Ocorreu um erro');
      expect(component.progress).toBe(0);
      expect(component.selectedFile).toBeUndefined();
    });
  });

  //Teste de Cancelamento

  describe('Cancel Upload', () => {
    it('should set CANCELLED status and unsubscribe', () => {
      component.onFileSelected({ target: { files: [mockFilePDF] } } as any);
      
      const subscription = component.uploadSub;
      spyOn(subscription!, 'unsubscribe').and.callThrough();

      expect(component.status).toBe('UPLOADING');
      
      component.cancelUpload();

      expect(component.status).toBe('CANCELLED');
      expect(component.statusMessage).toContain('cancelado');
      expect(component.selectedFile).toBeUndefined();
      expect(component.progress).toBe(0);
      expect(subscription!.unsubscribe).toHaveBeenCalled();
      expect(component.uploadSub).toBeUndefined();
    });
  });
});