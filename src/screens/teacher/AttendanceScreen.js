import React, { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Text from '../../components/common/Text';
import { mockStudents } from '../../data/mockStudents';
import TEACHER_COLORS from '../../styles/teacher_colors';
import { getMonthName, getDayOfWeek } from '../../utils';

export default function AttendanceScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState({}); // 접힌 그룹 관리

  // 레벨별 색상 매핑 (StudentCard와 동일)
  const getLevelColors = (level) => {
    switch (level) {
      case '초급':
        return { bg: TEACHER_COLORS.blue[50], text: TEACHER_COLORS.blue[600] };
      case '중급':
        return { bg: TEACHER_COLORS.purple[50], text: TEACHER_COLORS.primary[600] };
      case '고급':
        return { bg: TEACHER_COLORS.orange[50], text: TEACHER_COLORS.orange[600] };
      default:
        return { bg: TEACHER_COLORS.gray[50], text: TEACHER_COLORS.gray[600] };
    }
  };

  // 선택한 날짜의 요일 구하기
  const getSelectedDayOfWeek = () => {
    return getDayOfWeek(selectedDate);
  };

  // 날짜 포맷팅
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekDay = getDayOfWeek(date);

    return `${year}년 ${month}월 ${day}일 (${weekDay})`;
  };

  // 실제 학생 데이터에서 출석 데이터 생성 (선택한 날짜 기준)
  const initialAttendance = useMemo(() => {
    const selectedDay = getSelectedDayOfWeek();

    // 선택한 요일에 수업이 있는 학생만 필터링
    return mockStudents
      .filter(student => {
        const scheduleDays = student.schedule.split(' ')[0].split('/');
        return scheduleDays.includes(selectedDay);
      })
      .map((student, index) => ({
        id: student.id,
        name: student.name,
        level: student.level,
        time: student.schedule, // 실제 스케줄 사용
        status: null, // 초기값은 모두 미체크
      }));
  }, [selectedDate]);

  const [attendanceData, setAttendanceData] = useState(initialAttendance);

  // 시간대별 그룹핑
  const groupedByTime = useMemo(() => {
    const groups = {};
    attendanceData.forEach(student => {
      const timeSlot = student.time.split(' ')[1] || '시간 미정'; // "월/수 16:00" → "16:00"
      if (!groups[timeSlot]) {
        groups[timeSlot] = [];
      }
      groups[timeSlot].push(student);
    });
    return groups;
  }, [attendanceData]);

  // 전체 진행률 계산
  const progressStats = useMemo(() => {
    const total = attendanceData.length;
    const checked = attendanceData.filter(s => s.status !== null).length;
    const present = attendanceData.filter(s => s.status === 'present').length;
    const absent = attendanceData.filter(s => s.status === 'absent').length;
    const makeup = attendanceData.filter(s => s.status === 'makeup').length;

    return {
      total,
      checked,
      present,
      absent,
      makeup,
      percentage: total > 0 ? Math.round((checked / total) * 100) : 0,
    };
  }, [attendanceData]);

  const [makeupLessons, setMakeupLessons] = useState([
    {
      id: '1',
      name: '이준호',
      date: '10/17 (목)',
      time: '15:00',
    },
  ]);

  // 출석 상태 변경
  const handleStatusChange = (studentId, status) => {
    setAttendanceData(prev =>
      prev.map(student =>
        student.id === studentId ? { ...student, status } : student
      )
    );
  };

  // 전체 출석 처리
  const handleMarkAllPresent = () => {
    setAttendanceData(prev =>
      prev.map(student => ({ ...student, status: 'present' }))
    );
  };

  // 미체크만 출석 처리
  const handleMarkUncheckedPresent = () => {
    setAttendanceData(prev =>
      prev.map(student =>
        student.status === null ? { ...student, status: 'present' } : student
      )
    );
  };

  // 그룹 토글
  const toggleGroup = (timeSlot) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [timeSlot]: !prev[timeSlot]
    }));
  };

  // 날짜 변경
  const handleDateChange = () => {
    setShowDatePicker(true);
  };

  // 날짜 선택 완료
  const onDateChange = (event, date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (date) {
      setSelectedDate(date);
      // 날짜가 변경되면 출석 데이터 리셋
      const newDay = getDayOfWeek(date);

      const newAttendance = mockStudents
        .filter(student => {
          const scheduleDays = student.schedule.split(' ')[0].split('/');
          return scheduleDays.includes(newDay);
        })
        .map(student => ({
          id: student.id,
          name: student.name,
          level: student.level,
          time: student.schedule,
          status: null,
        }));

      setAttendanceData(newAttendance);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* 헤더 */}
      <View className="bg-primary px-5 py-4">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Ionicons name="calendar" size={24} color="white" />
            <Text className="text-white text-xl font-bold ml-2">피아노 학원 관리</Text>
          </View>
          <Ionicons name="menu" size={28} color="white" />
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* 출석 제크 화면 헤더 */}
        <View className="px-5 mt-4 mb-3">
          <Text className="text-base text-gray-600">출석 제크 화면</Text>
        </View>

        {/* 날짜 선택 */}
        <View className="px-5 mb-4">
          <View className="bg-white rounded-2xl p-4 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={20} color={TEACHER_COLORS.primary.DEFAULT} />
              <Text className="text-lg font-bold text-gray-800 ml-2">
                {formatDate(selectedDate)}
              </Text>
            </View>
            <TouchableOpacity
              className="flex-row items-center"
              onPress={handleDateChange}
              activeOpacity={0.7}
            >
              <Text className="text-primary text-sm font-semibold mr-1">날짜 변경</Text>
              <Ionicons name="chevron-forward" size={16} color={TEACHER_COLORS.primary.DEFAULT} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 진행률 카드 */}
        <View className="px-5 mb-4">
          <View className="bg-primary rounded-2xl p-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-white text-base font-bold">출석 체크 진행률</Text>
              <Text className="text-white text-2xl font-bold">{progressStats.percentage}%</Text>
            </View>

            {/* 프로그레스 바 */}
            <View className="bg-white rounded-full h-2 mb-3 overflow-hidden" style={{ opacity: 0.3 }}>
              <View
                className="bg-white h-full rounded-full"
                style={{ width: `${progressStats.percentage}%`, opacity: 1 }}
              />
            </View>

            {/* 통계 */}
            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-white text-xs" style={{ opacity: 0.8 }}>체크 완료</Text>
                <Text className="text-white text-lg font-bold">{progressStats.checked}/{progressStats.total}</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-xs" style={{ opacity: 0.8 }}>출석</Text>
                <Text className="text-white text-lg font-bold">{progressStats.present}명</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-xs" style={{ opacity: 0.8 }}>결석</Text>
                <Text className="text-white text-lg font-bold">{progressStats.absent}명</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-xs" style={{ opacity: 0.8 }}>보강</Text>
                <Text className="text-white text-lg font-bold">{progressStats.makeup}명</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 일괄 처리 버튼 */}
        <View className="px-5 mb-4 flex-row">
          <TouchableOpacity
            className="flex-1 rounded-xl py-3 mr-2"
            style={{ backgroundColor: TEACHER_COLORS.green[500] }}
            onPress={handleMarkAllPresent}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="checkmark-done" size={18} color="white" />
              <Text className="text-white text-sm font-bold ml-1">전체 출석</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 rounded-xl py-3 ml-2"
            style={{ backgroundColor: TEACHER_COLORS.blue[500] }}
            onPress={handleMarkUncheckedPresent}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="checkmark" size={18} color="white" />
              <Text className="text-white text-sm font-bold ml-1">미체크만 출석</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 시간대별 출석 카드 목록 */}
        <View className="px-5">
          {Object.entries(groupedByTime)
            .sort(([timeA], [timeB]) => timeA.localeCompare(timeB))
            .map(([timeSlot, students]) => {
              const isCollapsed = collapsedGroups[timeSlot];
              const groupChecked = students.filter(s => s.status !== null).length;
              const groupTotal = students.length;

              return (
                <View key={timeSlot} className="mb-4">
                  {/* 시간대 헤더 */}
                  <TouchableOpacity
                    className="rounded-xl p-3 mb-2 flex-row items-center justify-between"
                    style={{ backgroundColor: TEACHER_COLORS.purple[100] }}
                    onPress={() => toggleGroup(timeSlot)}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center">
                      <Ionicons name="time" size={20} color={TEACHER_COLORS.primary.DEFAULT} />
                      <Text className="text-primary text-base font-bold ml-2">{timeSlot}</Text>
                      <View className="bg-white rounded-full px-2 py-0.5 ml-2">
                        <Text className="text-primary text-xs font-semibold">
                          {groupChecked}/{groupTotal}
                        </Text>
                      </View>
                    </View>
                    <Ionicons
                      name={isCollapsed ? "chevron-down" : "chevron-up"}
                      size={20}
                      color={TEACHER_COLORS.primary.DEFAULT}
                    />
                  </TouchableOpacity>

                  {/* 학생 목록 */}
                  {!isCollapsed && students.map((student) => {
                    const isUnchecked = student.status === null;
                    const levelColors = getLevelColors(student.level);
                    return (
                      <View
                        key={student.id}
                        className="mb-3 rounded-2xl p-4"
                        style={{
                          backgroundColor: student.status === 'present' ? TEACHER_COLORS.green[50] :
                                          student.status === 'absent' ? TEACHER_COLORS.red[50] :
                                          isUnchecked ? '#FEFCE8' :
                                          TEACHER_COLORS.white,
                          borderWidth: isUnchecked ? 2 : 1,
                          borderColor: student.status === 'present' ? TEACHER_COLORS.green[200] :
                                      student.status === 'absent' ? TEACHER_COLORS.red[200] :
                                      isUnchecked ? '#FDE047' :
                                      TEACHER_COLORS.gray[200]
                        }}
                      >
              {/* 학생 정보 */}
              <View className="flex-row items-center justify-between mb-3">
                <View>
                  <View className="flex-row items-center mb-1">
                    <Text className="text-lg font-bold text-gray-800 mr-2">
                      {student.name}
                    </Text>
                    <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: levelColors.bg }}>
                      <Text className="text-xs font-bold" style={{ color: levelColors.text }}>{student.level}</Text>
                    </View>
                  </View>
                  <Text className="text-sm text-gray-600">{student.time}</Text>
                </View>
                {student.status === 'present' && (
                  <Ionicons name="checkmark-circle" size={28} color={TEACHER_COLORS.success.DEFAULT} />
                )}
                {student.status === 'absent' && (
                  <View className="rounded-full px-2 py-1" style={{ backgroundColor: TEACHER_COLORS.red[500] }}>
                    <Text className="text-xs font-bold text-white">결석</Text>
                  </View>
                )}
              </View>

              {/* 출석 버튼 */}
              <View className="flex-row">
                <TouchableOpacity
                  className="flex-1 rounded-xl py-3 mr-2"
                  style={{
                    backgroundColor: student.status === 'present' ? TEACHER_COLORS.green[500] : TEACHER_COLORS.white,
                    borderWidth: student.status === 'present' ? 0 : 1,
                    borderColor: TEACHER_COLORS.gray[200]
                  }}
                  onPress={() => handleStatusChange(student.id, 'present')}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color={student.status === 'present' ? TEACHER_COLORS.white : TEACHER_COLORS.gray[600]}
                    />
                    <Text
                      className="text-sm font-bold ml-1"
                      style={{ color: student.status === 'present' ? TEACHER_COLORS.white : TEACHER_COLORS.gray[600] }}
                    >
                      출석
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 rounded-xl py-3 mx-1"
                  style={{
                    backgroundColor: student.status === 'absent' ? TEACHER_COLORS.red[500] : TEACHER_COLORS.white,
                    borderWidth: student.status === 'absent' ? 0 : 1,
                    borderColor: TEACHER_COLORS.gray[200]
                  }}
                  onPress={() => handleStatusChange(student.id, 'absent')}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons
                      name="close"
                      size={18}
                      color={student.status === 'absent' ? TEACHER_COLORS.white : TEACHER_COLORS.gray[600]}
                    />
                    <Text
                      className="text-sm font-bold ml-1"
                      style={{ color: student.status === 'absent' ? TEACHER_COLORS.white : TEACHER_COLORS.gray[600] }}
                    >
                      결석
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 rounded-xl py-3 ml-2"
                  style={{
                    backgroundColor: student.status === 'makeup' ? TEACHER_COLORS.blue[500] : TEACHER_COLORS.white,
                    borderWidth: student.status === 'makeup' ? 0 : 1,
                    borderColor: TEACHER_COLORS.gray[200]
                  }}
                  onPress={() => handleStatusChange(student.id, 'makeup')}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons
                      name="calendar"
                      size={18}
                      color={student.status === 'makeup' ? TEACHER_COLORS.white : TEACHER_COLORS.gray[600]}
                    />
                    <Text
                      className="text-sm font-bold ml-1"
                      style={{ color: student.status === 'makeup' ? TEACHER_COLORS.white : TEACHER_COLORS.gray[600] }}
                    >
                      보강
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* 결석 시 보강 예약 버튼 */}
              {student.status === 'absent' && (
                <TouchableOpacity
                  className="mt-3 rounded-xl py-3"
                  style={{ backgroundColor: TEACHER_COLORS.blue[500] }}
                  activeOpacity={0.8}
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons name="calendar" size={18} color="white" />
                    <Text className="text-white text-sm font-bold ml-2">보강 일정 잡기</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
                    );
                  })}
                </View>
              );
            })}
        </View>

        {/* 이번 주 보강 예정 */}
        <View className="px-5 mt-4 mb-20">
          <View className="rounded-2xl p-4 border" style={{ backgroundColor: TEACHER_COLORS.blue[50], borderColor: TEACHER_COLORS.blue[200] }}>
            <Text className="text-base font-bold text-gray-800 mb-3">이번 주 보강 예정</Text>
            {makeupLessons.map((lesson) => (
              <View
                key={lesson.id}
                className="bg-white rounded-xl p-3 mb-2 flex-row items-center justify-between"
              >
                <View>
                  <Text className="text-sm font-bold text-gray-800">{lesson.name}</Text>
                  <Text className="text-xs text-gray-600 mt-0.5">
                    {lesson.date} {lesson.time}
                  </Text>
                </View>
                <TouchableOpacity className="rounded-lg px-3 py-1" style={{ backgroundColor: TEACHER_COLORS.blue[100] }}>
                  <Text className="text-xs font-semibold" style={{ color: TEACHER_COLORS.blue[600] }}>완료 처리</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* 날짜 선택기 */}
      {Platform.OS === 'ios' ? (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View className="flex-1 justify-end bg-black bg-opacity-50">
            <View className="bg-white rounded-t-3xl p-4">
              <View className="flex-row justify-between items-center mb-4">
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text className="text-primary text-base font-semibold">취소</Text>
                </TouchableOpacity>
                <Text className="text-lg font-bold text-gray-800">날짜 선택</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text className="text-primary text-base font-semibold">완료</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="spinner"
                onChange={onDateChange}
                locale="ko-KR"
              />
            </View>
          </View>
        </Modal>
      ) : (
        showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )
      )}
    </SafeAreaView>
  );
}