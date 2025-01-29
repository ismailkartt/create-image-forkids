'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Message, ChatConfig, Conversation } from '@/types';
import { chatService } from '@/services/api';

interface ChatContextType {
  messages: Message[];
  conversations: Conversation[];
  currentConversation: Conversation | null;
  sendMessage: (content: string) => Promise<void>;
  startNewConversation: () => void;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  isLoading: boolean;
  handleEdit: (messageId: string, newContent: string) => Promise<void>;
  handleGenerateImage: (messageId: string, model: string) => Promise<void>;
  handleContinueStory: (messageId: string) => Promise<void>;
  handleRegenerateImage: (messageId: string) => Promise<void>;
  handleSave: (messageId: string) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CONVERSATIONS: 'ai_kids_conversations',
  CURRENT_CONVERSATION: 'ai_kids_current_conversation'
};

interface ChatProviderProps {
  children: ReactNode;
  config: ChatConfig;
}

export function ChatProvider({ children, config }: ChatProviderProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(() => {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_CONVERSATION);
    return saved ? JSON.parse(saved) : null;
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    if (currentConversation) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_CONVERSATION, JSON.stringify(currentConversation));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_CONVERSATION);
    }
  }, [currentConversation]);

  useEffect(() => {
    if (currentConversation) {
      setMessages(currentConversation.messages);
    }
  }, [currentConversation]);

  const startNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'Yeni Hikaye',
      date: new Date().toISOString(),
      messages: []
    };
    setCurrentConversation(newConversation);
    setConversations(prev => [newConversation, ...prev]);
    setMessages([]);
  };

  const selectConversation = (id: string) => {
    const conversation = conversations.find(c => c.id === id);
    if (conversation) {
      setCurrentConversation(conversation);
      setMessages(conversation.messages);
    }
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== id));
    if (currentConversation?.id === id) {
      setCurrentConversation(null);
      setMessages([]);
    }
  };

  const sendMessage = async (content: string) => {
    try {
      setIsLoading(true);
      
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content,
        timestamp: new Date(),
        storyPart: 1
      };
      
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);

      // API'ye istek at
      const response = await chatService.sendMessage(content);
      
      // AI yanıtını ekle
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        contentType: response.type,
        imageUrl: response.imageUrl,
        timestamp: new Date(),
        storyPart: 1,
        actions: ['edit', 'generate-image']
      };

      const updatedMessages = [...newMessages, aiMessage];
      setMessages(updatedMessages);
      updateConversation(updatedMessages, content);
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: 'Mesaj gönderilemedi. Lütfen tekrar deneyin.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    try {
      // Mevcut sohbeti bul
      const conversation = conversations.find(c => 
        c.messages.some(m => m.id === messageId)
      );

      if (!conversation) return;

      // Düzenlenen mesajın indexini bul
      const messageIndex = conversation.messages.findIndex(m => m.id === messageId);
      if (messageIndex === -1) return;

      // Düzenlenen mesajı güncelle
      const updatedMessage = {
        ...conversation.messages[messageIndex],
        content: newContent,
        editedAt: new Date() // Düzenleme zamanını kaydet
      };

      // Sohbeti güncelle
      const updatedMessages = [...conversation.messages];
      updatedMessages[messageIndex] = updatedMessage;

        const updatedConversation = {
        ...conversation,
        messages: updatedMessages,
        date: new Date().toISOString()
      };

      // State'i güncelle
      setConversations(conversations.map(c => 
        c.id === conversation.id ? updatedConversation : c
      ));
      setCurrentConversation(updatedConversation);

      // LocalStorage'ı güncelle
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));

    } catch (error) {
      console.error('Edit error:', error);
      throw error;
    }
  };

  const handleGenerateImage = async (messageId: string, model: string) => {
    try {
      const message = messages.find(msg => msg.id === messageId);
      if (!message) return;

      setIsLoading(true);
      const imageUrl = await chatService.generateImage(message.content, model);
      
      const updatedMessages = messages.map(msg =>
        msg.id === messageId
          ? { 
              ...msg, 
              imageUrl,
              actions: ['regenerate-image', 'continue', 'save']
            }
          : msg
      );
      
      setMessages(updatedMessages as Message[]);
      updateConversation(updatedMessages as Message[]);
    } catch (error) {
      console.error('Image generation error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 4).toString(),
        role: 'assistant',
        content: 'Görsel oluşturulamadı. Lütfen tekrar deneyin.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueStory = async (messageId: string): Promise<void> => {
    const message = messages.find(msg => msg.id === messageId);
    if (!message) return;
    
    try {
      setIsLoading(true);
      const storyPart = message.storyPart || 1;
      await sendMessage(
        `Hikayenin ${storyPart + 1}. bölümünü yaz ve bu bölümü tam olarak bitir. Yarım bırakma. Önceki bölüm: ${message.content}`
      );
    } catch (error) {
      console.error('Story continuation error:', error);
      // Hata mesajını ekle
      const errorMessage: Message = {
        id: (Date.now() + 5).toString(),
        role: 'system',
        content: 'Hikaye devam ettirilemedi. Lütfen tekrar deneyin.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (messageId: string): Promise<void> => {
    try {
      setIsLoading(true);
      // Mevcut konuşmayı güncelle
      const updatedConversations = conversations.map(conv => {
        if (conv.id === currentConversation?.id) {
          return {
            ...conv,
            saved: true,
            lastSaved: new Date()
          };
        }
        return conv;
      });
      
      setConversations(updatedConversations);
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(updatedConversations));
      
      // Yeni bir konuşma başlat
      startNewConversation();
    } catch (error) {
      console.error('Save error:', error);
      // Hata mesajını ekle
      const errorMessage: Message = {
        id: (Date.now() + 6).toString(),
        role: 'system',
        content: 'Kaydetme hatası. Lütfen tekrar deneyin.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateImage = async (messageId: string): Promise<void> => {
    const message = messages.find(msg => msg.id === messageId);
    if (!message) return;
    await handleGenerateImage(messageId, 'dall-e-3');
  };

  const updateConversation = (messages: Message[], title?: string) => {
    if (currentConversation) {
      const updatedConversation = {
        ...currentConversation,
        messages,
        title: title || currentConversation.title
      };
      setCurrentConversation(updatedConversation);
      setConversations(prev => 
        prev.map(conv => 
          conv.id === currentConversation.id ? updatedConversation : conv
        )
      );
    } else {
      const newConversation: Conversation = {
        id: Date.now().toString(),
        title: title || 'Yeni Sohbet',
        date: new Date().toISOString(),
        messages
      };
      setCurrentConversation(newConversation);
      setConversations(prev => [newConversation, ...prev]);
    }
  };

  const value = {
    messages,
    conversations,
    currentConversation,
    sendMessage,
    startNewConversation,
    selectConversation,
    deleteConversation,
    isLoading,
    handleEdit: handleEditMessage,
    handleGenerateImage,
    handleContinueStory,
    handleRegenerateImage,
    handleSave,
    editMessage: handleEditMessage,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
}; 