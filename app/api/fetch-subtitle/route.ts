import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json(
      { error: 'URL parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Validate URL
    new URL(url);
    
    // Fetch subtitle from URL (server-side, bypasses CORS)
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch subtitle: ${response.statusText}`);
    }

    const content = await response.text();
    
    return NextResponse.json({ 
      content,
      success: true 
    });
  } catch (error: any) {
    console.error('Error fetching subtitle:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to fetch subtitle from URL',
        success: false 
      },
      { status: 500 }
    );
  }
}
