import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import ChatScreen from '../screens/ChatScreen';
import HomeScreen from '../screens/HomeScreen'; 
import RecordingScreen from '../screens/RecordingScreen'; 

// Define your route params
export type RootStackParamList = {
  Home: undefined;
  Record: undefined;
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
          options={{ title: 'Home' }} // Customize as needed
        />
         <Stack.Screen 
          name="Record" 
          component={RecordingScreen} 
          options={{ title: 'Record' }}
        />
        <Stack.Screen 
          name="Chat" 
          component={ChatScreen}
          options={{ title: 'Doctor-Patient Chat' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;