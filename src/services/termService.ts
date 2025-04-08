// services/termService.ts
import axios from 'axios';

const GOOGLE_TRANSLATE_API_KEY = 'API_KEY';

interface WikipediaPage {
    thumbnail?: {
      source: string;
    };
    // other page properties if needed
  }
  
  interface WikipediaResponse {
    query: {
      pages: {
        [key: string]: WikipediaPage;
      };
    };
  }

export const translateSinhalaToEnglish = async (text: string) => {
  try {
    const res = await axios.post(
      'https://translation.googleapis.com/language/translate/v2',
      {},
      {
        params: {
          q: text,
          target: 'en',
          source: 'si',
          key: GOOGLE_TRANSLATE_API_KEY,
        },
      }
    );
    return res.data.data.translations[0].translatedText;
  } catch (err) {
    console.error('Translation error:', err);
    throw new Error('Translation service unavailable');
  }
};

export const getWikipediaImage = async (englishTerm: string) => {
    try {
      const res = await axios.get<WikipediaResponse>('https://en.wikipedia.org/w/api.php', {
        params: {
          action: 'query',
          format: 'json',
          origin: '*',
          prop: 'pageimages',
          titles: englishTerm,
          pithumbsize: 300,
        },
      });

    const pages = res.data.query.pages;
    const page = Object.values(pages)[0];
    return page?.thumbnail?.source || null;
  } catch (err) {
    console.error('Image fetch error:', err);
    throw new Error("Couldn't load medical image");
  }
};