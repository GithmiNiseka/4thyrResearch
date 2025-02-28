// import { createStackNavigator } from "@react-navigation/stack";
// import { NavigationContainer } from "@react-navigation/native";
// import RecordStartingPage from "./app/RecordStartingPage";
// import QuestionsPage from "./app/QuestionsPage";

// // Define types for routes and their params
// export type RootStackParamList = {
//   RecordStartingPage: undefined;
//   QuestionsPage: { sampleText: string };  
// };

// const Stack = createStackNavigator<RootStackParamList>();

// export default function App() {
//   return (
//     <NavigationContainer>
//       <Stack.Navigator initialRouteName="RecordStartingPage">
//         <Stack.Screen name="RecordStartingPage" component={RecordStartingPage} />
//         <Stack.Screen name="QuestionsPage" component={QuestionsPage} />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }


import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import IndexPage from "./app/index"; // Starting screen
import RecordingPage from "./app/RecordingPage";
import TypingPage from "./app/TypingPage";
import RecordStartingPage from "./app/RecordStartingPage"; // Inside RecordingPage
import QuestionsPage from "./app/QuestionsPage";

// Define navigation types
export type RootStackParamList = {
  IndexPage: undefined;
  RecordingPage: undefined;
  RecordStartingPage: undefined;
  TypingPage: undefined;
  QuestionsPage: { sampleText: string };  
};

// Create a stack for RecordingPage that includes RecordStartingPage
const RecordingStack = createStackNavigator<RootStackParamList>();

const Stack = createStackNavigator<RootStackParamList>();

// Recording Stack to handle nested pages
function RecordingStackScreen() {
  return (
    <RecordingStack.Navigator initialRouteName="RecordingPage">
      <RecordingStack.Screen name="RecordingPage" component={RecordingPage} />
      <RecordingStack.Screen name="QuestionsPage" component={QuestionsPage} />
      <RecordingStack.Screen name="RecordStartingPage" component={RecordStartingPage} />
    </RecordingStack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="IndexPage">
        <Stack.Screen name="IndexPage" component={IndexPage} options={{ headerShown: false }} />
        <Stack.Screen name="RecordingPage" component={RecordingStackScreen} />
        <Stack.Screen name="TypingPage" component={TypingPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
