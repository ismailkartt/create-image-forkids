import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Görsel URL\'i gerekli' },
        { status: 400 }
      );
    }

    const response = await fetch(imageUrl);
    const blob = await response.blob();

    // Content-Type header'ını ayarla
    const headers = new Headers();
    headers.set('Content-Type', response.headers.get('Content-Type') || 'image/png');
    headers.set('Content-Disposition', 'attachment; filename=ai-generated-image.png');

    return new NextResponse(blob, {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('İndirme hatası:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Görsel indirilirken bir hata oluştu' 
      },
      { status: 500 }
    );
  }
} 