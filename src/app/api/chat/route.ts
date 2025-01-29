import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const allowedOrigins = [
  'http://localhost:3000', // Your local development address
  'https://create-image-forkids-zkuz.vercel.app', // Your Vercel domain
  'https://create-image-forkids.netlify.app',
  'http://forkids.healwell.online',
  // Add other allowed origins if needed (e.g., staging environments)
];

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    const { messages } = await req.json();
    
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API anahtarı bulunamadı');
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
    });

    return new Response(JSON.stringify(response.choices[0].message), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
    
  } catch (error: any) {
    console.error('Chat API Hatası:', error);
    
    const errorMessage = error.message || 'Bilinmeyen bir hata oluştu';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: error.response?.data || error.cause || error.stack 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}