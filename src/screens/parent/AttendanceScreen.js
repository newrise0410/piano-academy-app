// src/screens/parent/AttendanceScreen.js
import React, { useState, useMemo, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../../components/common';
import PARENT_COLORS, { PARENT_GRADIENTS } from '../../styles/parent_colors';
import { getMonthName } from '../../utils';
import { getAttendanceByStudentId } from '../../services/firestoreService';
import { useAuthStore } from '../../store/authStore';

export default function AttendanceScreen() {
  const { user } = useAuthStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  // 출석 데이터 로드
  const loadAttendance = async () => {
    if (!user?.studentId) {
      setLoading(false);
      return;
    }

    try {
      const result = await getAttendanceByStudentId(user.studentId);
      if (result.success) {
        setAttendanceRecords(result.data);
      }
    } catch (error) {
      console.error('출석 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [user?.studentId]);

  const onRefresh = () => {
    setRefreshing(true);
    loadAttendance();
  };

  // 달력 날짜 생성
  const { days, startDay } = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // 월요일 시작

    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return { days, startDay };
  }, [year, month]);

  // 날짜별 출석 상태 가져오기
  const getAttendanceStatus = (day) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const record = attendanceRecords.find(r => r.date === dateStr);
    return record?.status || null;
  };

  // 통계 계산
  const stats = useMemo(() => {
    const total = attendanceRecords.length;
    const present = attendanceRecords.filter(r => r.status === 'present').length;
    const late = attendanceRecords.filter(r => r.status === 'late').length;
    const absent = attendanceRecords.filter(r => r.status === 'absent').length;
    const attendanceRate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

    // 연속 출석 계산
    let consecutiveAttendance = 0;
    const sortedRecords = [...attendanceRecords].sort((a, b) => new Date(b.date) - new Date(a.date));
    for (const record of sortedRecords) {
      if (record.status === 'present' || record.status === 'late') {
        consecutiveAttendance++;
      } else {
        break;
      }
    }

    return {
      attendanceRate: `${attendanceRate}%`,
      totalAttendance: present + late,
      consecutiveAttendance,
      absent,
    };
  }, [attendanceRecords]);

  const changeMonth = (delta) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDate(newDate);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color={PARENT_COLORS.primary.DEFAULT} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <SafeAreaView className="flex-1">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* 그라디언트 헤더 */}
          <LinearGradient
            colors={['#10B981', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingTop: 50, paddingBottom: 80 }}
          >
            <View className="px-5">
              <Text className="text-white text-3xl font-bold mb-2">출석 현황</Text>
              <View className="flex-row items-center">
                <Text className="text-white/80 text-sm">우리 아이의 출석 기록</Text>
                <View className="bg-white/20 rounded-full px-3 py-1 ml-3">
                  <Text className="text-white font-bold text-sm">{attendanceRecords.length}건</Text>
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* 플로팅 통계 카드 */}
          <View className="px-5" style={{ marginTop: -60 }}>
            <View
              className="bg-white rounded-3xl p-5 mb-4"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <View className="flex-row justify-around">
                <View className="items-center">
                  <View className="bg-green-100 rounded-full p-3 mb-2">
                    <Ionicons name="checkmark-circle" size={24} color={PARENT_COLORS.success[600]} />
                  </View>
                  <Text className="text-gray-500 text-xs mb-1">출석률</Text>
                  <Text className="text-gray-800 font-bold text-xl">{stats.attendanceRate}</Text>
                </View>

                <View className="items-center">
                  <View className="bg-blue-100 rounded-full p-3 mb-2">
                    <Ionicons name="calendar" size={24} color={PARENT_COLORS.blue[600]} />
                  </View>
                  <Text className="text-gray-500 text-xs mb-1">총 출석</Text>
                  <Text className="text-gray-800 font-bold text-xl">{stats.totalAttendance}회</Text>
                </View>

                <View className="items-center">
                  <View className="bg-orange-100 rounded-full p-3 mb-2">
                    <Ionicons name="flame" size={24} color={PARENT_COLORS.warning.DEFAULT} />
                  </View>
                  <Text className="text-gray-500 text-xs mb-1">연속 출석</Text>
                  <Text className="text-gray-800 font-bold text-xl">{stats.consecutiveAttendance}회</Text>
                </View>
              </View>
            </View>

            {/* 출석 달력 */}
            <View
              className="bg-white rounded-3xl p-5 mb-4"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              {/* 월 선택 헤더 */}
              <View className="flex-row items-center justify-between mb-5">
                <TouchableOpacity
                  onPress={() => changeMonth(-1)}
                  className="p-2 rounded-full"
                  style={{ backgroundColor: PARENT_COLORS.gray[100] }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chevron-back" size={20} color={PARENT_COLORS.gray[600]} />
                </TouchableOpacity>

                <Text className="text-gray-800 font-bold text-xl">
                  {year}년 {month}월
                </Text>

                <TouchableOpacity
                  onPress={() => changeMonth(1)}
                  className="p-2 rounded-full"
                  style={{ backgroundColor: PARENT_COLORS.gray[100] }}
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
              <View className="flex-row flex-wrap">
                {/* 빈 칸 채우기 */}
                {Array.from({ length: startDay }).map((_, index) => (
                  <View key={`empty-${index}`} className="w-[14.28%] p-1">
                    <View className="aspect-square" />
                  </View>
                ))}

                {/* 날짜 */}
                {days.map((day) => {
                  const today = new Date();
                  const isToday = year === today.getFullYear() &&
                                 month === today.getMonth() + 1 &&
                                 day === today.getDate();
                  const status = getAttendanceStatus(day);
                  const isPresent = status === 'present';
                  const isAbsent = status === 'absent';
                  const isLate = status === 'late';
                  const isMakeup = status === 'makeup';

                  return (
                    <View key={day} className="w-[14.28%] p-1">
                      <View
                        className="aspect-square items-center justify-center rounded-2xl"
                        style={{
                          backgroundColor: isToday ? PARENT_COLORS.primary.DEFAULT :
                                         isPresent ? PARENT_COLORS.success[100] :
                                         isLate ? PARENT_COLORS.warning.DEFAULT + '30' :
                                         isAbsent ? PARENT_COLORS.danger[100] :
                                         isMakeup ? PARENT_COLORS.blue[100] :
                                         'transparent'
                        }}
                      >
                        <Text
                          className="text-sm font-semibold"
                          style={{
                            color: isToday ? PARENT_COLORS.white :
                                  isPresent ? PARENT_COLORS.success[700] :
                                  isLate ? PARENT_COLORS.warning.DEFAULT :
                                  isAbsent ? PARENT_COLORS.danger[600] :
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
              <View className="flex-row flex-wrap justify-center pt-4 mt-4 border-t" style={{ borderColor: PARENT_COLORS.gray[200] }}>
                <View className="flex-row items-center mx-2 mb-2">
                  <View className="w-4 h-4 rounded mr-2" style={{ backgroundColor: PARENT_COLORS.success[100] }} />
                  <Text className="text-xs" style={{ color: PARENT_COLORS.gray[600] }}>출석</Text>
                </View>
                <View className="flex-row items-center mx-2 mb-2">
                  <View className="w-4 h-4 rounded mr-2" style={{ backgroundColor: PARENT_COLORS.warning.DEFAULT + '30' }} />
                  <Text className="text-xs" style={{ color: PARENT_COLORS.gray[600] }}>지각</Text>
                </View>
                <View className="flex-row items-center mx-2 mb-2">
                  <View className="w-4 h-4 rounded mr-2" style={{ backgroundColor: PARENT_COLORS.danger[100] }} />
                  <Text className="text-xs" style={{ color: PARENT_COLORS.gray[600] }}>결석</Text>
                </View>
                <View className="flex-row items-center mx-2 mb-2">
                  <View className="w-4 h-4 rounded mr-2" style={{ backgroundColor: PARENT_COLORS.blue[100] }} />
                  <Text className="text-xs" style={{ color: PARENT_COLORS.gray[600] }}>보강예정</Text>
                </View>
                <View className="flex-row items-center mx-2 mb-2">
                  <View className="w-4 h-4 rounded mr-2" style={{ backgroundColor: PARENT_COLORS.primary.DEFAULT }} />
                  <Text className="text-xs" style={{ color: PARENT_COLORS.gray[600] }}>오늘</Text>
                </View>
              </View>
            </View>

            {/* 최근 출석 기록 */}
            {attendanceRecords.length > 0 && (
              <View
                className="bg-white rounded-3xl p-5 mb-6"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <Text className="text-gray-800 font-bold text-lg mb-4">최근 출석 기록</Text>

                {attendanceRecords.slice(0, 5).map((record, index) => {
                  const statusConfig = {
                    present: { icon: 'checkmark-circle', color: PARENT_COLORS.success[600], bg: PARENT_COLORS.success[50], label: '출석' },
                    late: { icon: 'time', color: PARENT_COLORS.warning.DEFAULT, bg: PARENT_COLORS.warning.DEFAULT + '20', label: '지각' },
                    absent: { icon: 'close-circle', color: PARENT_COLORS.danger.DEFAULT, bg: PARENT_COLORS.danger[50], label: '결석' },
                    makeup: { icon: 'calendar', color: PARENT_COLORS.blue[600], bg: PARENT_COLORS.blue[50], label: '보강' },
                  };

                  const config = statusConfig[record.status] || statusConfig.present;

                  return (
                    <View
                      key={record.id || index}
                      className={`flex-row items-center ${index !== attendanceRecords.slice(0, 5).length - 1 ? 'mb-3 pb-3 border-b' : ''}`}
                      style={{ borderColor: PARENT_COLORS.gray[100] }}
                    >
                      <View
                        className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
                        style={{ backgroundColor: config.bg }}
                      >
                        <Ionicons name={config.icon} size={24} color={config.color} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-800 font-bold text-base mb-1">
                          {new Date(record.date).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </Text>
                        {record.note && (
                          <Text className="text-gray-500 text-sm">{record.note}</Text>
                        )}
                      </View>
                      <View
                        className="px-3 py-1 rounded-full"
                        style={{ backgroundColor: config.bg }}
                      >
                        <Text className="text-xs font-bold" style={{ color: config.color }}>
                          {config.label}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
