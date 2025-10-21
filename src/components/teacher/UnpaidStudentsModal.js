import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../common';
import BottomSheet from '../common/BottomSheet';
import TEACHER_COLORS from '../../styles/teacher_colors';
import { formatCurrency } from '../../utils';

/**
 * UnpaidStudentsModal - 미납 학생 상세 모달
 */
export default function UnpaidStudentsModal({ visible, onClose, students = [], onSendNotice, onViewAll }) {
  // 미납 기간별로 정렬 (오래된 순)
  const safeStudents = students || [];
  const sortedStudents = [...safeStudents].sort((a, b) => {
    const dateA = new Date(a.lastPaymentDate || '2000-01-01');
    const dateB = new Date(b.lastPaymentDate || '2000-01-01');
    return dateA - dateB;
  });

  // 총 미납 금액 계산
  const totalUnpaid = safeStudents.reduce((sum, student) => sum + (student.unpaidAmount || 0), 0);

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="미납 학생"
      subtitle={`총 ${safeStudents.length}명의 미납 학생`}
      height="large"
      onViewAll={onViewAll}
    >
      {safeStudents.length === 0 ? (
        <View className="py-12 items-center">
          <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="checkmark-circle" size={40} color={TEACHER_COLORS.success[600]} />
          </View>
          <Text className="text-gray-500 text-center">
            미납 학생이 없습니다
          </Text>
        </View>
      ) : (
        <View>
          {/* 학생 리스트 */}
          {sortedStudents.map((student, idx) => (
            <View
              key={student.id}
              className={`bg-white rounded-xl p-4 flex-row items-center justify-between ${
                idx > 0 ? 'mt-2' : ''
              }`}
            >
              <View className="flex-1">
                {/* 학생 정보 */}
                <View className="flex-row items-center mb-1">
                  <Text className="text-base font-bold text-gray-800">
                    {student.name}
                  </Text>
                  <View className="rounded-full px-2 py-0.5 ml-2" style={{ backgroundColor: TEACHER_COLORS.purple[100] }}>
                    <Text className="text-xs font-bold text-primary">{student.level}</Text>
                  </View>
                </View>

                {/* 마지막 납부일 */}
                <Text className="text-xs text-gray-600 mb-1">
                  마지막 결제: {student.lastPaymentDate || '정보 없음'}
                </Text>

                {/* 미납 금액 */}
                <View className="flex-row items-center">
                  <Text className="text-xs text-gray-500">미납 금액: </Text>
                  <Text className="text-xs font-semibold" style={{ color: TEACHER_COLORS.red[600] }}>
                    {formatCurrency(student.unpaidAmount || 280000)}
                  </Text>
                </View>
              </View>

              {/* 알림 버튼 */}
              <TouchableOpacity
                onPress={() => onSendNotice?.(student)}
                className="rounded-lg px-4 py-2.5"
                style={{ backgroundColor: TEACHER_COLORS.red[500] }}
                activeOpacity={0.7}
              >
                <Text className="text-sm font-bold text-white">알림</Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* 요약 정보 */}
          <View className="mt-6 bg-red-50 rounded-xl p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm text-gray-700">총 미납 학생</Text>
              <Text className="text-sm font-bold text-gray-800">{safeStudents.length}명</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-gray-700">총 미납 금액</Text>
              <Text className="text-base font-bold text-red-600">
                {formatCurrency(totalUnpaid)}
              </Text>
            </View>
          </View>

          {/* 안내 메시지 */}
          <View className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <View className="flex-row items-start">
              <Ionicons name="alert-circle" size={20} color={TEACHER_COLORS.warning[600]} />
              <View className="flex-1 ml-2">
                <Text className="text-sm text-gray-700 leading-5">
                  메시지 아이콘을 눌러 학부모님께 수강료 안내 알림장을 보내세요. 정기적인 안내가 중요합니다.
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </BottomSheet>
  );
}
