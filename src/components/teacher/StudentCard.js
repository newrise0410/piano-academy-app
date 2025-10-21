import React, { useMemo } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from '../common/Text';
import { getTicketColor, getAttendanceColor } from '../../utils/styleHelpers';

const StudentCard = React.memo(({ student, onPress }) => {
  // 레벨별 색상 매핑 (useMemo로 최적화)
  const levelColors = useMemo(() => {
    const getLevelColors = (level) => {
      switch (level) {
        case '초급':
          return {
            bg: '#EFF6FF',
            text: '#2563EB',
            iconBg: '#DBEAFE',
            gradient: ['#EFF6FF', '#DBEAFE']
          };
        case '중급':
          return {
            bg: '#FAF5FF',
            text: '#7C3AED',
            iconBg: '#E9D5FF',
            gradient: ['#FAF5FF', '#E9D5FF']
          };
        case '고급':
          return {
            bg: '#FFF7ED',
            text: '#EA580C',
            iconBg: '#FED7AA',
            gradient: ['#FFF7ED', '#FED7AA']
          };
        default:
          return {
            bg: '#F9FAFB',
            text: '#6B7280',
            iconBg: '#F3F4F6',
            gradient: ['#F9FAFB', '#F3F4F6']
          };
      }
    };
    return getLevelColors(student.level);
  }, [student.level]);

  // 수강권 표시 (useMemo로 최적화)
  const ticketDisplay = useMemo(() => {
    if (student.ticketType === 'count') {
      return `${student.ticketCount}회`;
    } else if (student.ticketType === 'period') {
      return `${student.ticketPeriod.start}~${student.ticketPeriod.end}`;
    }
    return '-';
  }, [student.ticketType, student.ticketCount, student.ticketPeriod]);

  // 수강권 색상 (useMemo로 최적화)
  const ticketColorValue = useMemo(() => {
    return getTicketColor(student);
  }, [student.ticketType, student.ticketCount]);

  // 출석률 색상 (useMemo로 최적화)
  const attendanceColorValue = useMemo(() => {
    return getAttendanceColor(student.attendance);
  }, [student.attendance]);

  return (
    <TouchableOpacity
      className={`rounded-2xl mb-2.5 overflow-hidden ${
        student.unpaid ? 'border-2 border-red-400' : ''
      }`}
      activeOpacity={0.7}
      onPress={onPress}
      style={{
        backgroundColor: student.unpaid ? '#FEF2F2' : 'white',
        shadowColor: student.unpaid ? '#EF4444' : '#8B5CF6',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: student.unpaid ? 0.15 : 0.06,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      {/* 상단 색상 바 */}
      <View
        className="h-1"
        style={{ backgroundColor: student.unpaid ? '#EF4444' : levelColors.text }}
      />

      <View className="p-3.5">
        {/* 이름과 레벨 */}
        <View className="flex-row justify-between items-center mb-2.5">
          <View className="flex-row items-center flex-1">
            <View
              className="w-10 h-10 rounded-xl items-center justify-center mr-2.5"
              style={{ backgroundColor: levelColors.iconBg }}
            >
              <Ionicons name="person" size={20} color={levelColors.text} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-gray-800 mb-0.5">
                {student.name}
              </Text>
              <View className="flex-row items-center">
                <View
                  className="rounded-full px-2 py-0.5 mr-1.5"
                  style={{ backgroundColor: levelColors.bg }}
                >
                  <Text
                    className="text-xs font-bold"
                    style={{ color: levelColors.text }}
                  >
                    {student.level}
                  </Text>
                </View>
                {student.category && (
                  <View className="bg-gray-100 rounded-full px-2 py-0.5">
                    <Text className="text-xs font-semibold text-gray-600">
                      {student.category}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
          {student.unpaid && (
            <View className="bg-red-500 rounded-full px-2.5 py-1 ml-2">
              <Text className="text-xs font-bold text-white">미납</Text>
            </View>
          )}
        </View>

        {/* 수업 일정 */}
        {student.schedule && (
          <View className="flex-row items-center mb-2.5 bg-gray-50 rounded-lg p-2">
            <View className="w-6 h-6 bg-primary rounded-md items-center justify-center mr-2">
              <Ionicons name="time" size={14} color="white" />
            </View>
            <Text className="text-xs font-semibold text-gray-700">
              {student.schedule}
            </Text>
          </View>
        )}

        {/* 진도 및 현황 */}
        <View className="flex-row justify-between items-stretch">
          {student.book && (
            <View className="flex-1 bg-purple-50 rounded-lg p-2 mr-1">
              <View className="flex-row items-center mb-0.5">
                <Ionicons name="book" size={12} color="#8B5CF6" />
                <Text className="text-xs text-gray-600 ml-1 font-semibold">진도</Text>
              </View>
              <Text className="text-xs font-bold text-gray-800">{student.book}</Text>
            </View>
          )}
          {student.attendance && (
            <View className="flex-1 bg-blue-50 rounded-lg p-2 mx-1">
              <View className="flex-row items-center mb-0.5">
                <Ionicons name="checkmark-circle" size={12} color={attendanceColorValue} />
                <Text className="text-xs text-gray-600 ml-1 font-semibold">출석</Text>
              </View>
              <Text
                className="text-xs font-bold"
                style={{ color: attendanceColorValue }}
              >
                {student.attendance}
              </Text>
            </View>
          )}
          <View className="flex-1 bg-green-50 rounded-lg p-2 ml-1">
            <View className="flex-row items-center mb-0.5">
              <Ionicons name={student.ticketType === 'period' ? 'calendar' : 'ticket'} size={12} color={ticketColorValue} />
              <Text className="text-xs text-gray-600 ml-1 font-semibold">
                {student.ticketType === 'period' ? '기간' : '권'}
              </Text>
            </View>
            <Text
              className="text-xs font-bold"
              style={{ color: ticketColorValue }}
            >
              {ticketDisplay}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

StudentCard.displayName = 'StudentCard';

export default StudentCard;
