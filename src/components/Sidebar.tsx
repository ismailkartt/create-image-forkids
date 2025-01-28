'use client';

import { useChat } from '@/context/ChatContext';
import { FiPlus, FiMessageCircle, FiX, FiTrash2 } from 'react-icons/fi';
import { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: Props) {
  const { conversations, currentConversation, startNewConversation, selectConversation, deleteConversation } = useChat();
  const [hoverConversationId, setHoverConversationId] = useState<string | null>(null);

  return (
    <div className={`
      fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 text-gray-100 transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
    `}>
      <div className="p-4 flex justify-between items-center border-b border-gray-700">
        <h2 className="text-xl font-bold">Sohbetler</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg">
          <FiX size={20} />
        </button>
      </div>
      
      <div className="p-4">
        <button
          onClick={() => {
            startNewConversation();
            onClose();
          }}
          className="w-full flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
        >
          <FiPlus size={20} />
          Yeni Sohbet
        </button>
      </div>

      <div className="overflow-y-auto h-full pb-20">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className="relative group"
            onMouseEnter={() => setHoverConversationId(conv.id)}
            onMouseLeave={() => setHoverConversationId(null)}
          >
            <button
              onClick={() => {
                selectConversation(conv.id);
                onClose();
              }}
              className={`
                w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-700 transition-colors
                ${currentConversation?.id === conv.id ? 'bg-gray-700' : ''}
              `}
            >
              <FiMessageCircle size={20} />
              <div className="text-left flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{conv.title}</p>
                <p className="text-xs text-gray-400">{new Date(conv.date).toLocaleDateString()}</p>
              </div>
            </button>
            {hoverConversationId === conv.id && (
              <button
                onClick={() => deleteConversation(conv.id)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-600 rounded-lg text-red-400 hover:text-red-500"
                title="Sohbeti Sil"
              >
                <FiTrash2 size={16} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 