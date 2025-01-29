'use client';

import { useChat } from '@/context/ChatContext';
import { FiPlus, FiMessageCircle, FiX, FiTrash2, FiChevronLeft } from 'react-icons/fi';
import { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isDesktopSidebarOpen: boolean;
  onToggleDesktopSidebar: () => void;
}

export default function Sidebar({ isOpen, onClose, isDesktopSidebarOpen, onToggleDesktopSidebar }: Props) {
  const { conversations, currentConversation, startNewConversation, selectConversation, deleteConversation } = useChat();
  const [hoverConversationId, setHoverConversationId] = useState<string | null>(null);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 flex justify-between items-center border-b border-gray-700">
        <h2 className="text-xl font-bold text-white">Sohbetler</h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={onToggleDesktopSidebar}
            className="hidden md:flex p-2 hover:bg-gray-700 rounded-lg text-gray-300"
          >
            <FiChevronLeft 
              size={20} 
              className={`transform transition-transform duration-300 ${!isDesktopSidebarOpen && 'rotate-180'}`}
            />
          </button>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-700 rounded-lg text-gray-300 md:hidden"
          >
            <FiX size={20} />
          </button>
        </div>
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

      <div className="flex-1 overflow-y-auto">
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
                w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-700 transition-colors text-gray-100
                ${currentConversation?.id === conv.id ? 'bg-gray-700' : ''}
              `}
            >
              <FiMessageCircle size={20} className="text-gray-300" />
              <div className="text-left flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-100 truncate">{conv.title}</p>
                <p className="text-xs text-gray-300">{new Date(conv.date).toLocaleDateString()}</p>
              </div>
            </button>
            <button
              onClick={() => deleteConversation(conv.id)}
              className={`
                absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-600 rounded-lg 
                text-red-400 hover:text-red-500 transition-all
                md:opacity-0 md:group-hover:opacity-100 
                ${hoverConversationId === conv.id ? 'md:opacity-100' : ''}
              `}
              title="Sohbeti Sil"
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 