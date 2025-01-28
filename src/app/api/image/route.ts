import { NextResponse } from 'next/server';
import { OpenAIService } from '@/services/openai';

export async function POST(req: Request) {
  try {
    const { prompt, model } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Görsel açıklaması gerekli' },
        { status: 400 }
      );
    }

    const openAIService = new OpenAIService();
    const imageUrl = await openAIService.generateImage(prompt, model);

    return NextResponse.json({
      success: true,
      imageUrl
    });

  } catch (error) {
    console.error('Görsel API Hatası:', error);
    
    let errorMessage = 'Görsel oluşturulurken bir hata oluştu';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage 
      },
      { status: 500 }
    );
  }
} 