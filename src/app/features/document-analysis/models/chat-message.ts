export interface ChatMessage {
  sender: 'IA' | 'Você';
  text: string;
  citation?: string;
}