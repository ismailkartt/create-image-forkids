'use client';

import { useEffect, useState } from 'react';
import { AI_MODELS, AI_MODEL_CONFIGS, ModelConfig } from '@/services/openai';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedModel: string;
  onSelect: (model: string) => void;
}

export default function ModelSelector({ isOpen, onClose, selectedModel, onSelect }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Model Seç</h3>
        <div className="space-y-4">
          {Object.values(AI_MODELS).map((model) => {
            const config = AI_MODEL_CONFIGS[model] as ModelConfig;
            return (
              <button
                key={model}
                onClick={() => {
                  onSelect(model);
                  onClose();
                }}
                className={`w-full p-4 border rounded-lg text-left hover:bg-gray-50 ${
                  selectedModel === model ? 'border-indigo-500' : ''
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {config.name}
                    </h4>
                    <p className="text-sm text-gray-600">{config.description}</p>
                  </div>
                  <span className="text-indigo-600 font-medium">
                    {'costPerImage' in config 
                      ? config.costPerImage 
                      : (config as any).costPer1K}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          İptal
        </button>
      </div>
    </div>
  );
} 