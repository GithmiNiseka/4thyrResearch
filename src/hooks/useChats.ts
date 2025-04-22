import { useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import { Message, ChatState } from '../types/chatTypes';
import { generateResponse } from '../services/geminiService';
import { speakText, stopSpeech } from '../services/speechService';
import { translateSinhalaToEnglish, getWikipediaImage } from '../services/termService';

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

  const handleWordPress = async (word: string, messageId: string) => {
    try {
      const englishTerm = await translateSinhalaToEnglish(word);
      const imgUrl = await getWikipediaImage(englishTerm);
      
      if (imgUrl) {
        setChatState(prev => ({
          ...prev,
          messages: prev.messages.map(msg => 
            msg.id === messageId 
              ? { 
                  ...msg, 
                  hoverData: { term: word, english: englishTerm, imgUrl } 
                } 
              : msg
          )
        }));
      }
    } catch (error) {
      console.error('Error fetching term data:', error);
    }
  };

  const handleSpeak = async (messageId: string, text: string) => {
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
      stopSpeech(sound);
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

  const removeGeneratedOptions = () => {
    setChatState(prev => ({
      ...prev,
      messages: prev.messages.filter(msg => !(msg.sender === 'patient' && msg.isOption))
    }));
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
    
    // Remove any existing patient options before adding new message
    removeGeneratedOptions();
    
    await addMessage({
      text,
      sender: 'doctor',
    });
    
    await generatePatientResponses(text);
  };

  const selectPatientResponse = async (text: string) => {
    // Remove all options before adding the selected response
    removeGeneratedOptions();
    
    await addMessage({
      text,
      sender: 'patient',
      isOption: false,
    }, true);
  };

  const cleanupSound = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
    }
  };

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
    startEditing,
    saveEditing,
    cancelEditing,
    updateEditText,
    cleanupSound,
    addMessage,
    handleWordPress,
  };
};