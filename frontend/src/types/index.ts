export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Chat {
  id: number;
  title: string;
  createdAt: string;
}

export interface ChatMessage {
  id: number;
  content: string;
  role: 'user' | 'assistant';
  sentAt: string;
}

export interface PdfFile {
  id: number;
  fileName: string;
  uploadedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
