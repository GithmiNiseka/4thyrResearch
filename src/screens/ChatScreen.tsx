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
    handleWordPress // Add this destructuring
  } = useChat();

  const [inputText, setInputText] = useState('');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    // Add as patient message (right side)
    addMessage({
      text: inputText,
      sender: 'patient',
      isOption: false
    }, true); // true = speak this message
    
    setInputText('');
  };

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
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    if (!recording) return;
    
    try {
      setIsTranscribing(true);
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
        'http://192.168.181.17:5000/transcribe',
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
        // Send directly as a doctor message
        await sendDoctorMessage(response.data.transcript);
      } else {
        throw new Error('No transcript received');
      }
      
    } catch (error) {
      console.error('Transcription error:', error);
      Alert.alert(
        'Transcription Failed', 
        'Could not transcribe your voice message. Please try again.'
      );
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
                onSpeak={handleSpeak}
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
                onWordPress={(word) => handleWordPress(word, item.id)} // Make sure this is passed
                />
            )}
            contentContainerStyle={styles.messagesContainer}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
          />

          <View style={styles.inputContainer}>
            {isRecording && (
              <TouchableOpacity
                style={styles.cancelRecordingButton}
                onPress={cancelRecording}
              >
                <Text style={styles.cancelRecordingButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}

            <TextInput
              style={[
                styles.input,
                isRecording && styles.inputDuringRecording
              ]}
              value={inputText}
              onChangeText={setInputText}
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
                <ActivityIndicator color="white" />
              ) : (
                <MaterialIcons 
                  name={isRecording ? "mic-off" : "mic"} 
                  size={24} 
                  color="white" 
                />
              )}
            </TouchableOpacity>

            {!isRecording && (
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (chatState.loading || !inputText.trim()) &&
                    styles.sendButtonDisabled,
                ]}
                onPress={handleSend}
                disabled={chatState.loading || !inputText.trim()}
              >
                <Text style={styles.sendButtonText}>
                  {chatState.loading ? '...' : 'send'}
                </Text>
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
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.extraLarge,
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
  },
  sendButtonDisabled: {
    opacity: 0.5,
    backgroundColor: theme.colors.textSecondary,
  },
  sendButtonText: {
    color: theme.colors.white,
    fontWeight: 'bold',
  },
  voiceButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.extraLarge,
    width: 50,
    height: 50,
  },
  voiceButtonActive: {
    backgroundColor: theme.colors.error,
  },
  voiceButtonProcessing: {
    backgroundColor: theme.colors.warning,
  },
  cancelRecordingButton: {
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.small,
  },
  cancelRecordingButtonText: {
    color: theme.colors.error,
    fontWeight: 'bold',
  },
});

export default ChatScreen;