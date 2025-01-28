import { NextResponse } from 'next/server';
import { OpenAIService } from '@/services/openai';

// OPTIONS metodunu ekleyelim (CORS için)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(req: Request) {
  // CORS başlıklarını ekleyelim
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    const { message, systemMessage } = await req.json();

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Mesaj içeriği gerekli' },
        { 
          status: 400,
          headers 
        }
      );
    }

    const openAIService = new OpenAIService();
    const response = await openAIService.sendMessage(message, systemMessage || '');

    return NextResponse.json({
      success: true,
      data: response
    }, { 
      headers 
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
      { 
        status: 500,
        headers 
      }
    );
  }
}