// App.js
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/common/ErrorBoundary';
import ToastContainer from './src/components/common/ToastContainer';
import { useAuthStore } from './src/store/authStore';
import './global.css';

// SplashScreen이 자동으로 숨겨지지 않도록 설정
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          // MaruBuri fonts
          'MaruBuri-Regular': require('./assets/fonts/MaruBuri-Regular.ttf'),
          'MaruBuri-Light': require('./assets/fonts/MaruBuri-Light.ttf'),
          'MaruBuri-ExtraLight': require('./assets/fonts/MaruBuri-ExtraLight.ttf'),
          'MaruBuri-SemiBold': require('./assets/fonts/MaruBuri-SemiBold.ttf'),
          'MaruBuri-Bold': require('./assets/fonts/MaruBuri-Bold.ttf'),
          // Pretendard fonts
          'Pretendard-Thin': require('./assets/fonts/Pretendard-Thin.otf'),
          'Pretendard-ExtraLight': require('./assets/fonts/Pretendard-ExtraLight.otf'),
          'Pretendard-Light': require('./assets/fonts/Pretendard-Light.otf'),
          'Pretendard-Regular': require('./assets/fonts/Pretendard-Regular.otf'),
          'Pretendard-Medium': require('./assets/fonts/Pretendard-Medium.otf'),
          'Pretendard-SemiBold': require('./assets/fonts/Pretendard-SemiBold.otf'),
          'Pretendard-Bold': require('./assets/fonts/Pretendard-Bold.otf'),
          'Pretendard-ExtraBold': require('./assets/fonts/Pretendard-ExtraBold.otf'),
          'Pretendard-Black': require('./assets/fonts/Pretendard-Black.otf'),
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

  // Firebase 인증 초기화
  useEffect(() => {
    const unsubscribe = initializeAuth();
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [initializeAuth]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <AppNavigator />
        <ToastContainer />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}