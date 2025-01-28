import { NextResponse } from 'next/server';

declare global {
  var imageResults: {
    [key: string]: any;
  };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const processId = url.searchParams.get('processId');

  if (!processId) {
    return NextResponse.json({ success: false, error: 'Process ID gerekli' }, { status: 400 });
  }

  const result = global.imageResults?.[processId];

  if (!result) {
    return NextResponse.json({ success: true, status: 'processing' });
  }

  if (result.error) {
    return NextResponse.json({ success: false, error: result.error }, { status: 500 });
  }

  // İşlem tamamlandıysa sonucu sil
  delete global.imageResults[processId];

  return NextResponse.json({
    success: true,
    status: 'completed',
    data: result
  });
} 