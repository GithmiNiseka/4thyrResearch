import React, { useEffect, useState, useRef } from "react";
import {
  SafeAreaView,
  ScrollView,
  Image,
  View,
  Text,
  TouchableOpacity,
  Platform,
  Animated,
  StyleSheet,
} from "react-native";
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

const socket = io("http://192.168.1.101:5000", {
  transports: ["websocket"],
  reconnectionAttempts: 5,
  timeout: 10000,
});

export default function RecordStartingPage() {
  const navigation = useNavigation<NavigationProp>();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // To track if the recording is paused
  const [transcript, setTranscript] = useState("");
  const [elapsedTime, setElapsedTime] = useState(0);

  // Animation values for wavy bars
  const animatedValues = useRef(
    Array(24).fill(0).map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    if (Platform.OS !== "web" && Voice) {
      Voice.onSpeechResults = (e: { value?: string[] }) => {
        const text = e.value ? e.value[0] : "";
        setTranscript(text);
      };

      // Handle transcription response from WebSocket
      socket.on("transcription", (data: { text: string }) => {
        setTranscript(data.text);
      });

      // Handle socket disconnection
      socket.on("disconnect", () => {
        console.log("Socket disconnected. Attempting to reconnect...");
      });

      return () => {
        Voice.destroy().then(Voice.removeAllListeners);
        socket.disconnect();
      };
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
      }, 1000);
      startAnimation();
    } else {
      if (interval) clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, isPaused]);

  // Function to start animations
  const startAnimation = () => {
    const animations = animatedValues.map((value) =>
      Animated.loop(
        Animated.sequence([ 
          Animated.timing(value, {
            toValue: Math.random() * 70,
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(value, {
            toValue: Math.random() * 70,
            duration: 300,
            useNativeDriver: false,
          }),
        ])
      )
    );
    Animated.stagger(100, animations).start();
  };

  const startRecording = async () => {
    setIsRecording(true);
    setElapsedTime(0);
    setIsPaused(false);

    if (Platform.OS !== "web") {
      await Voice.start("si-LK");
    } else {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = "si-LK";
      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        socket.emit("transcription", { text });
      };
      recognition.start();
    }
  };

  const pauseRecording = async () => {
    if (Platform.OS !== "web") {
      await Voice.stop(); // Stop recognition
    }
    setIsPaused(true);
  };

  const resumeRecording = async () => {
    if (Platform.OS !== "web") {
      await Voice.start("si-LK"); // Restart recognition
    }
    setIsPaused(false);
  };

  const cancelRecording = async () => {
    if (Platform.OS !== "web") {
      await Voice.stop();
    }
    setIsRecording(false);
    setIsPaused(false);
    setTranscript(""); // Reset the transcript
    setElapsedTime(0); // Reset the timer
  };

  const stopRecording = async () => {
    setIsRecording(false);
    if (Platform.OS !== "web") {
      await Voice.stop();
    }
    navigation.navigate("QuestionsPage", { sampleText: transcript });
  };

  // Format elapsed time
  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return `${String(hours).padStart(2, "0")} : ${String(minutes).padStart(2, "0")} : ${String(seconds).padStart(2, "0")}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.row}>
          <Image
            source={require("./assets/images/logo.png")}
            resizeMode="stretch"
            style={{ width: 32, height: 26, marginRight: 14 }}
          />
          <Text style={styles.text}>{"Signify"}</Text>
        </View>

        {/* Wavy animation or static line */}
        <View style={styles.animationContainer}>
          {isRecording && !isPaused ? (
            animatedValues.map((animatedValue, index) => (
              <Animated.View
                key={index}
                style={[styles.boxAnimated, { height: animatedValue }]}
              />
            ))
          ) : (
            <Image
              source={require("./assets/images/line.png")}
              resizeMode="stretch"
              style={styles.staticLine}
            />
          )}
        </View>
      </ScrollView>

      {/* Timer display */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
      </View>

      {/* Recording controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity onPress={cancelRecording}>
          <Image source={require("./assets/images/cancel.png")} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={isRecording ? (isPaused ? resumeRecording : pauseRecording) : startRecording}>
          <Image
            source={isRecording ? (isPaused ? require("./assets/images/play.png") : require("./assets/images/pause.png")) : require("./assets/images/play.png")}
            style={styles.iconLarge}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={stopRecording}>
          <Image source={require("./assets/images/done.png")} style={styles.icon} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLowest,
  },
  scrollView: {
    flex: 1,
    paddingTop: 17,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 17,
    marginHorizontal: 26,
  },
  text: {
    color: Colors.shadow,
    fontSize: FontSize.body_small,
    flex: 1,
  },
  animationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 22,
    marginBottom: 240,
    marginTop: 200,
  },
  boxAnimated: {
    width: 4,
    backgroundColor: "#254B9D",
    borderRadius: 10,
  },
  staticLine: {
    width: "100%",
    height: 3,
    position: "relative",
    top: 25,
  },
  timerContainer: {
    position: "relative",
    top: -200,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 40,
  },
  timerText: {
    color: Colors.shadow,
    fontSize: FontSize.body_large,
  },
  controlsContainer: {
    position: "relative",
    bottom: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "95%",
    paddingHorizontal: 40,
  },
  icon: {
    width: 42,
    height: 42,
  },
  iconLarge: {
    width: 64,
    height: 64,
  },
});
