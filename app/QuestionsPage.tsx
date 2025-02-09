import React from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";

interface QuestionPageProps {
  route: {
    params: {
      transcription: string;
    };
  };
}

const QuestionPage: React.FC<QuestionPageProps> = ({ route }) => {
  const { transcription } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text style={styles.text}>{transcription}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  text: {
    fontSize: 16,
    color: "#000",
    padding: 20,
  },
});

export default QuestionPage;
