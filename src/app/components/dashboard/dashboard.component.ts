import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatSortModule, Sort } from '@angular/material/sort';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DocumentDTO, translateDocumentStatus } from '../../models/document.model';
import { DocumentService } from '../../services/document.service';
import { FileTypePipe } from '../../pipes/file-type.pipe';

interface UiDocument {
  id: number;
  name: string;
  type: string;
  uploadDate: Date;
  status: string;
  icon: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatPaginatorModule,
    MatButtonModule,
    MatSortModule,
    RouterModule,
    FileTypePipe
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private documentService = inject(DocumentService);
  private destroyRef = inject(DestroyRef);

  selectedFilter: 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'PENDING' | undefined;
  documents: UiDocument[] = [];

  loading = false;
  page = 0;
  size = 10;
  totalElements = 0;
  sortField: string = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  ngOnInit(): void {
    this.fetchDocuments();
  }

  private fileTypeToIcon(fileType: string): string {
    const ft = (fileType || '').toLowerCase();
    if (ft.includes('pdf')) return 'picture_as_pdf';
    if (ft.includes('doc') || ft.includes('word')) return 'description';
    if (ft.includes('ppt') || ft.includes('presentation')) return 'slideshow';
    if (ft.includes('image') || ft.includes('png') || ft.includes('jpeg') || ft.includes('jpg')) return 'image';
    if (ft.includes('zip') || ft.includes('compressed')) return 'folder_zip';
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
    const status = this.selectedFilter;

    this.documentService
      .getDocuments(this.page, this.size, status, this.sortField, this.sortDirection)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (page) => {
          this.documents = page.content.map(d => this.dtoToUi(d));
          this.totalElements = page.totalElements;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  onFilterChange(filter?: 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'PENDING'): void {
    this.selectedFilter = filter;
    this.page = 0;
    this.fetchDocuments();
  }

  onSortChange(sort: Sort): void {
    const fieldMap: { [key: string]: string } = {
      type: 'fileType',
      uploadDate: 'createdAt'
    };

    if (sort.direction) {
      this.sortField = fieldMap[sort.active];
      this.sortDirection = sort.direction as 'asc' | 'desc';
    } else {
      this.sortField = 'createdAt';
      this.sortDirection = 'desc';
    }

    this.page = 0;
    this.fetchDocuments();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'COMPLETED':
        return 'status-badge status-pronto';
      case 'PROCESSING':
        return 'status-badge status-processando';
      case 'FAILED':
        return 'status-badge status-erro';
      default:
        return 'status-badge status-default';
    }
  }

  translateStatus(status: string): string {
    return translateDocumentStatus(status);
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex;
    this.size = event.pageSize;
    this.fetchDocuments();
  }

  isChatAvailable(status:string) : boolean {
    return status == 'COMPLETED';
  }
}