// src/screens/teacher/ProfileEditScreen.js
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, FormInput, Button, ScreenHeader } from '../../components/common';
import { useAuthStore, useToastStore } from '../../store';
import { getUserData, updateUserProfile } from '../../services/authService';
import TEACHER_COLORS from '../../styles/teacher_colors';

export default function ProfileEditScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    academyName: '',
  });
  const [errors, setErrors] = useState({});

  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const toast = useToastStore();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      if (user?.uid) {
        const result = await getUserData(user.uid);
        if (result.success && result.data) {
          setFormData({
            name: result.data.name || user?.displayName || '',
            phone: result.data.phone || '',
            academyName: result.data.academyName || '',
          });
        } else {
          // Firestore에 데이터가 없는 경우 기본값 사용
          setFormData({
            name: user?.displayName || '',
            phone: '',
            academyName: '',
          });
        }
      }
    } catch (error) {
      console.error('사용자 정보 로드 오류:', error);
      toast.error('사용자 정보를 불러오는데 실패했습니다.');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요';
    }

    if (formData.phone && !/^[0-9-]+$/.test(formData.phone)) {
      newErrors.phone = '올바른 전화번호 형식이 아닙니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Firebase Auth displayName 업데이트
      const result = await updateUserProfile(user.uid, {
        displayName: formData.name,
        ...formData,
      });

      if (result.success) {
        // Zustand store 업데이트
        updateUser({
          displayName: formData.name,
        });

        toast.success('프로필이 수정되었습니다');
        navigation.goBack();
      } else {
        throw new Error(result.error || '프로필 수정 실패');
      }
    } catch (error) {
      console.error('프로필 수정 오류:', error);
      toast.error(error.message || '프로필 수정에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      '프로필 수정 취소',
      '변경사항이 저장되지 않습니다. 계속하시겠습니까?',
      [
        { text: '아니오', style: 'cancel' },
        {
          text: '예',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScreenHeader
        title="프로필 수정"
        navigation={navigation}
        rightButton={
          <TouchableOpacity onPress={handleCancel}>
            <Text className="text-base" style={{ color: TEACHER_COLORS.gray[600] }}>
              취소
            </Text>
          </TouchableOpacity>
        }
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-5">
          {/* 이메일 (읽기 전용) */}
          <View className="mb-5">
            <Text className="text-sm font-medium text-gray-700 mb-2">이메일</Text>
            <View className="bg-gray-100 px-4 py-3.5 rounded-lg">
              <Text className="text-base text-gray-500">{user?.email || ''}</Text>
            </View>
            <Text className="text-xs text-gray-500 mt-1">
              이메일은 변경할 수 없습니다
            </Text>
          </View>

          {/* 이름 */}
          <FormInput
            label="이름"
            placeholder="이름을 입력하세요"
            value={formData.name}
            onChangeText={(text) => {
              setFormData({ ...formData, name: text });
              if (errors.name) setErrors({ ...errors, name: '' });
            }}
            error={errors.name}
            required
          />

          {/* 전화번호 */}
          <FormInput
            label="전화번호"
            placeholder="010-1234-5678"
            value={formData.phone}
            onChangeText={(text) => {
              setFormData({ ...formData, phone: text });
              if (errors.phone) setErrors({ ...errors, phone: '' });
            }}
            error={errors.phone}
            keyboardType="phone-pad"
          />

          {/* 학원명 */}
          <FormInput
            label="학원명"
            placeholder="학원명을 입력하세요"
            value={formData.academyName}
            onChangeText={(text) => {
              setFormData({ ...formData, academyName: text });
            }}
          />

          {/* 저장 버튼 */}
          <View className="mt-8">
            <Button
              title="저장"
              onPress={handleSave}
              loading={loading}
              disabled={loading}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
