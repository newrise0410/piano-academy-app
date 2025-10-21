// src/components/teacher/NoticeRecipientSelector.js
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Button, FilterChip, LevelBadge, ScreenHeader } from '../common';
import TEACHER_COLORS from '../../styles/teacher_colors';
import { STUDENT_CATEGORIES, DAY_FILTERS } from '../../constants/noticeTemplates';

/**
 * 알림장 수신자 선택 화면 컴포넌트
 *
 * @param {Array} students - 전체 학생 목록
 * @param {Array} selectedStudentIds - 선택된 학생 ID 배열
 * @param {function} onSelectionChange - 선택 변경 콜백
 * @param {function} onConfirm - 확인 버튼 콜백
 * @param {function} onBack - 뒤로가기 콜백
 * @param {function} onClose - 닫기 버튼 콜백
 */
export default function NoticeRecipientSelector({
  students,
  selectedStudentIds,
  onSelectionChange,
  onConfirm,
  onBack,
  onClose,
}) {
  const [categoryFilter, setCategoryFilter] = useState('전체');
  const [dayFilter, setDayFilter] = useState('전체');

  // 필터링된 학생 목록
  const filteredStudents = students.filter(student => {
    // 카테고리 필터
    const matchesCategory = categoryFilter === '전체' || student.category === categoryFilter;

    // 요일 필터
    let matchesDay = true;
    if (dayFilter !== '전체') {
      const scheduleDays = student.schedule.split(' ')[0].split('/');
      matchesDay = scheduleDays.includes(dayFilter);
    }

    return matchesCategory && matchesDay;
  });

  // 학생 선택 토글
  const toggleStudent = (studentId) => {
    if (selectedStudentIds.includes(studentId)) {
      onSelectionChange(selectedStudentIds.filter(id => id !== studentId));
    } else {
      onSelectionChange([...selectedStudentIds, studentId]);
    }
  };

  // 모두 선택
  const selectAll = () => {
    onSelectionChange(filteredStudents.map(s => s.id));
  };

  // 선택 해제
  const clearSelection = () => {
    onSelectionChange([]);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* 헤더 */}
      <ScreenHeader
        title="발송 대상 선택"
        onBackPress={onBack}
        rightButton={
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={TEACHER_COLORS.gray[800]} />
          </TouchableOpacity>
        }
      />

      <ScrollView className="flex-1 px-5 py-4">
        {/* 필터 섹션 */}
        <View className="bg-white rounded-2xl p-4 mb-4">
          <Text className="text-base font-bold text-gray-800 mb-3">필터</Text>

          {/* 카테고리 필터 */}
          <View className="mb-3">
            <Text className="text-sm font-semibold text-gray-700 mb-2">카테고리</Text>
            <FilterChip
              options={STUDENT_CATEGORIES.map(cat => ({ value: cat, label: cat }))}
              value={categoryFilter}
              onChange={setCategoryFilter}
              layout="wrapped"
            />
          </View>

          {/* 요일 필터 */}
          <View>
            <Text className="text-sm font-semibold text-gray-700 mb-2">요일</Text>
            <FilterChip
              options={DAY_FILTERS.map(day => ({ value: day, label: day }))}
              value={dayFilter}
              onChange={setDayFilter}
              layout="wrapped"
            />
          </View>
        </View>

        {/* 선택 정보 및 일괄 버튼 */}
        <View className="bg-white rounded-2xl p-4 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-bold text-gray-800">발송 대상</Text>
            <Text className="text-sm text-primary font-bold">
              {selectedStudentIds.length}/{filteredStudents.length}명 선택
            </Text>
          </View>

          <View className="flex-row gap-2">
            <Button
              title="모두 선택"
              icon="checkmark-done"
              onPress={selectAll}
              size="small"
              style={{ flex: 1 }}
            />

            <Button
              title="선택 해제"
              icon="close-circle"
              variant="secondary"
              onPress={clearSelection}
              size="small"
              style={{ flex: 1 }}
            />
          </View>
        </View>

        {/* 학생 목록 */}
        <View className="mb-4">
          {filteredStudents.map((student) => {
            const isSelected = selectedStudentIds.includes(student.id);

            return (
              <TouchableOpacity
                key={student.id}
                className="bg-white rounded-2xl p-4 mb-2 flex-row items-center justify-between"
                onPress={() => toggleStudent(student.id)}
                activeOpacity={0.7}
                style={{
                  borderWidth: isSelected ? 2 : 1,
                  borderColor: isSelected ? TEACHER_COLORS.primary.DEFAULT : TEACHER_COLORS.gray[200],
                }}
              >
                <View className="flex-1 flex-row items-center">
                  {/* 체크 아이콘 */}
                  <View
                    className="w-6 h-6 rounded-full items-center justify-center mr-3"
                    style={{
                      backgroundColor: isSelected ? TEACHER_COLORS.primary.DEFAULT : TEACHER_COLORS.gray[200],
                    }}
                  >
                    {isSelected && (
                      <Ionicons name="checkmark" size={16} color={TEACHER_COLORS.white} />
                    )}
                  </View>

                  <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                      <Text className="text-base font-bold text-gray-800 mr-2">
                        {student.name}
                      </Text>
                      <LevelBadge level={student.level} />
                    </View>
                    <Text className="text-xs text-gray-600">{student.schedule}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* 하단 고정 버튼 */}
      <View className="px-5 py-4 bg-white border-t border-gray-200">
        <Button
          title={`${selectedStudentIds.length}명에게 발송`}
          onPress={onConfirm}
          disabled={selectedStudentIds.length === 0}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}
