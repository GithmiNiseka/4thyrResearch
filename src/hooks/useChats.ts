import { useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import { Message, ChatState } from '../types/chatTypes';
import { generateResponse } from '../services/geminiService';
import { speakText, stopSpeech } from '../services/speechService';

export const useChat = (initialState: Partial<ChatState> = {}) => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    loading: false,
    audioLoading: false,
    error: null,
    speakingMessageId: null,
    editingMessageId: null,
    editText: '',
    ...initialState,
    
  });
  
  const [sound, setSound] = useState<Audio.Sound | null>(null);

// hooks/useChat.ts
const handleSpeak = async (messageId: string, text: string) => {
  // If clicking the same message that's currently speaking, stop it
  if (chatState.speakingMessageId === messageId) {
    setChatState(prev => ({ ...prev, audioLoading: true }));
    try {
      setSound(await stopSpeech(sound));
      setChatState(prev => ({ ...prev, speakingMessageId: null }));
    } finally {
      setChatState(prev => ({ ...prev, audioLoading: false }));
    }
    return;
  }

  setChatState(prev => ({ ...prev, audioLoading: true }));
  try {
    setChatState(prev => ({ ...prev, speakingMessageId: messageId }));
    const newSound = await speakText(text, sound);
    
    if (newSound) {
      setSound(newSound);
      // Set speaking to false when playback finishes
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setChatState(prev => ({ ...prev, speakingMessageId: null }));
        }
      });
    } else {
      setChatState(prev => ({ ...prev, speakingMessageId: null }));
      throw new Error('Failed to generate speech');
    }
  } catch (error) {
    console.error('Speech playback error:', error);
    setSound(await stopSpeech(sound));
    setChatState(prev => ({ 
      ...prev, 
      speakingMessageId: null,
      error: error instanceof Error ? error.message : 'Speech error'
    }));
  } finally {
    setChatState(prev => ({ ...prev, audioLoading: false }));
  }
};
  
  useEffect(() => {
    return () => {
      stopSpeech(sound); // Cleanup on unmount
    };
  }, [sound]);

  const addMessage = async (message: Omit<Message, 'id' | 'timestamp'>, speak = false) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
    };
    
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));
  
    if (speak && message.sender === 'patient') {
      await handleSpeak(newMessage.id, newMessage.text);
    }
  };

  const generatePatientResponses = async (doctorQuestion: string) => {
    setChatState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { options } = await generateResponse(doctorQuestion);
      
      const responseMessages = options.map((text, index) => ({
        id: (Date.now() + index).toString(),
        text,
        sender: 'patient' as const,
        isOption: true,
        timestamp: new Date().toLocaleTimeString(),
      }));
      
      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, ...responseMessages],
      }));
    } catch (error) {
      setChatState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to generate responses',
      }));
    } finally {
      setChatState(prev => ({ ...prev, loading: false }));
    }
  };

  const sendDoctorMessage = async (text: string) => {
    if (!text.trim()) return;
    
    await addMessage({
      text,
      sender: 'doctor',
    });
    
    await generatePatientResponses(text);
  };

  const selectPatientResponse = async (text: string) => {
    await addMessage({
      text,
      sender: 'patient',
      isOption: false,
    }, true); // Speak the selected response
  };

  // Clean up sound when component unmounts
  const cleanupSound = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
    }
  };
  // ... existing functions ...

  const startEditing = (messageId: string) => {
    const message = chatState.messages.find(m => m.id === messageId);
    if (message) {
      setChatState(prev => ({
        ...prev,
        editingMessageId: messageId,
        editText: message.text
      }));
    }
  };
  
  const saveEditing = () => {
    if (!chatState.editingMessageId) return;
  
    setChatState(prev => ({
      ...prev,
      messages: prev.messages.map(message => 
        message.id === prev.editingMessageId 
          ? { ...message, text: prev.editText, isEdited: true }
          : message
      ),
      editingMessageId: null,
      editText: ''
    }));
  };
  
  const cancelEditing = () => {
    setChatState(prev => ({
      ...prev,
      editingMessageId: null,
      editText: ''
    }));
  };
  
  const updateEditText = (text: string) => {
    setChatState(prev => ({ ...prev, editText: text }));
  };

  return {
    chatState,
    sendDoctorMessage,
    selectPatientResponse,
    handleSpeak,
    startEditing,    // Make sure these are included
    saveEditing,     // in your hook's return
    cancelEditing,   // statement
    updateEditText,  // (previously called updateEditing)
    cleanupSound,
    addMessage
  };
};