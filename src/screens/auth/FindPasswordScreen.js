// src/screens/auth/FindPasswordScreen.js
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Text from '../../components/common/Text';
import AUTH_COLORS, { AUTH_GRADIENTS, AUTH_SEMANTIC_COLORS, AUTH_INPUT_COLORS, AUTH_OVERLAY_COLORS, AUTH_SHADOW_COLORS } from '../../styles/auth_colors';

export default function FindPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');

  const handleSendResetLink = () => {
    if (!email) {
      Alert.alert('알림', '이메일을 입력해주세요.');
      return;
    }
    Alert.alert('완료', '입력하신 이메일로 비밀번호 재설정 링크를 보냈습니다.');
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
          <Text className="text-white text-3xl font-bold mb-1">비밀번호 찾기</Text>
          <Text className="text-white text-sm opacity-90">가입하신 이메일을 입력해주세요</Text>
        </LinearGradient>

        {/* 컨텐츠 */}
        <View className="px-6 py-6 space-y-6">
          {/* 안내 메시지 */}
          <View className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <Text className="text-sm text-blue-800">
              입력하신 이메일로 비밀번호 재설정 링크를 보내드립니다.
            </Text>
          </View>

          {/* 이메일 입력 */}
          <View>
            <Text className="text-sm font-semibold text-gray-700 mb-2">이메일</Text>
            <View className="relative">
              <Ionicons
                name="mail-outline"
                size={20}
                color={AUTH_COLORS.gray[400]}
                style={{ position: 'absolute', left: 12, top: 12, zIndex: 1 }}
              />
              <TextInput
                className="w-full border-2 border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm bg-white"
                placeholder="example@email.com"
                placeholderTextColor={AUTH_COLORS.gray[400]}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={{ fontFamily: 'MaruBuri-Regular' }}
              />
            </View>
          </View>

          {/* 전송 버튼 */}
          <TouchableOpacity
            onPress={handleSendResetLink}
            activeOpacity={0.8}
            style={{
              shadowColor: AUTH_SHADOW_COLORS.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <LinearGradient
              colors={AUTH_GRADIENTS.purpleToPink}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="rounded-xl py-4 items-center"
            >
              <Text className="text-white text-lg font-bold">재설정 링크 보내기</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* 로그인 링크 */}
          <View className="flex-row items-center justify-center">
            <Text className="text-gray-600 text-sm">비밀번호가 기억나셨나요? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.7}
            >
              <Text className="text-purple-600 text-sm font-bold">로그인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
