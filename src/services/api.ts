interface MessageResponse {
  type: 'text' | 'image';
  content: string;
  imageUrl?: string;
}

export const chatService = {
  async sendMessage(message: string, systemMessage: string = ''): Promise<MessageResponse> {
    try {
      const messages = [
        { role: "system", content: systemMessage || "Sen yardımcı bir asistansın." },
        { role: "user", content: message }
      ];

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API isteği başarısız oldu');
      }

      return {
        type: 'text',
        content: data.content
      };
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