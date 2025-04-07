import React from "react";
import { SafeAreaView, View, ScrollView, Image, Text, TouchableOpacity } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import Colors from "../../assets/constants/Colors"; 
import FontSize from "../../assets/constants/FontSize";

// Update the RootStackParamList to match AppNavigation
export type RootStackParamList = {
  Home: undefined;
  Record: undefined;
  TypingPage: undefined;
};

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();


  const goToTypingPage = () => {
    navigation.navigate("TypingPage");
  };

  // Function to navigate to RecordingPage
    const goToRecordingScreen = () => {
      navigation.navigate("Record");
    };
  

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surfaceContainerLowest }}>
      <ScrollView style={{ flex: 1, backgroundColor: Colors.surfaceContainerLowest, paddingTop: 17 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 17, marginHorizontal: 14 }}>
          <Image
            source={require("../../assets/images/logo.png")}
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
            marginBottom: 276,
            marginHorizontal: 12,
          }}
        />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
            marginHorizontal: 55,
          }}
        >
          <TouchableOpacity onPress={goToRecordingScreen}>
            <Image
              source={require("../../assets/images/recordingCircle.png")}
              resizeMode="stretch"
              style={{ width: 80, height: 80, marginRight: 14 }}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={goToTypingPage}>
            <Image
              source={require("../../assets/images/typingCircle.png")}
              resizeMode="stretch"
              style={{ width: 80, height: 80, marginRight: 0 }}
            />
          </TouchableOpacity>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginHorizontal: 60,
          }}
        >
          <Text
            style={{
              color: Colors.shadow,
              fontSize: FontSize.body_large,
              fontWeight: "bold",
            }}
          >
            {"පටිගත කිරීම"}
          </Text>
          <Text
            style={{
              color: Colors.shadow,
              fontSize: FontSize.body_large,
              fontWeight: "bold",
            }}
          >
            {"ටයිප් කිරීම"}
          </Text>
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
}