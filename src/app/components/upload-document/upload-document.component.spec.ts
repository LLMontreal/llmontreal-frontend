import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { Subject } from 'rxjs';
import { UploadDocumentComponent } from './upload-document.component';
import { DocumentService } from '../../services/document.service';

function createMockFile(name: string, size: number, type: string): File {
  return new File([new Blob(['x'.repeat(size)], { type })], name, { type });
}

function createMockDragEvent(files: File[]): DragEvent {
  const dataTransfer = new DataTransfer();
  files.forEach((f) => dataTransfer.items.add(f));

  return {
    preventDefault: () => {},
    dataTransfer,
  } as DragEvent;
}

describe('UploadDocumentComponent', () => {
  let component: UploadDocumentComponent;
  let fixture: ComponentFixture<UploadDocumentComponent>;
  let documentService: jasmine.SpyObj<DocumentService>;
  let uploadSubject: Subject<HttpEvent<any>>;

  const mockFilePDF = createMockFile('doc.pdf', 1024, 'application/pdf');
  const mockFileLarge = createMockFile(
    'big.pdf',
    30 * 1024 * 1024,
    'application/pdf'
  );
  const mockFileInvalid = createMockFile(
    'virus.exe',
    1024,
    'application/x-msdownload'
  );

  beforeEach(async () => {
    uploadSubject = new Subject<HttpEvent<any>>();

    const documentSpy = jasmine.createSpyObj('DocumentService', [
      'uploadDocument',
    ]);
    documentSpy.uploadDocument.and.returnValue(uploadSubject.asObservable());

    await TestBed.configureTestingModule({
      imports: [CommonModule, UploadDocumentComponent],
      providers: [{ provide: DocumentService, useValue: documentSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadDocumentComponent);
    component = fixture.componentInstance;

    documentService = TestBed.inject(
      DocumentService
    ) as jasmine.SpyObj<DocumentService>;

    fixture.detectChanges();
  });

  //INITIAL STATE
  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should start with correct initial state', () => {
    expect(component.status).toBe('IDLE');
    expect(component.progress).toBe(0);
    expect(component.selectedFile).toBeUndefined();
  });

  //VALIDATION
  describe('File Validation', () => {
    it('should reject invalid file type', () => {
      component.onFileSelected({ target: { files: [mockFileInvalid] } } as any);

      expect(component.status).toBe('ERROR');
      expect(component.statusMessage).toContain('inválido');
      expect(documentService.uploadDocument).not.toHaveBeenCalled();
    });

    it('should reject file above max size', () => {
      component.onFileSelected({ target: { files: [mockFileLarge] } } as any);

      expect(component.status).toBe('ERROR');
      expect(component.statusMessage).toContain('25MB');
      expect(documentService.uploadDocument).not.toHaveBeenCalled();
    });

    it('should reset input.value after selecting a file', () => {
      const mockInput = { files: [mockFilePDF], value: 'x' };
      component.onFileSelected({ target: mockInput } as any);

      expect(mockInput.value).toBe('');
    });

    it('should call uploadFile for valid file', () => {
      spyOn(component, 'uploadFile').and.callThrough();

      component.onFileSelected({ target: { files: [mockFilePDF] } } as any);

      expect(component.uploadFile).toHaveBeenCalled();
      expect(component.status).toBe('UPLOADING');
    });
  });

  //DRAG & DROP
  describe('Drag and Drop', () => {
    it('should set isDragging true on dragover', () => {
      component.onDragOver(new DragEvent('dragover'));
      expect(component.isDragging).toBeTrue();
    });

    it('should set isDragging false on dragleave', () => {
      component.isDragging = true;
      component.onDragLeave(new DragEvent('dragleave'));
      expect(component.isDragging).toBeFalse();
    });

    it('should handle drag drop with valid file', () => {
      spyOn(component, 'uploadFile').and.callThrough();
      const evt = createMockDragEvent([mockFilePDF]);

      component.onFileDrop(evt);

      expect(component.uploadFile).toHaveBeenCalled();
      expect(component.status).toBe('UPLOADING');
    });

    it('should handle drag drop with invalid file', () => {
      const evt = createMockDragEvent([mockFileInvalid]);
      component.onFileDrop(evt);

      expect(component.status).toBe('ERROR');
      expect(documentService.uploadDocument).not.toHaveBeenCalled();
    });

    it('should ignore drop if no files provided', () => {
      const evt = createMockDragEvent([]);
      component.onFileDrop(evt);

      expect(component.status).toBe('IDLE');
    });
  });

  //UPLOAD PROCESS
  describe('Upload Process', () => {
    beforeEach(() => {
      component.selectedFile = mockFilePDF;
      component.uploadFile();
    });

    it('should call documentService and set UPLOADING', () => {
      expect(documentService.uploadDocument).toHaveBeenCalledWith(mockFilePDF);
      expect(component.status).toBe('UPLOADING');
    });

    it('should update progress (with total)', () => {
      uploadSubject.next({
        type: HttpEventType.UploadProgress,
        loaded: 512,
        total: 1024,
      });

      expect(component.progress).toBe(50);
    });

    it('should update progress (without total)', () => {
      uploadSubject.next({
        type: HttpEventType.UploadProgress,
        loaded: 512,
        total: undefined,
      });

      expect(component.progress).toBe(50);
    });

    it('should set SUCCESS and reset state after response', () => {
      uploadSubject.next(new HttpResponse({ status: 200, body: { ok: true } }));
      uploadSubject.complete();

      expect(component.status).toBe('SUCCESS');
      expect(component.progress).toBe(100);
      expect(component.selectedFile).toBeUndefined();
    });

    it('should set ERROR on upload failure', () => {
      uploadSubject.error({ status: 500 });

      expect(component.status).toBe('ERROR');
      expect(component.selectedFile).toBeUndefined();
      expect(component.progress).toBe(0);
    });
  });

  //CANCEL
  describe('Cancel Upload', () => {
    it('should cancel and unsubscribe', () => {
      component.selectedFile = mockFilePDF;
      component.uploadFile();

      const sub = component.uploadSub!;
      spyOn(sub, 'unsubscribe').and.callThrough();

      component.cancelUpload();

      expect(sub.unsubscribe).toHaveBeenCalled();
      expect(component.status).toBe('CANCELLED');
      expect(component.uploadSub).toBeUndefined();
    });
  });

  // DESTROY
  describe('ngOnDestroy', () => {
    it('should unsubscribe on destroy', () => {
      component.selectedFile = mockFilePDF;
      component.uploadFile();

      const sub = component.uploadSub!;
      spyOn(sub, 'unsubscribe').and.callThrough();

      component.ngOnDestroy();

      expect(sub.unsubscribe).toHaveBeenCalled();
    });
  });
});
