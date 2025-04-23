import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  TextInput,
  Image, 
  View as RNView 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { HoverData } from '../types/chatTypes';

interface ChatBubbleProps {
  message: {
    id: string;
    text: string;
    sender: 'doctor' | 'patient';
    isOption?: boolean;
    isEdited?: boolean;
    isTranscription?: boolean;
    timestamp: string;
    hoverData?: HoverData | null;
  };
  onSelect?: (text: string) => void;
  onSpeak?: (messageId: string, text: string) => void;
  onEdit?: (messageId: string) => void;
  onWordPress?: (word: string) => void;
  isSpeaking?: boolean;
  isAudioLoading?: boolean;
  isOptionLoading?: boolean;
  isEditing?: boolean;
  editText?: string;
  onSaveEdit?: () => void;
  onCancelEdit?: () => void;
  onUpdateEditText?: (text: string) => void;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  onSelect,
  onSpeak,
  onEdit,
  onWordPress,
  isSpeaking = false,
  isAudioLoading = false,
  isOptionLoading = false,
  isEditing = false,
  editText = '',
  onSaveEdit = () => {},
  onCancelEdit = () => {},
  onUpdateEditText = () => {},
}) => {
  if (isEditing) {
    return (
      <View style={[
        styles.editingContainer,
        message.sender === 'doctor' ? styles.doctorEditing : styles.patientEditing
      ]}>
        <TextInput
          style={styles.editInput}
          value={editText}
          onChangeText={onUpdateEditText}
          multiline
          autoFocus
        />
        <View style={styles.editButtons}>
          <TouchableOpacity 
            style={[styles.editButton, styles.saveButton]}
            onPress={onSaveEdit}
          >
            <MaterialIcons name="check" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.editButton, styles.cancelButton]}
            onPress={onCancelEdit}
          >
            <MaterialIcons name="close" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[
      styles.bubbleContainer,
      message.sender === 'doctor' ? styles.doctorContainer : styles.patientContainer
    ]}>
      {/* Bubble pointer */}
      <View style={[
        styles.bubblePointer,
        message.sender === 'doctor' ? styles.doctorPointer : styles.patientPointer
      ]} />
      
      {/* Message content */}
      <View style={[
        styles.bubble,
        message.sender === 'doctor' ? styles.doctorBubble : styles.patientBubble
      ]}>
        {message.isTranscription && (
          <Text style={styles.transcriptionLabel}>Transcription</Text>
        )}
        
        <View style={styles.messageHeader}>
          <Text style={[
            message.sender === 'doctor' ? styles.doctorText : styles.patientText
          ]}>
            {message.text.split(' ').map((word: string, index: number) => (
              <TouchableOpacity 
                key={`${word}-${index}`} 
                onPress={() => onWordPress?.(word)}
              >
                <Text style={[
                  message.sender === 'doctor' ? styles.doctorText : styles.patientText,
                  message.hoverData?.term === word && styles.highlightedWord
                ]}>
                  {word + ' '}
                </Text>
              </TouchableOpacity>
            ))}
            {message.isEdited && (
              <Text style={[
                styles.editedLabel,
                message.sender === 'doctor' ? { color: 'rgba(255,255,255,0.7)' } : {}
              ]}> (edited)</Text>
            )}
          </Text>
          
          {message.sender === 'patient' && message.isOption && (
            <TouchableOpacity 
            style={styles.editIconButton}
            onPress={() => onEdit?.(message.id)}
            activeOpacity={0.7}
          >
            <View style={styles.editIconContainer}>
              <MaterialIcons 
                name="edit" 
                size={18} 
                color={theme.colors.primary}
              />
            </View>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.footer}>
          <Text style={[
            styles.timestamp,
            message.sender === 'doctor' ? { color: 'rgba(255,255,255,0.7)' } : {}
          ]}>
            {message.timestamp}
          </Text>
          
          {/* Only show speaker icon for patient messages that aren't options */}
          {message.sender === 'patient' && !message.isOption && onSpeak && (
            <TouchableOpacity 
              onPress={() => onSpeak(message.id, message.text)}
              disabled={isAudioLoading}
            >
              {isAudioLoading && isSpeaking ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <MaterialIcons 
                  name={isSpeaking ? "volume-up" : "volume-off"} 
                  size={20} 
                  color={
                    isSpeaking ? theme.colors.primary : 
                    isAudioLoading ? theme.colors.textSecondary : 
                    theme.colors.primary
                  } 
                />
              )}
            </TouchableOpacity>
          )}
        </View>

        {message.hoverData && (
          <RNView style={styles.hoverImageContainer}>
            <Image 
              source={{ uri: message.hoverData.imgUrl }} 
              style={styles.hoverImage} 
              resizeMode="contain"
            />
            <Text style={styles.translationText}>
              {message.hoverData.term} → {message.hoverData.english}
            </Text>
          </RNView>
        )}
        
        {message.isOption && onSelect && (
          <TouchableOpacity 
            style={[
              styles.optionButton,
              isOptionLoading && styles.optionButtonDisabled
            ]}
            onPress={() => onSelect(message.text)}
            disabled={isOptionLoading}
          >
            {isOptionLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.optionButtonText}>Select & Speak</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Container for the entire bubble + pointer
  bubbleContainer: {
    maxWidth: '80%',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  doctorContainer: {
    alignSelf: 'flex-start',
    marginRight: 32,
  },
  patientContainer: {
    alignSelf: 'flex-end',
    marginLeft: 32,
  },

  transcriptionLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  
  // Bubble pointer styling - more natural speech bubble shape
  bubblePointer: {
    position: 'absolute',
    width: 16,
    height: 16,
    zIndex: 1,
  },
  doctorPointer: {
    left: -8,
    top: 12,
    borderRightWidth: 8,
    borderRightColor: '#254b9d',
    borderBottomWidth: 8,
    borderBottomColor: 'transparent',
    borderTopWidth: 8,
    borderTopColor: 'transparent',
  },
  patientPointer: {
    right: -7,
    top: 12,
    borderLeftWidth: 8,
    borderLeftColor: '#254b9d',
    borderBottomWidth: 8,
    borderBottomColor: 'transparent',
    borderTopWidth: 8,
    borderTopColor: 'transparent',
  },
  
  // Main bubble styling
  bubble: {
    padding: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  doctorBubble: {
    backgroundColor: '#254b9d',
    borderTopLeftRadius: 4,
  },
  patientBubble: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#254b9d',
    borderTopRightRadius: 4,
  },
  
  // Text styling
  doctorText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: 22,
  },
  patientText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: 22,
  },
  
  // Message content styling
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingRight: 0, // Remove any padding that was for the edit icon
  },
  editedLabel: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  editIconButton: {
    marginLeft: 8,
  },
  editIconContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    zIndex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  timestamp: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  
  // Option button styling
  optionButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.secondary,
    borderRadius: 8,
    alignItems: 'center',
  },
  optionButtonDisabled: {
    opacity: 0.6,
    backgroundColor: theme.colors.textSecondary,
  },
  optionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  // Editing mode styling
  editingContainer: {
    width: '90%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 16,
  },
  doctorEditing: {
    alignSelf: 'flex-start',
    backgroundColor: '#254b9d',
  },
  patientEditing: {
    alignSelf: 'flex-end',
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#254b9d',
  },
  editInput: {
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderRadius: 8,
    padding: 8,
    minHeight: 100,
    marginBottom: 8,
    backgroundColor: 'white',
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
  },
  cancelButton: {
    backgroundColor: theme.colors.error,
  },

  hoverImageContainer: {
    alignItems: 'center',
    marginTop: 12,
  },
  hoverImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  translationText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 8,
  },
  highlightedWord: {
    color: theme.colors.black,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default ChatBubble;