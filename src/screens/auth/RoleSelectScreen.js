// src/screens/auth/RoleSelectScreen.js
import React from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Text from '../../components/common/Text';
import AUTH_COLORS, { AUTH_GRADIENTS, AUTH_SEMANTIC_COLORS, AUTH_INPUT_COLORS, AUTH_OVERLAY_COLORS } from '../../styles/auth_colors';

export default function RoleSelectScreen({ navigation }) {
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
          <Text className="text-white text-3xl font-bold mb-1">회원가입</Text>
          <Text className="text-white text-sm opacity-90">어떤 역할로 가입하시나요?</Text>
        </LinearGradient>

        {/* 컨텐츠 */}
        <View className="px-6 py-8 flex-1 justify-center">
          {/* 원장님 카드 */}
          <TouchableOpacity
            className="bg-white border-2 border-purple-300 rounded-2xl p-6 mb-4"
            onPress={() => navigation.navigate('SignupTeacher')}
            activeOpacity={0.8}
            style={{
              shadowColor: AUTH_COLORS.primary.DEFAULT,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <View className="flex-row items-start">
              <View className="w-16 h-16 bg-purple-100 rounded-2xl items-center justify-center mr-4">
                <Ionicons name="business" size={32} color={AUTH_COLORS.primary.DEFAULT} />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-gray-800 mb-1">원장님으로 가입</Text>
                <Text className="text-sm text-gray-600 mb-3">학원을 운영하고 계신가요?</Text>
                <View className="space-y-1">
                  <View className="flex-row items-center">
                    <Ionicons name="checkmark-circle" size={14} color={AUTH_SEMANTIC_COLORS.teacher} />
                    <Text className="text-xs text-gray-500 ml-1">학생 관리</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="checkmark-circle" size={14} color={AUTH_SEMANTIC_COLORS.teacher} />
                    <Text className="text-xs text-gray-500 ml-1">출석 체크</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="checkmark-circle" size={14} color={AUTH_SEMANTIC_COLORS.teacher} />
                    <Text className="text-xs text-gray-500 ml-1">수강료 관리</Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* 학부모 카드 */}
          <TouchableOpacity
            className="bg-white border-2 border-pink-300 rounded-2xl p-6"
            onPress={() => navigation.navigate('SignupParent')}
            activeOpacity={0.8}
            style={{
              shadowColor: AUTH_COLORS.pink[500],
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <View className="flex-row items-start">
              <View className="w-16 h-16 bg-pink-100 rounded-2xl items-center justify-center mr-4">
                <Ionicons name="person" size={32} color={AUTH_SEMANTIC_COLORS.parent} />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-gray-800 mb-1">학부모로 가입</Text>
                <Text className="text-sm text-gray-600 mb-3">자녀가 학원에 다니고 있나요?</Text>
                <View className="space-y-1">
                  <View className="flex-row items-center">
                    <Ionicons name="checkmark-circle" size={14} color={AUTH_SEMANTIC_COLORS.parent} />
                    <Text className="text-xs text-gray-500 ml-1">알림장 확인</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="checkmark-circle" size={14} color={AUTH_SEMANTIC_COLORS.parent} />
                    <Text className="text-xs text-gray-500 ml-1">출석 확인</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="checkmark-circle" size={14} color={AUTH_SEMANTIC_COLORS.parent} />
                    <Text className="text-xs text-gray-500 ml-1">진도 확인</Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* 로그인 링크 */}
          <View className="flex-row items-center justify-center pt-8">
            <Text className="text-gray-600 text-sm">이미 계정이 있으신가요? </Text>
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
