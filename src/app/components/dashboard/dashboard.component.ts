import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DocumentDTO, DocumentStatus } from '../../models/document.model';
import { DocumentService } from '../../services/document.service';
import { FileTypePipe } from '../../pipes/file-type.pipe';

interface UiDocument {
  id: number;
  name: string;
  type: string;
  uploadDate: Date;
  status: DocumentStatus;
  icon: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatPaginatorModule, MatButtonModule, RouterModule, FileTypePipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private documentService = inject(DocumentService);
  private destroyRef = inject(DestroyRef);

  selectedFilter: string = 'Todos';
  documents: UiDocument[] = [];
  
  loading = false;
  page = 0;
  size = 10;
  totalElements = 0;

  ngOnInit(): void {
    this.fetchDocuments();
  }

  private fileTypeToIcon(fileType: string): string {
    const ft = (fileType || '').toLowerCase();
    if (ft.includes('pdf')) return 'picture_as_pdf';
    if (ft.includes('doc') || ft.includes('word')) return 'description';
    if (ft.includes('ppt') || ft.includes('presentation')) return 'slideshow';
    return 'insert_drive_file';
  }

  private dtoToUi(dto: DocumentDTO): UiDocument {
    return {
      id: dto.id,
      name: dto.fileName,
      type: dto.fileType,
      uploadDate: new Date(dto.createdAt), 
      status: dto.status,
      icon: this.fileTypeToIcon(dto.fileType)
    };
  }

  fetchDocuments(): void {
    this.loading = true;
    const status = this.selectedFilter === 'Todos' ? null : this.filterToStatus(this.selectedFilter);

    this.documentService.getDocuments(this.page, this.size, status)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (page) => {
          this.documents = page.content.map(d => this.dtoToUi(d));
          this.totalElements = page.totalElements;
          this.loading = false;
        },
        error: (err) => {
          this.documents = [];
          this.loading = false;
        }
      });

  }

  onFilterChange(filter: string): void {
    this.selectedFilter = filter;
    this.page = 0;
    this.fetchDocuments();
  }

  private filterToStatus(filter: string): DocumentStatus | null {
    switch (filter) {
      case 'Pronto':
        return DocumentStatus.COMPLETED;
      case 'Processando':
        return DocumentStatus.PROCESSING;
      case 'Erro':
        return DocumentStatus.FAILED;
      default:
        return null;
    }
  }

  getStatusClass(status: DocumentStatus): string {
    switch (status) {
      case DocumentStatus.COMPLETED:
        return 'status-badge status-pronto';
      case DocumentStatus.PROCESSING:
        return 'status-badge status-processando';
      case DocumentStatus.FAILED:
        return 'status-badge status-erro';
      default:
        return 'status-badge status-default';
    }
  }

  trackByDocument(index: number, item: UiDocument): number {
    return item.id;
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex;
    this.size = event.pageSize;
    this.fetchDocuments();
  }
}
