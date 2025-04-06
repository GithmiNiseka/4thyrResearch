
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import ChatScreen from '../screens/ChatScreen';

export type RootStackParamList = {
  Chat: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Chat" 
          component={ChatScreen} 
          options={{ title: 'Deaf App' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;