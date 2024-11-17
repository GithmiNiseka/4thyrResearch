import React from "react";
import { SafeAreaView, ScrollView, View, Text, Image, TouchableOpacity } from "react-native";
import Colors from "../constants/Colors";
import FontSize from "../constants/FontSize";

export default function RecordingPage() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surfaceContainerLowest }}>
      <ScrollView style={{ flex: 1, backgroundColor: Colors.surfaceContainerLowest, paddingTop: 17 }}>
      
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 17, marginHorizontal: 14 }}>
          <Image
            source={require("../assets/images/logo.png")} // Replace with your actual logo
            resizeMode="stretch"
            style={{ width: 32, height: 26, marginRight: 14 }}
          />
          <Text style={{ color: Colors.shadow, fontSize: FontSize.body_small, flex: 1 }}>
            {"Signify"}
          </Text>
        </View>

        <View
          style={{
            height: 1,
            backgroundColor: "#C0C0C0",
            marginBottom: 300,
            marginHorizontal: 12,
          }}
        />

        {/* Centered Content Section */}
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 18,
            marginHorizontal: 55,
          }}
        >
          {/* Microphone Icon */}
          <TouchableOpacity>
            <View>
              <Image
                source={require("../assets/images/recordingCircle.png")} // Replace with your microphone icon
                resizeMode="contain"
                style={{ width: 100, height: 100 }}
              />
            </View>
          </TouchableOpacity>

          {/* Instruction Text */}
          <Text
            style={{
              color: Colors.shadow,
              fontSize: FontSize.body_large,
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            {"පටිගත කිරීම ආරම්භ කිරීමට මයික්‍රෆෝනය තට්ටු කරන්න"}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
