import { OpenAIService } from '@/services/openai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Görsel açıklaması gerekli' },
        { status: 400 }
      );
    }

    const openai = new OpenAIService();
    const imageUrl = await openai.generateImage(prompt);

    return NextResponse.json({ imageUrl });
    
  } catch (error) {
    console.error('Görsel oluşturma hatası:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Görsel oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
} 