// src/navigation/AppNavigator.js
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';

import AuthNavigator from './AuthNavigator';
import TeacherNavigator from './TeacherNavigator';
import ParentNavigator from './ParentNavigator';

export default function AppNavigator() {
  // 로그인 상태 확인
  const { user } = useContext(AuthContext);

  const getNavigator = () => {
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