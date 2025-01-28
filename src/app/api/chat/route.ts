import { NextResponse } from 'next/server';
import { OpenAIService } from '@/services/openai';

const allowedOrigins = [
  'http://localhost:3000', // Your local development address
  'https://create-image-forkids-zkuz.vercel.app', // Your Vercel domain
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
  const res = new NextResponse();
  if (!checkOriginAndSetHeaders(req, res)) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  try {
    const { message, systemMessage } = await req.json();

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Mesaj içeriği gerekli' },
        { status: 400 }
      );
    }

    // Hemen bir işlem ID'si döndür
    const processId = Date.now().toString();
    
    // Görüntü oluşturma işlemini arka planda başlat
    const openAIService = new OpenAIService();
    openAIService.sendMessage(message, systemMessage || '')
      .then(response => {
        // Sonucu bir cache veya veritabanında sakla
        // Bu örnekte global değişken kullanıyoruz (gerçek uygulamada Redis/DB kullanın)
        global.imageResults = global.imageResults || {};
        global.imageResults[processId] = response;
      })
      .catch(error => {
        global.imageResults[processId] = { error: error.message };
      });

    return NextResponse.json({
      success: true,
      processId,
      status: 'processing'
    });

  } catch (error) {
    console.error('API Hatası:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}