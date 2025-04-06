import React, { useState, useRef, useEffect } from 'react';
import { View, FlatList, TextInput, TouchableOpacity, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useChat } from '../hooks/useChats';
import ChatBubble from '../components/ChatBubble';
import theme from '../theme';
import { useSpeech } from '../hooks/useSpeech';
import { MaterialIcons } from '@expo/vector-icons';

const ChatScreen: React.FC = () => {
  const { chatState, sendDoctorMessage, selectPatientResponse } = useChat();
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const {
    isRecording,
    speechText,
    error,
    toggleRecording,
    clearSpeechText,
  } = useSpeech();

  // Update input text when speech is recognized
  useEffect(() => {
    if (speechText) {
      setInputText(prev => prev ? `${prev} ${speechText}` : speechText);
      clearSpeechText();
    }
  }, [speechText]);

  const handleSend = () => {
    if (inputText.trim()) {
      sendDoctorMessage(inputText);
      setInputText('');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <FlatList
        ref={flatListRef}
        data={chatState.messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatBubble 
            message={item} 
            onSelect={item.isOption ? selectPatientResponse : undefined}
          />
        )}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TouchableOpacity 
          style={[
            styles.recordButton,
            isRecording && styles.recordingActive
          ]}
          onPress={toggleRecording}
        >
          <MaterialIcons 
            name={isRecording ? 'mic-off' : 'mic'} 
            size={24} 
            color="white"
          />
        </TouchableOpacity>
        
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type or speak your question..."
          placeholderTextColor={theme.colors.textSecondary}
          multiline
        />
        
        <TouchableOpacity 
          style={styles.sendButton}
          onPress={handleSend}
          disabled={chatState.loading || !inputText.trim()}
        >
          <Text style={styles.sendButtonText}>
            {chatState.loading ? '...' : 'Send'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  messagesContainer: {
    padding: theme.spacing.medium,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: theme.spacing.medium,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
  },
  recordButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  recordingActive: {
    backgroundColor: 'red',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.extraLarge,
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
    minHeight: 50,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    padding: 10,
    marginHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
});

export default ChatScreen;


// import React, { useRef, useState } from 'react';
// import { View, FlatList, TextInput, TouchableOpacity, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
// import { useChat } from '../hooks/useChats';
// import ChatBubble from '../components/ChatBubble';
// import theme from '../theme';

// const ChatScreen: React.FC = () => {
//   const { chatState, sendDoctorMessage, selectPatientResponse } = useChat();
//   const [inputText, setInputText] = useState('');
//   const flatListRef = useRef<FlatList>(null);

//   const handleSend = () => {
//     sendDoctorMessage(inputText);
//     setInputText('');
//   };

//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       style={styles.container}
//     >
//       <FlatList
//         ref={flatListRef}
//         data={chatState.messages}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => (
//           <ChatBubble 
//             message={item} 
//             onSelect={item.isOption ? selectPatientResponse : undefined}
//           />
//         )}
//         contentContainerStyle={styles.messagesContainer}
//         onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
//       />
      
//       <View style={styles.inputContainer}>
//         <TextInput
//           style={styles.input}
//           value={inputText}
//           onChangeText={setInputText}
//           placeholder="Type your question..."
//           placeholderTextColor={theme.colors.textSecondary}
//           multiline
//         />
        
//         <TouchableOpacity 
//           style={styles.sendButton}
//           onPress={handleSend}
//           disabled={chatState.loading || !inputText.trim()}
//         >
//           <Text style={styles.sendButtonText}>
//             {chatState.loading ? '...' : 'Send'}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </KeyboardAvoidingView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: theme.colors.background,
//   },
//   messagesContainer: {
//     padding: theme.spacing.medium,
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     padding: theme.spacing.medium,
//     borderTopWidth: 1,
//     borderTopColor: theme.colors.border,
//     backgroundColor: theme.colors.white,
//   },
//   input: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: theme.colors.border,
//     borderRadius: theme.borderRadius.extraLarge,
//     paddingHorizontal: theme.spacing.medium,
//     paddingVertical: theme.spacing.small,
//     marginRight: theme.spacing.medium,
//     minHeight: 40,
//     maxHeight: 100,
//   },
//   sendButton: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: theme.colors.primary,
//     borderRadius: theme.borderRadius.extraLarge,
//     paddingHorizontal: theme.spacing.medium,
//     paddingVertical: theme.spacing.small,
//     opacity: 1,
//   },
//   sendButtonDisabled: {
//     opacity: 0.5,
//   },
//   sendButtonText: {
//     color: theme.colors.white,
//     fontWeight: 'bold',
//   },
// });

// export default ChatScreen;