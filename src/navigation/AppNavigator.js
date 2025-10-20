// src/navigation/AppNavigator.js
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';

import AuthNavigator from './AuthNavigator';
import TeacherNavigator from './TeacherNavigator';
import ParentNavigator from './ParentNavigator';

export default function AppNavigator() {
  // 로그인 상태 확인
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const authInitialized = useAuthStore((state) => state.authInitialized);

  const getNavigator = () => {
    // 인증 초기화 중이면 로딩 화면 표시
    if (!authInitialized || loading) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      );
    }

    // 로그인 안 됨 → 로그인 화면
    if (!user) {
      return <AuthNavigator />;
    }

    // 로그인 됨 → 역할에 따라 분기
    if (user.role === 'teacher') {
      return <TeacherNavigator />;
    } else if (user.role === 'parent') {
      return <ParentNavigator />;
    }

    // 기본값 (오류 방지)
    return <AuthNavigator />;
  };

  return (
    <NavigationContainer>
      {getNavigator()}
    </NavigationContainer>
  );
}