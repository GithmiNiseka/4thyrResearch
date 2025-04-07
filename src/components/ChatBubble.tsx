import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import MedicalImagePopup from './MedicalImagePopup';

interface ChatBubbleProps {
  message: {
    id: string;
    text: string;
    sender: 'doctor' | 'patient';
    isOption?: boolean;
    isEdited?: boolean;
    timestamp: string;
  };
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
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  onSelect,
  onSpeak,
  onEdit,
  isSpeaking = false,
  isAudioLoading = false,
  isOptionLoading = false,
  isEditing = false,
  editText = '',
  onSaveEdit = () => {},
  onCancelEdit = () => {},
  onUpdateEditText = () => {},
}) => {
  const [selectedMedicalTerm, setSelectedMedicalTerm] = useState<string | null>(null);
  const [loadingTerm, setLoadingTerm] = useState(false);

  // Dictionary of common Sinhala medical terms
  const medicalTerms: Record<string, boolean> = {
    'හිසරදය': true, // Headache
    'උණ': true,      // Fever
    'දුවිලි': true,   // Dust allergy
    'ඇස්': true,      // Eyes
    'හෘදය': true,    // Heart
    'බඩවැල්': true,  // Stomach
    'කැස්ස': true,   // Cough
    'සෙම්': true,    // Asthma
    'රුධිර': true,   // Blood
    'මාංශ': true,    // Muscle
    // Add more terms as needed
  };

  const handleWordPress = (word: string) => {
    if (medicalTerms[word]) {
      setSelectedMedicalTerm(word);
    }
  };

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
        <View style={styles.messageHeader}>
          <View style={styles.messageContent}>
            {message.text.split(' ').map((word, index) => (
              <TouchableOpacity 
                key={index} 
                onPress={() => handleWordPress(word)}
                disabled={!medicalTerms[word]}
              >
                <Text 
                  style={[
                    styles.word,
                    medicalTerms[word] && styles.medicalTerm,
                    selectedMedicalTerm === word && styles.selectedTerm
                  ]}
                >
                  {word + ' '}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {message.isEdited && (
            <Text style={styles.editedLabel}> (edited)</Text>
          )}
          
          {message.sender === 'patient' && message.isOption && (
            <TouchableOpacity 
              style={styles.editIconButton}
              onPress={() => onEdit?.(message.id)}
            >
              <MaterialIcons 
                name="edit" 
                size={16} 
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.timestamp}>{message.timestamp}</Text>
          
          {!message.isOption && (
            <TouchableOpacity 
              onPress={() => onSpeak?.(message.id, message.text)}
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
                    theme.colors.text
                  } 
                />
              )}
            </TouchableOpacity>
          )}
        </View>
        
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

      {/* Medical Image Popup */}
      {selectedMedicalTerm && (
        <MedicalImagePopup 
          term={selectedMedicalTerm}
          onClose={() => setSelectedMedicalTerm(null)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Container for the entire bubble + pointer
  bubbleContainer: {
    maxWidth: '80%',
    marginBottom: theme.spacing.medium,
  },
  doctorContainer: {
    alignSelf: 'flex-start',
    marginRight: theme.spacing.large,
  },
  patientContainer: {
    alignSelf: 'flex-end',
    marginLeft: theme.spacing.large,
  },
  
  // Bubble pointer styling
  bubblePointer: {
    position: 'absolute',
    bottom: 0,
    width: 12,
    height: 12,
    transform: [{ rotate: '45deg' }],
    zIndex: -1,
  },
  doctorPointer: {
    left: -6,
    backgroundColor: theme.colors.doctorMessage,
  },
  patientPointer: {
    right: -6,
    backgroundColor: theme.colors.patientMessage,
  },
  
  // Main bubble styling
  bubble: {
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.large,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  doctorBubble: {
    backgroundColor: theme.colors.doctorMessage,
    borderTopLeftRadius: 0,
  },
  patientBubble: {
    backgroundColor: theme.colors.patientMessage,
    borderTopRightRadius: 0,
  },
  
  // Message content styling
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.small,
  },
  messageContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  word: {
    fontSize: 16,
    color: theme.colors.text,
  },
  medicalTerm: {
    color: theme.colors.primary,
    textDecorationLine: 'underline',
  },
  selectedTerm: {
    backgroundColor: theme.colors.surfaceContainer,
    borderRadius: 4,
  },
  text: {
    fontSize: 16,
    color: theme.colors.text,
    flexShrink: 1,
  },
  editedLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  editIconButton: {
    padding: 4,
    marginLeft: theme.spacing.small,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.small,
  },
  timestamp: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  
  // Option button styling
  optionButton: {
    marginTop: theme.spacing.small,
    padding: theme.spacing.small,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.medium,
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
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.large,
    marginBottom: theme.spacing.medium,
  },
  doctorEditing: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.doctorMessage,
  },
  patientEditing: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.patientMessage,
  },
  editInput: {
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderRadius: theme.borderRadius.small,
    padding: theme.spacing.small,
    minHeight: 100,
    marginBottom: theme.spacing.small,
    backgroundColor: 'white',
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.small,
  },
  editButton: {
    padding: theme.spacing.small,
    borderRadius: theme.borderRadius.small,
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
});

export default ChatBubble;