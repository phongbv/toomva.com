import { IDictionaryService } from '@/domain/services/IDictionaryService';
import { DictionaryResponse } from '@/domain/types';

export class DictionaryService implements IDictionaryService {
  private apiUrl: string;

  constructor(apiUrl = 'https://api.dictionaryapi.dev/api/v2/entries/en') {
    this.apiUrl = apiUrl;
  }

  async getWordDefinition(word: string): Promise<DictionaryResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/${encodeURIComponent(word)}`);
      
      if (!response.ok) {
        throw new Error(`Dictionary API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Convert API response to HTML
      const html = this.formatToHtml(data);
      
      return {
        word,
        html,
      };
    } catch (error) {
      console.error('Error fetching word definition:', error);
      return {
        word,
        html: `<div class="error">Could not find definition for "${word}"</div>`,
      };
    }
  }

  private formatToHtml(data: any[]): string {
    if (!data || data.length === 0) {
      return '<div class="error">No definition found</div>';
    }

    const entry = data[0];
    let html = `<div class="dictionary-entry">`;
    html += `<h3 class="word">${entry.word}</h3>`;

    if (entry.phonetic) {
      html += `<p class="phonetic">${entry.phonetic}</p>`;
    }

    if (entry.meanings && entry.meanings.length > 0) {
      entry.meanings.forEach((meaning: any, index: number) => {
        html += `<div class="meaning">`;
        html += `<h4 class="part-of-speech">${meaning.partOfSpeech}</h4>`;
        
        if (meaning.definitions && meaning.definitions.length > 0) {
          html += `<ol class="definitions">`;
          meaning.definitions.slice(0, 3).forEach((def: any) => {
            html += `<li>`;
            html += `<p class="definition">${def.definition}</p>`;
            if (def.example) {
              html += `<p class="example"><em>"${def.example}"</em></p>`;
            }
            html += `</li>`;
          });
          html += `</ol>`;
        }
        html += `</div>`;
      });
    }

    html += `</div>`;
    return html;
  }
}
