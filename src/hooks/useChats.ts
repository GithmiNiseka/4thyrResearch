import { useState } from 'react';
import { Message, ChatState } from '../types/chatTypes';
import { generateResponse } from '../services/geminiService';

export const useChat = (initialState: ChatState = { messages: [], loading: false, error: null }) => {
  const [chatState, setChatState] = useState<ChatState>(initialState);

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
    };
    
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
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
    
    addMessage({
      text,
      sender: 'doctor',
    });
    
    await generatePatientResponses(text);
  };

  const selectPatientResponse = (text: string) => {
    addMessage({
      text,
      sender: 'patient',
      isOption: false,
    });
  };

  return {
    chatState,
    sendDoctorMessage,
    selectPatientResponse,
  };
};