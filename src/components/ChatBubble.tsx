import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Message } from '../types/chatTypes';
import theme from '../theme';

interface ChatBubbleProps {
  message: Message;
  onSelect?: (text: string) => void;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, onSelect }) => {
  return (
    <View style={[
      styles.container,
      message.sender === 'doctor' ? styles.doctorBubble : styles.patientBubble
    ]}>
      <Text style={styles.text}>{message.text}</Text>
      <Text style={styles.timestamp}>{message.timestamp}</Text>
      
      {message.isOption && onSelect && (
        <View style={styles.optionContainer}>
          <Text 
            style={styles.optionText}
            onPress={() => onSelect(message.text)}
          >
            Select this response
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxWidth: '80%',
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.large,
    marginBottom: theme.spacing.small,
  },
  doctorBubble: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.doctorMessage,
  },
  patientBubble: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.patientMessage,
  },
  text: {
    fontSize: 16,
    color: theme.colors.text,
  },
  timestamp: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.small,
  },
  optionContainer: {
    marginTop: theme.spacing.small,
    borderTopWidth: 1,
    borderTopColor: theme.colors.textSecondary,
    paddingTop: theme.spacing.small,
  },
  optionText: {
    color: theme.colors.secondary,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default ChatBubble;