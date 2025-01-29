'use client';

import { useState, useEffect } from 'react';
import { ChatProvider } from '@/context/ChatContext';
import ChatInterface from '@/components/ChatInterface';
import Sidebar from '@/components/Sidebar';
import ModelSelector from '@/components/ModelSelector';
import { FiMenu, FiSettings, FiChevronLeft } from 'react-icons/fi';
import { AI_MODELS, AI_MODEL_CONFIGS } from '@/services/openai';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>(AI_MODELS.GPT_3_5);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleModelSelect = (model: string) => {
    setSelectedModel(model);
  };

  return (
    <ChatProvider 
      config={{ 
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '', 
        model: selectedModel,
        temperature: 0.7,
        enableImageGeneration: true
      }}
    >
      <div className="flex h-screen overflow-hidden">
        {/* Mobil için karartma overlay'i */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:relative md:transform-none
          ${!isDesktopSidebarOpen && 'md:w-0 md:overflow-hidden'}
        `}>
          <Sidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)}
            isDesktopSidebarOpen={isDesktopSidebarOpen}
            onToggleDesktopSidebar={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
          />
        </div>

        {/* Sidebar Açma Butonu - Desktop */}
        {!isDesktopSidebarOpen && (
          <button
            onClick={() => setIsDesktopSidebarOpen(true)}
            className="hidden md:flex items-center justify-center h-10 absolute left-2 top-3 
            bg-gradient-to-r from-blue-500 to-purple-500 text-white 
            rounded-lg hover:opacity-90 transition-all shadow-md px-3
            hover:scale-105 transform duration-200"
            title="Sohbetleri Göster"
          >
            <div className="flex items-center gap-2">
              <FiChevronLeft 
                size={20} 
                className="transform rotate-180"
              />
            </div>
          </button>
        )}

        {/* Ana İçerik */}
        <div className="flex-1 flex flex-col w-full min-h-0">
          {/* Üst Bar - Sabit pozisyon */}
          <div className="sticky top-0 z-30 bg-white border-b border-gray-200 p-2 sm:p-4 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 md:hidden"
              >
                <FiMenu size={20} />
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowModelSelector(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                <FiSettings size={16} className="text-white" />
                <span className="hidden sm:inline">Model: {AI_MODEL_CONFIGS[selectedModel].name}</span>
                <span className="sm:hidden">Model</span>
              </button>
            </div>
          </div>

          {/* Chat Alanı - Kalan alanı doldur */}
          <div className="flex-1 overflow-hidden bg-gray-50">
            <ChatInterface />
          </div>
        </div>
      </div>

      <ModelSelector
        isOpen={showModelSelector}
        onClose={() => setShowModelSelector(false)}
        selectedModel={selectedModel}
        onSelect={handleModelSelect}
      />
    </ChatProvider>
  );
}