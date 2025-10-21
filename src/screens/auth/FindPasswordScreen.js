// src/screens/auth/FindPasswordScreen.js
import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Text from '../../components/common/Text';
import AUTH_COLORS, {
  AUTH_GRADIENTS,
  AUTH_SEMANTIC_COLORS,
  AUTH_INPUT_COLORS,
  AUTH_OVERLAY_COLORS,
  AUTH_SHADOW_COLORS,
} from '../../styles/auth_colors';

export default function FindPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  // 이메일 검증
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('이메일을 입력해주세요');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('올바른 이메일 형식이 아닙니다');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSendResetLink = async () => {
    if (!validateEmail(email)) {
      return;
    }

    setLoading(true);
    // 실제 비밀번호 재설정 로직 시뮬레이션
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      Alert.alert(
        '이메일 전송 완료',
        '비밀번호 재설정 링크를 이메일로 보냈습니다.\n이메일을 확인해주세요.',
        [
          {
            text: '확인',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    }, 1500);
  };

  return (
    <LinearGradient
      colors={AUTH_GRADIENTS.splashGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* 헤더 - 심플하게 */}
            <View className="px-6 pt-6 pb-8 flex-row items-center justify-between">
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
                비밀번호 찾기
              </Text>
              <Text className="text-base opacity-90" style={{ color: AUTH_COLORS.white }}>
                가입하신 이메일을 입력해주세요
              </Text>
            </View>

            {/* 컨텐츠 - 흰색 카드로 감싸기 */}
            <View className="px-6 pb-6">
              <View
                className="bg-white rounded-3xl px-6 py-6 space-y-6"
                style={{
                  shadowColor: AUTH_COLORS.black,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 12,
                  elevation: 5,
                }}
              >
            {/* 안내 메시지 */}
            <View
              className="p-4 rounded-2xl flex-row items-start"
              style={{ backgroundColor: '#EFF6FF' }}
            >
              <Ionicons
                name="information-circle"
                size={24}
                color="#3B82F6"
                style={{ marginRight: 8, marginTop: 2 }}
              />
              <View className="flex-1">
                <Text className="text-sm font-semibold text-blue-900 mb-2">
                  비밀번호 재설정 안내
                </Text>
                <Text className="text-xs text-blue-700 leading-5">
                  입력하신 이메일로 비밀번호 재설정 링크를 보내드립니다.{'\n'}
                  링크는 24시간 동안 유효합니다.
                </Text>
              </View>
            </View>

            {/* 이메일 입력 */}
            <View>
              <Text className="text-sm font-semibold text-gray-700 mt-2 mb-2">이메일</Text>
              <View className="relative">
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={emailError ? AUTH_COLORS.red[500] : AUTH_COLORS.gray[400]}
                  style={{ position: 'absolute', left: 12, top: 14, zIndex: 1 }}
                />
                <TextInput
                  className={`w-full border-2 ${
                    emailError ? 'border-red-500' : 'border-gray-200'
                  } rounded-xl pl-11 pr-4 py-3.5 text-sm bg-white`}
                  placeholder="example@email.com"
                  placeholderTextColor={AUTH_COLORS.gray[400]}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) setEmailError('');
                    if (sent) setSent(false);
                  }}
                  onBlur={() => email && validateEmail(email)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="send"
                  onSubmitEditing={handleSendResetLink}
                  editable={!loading}
                  style={{ fontFamily: 'MaruBuri-Regular' }}
                />
              </View>
              {emailError ? (
                <Text className="text-xs text-red-500 mt-1.5 ml-1">{emailError}</Text>
              ) : null}
            </View>

            {/* 전송 성공 메시지 */}
            {sent && !loading && (
              <View
                className="p-4 rounded-2xl flex-row items-center"
                style={{ backgroundColor: '#F0FDF4' }}
              >
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text className="text-sm text-green-700 ml-2 flex-1">
                  이메일이 성공적으로 전송되었습니다!
                </Text>
              </View>
            )}

            {/* 전송 버튼 */}
            <TouchableOpacity
              onPress={handleSendResetLink}
              activeOpacity={0.7}
              disabled={loading || !email}
              className="rounded-xl py-4 mt-5 items-center"
              style={{
                backgroundColor: loading || !email ? AUTH_COLORS.gray[200] : AUTH_COLORS.black,
              }}
            >
              {loading ? (
                <View className="flex-row items-center">
                  <ActivityIndicator color={AUTH_COLORS.white} size="small" />
                  <Text className="text-base font-semibold ml-2" style={{ color: AUTH_COLORS.white }}>
                    이메일 전송 중...
                  </Text>
                </View>
              ) : (
                <Text
                  className="text-base font-semibold "
                  style={{ color: !email ? AUTH_COLORS.gray[400] : AUTH_COLORS.white }}
                >
                  재설정 링크 보내기
                </Text>
              )}
            </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
