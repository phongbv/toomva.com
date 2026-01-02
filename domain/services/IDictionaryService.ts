import { DictionaryResponse } from '@/domain/types';

export interface IDictionaryService {
  getWordDefinition(word: string): Promise<DictionaryResponse>;
}
