// src/screens/teacher/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Text, Card, ScreenHeader } from '../../components/common';
import { useAuthStore, useToastStore } from '../../store';
import { getUserData } from '../../services/authService';
import TEACHER_COLORS from '../../styles/teacher_colors';

export default function ProfileScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      if (user?.uid) {
        const result = await getUserData(user.uid);
        if (result.success) {
          setUserData(result.data);
        } else {
          console.error('사용자 정보 로드 실패:', result.error);
        }
      }
    } catch (error) {
      console.error('사용자 정보 로드 오류:', error);
      Alert.alert('오류', '사용자 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScreenHeader title="내 정보" navigation={navigation} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={TEACHER_COLORS.primary.DEFAULT} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScreenHeader title="내 정보" navigation={navigation} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-5">
          {/* 프로필 헤더 */}
          <Card className="mb-4">
            <View className="items-center py-6">
              <View
                className="w-24 h-24 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: TEACHER_COLORS.primary[100] }}
              >
                <Ionicons name="person" size={48} color={TEACHER_COLORS.primary.DEFAULT} />
              </View>
              <Text className="text-2xl font-bold text-gray-800 mb-1">
                {userData?.name || user?.displayName || '사용자'}
              </Text>
              <Text className="text-sm text-gray-500">
                {user?.email || ''}
              </Text>
            </View>
          </Card>

          {/* 기본 정보 */}
          <Card className="mb-4">
            <Text className="text-lg font-bold text-gray-800 mb-4">기본 정보</Text>

            <View className="space-y-4">
              <InfoRow
                icon="person-outline"
                label="이름"
                value={userData?.name || user?.displayName || '-'}
              />
              <InfoRow
                icon="mail-outline"
                label="이메일"
                value={user?.email || '-'}
              />
              <InfoRow
                icon="call-outline"
                label="전화번호"
                value={userData?.phone || '-'}
              />
              <InfoRow
                icon="business-outline"
                label="학원명"
                value={userData?.academyName || '-'}
              />
              <InfoRow
                icon="key-outline"
                label="학원 코드"
                value={userData?.academyCode || '-'}
                isCopyable
              />
            </View>
          </Card>

          {/* 설정 메뉴 */}
          <Card className="mb-4">
            <Text className="text-lg font-bold text-gray-800 mb-4">설정</Text>

            <MenuButton
              icon="create-outline"
              label="프로필 수정"
              onPress={() => navigation.navigate('ProfileEditScreen')}
            />
            <MenuButton
              icon="key-outline"
              label="비밀번호 변경"
              onPress={() => Alert.alert('준비중', '비밀번호 변경 기능은 준비 중입니다.')}
            />
            <MenuButton
              icon="notifications-outline"
              label="알림 설정"
              onPress={() => Alert.alert('준비중', '알림 설정 기능은 준비 중입니다.')}
              showDivider={false}
            />
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// 정보 행 컴포넌트
function InfoRow({ icon, label, value, isCopyable = false }) {
  const toast = useToastStore();

  const handleCopy = async () => {
    if (value && value !== '-') {
      await Clipboard.setStringAsync(value);
      toast.success('클립보드에 복사되었습니다');
    }
  };

  return (
    <View className="flex-row items-center py-3 border-b border-gray-100">
      <View
        className="w-10 h-10 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: TEACHER_COLORS.gray[100] }}
      >
        <Ionicons name={icon} size={20} color={TEACHER_COLORS.gray[600]} />
      </View>
      <View className="flex-1">
        <Text className="text-sm text-gray-500 mb-1">{label}</Text>
        <Text className="text-base font-medium text-gray-800">{value}</Text>
      </View>
      {isCopyable && value !== '-' && (
        <TouchableOpacity
          onPress={handleCopy}
          className="ml-2 p-2"
          activeOpacity={0.7}
        >
          <Ionicons name="copy-outline" size={20} color={TEACHER_COLORS.primary.DEFAULT} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// 메뉴 버튼 컴포넌트
function MenuButton({ icon, label, onPress, showDivider = true }) {
  return (
    <>
      <TouchableOpacity
        onPress={onPress}
        className="flex-row items-center justify-between py-4"
        activeOpacity={0.7}
      >
        <View className="flex-row items-center flex-1">
          <Ionicons name={icon} size={24} color={TEACHER_COLORS.gray[600]} />
          <Text className="text-base font-medium text-gray-800 ml-3">
            {label}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={TEACHER_COLORS.gray[400]} />
      </TouchableOpacity>
      {showDivider && <View className="h-px bg-gray-100" />}
    </>
  );
}
