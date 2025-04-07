import { useState, useEffect, useCallback } from 'react';
import { Audio } from 'expo-av';
import { startRecording, stopRecording } from '../services/speechService';

interface SpeechHookReturn {
  isRecording: boolean;
  speechText: string;
  error: string | null;
  toggleRecording: () => Promise<void>;
  clearSpeechText: () => void;
  recordingStatus: string;
}

export const useSpeech = (): SpeechHookReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [speechText, setSpeechText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingStatus, setRecordingStatus] = useState('idle');

  const toggleRecording = useCallback(async () => {
    try {
      if (isRecording) {
        setRecordingStatus('processing');
        const { text } = await stopRecording(recording);
        setRecording(null);
        setSpeechText(prev => prev ? `${prev} ${text}` : text);
        setError(null);
        setRecordingStatus('idle');
      } else {
        setError(null);
        setRecordingStatus('starting');
        const newRecording = await startRecording();
        setRecording(newRecording);
        setRecordingStatus('recording');
      }
      setIsRecording(prev => !prev);
    } catch (err) {
      console.error('Recording error:', err);
      setError(err instanceof Error ? err.message : 'Recording error');
      setIsRecording(false);
      setRecording(null);
      setRecordingStatus('error');
      
      if (recording) {
        try {
          await stopRecording(recording);
        } catch (cleanupError) {
          console.error('Cleanup error:', cleanupError);
        }
      }
    }
  }, [isRecording, recording]);

  const clearSpeechText = useCallback(() => {
    setSpeechText('');
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      if (recording) {
        stopRecording(recording).catch(() => {});
      }
    };
  }, [recording]);

  return {
    isRecording,
    speechText,
    error,
    toggleRecording,
    clearSpeechText,
    recordingStatus,
  };
};