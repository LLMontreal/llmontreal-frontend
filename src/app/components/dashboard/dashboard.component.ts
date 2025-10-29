import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

interface Document {
  name: string;
  type: string;
  uploadDate: string;
  status: 'Pronto' | 'Processando' | 'Erro';
  icon: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  selectedFilter: string = 'Todos';

  documents: Document[] = [
    {
      name: 'relatorio_anual.pdf',
      type: 'PDF',
      uploadDate: '25/10/2023',
      status: 'Pronto',
      icon: 'picture_as_pdf'
    },
    {
      name: 'contrato_venda.docx',
      type: 'DOCX',
      uploadDate: '24/10/2023',
      status: 'Processando',
      icon: 'description'
    },
    {
      name: 'apresentacao_q3.pptx',
      type: 'PPTX',
      uploadDate: '23/10/2023',
      status: 'Erro',
      icon: 'slideshow'
    }
  ];

  onFilterChange(filter: string) {
    this.selectedFilter = filter;
    // TODO: Implement filter logic
  }

  onUpload() {
    // TODO: Implement upload functionality
  }

  onViewDetails(document: Document) {
    // TODO: Implement view details functionality
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
