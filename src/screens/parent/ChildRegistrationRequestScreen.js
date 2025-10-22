// src/screens/parent/ChildRegistrationRequestScreen.js
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card, ScreenHeader } from '../../components/common';
import { useAuthStore, useToastStore } from '../../store';
import PARENT_COLORS from '../../styles/parent_colors';

export default function ChildRegistrationRequestScreen({ navigation }) {
  const { user } = useAuthStore();
  const toast = useToastStore();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    childName: user?.childName || '',
    childAge: '',
    school: '',
    childPhone: '',
    address: '',
  });

  const handleSubmit = async () => {
    // 검증
    if (!formData.childName.trim()) {
      toast.warning('자녀 이름을 입력해주세요');
      return;
    }

    if (!formData.childAge.trim()) {
      toast.warning('자녀 나이를 입력해주세요');
      return;
    }

    setLoading(true);
    try {
      const { createStudentRequest } = await import('../../services/firestoreService');

      const requestData = {
        childName: formData.childName,
        childAge: formData.childAge,
        school: formData.school,
        childPhone: formData.childPhone,
        address: formData.address,
        parentId: user.uid,
        parentName: user.displayName || user.name,
        parentPhone: user.phone,
        parentEmail: user.email,
        academyId: user.academyId,
        academyCode: user.academyCode,
        status: 'pending',
      };

      const result = await createStudentRequest(requestData);

      if (result.success) {
        toast.success('자녀 등록 요청이 완료되었습니다.\n선생님이 승인하면 알림을 드립니다.');
        navigation.goBack();
      } else {
        toast.error(result.error || '등록 요청에 실패했습니다');
      }
    } catch (error) {
      console.error('자녀 등록 요청 오류:', error);
      toast.error('등록 요청 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScreenHeader title="자녀 등록 요청" colorScheme="parent" />

      <ScrollView className="flex-1 px-5 py-4">
        {/* 안내 카드 */}
        <Card className="mb-4">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={24} color={PARENT_COLORS.primary.DEFAULT} />
            <View className="flex-1 ml-3">
              <Text className="text-gray-800 font-bold mb-2">자녀 정보를 입력해주세요</Text>
              <Text className="text-gray-600 text-sm">
                입력하신 정보를 바탕으로 선생님이 학생 등록을 진행합니다.{'\n'}
                승인이 완료되면 알림을 보내드립니다.
              </Text>
            </View>
          </View>
        </Card>

        {/* 자녀 정보 입력 */}
        <Card>
          <Text className="text-lg font-bold text-gray-800 mb-4">자녀 정보</Text>

          {/* 자녀 이름 */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              자녀 이름 <Text className="text-red-500">*</Text>
            </Text>
            <View className="relative">
              <Ionicons
                name="person"
                size={20}
                color={PARENT_COLORS.gray[400]}
                style={{ position: 'absolute', left: 12, top: 12, zIndex: 1 }}
              />
              <TextInput
                className="w-full border-2 border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm bg-white"
                placeholder="홍길동"
                placeholderTextColor={PARENT_COLORS.gray[400]}
                value={formData.childName}
                onChangeText={(text) => setFormData({ ...formData, childName: text })}
                style={{ fontFamily: 'MaruBuri-Regular' }}
              />
            </View>
          </View>

          {/* 나이 */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              나이 <Text className="text-red-500">*</Text>
            </Text>
            <View className="relative">
              <Ionicons
                name="calendar"
                size={20}
                color={PARENT_COLORS.gray[400]}
                style={{ position: 'absolute', left: 12, top: 12, zIndex: 1 }}
              />
              <TextInput
                className="w-full border-2 border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm bg-white"
                placeholder="예: 10세"
                placeholderTextColor={PARENT_COLORS.gray[400]}
                value={formData.childAge}
                onChangeText={(text) => setFormData({ ...formData, childAge: text })}
                keyboardType="number-pad"
                style={{ fontFamily: 'MaruBuri-Regular' }}
              />
            </View>
          </View>

          {/* 학교 */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">학교</Text>
            <View className="relative">
              <Ionicons
                name="school"
                size={20}
                color={PARENT_COLORS.gray[400]}
                style={{ position: 'absolute', left: 12, top: 12, zIndex: 1 }}
              />
              <TextInput
                className="w-full border-2 border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm bg-white"
                placeholder="예: 서울초등학교"
                placeholderTextColor={PARENT_COLORS.gray[400]}
                value={formData.school}
                onChangeText={(text) => setFormData({ ...formData, school: text })}
                style={{ fontFamily: 'MaruBuri-Regular' }}
              />
            </View>
          </View>

          {/* 자녀 전화번호 */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">자녀 전화번호</Text>
            <View className="relative">
              <Ionicons
                name="call"
                size={20}
                color={PARENT_COLORS.gray[400]}
                style={{ position: 'absolute', left: 12, top: 12, zIndex: 1 }}
              />
              <TextInput
                className="w-full border-2 border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm bg-white"
                placeholder="010-0000-0000"
                placeholderTextColor={PARENT_COLORS.gray[400]}
                value={formData.childPhone}
                onChangeText={(text) => setFormData({ ...formData, childPhone: text })}
                keyboardType="phone-pad"
                style={{ fontFamily: 'MaruBuri-Regular' }}
              />
            </View>
          </View>

          {/* 주소 */}
          <View>
            <Text className="text-sm font-semibold text-gray-700 mb-2">주소</Text>
            <View className="relative">
              <Ionicons
                name="home"
                size={20}
                color={PARENT_COLORS.gray[400]}
                style={{ position: 'absolute', left: 12, top: 12, zIndex: 1 }}
              />
              <TextInput
                className="w-full border-2 border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm bg-white"
                placeholder="예: 서울시 강남구"
                placeholderTextColor={PARENT_COLORS.gray[400]}
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                style={{ fontFamily: 'MaruBuri-Regular' }}
              />
            </View>
          </View>
        </Card>

        {/* 학부모 정보 (읽기 전용) */}
        <Card className="mt-4">
          <Text className="text-lg font-bold text-gray-800 mb-4">학부모 정보</Text>

          <View className="mb-3">
            <Text className="text-sm text-gray-500 mb-1">학부모 이름</Text>
            <Text className="text-base text-gray-800">{user?.displayName || user?.name}</Text>
          </View>

          <View className="mb-3">
            <Text className="text-sm text-gray-500 mb-1">연락처</Text>
            <Text className="text-base text-gray-800">{user?.phone || '-'}</Text>
          </View>

          <View>
            <Text className="text-sm text-gray-500 mb-1">이메일</Text>
            <Text className="text-base text-gray-800">{user?.email}</Text>
          </View>
        </Card>

        {/* 제출 버튼 */}
        <TouchableOpacity
          onPress={handleSubmit}
          activeOpacity={0.7}
          disabled={loading}
          className="rounded-xl py-4 items-center mt-6 mb-8"
          style={{
            backgroundColor: loading ? PARENT_COLORS.gray[400] : PARENT_COLORS.primary.DEFAULT,
          }}
        >
          {loading ? (
            <View className="flex-row items-center">
              <ActivityIndicator color={PARENT_COLORS.white} size="small" />
              <Text className="text-white font-bold ml-2">요청 중...</Text>
            </View>
          ) : (
            <Text className="text-white font-bold">등록 요청하기</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
