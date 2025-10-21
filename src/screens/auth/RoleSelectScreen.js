// src/screens/auth/RoleSelectScreen.js
import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Text from '../../components/common/Text';
import AUTH_COLORS, {
  AUTH_GRADIENTS,
  AUTH_SEMANTIC_COLORS,
  AUTH_INPUT_COLORS,
  AUTH_OVERLAY_COLORS,
} from '../../styles/auth_colors';

export default function RoleSelectScreen({ navigation }) {
  // 애니메이션 값
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const teacherSlideAnim = useRef(new Animated.Value(50)).current;
  const parentSlideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // 화면 진입 애니메이션
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(teacherSlideAnim, {
        toValue: 0,
        duration: 500,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(parentSlideAnim, {
        toValue: 0,
        duration: 500,
        delay: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <LinearGradient
      colors={AUTH_GRADIENTS.splashGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {/* 헤더 - 심플하게 */}
          <View className="px-6 pt-6 pb-4 flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
              className="w-10 h-10 items-center justify-center"
            >
              <Ionicons name="arrow-back" size={24} color={AUTH_COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.7}
            >
              <Text className="text-sm font-semibold" style={{ color: AUTH_COLORS.white }}>
                로그인
              </Text>
            </TouchableOpacity>
          </View>

          {/* 타이틀 */}
          <View className="items-center px-6 pt-8 pb-12">
            <Text className="text-3xl font-bold mb-3 text-center" style={{ color: AUTH_COLORS.white }}>
              회원가입
            </Text>
            <Text className="text-base text-center opacity-90" style={{ color: AUTH_COLORS.white }}>
              어떤 역할로 가입하시나요?
            </Text>
          </View>

          {/* 컨텐츠 */}
          <Animated.View
            className="px-6 pb-8 flex-1"
            style={{ opacity: fadeAnim }}
          >
          {/* 원장님 카드 */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: teacherSlideAnim }],
            }}
          >
            <TouchableOpacity
              className="bg-white border-2 border-purple-300 rounded-2xl p-6 mb-4"
              onPress={() => navigation.navigate('SignupTeacher')}
              activeOpacity={0.8}
              style={{
                shadowColor: AUTH_COLORS.primary.DEFAULT,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
                elevation: 5,
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
          </Animated.View>

          {/* 학부모 카드 */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: parentSlideAnim }],
            }}
          >
            <TouchableOpacity
              className="bg-white border-2 border-pink-300 rounded-2xl p-6"
              onPress={() => navigation.navigate('SignupParent')}
              activeOpacity={0.8}
              style={{
                shadowColor: AUTH_COLORS.pink[500],
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
                elevation: 5,
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
          </Animated.View>

        </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
