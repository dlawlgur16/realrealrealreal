import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-gesture-handler';

import HomeScreen from './src/screens/HomeScreen';
import PosterScreen from './src/screens/PosterScreen';
import SerialScreen from './src/screens/SerialScreen';
import DefectScreen from './src/screens/DefectScreen';
import LoginScreen from './src/screens/LoginScreen';
import MyImagesScreen from './src/screens/MyImagesScreen';
import MyCertificatesScreen from './src/screens/MyCertificatesScreen';
import {
  getCurrentUser,
  logout as firebaseLogout,
  onAuthStateChange,
} from './src/services/authService';

const Stack = createStackNavigator();
const GUEST_MODE_KEY = '@ocean_seal_guest';

export default function App() {
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();

    // Firebase 인증 상태 변경 리스너
    const unsubscribe = onAuthStateChange((firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsGuest(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const checkAuth = async () => {
    try {
      // 게스트 모드 확인
      const guestMode = await AsyncStorage.getItem(GUEST_MODE_KEY);
      if (guestMode === 'true') {
        setIsGuest(true);
        setIsLoading(false);
        return;
      }

      // Firebase 사용자 확인
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (provider, userData) => {
    if (provider === 'guest') {
      await AsyncStorage.setItem(GUEST_MODE_KEY, 'true');
      setIsGuest(true);
    } else {
      // Google 또는 카카오 로그인 성공
      setUser(userData);
      setIsGuest(false);
    }
  };

  const handleLogout = async () => {
    try {
      await firebaseLogout();
      await AsyncStorage.removeItem(GUEST_MODE_KEY);
      setUser(null);
      setIsGuest(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const canUseApp = user || isGuest;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!canUseApp ? (
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Home">
              {(props) => (
                <HomeScreen
                  {...props}
                  onLogout={handleLogout}
                  isGuest={isGuest}
                  user={user}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Poster" component={PosterScreen} />
            <Stack.Screen name="Serial" component={SerialScreen} />
            <Stack.Screen name="Defect" component={DefectScreen} />
            <Stack.Screen name="MyImages" component={MyImagesScreen} />
            <Stack.Screen name="MyCertificates" component={MyCertificatesScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
});
