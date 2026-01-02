import { DictionaryService } from '@/infrastructure/services/DictionaryService';

// Mock fetch globally
global.fetch = jest.fn();

describe('DictionaryService', () => {
  let dictionaryService: DictionaryService;

  beforeEach(() => {
    dictionaryService = new DictionaryService();
    jest.clearAllMocks();
  });

  it('should fetch and format word definition successfully', async () => {
    const mockApiResponse = [
      {
        word: 'hello',
        phonetic: '/həˈloʊ/',
        meanings: [
          {
            partOfSpeech: 'interjection',
            definitions: [
              {
                definition: 'Used as a greeting',
                example: 'Hello, how are you?',
              },
            ],
          },
        ],
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    });

    const result = await dictionaryService.getWordDefinition('hello');

    expect(result.word).toBe('hello');
    expect(result.html).toContain('hello');
    expect(result.html).toContain('/həˈloʊ/');
    expect(result.html).toContain('Used as a greeting');
    expect(result.html).toContain('Hello, how are you?');
  });

  it('should handle API errors gracefully', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: 'Not Found',
    });

    const result = await dictionaryService.getWordDefinition('invalidword');

    expect(result.word).toBe('invalidword');
    expect(result.html).toContain('Could not find definition');
  });

  it('should handle network errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    const result = await dictionaryService.getWordDefinition('test');

    expect(result.word).toBe('test');
    expect(result.html).toContain('Could not find definition');
  });

  it('should format multiple meanings correctly', async () => {
    const mockApiResponse = [
      {
        word: 'run',
        meanings: [
          {
            partOfSpeech: 'verb',
            definitions: [
              { definition: 'Move at a speed faster than a walk' },
              { definition: 'Be in charge of; manage' },
            ],
          },
          {
            partOfSpeech: 'noun',
            definitions: [{ definition: 'An act or spell of running' }],
          },
        ],
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    });

    const result = await dictionaryService.getWordDefinition('run');

    expect(result.html).toContain('verb');
    expect(result.html).toContain('noun');
    expect(result.html).toContain('Move at a speed faster than a walk');
    expect(result.html).toContain('An act or spell of running');
  });
});
