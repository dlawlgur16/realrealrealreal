import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import 'react-native-gesture-handler';

import HomeScreen from './src/screens/HomeScreen';
import PosterScreen from './src/screens/PosterScreen';
import SerialScreen from './src/screens/SerialScreen';
import DefectScreen from './src/screens/DefectScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Poster" component={PosterScreen} />
        <Stack.Screen name="Serial" component={SerialScreen} />
        <Stack.Screen name="Defect" component={DefectScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
