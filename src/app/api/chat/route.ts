import { NextRequest, NextResponse } from 'next/server';
import { OpenAIService } from '@/services/openai';

const allowedOrigins = [
  'http://localhost:3000', // Your local development address
  'https://create-image-forkids-zkuz.vercel.app', // Your Vercel domain
  'https://create-image-forkids.netlify.app',
  'http://forkids.healwell.online',
  // Add other allowed origins if needed (e.g., staging environments)
];

// Function to check origin and set CORS headers
function checkOriginAndSetHeaders(req: Request, res: NextResponse) {
  const origin = req.headers.get('origin');

  if (allowedOrigins.includes(origin ?? '') || !origin) {
    res.headers.set('Access-Control-Allow-Origin', origin ?? '*');
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return true; // Origin is allowed
  } else {
    return false; // Origin is not allowed
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    // API anahtarını kontrol et
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API anahtarı yapılandırılmamış' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { message, systemMessage } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Mesaj gerekli' },
        { status: 400 }
      );
    }

    const openAIService = new OpenAIService();
    const response = await openAIService.sendMessage(message, systemMessage);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Chat API Hatası:', error);
    return NextResponse.json(
      { error: 'İstek işlenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}