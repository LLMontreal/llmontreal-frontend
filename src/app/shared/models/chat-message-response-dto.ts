export interface ChatMessage {
  documentId: number;
  chatSessionId: number;
  author: string;
  createdAt: string;
  response: string;
}
