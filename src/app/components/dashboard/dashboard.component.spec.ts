import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { RouterTestingModule } from '@angular/router/testing';
import { DocumentService } from '../../services/document.service';
import { DocumentDTO, Page } from '../../models/document.model';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockDocumentService: jasmine.SpyObj<DocumentService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('DocumentService', ['getDocuments']);

    await TestBed.configureTestingModule({
      imports: [CommonModule, MatIconModule, MatPaginatorModule, MatButtonModule, RouterTestingModule, DashboardComponent],
      providers: [{ provide: DocumentService, useValue: spy }]
    }).compileComponents();

    mockDocumentService = TestBed.inject(DocumentService) as jasmine.SpyObj<DocumentService>;

    // prepare fake page
    const fakePage: Page<DocumentDTO> = {
      content: [
        { id: 1, status: 'COMPLETED' as any, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), fileName: 'file.pdf', fileType: 'application/pdf', summary: null }
      ],
      totalPages: 1,
      totalElements: 1,
      size: 10,
      number: 0,
      numberOfElements: 1,
      first: true,
      last: true,
      empty: false
    };

    mockDocumentService.getDocuments.and.returnValue(of(fakePage));

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load documents on init using DocumentService', () => {
    expect(mockDocumentService.getDocuments).toHaveBeenCalled();
    expect(component.documents.length).toBeGreaterThan(0);
    expect(component.totalElements).toBeGreaterThanOrEqual(1);
  });

  it('fileTypeToIcon should map pdf to picture_as_pdf', () => {
    const icon = (component as any).fileTypeToIcon('application/pdf');
    expect(icon).toBe('picture_as_pdf');
  });
});
