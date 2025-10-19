// src/screens/auth/SignupParentScreen.js
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Text from '../../components/common/Text';
import { SHADOW_COLORS } from '../../styles/colors';

export default function SignupParentScreen({ navigation }) {
  const [formData, setFormData] = useState({
    parentName: '',
    childName: '',
    academyCode: '',
    phone: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);

  const handleSignup = () => {
    if (!formData.parentName || !formData.childName || !formData.academyCode || !formData.phone || !formData.email || !formData.password) {
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
    Alert.alert('회원가입', '회원가입 기능은 준비 중입니다.');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#EC4899', '#8B5CF6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="px-5 py-6">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mb-4" activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-3xl font-bold mb-1">학부모 회원가입</Text>
          <Text className="text-white text-sm opacity-90">정보를 입력해주세요</Text>
        </LinearGradient>

        <View className="px-6 py-6 space-y-4">
          <View>
            <Text className="text-sm font-semibold text-gray-700 mb-2">학부모 성함 *</Text>
            <View className="relative">
              <Ionicons name="person" size={20} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: 12, zIndex: 1 }} />
              <TextInput className="w-full border-2 border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm bg-white" placeholder="홍길동" placeholderTextColor="#9CA3AF" value={formData.parentName} onChangeText={(text) => setFormData({...formData, parentName: text})} style={{ fontFamily: 'MaruBuri-Regular' }} />
            </View>
          </View>

          <View>
            <Text className="text-sm font-semibold text-gray-700 mb-2">자녀 이름 *</Text>
            <View className="relative">
              <Ionicons name="person" size={20} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: 12, zIndex: 1 }} />
              <TextInput className="w-full border-2 border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm bg-white" placeholder="홍OO" placeholderTextColor="#9CA3AF" value={formData.childName} onChangeText={(text) => setFormData({...formData, childName: text})} style={{ fontFamily: 'MaruBuri-Regular' }} />
            </View>
          </View>

          <View>
            <Text className="text-sm font-semibold text-gray-700 mb-2">학원 초대 코드 *</Text>
            <View className="relative">
              <Ionicons name="business" size={20} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: 12, zIndex: 1 }} />
              <TextInput className="w-full border-2 border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm bg-white" placeholder="학원에서 받은 코드 입력" placeholderTextColor="#9CA3AF" value={formData.academyCode} onChangeText={(text) => setFormData({...formData, academyCode: text})} style={{ fontFamily: 'MaruBuri-Regular' }} />
            </View>
            <Text className="text-xs text-gray-500 mt-1">* 학원 원장님께 초대 코드를 받으세요</Text>
          </View>

          <View>
            <Text className="text-sm font-semibold text-gray-700 mb-2">연락처 *</Text>
            <View className="relative">
              <Ionicons name="call" size={20} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: 12, zIndex: 1 }} />
              <TextInput className="w-full border-2 border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm bg-white" placeholder="010-1234-5678" placeholderTextColor="#9CA3AF" value={formData.phone} onChangeText={(text) => setFormData({...formData, phone: text})} keyboardType="phone-pad" style={{ fontFamily: 'MaruBuri-Regular' }} />
            </View>
          </View>

          <View>
            <Text className="text-sm font-semibold text-gray-700 mb-2">이메일 *</Text>
            <View className="relative">
              <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: 12, zIndex: 1 }} />
              <TextInput className="w-full border-2 border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm bg-white" placeholder="example@email.com" placeholderTextColor="#9CA3AF" value={formData.email} onChangeText={(text) => setFormData({...formData, email: text})} keyboardType="email-address" autoCapitalize="none" style={{ fontFamily: 'MaruBuri-Regular' }} />
            </View>
          </View>

          <View>
            <Text className="text-sm font-semibold text-gray-700 mb-2">비밀번호 *</Text>
            <View className="relative">
              <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: 12, zIndex: 1 }} />
              <TextInput className="w-full border-2 border-gray-200 rounded-xl pl-11 pr-11 py-3 text-sm bg-white" placeholder="8자 이상" placeholderTextColor="#9CA3AF" value={formData.password} onChangeText={(text) => setFormData({...formData, password: text})} secureTextEntry={!showPassword} style={{ fontFamily: 'MaruBuri-Regular' }} />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="absolute right-3 top-3" activeOpacity={0.7}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          <View>
            <Text className="text-sm font-semibold text-gray-700 mb-2">비밀번호 확인 *</Text>
            <View className="relative">
              <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: 12, zIndex: 1 }} />
              <TextInput className="w-full border-2 border-gray-200 rounded-xl pl-11 pr-11 py-3 text-sm bg-white" placeholder="비밀번호 재입력" placeholderTextColor="#9CA3AF" value={formData.passwordConfirm} onChangeText={(text) => setFormData({...formData, passwordConfirm: text})} secureTextEntry={!showPasswordConfirm} style={{ fontFamily: 'MaruBuri-Regular' }} />
              <TouchableOpacity onPress={() => setShowPasswordConfirm(!showPasswordConfirm)} className="absolute right-3 top-3" activeOpacity={0.7}>
                <Ionicons name={showPasswordConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="space-y-2 pt-2">
            <TouchableOpacity className="flex-row items-start" onPress={() => setAgreedTerms(!agreedTerms)} activeOpacity={0.7}>
              <View className={`w-5 h-5 rounded border-2 ${agreedTerms ? 'bg-pink-600 border-pink-600' : 'border-gray-300 bg-white'} items-center justify-center mr-2 mt-0.5`}>
                {agreedTerms && <Ionicons name="checkmark" size={16} color="white" />}
              </View>
              <Text className="text-sm text-gray-700 flex-1">
                <Text className="font-semibold">[필수]</Text> 이용약관 및 개인정보처리방침에 동의합니다
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleSignup} activeOpacity={0.8} style={{ shadowColor: SHADOW_COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }}>
            <LinearGradient colors={['#EC4899', '#8B5CF6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="rounded-xl py-4 items-center mt-2">
              <Text className="text-white text-lg font-bold">가입하기</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
