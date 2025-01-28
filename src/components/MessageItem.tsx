'use client';

import { useState, useRef, useEffect } from 'react';
import { Message, ImageGenerationOptions, ImageModelConfig } from '@/types';
import { motion } from 'framer-motion';
import { AI_MODELS, AI_MODEL_CONFIGS } from '@/services/openai';
import { FiDownload, FiMaximize2, FiMinimize2, FiX } from 'react-icons/fi';
import Image from 'next/image';

interface Props {
  message: Message;
  onEdit: (messageId: string, content: string) => Promise<void>;
  onGenerateImage: (messageId: string, model: string) => Promise<void>;
  onContinueStory: (messageId: string) => Promise<void>;
  onRegenerateImage: (messageId: string) => Promise<void>;
  onSave: (messageId: string) => Promise<void>;
}

export default function MessageItem({ 
  message, 
  onEdit, 
  onGenerateImage, 
  onContinueStory,
  onRegenerateImage,
  onSave 
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const imageOptions: ImageGenerationOptions[] = [
    {
      model: 'dall-e-2',
      price: (AI_MODEL_CONFIGS[AI_MODELS.DALL_E_2] as ImageModelConfig).costPerImage,
      quality: 'Standart'
    },
    {
      model: 'dall-e-3',
      price: (AI_MODEL_CONFIGS[AI_MODELS.DALL_E_3] as ImageModelConfig).costPerImage,
      quality: 'Yüksek'
    }
  ];

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isEditing]);

  const handleEdit = async () => {
    try {
      setIsLoading(true);
      await onEdit(message.id, editedContent);
      setIsEditing(false);
      setEditedContent(editedContent);
    } catch (error) {
      console.error('Edit error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateImage = async () => {
    setShowImageOptions(true);
  };

  const handleDownload = async (imageUrl: string) => {
    try {
      setIsDownloading(true);
      
      // Server üzerinden görsel indir
      const response = await fetch(`/api/download?url=${encodeURIComponent(imageUrl)}`);
      
      if (!response.ok) {
        throw new Error('İndirme başarısız oldu');
      }

      // Blob olarak al
      const blob = await response.blob();
      
      // Tarayıcıda indirme işlemini başlat
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'ai-generated-image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

    } catch (error) {
      console.error('İndirme hatası:', error);
      alert('Görsel indirilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4"
    >
      {/* Message Content */}
      <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
        {message.role === 'assistant' && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm mr-2">
            AI
          </div>
        )}
        <div
          className={`max-w-[95%] md:max-w-[90%] rounded-2xl p-4 ${
            message.role === 'user' 
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
              : 'bg-white border-2 border-purple-100 text-gray-800'
          } shadow-md`}
        >
          {isEditing ? (
            <div className="fixed inset-0 bg-white z-50 flex flex-col">
              <div className="p-4 border-b bg-white flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Metni Düzenle</h3>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <FiX size={24} />
                </button>
              </div>
              
              <div className="flex-1 p-4 overflow-auto">
                <textarea
                  ref={textareaRef}
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full h-full p-4 border rounded-lg bg-gray-50 text-gray-900 focus:ring-2 focus:ring-purple-300 focus:border-transparent resize-none"
                  disabled={isLoading}
                  style={{ 
                    fontSize: '0.925rem',
                    lineHeight: '1.4'
                  }}
                  autoFocus
                />
              </div>

              <div className="p-4 border-t bg-white">
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={handleEdit}
                    disabled={isLoading}
                    className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 disabled:opacity-50 flex-1 sm:flex-none"
                  >
                    {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    disabled={isLoading}
                    className="px-4 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 disabled:opacity-50 flex-1 sm:flex-none"
                  >
                    İptal
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className={`text-[0.925rem] leading-relaxed ${message.role === 'user' ? 'text-white' : 'text-gray-800'}`}>
              {message.content}
            </p>
          )}
          {message.imageUrl && (
            <div className="mt-3 relative group">
              <div 
                onClick={() => setIsFullscreen(true)} 
                className="cursor-pointer"
              >
                <Image 
                  src={message.imageUrl} 
                  alt="Generated" 
                  width={1024}
                  height={1024}
                  className="rounded-lg w-full h-auto"
                  unoptimized
                />
              </div>

              {/* Tam ekran görüntüleme */}
              {isFullscreen && (
                <div 
                  className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
                  onClick={() => setIsFullscreen(false)}
                >
                  <div className="relative max-w-[90vw] max-h-[90vh]">
                    <Image 
                      src={message.imageUrl} 
                      alt="Generated" 
                      width={1024}
                      height={1024}
                      className="object-contain max-w-full max-h-[90vh]"
                      unoptimized
                    />
                    
                    {/* Kontrol butonları */}
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(message.imageUrl!);
                        }}
                        disabled={isDownloading}
                        className="p-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-lg transition-all disabled:opacity-50 flex items-center gap-1"
                        title={isDownloading ? "İndiriliyor..." : "İndir"}
                      >
                        {isDownloading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-xs">İndiriliyor...</span>
                          </>
                        ) : (
                          <FiDownload size={20} />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsFullscreen(false);
                        }}
                        className="p-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-lg transition-all"
                        title="Küçült"
                      >
                        <FiMinimize2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Normal görünüm kontrol butonları */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(message.imageUrl!);
                  }}
                  disabled={isDownloading}
                  className="p-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-lg transition-all disabled:opacity-50 flex items-center gap-1"
                  title={isDownloading ? "İndiriliyor..." : "İndir"}
                >
                  {isDownloading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs">İndiriliyor...</span>
                    </>
                  ) : (
                    <FiDownload size={20} />
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFullscreen(true);
                  }}
                  className="p-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-lg transition-all"
                  title="Tam Ekran"
                >
                  <FiMaximize2 size={20} />
                </button>
              </div>
            </div>
          )}
          <span className="text-xs opacity-70 mt-2 block">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </div>
        {message.role === 'user' && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center text-white text-sm ml-2">
            Sen
          </div>
        )}
      </div>

      {/* Resim oluşturma modal'ı */}
      {(showImageOptions || isGenerating) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            {isGenerating ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-lg font-medium text-gray-900">Resim Oluşturuluyor</h3>
                <p className="text-sm text-gray-500 mt-2">Lütfen bekleyin...</p>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Görsel Oluşturma Seçenekleri</h3>
                <div className="space-y-4">
                  {imageOptions.map((option) => (
                    <button
                      key={option.model}
                      onClick={async () => {
                        try {
                          setIsGenerating(true);
                          await onGenerateImage(message.id, option.model);
                        } finally {
                          setShowImageOptions(false);
                          setIsGenerating(false);
                        }
                      }}
                      className="w-full p-4 border rounded-lg hover:bg-gray-50 text-left"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {option.model === 'dall-e-3' ? 'DALL-E 3' : 'DALL-E 2'}
                          </h4>
                          <p className="text-sm text-gray-600">Kalite: {option.quality}</p>
                        </div>
                        <span className="text-purple-600 font-medium">{option.price}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowImageOptions(false)}
                  className="mt-4 w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  İptal
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {message.actions && message.role === 'assistant' && (
        <div className="flex flex-wrap gap-2 justify-end mt-2">
          <button
            onClick={() => setIsEditing(true)}
            disabled={isLoading}
            className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'İşleniyor...' : 'Düzenle'}
          </button>

          {message.actions.includes('generate-image') && !isEditing && (
            <button
              onClick={handleRegenerateImage}
              disabled={isLoading || isGenerating}
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
            >
              {isLoading || isGenerating ? 'İşleniyor...' : 'Görsel Oluştur'}
            </button>
          )}

          {message.imageUrl && (
            <>
              <button
                onClick={handleRegenerateImage}
                disabled={isLoading || isGenerating}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
              >
                {isLoading || isGenerating ? 'İşleniyor...' : 'Tekrar Oluştur'}
              </button>
              <button
                onClick={() => onContinueStory(message.id)}
                disabled={isLoading || isGenerating}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                {isLoading || isGenerating ? 'İşleniyor...' : 'Hikayeye Devam Et'}
              </button>
              <button
                onClick={() => onSave(message.id)}
                disabled={isLoading || isGenerating}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
              >
                {isLoading || isGenerating ? 'Kaydediliyor...' : 'Kaydet ve Kapat'}
              </button>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
} 