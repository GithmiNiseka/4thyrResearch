import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Alert,
  Text,
  Image,
} from 'react-native';
import { useChat } from '../hooks/useChats';
import ChatBubble from '../components/ChatBubble';
import { theme } from '../theme';
import { Audio } from 'expo-av';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';

const ChatScreen: React.FC = () => {
  const {
    chatState,
    sendDoctorMessage,
    selectPatientResponse,
    handleSpeak,
    addMessage,
    startEditing,
    saveEditing,
    cancelEditing,
    updateEditText,
    cleanupSound,
    handleWordPress
  } = useChat();

  const [inputText, setInputText] = useState('');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);

  // Check if text contains only Sinhala characters, digits, and allowed punctuation
  const isValidSinhalaText = (text: string) => {
    // Sinhala Unicode ranges: U+0D80 to U+0DFF
    const sinhalaRegex = /^[\u0D80-\u0DFF 0-9.,!?;:'"()\[\]{}«»‹›‘’“”\-]*$/;
    return sinhalaRegex.test(text);
  };

  const validateInput = (text: string) => {
    if (!isValidSinhalaText(text)) {
      setErrorMessage('කරුණාකර සිංහල අකුරු, ඉලක්කම් හෝ විරාම සංකේත පමණක් භාවිතා කරන්න');
    } else {
      setErrorMessage('');
    }
    setInputText(text);
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;
    
    try {
      // Final validation before sending
      if (!isValidSinhalaText(inputText)) {
        setErrorMessage('කරුණාකර සිංහල අකුරු, ඉලක්කම් හෝ විරාම සංකේත පමණක් භාවිතා කරන්න');
        return;
      }

      setErrorMessage('');
      
      await addMessage({
        text: inputText,
        sender: 'patient',
        isOption: false
      }, true);
      
      setInputText('');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400 && error.response?.data?.user_message) {
          setErrorMessage(error.response.data.user_message);
        } else {
          setErrorMessage('පණිවිඩය යැවීමේදී දෝෂයක් ඇතිවිය. කරුණාකර නැවත උත්සාහ කරන්න');
        }
      } else {
        setErrorMessage('පණිවිඩය යැවීමේදී දෝෂයක් ඇතිවිය');
      }
      console.error('Message sending error:', error);
    }
  };

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      setErrorMessage(''); // Clear errors when starting recording
    } catch (err) {
      console.error('Failed to start recording', err);
      setErrorMessage('පටිගත කිරීම ආරම්භ කිරීමට නොහැකි විය');
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    if (!recording) return;
    
    try {
      setIsTranscribing(true);
      setErrorMessage(''); // Clear errors before transcription
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      if (!uri) {
        throw new Error('Recording failed - no audio file');
      }

      const formData = new FormData();
      formData.append('audio', {
        uri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      } as any);

      const response = await axios.post<{ transcript?: string }>(
        'http://192.168.155.17:5000/transcribe',
        formData,
        { 
          headers: { 
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json'
          },
          timeout: 20000
        }
      );

      if (response.data.transcript) {
        await sendDoctorMessage(response.data.transcript);
      } else {
        throw new Error('No transcript received');
      }
      
    } catch (error) {
      console.error('Transcription error:', error);
      setErrorMessage('සවන් දීමේ දෝෂයක් ඇතිවිය. කරුණාකර නැවත උත්සාහ කරන්න');
    } finally {
      setIsTranscribing(false);
      setRecording(null);
    }
  };

  const cancelRecording = async () => {
    setIsRecording(false);
    if (recording) {
      await recording.stopAndUnloadAsync();
      setRecording(null);
    }
    setErrorMessage(''); // Clear errors when cancelling
  };

  useEffect(() => {
    return () => {
      cleanupSound();
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [chatState.messages]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <FlatList
            ref={flatListRef}
            data={chatState.messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ChatBubble
                message={item}
                onSelect={item.isOption ? selectPatientResponse : undefined}
                onSpeak={async (messageId, text) => {
                  try {
                    await handleSpeak(messageId, text);
                  } catch (error) {
                    if (axios.isAxiosError(error) && error.response?.status === 400) {
                      setErrorMessage('කථිත පණිවිඩය ජනනය කිරීමට නොහැකි විය: සිංහල අකුරු පමණක් භාවිතා කරන්න');
                    } else {
                      setErrorMessage('කථිත පණිවිඩය ජනනය කිරීමේ දෝෂයක් ඇතිවිය');
                    }
                  }
                }}
                onEdit={startEditing}
                isSpeaking={chatState.speakingMessageId === item.id}
                isAudioLoading={
                  chatState.audioLoading &&
                  chatState.speakingMessageId === item.id
                }
                isOptionLoading={chatState.loading && item.isOption}
                isEditing={chatState.editingMessageId === item.id}
                editText={chatState.editText}
                onSaveEdit={saveEditing}
                onCancelEdit={cancelEditing}
                onUpdateEditText={updateEditText}
                onWordPress={(word) => handleWordPress(word, item.id)}
              />
            )}
            contentContainerStyle={styles.messagesContainer}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
          />

          {errorMessage && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                {errorMessage}
              </Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            {isRecording && (
              <TouchableOpacity
                style={styles.cancelRecordingButton}
                onPress={cancelRecording}
              >
                <Image
                  source={require('../../assets/images/cancel.png')}
                  style={styles.cancelIcon}
                />
              </TouchableOpacity>
            )}

            <TextInput
              style={[
                styles.input,
                isRecording && styles.inputDuringRecording,
                errorMessage ? styles.inputError : {}
              ]}
              value={inputText}
              onChangeText={validateInput}
              placeholder={isRecording ? "තවමත් පටිගත වෙමින් පවතී..." : "ඔබේ ප්‍රශ්නය මෙහි ටයිප් කරන්න..."}
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
              editable={!isRecording}
            />

            <TouchableOpacity
              style={[
                styles.voiceButton,
                isRecording && styles.voiceButtonActive,
                isTranscribing && styles.voiceButtonProcessing
              ]}
              onPress={isRecording ? stopRecording : startRecording}
              disabled={isTranscribing}
            >
              {isTranscribing ? (
                  <ActivityIndicator color={theme.colors.primary} />
              ) : (
                <Image
                  source={
                    isRecording
                      ? require('../../assets/images/done.png')
                      : require('../../assets/images/recordingCircle.png')
                  }
                  style={[
                    styles.voiceIcon,
                    !isRecording && styles.doneIcon 
                  ]}
                />
              )}
            </TouchableOpacity>

            {!isRecording && (
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (chatState.loading || !inputText.trim() || !!errorMessage) &&
                    styles.sendButtonDisabled,
                ]}
                onPress={handleSend}
                disabled={chatState.loading || !inputText.trim() || !!errorMessage}
              >
                {chatState.loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Image
                    source={require('../../assets/images/send.png')}
                    style={[
                      styles.sendIcon,
                      { 
                        tintColor: chatState.loading || !inputText.trim() || !!errorMessage
                          ? theme.colors.white 
                          : theme.colors.primary 
                      }
                    ]}
                  />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  inner: {
    flex: 1,
    justifyContent: 'space-between',
  },
  messagesContainer: {
    padding: theme.spacing.medium,
    paddingBottom: 120,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: theme.spacing.medium,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.extraLarge,
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
    marginRight: theme.spacing.medium,
    minHeight: 40,
    maxHeight: 100,
  },
  inputDuringRecording: {
    backgroundColor: theme.colors.surfaceContainer,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.primary,
    borderWidth: 2,
    borderRadius: 50,
    width: 44,
    height: 44,
  },
  sendButtonDisabled: {
    opacity: 0.5,
    backgroundColor: theme.colors.textSecondary,
    borderColor: theme.colors.textSecondary,
  },
  sendIcon: {
    width: 22,
    height: 24,
  },
  voiceButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.borderRadius.extraLarge,
    width: 50,
    height: 50,
  },
  voiceButtonActive: {},
  voiceButtonProcessing: {},
  doneIcon: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
  },
  voiceIcon: {
    width: 34,
    height: 34,
    resizeMode: 'contain',
  },
  cancelRecordingButton: {
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.small,
  },
  cancelIcon: {
    width: 28,
    height: 28,
    tintColor: theme.colors.primary,
  },
  errorContainer: {
    backgroundColor: '#FFF4F4', // soft red-tinted background
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2, // Android shadow
  },
  
  errorText: {
    color: '#B00020', // friendly but noticeable red
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'left',
  },
  
  
  
});

export default ChatScreen;
