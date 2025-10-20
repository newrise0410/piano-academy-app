// src/screens/auth/SplashScreen.js
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Text from '../../components/common/Text';
import AUTH_COLORS, { AUTH_GRADIENTS, AUTH_SEMANTIC_COLORS, AUTH_INPUT_COLORS, AUTH_OVERLAY_COLORS, AUTH_SHADOW_COLORS } from '../../styles/auth_colors';
import { useAuthStore } from '../../store/authStore';

export default function SplashScreen({ navigation }) {
  const login = useAuthStore((state) => state.login);
  return (
    <LinearGradient
      colors={AUTH_GRADIENTS.splashGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1, paddingHorizontal: 32, justifyContent: 'center', alignItems: 'center' }}>
        {/* 로고 */}
        <View className="items-center mb-12">
          <Text className="text-8xl mb-6">🎹</Text>
          <Text className="text-4xl font-bold text-white mb-2">피아노학원</Text>
          <Text className="text-white text-lg opacity-90">학원 관리를 스마트하게</Text>
        </View>

        {/* 버튼 영역 */}
        <View className="w-full max-w-sm space-y-3">
          <TouchableOpacity
            className="w-full bg-white rounded-xl py-4 items-center"
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
            style={{
              shadowColor: AUTH_SHADOW_COLORS.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text className="text-purple-600 text-lg font-bold">시작하기</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full border-2 border-white rounded-xl py-4 items-center"
            onPress={() => navigation.navigate('RoleSelect')}
            activeOpacity={0.8}
          >
            <Text className="text-white text-lg font-bold">회원가입</Text>
          </TouchableOpacity>
        </View>

        {/* 하단 텍스트 */}
        <Text className="text-white text-sm mt-8 opacity-75">
          처음 오셨나요? 회원가입하세요
        </Text>

        {/* 디버깅용 빠른 로그인 */}
        <View className="absolute bottom-10 w-full px-8">
          <Text className="text-white text-xs text-center mb-2 opacity-50">디버깅용</Text>
          <View className="flex-row space-x-2">
            <TouchableOpacity
              className="flex-1 rounded-lg py-2 items-center"
              style={{ backgroundColor: AUTH_OVERLAY_COLORS.whiteLight }}
              onPress={() => {
                login({
                  id: '1',
                  name: '김원장',
                  role: 'teacher',
                });
              }}
              activeOpacity={0.7}
            >
              <Text className="text-white text-xs font-semibold">선생님</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 rounded-lg py-2 items-center"
              style={{ backgroundColor: AUTH_OVERLAY_COLORS.whiteLight }}
              onPress={() => {
                login({
                  id: '2',
                  name: '학부모',
                  role: 'parent',
                });
              }}
              activeOpacity={0.7}
            >
              <Text className="text-white text-xs font-semibold">학부모</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
