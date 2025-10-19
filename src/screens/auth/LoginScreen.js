// src/screens/auth/LoginScreen.js
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Text from '../../components/common/Text';
import { SHADOW_COLORS } from '../../styles/colors';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('알림', '이메일과 비밀번호를 입력해주세요.');
      return;
    }
    // TODO: 실제 로그인 로직 구현
    Alert.alert('로그인', '로그인 기능은 준비 중입니다.');
  };

  const handleSocialLogin = (provider) => {
    Alert.alert('소셜 로그인', `${provider} 로그인 기능은 준비 중입니다.`);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <LinearGradient
          colors={['#8B5CF6', '#EC4899']}
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
          <View>
            <Text className="text-sm font-semibold text-gray-700 mb-2">이메일</Text>
            <View className="relative">
              <Ionicons
                name="mail-outline"
                size={20}
                color="#9CA3AF"
                style={{ position: 'absolute', left: 12, top: 12, zIndex: 1 }}
              />
              <TextInput
                className="w-full border-2 border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm bg-white"
                placeholder="example@email.com"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={{ fontFamily: 'MaruBuri-Regular' }}
              />
            </View>
          </View>

          {/* 비밀번호 입력 */}
          <View>
            <Text className="text-sm font-semibold text-gray-700 mb-2">비밀번호</Text>
            <View className="relative">
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#9CA3AF"
                style={{ position: 'absolute', left: 12, top: 12, zIndex: 1 }}
              />
              <TextInput
                className="w-full border-2 border-gray-200 rounded-xl pl-11 pr-11 py-3 text-sm bg-white"
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={{ fontFamily: 'MaruBuri-Regular' }}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3"
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>
          </View>

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
          <TouchableOpacity
            onPress={handleLogin}
            activeOpacity={0.8}
            style={{
              shadowColor: SHADOW_COLORS.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <LinearGradient
              colors={['#8B5CF6', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="rounded-xl py-4 items-center"
            >
              <Text className="text-white text-lg font-bold">로그인</Text>
            </LinearGradient>
          </TouchableOpacity>

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