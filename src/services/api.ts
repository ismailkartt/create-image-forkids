interface MessageResponse {
  type: 'text' | 'image';
  content: string;
  imageUrl?: string;
}

export const chatService = {
  async sendMessage(message: string, systemMessage: string = ''): Promise<MessageResponse> {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          systemMessage
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API isteği başarısız oldu');
      }

      if (!data.success) {
        throw new Error(data.error || 'İşlem başarısız oldu');
      }

      return data.data;
    } catch (error) {
      console.error('Chat API Hatası:', error);
      throw error;
    }
  },

  async generateImage(prompt: string, model: string): Promise<string> {
    try {
      const response = await fetch('/api/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          model
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Görsel oluşturulamadı');
      }

      
      return data.imageUrl;
    } catch (error) {
      console.error('Görsel API Hatası:', error);
      throw error;
    }
  },

  async sendMessages(messages: any[]): Promise<any> {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Bir hata oluştu');
      }

      return await response.json();
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
      throw error;
    }
  }
}; 