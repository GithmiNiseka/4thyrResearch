// services/geminiService.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY, GEMINI_MODEL } from '../config/api';
import { GeminiResponse } from '../types/chatTypes';

export const generateResponse = async (doctorQuestion: string): Promise<GeminiResponse> => {
  if (!doctorQuestion || doctorQuestion.trim() === '') {
    return {
      options: [
        'කරුණාකර වලංගු ප්‍රශ්නයක් ඇතුළත් කරන්න.',
        'මට පිළිතුරු දීමට ප්‍රශ්නයක් අවශ්‍යයි.',
        'ප්‍රශ්නය හිස් ය.'
      ]
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const prompt = `
    You are a medical assistant helping doctors communicate with Sinhala-speaking patients.
    STRICTLY FOLLOW THESE RULES:
    1. Respond ONLY in Sinhala script (සිංහල අක්ෂර)
    2. Never use English letters, numbers or symbols
    3. Format responses exactly like this:

    ප්‍රතිචාරය 1: [Full Sinhala sentence]
    ප්‍රතිචාරය 2: [Full Sinhala sentence]
    ප්‍රතිචාරය 3: [Full Sinhala sentence]

    Doctor's question: ${doctorQuestion}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse and validate responses
    const options = text.split('\n')
      .filter(line => line.includes('ප්‍රතිචාරය') || line.includes(':'))
      .map(line => {
        const parts = line.split(':');
        return parts.length > 1 ? parts[1].trim() : '';
      })
      .filter(option => 
        option.length > 0 && 
        !/[a-zA-Z0-9]/.test(option) // No English letters/numbers
      );

    return {
      options: options.length >= 3 ? options.slice(0, 3) : [
        'මට ඔබේ ප්‍රශ්නය තේරුම් ගැනීමට අපහසු විය',
        'කරුණාකර නැවත පැහැදිලි කරන්න',
        'මට පිළිතුරු දීමට අපහසුයි'
      ]
    };
  } catch (error) {
    console.error('Error generating response:', error);
    return {
      options: [
        'දෝෂයක් සිදුවිය. කරුණාකර නැවත උත්සාහ කරන්න.',
        'මට පිළිතුරු ජනනය කිරීමට නොහැකි විය.',
        'කරුණාකර පසුව උත්සාහ කරන්න.'
      ]
    };
  }
};


// import { GoogleGenerativeAI } from '@google/generative-ai';
// import { GEMINI_API_KEY, GEMINI_MODEL } from '../config/api';
// import { GeminiResponse } from '../types/chatTypes';

// export const generateResponse = async (doctorQuestion: string): Promise<GeminiResponse> => {
//   if (!doctorQuestion || doctorQuestion.trim() === '') {
//     return {
//       options: [
//         'කරුණාකර වලංගු ප්‍රශ්නයක් ඇතුළත් කරන්න.',
//         'මට පිළිතුරු දීමට ප්‍රශ්නයක් අවශ්‍යයි.',
//         'ප්‍රශ්නය හිස් ය.'
//       ]
//     };
//   }

//   try {
//     const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
//     const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

//     // Properly formatted system instruction as Content object
//     const systemInstruction = {
//       role: "model",
//       parts: [{
//         text: `You are a medical assistant helping doctors communicate with patients in Sinhala.
//         When a doctor asks a question, generate 3 possible responses that a patient might give in Sinhala.
//         The responses should be:
//         1. Short and simple
//         2. Culturally appropriate for Sri Lankan patients
//         3. Relevant to the medical context
//         4. In Sinhala language only
//         5. Responses must be in Sinhala script only. Do not use English letters.

//         Format your response as:
//         1. [First response option in complete sinhala]
//         2. [Second response option in complete sinhala]
//         3. [Third response option in complete sinhala]`
//       }]
//     };

//     const chat = model.startChat({
//       systemInstruction: systemInstruction,
//       generationConfig: {
//         maxOutputTokens: 500,
//         temperature: 0.7,
//       },
//     });

//     const result = await chat.sendMessage(doctorQuestion);
//     const response = await result.response;
//     const text = response.text();

//     // Parse the response to extract the 3 options
//     const options = text.split('\n')
//       .filter(line => line.match(/^\d+\./))
//       .map(line => line.replace(/^\d+\.\s*/, '').trim())
//       .filter(option => option.length > 0);

//     return {
//       options: options.length >= 3 ? options.slice(0, 3) : [
//         'මට ඔබේ ප්‍රශ්නය තේරුම් ගත නොහැකි විය.',
//         'කරුණාකර එය නැවත පැහැදිලි කරන්න.',
//         'මට මේ මොහොතේ පිළිතුරු දීමට අපහසුයි.'
//       ]
//     };
//   } catch (error) {
//     console.error('Error generating response:', error);
//     return {
//       options: [
//         'දෝෂයක් සිදුවිය. කරුණාකර නැවත උත්සාහ කරන්න.',
//         'මට පිළිතුරු ජනනය කිරීමට නොහැකි විය.',
//         'කරුණාකර පසුව උත්සාහ කරන්න.'
//       ],
//       error: error instanceof Error ? error.message : 'Unknown error'
//     };
//   }
// };