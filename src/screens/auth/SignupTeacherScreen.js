// src/screens/auth/SignupTeacherScreen.js
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Text from '../../components/common/Text';
import AUTH_COLORS, { AUTH_GRADIENTS, AUTH_SEMANTIC_COLORS, AUTH_INPUT_COLORS, AUTH_OVERLAY_COLORS, AUTH_SHADOW_COLORS } from '../../styles/auth_colors';

export default function SignupTeacherScreen({ navigation }) {
  const [formData, setFormData] = useState({
    academyName: '',
    name: '',
    phone: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedMarketing, setAgreedMarketing] = useState(false);

  const handleSignup = () => {
    if (!formData.academyName || !formData.name || !formData.phone || !formData.email || !formData.password) {
      Alert.alert('필수 항목을 확인해주세요', '모든 항목을 입력해주세요.');
      return;
    }
    if (formData.password !== formData.passwordConfirm) {
      Alert.alert('비밀번호가 다릅니다', '비밀번호를 다시 확인해주세요.');
      return;
    }
    if (!agreedTerms) {
      Alert.alert('약관 동의가 필요해요', '이용약관에 동의해주세요.');
      return;
    }
    // TODO: 실제 회원가입 로직 구현
    Alert.alert('조금만 기다려주세요', '회원가입 기능은 준비 중입니다.');
  };

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
          <View className="px-6 pt-6 pb-8">
            <Text className="text-3xl font-bold mb-2" style={{ color: AUTH_COLORS.white }}>
              시작하기
            </Text>
            <Text className="text-base opacity-90" style={{ color: AUTH_COLORS.white }}>
              학원 정보만 입력하면 바로 시작할 수 있어요
            </Text>
          </View>

          {/* 컨텐츠 - 흰색 카드로 감싸기 */}
          <View className="px-6 pb-6">
            <View className="bg-white rounded-3xl px-6 py-6 space-y-4"
              style={{
                shadowColor: AUTH_COLORS.black,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 5,
              }}
            >
          {/* 학원명 */}
          <View>
            <Text className="text-sm font-semibold text-gray-700 mb-2">학원 이름</Text>
            <View className="relative">
              <Ionicons name="business" size={20} color={AUTH_COLORS.gray[400]} style={{ position: 'absolute', left: 12, top: 12, zIndex: 1 }} />
              <TextInput
                className="w-full border-2 border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm bg-white"
                placeholder="서울 피아노학원"
                placeholderTextColor={AUTH_COLORS.gray[400]}
                value={formData.academyName}
                onChangeText={(text) => setFormData({...formData, academyName: text})}
                style={{ fontFamily: 'MaruBuri-Regular' }}
              />
            </View>
          </View>

          {/* 원장님 이름 */}
          <View>
            <Text className="text-sm font-semibold text-gray-700 mb-2">이름</Text>
            <View className="relative">
              <Ionicons name="person" size={20} color={AUTH_COLORS.gray[400]} style={{ position: 'absolute', left: 12, top: 12, zIndex: 1 }} />
              <TextInput
                className="w-full border-2 border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm bg-white"
                placeholder="홍길동"
                placeholderTextColor={AUTH_COLORS.gray[400]}
                value={formData.name}
                onChangeText={(text) => setFormData({...formData, name: text})}
                style={{ fontFamily: 'MaruBuri-Regular' }}
              />
            </View>
          </View>

          {/* 연락처 */}
          <View>
            <Text className="text-sm font-semibold text-gray-700 mb-2">연락처</Text>
            <View className="relative">
              <Ionicons name="call" size={20} color={AUTH_COLORS.gray[400]} style={{ position: 'absolute', left: 12, top: 12, zIndex: 1 }} />
              <TextInput
                className="w-full border-2 border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm bg-white"
                placeholder="010-1234-5678"
                placeholderTextColor={AUTH_COLORS.gray[400]}
                value={formData.phone}
                onChangeText={(text) => setFormData({...formData, phone: text})}
                keyboardType="phone-pad"
                style={{ fontFamily: 'MaruBuri-Regular' }}
              />
            </View>
          </View>

          {/* 이메일 */}
          <View>
            <Text className="text-sm font-semibold text-gray-700 mb-2">이메일</Text>
            <View className="relative">
              <Ionicons name="mail-outline" size={20} color={AUTH_COLORS.gray[400]} style={{ position: 'absolute', left: 12, top: 12, zIndex: 1 }} />
              <TextInput
                className="w-full border-2 border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm bg-white"
                placeholder="email@example.com"
                placeholderTextColor={AUTH_COLORS.gray[400]}
                value={formData.email}
                onChangeText={(text) => setFormData({...formData, email: text})}
                keyboardType="email-address"
                autoCapitalize="none"
                style={{ fontFamily: 'MaruBuri-Regular' }}
              />
            </View>
          </View>

          {/* 비밀번호 */}
          <View>
            <Text className="text-sm font-semibold text-gray-700 mb-2">비밀번호</Text>
            <View className="relative">
              <Ionicons name="lock-closed-outline" size={20} color={AUTH_COLORS.gray[400]} style={{ position: 'absolute', left: 12, top: 12, zIndex: 1 }} />
              <TextInput
                className="w-full border-2 border-gray-200 rounded-xl pl-11 pr-11 py-3 text-sm bg-white"
                placeholder="6자 이상 입력해주세요"
                placeholderTextColor={AUTH_COLORS.gray[400]}
                value={formData.password}
                onChangeText={(text) => setFormData({...formData, password: text})}
                secureTextEntry={!showPassword}
                style={{ fontFamily: 'MaruBuri-Regular' }}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="absolute right-3 top-3" activeOpacity={0.7}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={AUTH_COLORS.gray[400]} />
              </TouchableOpacity>
            </View>
          </View>

          {/* 비밀번호 확인 */}
          <View>
            <Text className="text-sm font-semibold text-gray-700 mb-2">비밀번호 확인</Text>
            <View className="relative">
              <Ionicons name="lock-closed-outline" size={20} color={AUTH_COLORS.gray[400]} style={{ position: 'absolute', left: 12, top: 12, zIndex: 1 }} />
              <TextInput
                className="w-full border-2 border-gray-200 rounded-xl pl-11 pr-11 py-3 text-sm bg-white"
                placeholder="한번 더 입력해주세요"
                placeholderTextColor={AUTH_COLORS.gray[400]}
                value={formData.passwordConfirm}
                onChangeText={(text) => setFormData({...formData, passwordConfirm: text})}
                secureTextEntry={!showPasswordConfirm}
                style={{ fontFamily: 'MaruBuri-Regular' }}
              />
              <TouchableOpacity onPress={() => setShowPasswordConfirm(!showPasswordConfirm)} className="absolute right-3 top-3" activeOpacity={0.7}>
                <Ionicons name={showPasswordConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color={AUTH_COLORS.gray[400]} />
              </TouchableOpacity>
            </View>
          </View>

          {/* 약관 동의 */}
          <View className="space-y-3 pt-4">
            <TouchableOpacity className="flex-row items-start" onPress={() => setAgreedTerms(!agreedTerms)} activeOpacity={0.7}>
              <View className={`w-5 h-5 rounded border-2 ${agreedTerms ? 'bg-purple-600 border-purple-600' : 'border-gray-300 bg-white'} items-center justify-center mr-2 mt-0.5`}>
                {agreedTerms && <Ionicons name="checkmark" size={16} color="white" />}
              </View>
              <Text className="text-sm text-gray-700 flex-1">
                이용약관 및 개인정보처리방침에 동의해요 (필수)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-start" onPress={() => setAgreedMarketing(!agreedMarketing)} activeOpacity={0.7}>
              <View className={`w-5 h-5 rounded border-2 ${agreedMarketing ? 'bg-purple-600 border-purple-600' : 'border-gray-300 bg-white'} items-center justify-center mr-2 mt-0.5`}>
                {agreedMarketing && <Ionicons name="checkmark" size={16} color="white" />}
              </View>
              <Text className="text-sm text-gray-500 flex-1">
                마케팅 정보 수신에 동의해요 (선택)
              </Text>
            </TouchableOpacity>
          </View>

          {/* 가입 버튼 */}
          <TouchableOpacity
            onPress={handleSignup}
            activeOpacity={0.7}
            className="rounded-xl py-4 items-center mt-2"
            style={{
              backgroundColor: AUTH_COLORS.black,
            }}
          >
            <Text className="text-lg font-semibold" style={{ color: AUTH_COLORS.white }}>
              시작하기
            </Text>
          </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
