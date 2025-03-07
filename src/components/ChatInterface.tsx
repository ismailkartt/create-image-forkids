'use client';

import { useRef, useEffect } from 'react';
import { useChat } from '@/context/ChatContext';
import MessageList from '@/components/MessageList';
import MessageInput from '@/components/MessageInput';
import { FiMenu } from 'react-icons/fi';
import MessageItem from './MessageItem';

export default function ChatInterface() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { 
    messages, 
    sendMessage, 
    isLoading,
    handleEdit,
    handleGenerateImage,
    handleContinueStory,
    handleRegenerateImage,
    handleSave
  } = useChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Mesajlar değiştiğinde scroll
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <MessageList
          messages={messages}
          onEdit={handleEdit}
          onGenerateImage={handleGenerateImage}
          onContinueStory={handleContinueStory}
          onRegenerateImage={handleRegenerateImage}
          onSave={handleSave}
        />
      </div>
      <div className="flex-shrink-0">
        <MessageInput onSend={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
} 