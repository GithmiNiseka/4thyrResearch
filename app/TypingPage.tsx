import React, { useState } from "react";
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, TextInput, Alert, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import axios from "axios";
import * as FileSystem from "expo-file-system";
import { Audio } from "expo-av";
import { encode } from "base64-arraybuffer";
import Colors from "./constants/Colors";
import FontSize from "./constants/FontSize";
import { RootStackParamList } from "./index";

// Type for navigation prop
type NavigationProp = StackNavigationProp<RootStackParamList, "TypingPage">;

const SERVER_URL = "http://192.168.229.17:5000/speak";

export default function TypingPage() {
  const navigation = useNavigation<NavigationProp>();
  const [text, setText] = useState("");
  const [sound, setSound] = useState<Audio.Sound | null>(null); // Fix type issue
  const [isProcessing, setIsProcessing] = useState(false); // Prevent multiple presses

  const handleSpeak = async () => {
    if (!text.trim()) {
      Alert.alert("Error", "Please enter Sinhala text.");
      return;
    }

    if (isProcessing) return; // Block extra presses

    setIsProcessing(true); // Disable button immediately

    try {
      const response = await axios.post(SERVER_URL, { text }, { responseType: "arraybuffer" });

      if (response.status !== 200) {
        throw new Error(`Server returned ${response.status}`);
      }

      // Convert ArrayBuffer to Base64
      const base64Audio = encode(response.data);
      const path = FileSystem.cacheDirectory + "speech.mp3";

      await FileSystem.writeAsStringAsync(path, base64Audio, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await playAudio(path);
    } catch (error: any) {
      console.error("Error:", error.response ? error.response.data : error.message);
      Alert.alert("Error", "Failed to process the text.");
      setIsProcessing(false); // Re-enable button if error occurs
    }
  };

  const playAudio = async (uri: string) => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true });

      setSound(newSound);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if ("didJustFinish" in status && status.didJustFinish) {
          setIsProcessing(false); // Enable button only after playback ends
        }
      });

      await newSound.playAsync();
    } catch (error: any) {
      setIsProcessing(false);
      console.error("Audio play error:", error.message || error);
      Alert.alert("Error", "Failed to play audio.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surfaceContainerLowest }}>
      <ScrollView style={{ flex: 1, paddingTop: 17 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 17, marginHorizontal: 26 }}>
          <Text style={{ color: Colors.shadow, fontSize: FontSize.body_small, flex: 1 }}>Text-to-Speech</Text>
        </View>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
          <TextInput
            style={styles.input}
            placeholder="Enter Sinhala text"
            value={text}
            onChangeText={setText}
            multiline
            numberOfLines={4}
          />
          <TouchableOpacity onPress={handleSpeak} style={styles.button} disabled={isProcessing}>
            <Text style={styles.buttonText}>{isProcessing ? "Processing..." : "Speak"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  input: {
    width: "100%",
    minHeight: 100,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    fontSize: 16,
    textAlignVertical: "top",
  },
  button: {
    padding: 20,
    backgroundColor: "blue",
    marginTop: 20,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
});
