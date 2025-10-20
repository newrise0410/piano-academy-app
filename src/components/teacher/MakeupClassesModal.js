import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, LevelBadge, Button } from '../common';
import BottomSheet from '../common/BottomSheet';
import TEACHER_COLORS from '../../styles/teacher_colors';
import { formatDate } from '../../utils';

/**
 * MakeupClassesModal - 보강 예정 상세 모달
 */
export default function MakeupClassesModal({
  visible,
  onClose,
  makeupClasses = [],
  onSchedule,
  onComplete,
  onViewAll
}) {
  // 날짜별로 그룹화
  const safeMakeupClasses = makeupClasses || [];
  const groupedByDate = safeMakeupClasses.reduce((acc, makeup) => {
    const date = makeup.scheduledDate || '날짜 미정';
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(makeup);
    return acc;
  }, {});

  // 날짜순 정렬 (미정은 마지막)
  const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
    if (a === '날짜 미정') return 1;
    if (b === '날짜 미정') return -1;
    return new Date(a) - new Date(b);
  });

  // 상태별 개수
  const scheduledCount = safeMakeupClasses.filter(m => m.scheduledDate).length;
  const unscheduledCount = safeMakeupClasses.filter(m => !m.scheduledDate).length;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="보강 예정"
      subtitle={`총 ${safeMakeupClasses.length}건의 보강`}
      height="large"
      onViewAll={onViewAll}
    >
      {safeMakeupClasses.length === 0 ? (
        <View className="py-12 items-center">
          <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="repeat-outline" size={40} color={TEACHER_COLORS.gray[400]} />
          </View>
          <Text className="text-gray-500 text-center">
            예정된 보강이 없습니다
          </Text>
        </View>
      ) : (
        <View>
          {/* 보강 리스트 */}
          {sortedDates.map((date, idx) => (
            <View key={date} className={idx > 0 ? 'mt-6' : ''}>
              {/* 날짜 헤더 */}
              <View className="flex-row items-center mb-3">
                <View className="w-1 h-4 bg-success rounded-full mr-2" />
                <Text className="text-base font-bold text-gray-800">
                  {date === '날짜 미정' ? date : formatDate(new Date(date))}
                </Text>
                <Text className="text-sm text-gray-500 ml-2">
                  ({groupedByDate[date].length}건)
                </Text>
              </View>

              {/* 보강 항목 */}
              {groupedByDate[date].map((makeup, makeupIdx) => (
                <View
                  key={makeup.id}
                  className={`bg-white border ${
                    makeup.scheduledDate ? 'border-green-200' : 'border-yellow-200'
                  } rounded-xl p-4 ${makeupIdx > 0 ? 'mt-2' : ''}`}
                >
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      {/* 학생 정보 */}
                      <View className="flex-row items-center mb-2">
                        <Text className="text-base font-bold text-gray-800 mr-2">
                          {makeup.studentName}
                        </Text>
                        <LevelBadge level={makeup.level} />
                      </View>

                      {/* 결석 사유 */}
                      <View className="flex-row items-center mb-1">
                        <Ionicons name="information-circle-outline" size={14} color={TEACHER_COLORS.gray[500]} />
                        <Text className="text-sm text-gray-600 ml-1">
                          사유: {makeup.reason || '미기재'}
                        </Text>
                      </View>

                      {/* 원래 수업일 */}
                      <View className="flex-row items-center mb-1">
                        <Ionicons name="calendar-outline" size={14} color={TEACHER_COLORS.gray[500]} />
                        <Text className="text-sm text-gray-600 ml-1">
                          결석일: {formatDate(new Date(makeup.originalDate))}
                        </Text>
                      </View>

                      {/* 예정 시간 */}
                      {makeup.scheduledTime && (
                        <View className="flex-row items-center">
                          <Ionicons name="time-outline" size={14} color={TEACHER_COLORS.success[600]} />
                          <Text className="text-sm font-semibold text-green-600 ml-1">
                            예정: {makeup.scheduledTime}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* 상태 아이콘 */}
                    <View
                      className={`w-10 h-10 rounded-full items-center justify-center ${
                        makeup.scheduledDate ? 'bg-green-100' : 'bg-yellow-100'
                      }`}
                    >
                      <Ionicons
                        name={makeup.scheduledDate ? 'checkmark-circle' : 'time'}
                        size={20}
                        color={
                          makeup.scheduledDate
                            ? TEACHER_COLORS.success[600]
                            : TEACHER_COLORS.warning[600]
                        }
                      />
                    </View>
                  </View>

                  {/* 액션 버튼 */}
                  <View className="flex-row gap-2">
                    {!makeup.scheduledDate ? (
                      <Button
                        title="일정 잡기"
                        icon="calendar"
                        variant="success"
                        size="small"
                        onPress={() => onSchedule?.(makeup)}
                        style={{ flex: 1 }}
                      />
                    ) : (
                      <Button
                        title="보강 완료"
                        icon="checkmark-done"
                        variant="outline"
                        size="small"
                        onPress={() => onComplete?.(makeup)}
                        style={{ flex: 1 }}
                      />
                    )}
                    <Button
                      title="연기"
                      icon="swap-horizontal"
                      variant="ghost"
                      size="small"
                      onPress={() => onSchedule?.(makeup)}
                      style={{ flex: 1 }}
                    />
                  </View>
                </View>
              ))}
            </View>
          ))}

          {/* 요약 정보 */}
          <View className="mt-6 bg-green-50 rounded-xl p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm text-gray-700">일정 확정</Text>
              <Text className="text-sm font-bold text-green-600">{scheduledCount}건</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-gray-700">일정 미정</Text>
              <Text className="text-sm font-bold text-yellow-600">{unscheduledCount}건</Text>
            </View>
          </View>

          {/* 안내 메시지 */}
          {unscheduledCount > 0 && (
            <View className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <View className="flex-row items-start">
                <Ionicons name="alert-circle" size={20} color={TEACHER_COLORS.warning[600]} />
                <View className="flex-1 ml-2">
                  <Text className="text-sm text-gray-700 leading-5">
                    {unscheduledCount}건의 보강 일정이 아직 확정되지 않았습니다.
                    학부모님과 상의하여 일정을 잡아주세요.
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      )}
    </BottomSheet>
  );
}
