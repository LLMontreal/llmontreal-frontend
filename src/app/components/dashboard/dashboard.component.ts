import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
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
  imports: [CommonModule, MatIconModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  selectedFilter: string = 'Todos';

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
        return 'Pendente';
      default:
        // in case backend sends localized or unknown values, treat as pending
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
    // routing handled by navbar; keep placeholder if you want to open a dialog
  }

  onViewDetails(document: UiDocument) {
    // TODO: implement navigation to details page if exists
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

  getStatusColor(status: string): string {
    switch (status) {
      case 'Pronto':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Processando':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Erro':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  }
}
