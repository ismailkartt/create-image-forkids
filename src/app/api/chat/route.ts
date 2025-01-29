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
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'Geçerli mesaj formatı gerekli' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

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