// src/screens/auth/SignupTeacherScreen.js
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Text from '../../components/common/Text';
import AUTH_COLORS, { AUTH_GRADIENTS, AUTH_SEMANTIC_COLORS, AUTH_INPUT_COLORS, AUTH_OVERLAY_COLORS, AUTH_SHADOW_COLORS } from '../../styles/auth_colors';
import { registerWithEmail } from '../../services/authService';
import { useAuthStore, useToastStore } from '../../store';

export default function SignupTeacherScreen({ navigation }) {
  const [formData, setFormData] = useState({
    academyName: '',
    businessNumber: '',
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
  const [loading, setLoading] = useState(false);

  const { login } = useAuthStore();
  const toast = useToastStore();

  const handleSignup = async () => {
    // 검증
    if (!formData.academyName || !formData.businessNumber || !formData.name || !formData.phone || !formData.email || !formData.password) {
      toast.error('모든 항목을 입력해주세요');
      return;
    }

    // 사업자등록번호 검증
    const { validateBusinessNumber } = require('../../utils/academyUtils');
    if (!validateBusinessNumber(formData.businessNumber)) {
      toast.error('올바른 사업자등록번호를 입력해주세요');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('비밀번호는 최소 6자 이상이어야 합니다');
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      toast.error('비밀번호가 일치하지 않습니다');
      return;
    }

    if (!agreedTerms) {
      toast.error('이용약관에 동의해주세요');
      return;
    }

    setLoading(true);
    try {
      // 1. Firebase 회원가입
      const registerResult = await registerWithEmail(formData.email, formData.password, {
        name: formData.name,
        role: 'teacher',
        phone: formData.phone,
        agreedMarketing,
      });

      if (!registerResult.success) {
        toast.error(registerResult.error || '회원가입에 실패했습니다');
        return;
      }

      // 2. 학원 생성
      const { createAcademy } = await import('../../services/firestoreService');
      const academyResult = await createAcademy({
        name: formData.academyName,
        businessNumber: formData.businessNumber,
        ownerId: registerResult.user.uid,
        ownerName: formData.name,
        ownerPhone: formData.phone,
        ownerEmail: formData.email,
      });

      if (!academyResult.success) {
        toast.error('학원 생성에 실패했습니다');
        return;
      }

      // 3. 사용자 정보에 학원 정보 추가
      const { updateUserProfile } = await import('../../services/authService');
      await updateUserProfile(registerResult.user.uid, {
        academyId: academyResult.academyId,
        academyCode: academyResult.code,
        academyName: formData.academyName,
      });

      // 4. AuthStore에 사용자 정보 저장
      login({
        uid: registerResult.user.uid,
        email: registerResult.user.email,
        displayName: registerResult.user.displayName,
        role: 'teacher',
        academyId: academyResult.academyId,
        academyCode: academyResult.code,
        academyName: formData.academyName,
        phone: formData.phone,
      });

      toast.success(`회원가입 완료! 학원 코드: ${academyResult.code}`);

      // 메인 화면은 AppNavigator에서 자동으로 전환됨
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('회원가입 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
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

          {/* 사업자등록번호 */}
          <View>
            <Text className="text-sm font-semibold text-gray-700 mb-2">사업자등록번호</Text>
            <View className="relative">
              <Ionicons name="document-text" size={20} color={AUTH_COLORS.gray[400]} style={{ position: 'absolute', left: 12, top: 12, zIndex: 1 }} />
              <TextInput
                className="w-full border-2 border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm bg-white"
                placeholder="000-00-00000"
                placeholderTextColor={AUTH_COLORS.gray[400]}
                value={formData.businessNumber}
                onChangeText={(text) => {
                  const { formatBusinessNumber } = require('../../utils/academyUtils');
                  const formatted = formatBusinessNumber(text);
                  setFormData({...formData, businessNumber: formatted});
                }}
                keyboardType="number-pad"
                maxLength={12}
                style={{ fontFamily: 'MaruBuri-Regular' }}
              />
            </View>
            <Text className="text-xs text-gray-500 mt-1.5 ml-1">학원 코드 생성에 사용됩니다</Text>
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
                autoCorrect={false}
                autoCapitalize="none"
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
                autoCorrect={false}
                autoCapitalize="none"
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
            disabled={loading}
            className="rounded-xl py-4 items-center mt-2"
            style={{
              backgroundColor: loading ? AUTH_COLORS.gray[400] : AUTH_COLORS.black,
            }}
          >
            {loading ? (
              <View className="flex-row items-center">
                <ActivityIndicator color={AUTH_COLORS.white} size="small" />
                <Text className="text-lg font-semibold ml-2" style={{ color: AUTH_COLORS.white }}>
                  가입 중...
                </Text>
              </View>
            ) : (
              <Text className="text-lg font-semibold" style={{ color: AUTH_COLORS.white }}>
                시작하기
              </Text>
            )}
          </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
