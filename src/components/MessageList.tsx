'use client';

import { Message } from '@/types';
import MessageItem from '@/components/MessageItem';
import { useRef, useEffect } from 'react';

interface Props {
  messages: Message[];
  onEdit: (messageId: string, content: string) => Promise<void>;
  onGenerateImage: (messageId: string, model: string) => Promise<void>;
  onContinueStory: (messageId: string) => Promise<void>;
  onRegenerateImage: (messageId: string) => Promise<void>;
  onSave: (messageId: string) => Promise<void>;
}

export default function MessageList({ 
  messages, 
  onEdit, 
  onGenerateImage, 
  onContinueStory,
  onRegenerateImage,
  onSave 
}: Props) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]); // Mesajlar değiştiğinde scroll

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          onEdit={onEdit}
          onGenerateImage={onGenerateImage}
          onContinueStory={onContinueStory}
          onRegenerateImage={onRegenerateImage}
          onSave={onSave}
        />
      ))}
      <div ref={messagesEndRef} /> {/* Scroll hedefi */}
    </div>
  );
} 