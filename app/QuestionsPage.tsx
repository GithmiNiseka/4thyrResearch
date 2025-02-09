// QuestionsPage.tsx
import React from "react";
import { SafeAreaView, View, Text, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";
import { RouteProp } from "@react-navigation/native";

// Define the type for the route params
type RootStackParamList = {
  RecordStartingPage: undefined;
  QuestionsPage: { sampleText: string }; // Define sampleText as a string in route params
};

export default function QuestionsPage() {
  // Use the useRoute hook with the correct type for route params
  const route = useRoute<RouteProp<RootStackParamList, "QuestionsPage">>();
  const { sampleText } = route.params; // Now sampleText is properly typed

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.text}>{sampleText}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  content: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
  },
});
