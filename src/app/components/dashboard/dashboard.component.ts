import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { DocumentDTO, DocumentStatus } from '../../models/document.model';
import { DocumentService } from '../../services/document.service';

interface UiDocument {
  name: string;
  type: string;
  uploadDate: string;
  status: 'Pronto' | 'Processando' | 'Erro' | 'Pendente';
  icon: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatPaginatorModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  selectedFilter = 'Todos';

  documents: UiDocument[] = [];
  loading = false;
  page = 0;
  size = 10;
  totalElements = 0;

  constructor(private documentService: DocumentService) {}

  ngOnInit(): void {
    this.fetchDocuments();
  }

  private mapStatusToLabel(status: DocumentStatus | string): UiDocument['status'] {
    switch (status) {
      case DocumentStatus.COMPLETED:
        return 'Pronto';
      case DocumentStatus.PROCESSING:
        return 'Processando';
      case DocumentStatus.FAILED:
        return 'Erro';
      case DocumentStatus.PENDING:
      default:
        return 'Pendente';
    }
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
      name: dto.fileName,
      type: dto.fileType,
      uploadDate: dto.createdAt ? new Date(dto.createdAt).toLocaleDateString() : '',
      status: this.mapStatusToLabel(dto.status),
      icon: this.fileTypeToIcon(dto.fileType)
    };
  }

  fetchDocuments() {
    this.loading = true;
    const status = this.selectedFilter === 'Todos' ? null : this.filterToStatus(this.selectedFilter);
    this.documentService.getDocuments(this.page, this.size, status).subscribe({
      next: (page) => {
        this.documents = page.content.map(d => this.dtoToUi(d));
        this.totalElements = page.totalElements;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar documentos', err);
        this.documents = [];
        this.loading = false;
      }
    });
  }

  onFilterChange(filter: string) {
    this.selectedFilter = filter;
    this.page = 0;
    this.fetchDocuments();
  }

  onUpload() {
  }

  onViewDetails(document: UiDocument) {
  }

  private filterToStatus(filter: string): DocumentStatus | null {
    switch (filter) {
      case 'Pronto':
        return DocumentStatus.COMPLETED;
      case 'Processando':
        return DocumentStatus.PROCESSING;
      case 'Erro':
        return DocumentStatus.FAILED;
      case 'Todos':
      default:
        return null;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Pronto':
        return 'status-badge status-pronto';
      case 'Processando':
        return 'status-badge status-processando';
      case 'Erro':
        return 'status-badge status-erro';
      default:
        return 'status-badge status-default';
    }
  }

  onPageChange(event: PageEvent) {
    this.page = event.pageIndex;
    this.size = event.pageSize;
    this.fetchDocuments();
  }
}
