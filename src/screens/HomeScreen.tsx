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
  Chat: undefined;
};

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const goToChat = () => {
    navigation.navigate("Chat");
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
          <Text style={{ color: Colors.shadow, fontSize: FontSize.title_medium, flex: 1 }}>
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
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <TouchableOpacity onPress={goToChat}>
            <Image
              source={require("../../assets/images/type&record.png")}
              resizeMode="stretch"
              style={{ width: 120, height: 120 }}
            />
          </TouchableOpacity>
        </View>

        <View
          style={{
            alignItems: "center",
            marginHorizontal: 60,
          }}
        >
          <Text
            style={{
              color: Colors.shadow,
              fontSize:FontSize.headline_small,
              fontWeight: "bold",
            }}
          >
            {"කතාකරන්න  / අහන්න "}
          </Text>
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
}
