// src/screens/parent/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card, ScreenHeader } from '../../components/common';
import { useAuthStore, useToastStore } from '../../store';
import { getUserData, changePassword, logout } from '../../services/authService';
import PARENT_COLORS from '../../styles/parent_colors';

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
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // 사용자 정보 로드
      if (user?.uid) {
        const result = await getUserData(user.uid);
        if (result.success) {
          setUserData(result.data);
        }
      }
    } catch (error) {
      console.error('데이터 로드 오류:', error);
      Alert.alert('오류', '정보를 불러오는데 실패했습니다.');
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
      toast.warning('비밀번호는 최소 6자 이상이어야 합니다');
      return;
    }

    try {
      setPasswordLoading(true);
      const result = await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );

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

  const handleLogout = async () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await logout();
              if (result.success) {
                clearUser();
                toast.success('로그아웃되었습니다');
              } else {
                toast.error('로그아웃에 실패했습니다');
              }
            } catch (error) {
              console.error('로그아웃 오류:', error);
              toast.error('로그아웃 중 오류가 발생했습니다');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScreenHeader title="내 정보" colorScheme="parent" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={PARENT_COLORS.primary.DEFAULT} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScreenHeader title="내 정보" colorScheme="parent" />

      <ScrollView className="flex-1 px-5 py-6" showsVerticalScrollIndicator={false}>
        {/* 프로필 헤더 */}
        <View
          className="bg-white rounded-3xl p-6 mb-4 items-center"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <View
            className="w-24 h-24 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: PARENT_COLORS.primary[100] }}
          >
            <Ionicons name="person" size={48} color={PARENT_COLORS.primary.DEFAULT} />
          </View>
          <Text className="text-gray-800 text-2xl font-bold mb-1">
            {userData?.name || user?.displayName || '학부모'}
          </Text>
          <View
            className="px-4 py-1.5 rounded-full"
            style={{ backgroundColor: PARENT_COLORS.primary[100] }}
          >
            <Text
              className="text-sm font-bold"
              style={{ color: PARENT_COLORS.primary[600] }}
            >
              학부모
            </Text>
          </View>
        </View>

        {/* 개인 정보 */}
        <View
          className="bg-white rounded-3xl p-5 mb-4"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <View className="flex-row items-center mb-4">
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: PARENT_COLORS.blue[100] }}
            >
              <Ionicons name="person-outline" size={20} color={PARENT_COLORS.blue[600]} />
            </View>
            <Text className="text-gray-800 font-bold text-lg">개인 정보</Text>
          </View>

          <View className="space-y-3">
            <View className="flex-row items-center py-3 border-b border-gray-100">
              <Text className="text-gray-600 w-20">이름</Text>
              <Text className="text-gray-800 font-semibold flex-1">
                {userData?.name || user?.displayName || '-'}
              </Text>
            </View>
            <View className="flex-row items-center py-3 border-b border-gray-100">
              <Text className="text-gray-600 w-20">이메일</Text>
              <Text className="text-gray-800 font-semibold flex-1">
                {userData?.email || user?.email || '-'}
              </Text>
            </View>
            <View className="flex-row items-center py-3">
              <Text className="text-gray-600 w-20">연락처</Text>
              <Text className="text-gray-800 font-semibold flex-1">
                {userData?.phone || '-'}
              </Text>
            </View>
          </View>
        </View>

        {/* 학원 정보 */}
        <View
          className="bg-white rounded-3xl p-5 mb-4"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <View className="flex-row items-center mb-4">
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: PARENT_COLORS.purple[100] }}
            >
              <Ionicons name="business-outline" size={20} color={PARENT_COLORS.purple[600]} />
            </View>
            <Text className="text-gray-800 font-bold text-lg">학원 정보</Text>
          </View>

          <View className="space-y-3">
            <View className="flex-row items-center py-3 border-b border-gray-100">
              <Text className="text-gray-600 w-20">학원명</Text>
              <Text className="text-gray-800 font-semibold flex-1">
                {userData?.academyName || user?.academyName || '미등록'}
              </Text>
            </View>
            <View className="flex-row items-center py-3">
              <Text className="text-gray-600 w-20">학원 코드</Text>
              <Text className="text-gray-800 font-semibold flex-1">
                {userData?.academyCode || user?.academyCode || '-'}
              </Text>
            </View>
          </View>
        </View>

        {/* 설정 */}
        <View
          className="bg-white rounded-3xl p-5 mb-4"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <View className="flex-row items-center mb-4">
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: PARENT_COLORS.warning[100] }}
            >
              <Ionicons name="settings-outline" size={20} color={PARENT_COLORS.warning[600]} />
            </View>
            <Text className="text-gray-800 font-bold text-lg">설정</Text>
          </View>

          <TouchableOpacity
            onPress={() => setShowPasswordModal(true)}
            className="flex-row items-center justify-between py-3 border-b border-gray-100"
          >
            <View className="flex-row items-center">
              <Ionicons name="key-outline" size={20} color={PARENT_COLORS.gray[600]} />
              <Text className="text-gray-800 font-medium ml-3">비밀번호 변경</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={PARENT_COLORS.gray[400]} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center justify-between py-3"
          >
            <View className="flex-row items-center">
              <Ionicons name="log-out-outline" size={20} color={PARENT_COLORS.error[500]} />
              <Text className="font-medium ml-3" style={{ color: PARENT_COLORS.error[500] }}>
                로그아웃
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={PARENT_COLORS.gray[400]} />
          </TouchableOpacity>
        </View>

        {/* 앱 정보 */}
        <View
          className="bg-white rounded-3xl p-5"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <View className="flex-row items-center mb-3">
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: PARENT_COLORS.gray[100] }}
            >
              <Ionicons name="information-circle-outline" size={20} color={PARENT_COLORS.gray[600]} />
            </View>
            <Text className="text-gray-800 font-bold text-lg">앱 정보</Text>
          </View>

          <View className="flex-row items-center justify-between py-3">
            <Text className="text-gray-600">버전</Text>
            <Text className="text-gray-800 font-semibold">1.0.0</Text>
          </View>
        </View>
      </ScrollView>

      {/* 비밀번호 변경 모달 */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-800">비밀번호 변경</Text>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                <Ionicons name="close" size={28} color={PARENT_COLORS.gray[600]} />
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">현재 비밀번호</Text>
              <TextInput
                value={passwordData.currentPassword}
                onChangeText={(text) =>
                  setPasswordData({ ...passwordData, currentPassword: text })
                }
                placeholder="현재 비밀번호를 입력하세요"
                secureTextEntry
                className="bg-gray-50 rounded-xl p-4 text-base"
                style={{
                  borderWidth: 1,
                  borderColor: PARENT_COLORS.gray[200],
                }}
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">새 비밀번호</Text>
              <TextInput
                value={passwordData.newPassword}
                onChangeText={(text) =>
                  setPasswordData({ ...passwordData, newPassword: text })
                }
                placeholder="새 비밀번호를 입력하세요 (최소 6자)"
                secureTextEntry
                className="bg-gray-50 rounded-xl p-4 text-base"
                style={{
                  borderWidth: 1,
                  borderColor: PARENT_COLORS.gray[200],
                }}
              />
            </View>

            <View className="mb-6">
              <Text className="text-gray-700 font-medium mb-2">새 비밀번호 확인</Text>
              <TextInput
                value={passwordData.confirmPassword}
                onChangeText={(text) =>
                  setPasswordData({ ...passwordData, confirmPassword: text })
                }
                placeholder="새 비밀번호를 다시 입력하세요"
                secureTextEntry
                className="bg-gray-50 rounded-xl p-4 text-base"
                style={{
                  borderWidth: 1,
                  borderColor: PARENT_COLORS.gray[200],
                }}
              />
            </View>

            <TouchableOpacity
              onPress={handleChangePassword}
              disabled={passwordLoading}
              className="rounded-2xl py-4 mb-2"
              style={{
                backgroundColor: passwordLoading
                  ? PARENT_COLORS.gray[300]
                  : PARENT_COLORS.primary.DEFAULT,
              }}
            >
              {passwordLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center font-bold text-base">
                  변경하기
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
