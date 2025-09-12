import fetch from 'node-fetch';

// Free translation services - we'll try multiple sources for reliability
const TRANSLATION_SERVICES = [
  {
    name: 'LibreTranslate',
    url: 'https://libretranslate.de/translate',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' } as Record<string, string>,
    formatRequest: (text: string, from: string, to: string) => ({
      q: text,
      source: from,
      target: to,
      format: 'text'
    }),
    formatResponse: (data: any) => data.translatedText
  },
  {
    name: 'MyMemory',
    url: 'https://api.mymemory.translated.net/get',
    method: 'GET',
    headers: {} as Record<string, string>,
    formatRequest: (text: string, from: string, to: string) => null,
    formatResponse: (data: any) => data.responseData?.translatedText,
    buildUrl: (text: string, from: string, to: string) => 
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`
  }
];

// Language mappings - some services use different codes
const LANGUAGE_MAP: Record<string, string> = {
  hi: 'hi',   // Hindi
  mr: 'mr',   // Marathi - might not be supported by all services
  ur: 'ur',   // Urdu
  pa: 'pa',   // Punjabi - might not be supported by all services
  ks: 'hi',   // Kashmiri -> fallback to Hindi
  doi: 'hi'   // Dogri -> fallback to Hindi
};

// Cache for translations to avoid repeated API calls
const translationCache = new Map<string, string>();

function getCacheKey(text: string, from: string, to: string): string {
  return `${from}-${to}-${text.substring(0, 50)}`;
}

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  // Return original text for English or if no translation needed
  if (targetLanguage === 'en' || !text || text.trim() === '') {
    return text;
  }

  // Check cache first
  const cacheKey = getCacheKey(text, 'en', targetLanguage);
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  // Map language code
  const mappedLanguage = LANGUAGE_MAP[targetLanguage] || targetLanguage;

  // Try each translation service
  for (const service of TRANSLATION_SERVICES) {
    try {
      let response;
      
      if (service.method === 'POST') {
        response = await fetch(service.url, {
          method: 'POST',
          headers: service.headers,
          body: JSON.stringify(service.formatRequest(text, 'en', mappedLanguage))
        });
      } else {
        const url = service.buildUrl ? service.buildUrl(text, 'en', mappedLanguage) : service.url;
        response = await fetch(url, {
          method: 'GET',
          headers: service.headers
        });
      }

      if (!response.ok) {
        console.warn(`${service.name} translation failed with status: ${response.status}`);
        continue;
      }

      const data = await response.json();
      const translatedText = service.formatResponse(data);

      if (translatedText && translatedText !== text) {
        // Cache successful translation
        translationCache.set(cacheKey, translatedText);
        return translatedText;
      }
    } catch (error: any) {
      console.warn(`${service.name} translation error:`, error?.message || 'Unknown error');
      continue;
    }
  }

  // If all services fail, return original text
  console.warn(`All translation services failed for language: ${targetLanguage}`);
  return text;
}

export async function translateQuizQuestion(question: any, targetLanguage: string): Promise<any> {
  if (targetLanguage === 'en') {
    return question;
  }

  try {
    // Translate question text
    const translatedQuestion = await translateText(question.question || question.text, targetLanguage);
    
    // Translate options
    const translatedOptions = await Promise.all(
      question.options?.map(async (option: any) => ({
        ...option,
        text: await translateText(option.text, targetLanguage)
      })) || []
    );

    return {
      ...question,
      question: translatedQuestion,
      text: translatedQuestion, // Support both formats
      options: translatedOptions
    };
  } catch (error) {
    console.error('Error translating quiz question:', error);
    return question; // Return original on error
  }
}

export async function translateMultipleTexts(texts: string[], targetLanguage: string): Promise<string[]> {
  if (targetLanguage === 'en') {
    return texts;
  }

  const translations = await Promise.all(
    texts.map(text => translateText(text, targetLanguage))
  );

  return translations;
}