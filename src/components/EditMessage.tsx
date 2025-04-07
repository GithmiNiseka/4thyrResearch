import React from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  Text, 
  StyleSheet 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme'; // Ensure that your theme file is correctly imported

type EditMessageProps = {
  text: string;
  onSave: () => void;
  onCancel: () => void;
  onChangeText: (text: string) => void;
};

export const EditMessage = ({ 
  text, 
  onSave, 
  onCancel, 
  onChangeText 
}: EditMessageProps) => {
  return (
    <View style={styles.container}>
      <TextInput 
        style={styles.input}
        value={text}
        onChangeText={onChangeText}
        multiline
        autoFocus
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.colors.primary }]} 
          onPress={onSave}
        >
          <MaterialIcons name="check" size={24} color="white" />
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.colors.error }]}
          onPress={onCancel}
        >
          <MaterialIcons name="close" size={24} color="white" />
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: theme.colors.surfaceContainer,
    borderRadius: 8,
    marginVertical: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderRadius: 4,
    padding: 8,
    minHeight: 100,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
    borderRadius: 4,
  },
  buttonText: {
    fontSize: 14,
    color: 'white',
  },
});
