export interface ChatMessageResponseDto {
  documentId: number;
  chatSessionId: number;
  author: string;
  createdAt: string;
  response: string;
}
