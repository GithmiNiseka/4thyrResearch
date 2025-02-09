import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView, View, ScrollView, Image, Text, StyleSheet, Animated, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native"; 
import Colors from "../constants/Colors";
import FontSize from "../constants/FontSize";

// Define the type for the navigation param
type NavigationProps = {
	navigate: (screen: string, params?: { sampleText: string }) => void;
	goBack: () => void; // Add this line
  };

export default function RecordStartingPage() {
  // Create animated values for the heights of the boxes
  const animatedValues = useRef(
    Array(24) // Number of boxes in the wavy animation
      .fill(0)
      .map(() => new Animated.Value(0))
  ).current;

  // Navigation hook
  const navigation = useNavigation<NavigationProps>();

  // State for time tracking
  const [seconds, setSeconds] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [hours, setHours] = useState(0);

  // State for play/pause functionality
  const [isRunning, setIsRunning] = useState(true); // Initially running
  const [isPaused, setIsPaused] = useState(false); // Initially on pause icon

  // New state for recorded text (mock text for this example)
  const [sampleText, setSampleText] = useState("This is a sample recorded text.");

  useEffect(() => {
    // Function to animate the height of each box
    const animate = () => {
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

    if (!isPaused) {
      animate();
    }
  }, [isPaused]);

  // Timer effect to update the time
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds === 59) {
            setMinutes((prevMinutes) => {
              if (prevMinutes === 59) {
                setHours((prevHours) => prevHours + 1);
                return 0;
              }
              return prevMinutes + 1;
            });
            return 0;
          }
          return prevSeconds + 1;
        });
      }, 1000);
    } else if (!isRunning && interval !== null) {
      clearInterval(interval);
    }

    return () => clearInterval(interval as NodeJS.Timeout);
  }, [isRunning]);

  // Function to handle "Done" button click
  const handleDone = () => {
    navigation.navigate("QuestionsPage", { sampleText }); // Pass sampleText as a parameter
  };

  // Function to handle play/pause button click
  const togglePausePlay = () => {
    setIsRunning(!isRunning); // Toggle running state
    setIsPaused(!isPaused); // Toggle icon
  };

  // Function to handle cancel button click
  const handleCancel = () => {
    navigation.goBack(); // Navigate back to the previous page
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header with logo and text */}
        <View style={styles.row}>
          <Image
            source={require("../assets/images/logo.png")}
            resizeMode="stretch"
            style={{ width: 32, height: 26, marginRight: 14 }}
          />
          <Text style={styles.text}>{"Signify"}</Text>
        </View>

        {/* Animated wavy boxes or static line image based on pause/play state */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginHorizontal: 22, marginBottom: 240, marginTop: 200 }}>
          {isPaused ? (
            <Image
              source={require("../assets/images/line.png")}
              resizeMode="stretch"
              style={{ width: "100%", height: 3, position: "relative", top: 25 }}
            />
          ) : (
            animatedValues.map((animatedValue, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.boxAnimated,
                  {
                    height: animatedValue,
                  },
                ]}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Timer display */}
      <View style={styles.timerContainer}>
        <View style={styles.column}>
          <Text style={styles.text2}>
            {String(hours).padStart(2, "0")} : {String(minutes).padStart(2, "0")} : {String(seconds).padStart(2, "0")}
          </Text>
        </View>
      </View>

      {/* Recording controls: Cancel, Record, Pause/Play, Done */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity onPress={handleCancel}>
          <Image
            source={require("../assets/images/cancel.png")}
            resizeMode="stretch"
            style={{ width: 42, height: 42, marginLeft: 15 }}
          />
        </TouchableOpacity>
        <View style={styles.box10}></View>
        <Image
          source={require("../assets/images/RecordingIcon.png")}
          resizeMode="stretch"
          style={{ width: 62, height: 62, marginHorizontal: 30 }}
        />
        <TouchableOpacity onPress={togglePausePlay}>
          <Image
            source={isPaused ? require("../assets/images/play.png") : require("../assets/images/pause.png")}
            resizeMode="stretch"
            style={{ width: 42, height: 42 }}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDone}>
          <Image
            source={require("../assets/images/done.png")}
            resizeMode="stretch"
            style={{ width: 42, height: 42, marginLeft: 25 }}
          />
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
    backgroundColor: Colors.surfaceContainerLowest,
    paddingTop: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginHorizontal: 15,
  },
  text: {
    color: Colors.shadow,
    fontSize: FontSize.body_small,
    flex: 1,
  },
  text2: {
    color: Colors.shadow,
    fontSize: FontSize.body_large,
  },
  boxAnimated: {
    width: 4,
    backgroundColor: "#254B9D",
    borderRadius: 10,
  },
  column: {
    width: 100,
    alignItems: "center",
  },
  box10: {
    flex: 1,
  },
  timerContainer: {
    position: "relative",
    top: -200,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 40,
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
});
