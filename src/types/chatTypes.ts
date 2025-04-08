export type Message = {
  id: string;
  text: string;
  sender: 'doctor' | 'patient';
  isOption?: boolean;
  isEdited?: boolean;
  isTranscription?: boolean;
  confidence?: number; // 0-1 scale
  timestamp: string;
  hoverData?: HoverData | null;
};

export type HoverData = {
  term: string;
  english: string;
  imgUrl: string;
};

export interface RecordingState {
  isRecording: boolean;
  isProcessing: boolean;
  audioLevel: number; // For waveform
  elapsedTime: number; // Seconds
}

export type ChatState = {
  messages: Message[];
  loading: boolean;
  audioLoading: boolean;
  error: string | null;
  speakingMessageId: string | null;
  editingMessageId: string | null;
  editText: string;
  isRecording?: boolean; // Add this if you want to track recording state in the hook
};

export interface ChatBubbleProps {
  message: Message;
  onSelect?: (text: string) => void;
  onSpeak?: (messageId: string, text: string) => void;
  onEdit?: (messageId: string) => void;
  isSpeaking?: boolean;
  isAudioLoading?: boolean;
  isOptionLoading?: boolean;
  isEditing?: boolean;
  editText?: string;
  onSaveEdit?: () => void;
  onCancelEdit?: () => void;
  onUpdateEditText?: (text: string) => void;
  onWordPress?: (word: string) => void; // Add this line
}

export type GeminiResponse = {
  options: string[];
  error?: string;
};

export interface TranscriptionResponse {
  transcript?: string;
  error?: string;
  details?: string;
}

export interface AudioFormData {
  uri: string;
  type: string;
  name: string;
}