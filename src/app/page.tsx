'use client';

import { useState, useEffect } from 'react';
import { ChatProvider } from '@/context/ChatContext';
import ChatInterface from '@/components/ChatInterface';
import Sidebar from '@/components/Sidebar';
import ModelSelector from '@/components/ModelSelector';
import { FiMenu, FiSettings } from 'react-icons/fi';
import { AI_MODELS, AI_MODEL_CONFIGS } from '@/services/openai';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>(AI_MODELS.GPT_3_5);
  const [showModelSelector, setShowModelSelector] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleModelSelect = (model: string) => {
    setSelectedModel(model);
  };

  return (
    <ChatProvider config={{ 
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '', 
      model: selectedModel,
      temperature: 0.7,
      enableImageGeneration: true
    }}>
      <main className="flex h-screen bg-gray-50">
        <div className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0
        `}>
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        </div>
        <div className="flex-1 flex flex-col w-full">
          <div className="bg-white border-b border-gray-200 p-2 sm:p-4 flex justify-between items-center shadow-sm">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 md:hidden"
            >
              <FiMenu size={20} />
            </button>
            <button
              onClick={() => setShowModelSelector(true)}
              className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
            >
              <FiSettings size={16} />
              <span className="hidden sm:inline">Model:</span> {AI_MODEL_CONFIGS[selectedModel].name}
            </button>
          </div>
          <ChatInterface />
        </div>
      </main>
      <ModelSelector
        isOpen={showModelSelector}
        onClose={() => setShowModelSelector(false)}
        selectedModel={selectedModel}
        onSelect={handleModelSelect}
      />
    </ChatProvider>
  );
}
