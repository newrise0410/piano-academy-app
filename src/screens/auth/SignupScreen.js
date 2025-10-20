// src/screens/auth/SignupScreen.js
import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, FormInput, Button } from '../../components/common';
import { useToastStore } from '../../store';

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const toast = useToastStore();

  const handleSignup = () => {
    if (!name || !email || !password || !passwordConfirm) {
      toast.warning('모든 필드를 입력해주세요');
      return;
    }

    if (password !== passwordConfirm) {
      toast.error('비밀번호가 일치하지 않습니다');
      return;
    }

    // TODO: 회원가입 API 호출
    console.log('회원가입:', { name, email, password });

    // 역할 선택 화면으로 이동
    toast.success('회원가입이 완료되었습니다');
    navigation.navigate('RoleSelect');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View className="mt-8 mb-8">
          <Text className="text-3xl font-bold text-gray-800">회원가입</Text>
          <Text className="text-base text-gray-500 mt-2">
            피아노 아카데미에 오신 것을 환영합니다
          </Text>
        </View>

        {/* 입력 폼 */}
        <View className="mb-6">
          <FormInput
            label="이름"
            placeholder="이름을 입력하세요"
            value={name}
            onChangeText={setName}
            iconName="person-outline"
            required
            style={{ marginBottom: 16 }}
          />

          <FormInput
            label="이메일"
            placeholder="이메일을 입력하세요"
            value={email}
            onChangeText={setEmail}
            type="email"
            iconName="mail-outline"
            required
            style={{ marginBottom: 16 }}
          />

          <FormInput
            label="비밀번호"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChangeText={setPassword}
            type="password"
            iconName="lock-closed-outline"
            required
            style={{ marginBottom: 16 }}
          />

          <FormInput
            label="비밀번호 확인"
            placeholder="비밀번호를 다시 입력하세요"
            value={passwordConfirm}
            onChangeText={setPasswordConfirm}
            type="password"
            iconName="lock-closed-outline"
            required
            error={passwordConfirm && password !== passwordConfirm ? '비밀번호가 일치하지 않습니다' : ''}
          />
        </View>

        {/* 회원가입 버튼 */}
        <Button
          title="회원가입"
          onPress={handleSignup}
          fullWidth
          style={{ marginBottom: 16 }}
        />

        {/* 로그인으로 이동 */}
        <View className="flex-row justify-center mb-8">
          <Text className="text-gray-600">이미 계정이 있으신가요? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text className="text-primary font-semibold">로그인</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
