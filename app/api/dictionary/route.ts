import { DictionaryService } from '@/infrastructure/services/DictionaryService';
import { NextRequest, NextResponse } from 'next/server';

const dictionaryService = new DictionaryService();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const word = searchParams.get('word');

  if (!word) {
    return NextResponse.json(
      { error: 'Word parameter is required' },
      { status: 400 }
    );
  }

  try {
    const result = await dictionaryService.getWordDefinition(word);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in dictionary API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch word definition' },
      { status: 500 }
    );
  }
}
