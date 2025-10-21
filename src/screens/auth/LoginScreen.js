// src/screens/auth/LoginScreen.js
import React, { useState, useRef } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, FormInput, Button } from '../../components/common';
import { useToastStore, useAuthStore } from '../../store';
import AUTH_COLORS, { AUTH_SOCIAL_COLORS, AUTH_GRADIENTS } from '../../styles/auth_colors';
import { loginWithEmail } from '../../services/authService';
import { isFirebaseMode } from '../../config/dataConfig';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const toast = useToastStore();
  const { login } = useAuthStore();

  // Refs for input focus management
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  // 이메일 검증
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('이메일을 입력해주세요');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('올바른 이메일 형식이 아닙니다');
      return false;
    }
    setEmailError('');
    return true;
  };

  // 비밀번호 검증
  const validatePassword = (password) => {
    if (!password) {
      setPasswordError('비밀번호를 입력해주세요');
      return false;
    }
    if (password.length < 6) {
      setPasswordError('비밀번호는 6자 이상이어야 합니다');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleLogin = async () => {
    Keyboard.dismiss();

    // 검증
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
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
    <LinearGradient
      colors={AUTH_GRADIENTS.splashGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* 헤더 - 간소화 */}
            <View className="px-6 pt-6 pb-4 flex-row items-center justify-between">
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
                className="w-10 h-10 items-center justify-center"
              >
                <Ionicons name="arrow-back" size={24} color={AUTH_COLORS.white} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('RoleSelect')}
                activeOpacity={0.7}
              >
                <Text className="text-sm font-semibold" style={{ color: AUTH_COLORS.white }}>
                  회원가입
                </Text>
              </TouchableOpacity>
            </View>

            {/* 상단 일러스트와 타이틀 */}
            <View className="items-center px-6 pt-8 pb-8">
              <View className="mb-6">
                <Text className="text-6xl">🎹</Text>
              </View>
              <Text className="text-2xl font-bold mb-2 text-center" style={{ color: AUTH_COLORS.white }}>
                Piano Academy와{'\n'}함께 시작하세요!
              </Text>
              <Text className="text-sm text-center opacity-90" style={{ color: AUTH_COLORS.white }}>
                학원 관리를 더 쉽고 스마트하게
              </Text>
            </View>

            {/* 간편 로그인 */}
            <View className="px-6 mb-8">
              <Text className="text-xs text-center mb-4 opacity-80" style={{ color: AUTH_COLORS.white }}>
                3초만에 시작하기 🚀
              </Text>
            <View className="flex-row items-center justify-center mb-6" style={{ gap: 5 }}>
              {/* 카카오 로그인 */}
              <TouchableOpacity
                className="w-16 h-16 rounded-full items-center justify-center"
                style={{
                  backgroundColor: AUTH_SOCIAL_COLORS.kakao,
                  shadowColor: AUTH_COLORS.black,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
                onPress={() => handleSocialLogin('카카오')}
                activeOpacity={0.8}
              >
                <Ionicons name="chatbubble" size={28} color={AUTH_COLORS.black} />
              </TouchableOpacity>

              {/* 네이버 로그인 */}
              <TouchableOpacity
                className="w-16 h-16 rounded-full items-center justify-center"
                style={{
                  backgroundColor: AUTH_SOCIAL_COLORS.naver,
                  shadowColor: AUTH_COLORS.black,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
                onPress={() => handleSocialLogin('네이버')}
                activeOpacity={0.8}
              >
                <Text className="font-bold text-2xl" style={{ color: AUTH_COLORS.white }}>N</Text>
              </TouchableOpacity>

              {/* 구글 로그인 */}
              <TouchableOpacity
                className="w-16 h-16 rounded-full items-center justify-center"
                style={{
                  backgroundColor: AUTH_SOCIAL_COLORS.google,
                  shadowColor: AUTH_COLORS.black,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
                onPress={() => handleSocialLogin('Google')}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-google" size={28} color="#DB4437" />
              </TouchableOpacity>

              {/* 애플 로그인 */}
              <TouchableOpacity
                className="w-16 h-16 rounded-full items-center justify-center"
                style={{
                  backgroundColor: AUTH_SOCIAL_COLORS.apple,
                  shadowColor: AUTH_COLORS.black,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
                onPress={() => handleSocialLogin('Apple')}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-apple" size={28} color={AUTH_COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>

          {/* 이메일 로그인 섹션 */}
          <View className="px-6 pb-6">
            <TouchableOpacity
              className="rounded-xl py-3.5 flex-row items-center justify-center mb-6"
              style={{
                backgroundColor: AUTH_COLORS.white,
              }}
              onPress={() => setShowEmailForm(!showEmailForm)}
              activeOpacity={0.8}
            >
              <Ionicons name="mail-outline" size={20} color={AUTH_COLORS.gray[700]} />
              <Text className="font-semibold ml-2" style={{ color: AUTH_COLORS.gray[700] }}>
                이메일로 로그인
              </Text>
            </TouchableOpacity>
          </View>

          {/* 이메일 입력 폼 - 펼쳐지는 영역 */}
          {showEmailForm && (
          <View className="px-6 pt-2 pb-6 mx-6 mb-6 rounded-2xl" style={{ backgroundColor: AUTH_COLORS.white }}>
            {/* 이메일 입력 */}
            <View className="mb-5">
              <FormInput
                ref={emailInputRef}
                label="이메일"
                placeholder="example@email.com"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) setEmailError('');
                }}
                onBlur={() => validateEmail(email)}
                type="email"
                iconName="mail-outline"
                error={emailError}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => passwordInputRef.current?.focus()}
              />
            </View>

            {/* 비밀번호 입력 */}
            <View className="mb-6">
              <FormInput
                ref={passwordInputRef}
                label="비밀번호"
                placeholder="••••••••"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (passwordError) setPasswordError('');
                }}
                onBlur={() => validatePassword(password)}
                type="password"
                iconName="lock-closed-outline"
                rightIconName={showPassword ? 'eye-off-outline' : 'eye-outline'}
                onRightIconPress={() => setShowPassword(!showPassword)}
                error={passwordError}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
            </View>

          {/* 옵션 */}
          <View className="flex-row items-center justify-between mb-6">
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
          <View className="mb-6">
            <TouchableOpacity
              onPress={handleLogin}
              activeOpacity={0.7}
              disabled={loading || !email || !password}
              className="rounded-xl py-4 flex-row items-center justify-center"
              style={{
                backgroundColor: loading || !email || !password ? AUTH_COLORS.gray[200] : AUTH_COLORS.black,
              }}
            >
              {loading ? (
                <View className="flex-row items-center">
                  <ActivityIndicator color={AUTH_COLORS.white} size="small" />
                  <Text className="text-base font-semibold ml-2" style={{ color: AUTH_COLORS.white }}>
                    로그인 중...
                  </Text>
                </View>
              ) : (
                <Text
                  className="text-base font-semibold"
                  style={{ color: !email || !password ? AUTH_COLORS.gray[400] : AUTH_COLORS.white }}
                >
                  로그인
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
          )}

          {/* 회원가입 및 도움말 링크 */}
          <View className="flex-row items-center justify-center pb-8 space-x-1">
            <TouchableOpacity
              onPress={() => navigation.navigate('FindPassword')}
              activeOpacity={0.7}
            >
              <Text className="text-sm opacity-80" style={{ color: AUTH_COLORS.white }}>
                비밀번호 찾기
              </Text>
            </TouchableOpacity>
            <Text className="text-sm opacity-60" style={{ color: AUTH_COLORS.white }}>|</Text>
            <TouchableOpacity
              activeOpacity={0.7}
            >
              <Text className="text-sm opacity-80" style={{ color: AUTH_COLORS.white }}>
                문의하기
              </Text>
            </TouchableOpacity>
          </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}