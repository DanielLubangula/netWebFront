import { api } from './api';

export interface PublicMessage {
  _id: string;
  text: string;
  username: string;
  profilePicture: string;
  replyTo?: {
    messageId: string;
    username: string;
    text: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ChatPagination {
  currentPage: number;
  totalPages: number;
  totalMessages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ChatResponse {
  messages: PublicMessage[];
  pagination: ChatPagination;
}

export interface SendMessageData {
  text: string;
  replyTo?: {
    messageId: string;
  };
}

class ChatService {
  // Récupérer les messages publics
  async getPublicMessages(page: number = 1, limit: number = 50): Promise<ChatResponse> {
    try {
      const response = await api.get(`/api/chat/public?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
      throw error;
    }
  }

  // Envoyer un nouveau message
  async sendPublicMessage(data: SendMessageData): Promise<{ message: string; data: PublicMessage }> {
    try {
      const response = await api.post('/api/chat/public', data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      throw error;
    }
  }

  // Supprimer un message
  async deletePublicMessage(messageId: string): Promise<{ message: string }> {
    try {
      const response = await api.delete(`/api/chat/public/${messageId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la suppression du message:', error);
      throw error;
    }
  }

  // Récupérer un message spécifique
  async getPublicMessage(messageId: string): Promise<{ data: PublicMessage }> {
    try {
      const response = await api.get(`/api/chat/public/${messageId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du message:', error);
      throw error;
    }
  }
}

export default new ChatService(); 