export type MessageAction = 'edit' | 'generate-image' | 'continue' | 'regenerate-image' | 'save';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  contentType?: 'text' | 'image';
  imageUrl?: string;
  timestamp: Date;
  actions?: MessageAction[];
  storyPart?: number;
}

export interface ChatConfig {
  apiKey: string;
  model: string;
  temperature: number;
  enableImageGeneration?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  date: string;
  messages: Message[];
}

export interface ImageGenerationOptions {
  model: 'dall-e-2' | 'dall-e-3';
  price: string;
  quality: string;
}

export interface BaseModelConfig {
  name: string;
  description: string;
  recommended?: boolean;
}

export interface ChatModelConfig extends BaseModelConfig {
  maxTokens: number;
  costPer1K: string;
}

export interface ImageModelConfig extends BaseModelConfig {
  imageSize: string;
  costPerImage: string;
} 