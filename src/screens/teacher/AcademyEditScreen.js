// src/screens/teacher/AcademyEditScreen.js
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, FormInput, Button, ScreenHeader } from '../../components/common';
import { useAuthStore, useToastStore } from '../../store';
import { createAcademy, updateAcademy } from '../../services/academyService';
import TEACHER_COLORS from '../../styles/teacher_colors';

export default function AcademyEditScreen({ navigation, route }) {
  const { mode = 'create', academyId, academyData } = route.params || {};
  const isEditMode = mode === 'edit';

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    businessNumber: '',
    description: '',
  });
  const [errors, setErrors] = useState({});

  const user = useAuthStore((state) => state.user);
  const toast = useToastStore();

  useEffect(() => {
    if (isEditMode && academyData) {
      setFormData({
        name: academyData.name || '',
        address: academyData.address || '',
        phone: academyData.phone || '',
        businessNumber: academyData.businessNumber || '',
        description: academyData.description || '',
      });
    }
  }, [isEditMode, academyData]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '학원명을 입력해주세요';
    }

    if (formData.phone && !/^[0-9-]+$/.test(formData.phone)) {
      newErrors.phone = '올바른 전화번호 형식이 아닙니다';
    }

    if (formData.businessNumber && !/^[0-9-]+$/.test(formData.businessNumber)) {
      newErrors.businessNumber = '올바른 사업자번호 형식이 아닙니다';
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

      let result;
      if (isEditMode) {
        // 수정 모드
        result = await updateAcademy(academyId, formData);
      } else {
        // 등록 모드
        result = await createAcademy({
          ownerId: user.uid,
          ...formData,
        });
      }

      if (result.success) {
        toast.success(result.message || (isEditMode ? '학원 정보가 수정되었습니다' : '학원이 등록되었습니다'));
        navigation.goBack();
      } else {
        throw new Error(result.error || (isEditMode ? '학원 정보 수정 실패' : '학원 등록 실패'));
      }
    } catch (error) {
      console.error('학원 저장 오류:', error);
      toast.error(error.message || (isEditMode ? '학원 정보 수정에 실패했습니다' : '학원 등록에 실패했습니다'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      isEditMode ? '학원 정보 수정 취소' : '학원 등록 취소',
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
        title={isEditMode ? '학원 정보 수정' : '학원 등록'}
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
          {/* 안내 메시지 */}
          {!isEditMode && (
            <View
              className="p-4 rounded-lg mb-5"
              style={{ backgroundColor: TEACHER_COLORS.primary[50] }}
            >
              <Text className="text-sm" style={{ color: TEACHER_COLORS.primary[700] }}>
                학원 정보를 등록하면 학생 관리, 수업 관리 등의 기능을 사용할 수 있습니다.
              </Text>
            </View>
          )}

          {/* 학원명 */}
          <FormInput
            label="학원명"
            placeholder="피아노 아카데미"
            value={formData.name}
            onChangeText={(text) => {
              setFormData({ ...formData, name: text });
              if (errors.name) setErrors({ ...errors, name: '' });
            }}
            error={errors.name}
            required
          />

          {/* 주소 */}
          <FormInput
            label="주소"
            placeholder="서울시 강남구..."
            value={formData.address}
            onChangeText={(text) => {
              setFormData({ ...formData, address: text });
            }}
            multiline
            numberOfLines={2}
          />

          {/* 전화번호 */}
          <FormInput
            label="전화번호"
            placeholder="02-1234-5678"
            value={formData.phone}
            onChangeText={(text) => {
              setFormData({ ...formData, phone: text });
              if (errors.phone) setErrors({ ...errors, phone: '' });
            }}
            error={errors.phone}
            keyboardType="phone-pad"
          />

          {/* 사업자번호 */}
          <FormInput
            label="사업자번호"
            placeholder="123-45-67890"
            value={formData.businessNumber}
            onChangeText={(text) => {
              setFormData({ ...formData, businessNumber: text });
              if (errors.businessNumber) setErrors({ ...errors, businessNumber: '' });
            }}
            error={errors.businessNumber}
            keyboardType="number-pad"
          />

          {/* 학원 소개 */}
          <FormInput
            label="학원 소개"
            placeholder="학원에 대한 간단한 소개를 입력하세요"
            value={formData.description}
            onChangeText={(text) => {
              setFormData({ ...formData, description: text });
            }}
            multiline
            numberOfLines={4}
          />

          {/* 저장 버튼 */}
          <View className="mt-8">
            <Button
              title={isEditMode ? '저장' : '등록'}
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
