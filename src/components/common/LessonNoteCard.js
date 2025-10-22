// src/components/common/LessonNoteCard.js
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, LevelBadge } from '../common';
import TEACHER_COLORS from '../../styles/teacher_colors';

/**
 * LessonNoteCard - 수업 일지 카드 컴포넌트
 */
export default function LessonNoteCard({ note, onPress, onEdit, onDelete, showActions = true }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekDay = weekDays[date.getDay()];
    return `${month}월 ${day}일 (${weekDay})`;
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
            {note.studentName}
          </Text>
          {note.level && <LevelBadge level={note.level} />}
        </View>
        <View className="flex-row items-center">
          <Ionicons name="calendar-outline" size={14} color={TEACHER_COLORS.gray[500]} />
          <Text className="text-sm text-gray-600 ml-1">
            {formatDate(note.date)}
          </Text>
        </View>
      </View>

      {/* 진도 */}
      {note.progress && (
        <View className="mb-2">
          <View className="flex-row items-start">
            <Text className="text-xs font-semibold text-purple-600 mr-2">📚</Text>
            <View className="flex-1">
              <Text className="text-xs font-semibold text-gray-600 mb-1">진도</Text>
              <Text className="text-sm text-gray-800">{note.progress}</Text>
            </View>
          </View>
        </View>
      )}

      {/* 숙제 */}
      {note.homework && (
        <View className="mb-2">
          <View className="flex-row items-start">
            <Text className="text-xs font-semibold text-blue-600 mr-2">✏️</Text>
            <View className="flex-1">
              <Text className="text-xs font-semibold text-gray-600 mb-1">숙제</Text>
              <Text className="text-sm text-gray-800">{note.homework}</Text>
            </View>
          </View>
        </View>
      )}

      {/* 메모 */}
      {note.memo && (
        <View className="mb-2">
          <View className="flex-row items-start">
            <Text className="text-xs font-semibold text-green-600 mr-2">💬</Text>
            <View className="flex-1">
              <Text className="text-xs font-semibold text-gray-600 mb-1">메모</Text>
              <Text className="text-sm text-gray-800">{note.memo}</Text>
            </View>
          </View>
        </View>
      )}

      {/* 상세 항목들 */}
      {(note.strengths || note.improvements || note.practicePoints) && (
        <View className="bg-purple-50 rounded-xl p-3 mt-2 mb-2">
          {note.strengths && (
            <View className="mb-2">
              <Text className="text-xs font-semibold text-gray-600 mb-0.5">👍 잘한 점</Text>
              <Text className="text-xs text-gray-700">{note.strengths}</Text>
            </View>
          )}
          {note.improvements && (
            <View className="mb-2">
              <Text className="text-xs font-semibold text-gray-600 mb-0.5">💪 개선할 점</Text>
              <Text className="text-xs text-gray-700">{note.improvements}</Text>
            </View>
          )}
          {note.practicePoints && (
            <View>
              <Text className="text-xs font-semibold text-gray-600 mb-0.5">🎯 연습 포인트</Text>
              <Text className="text-xs text-gray-700">{note.practicePoints}</Text>
            </View>
          )}
        </View>
      )}

      {/* 하단 액션 버튼 (선생님용) */}
      {showActions && onEdit && onDelete && (
        <View className="flex-row items-center justify-between mt-2 pt-3 border-t border-gray-100">
          <View className="flex-row items-center">
            <Ionicons
              name={note.isPublic ? 'eye' : 'eye-off'}
              size={14}
              color={note.isPublic ? TEACHER_COLORS.primary.DEFAULT : TEACHER_COLORS.gray[400]}
            />
            <Text className="text-xs text-gray-500 ml-1">
              {note.isPublic ? '학부모 공개' : '비공개'}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              className="flex-row items-center px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: TEACHER_COLORS.blue[50] }}
              onPress={(e) => {
                e.stopPropagation();
                onEdit(note);
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
              style={{ backgroundColor: TEACHER_COLORS.red[50] }}
              onPress={(e) => {
                e.stopPropagation();
                onDelete(note);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={14} color={TEACHER_COLORS.red[600]} />
              <Text className="text-xs font-semibold ml-1" style={{ color: TEACHER_COLORS.red[600] }}>
                삭제
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}
