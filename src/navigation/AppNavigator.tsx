import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import ChatScreen from '../screens/ChatScreen'; // Verify this path is correct

export type RootStackParamList = {
  Chat: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Chat" 
          component={ChatScreen} // Make sure this is the correct component
          options={{ title: 'Doctor-Patient Chat' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;