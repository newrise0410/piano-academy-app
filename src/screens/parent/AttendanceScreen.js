// src/screens/parent/AttendanceScreen.js
import React, { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Text from '../../components/common/Text';
import Card from '../../components/common/Card';
import StatBox from '../../components/common/StatBox';
import {
  childData,
  upcomingClasses,
  getMonthCalendar,
  getAttendanceStatus
} from '../../data/mockParentData';
import PARENT_COLORS, { PARENT_GRADIENTS, PARENT_SEMANTIC_COLORS, PARENT_OVERLAY_COLORS } from '../../styles/parent_colors';

export default function AttendanceScreen() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 16)); // 2025년 10월 16일

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const today = currentDate.getDate();

  const { days } = useMemo(() => getMonthCalendar(year, month), [year, month]);

  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

  const changeMonth = (delta) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDate(newDate);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 py-4">
          {/* 출석 통계 */}
          <Card>
            <Text className="text-lg font-bold text-gray-800 mb-4">출석 현황</Text>
            <View className="flex-row -mx-1">
              <StatBox
                icon="checkmark-circle"
                label="출석률"
                number={childData.attendanceRate}
                backgroundColor={PARENT_COLORS.success[50]}
                textColor={PARENT_COLORS.success[600]}
                iconColor={PARENT_COLORS.success.DEFAULT}
              />
              <StatBox
                icon="calendar"
                label="총 출석"
                number={`${childData.totalAttendance}회`}
                backgroundColor={PARENT_COLORS.blue[50]}
                textColor={PARENT_COLORS.blue[600]}
                iconColor={PARENT_COLORS.blue[500]}
              />
              <StatBox
                icon="flame"
                label="연속 출석"
                number={`${childData.consecutiveAttendance}회`}
                backgroundColor={PARENT_COLORS.primary[50]}
                textColor={PARENT_COLORS.primary.DEFAULT}
                iconColor={PARENT_COLORS.primary.DEFAULT}
              />
            </View>
          </Card>

          {/* 출석 달력 */}
          <Card className="mt-4">
            <View className="flex-row items-center justify-between mb-4">
              <TouchableOpacity
                onPress={() => changeMonth(-1)}
                className="p-2"
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-back" size={20} color={PARENT_COLORS.gray[600]} />
              </TouchableOpacity>

              <Text className="text-gray-800 font-bold text-lg">
                {year}년 {monthNames[month - 1]}
              </Text>

              <TouchableOpacity
                onPress={() => changeMonth(1)}
                className="p-2"
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-forward" size={20} color={PARENT_COLORS.gray[600]} />
              </TouchableOpacity>
            </View>

            {/* 요일 헤더 */}
            <View className="flex-row mb-2">
              {['월', '화', '수', '목', '금', '토', '일'].map(day => (
                <View key={day} className="flex-1 items-center">
                  <Text className="text-xs font-semibold" style={{ color: PARENT_COLORS.gray[500] }}>{day}</Text>
                </View>
              ))}
            </View>

            {/* 날짜 그리드 */}
            <View className="flex-row flex-wrap mb-4">
              {days.map((day) => {
                const isToday = year === 2025 && month === 10 && day === today;
                const status = getAttendanceStatus(year, month, day);
                const isAttended = status === 'present';
                const isAbsent = status === 'absent';
                const isLate = status === 'late';
                const isMakeup = status === 'makeup';

                return (
                  <View key={day} className="w-[14.28%] p-1">
                    <View
                      className="aspect-square items-center justify-center rounded-lg"
                      style={{
                        backgroundColor: isToday ? PARENT_COLORS.primary.DEFAULT :
                                       isAttended ? PARENT_COLORS.success[50] :
                                       isLate ? PARENT_COLORS.warning.DEFAULT + '30' :
                                       isAbsent ? PARENT_COLORS.danger.DEFAULT + '20' :
                                       isMakeup ? PARENT_COLORS.blue[50] :
                                       'transparent'
                      }}
                    >
                      <Text
                        className="text-sm font-semibold"
                        style={{
                          color: isToday ? PARENT_COLORS.white :
                                isAttended ? PARENT_COLORS.success[600] :
                                isLate ? PARENT_COLORS.warning.DEFAULT :
                                isAbsent ? PARENT_COLORS.danger.DEFAULT :
                                isMakeup ? PARENT_COLORS.blue[600] :
                                PARENT_COLORS.gray[400]
                        }}
                      >
                        {day}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* 범례 */}
            <View className="flex-row flex-wrap justify-center pt-3 border-t" style={{ borderColor: PARENT_COLORS.gray[200] }}>
              <View className="flex-row items-center mx-2 mb-1">
                <View className="w-3 h-3 rounded mr-1.5" style={{ backgroundColor: PARENT_COLORS.success[50] }} />
                <Text className="text-xs" style={{ color: PARENT_COLORS.gray[600] }}>출석</Text>
              </View>
              <View className="flex-row items-center mx-2 mb-1">
                <View className="w-3 h-3 rounded mr-1.5" style={{ backgroundColor: PARENT_COLORS.warning.DEFAULT + '30' }} />
                <Text className="text-xs" style={{ color: PARENT_COLORS.gray[600] }}>지각</Text>
              </View>
              <View className="flex-row items-center mx-2 mb-1">
                <View className="w-3 h-3 rounded mr-1.5" style={{ backgroundColor: PARENT_COLORS.danger.DEFAULT + '20' }} />
                <Text className="text-xs" style={{ color: PARENT_COLORS.gray[600] }}>결석</Text>
              </View>
              <View className="flex-row items-center mx-2 mb-1">
                <View className="w-3 h-3 rounded mr-1.5" style={{ backgroundColor: PARENT_COLORS.blue[50] }} />
                <Text className="text-xs" style={{ color: PARENT_COLORS.gray[600] }}>보강예정</Text>
              </View>
              <View className="flex-row items-center mx-2 mb-1">
                <View className="w-3 h-3 rounded mr-1.5" style={{ backgroundColor: PARENT_COLORS.primary.DEFAULT }} />
                <Text className="text-xs" style={{ color: PARENT_COLORS.gray[600] }}>오늘</Text>
              </View>
            </View>
          </Card>

          {/* 다음 수업 일정 */}
          <Card className="mt-4 mb-5">
            <Text className="text-gray-800 font-bold text-lg mb-4">다음 수업 일정</Text>

            {upcomingClasses.map((classItem, index) => (
              <View
                key={index}
                className={`rounded-xl p-3 border-l-4 ${index !== upcomingClasses.length - 1 ? 'mb-2' : ''}`}
                style={{
                  backgroundColor: PARENT_COLORS.gray[50],
                  borderLeftColor: classItem.isPrimary ? PARENT_COLORS.primary.DEFAULT : PARENT_COLORS.gray[300]
                }}
              >
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-gray-800 font-bold">{classItem.date}</Text>
                    <Text className="text-sm mt-0.5" style={{ color: PARENT_COLORS.gray[600] }}>{classItem.time}</Text>
                  </View>
                  <Ionicons
                    name="time"
                    size={20}
                    color={classItem.isPrimary ? PARENT_COLORS.primary.DEFAULT : PARENT_COLORS.gray[400]}
                  />
                </View>
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
