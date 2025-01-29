import { NextRequest } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'edge'; // Edge runtime'ı aktif et

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { prompt, model } = await req.json();
    
    // Prompt uzunluğunu kontrol et
    if (prompt.length > 1000) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Prompt 1000 karakterden uzun olamaz'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const response = await openai.images.generate({
      model: model || "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });

    return new Response(JSON.stringify({
      success: true,
      imageUrl: response.data[0].url
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error: any) {
    console.error('Görsel oluşturma hatası:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 