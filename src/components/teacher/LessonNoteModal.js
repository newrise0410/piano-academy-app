// src/components/teacher/LessonNoteModal.js
import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../common';
import BottomSheet from '../common/BottomSheet';
import UnknownTextbookModal from './UnknownTextbookModal';
import ProgressStepSelector from './ProgressStepSelector';
import TEACHER_COLORS from '../../styles/teacher_colors';
import { SHADOWS, RADIUS, SPACING, TYPOGRAPHY, INPUT_STYLES } from '../../styles/commonStyles';
import { useLessonNoteStore, useToastStore, useAuthStore } from '../../store';
import { generateLessonNoteMemo, improveLessonNoteMemo, improveLearningStepMemo, isGeminiAvailable } from '../../services/geminiService';
import { updateProgressFromLessonNote } from '../../services/progressService';

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
  const { user } = useAuthStore();
  const toast = useToastStore();

  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [isDetailExpanded, setIsDetailExpanded] = useState(false);
  const [selectedTone, setSelectedTone] = useState('friendly'); // 문체 선택
  const [unknownTextbooks, setUnknownTextbooks] = useState([]); // 교재 DB에 없는 교재들
  const [showUnknownTextbookModal, setShowUnknownTextbookModal] = useState(false);
  const [savedLessonNoteId, setSavedLessonNoteId] = useState(null); // 저장된 수업일지 ID (재시도용)
  const [formData, setFormData] = useState({
    progress: '',
    homework: '',
    memo: '',
    strengths: '',
    improvements: '',
    practicePoints: '',
    isPublic: true,
    learningStep: null, // 학습 단계
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
        learningStep: existingNote.learningStep || null,
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
        learningStep: null,
      });
    }
  }, [existingNote, visible]);

  // AI로 메모 생성/개선 (통합)
  const handleAiMemo = async () => {
    // 메모가 비어있으면 자동 생성, 있으면 개선
    const hasExistingMemo = formData.memo && formData.memo.trim().length > 0;

    if (!hasExistingMemo && !formData.progress && !formData.homework) {
      toast.warning('진도나 숙제를 먼저 입력해주세요.');
      return;
    }

    setAiLoading(true);
    try {
      if (hasExistingMemo) {
        // 메모 개선
        const result = await improveLessonNoteMemo(formData.memo, {
          studentName: student.name,
          progress: formData.progress,
          homework: formData.homework,
        });

        if (result.success) {
          setFormData({ ...formData, memo: result.improvedMemo });
          toast.success('AI가 메모를 개선했습니다!');
        } else {
          toast.error('메모 개선에 실패했습니다.');
        }
      } else {
        // 메모 자동 생성
        const result = await generateLessonNoteMemo({
          studentName: student.name,
          progress: formData.progress,
          homework: formData.homework,
          strengths: formData.strengths,
          improvements: formData.improvements,
        }, selectedTone); // 선택한 문체 전달

        if (result.success) {
          setFormData({ ...formData, memo: result.memo });
          toast.success('AI가 메모를 생성했습니다!');
        } else {
          toast.error('메모 생성에 실패했습니다.');
        }
      }
    } catch (error) {
      console.error('AI 메모 처리 실패:', error);
      toast.error('AI 서비스 오류가 발생했습니다.');
    } finally {
      setAiLoading(false);
    }
  };

  // 진도 업데이트 함수 (재시도 가능하도록 분리)
  const handleProgressUpdate = async (lessonNoteId) => {
    console.log('📝 [진도 업데이트 시작]');
    console.log('- Progress:', formData.progress);
    console.log('- User academyId:', user?.academyId);
    console.log('- Student:', student?.name);

    if (!formData.progress || !formData.progress.trim()) {
      console.log('⏭️ 진도 내용이 없어서 건너뜀');
      return;
    }

    if (!user?.academyId) {
      console.error('❌ academyId가 없습니다!', user);
      toast.error('학원 정보가 없어 진도를 업데이트할 수 없습니다');
      return;
    }

    try {
      console.log('🎹 AI 진도 자동 업데이트 시작...');
      const result = await updateProgressFromLessonNote(
        student.id,
        student.name,
        lessonNoteId,
        formData.progress,
        user.academyId
      );

      console.log('📊 진도 업데이트 결과:', result);

      if (result.unknownTextbooks && result.unknownTextbooks.length > 0) {
        // 교재 DB에 없는 교재 발견
        console.log('⚠️ DB에 없는 교재 발견:', result.unknownTextbooks);
        setUnknownTextbooks(result.unknownTextbooks);
        setSavedLessonNoteId(lessonNoteId);
        setShowUnknownTextbookModal(true);
      } else {
        console.log('✅ 진도 자동 업데이트 완료!');
        if (result.updatedItems && result.updatedItems.length > 0) {
          toast.success(`${result.updatedItems.length}개 진도가 자동 업데이트되었습니다`);
        } else {
          console.log('⚠️ 업데이트된 항목이 없습니다');
        }
      }
    } catch (progressError) {
      // 진도 업데이트 실패해도 수업일지는 저장되므로 에러 표시만
      console.error('❌ 진도 자동 업데이트 실패:', progressError);
      toast.error('진도 업데이트에 실패했습니다: ' + progressError.message);
    }
  };

  const handleSave = async () => {
    if (!formData.progress && !formData.homework && !formData.memo) {
      toast.warning('진도, 숙제, 메모 중 하나는 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      let lessonNoteId;

      if (existingNote) {
        // 수정
        await updateLessonNote(existingNote.id, formData);
        lessonNoteId = existingNote.id;
        toast.success('수업 일지가 수정되었습니다.');
      } else {
        // 새로 작성
        const newNote = await addLessonNote({
          studentId: student.id,
          studentName: student.name,
          date, // YYYY-MM-DD 형식
          ...formData,
        });
        lessonNoteId = newNote.id;
        toast.success('수업 일지가 저장되었습니다.');
      }

      // 🎯 AI 자동 진도 업데이트
      await handleProgressUpdate(lessonNoteId);

      // unknownTextbooks가 있으면 모달이 열리고, 없으면 바로 닫기
      if (!unknownTextbooks || unknownTextbooks.length === 0) {
        onClose();
      }
    } catch (error) {
      console.error('수업 일지 저장 실패:', error);
      toast.error('저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 교재 추가 후 진도 업데이트 재시도
  const handleTextbooksAdded = async () => {
    setShowUnknownTextbookModal(false);
    if (savedLessonNoteId) {
      toast.success('교재가 추가되었습니다. 진도를 다시 업데이트합니다...');
      await handleProgressUpdate(savedLessonNoteId);
      setSavedLessonNoteId(null);
      setUnknownTextbooks([]);
    }
    onClose();
  };

  return (
    <>
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
          <View style={{ marginBottom: SPACING.lg }}>
            <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.gray[700], marginBottom: SPACING.sm }}>
              📚 오늘의 진도 <Text style={{ color: TEACHER_COLORS.danger[500] }}>*</Text>
            </Text>
            <TextInput
              style={{
                ...INPUT_STYLES.default,
                padding: SPACING.md,
                fontSize: TYPOGRAPHY.fontSize.base,
                textAlignVertical: 'top',
                minHeight: 60,
              }}
              placeholder="예: 체르니 30-1, 바이엘 60번"
              placeholderTextColor={TEACHER_COLORS.gray[400]}
              value={formData.progress}
              onChangeText={(text) => setFormData({ ...formData, progress: text })}
              multiline
              numberOfLines={2}
            />
          </View>

          {/* 학습 단계 */}
          <ProgressStepSelector
            value={formData.learningStep}
            onChange={(learningStep) => setFormData({ ...formData, learningStep })}
            onGenerateMemo={(memoText) => {
              // 진도 필드에 자동 반영
              const existingProgress = formData.progress.trim();
              if (existingProgress) {
                setFormData({ ...formData, progress: `${existingProgress}\n${memoText}` });
              } else {
                setFormData({ ...formData, progress: memoText });
              }
            }}
            existingNotes={formData.progress}
            onAiImprove={async (learningStepData) => {
              const result = await improveLearningStepMemo(
                learningStepData,
                learningStepData.existingNotes
              );
              if (result.success) {
                setFormData({ ...formData, progress: result.improvedMemo });
                toast.success('AI가 진도 내용을 개선했습니다!');
              } else {
                toast.error('AI 개선에 실패했습니다');
              }
            }}
          />

          {/* 숙제 */}
          <View style={{ marginBottom: SPACING.lg }}>
            <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.gray[700], marginBottom: SPACING.sm }}>
              ✏️ 다음 시간까지 숙제
            </Text>
            <TextInput
              style={{
                ...INPUT_STYLES.default,
                padding: SPACING.md,
                fontSize: TYPOGRAPHY.fontSize.base,
                textAlignVertical: 'top',
                minHeight: 60,
              }}
              placeholder="예: 체르니 30-1 3회 반복 연습"
              placeholderTextColor={TEACHER_COLORS.gray[400]}
              value={formData.homework}
              onChangeText={(text) => setFormData({ ...formData, homework: text })}
              multiline
              numberOfLines={2}
            />
          </View>

          {/* 메모 */}
          <View style={{ marginBottom: SPACING.lg }}>
            <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.gray[700], marginBottom: SPACING.sm }}>
              💬 수업 메모
            </Text>
            <TextInput
              style={{
                ...INPUT_STYLES.default,
                padding: SPACING.md,
                fontSize: TYPOGRAPHY.fontSize.base,
                textAlignVertical: 'top',
                minHeight: 80,
              }}
              placeholder="예: 리듬감이 좋아졌어요"
              placeholderTextColor={TEACHER_COLORS.gray[400]}
              value={formData.memo}
              onChangeText={(text) => setFormData({ ...formData, memo: text })}
              multiline
              numberOfLines={3}
            />

            {/* 문체 선택 */}
            {aiAvailable && (
              <View style={{ marginTop: SPACING.md }}>
                <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: TEACHER_COLORS.gray[600], marginBottom: SPACING.sm }}>
                  ✨ AI 문체 선택
                </Text>
                <View style={{ flexDirection: 'row', gap: SPACING.xs }}>
                  {[
                    { value: 'friendly', label: '친근함', icon: '😊' },
                    { value: 'formal', label: '공식적', icon: '📋' },
                    { value: 'concise', label: '간결함', icon: '⚡' },
                    { value: 'detailed', label: '상세함', icon: '📝' },
                  ].map((tone) => (
                    <TouchableOpacity
                      key={tone.value}
                      onPress={() => setSelectedTone(tone.value)}
                      style={{
                        flex: 1,
                        paddingVertical: SPACING.sm,
                        paddingHorizontal: SPACING.xs,
                        borderRadius: RADIUS.md,
                        borderWidth: 2,
                        borderColor: selectedTone === tone.value ? TEACHER_COLORS.purple[500] : TEACHER_COLORS.gray[200],
                        backgroundColor: selectedTone === tone.value ? TEACHER_COLORS.purple[50] : TEACHER_COLORS.white,
                        alignItems: 'center',
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={{ fontSize: 14, marginBottom: 2 }}>{tone.icon}</Text>
                      <Text style={{
                        fontSize: TYPOGRAPHY.fontSize.xs,
                        fontWeight: selectedTone === tone.value ? TYPOGRAPHY.fontWeight.bold : TYPOGRAPHY.fontWeight.medium,
                        color: selectedTone === tone.value ? TEACHER_COLORS.purple[700] : TEACHER_COLORS.gray[600],
                      }}>
                        {tone.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* AI 버튼 */}
            {aiAvailable && (
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: RADIUS.lg,
                  paddingVertical: SPACING.md,
                  marginTop: SPACING.md,
                  backgroundColor: aiLoading ? TEACHER_COLORS.gray[200] : TEACHER_COLORS.purple[500],
                  ...SHADOWS.md,
                }}
                onPress={handleAiMemo}
                disabled={aiLoading}
                activeOpacity={0.7}
              >
                {aiLoading ? (
                  <ActivityIndicator size="small" color={TEACHER_COLORS.white} />
                ) : (
                  <>
                    <Ionicons
                      name="sparkles"
                      size={18}
                      color={TEACHER_COLORS.white}
                      style={{ marginRight: SPACING.sm }}
                    />
                    <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.white }}>
                      {formData.memo && formData.memo.trim() ? 'AI로 메모 개선하기' : 'AI로 메모 작성하기'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* 상세 항목 (선택사항) - 아코디언 */}
          <View style={{ backgroundColor: TEACHER_COLORS.purple[50], borderRadius: RADIUS.xl, marginBottom: SPACING.lg, overflow: 'hidden' }}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: SPACING.lg,
              }}
              onPress={() => setIsDetailExpanded(!isDetailExpanded)}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.gray[700] }}>
                📝 상세 항목 (선택사항)
              </Text>
              <Ionicons
                name={isDetailExpanded ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={TEACHER_COLORS.gray[600]}
              />
            </TouchableOpacity>

            {isDetailExpanded && (
              <View style={{ paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg }}>
                {/* 잘한 점 */}
                <View style={{ marginBottom: SPACING.md }}>
                  <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: TEACHER_COLORS.gray[600], marginBottom: SPACING.xs }}>
                    👍 잘한 점
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: TEACHER_COLORS.white,
                      borderRadius: RADIUS.md,
                      padding: SPACING.sm,
                      fontSize: TYPOGRAPHY.fontSize.sm,
                    }}
                    placeholder="예: 박자 정확도 향상"
                    placeholderTextColor={TEACHER_COLORS.gray[400]}
                    value={formData.strengths}
                    onChangeText={(text) => setFormData({ ...formData, strengths: text })}
                  />
                </View>

                {/* 개선할 점 */}
                <View style={{ marginBottom: SPACING.md }}>
                  <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: TEACHER_COLORS.gray[600], marginBottom: SPACING.xs }}>
                    💪 개선할 점
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: TEACHER_COLORS.white,
                      borderRadius: RADIUS.md,
                      padding: SPACING.sm,
                      fontSize: TYPOGRAPHY.fontSize.sm,
                    }}
                    placeholder="예: 손목 긴장 풀기"
                    placeholderTextColor={TEACHER_COLORS.gray[400]}
                    value={formData.improvements}
                    onChangeText={(text) => setFormData({ ...formData, improvements: text })}
                  />
                </View>

                {/* 연습 포인트 */}
                <View>
                  <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: TEACHER_COLORS.gray[600], marginBottom: SPACING.xs }}>
                    🎯 연습 포인트
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: TEACHER_COLORS.white,
                      borderRadius: RADIUS.md,
                      padding: SPACING.sm,
                      fontSize: TYPOGRAPHY.fontSize.sm,
                    }}
                    placeholder="예: 느린 템포로 연습"
                    placeholderTextColor={TEACHER_COLORS.gray[400]}
                    value={formData.practicePoints}
                    onChangeText={(text) => setFormData({ ...formData, practicePoints: text })}
                  />
                </View>
              </View>
            )}
          </View>

          {/* 학부모 공개 여부 */}
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING['2xl'] }}
            onPress={() => setFormData({ ...formData, isPublic: !formData.isPublic })}
            activeOpacity={0.7}
          >
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: RADIUS.sm,
                borderWidth: 2,
                borderColor: formData.isPublic ? TEACHER_COLORS.primary.DEFAULT : TEACHER_COLORS.gray[300],
                backgroundColor: formData.isPublic ? TEACHER_COLORS.primary.DEFAULT : TEACHER_COLORS.white,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: SPACING.sm,
              }}
            >
              {formData.isPublic && (
                <Ionicons name="checkmark" size={16} color={TEACHER_COLORS.white} />
              )}
            </View>
            <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: TEACHER_COLORS.gray[700] }}>
              학부모에게 공개
            </Text>
          </TouchableOpacity>

          {/* 버튼 */}
          <View style={{ flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING['2xl'] }}>
            <TouchableOpacity
              style={{
                flex: 1,
                borderRadius: RADIUS.xl,
                paddingVertical: SPACING.lg,
                borderWidth: 1,
                borderColor: TEACHER_COLORS.gray[300],
              }}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={{ textAlign: 'center', fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.gray[700] }}>
                취소
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                borderRadius: RADIUS.xl,
                paddingVertical: SPACING.lg,
                backgroundColor: TEACHER_COLORS.primary.DEFAULT,
                ...SHADOWS.md,
              }}
              onPress={handleSave}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={{ textAlign: 'center', fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.white }}>
                {loading ? '저장 중...' : '저장'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </BottomSheet>

      {/* 교재 DB에 없는 교재 추가 모달 */}
      <UnknownTextbookModal
        visible={showUnknownTextbookModal}
        unknownTextbooks={unknownTextbooks}
        onClose={() => {
          setShowUnknownTextbookModal(false);
          setUnknownTextbooks([]);
          setSavedLessonNoteId(null);
          onClose();
        }}
        onTextbooksAdded={handleTextbooksAdded}
      />
    </>
  );
}
