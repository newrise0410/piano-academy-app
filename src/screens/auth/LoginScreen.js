// src/screens/auth/LoginScreen.js
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, FormInput, Button } from '../../components/common';
import { useToastStore, useAuthStore } from '../../store';
import AUTH_COLORS, { AUTH_GRADIENTS, AUTH_SHADOW_COLORS } from '../../styles/auth_colors';
import { loginWithEmail } from '../../services/authService';
import { isFirebaseMode } from '../../config/dataConfig';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToastStore();
  const { login } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      toast.warning('이메일과 비밀번호를 입력해주세요');
      return;
    }

    // Firebase 모드인 경우 실제 로그인
    if (isFirebaseMode()) {
      setLoading(true);
      try {
        const result = await loginWithEmail(email, password);

        if (result.success) {
          // AuthStore에 사용자 정보 저장
          login(result.user);
          toast.success('로그인 성공!');

          // 역할에 따라 화면 이동
          // navigation.replace는 RootNavigator에서 자동으로 처리됨
        } else {
          toast.error(result.error || '로그인에 실패했습니다');
        }
      } catch (error) {
        console.error('Login error:', error);
        toast.error('로그인 중 오류가 발생했습니다');
      } finally {
        setLoading(false);
      }
    } else {
      // Mock 모드는 기존 동작
      toast.info('로그인 기능은 준비 중입니다');
    }
  };

  const handleSocialLogin = (provider) => {
    toast.info(`${provider} 로그인 기능은 준비 중입니다`);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <LinearGradient
          colors={AUTH_GRADIENTS.purpleToPink}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="px-5 py-6"
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mb-4"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-3xl font-bold mb-1">로그인</Text>
          <Text className="text-white text-sm opacity-90">환영합니다! 👋</Text>
        </LinearGradient>

        {/* 컨텐츠 */}
        <View className="px-6 py-6 space-y-6">
          {/* 이메일 입력 */}
          <FormInput
            label="이메일"
            placeholder="example@email.com"
            value={email}
            onChangeText={setEmail}
            type="email"
            iconName="mail-outline"
          />

          {/* 비밀번호 입력 */}
          <FormInput
            label="비밀번호"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            type="password"
            iconName="lock-closed-outline"
            rightIconName={showPassword ? 'eye-off-outline' : 'eye-outline'}
            onRightIconPress={() => setShowPassword(!showPassword)}
          />

          {/* 옵션 */}
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.7}
            >
              <View
                className={`w-5 h-5 rounded border-2 ${
                  rememberMe ? 'bg-purple-600 border-purple-600' : 'border-gray-300 bg-white'
                } items-center justify-center mr-2`}
              >
                {rememberMe && <Ionicons name="checkmark" size={16} color="white" />}
              </View>
              <Text className="text-sm text-gray-600">로그인 유지</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('FindPassword')}
              activeOpacity={0.7}
            >
              <Text className="text-sm font-semibold text-purple-600">비밀번호 찾기</Text>
            </TouchableOpacity>
          </View>

          {/* 로그인 버튼 */}
          <View
            style={{
              shadowColor: AUTH_SHADOW_COLORS.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <TouchableOpacity onPress={handleLogin} activeOpacity={0.8} disabled={loading}>
              <LinearGradient
                colors={loading ? ['#9CA3AF', '#9CA3AF'] : AUTH_GRADIENTS.purpleToPink}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="rounded-xl py-4 items-center"
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-lg font-bold">로그인</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* 구분선 */}
          <View className="relative">
            <View className="absolute inset-0 flex items-center justify-center">
              <View className="w-full border-t border-gray-300" />
            </View>
            <View className="relative flex items-center justify-center">
              <Text className="px-4 bg-gray-50 text-sm text-gray-500">또는</Text>
            </View>
          </View>

          {/* 소셜 로그인 */}
          <View className="space-y-3">
            <TouchableOpacity
              className="w-full border-2 border-gray-200 rounded-xl py-3 flex-row items-center justify-center bg-white"
              onPress={() => handleSocialLogin('카카오')}
              activeOpacity={0.8}
            >
              <View className="w-5 h-5 bg-yellow-400 rounded mr-2" />
              <Text className="text-gray-800 font-semibold">카카오로 시작하기</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="w-full border-2 border-gray-200 rounded-xl py-3 flex-row items-center justify-center bg-white"
              onPress={() => handleSocialLogin('네이버')}
              activeOpacity={0.8}
            >
              <View className="w-5 h-5 bg-green-500 rounded-full mr-2" />
              <Text className="text-gray-800 font-semibold">네이버로 시작하기</Text>
            </TouchableOpacity>
          </View>

          {/* 회원가입 링크 */}
          <View className="flex-row items-center justify-center pt-4">
            <Text className="text-gray-600 text-sm">계정이 없으신가요? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('RoleSelect')}
              activeOpacity={0.7}
            >
              <Text className="text-purple-600 text-sm font-bold">회원가입</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}