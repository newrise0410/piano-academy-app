import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, LevelBadge } from '../common';
import BottomSheet from '../common/BottomSheet';
import TEACHER_COLORS from '../../styles/teacher_colors';

/**
 * TodayClassesModal - 오늘 수업 상세 모달
 */
export default function TodayClassesModal({ visible, onClose, students = [], onViewAll }) {
  // 시간대별로 그룹화
  const safeStudents = students || [];
  const groupedByTime = safeStudents.reduce((acc, student) => {
    const time = student.schedule?.split(' ')[1] || '시간 미정';
    if (!acc[time]) {
      acc[time] = [];
    }
    acc[time].push(student);
    return acc;
  }, {});

  // 시간순 정렬
  const sortedTimes = Object.keys(groupedByTime).sort();

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="오늘 수업"
      subtitle={`총 ${safeStudents.length}명의 학생`}
      height="large"
      onViewAll={onViewAll}
    >
      {safeStudents.length === 0 ? (
        <View className="py-12 items-center">
          <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="calendar-outline" size={40} color={TEACHER_COLORS.gray[400]} />
          </View>
          <Text className="text-gray-500 text-center">
            오늘 예정된 수업이 없습니다
          </Text>
        </View>
      ) : (
        <View>
          {sortedTimes.map((time, idx) => (
            <View key={time} className={idx > 0 ? 'mt-6' : ''}>
              {/* 시간대 헤더 */}
              <View className="flex-row items-center mb-3">
                <View className="w-1 h-4 bg-primary rounded-full mr-2" />
                <Text className="text-base font-bold text-gray-800">{time}</Text>
                <Text className="text-sm text-gray-500 ml-2">
                  ({groupedByTime[time].length}명)
                </Text>
              </View>

              {/* 학생 리스트 */}
              {groupedByTime[time].map((student, studentIdx) => (
                <View
                  key={student.id}
                  className={`bg-white border border-gray-200 rounded-xl p-4 ${
                    studentIdx > 0 ? 'mt-2' : ''
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <View className="flex-row items-center mb-2">
                        <Text className="text-base font-bold text-gray-800 mr-2">
                          {student.name}
                        </Text>
                        <LevelBadge level={student.level} />
                      </View>

                      <View className="flex-row items-center">
                        <Ionicons name="book-outline" size={14} color={TEACHER_COLORS.gray[500]} />
                        <Text className="text-sm text-gray-600 ml-1">
                          {student.book || '교재 미정'}
                        </Text>
                      </View>

                      {student.ticketType === 'count' && (
                        <View className="flex-row items-center mt-1">
                          <Ionicons name="ticket-outline" size={14} color={TEACHER_COLORS.gray[500]} />
                          <Text className="text-sm text-gray-600 ml-1">
                            남은 횟수: {student.ticketCount}회
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* 출석 체크 버튼 (옵션) */}
                    <TouchableOpacity
                      className="w-10 h-10 bg-green-50 rounded-full items-center justify-center"
                      activeOpacity={0.7}
                    >
                      <Ionicons name="checkmark" size={20} color={TEACHER_COLORS.success[600]} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ))}

          {/* 요약 정보 */}
          <View className="mt-6 bg-purple-50 rounded-xl p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm text-gray-700">전체 학생</Text>
              <Text className="text-sm font-bold text-gray-800">{safeStudents.length}명</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-gray-700">총 수업 시간</Text>
              <Text className="text-sm font-bold text-gray-800">
                {safeStudents.length * 50}분
              </Text>
            </View>
          </View>
        </View>
      )}
    </BottomSheet>
  );
}
