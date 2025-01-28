import OpenAI from 'openai';
import { ChatConfig } from '@/types';

export const AI_MODELS = {
  GPT_3_5: 'gpt-3.5-turbo',
  GPT_3_5_16K: 'gpt-3.5-turbo-16k',
  GPT_4: 'gpt-4',
  GPT_4_32K: 'gpt-4-32k',
  DALL_E_2: 'dall-e-2',
  DALL_E_3: 'dall-e-3'
} as const;

export type AIModel = typeof AI_MODELS[keyof typeof AI_MODELS];

interface BaseModelConfig {
  name: string;
  description: string;
  recommended?: boolean;
}

interface ChatModelConfig extends BaseModelConfig {
  maxTokens: number;
  costPer1K: string;
}

interface ImageModelConfig extends BaseModelConfig {
  imageSize: string;
  costPerImage: string;
}

export type ModelConfig = ChatModelConfig | ImageModelConfig;

export const AI_MODEL_CONFIGS: Record<string, ModelConfig> = {
  [AI_MODELS.GPT_3_5]: {
    name: 'GPT-3.5',
    description: 'Hızlı ve ekonomik, genel amaçlı model',
    maxTokens: 4096,
    costPer1K: '$0.002',
    recommended: true
  },
  [AI_MODELS.GPT_3_5_16K]: {
    name: 'GPT-3.5 16K',
    description: 'Daha uzun içerikler için GPT-3.5',
    maxTokens: 16384,
    costPer1K: '$0.004'
  },
  [AI_MODELS.GPT_4]: {
    name: 'GPT-4',
    description: 'En gelişmiş model, karmaşık görevler için',
    maxTokens: 8192,
    costPer1K: '$0.03'
  },
  [AI_MODELS.GPT_4_32K]: {
    name: 'GPT-4 32K',
    description: 'Uzun içerikler için GPT-4',
    maxTokens: 32768,
    costPer1K: '$0.06'
  },
  [AI_MODELS.DALL_E_2]: {
    name: 'DALL-E 2',
    description: 'Hızlı resim üretimi',
    imageSize: '1024x1024',
    costPerImage: '$0.02',
    recommended: false
  },
  [AI_MODELS.DALL_E_3]: {
    name: 'DALL-E 3',
    description: 'Yüksek kaliteli resim üretimi',
    imageSize: '1024x1024',
    costPerImage: '$0.04',
    recommended: true
  }
};

interface MessageResponse {
  type: 'text' | 'image';
  content: string;
  imageUrl?: string;
}

export class OpenAIService {
  private openai: OpenAI;
  private config: ChatConfig | undefined;
  private lastRequestTime: number = 0;
  private minRequestInterval: number = 1000;

  constructor() {
    // Sadece server tarafında çalıştığından emin ol
    if (typeof window !== 'undefined') {
      throw new Error('OpenAI servisi sadece server tarafında kullanılabilir.');
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API anahtarı gerekli. Lütfen .env.local dosyasına OPENAI_API_KEY ekleyin.');
    }

    this.openai = new OpenAI({
      apiKey: apiKey
    });
  }

  private async rateLimiter(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      await new Promise<void>((resolve) => 
        setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest)
      );
    }
    
    this.lastRequestTime = Date.now();
  }

  async generateImage(prompt: string, model: string = AI_MODELS.DALL_E_3): Promise<string> {
    try {
      await this.rateLimiter();

      const processId = Date.now().toString();
      const safePrompt = `Çocuk dostu illüstrasyon: ${prompt.slice(0, 800)}`;

      // Görsel oluşturma işlemini başlat
      this.openai.images.generate({
        model: model as 'dall-e-2' | 'dall-e-3',
        prompt: safePrompt,
        n: 1,
        size: '256x256', // Daha küçük boyut
        quality: 'standard',
        style: 'natural'
      }).then(async response => {
        const imageUrl = response.data[0].url;
        if (imageUrl) {
          // Webhook'a bildir
          await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/chat/webhook`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-webhook-secret': process.env.WEBHOOK_SECRET || ''
            },
            body: JSON.stringify({ imageUrl, processId })
          });
        }
      }).catch(console.error);

      // Process ID'yi hemen dön
      return processId;
    } catch (error) {
      console.error('OpenAI Görsel Oluşturma Hatası:', error);
      throw error;
    }
  }

  async sendMessage(message: string, systemMessage: string = ''): Promise<MessageResponse> {
    try {
      await this.rateLimiter();

      const completion = await this.openai.chat.completions.create({
        model: this.config?.model || AI_MODELS.GPT_3_5,
        messages: [
          { 
            role: 'system', 
            content: systemMessage || 'Sen yardımcı bir asistansın.'
          },
          { role: 'user', content: message }
        ],
        temperature: this.config?.temperature || 0.7,
        max_tokens: 1000
      });

      const content = completion.choices[0].message?.content;
      if (!content) {
        throw new Error('OpenAI yanıt vermedi');
      }

      return {
        type: 'text',
        content
      };
    } catch (error) {
      console.error('OpenAI API Hatası:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('api key')) {
          throw new Error('API anahtarı geçersiz veya eksik');
        }
        if (error.message.includes('rate limit')) {
          throw new Error('Çok fazla istek gönderildi. Lütfen biraz bekleyin.');
        }
      }
      throw new Error('Mesaj işlenirken bir hata oluştu');
    }
  }

  async generateResponse(message: string): Promise<any> {
    // OpenAI API ile etkileşim kurarak yanıt oluşturma işlemleri burada yapılmalı
    // Örnek bir dönüş:
    return { response: `Yanıt: ${message}` };
  }
} 