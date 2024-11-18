import React from "react";
import { SafeAreaView, ScrollView, View, Text, ImageBackground, Image ,StyleSheet,TouchableOpacity} from "react-native";
import Colors from "../constants/Colors";
import FontSize from "../constants/FontSize";
import { useNavigation, NavigationProp } from "@react-navigation/native";

export type RootStackParamList = {
	IndexPage: undefined;
	RecordingPage: undefined;
	RecordStartingPage: undefined;
  };

export default function RecordingPage() {
	const navigation = useNavigation<NavigationProp<RootStackParamList>>();

	// Function to navigate to RecordingPage
	const goToRecordStartingPage = () => {
	  navigation.navigate("RecordStartingPage");
	};

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: Colors.surfaceContainerLowest }}>
			<ScrollView style={{ flex: 1, paddingTop: 17 }}>
				<View style={{ flexDirection: "row", alignItems: "center", marginBottom: 17, marginHorizontal: 26 }}>
				<Image
                 source={require("../assets/images/logo.png")}
                 resizeMode="stretch"
                 style={{ width: 32, height: 26, marginRight: 14 }}
                 />
				<Text style={{ color: Colors.shadow, fontSize: FontSize.body_small, flex: 1 }}>{"Signify"}</Text>
				</View>

				<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center',paddingTop: 250, }} >
				<TouchableOpacity onPress={goToRecordStartingPage}>
				<Image
                 source={require("../assets/images/recordingCircle.png")}
                 resizeMode="stretch"
                 style={{ width: 80, height: 80, marginRight: 14 }}
                 />
				</TouchableOpacity>
			    </View>
				<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center',paddingTop: 20, }} >
				<Text style={{ color: Colors.shadow, fontSize: FontSize.body_large, marginLeft: 17,fontWeight: "bold", }} >
					{"පටිගත කිරීම ආරම්භ කිරීමට මයික්‍රෆෝනය තට්ටු කරන්න"}
				</Text>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
