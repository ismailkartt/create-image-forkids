import { NextResponse } from 'next/server';
import { OpenAIService } from '@/services/openai';

export async function POST(req: Request) {
  try {
    const { message, systemMessage } = await req.json();

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Mesaj içeriği gerekli' },
        { status: 400 }
      );
    }

    const openAIService = new OpenAIService();
    const response = await openAIService.sendMessage(message, systemMessage || '');

    
    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('API Hatası:', error);
    
    let errorMessage = 'Bir hata oluştu';
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