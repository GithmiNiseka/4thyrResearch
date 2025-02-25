import React from "react";
import {SafeAreaView, ScrollView, View, StyleSheet, Text, Image  } from "react-native";
import Colors from "./constants/Colors";
import FontSize from "./constants/FontSize";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../App";  // Import the type

// Define type for route params
type QuestionsPageRouteProp = RouteProp<RootStackParamList, "QuestionsPage">;

export default function QuestionsPage() {
  const route = useRoute<QuestionsPageRouteProp>();  
  const { sampleText } = route.params;  

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
    <View style={styles.textContainer}>
      <Text style={styles.text}>{sampleText}</Text>
    </View>
    </ScrollView>
  </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  textContainer: {
    backgroundColor: "#1E4BA1", // Dark blue color similar to the image
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderRadius: 11, // Rounded corners
    alignItems: "center",
    justifyContent: "center",
    width: "85%",
    alignSelf: "center",
  },
  text: {
    fontSize: 20,
    color: "#FFFFFF", // White text
    textAlign: "center",
    fontFamily: "NotoSansSinhala-Regular",
  },
});