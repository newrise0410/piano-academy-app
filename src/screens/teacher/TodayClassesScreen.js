import React, { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, LevelBadge, Button } from '../../components/common';
import TEACHER_COLORS from '../../styles/teacher_colors';
import { useStudentStore } from '../../store';

/**
 * TodayClassesScreen - 오늘 수업 전체보기 화면
 * BottomSheet 모달에서 "전체보기" 버튼으로 이동
 * 추가 기능: 출석 체크, 학생 상세 이동, 검색
 */
export default function TodayClassesScreen({ navigation }) {
  const { students, fetchStudents } = useStudentStore();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [attendance, setAttendance] = useState({}); // { studentId: 'present' | 'absent' | 'makeup' }

  // 새로고침
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStudents();
    setRefreshing(false);
  };

  // 오늘 수업 학생 필터링
  const todayStudents = useMemo(() => {
    const today = new Date().getDay();
    const dayMap = ['일', '월', '화', '수', '목', '금', '토'];
    const todayKorean = dayMap[today];

    return (students || []).filter(student => {
      const schedule = student.schedule || '';
      const matchesDay = schedule.includes(todayKorean);
      const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDay && matchesSearch;
    });
  }, [students, searchQuery]);

  // 시간대별 그룹화
  const groupedByTime = useMemo(() => {
    const groups = todayStudents.reduce((acc, student) => {
      const time = student.schedule?.split(' ')[1] || '시간 미정';
      if (!acc[time]) acc[time] = [];
      acc[time].push(student);
      return acc;
    }, {});

    // 시간순 정렬
    const sortedTimes = Object.keys(groups).sort();
    const sorted = {};
    sortedTimes.forEach(time => {
      sorted[time] = groups[time];
    });
    return sorted;
  }, [todayStudents]);

  // 출석 체크 핸들러
  const handleAttendance = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: prev[studentId] === status ? null : status,
    }));
  };

  // 출석 통계
  const stats = useMemo(() => {
    const total = todayStudents.length;
    const checked = Object.keys(attendance).length;
    const present = Object.values(attendance).filter(s => s === 'present').length;
    const absent = Object.values(attendance).filter(s => s === 'absent').length;
    const makeup = Object.values(attendance).filter(s => s === 'makeup').length;

    return { total, checked, present, absent, makeup };
  }, [todayStudents, attendance]);

  // 날짜 표시
  const todayDate = useMemo(() => {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const dayMap = ['일', '월', '화', '수', '목', '금', '토'];
    const dayOfWeek = dayMap[today.getDay()];
    return `${month}월 ${day}일 (${dayOfWeek})`;
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* 헤더 */}
      <View className="bg-white border-b border-gray-200 px-5 py-4">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="mr-3"
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color={TEACHER_COLORS.gray[800]} />
            </TouchableOpacity>
            <View>
              <Text className="text-xl font-bold text-gray-800">오늘 수업</Text>
              <Text className="text-sm text-gray-500 mt-0.5">{todayDate}</Text>
            </View>
          </View>
        </View>

        {/* 출석 통계 */}
        <View className="flex-row bg-gray-50 rounded-xl p-3">
          <View className="flex-1 items-center">
            <Text className="text-xs text-gray-500 mb-1">전체</Text>
            <Text className="text-lg font-bold text-gray-800">{stats.total}</Text>
          </View>
          <View className="w-px bg-gray-200" />
          <View className="flex-1 items-center">
            <Text className="text-xs text-gray-500 mb-1">출석</Text>
            <Text className="text-lg font-bold text-green-600">{stats.present}</Text>
          </View>
          <View className="w-px bg-gray-200" />
          <View className="flex-1 items-center">
            <Text className="text-xs text-gray-500 mb-1">결석</Text>
            <Text className="text-lg font-bold text-red-600">{stats.absent}</Text>
          </View>
          <View className="w-px bg-gray-200" />
          <View className="flex-1 items-center">
            <Text className="text-xs text-gray-500 mb-1">보강</Text>
            <Text className="text-lg font-bold text-orange-600">{stats.makeup}</Text>
          </View>
        </View>
      </View>

      {/* 학생 리스트 */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {todayStudents.length === 0 ? (
          <View className="py-20 items-center">
            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="calendar-outline" size={40} color={TEACHER_COLORS.gray[400]} />
            </View>
            <Text className="text-gray-500 text-center">
              오늘 예정된 수업이 없습니다
            </Text>
          </View>
        ) : (
          <View className="px-5 py-4">
            {Object.keys(groupedByTime).map((time, idx) => (
              <View key={time} className={idx > 0 ? 'mt-6' : ''}>
                {/* 시간대 헤더 */}
                <View className="flex-row items-center mb-3">
                  <View className="w-1 h-5 bg-primary rounded-full mr-2" />
                  <Text className="text-lg font-bold text-gray-800">{time}</Text>
                  <Text className="text-sm text-gray-500 ml-2">
                    ({groupedByTime[time].length}명)
                  </Text>
                </View>

                {/* 학생 카드 */}
                {groupedByTime[time].map((student) => {
                  const studentAttendance = attendance[student.id];

                  return (
                    <TouchableOpacity
                      key={student.id}
                      onPress={() => navigation.navigate('StudentDetail', { studentId: student.id })}
                      activeOpacity={0.7}
                      className="bg-white border border-gray-200 rounded-xl p-4 mb-3"
                    >
                      <View className="flex-row items-start justify-between mb-3">
                        <View className="flex-1">
                          {/* 학생 정보 */}
                          <View className="flex-row items-center mb-2">
                            <Text className="text-base font-bold text-gray-800 mr-2">
                              {student.name}
                            </Text>
                            <LevelBadge level={student.level} />
                          </View>

                          <View className="flex-row items-center mb-1">
                            <Ionicons name="book-outline" size={14} color={TEACHER_COLORS.gray[500]} />
                            <Text className="text-sm text-gray-600 ml-1">
                              {student.book || '교재 미정'}
                            </Text>
                          </View>

                          {student.ticketType === 'count' && (
                            <View className="flex-row items-center">
                              <Ionicons name="ticket-outline" size={14} color={TEACHER_COLORS.gray[500]} />
                              <Text className="text-sm text-gray-600 ml-1">
                                남은 횟수: {student.ticketCount}회
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>

                      {/* 출석 체크 버튼 */}
                      <View className="flex-row gap-2">
                        <TouchableOpacity
                          onPress={() => handleAttendance(student.id, 'present')}
                          className={`flex-1 flex-row items-center justify-center py-2.5 rounded-lg ${
                            studentAttendance === 'present' ? 'bg-green-600' : 'bg-green-50'
                          }`}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name="checkmark-circle"
                            size={18}
                            color={studentAttendance === 'present' ? '#FFFFFF' : TEACHER_COLORS.success[600]}
                          />
                          <Text
                            className={`ml-1 text-sm font-semibold ${
                              studentAttendance === 'present' ? 'text-white' : 'text-green-600'
                            }`}
                          >
                            출석
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => handleAttendance(student.id, 'absent')}
                          className={`flex-1 flex-row items-center justify-center py-2.5 rounded-lg ${
                            studentAttendance === 'absent' ? 'bg-red-600' : 'bg-red-50'
                          }`}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name="close-circle"
                            size={18}
                            color={studentAttendance === 'absent' ? '#FFFFFF' : TEACHER_COLORS.red[600]}
                          />
                          <Text
                            className={`ml-1 text-sm font-semibold ${
                              studentAttendance === 'absent' ? 'text-white' : 'text-red-600'
                            }`}
                          >
                            결석
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => handleAttendance(student.id, 'makeup')}
                          className={`flex-1 flex-row items-center justify-center py-2.5 rounded-lg ${
                            studentAttendance === 'makeup' ? 'bg-orange-600' : 'bg-orange-50'
                          }`}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name="repeat"
                            size={18}
                            color={studentAttendance === 'makeup' ? '#FFFFFF' : TEACHER_COLORS.orange[600]}
                          />
                          <Text
                            className={`ml-1 text-sm font-semibold ${
                              studentAttendance === 'makeup' ? 'text-white' : 'text-orange-600'
                            }`}
                          >
                            보강
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* 하단 저장 버튼 */}
      {stats.checked > 0 && (
        <View className="bg-white border-t border-gray-200 px-5 py-4">
          <Button
            title={`출석 저장 (${stats.checked}/${stats.total})`}
            icon="save"
            variant="primary"
            onPress={() => {
              // TODO: 출석 저장 API 호출
              navigation.goBack();
            }}
          />
        </View>
      )}
    </SafeAreaView>
  );
}
