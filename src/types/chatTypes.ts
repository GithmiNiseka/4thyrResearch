export type Message = {
    id: string;
    text: string;
    sender: 'doctor' | 'patient';
    isOption?: boolean;
    timestamp: string;
  };
  
  export type ChatState = {
    messages: Message[];
    loading: boolean;
    error: string | null;
  };
  
  export type GeminiResponse = {
    options: string[];
    error?: string;
  };

  export type SpeechState = {
    isRecording: boolean;
    recognizedText: string;
    error?: string;
  };