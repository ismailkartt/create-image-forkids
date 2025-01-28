import { NextResponse } from 'next/server';
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


export async function OPTIONS(req: Request) {
  const res = new NextResponse(null, { status: 200 });
  if (checkOriginAndSetHeaders(req, res)) {
     return res;
  } else {
      return new NextResponse("Forbidden", { status: 403 })
  }
}

export async function POST(req: Request) {
  const res = new NextResponse(); // No body initially
  if (!checkOriginAndSetHeaders(req, res)) {
      return new NextResponse("Forbidden", { status: 403 })
  }

  try {
    const { message, systemMessage } = await req.json();

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Mesaj içeriği gerekli' },
        { status: 400 } // Headers are already set by checkOriginAndSetHeaders
      );
    }

    const openAIService = new OpenAIService();
    const response = await openAIService.sendMessage(message, systemMessage || '');

    return NextResponse.json(
      { success: true, data: response },
      { status: 200 } // Headers are already set
    );

  } catch (error) {
    console.error('API Hatası:', error);

    let errorMessage = 'Bir hata oluştu';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 } // Headers are already set
    );
  }
}