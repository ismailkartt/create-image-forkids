import { NextResponse } from 'next/server';

declare global {
  var sseClients: Map<string, any[]>;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const processId = url.searchParams.get('processId');

  if (!processId) {
    return NextResponse.json({ error: 'Process ID required' }, { status: 400 });
  }

  const response = new NextResponse(
    new ReadableStream({
      start(controller) {
        // SSE bağlantısını kaydet
        global.sseClients = global.sseClients || new Map();
        const clients = global.sseClients.get(processId) || [];
        clients.push(controller);
        global.sseClients.set(processId, clients);

        // 30 saniye sonra timeout
        setTimeout(() => {
          controller.close();
        }, 30000);
      }
    }),
    {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    }
  );

  return response;
} 