import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import IndexPage from "./app/index";
import RecordingPage from "./app/RecordingPage";
import QuestionsPage from "./app/QuestionsPage";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="IndexPage">
        <Stack.Screen
          name="IndexPage"
          component={IndexPage}
          options={{ title: "Home" }} // Optional: Set the title of the screen
        />
        <Stack.Screen
          name="RecordingPage"
          component={RecordingPage}
          options={{ title: "Recording" }} // Optional: Set the title of the screen
        />
         <Stack.Screen name="QuestionsPage" component={QuestionsPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
