// src/components/teacher/ProgressStepSelector.js
import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, ScrollView, ActivityIndicator, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../common';
import TEACHER_COLORS from '../../styles/teacher_colors';
import { SPACING, TYPOGRAPHY, RADIUS, INPUT_STYLES } from '../../styles/commonStyles';
import { LEARNING_STEPS, getLearningStepIndex, learningStepToText } from '../../constants/learningSteps';

/**
 * ProgressStepSelector - 학습 단계 선택 컴포넌트
 *
 * @param {Object} value - { currentStep: 'together', completedSteps: ['analysis', 'separate'], subItems: { 'together': ['양손 천천히 합치기'] }, specialNotes: '3-5마디 어려움' }
 * @param {Function} onChange - (learningStepData) => {}
 * @param {Function} onGenerateMemo - (memoText) => {}
 * @param {string} existingNotes - 기존 메모 (스마트 병합용)
 * @param {Function} onAiImprove - (callback) => {} AI 개선 함수
 * @param {string} songNumber - 곡 번호 (예: "1")
 * @param {string} songTitle - 곡 제목 (예: "체르니 30-1")
 */
export default function ProgressStepSelector({
  value = null,
  onChange,
  onGenerateMemo,
  existingNotes = '',
  onAiImprove,
  songNumber = '',
  songTitle = ''
}) {
  const [selectedStep, setSelectedStep] = useState(value?.currentStep || null);
  const [completedSteps, setCompletedSteps] = useState(value?.completedSteps || []);
  const [subItems, setSubItems] = useState(value?.subItems || {});
  const [expandedStep, setExpandedStep] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [specialNotes, setSpecialNotes] = useState(value?.specialNotes || '');

  // value prop 변경 시 state 동기화
  useEffect(() => {
    if (value) {
      setSelectedStep(value.currentStep || null);
      setCompletedSteps(value.completedSteps || []);
      setSubItems(value.subItems || {});
      setSpecialNotes(value.specialNotes || '');
    }
  }, [value]);

  // 단계 클릭 핸들러
  const handleStepClick = (stepId) => {
    const stepIndex = getLearningStepIndex(stepId);
    const currentIndex = selectedStep ? getLearningStepIndex(selectedStep) : -1;

    // 이미 완료된 단계를 클릭하면 다시 선택 해제
    if (completedSteps.includes(stepId)) {
      // 완료된 단계 제거
      const newCompletedSteps = completedSteps.filter(id => id !== stepId);
      // 해당 단계의 세부 항목도 제거
      const newSubItems = { ...subItems };
      delete newSubItems[stepId];

      setCompletedSteps(newCompletedSteps);
      setSubItems(newSubItems);

      // 현재 단계가 제거된 단계라면 null로
      if (selectedStep === stepId) {
        setSelectedStep(null);
      }

      notifyChange(selectedStep === stepId ? null : selectedStep, newCompletedSteps, newSubItems);
      return;
    }

    // 새로운 단계 선택
    setSelectedStep(stepId);

    // 이전 단계들을 자동으로 완료 처리
    const newCompletedSteps = [...completedSteps];
    for (let i = 0; i < stepIndex; i++) {
      const step = LEARNING_STEPS[i];
      if (!newCompletedSteps.includes(step.id)) {
        newCompletedSteps.push(step.id);
      }
    }
    setCompletedSteps(newCompletedSteps);

    // 펼침 상태 토글
    setExpandedStep(expandedStep === stepId ? null : stepId);

    notifyChange(stepId, newCompletedSteps, subItems);
  };

  // 세부 항목 토글 핸들러
  const handleSubItemToggle = (stepId, subItem) => {
    const currentSubItems = subItems[stepId] || [];
    let newSubItems;

    if (currentSubItems.includes(subItem)) {
      // 제거
      newSubItems = {
        ...subItems,
        [stepId]: currentSubItems.filter(item => item !== subItem)
      };
    } else {
      // 추가
      newSubItems = {
        ...subItems,
        [stepId]: [...currentSubItems, subItem]
      };
    }

    setSubItems(newSubItems);
    notifyChange(selectedStep, completedSteps, newSubItems);
  };

  // 변경사항을 부모 컴포넌트에 전달
  const notifyChange = (currentStep, completed, subItemsData) => {
    if (onChange) {
      onChange({
        currentStep,
        completedSteps: completed,
        subItems: subItemsData,
        specialNotes
      });
    }
  };

  // 메모 생성 핸들러
  const handleGenerateMemo = () => {
    // 곡 정보 구성
    let memoText = '';

    // 1. 곡 번호/제목
    if (songNumber || songTitle) {
      if (songNumber && songTitle) {
        memoText = `${songTitle} (${songNumber}번)`;
      } else if (songTitle) {
        memoText = songTitle;
      } else if (songNumber) {
        memoText = `${songNumber}번`;
      }
    }

    // 2. 학습 단계 정보
    const stepText = learningStepToText({ currentStep: selectedStep, completedSteps, subItems });
    if (stepText) {
      memoText = memoText ? `${memoText} - ${stepText}` : stepText;
    }

    // 3. 특이사항
    if (specialNotes && specialNotes.trim()) {
      memoText = memoText ? `${memoText}. ${specialNotes.trim()}` : specialNotes.trim();
    }

    if (!memoText) return;

    if (onGenerateMemo) {
      onGenerateMemo(memoText.trim());
    }
  };

  // AI로 메모 개선 핸들러
  const handleAiImprove = async () => {
    if (!onAiImprove) return;

    setAiLoading(true);
    try {
      await onAiImprove({
        songNumber,
        songTitle,
        currentStep: selectedStep,
        completedSteps,
        subItems,
        specialNotes,
        existingNotes
      });
    } finally {
      setAiLoading(false);
    }
  };

  // 단계 상태 확인
  const getStepStatus = (stepId) => {
    if (completedSteps.includes(stepId)) return 'completed';
    if (selectedStep === stepId) return 'current';
    return 'pending';
  };

  return (
    <View style={{ marginBottom: SPACING.lg }}>
      {/* 타이틀 */}
      <Text style={{
        fontSize: TYPOGRAPHY.fontSize.sm,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: TEACHER_COLORS.gray[700],
        marginBottom: SPACING.md
      }}>
        🎹 학습 단계
      </Text>

      {/* 진행 바 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: SPACING.md }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm }}>
          {LEARNING_STEPS.map((step, index) => {
            const status = getStepStatus(step.id);
            const isCompleted = status === 'completed';
            const isCurrent = status === 'current';

            return (
              <React.Fragment key={step.id}>
                {/* 단계 버튼 */}
                <TouchableOpacity
                  onPress={() => handleStepClick(step.id)}
                  style={{
                    paddingHorizontal: SPACING.md,
                    paddingVertical: SPACING.sm,
                    borderRadius: RADIUS.lg,
                    backgroundColor: isCompleted
                      ? step.color + '20'
                      : isCurrent
                      ? step.color
                      : TEACHER_COLORS.gray[100],
                    borderWidth: 2,
                    borderColor: isCompleted || isCurrent ? step.color : TEACHER_COLORS.gray[200],
                    minWidth: 90,
                    alignItems: 'center'
                  }}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                    {isCompleted && (
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={step.color}
                        style={{ marginRight: 4 }}
                      />
                    )}
                    <Text style={{ fontSize: TYPOGRAPHY.fontSize.lg }}>
                      {step.icon}
                    </Text>
                  </View>
                  <Text style={{
                    fontSize: TYPOGRAPHY.fontSize.xs,
                    fontWeight: TYPOGRAPHY.fontWeight.bold,
                    color: isCurrent ? TEACHER_COLORS.white : step.color,
                    textAlign: 'center'
                  }}>
                    {step.name}
                  </Text>
                </TouchableOpacity>

                {/* 화살표 */}
                {index < LEARNING_STEPS.length - 1 && (
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={TEACHER_COLORS.gray[400]}
                    style={{ marginHorizontal: SPACING.xs }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </View>
      </ScrollView>

      {/* 세부 항목 (현재 선택된 단계가 있을 때만) */}
      {selectedStep && expandedStep === selectedStep && (
        <View style={{
          backgroundColor: TEACHER_COLORS.gray[50],
          borderRadius: RADIUS.xl,
          padding: SPACING.lg,
          marginBottom: SPACING.md
        }}>
          {/* 단계 정보 */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
            <Text style={{ fontSize: TYPOGRAPHY.fontSize['2xl'], marginRight: SPACING.sm }}>
              {LEARNING_STEPS.find(s => s.id === selectedStep)?.icon}
            </Text>
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: TYPOGRAPHY.fontSize.base,
                fontWeight: TYPOGRAPHY.fontWeight.bold,
                color: TEACHER_COLORS.gray[800]
              }}>
                {LEARNING_STEPS.find(s => s.id === selectedStep)?.name}
              </Text>
              <Text style={{
                fontSize: TYPOGRAPHY.fontSize.xs,
                color: TEACHER_COLORS.gray[500],
                marginTop: 2
              }}>
                {LEARNING_STEPS.find(s => s.id === selectedStep)?.description}
              </Text>
            </View>
          </View>

          {/* 세부 항목 체크박스 */}
          {LEARNING_STEPS.find(s => s.id === selectedStep)?.subItems.map((subItem, idx) => {
            const isChecked = (subItems[selectedStep] || []).includes(subItem);

            return (
              <TouchableOpacity
                key={idx}
                onPress={() => handleSubItemToggle(selectedStep, subItem)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: SPACING.sm,
                  paddingHorizontal: SPACING.md,
                  backgroundColor: TEACHER_COLORS.white,
                  borderRadius: RADIUS.lg,
                  marginBottom: SPACING.sm
                }}
                activeOpacity={0.7}
              >
                <View style={{
                  width: 20,
                  height: 20,
                  borderRadius: 6,
                  borderWidth: 2,
                  borderColor: isChecked
                    ? LEARNING_STEPS.find(s => s.id === selectedStep)?.color
                    : TEACHER_COLORS.gray[300],
                  backgroundColor: isChecked
                    ? LEARNING_STEPS.find(s => s.id === selectedStep)?.color
                    : TEACHER_COLORS.white,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: SPACING.md
                }}>
                  {isChecked && (
                    <Ionicons name="checkmark" size={14} color={TEACHER_COLORS.white} />
                  )}
                </View>
                <Text style={{
                  flex: 1,
                  fontSize: TYPOGRAPHY.fontSize.sm,
                  color: TEACHER_COLORS.gray[700]
                }}>
                  {subItem}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* 특이사항 입력 (선택사항) */}
          <View style={{ marginTop: SPACING.md }}>
            <Text style={{
              fontSize: TYPOGRAPHY.fontSize.xs,
              fontWeight: TYPOGRAPHY.fontWeight.semibold,
              color: TEACHER_COLORS.gray[600],
              marginBottom: SPACING.sm
            }}>
              특이사항 (선택)
            </Text>
            <TextInput
              style={{
                ...INPUT_STYLES.default,
                padding: SPACING.md,
                fontSize: TYPOGRAPHY.fontSize.sm,
                minHeight: 60,
                textAlignVertical: 'top',
                backgroundColor: TEACHER_COLORS.white
              }}
              placeholder="예: 3-5마디 왼손 어려움, 템포 느림"
              placeholderTextColor={TEACHER_COLORS.gray[400]}
              value={specialNotes}
              onChangeText={(text) => {
                setSpecialNotes(text);
                // 특이사항 변경 시에도 부모에게 알림
                notifyChange(selectedStep, completedSteps, subItems);
              }}
              multiline
              numberOfLines={2}
            />
          </View>

          {/* 액션 버튼 */}
          <View style={{
            flexDirection: 'row',
            gap: SPACING.sm,
            marginTop: SPACING.md
          }}>
            {/* 메모에 반영 버튼 */}
            <TouchableOpacity
              onPress={handleGenerateMemo}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: SPACING.sm,
                paddingHorizontal: SPACING.md,
                borderRadius: RADIUS.lg,
                backgroundColor: TEACHER_COLORS.primary.DEFAULT
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle" size={18} color={TEACHER_COLORS.white} />
              <Text style={{
                fontSize: TYPOGRAPHY.fontSize.sm,
                fontWeight: TYPOGRAPHY.fontWeight.semibold,
                color: TEACHER_COLORS.white,
                marginLeft: SPACING.xs
              }}>
                메모에 반영
              </Text>
            </TouchableOpacity>

            {/* AI로 다듬기 버튼 */}
            {onAiImprove && (
              <TouchableOpacity
                onPress={handleAiImprove}
                disabled={aiLoading}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: SPACING.sm,
                  paddingHorizontal: SPACING.md,
                  borderRadius: RADIUS.lg,
                  backgroundColor: TEACHER_COLORS.purple[500],
                  opacity: aiLoading ? 0.6 : 1
                }}
                activeOpacity={0.7}
              >
                {aiLoading ? (
                  <ActivityIndicator size="small" color={TEACHER_COLORS.white} />
                ) : (
                  <Ionicons name="sparkles" size={18} color={TEACHER_COLORS.white} />
                )}
                <Text style={{
                  fontSize: TYPOGRAPHY.fontSize.sm,
                  fontWeight: TYPOGRAPHY.fontWeight.semibold,
                  color: TEACHER_COLORS.white,
                  marginLeft: SPACING.xs
                }}>
                  AI로 다듬기
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* 선택 요약 (펼쳐지지 않았을 때) */}
      {selectedStep && expandedStep !== selectedStep && (
        <TouchableOpacity
          onPress={() => setExpandedStep(selectedStep)}
          style={{
            backgroundColor: TEACHER_COLORS.gray[50],
            borderRadius: RADIUS.lg,
            padding: SPACING.md,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
          activeOpacity={0.7}
        >
          <Text style={{
            fontSize: TYPOGRAPHY.fontSize.sm,
            color: TEACHER_COLORS.gray[600]
          }}>
            {learningStepToText({ currentStep: selectedStep, completedSteps, subItems })}
          </Text>
          <Ionicons name="chevron-down" size={20} color={TEACHER_COLORS.gray[400]} />
        </TouchableOpacity>
      )}
    </View>
  );
}
