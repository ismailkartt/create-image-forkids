import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { imageUrl, processId } = await req.json();
    
    // Webhook secret kontrolü yapabilirsiniz
    const webhookSecret = req.headers.get('x-webhook-secret');
    if (webhookSecret !== process.env.WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // SSE kanalına bildirim gönder
    const clients = global.sseClients?.get(processId) || [];
    clients.forEach(client => {
      client.write(`data: ${JSON.stringify({ imageUrl })}\n\n`);
      client.end();
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook hatası:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 