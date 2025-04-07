import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import ChatScreen from '../screens/ChatScreen';
import HomeScreen from '../screens/HomeScreen'; 
import RecordingScreen from '../screens/RecordingScreen'; 
import TypingingScreen from '../screens/TypingScreen'; 

// Define your route params
export type RootStackParamList = {
  Home: undefined;
  Record: undefined;
  Type: undefined;
  Chat: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ headerShown: false }}
        />
         <Stack.Screen 
          name="Record" 
          component={RecordingScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Type" 
          component={TypingingScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Chat" 
          component={ChatScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;