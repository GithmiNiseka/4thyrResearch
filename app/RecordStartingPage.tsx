import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, Image, View, Text, TouchableOpacity, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Colors from "./constants/Colors";
import FontSize from "./constants/FontSize";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../App";  
import io from "socket.io-client";

let Voice: any;
if (Platform.OS !== "web") {
  Voice = require("@react-native-community/voice").default;
}

// Type for navigation prop
type NavigationProp = StackNavigationProp<RootStackParamList, "RecordStartingPage">;

const socket = io("http://192.168.43.214:5000", {
  transports: ["websocket"], // Force WebSocket transport
  reconnectionAttempts: 5, // Retry connecting up to 5 times
  timeout: 10000, // Timeout for socket connection attempt
});

export default function RecordStartingPage() {
  const navigation = useNavigation<NavigationProp>();  
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
    navigation.navigate("QuestionsPage", { sampleText: transcript });  
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surfaceContainerLowest }}>
        <ScrollView style={{ flex: 1, paddingTop: 17 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 17, marginHorizontal: 26 }}>
              <Image
                    source={require("./assets/images/logo.png")}
                    resizeMode="stretch"
                    style={{ width: 32, height: 26, marginRight: 14 }}
              />
              <Text style={{ color: Colors.shadow, fontSize: FontSize.body_small, flex: 1 }}>{"Signify"}</Text>
          </View>
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <TouchableOpacity onPress={isRecording ? stopRecording : startRecording} style={{ padding: 20, backgroundColor: "blue" }}>
        <Text style={{ color: "white" }}>{isRecording ? "Stop Recording" : "Start Recording"}</Text>
      </TouchableOpacity>
      <Text>{transcript}</Text>
    </View>
    </ScrollView>
    </SafeAreaView>
  );
}
