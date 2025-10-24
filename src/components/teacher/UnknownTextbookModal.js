// src/components/teacher/UnknownTextbookModal.js
import React, { useState } from 'react';
import { View, Modal, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../common';
import { useAuthStore, useToastStore } from '../../store';
import { createMaterial } from '../../services/firestoreService';
import TEACHER_COLORS from '../../styles/teacher_colors';

/**
 * UnknownTextbookModal - AI가 인식한 교재가 DB에 없을 때 추가하는 모달
 */
export default function UnknownTextbookModal({ visible, unknownTextbooks = [], onClose, onTextbooksAdded }) {
  const { user } = useAuthStore();
  const toast = useToastStore();
  const [submitting, setSubmitting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [formData, setFormData] = useState({
    title: '',
    publisher: '',
    level: '초급',
    category: '피아노',
    description: '',
  });

  const levels = ['초급', '중급', '고급'];
  const categories = ['피아노', '이론', '악보', '테크닉', '기타'];

  // 현재 교재 정보
  const currentTextbook = unknownTextbooks[currentIndex];

  // 모달이 열릴 때 첫 번째 교재로 폼 초기화
  React.useEffect(() => {
    if (visible && currentTextbook) {
      setFormData({
        title: currentTextbook.name,
        publisher: '',
        level: '초급',
        category: getCategoryKorean(currentTextbook.suggestedCategory),
        description: '',
      });
    }
  }, [visible, currentIndex]);

  const getCategoryKorean = (englishCategory) => {
    const categoryMap = {
      technique: '테크닉',
      etude: '피아노',
      piece: '피아노',
      other: '기타',
    };
    return categoryMap[englishCategory] || '피아노';
  };

  const handleAddTextbook = async () => {
    if (!formData.title.trim()) {
      toast.warning('교재명을 입력해주세요');
      return;
    }

    setSubmitting(true);
    try {
      const materialData = {
        ...formData,
        teacherId: user.uid,
        academyId: user.academyId,
      };

      const result = await createMaterial(materialData);

      if (result.success) {
        toast.success(`"${formData.title}" 교재가 추가되었습니다`);

        // 다음 교재로 이동하거나 완료
        if (currentIndex < unknownTextbooks.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          // 모든 교재 처리 완료
          handleComplete();
        }
      } else {
        toast.error(result.error || '교재 추가에 실패했습니다');
      }
    } catch (error) {
      console.error('교재 추가 오류:', error);
      toast.error('교재 추가에 실패했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    if (currentIndex < unknownTextbooks.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setCurrentIndex(0);
    if (onTextbooksAdded) {
      onTextbooksAdded();
    }
    onClose();
  };

  if (!visible || !currentTextbook) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <View className="bg-white rounded-t-3xl" style={{ maxHeight: '90%' }}>
          {/* 모달 헤더 */}
          <View className="px-5 py-4 border-b border-gray-200">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <View className="bg-orange-100 rounded-full p-2 mr-3">
                  <Ionicons name="alert-circle" size={24} color={TEACHER_COLORS.warning[600]} />
                </View>
                <View>
                  <Text className="text-xl font-bold text-gray-800">교재 DB에 없는 교재</Text>
                  <Text className="text-sm text-gray-500 mt-0.5">
                    {currentIndex + 1} / {unknownTextbooks.length}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleComplete}>
                <Ionicons name="close" size={28} color={TEACHER_COLORS.gray[500]} />
              </TouchableOpacity>
            </View>

            {/* 진행 상황 바 */}
            <View className="bg-gray-200 rounded-full h-1.5 mt-3">
              <View
                className="bg-purple-600 rounded-full h-1.5"
                style={{ width: `${((currentIndex + 1) / unknownTextbooks.length) * 100}%` }}
              />
            </View>
          </View>

          {/* 설명 */}
          <View className="px-5 py-4 bg-orange-50">
            <Text className="text-sm text-gray-700">
              AI가 <Text className="font-bold text-gray-900">"{currentTextbook.name}"</Text> 교재를 발견했지만,
              교재 DB에 등록되어 있지 않습니다. 아래 정보를 확인하고 교재를 추가해주세요.
            </Text>
          </View>

          {/* 모달 내용 */}
          <ScrollView className="px-5 py-4">
            {/* 교재명 */}
            <View className="mb-4">
              <Text className="text-sm font-bold text-gray-700 mb-2">교재명 *</Text>
              <TextInput
                className="bg-gray-50 rounded-xl px-4 py-3 text-base"
                placeholder="예: 바이엘 교본"
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                style={{ fontFamily: 'MaruBuri-Regular' }}
              />
            </View>

            {/* 출판사 */}
            <View className="mb-4">
              <Text className="text-sm font-bold text-gray-700 mb-2">출판사</Text>
              <TextInput
                className="bg-gray-50 rounded-xl px-4 py-3 text-base"
                placeholder="예: 세광음악출판사"
                value={formData.publisher}
                onChangeText={(text) => setFormData({ ...formData, publisher: text })}
                style={{ fontFamily: 'MaruBuri-Regular' }}
              />
            </View>

            {/* 레벨 */}
            <View className="mb-4">
              <Text className="text-sm font-bold text-gray-700 mb-2">레벨 *</Text>
              <View className="flex-row gap-2">
                {levels.map((level) => (
                  <TouchableOpacity
                    key={level}
                    onPress={() => setFormData({ ...formData, level })}
                    className="flex-1 rounded-xl py-3 border-2"
                    style={{
                      backgroundColor: formData.level === level ? TEACHER_COLORS.primary[50] : 'white',
                      borderColor: formData.level === level ? TEACHER_COLORS.primary.DEFAULT : TEACHER_COLORS.gray[200],
                    }}
                  >
                    <Text
                      className="text-center font-bold"
                      style={{
                        color: formData.level === level ? TEACHER_COLORS.primary.DEFAULT : TEACHER_COLORS.gray[500],
                      }}
                    >
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 카테고리 */}
            <View className="mb-4">
              <Text className="text-sm font-bold text-gray-700 mb-2">카테고리 *</Text>
              <View className="flex-row flex-wrap gap-2">
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    onPress={() => setFormData({ ...formData, category })}
                    className="rounded-xl px-4 py-2 border-2"
                    style={{
                      backgroundColor: formData.category === category ? TEACHER_COLORS.primary[50] : 'white',
                      borderColor: formData.category === category ? TEACHER_COLORS.primary.DEFAULT : TEACHER_COLORS.gray[200],
                    }}
                  >
                    <Text
                      className="font-bold"
                      style={{
                        color: formData.category === category ? TEACHER_COLORS.primary.DEFAULT : TEACHER_COLORS.gray[500],
                      }}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 설명 */}
            <View className="mb-4">
              <Text className="text-sm font-bold text-gray-700 mb-2">설명</Text>
              <TextInput
                className="bg-gray-50 rounded-xl px-4 py-3 text-base"
                placeholder="교재에 대한 간단한 설명을 입력하세요"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                style={{ fontFamily: 'MaruBuri-Regular', minHeight: 80 }}
              />
            </View>
          </ScrollView>

          {/* 모달 버튼 */}
          <View className="px-5 py-4 border-t border-gray-200">
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleSkip}
                disabled={submitting}
                className="flex-1 rounded-xl py-4 border-2"
                style={{
                  borderColor: TEACHER_COLORS.gray[300],
                  opacity: submitting ? 0.5 : 1,
                }}
              >
                <Text className="text-gray-600 font-bold text-center text-base">건너뛰기</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddTextbook}
                disabled={submitting}
                className="flex-1 rounded-xl py-4"
                style={{
                  backgroundColor: TEACHER_COLORS.primary.DEFAULT,
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-center text-base">추가하기</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
