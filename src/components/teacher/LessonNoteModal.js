// src/components/teacher/LessonNoteModal.js
import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../common';
import BottomSheet from '../common/BottomSheet';
import TEACHER_COLORS from '../../styles/teacher_colors';
import { useLessonNoteStore, useToastStore } from '../../store';
import { generateLessonNoteMemo, improveLessonNoteMemo, isGeminiAvailable } from '../../services/geminiService';

/**
 * LessonNoteModal - 수업 일지 작성/수정 모달
 */
export default function LessonNoteModal({
  visible,
  onClose,
  student,
  date,
  existingNote = null,
}) {
  const { addLessonNote, updateLessonNote } = useLessonNoteStore();
  const toast = useToastStore();

  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [isDetailExpanded, setIsDetailExpanded] = useState(false);
  const [formData, setFormData] = useState({
    progress: '',
    homework: '',
    memo: '',
    strengths: '',
    improvements: '',
    practicePoints: '',
    isPublic: true,
  });

  const aiAvailable = isGeminiAvailable();

  // existingNote가 있으면 폼 데이터 채우기
  useEffect(() => {
    if (existingNote) {
      setFormData({
        progress: existingNote.progress || '',
        homework: existingNote.homework || '',
        memo: existingNote.memo || '',
        strengths: existingNote.strengths || '',
        improvements: existingNote.improvements || '',
        practicePoints: existingNote.practicePoints || '',
        isPublic: existingNote.isPublic !== undefined ? existingNote.isPublic : true,
      });
    } else {
      // 초기화
      setFormData({
        progress: '',
        homework: '',
        memo: '',
        strengths: '',
        improvements: '',
        practicePoints: '',
        isPublic: true,
      });
    }
  }, [existingNote, visible]);

  // AI로 메모 자동 생성
  const handleGenerateAiMemo = async () => {
    if (!formData.progress && !formData.homework) {
      toast.warning('진도나 숙제를 먼저 입력해주세요.');
      return;
    }

    setAiLoading(true);
    try {
      const result = await generateLessonNoteMemo({
        studentName: student.name,
        progress: formData.progress,
        homework: formData.homework,
        strengths: formData.strengths,
        improvements: formData.improvements,
      });

      if (result.success) {
        setFormData({ ...formData, memo: result.memo });
        toast.success('AI가 메모를 생성했습니다!');
      } else {
        toast.error('메모 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('AI 메모 생성 실패:', error);
      toast.error('AI 서비스 오류가 발생했습니다.');
    } finally {
      setAiLoading(false);
    }
  };

  // AI로 메모 개선
  const handleImproveAiMemo = async () => {
    if (!formData.memo) {
      toast.warning('개선할 메모를 먼저 입력해주세요.');
      return;
    }

    setAiLoading(true);
    try {
      const result = await improveLessonNoteMemo(formData.memo, {
        studentName: student.name,
        progress: formData.progress,
        homework: formData.homework,
      });

      if (result.success) {
        setFormData({ ...formData, memo: result.improvedMemo });
        toast.success('메모가 개선되었습니다!');
      } else {
        toast.error('메모 개선에 실패했습니다.');
      }
    } catch (error) {
      console.error('AI 메모 개선 실패:', error);
      toast.error('AI 서비스 오류가 발생했습니다.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.progress && !formData.homework && !formData.memo) {
      toast.warning('진도, 숙제, 메모 중 하나는 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      if (existingNote) {
        // 수정
        await updateLessonNote(existingNote.id, formData);
        toast.success('수업 일지가 수정되었습니다.');
      } else {
        // 새로 작성
        await addLessonNote({
          studentId: student.id,
          studentName: student.name,
          date, // YYYY-MM-DD 형식
          ...formData,
        });
        toast.success('수업 일지가 저장되었습니다.');
      }
      onClose();
    } catch (error) {
      console.error('수업 일지 저장 실패:', error);
      toast.error('저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={existingNote ? '수업 일지 수정' : '수업 일지 작성'}
      subtitle={`${student?.name} · ${date}`}
      height="large"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 진도 */}
          <View className="mb-4">
            <Text className="text-sm font-bold text-gray-700 mb-2">
              📚 오늘의 진도 <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="bg-gray-50 rounded-xl p-3 text-base"
              style={{ borderWidth: 1, borderColor: TEACHER_COLORS.gray[200] }}
              placeholder="예: 체르니 30-1, 바이엘 60번"
              value={formData.progress}
              onChangeText={(text) => setFormData({ ...formData, progress: text })}
              multiline
              numberOfLines={2}
            />
          </View>

          {/* 숙제 */}
          <View className="mb-4">
            <Text className="text-sm font-bold text-gray-700 mb-2">
              ✏️ 다음 시간까지 숙제
            </Text>
            <TextInput
              className="bg-gray-50 rounded-xl p-3 text-base"
              style={{ borderWidth: 1, borderColor: TEACHER_COLORS.gray[200] }}
              placeholder="예: 체르니 30-1 3회 반복 연습"
              value={formData.homework}
              onChangeText={(text) => setFormData({ ...formData, homework: text })}
              multiline
              numberOfLines={2}
            />
          </View>

          {/* 메모 */}
          <View className="mb-4">
            <Text className="text-sm font-bold text-gray-700 mb-2">
              💬 수업 메모
            </Text>
            <TextInput
              className="bg-gray-50 rounded-xl p-3 text-base"
              style={{ borderWidth: 1, borderColor: TEACHER_COLORS.gray[200] }}
              placeholder="예: 리듬감이 좋아졌어요"
              value={formData.memo}
              onChangeText={(text) => setFormData({ ...formData, memo: text })}
              multiline
              numberOfLines={3}
            />

            {/* AI 버튼 */}
            {aiAvailable && (
              <View className="flex-row gap-2 mt-2">
                <TouchableOpacity
                  className="flex-1 flex-row items-center justify-center rounded-lg py-2 px-3"
                  style={{
                    backgroundColor: aiLoading ? TEACHER_COLORS.gray[200] : TEACHER_COLORS.purple[50],
                    borderWidth: 1,
                    borderColor: TEACHER_COLORS.purple[300]
                  }}
                  onPress={handleGenerateAiMemo}
                  disabled={aiLoading}
                  activeOpacity={0.7}
                >
                  {aiLoading ? (
                    <ActivityIndicator size="small" color={TEACHER_COLORS.purple[600]} />
                  ) : (
                    <>
                      <Ionicons
                        name="sparkles"
                        size={16}
                        color={TEACHER_COLORS.purple[600]}
                        style={{ marginRight: 4 }}
                      />
                      <Text className="text-xs font-semibold" style={{ color: TEACHER_COLORS.purple[600] }}>
                        AI 자동 생성
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                {formData.memo && (
                  <TouchableOpacity
                    className="flex-1 flex-row items-center justify-center rounded-lg py-2 px-3"
                    style={{
                      backgroundColor: aiLoading ? TEACHER_COLORS.gray[200] : TEACHER_COLORS.blue[50],
                      borderWidth: 1,
                      borderColor: TEACHER_COLORS.blue[300]
                    }}
                    onPress={handleImproveAiMemo}
                    disabled={aiLoading}
                    activeOpacity={0.7}
                  >
                    {aiLoading ? (
                      <ActivityIndicator size="small" color={TEACHER_COLORS.blue[600]} />
                    ) : (
                      <>
                        <Ionicons
                          name="bulb"
                          size={16}
                          color={TEACHER_COLORS.blue[600]}
                          style={{ marginRight: 4 }}
                        />
                        <Text className="text-xs font-semibold" style={{ color: TEACHER_COLORS.blue[600] }}>
                          AI 개선하기
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          {/* 상세 항목 (선택사항) - 아코디언 */}
          <View className="bg-purple-50 rounded-xl mb-4 overflow-hidden">
            <TouchableOpacity
              className="flex-row items-center justify-between p-4"
              onPress={() => setIsDetailExpanded(!isDetailExpanded)}
              activeOpacity={0.7}
            >
              <Text className="text-sm font-bold text-gray-700">
                📝 상세 항목 (선택사항)
              </Text>
              <Ionicons
                name={isDetailExpanded ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={TEACHER_COLORS.gray[600]}
              />
            </TouchableOpacity>

            {isDetailExpanded && (
              <View className="px-4 pb-4">
                {/* 잘한 점 */}
                <View className="mb-3">
                  <Text className="text-xs font-semibold text-gray-600 mb-1">
                    👍 잘한 점
                  </Text>
                  <TextInput
                    className="bg-white rounded-lg p-2 text-sm"
                    placeholder="예: 박자 정확도 향상"
                    value={formData.strengths}
                    onChangeText={(text) => setFormData({ ...formData, strengths: text })}
                  />
                </View>

                {/* 개선할 점 */}
                <View className="mb-3">
                  <Text className="text-xs font-semibold text-gray-600 mb-1">
                    💪 개선할 점
                  </Text>
                  <TextInput
                    className="bg-white rounded-lg p-2 text-sm"
                    placeholder="예: 손목 긴장 풀기"
                    value={formData.improvements}
                    onChangeText={(text) => setFormData({ ...formData, improvements: text })}
                  />
                </View>

                {/* 연습 포인트 */}
                <View>
                  <Text className="text-xs font-semibold text-gray-600 mb-1">
                    🎯 연습 포인트
                  </Text>
                  <TextInput
                    className="bg-white rounded-lg p-2 text-sm"
                    placeholder="예: 느린 템포로 연습"
                    value={formData.practicePoints}
                    onChangeText={(text) => setFormData({ ...formData, practicePoints: text })}
                  />
                </View>
              </View>
            )}
          </View>

          {/* 학부모 공개 여부 */}
          <TouchableOpacity
            className="flex-row items-center mb-6"
            onPress={() => setFormData({ ...formData, isPublic: !formData.isPublic })}
            activeOpacity={0.7}
          >
            <View
              className={`w-6 h-6 rounded border-2 ${
                formData.isPublic
                  ? 'bg-primary border-primary'
                  : 'border-gray-300 bg-white'
              } items-center justify-center mr-2`}
            >
              {formData.isPublic && (
                <Ionicons name="checkmark" size={16} color="white" />
              )}
            </View>
            <Text className="text-sm text-gray-700">
              학부모에게 공개
            </Text>
          </TouchableOpacity>

          {/* 버튼 */}
          <View className="flex-row gap-3 mb-6">
            <TouchableOpacity
              className="flex-1 rounded-xl py-4 border"
              style={{ borderColor: TEACHER_COLORS.gray[300] }}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text className="text-center font-bold text-gray-700">
                취소
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 rounded-xl py-4"
              style={{ backgroundColor: TEACHER_COLORS.primary.DEFAULT }}
              onPress={handleSave}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text className="text-center font-bold text-white">
                {loading ? '저장 중...' : '저장'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </BottomSheet>
  );
}
