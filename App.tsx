import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import RecordStartingPage from "./app/RecordStartingPage";
import QuestionsPage from "./app/QuestionsPage";

// Define types for routes and their params
export type RootStackParamList = {
  RecordStartingPage: undefined;
  QuestionsPage: { sampleText: string };  
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="RecordStartingPage">
        <Stack.Screen name="RecordStartingPage" component={RecordStartingPage} />
        <Stack.Screen name="QuestionsPage" component={QuestionsPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
