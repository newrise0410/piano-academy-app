// src/screens/teacher/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Text, Card, ScreenHeader } from '../../components/common';
import { useAuthStore, useToastStore } from '../../store';
import { getUserData, changePassword, logout } from '../../services/authService';
import TEACHER_COLORS from '../../styles/teacher_colors';

export default function ProfileScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const user = useAuthStore((state) => state.user);
  const clearUser = useAuthStore((state) => state.clearUser);
  const toast = useToastStore();

  // 비밀번호 변경 상태
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

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

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.warning('모든 필드를 입력해주세요');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('새 비밀번호가 일치하지 않습니다');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('비밀번호는 최소 6자 이상이어야 합니다');
      return;
    }

    setPasswordLoading(true);
    try {
      const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);

      if (result.success) {
        toast.success('비밀번호가 변경되었습니다');
        setShowPasswordModal(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        toast.error(result.error || '비밀번호 변경에 실패했습니다');
      }
    } catch (error) {
      console.error('비밀번호 변경 오류:', error);
      toast.error('비밀번호 변경 중 오류가 발생했습니다');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              clearUser();
              toast.success('로그아웃되었습니다');
            } catch (error) {
              console.error('로그아웃 오류:', error);
              toast.error('로그아웃에 실패했습니다');
            }
          },
        },
      ]
    );
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
              onPress={() => setShowPasswordModal(true)}
            />
            <MenuButton
              icon="log-out-outline"
              label="로그아웃"
              onPress={handleLogout}
              showDivider={false}
            />
          </Card>
        </View>
      </ScrollView>

      {/* 비밀번호 변경 모달 */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="bg-white rounded-t-3xl" style={{ maxHeight: '80%' }}>
            {/* 헤더 */}
            <View className="flex-row items-center justify-between p-5 border-b border-gray-100">
              <Text className="text-xl font-bold text-gray-900">비밀번호 변경</Text>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                <Ionicons name="close" size={28} color={TEACHER_COLORS.gray[600]} />
              </TouchableOpacity>
            </View>

            <ScrollView className="p-5">
              {/* 현재 비밀번호 */}
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2">현재 비밀번호</Text>
                <TextInput
                  className="bg-gray-50 rounded-2xl p-4 text-base"
                  placeholder="현재 비밀번호를 입력하세요"
                  value={passwordData.currentPassword}
                  onChangeText={(text) => setPasswordData({ ...passwordData, currentPassword: text })}
                  secureTextEntry
                />
              </View>

              {/* 새 비밀번호 */}
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2">새 비밀번호</Text>
                <TextInput
                  className="bg-gray-50 rounded-2xl p-4 text-base"
                  placeholder="새 비밀번호 (최소 6자)"
                  value={passwordData.newPassword}
                  onChangeText={(text) => setPasswordData({ ...passwordData, newPassword: text })}
                  secureTextEntry
                />
              </View>

              {/* 비밀번호 확인 */}
              <View className="mb-6">
                <Text className="text-gray-700 font-semibold mb-2">새 비밀번호 확인</Text>
                <TextInput
                  className="bg-gray-50 rounded-2xl p-4 text-base"
                  placeholder="새 비밀번호를 다시 입력하세요"
                  value={passwordData.confirmPassword}
                  onChangeText={(text) => setPasswordData({ ...passwordData, confirmPassword: text })}
                  secureTextEntry
                />
              </View>

              {/* 버튼 */}
              <TouchableOpacity
                onPress={handleChangePassword}
                disabled={passwordLoading}
                className="py-4 rounded-2xl"
                style={{ backgroundColor: TEACHER_COLORS.primary.DEFAULT }}
              >
                {passwordLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-center font-bold text-white text-base">변경하기</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
