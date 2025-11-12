export interface DocumentDTO {
  id: number;
  fileName: string;
  fileType: string;
  createdAt: string;
  status: string;
}

export function translateDocumentStatus(status: string): string {
  switch ((status || '').toUpperCase()) {
    case 'COMPLETED':
      return 'Pronto';
    case 'PROCESSING':
      return 'Processando';
    case 'FAILED':
      return 'Erro';
    case 'PENDING':
      return 'Pendente';
    default:
      return 'Desconhecido';
  }
}

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}