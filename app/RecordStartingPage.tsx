import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../App";  // 👈 Import the defined types
import io from "socket.io-client";

let Voice: any;
if (Platform.OS !== "web") {
  Voice = require("@react-native-community/voice").default;
}

// ✅ Type for navigation prop
type NavigationProp = StackNavigationProp<RootStackParamList, "RecordStartingPage">;

const socket = io("http://192.168.43.214:5000");

export default function RecordStartingPage() {
  const navigation = useNavigation<NavigationProp>();  // ✅ Correctly typed navigation
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    if (Platform.OS !== "web" && Voice) {
      Voice.onSpeechResults = (e: { value?: string[] }) => {
        const text = e.value ? e.value[0] : "";
        setTranscript(text);
        socket.emit("audio_chunk", { audio: text });
      };

      socket.on("transcription", (data: { text: string }) => {
        setTranscript(data.text);
      });

      return () => {
        Voice.destroy().then(Voice.removeAllListeners);
        socket.disconnect();
      };
    }
  }, []);

  const startRecording = async () => {
    setIsRecording(true);
    if (Platform.OS !== "web") {
      await Voice.start("si-LK");
    } else {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = "si-LK";
      recognition.onresult = (event: any) => {
        setTranscript(event.results[0][0].transcript);
        socket.emit("audio_chunk", { audio: event.results[0][0].transcript });
      };
      recognition.start();
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    if (Platform.OS !== "web") {
      await Voice.stop();
    }
    navigation.navigate("QuestionsPage", { sampleText: transcript });  // ✅ Now TypeScript recognizes this!
  };

  return (
    
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <TouchableOpacity onPress={isRecording ? stopRecording : startRecording} style={{ padding: 20, backgroundColor: "blue" }}>
        <Text style={{ color: "white" }}>{isRecording ? "Stop Recording" : "Start Recording"}</Text>
      </TouchableOpacity>
      <Text>{transcript}</Text>
    </View>
  );
}
