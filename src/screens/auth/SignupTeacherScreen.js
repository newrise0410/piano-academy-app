// src/screens/auth/SignupTeacherScreen.js
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Text from '../../components/common/Text';
import { SHADOW_COLORS } from '../../styles/colors';

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
      Alert.alert('알림', '필수 항목을 모두 입력해주세요.');
      return;
    }
    if (formData.password !== formData.passwordConfirm) {
      Alert.alert('알림', '비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!agreedTerms) {
      Alert.alert('알림', '이용약관에 동의해주세요.');
      return;
    }
    // TODO: 실제 회원가입 로직 구현
    Alert.alert('회원가입', '회원가입 기능은 준비 중입니다.');
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
          <Text className="text-white text-3xl font-bold mb-1">원장님 회원가입</Text>
          <Text className="text-white text-sm opacity-90">학원 정보를 입력해주세요</Text>
        </LinearGradient>

        {/* 컨텐츠 */}
        <View className="px-6 py-6 space-y-4">
          {/* 학원명 */}
          <View>
            <Text className="text-sm font-semibold text-gray-700 mb-2">학원명 *</Text>
            <View className="relative">
              <Ionicons name="business" size={20} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: 12, zIndex: 1 }} />
              <TextInput
                className="w-full border-2 border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm bg-white"
                placeholder="예: 서울 피아노학원"
                placeholderTextColor="#9CA3AF"
                value={formData.academyName}
                onChangeText={(text) => setFormData({...formData, academyName: text})}
                style={{ fontFamily: 'MaruBuri-Regular' }}
              />
            </View>
          </View>

          {/* 원장님 이름 */}
          <View>
            <Text className="text-sm font-semibold text-gray-700 mb-2">원장님 성함 *</Text>
            <View className="relative">
              <Ionicons name="person" size={20} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: 12, zIndex: 1 }} />
              <TextInput
                className="w-full border-2 border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm bg-white"
                placeholder="홍길동"
                placeholderTextColor="#9CA3AF"
                value={formData.name}
                onChangeText={(text) => setFormData({...formData, name: text})}
                style={{ fontFamily: 'MaruBuri-Regular' }}
              />
            </View>
          </View>

          {/* 연락처 */}
          <View>
            <Text className="text-sm font-semibold text-gray-700 mb-2">연락처 *</Text>
            <View className="relative">
              <Ionicons name="call" size={20} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: 12, zIndex: 1 }} />
              <TextInput
                className="w-full border-2 border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm bg-white"
                placeholder="010-1234-5678"
                placeholderTextColor="#9CA3AF"
                value={formData.phone}
                onChangeText={(text) => setFormData({...formData, phone: text})}
                keyboardType="phone-pad"
                style={{ fontFamily: 'MaruBuri-Regular' }}
              />
            </View>
          </View>

          {/* 이메일 */}
          <View>
            <Text className="text-sm font-semibold text-gray-700 mb-2">이메일 *</Text>
            <View className="relative">
              <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: 12, zIndex: 1 }} />
              <TextInput
                className="w-full border-2 border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm bg-white"
                placeholder="example@email.com"
                placeholderTextColor="#9CA3AF"
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
            <Text className="text-sm font-semibold text-gray-700 mb-2">비밀번호 *</Text>
            <View className="relative">
              <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: 12, zIndex: 1 }} />
              <TextInput
                className="w-full border-2 border-gray-200 rounded-xl pl-11 pr-11 py-3 text-sm bg-white"
                placeholder="8자 이상"
                placeholderTextColor="#9CA3AF"
                value={formData.password}
                onChangeText={(text) => setFormData({...formData, password: text})}
                secureTextEntry={!showPassword}
                style={{ fontFamily: 'MaruBuri-Regular' }}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="absolute right-3 top-3" activeOpacity={0.7}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* 비밀번호 확인 */}
          <View>
            <Text className="text-sm font-semibold text-gray-700 mb-2">비밀번호 확인 *</Text>
            <View className="relative">
              <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: 12, zIndex: 1 }} />
              <TextInput
                className="w-full border-2 border-gray-200 rounded-xl pl-11 pr-11 py-3 text-sm bg-white"
                placeholder="비밀번호 재입력"
                placeholderTextColor="#9CA3AF"
                value={formData.passwordConfirm}
                onChangeText={(text) => setFormData({...formData, passwordConfirm: text})}
                secureTextEntry={!showPasswordConfirm}
                style={{ fontFamily: 'MaruBuri-Regular' }}
              />
              <TouchableOpacity onPress={() => setShowPasswordConfirm(!showPasswordConfirm)} className="absolute right-3 top-3" activeOpacity={0.7}>
                <Ionicons name={showPasswordConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* 약관 동의 */}
          <View className="space-y-2 pt-2">
            <TouchableOpacity className="flex-row items-start" onPress={() => setAgreedTerms(!agreedTerms)} activeOpacity={0.7}>
              <View className={`w-5 h-5 rounded border-2 ${agreedTerms ? 'bg-purple-600 border-purple-600' : 'border-gray-300 bg-white'} items-center justify-center mr-2 mt-0.5`}>
                {agreedTerms && <Ionicons name="checkmark" size={16} color="white" />}
              </View>
              <Text className="text-sm text-gray-700 flex-1">
                <Text className="font-semibold">[필수]</Text> 이용약관 및 개인정보처리방침에 동의합니다
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-start" onPress={() => setAgreedMarketing(!agreedMarketing)} activeOpacity={0.7}>
              <View className={`w-5 h-5 rounded border-2 ${agreedMarketing ? 'bg-purple-600 border-purple-600' : 'border-gray-300 bg-white'} items-center justify-center mr-2 mt-0.5`}>
                {agreedMarketing && <Ionicons name="checkmark" size={16} color="white" />}
              </View>
              <Text className="text-sm text-gray-700 flex-1">
                <Text className="font-semibold">[선택]</Text> 마케팅 정보 수신에 동의합니다
              </Text>
            </TouchableOpacity>
          </View>

          {/* 가입 버튼 */}
          <TouchableOpacity
            onPress={handleSignup}
            activeOpacity={0.8}
            style={{
              shadowColor: SHADOW_COLORS.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <LinearGradient colors={['#8B5CF6', '#EC4899']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="rounded-xl py-4 items-center mt-2">
              <Text className="text-white text-lg font-bold">가입하기</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
