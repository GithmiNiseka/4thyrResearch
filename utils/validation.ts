// utils/validation.ts
export const isPureSinhala = (text: string): boolean => {
    // Sinhala Unicode range + common punctuation
    return /^[\u0D80-\u0DFF\s\u2013\u2014\u2018\u2019\u201C\u201D!?,.:;"'-]+$/.test(text);
  };
  
  export const filterToSinhala = (text: string): string => {
    return text.replace(/[^\u0D80-\u0DFF\s\u2013\u2014\u2018\u2019\u201C\u201D!?,.:;"'-]/g, '');
  };