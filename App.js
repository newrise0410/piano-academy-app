// App.js
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import './global.css';

// SplashScreen이 자동으로 숨겨지지 않도록 설정
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'MaruBuri-Regular': require('./assets/fonts/MaruBuri-Regular.ttf'),
          'MaruBuri-Light': require('./assets/fonts/MaruBuri-Light.ttf'),
          'MaruBuri-ExtraLight': require('./assets/fonts/MaruBuri-ExtraLight.ttf'),
          'MaruBuri-SemiBold': require('./assets/fonts/MaruBuri-SemiBold.ttf'),
          'MaruBuri-Bold': require('./assets/fonts/MaruBuri-Bold.ttf'),
        });
        setFontsLoaded(true);
      } catch (e) {
        console.warn(e);
      } finally {
        await SplashScreen.hideAsync();
      }
    }

    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="auto" />
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}