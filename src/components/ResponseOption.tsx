import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

interface ResponseOptionProps {
  text: string;
  onSelect: (text: string) => void;
}

const ResponseOption: React.FC<ResponseOptionProps> = ({ text, onSelect }) => {
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onSelect(text)}
    >
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.small,
    marginVertical: theme.spacing.small / 2,
  },
  text: {
    color: theme.colors.white,
    fontSize: 14,
  },
});

export default ResponseOption;