'use client';

import { useState } from 'react';
import { FiSend } from 'react-icons/fi';

interface Props {
  onSend: (message: string) => Promise<void>;
  isLoading: boolean;
}

export default function MessageInput({ onSend, isLoading }: Props) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSend(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Mesajınızı yazın..."
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 bg-gray-50 text-gray-900 placeholder-gray-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!message.trim() || isLoading}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {isLoading ? 'Gönderiliyor...' : 'Gönder'}
        </button>
      </div>
    </form>
  );
} 