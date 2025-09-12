import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useLanguage } from '@/components/LanguageSwitcher';

// Cache for translations to avoid repeated API calls
const translationCache = new Map<string, string>();

function getCacheKey(text: string, language: string): string {
  return `${language}-${text.substring(0, 50)}`;
}

export function useTranslation() {
  const currentLanguage = useLanguage();
  const [isTranslating, setIsTranslating] = useState(false);

  const translate = async (text: string, targetLanguage?: string): Promise<string> => {
    const language = targetLanguage || currentLanguage;
    
    // Return original text for English
    if (language === 'en' || !text || text.trim() === '') {
      return text;
    }

    // Check cache first
    const cacheKey = getCacheKey(text, language);
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey)!;
    }

    try {
      setIsTranslating(true);
      const response: any = await apiRequest('POST', '/api/translate', {
        text,
        targetLanguage: language
      });
      
      const translatedText = response.translatedText || text;
      
      // Cache the translation
      translationCache.set(cacheKey, translatedText);
      
      return translatedText;
    } catch (error) {
      console.warn('Translation failed, using original text:', error);
      return text;
    } finally {
      setIsTranslating(false);
    }
  };

  const translateQuizQuestion = async (question: any, targetLanguage?: string): Promise<any> => {
    const language = targetLanguage || currentLanguage;
    
    if (language === 'en') {
      return question;
    }

    try {
      setIsTranslating(true);
      const response = await apiRequest('POST', '/api/translate/quiz-question', {
        question,
        targetLanguage: language
      });
      
      return response;
    } catch (error) {
      console.warn('Quiz question translation failed, using original:', error);
      return question;
    } finally {
      setIsTranslating(false);
    }
  };

  return {
    translate,
    translateQuizQuestion,
    isTranslating,
    currentLanguage
  };
}

// Hook for translating text with automatic re-translation on language change
export function useTranslatedText(originalText: string): string {
  const { translate, currentLanguage } = useTranslation();
  const [translatedText, setTranslatedText] = useState(originalText);

  useEffect(() => {
    if (currentLanguage === 'en') {
      setTranslatedText(originalText);
      return;
    }

    translate(originalText).then(setTranslatedText);
  }, [originalText, currentLanguage, translate]);

  return translatedText;
}