import React from "react";
import { SafeAreaView, ScrollView, View, Text, ImageBackground, Image } from "react-native";
import Colors from "../constants/Colors";
import FontSize from "../constants/FontSize";

export default function RecordingPage() {
	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: Colors.surfaceContainerLowest }}>
			<ScrollView style={{ flex: 1, paddingTop: 17 }}>
				<View style={{ flexDirection: "row", alignItems: "center", marginBottom: 17, marginHorizontal: 26 }}>
					<Image source={{ uri: "https://i.imgur.com/1tMFzp8.png" }} resizeMode={"stretch"} style={{ width: 32, height: 26, marginRight: 14 }} />
					<Text style={{ color: Colors.shadow, fontSize: FontSize.body_small, flex: 1 }}>{"Signify"}</Text>
				</View>

				<Text style={{ color: Colors.shadow, fontSize: FontSize.body_small, marginLeft: 17 }}>
					{"පටිගත කිරීම ආරම්භ කිරීමට මයික්‍රෆෝනය තට්ටු කරන්න"}
				</Text>
			</ScrollView>
		</SafeAreaView>
	);
}
