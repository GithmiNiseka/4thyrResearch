import React from "react";
import { SafeAreaView, View, ScrollView, Image, Text, TouchableOpacity } from "react-native";
import { Link } from "@react-navigation/native"; 
import Colors from "../constants/Colors";
import FontSize from "../constants/FontSize";
import { useNavigation } from "@react-navigation/native";

export default function IndexPage() {
  const navigation = useNavigation();

  const goToRecordingPage = () => {
    navigation.navigate("RecordingPage");
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surfaceContainerLowest }}>
      <ScrollView style={{ flex: 1, backgroundColor: Colors.surfaceContainerLowest, paddingTop: 17 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 17, marginHorizontal: 14 }}>
        <Image
          source={require("../assets/images/logo.png")}
          resizeMode="stretch"
          style={{ width: 32, height: 26, marginRight: 14 }}
        />
          <Text style={{ color: Colors.shadow, fontSize: FontSize.body_small, flex: 1 }}>
            {"Signify"}
          </Text>
        </View>

        <View style={{ height: 1, backgroundColor: "#C0C0C0", marginBottom: 276, marginHorizontal: 12 }} />

        
        <TouchableOpacity onPress={goToRecordingPage}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18, marginHorizontal: 55 }}>
            <Image
              source={{ uri: "https://i.imgur.com/1tMFzp8.png" }}
              resizeMode={"stretch"}
              style={{ width: 89, height: 80 }}
            />
            <Image
              source={{ uri: "https://i.imgur.com/1tMFzp8.png" }}
              resizeMode={"stretch"}
              style={{ width: 89, height: 80 }}
            />
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginHorizontal: 59 }}>
            <Text style={{ color: Colors.shadow, fontSize: FontSize.body_small }}>{"පටිගත කිරීම"}</Text>
            <Text style={{ color: Colors.shadow, fontSize: FontSize.body_small }}>{"ටයිප් කිරීම"}</Text>
          </View>
          </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
