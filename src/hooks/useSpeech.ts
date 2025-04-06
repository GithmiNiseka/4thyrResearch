import { useState, useEffect } from 'react';
import { startRecording, stopRecording } from '../services/speechService';

export const useSpeech = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [speechText, setSpeechText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const toggleRecording = async () => {
    try {
      if (isRecording) {
        // Stop recording
        const text = await stopRecording();
        setSpeechText(prev => prev ? `${prev} ${text}` : text);
        setError(null);
      } else {
        // Start recording
        setError(null);
        const success = await startRecording();
        if (!success) {
          throw new Error('Failed to start recording');
        }
      }
      setIsRecording(!isRecording);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Recording error');
      setIsRecording(false);
    }
  };

  useEffect(() => {
    return () => {
      if (isRecording) {
        stopRecording().catch(() => {});
      }
    };
  }, [isRecording]);

  const clearSpeechText = () => setSpeechText('');

  return {
    isRecording,
    speechText,
    error,
    toggleRecording,
    clearSpeechText,
  };
};