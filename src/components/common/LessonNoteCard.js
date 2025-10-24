// src/components/common/LessonNoteCard.js
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, LevelBadge } from '../common';
import TEACHER_COLORS from '../../styles/teacher_colors';

/**
 * LessonNoteCard - 수업 일지 카드 컴포넌트
 */
export default function LessonNoteCard({ lessonNote, note, student, onPress, onEdit, onDelete, showActions = true }) {
  // Support both prop names for backward compatibility
  const noteData = lessonNote || note;
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekDay = weekDays[date.getDay()];
    return `${month}월 ${day}일 (${weekDay})`;
  };

  // 48시간 이내 작성된 일지면 NEW 표시
  const isNew = () => {
    if (!noteData.date) return false;
    const noteDate = new Date(noteData.date);
    const now = new Date();
    const diffHours = (now - noteDate) / (1000 * 60 * 60);
    return diffHours <= 48;
  };

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl p-4 mb-3"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* 헤더 */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Text className="text-lg font-bold text-gray-800 mr-2">
            {noteData.studentName || student?.name || '학생'}
          </Text>
          {(noteData.level || student?.level) && <LevelBadge level={noteData.level || student?.level} />}
          {isNew() && (
            <View
              className="ml-2 px-2 py-0.5 rounded"
              style={{ backgroundColor: TEACHER_COLORS.danger[500] }}
            >
              <Text className="text-xs font-bold text-white">NEW</Text>
            </View>
          )}
        </View>
        <View className="flex-row items-center">
          <Ionicons name="calendar-outline" size={14} color={TEACHER_COLORS.gray[500]} />
          <Text className="text-sm text-gray-600 ml-1">
            {formatDate(noteData.date)}
          </Text>
        </View>
      </View>

      {/* 진도 */}
      {noteData.progress && (
        <View className="mb-2">
          <View className="flex-row items-start">
            <Text className="text-xs font-semibold text-purple-600 mr-2">📚</Text>
            <View className="flex-1">
              <Text className="text-xs font-semibold text-gray-600 mb-1">진도</Text>
              <Text className="text-sm text-gray-800">{noteData.progress}</Text>
            </View>
          </View>
        </View>
      )}

      {/* 숙제 */}
      {noteData.homework && (
        <View className="mb-2">
          <View className="flex-row items-start">
            <Text className="text-xs font-semibold text-blue-600 mr-2">✏️</Text>
            <View className="flex-1">
              <Text className="text-xs font-semibold text-gray-600 mb-1">숙제</Text>
              <Text className="text-sm text-gray-800">{noteData.homework}</Text>
            </View>
          </View>
        </View>
      )}

      {/* 메모 */}
      {noteData.memo && (
        <View className="mb-2">
          <View className="flex-row items-start">
            <Text className="text-xs font-semibold text-green-600 mr-2">💬</Text>
            <View className="flex-1">
              <Text className="text-xs font-semibold text-gray-600 mb-1">메모</Text>
              <Text className="text-sm text-gray-800">{noteData.memo}</Text>
            </View>
          </View>
        </View>
      )}

      {/* 상세 항목들 */}
      {(noteData.strengths || noteData.improvements || noteData.practicePoints) && (
        <View className="bg-purple-50 rounded-xl p-3 mt-2 mb-2">
          {noteData.strengths && (
            <View className="mb-2">
              <Text className="text-xs font-semibold text-gray-600 mb-0.5">👍 잘한 점</Text>
              <Text className="text-xs text-gray-700">{noteData.strengths}</Text>
            </View>
          )}
          {noteData.improvements && (
            <View className="mb-2">
              <Text className="text-xs font-semibold text-gray-600 mb-0.5">💪 개선할 점</Text>
              <Text className="text-xs text-gray-700">{noteData.improvements}</Text>
            </View>
          )}
          {noteData.practicePoints && (
            <View>
              <Text className="text-xs font-semibold text-gray-600 mb-0.5">🎯 연습 포인트</Text>
              <Text className="text-xs text-gray-700">{noteData.practicePoints}</Text>
            </View>
          )}
        </View>
      )}

      {/* 하단 액션 버튼 (선생님용) */}
      {showActions && onEdit && onDelete && (
        <View className="flex-row items-center justify-between mt-2 pt-3 border-t border-gray-100">
          <View className="flex-row items-center">
            <Ionicons
              name={noteData.isPublic ? 'eye' : 'eye-off'}
              size={14}
              color={noteData.isPublic ? TEACHER_COLORS.primary.DEFAULT : TEACHER_COLORS.gray[400]}
            />
            <Text className="text-xs text-gray-500 ml-1">
              {noteData.isPublic ? '학부모 공개' : '비공개'}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              className="flex-row items-center px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: TEACHER_COLORS.blue[50] }}
              onPress={(e) => {
                e.stopPropagation();
                onEdit(noteData);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="create-outline" size={14} color={TEACHER_COLORS.blue[600]} />
              <Text className="text-xs font-semibold ml-1" style={{ color: TEACHER_COLORS.blue[600] }}>
                수정
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: TEACHER_COLORS.danger[50] }}
              onPress={(e) => {
                e.stopPropagation();
                onDelete(noteData);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={14} color={TEACHER_COLORS.danger[600]} />
              <Text className="text-xs font-semibold ml-1" style={{ color: TEACHER_COLORS.danger[600] }}>
                삭제
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}
