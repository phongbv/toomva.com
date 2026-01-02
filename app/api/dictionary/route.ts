import { DictionaryResponse } from '@/domain/types';
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
  const url = `https://toomva.com/translate?word=${encodeURIComponent(word)}`;
  const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    const responseData: DictionaryResponse = {
        word,
        html: await response.text(),
    }
    return NextResponse.json(responseData);
//   try {
    //  const result = await dictionaryService.getWordDefinition(word);
//     return NextResponse.json(result);
//   } catch (error) {
//     console.error('Error in dictionary API:', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch word definition' },
//       { status: 500 }
//     );
//   }
}
