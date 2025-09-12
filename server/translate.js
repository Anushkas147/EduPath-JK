import fetch from 'node-fetch';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Language mapping for LibreTranslate
const languages = {
  hi: 'hi',      // Hindi
  mr: 'mr',      // Marathi  
  ur: 'ur',      // Urdu
  pa: 'pa'       // Punjabi
};

const placeholderLanguages = {
  ks: 'Kashmiri',
  doi: 'Dogri'
};

async function translateText(text, targetLanguage) {
  try {
    // Using LibreTranslate API (free service)
    const response = await fetch('https://libretranslate.de/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: text,
        source: 'en',
        target: targetLanguage,
        format: 'text'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.translatedText || text;
  } catch (error) {
    console.error(`Error translating to ${targetLanguage}:`, error.message);
    // Return original text as fallback
    return text;
  }
}

async function translateQuizData() {
  try {
    console.log('Reading quiz questions...');
    
    // Read the original quiz questions
    const quizPath = path.join(__dirname, '../client/src/data/quiz-questions.json');
    const quizData = JSON.parse(await fs.readFile(quizPath, 'utf8'));
    
    console.log(`Found ${quizData.length} questions to translate`);
    
    const translatedQuizData = [];

    for (let i = 0; i < quizData.length; i++) {
      const question = quizData[i];
      console.log(`Translating question ${i + 1}/${quizData.length}...`);
      
      // Create the multilingual structure
      const multilingualQuestion = {
        id: question.id,
        type: question.type,
        question: {
          en: question.question
        },
        options: []
      };

      // Translate question text to all languages
      for (const [langCode, googleLangCode] of Object.entries(languages)) {
        try {
          const translation = await translateText(question.question, googleLangCode);
          multilingualQuestion.question[langCode] = translation;
          // Add small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Failed to translate question to ${langCode}:`, error);
          multilingualQuestion.question[langCode] = `Translation error - ${langCode}`;
        }
      }

      // Add placeholder translations for unsupported languages
      for (const [langCode, languageName] of Object.entries(placeholderLanguages)) {
        multilingualQuestion.question[langCode] = `TODO - ${languageName} translation`;
      }

      // Translate options
      for (const option of question.options) {
        const multilingualOption = {
          id: option.id,
          text: {
            en: option.text
          },
          weights: option.weights
        };

        // Translate option text to all languages
        for (const [langCode, googleLangCode] of Object.entries(languages)) {
          try {
            const translation = await translateText(option.text, googleLangCode);
            multilingualOption.text[langCode] = translation;
            // Add small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.error(`Failed to translate option to ${langCode}:`, error);
            multilingualOption.text[langCode] = `Translation error - ${langCode}`;
          }
        }

        // Add placeholder translations for unsupported languages
        for (const [langCode, languageName] of Object.entries(placeholderLanguages)) {
          multilingualOption.text[langCode] = `TODO - ${languageName} translation`;
        }

        multilingualQuestion.options.push(multilingualOption);
      }

      translatedQuizData.push(multilingualQuestion);
    }

    // Save the multilingual quiz data
    const outputPath = path.join(__dirname, '../client/src/data/quiz-questions-multilingual.json');
    await fs.writeFile(outputPath, JSON.stringify(translatedQuizData, null, 2), 'utf8');
    
    console.log(`\n✓ Translation complete! Saved multilingual quiz to: ${outputPath}`);
    console.log(`✓ Generated translations for ${translatedQuizData.length} questions`);
    console.log(`✓ Supported languages: English, Hindi, Marathi, Urdu, Punjabi`);
    console.log(`✓ Placeholder languages: Kashmiri, Dogri`);
    
  } catch (error) {
    console.error('Translation failed:', error);
    process.exit(1);
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  translateQuizData();
}

export { translateQuizData };