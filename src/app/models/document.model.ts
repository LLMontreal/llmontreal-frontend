
export enum DocumentStatus {
  PENDING = 'PENDENTE',
  PROCESSING = 'PROCESSANDO',
  COMPLETED = 'COMPLETO',
  FAILED = 'ERRO'
}

export interface DocumentDTO {
  id: number;
  status: DocumentStatus;
  createdAt: string; 
  updatedAt: string;
  fileName: string;
  fileType: string;
  summary: string | null;
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
