import React, { useState, useMemo, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, ScreenHeader, DatePickerModal } from '../../components/common';
import LessonNoteModal from '../../components/teacher/LessonNoteModal';
import TEACHER_COLORS from '../../styles/teacher_colors';
import { getMonthName, getDayOfWeek } from '../../utils';
import { getLevelColors, getAttendanceStatusColors } from '../../utils/styleHelpers';
import { useStudentStore, useAuthStore, useToastStore } from '../../store';
import { getMakeupLessons, saveMakeupLesson, updateMakeupLesson } from '../../services/firestoreService';
import { AttendanceRepository } from '../../repositories/AttendanceRepository';

export default function AttendanceScreen() {
  const { students, fetchStudents } = useStudentStore();
  const user = useAuthStore((state) => state.user);
  const toast = useToastStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState({}); // 접힌 그룹 관리
  const [makeupLessons, setMakeupLessons] = useState([]);
  const [loadingMakeup, setLoadingMakeup] = useState(false);
  const [showLessonNoteModal, setShowLessonNoteModal] = useState(false);
  const [selectedStudentForNote, setSelectedStudentForNote] = useState(null);

  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      await fetchStudents();
      fetchMakeupLessons();
    };
    loadData();
  }, [fetchStudents]);

  // students가 로드된 후 출석 기록 로드
  useEffect(() => {
    if (students.length > 0) {
      loadTodayAttendance();
    }
  }, [students.length, selectedDate]);

  // 오늘 날짜 출석 기록 로드
  const loadTodayAttendance = async () => {
    if (!user?.uid) return;

    try {
      const formatDate = (d) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const records = await AttendanceRepository.getByDate(formatDate(selectedDate));

      // 기존 출석 기록을 반영
      setAttendanceData(prev =>
        prev.map(student => {
          const record = records.find(r => r.studentId === student.id);
          return record ? { ...student, status: record.status } : student;
        })
      );
    } catch (error) {
      console.error('출석 기록 로드 실패:', error);
    }
  };

  // 보강 수업 데이터 가져오기
  const fetchMakeupLessons = async () => {
    if (!user?.uid) return;

    setLoadingMakeup(true);
    try {
      // 이번 주 보강 예정만 가져오기
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // 이번 주 일요일
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // 이번 주 토요일

      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const result = await getMakeupLessons(user.uid, {
        startDate: formatDate(startOfWeek),
        endDate: formatDate(endOfWeek),
      });

      if (result.success) {
        // pending 상태인 것만 필터링
        const pendingLessons = result.data.filter(lesson => lesson.status === 'pending');
        setMakeupLessons(pendingLessons);
      }
    } catch (error) {
      console.error('보강 수업 로드 실패:', error);
    } finally {
      setLoadingMakeup(false);
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
    return students
      .filter(student => {
        if (!student.schedule) return false;
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
  }, [selectedDate, students]);

  const [attendanceData, setAttendanceData] = useState(initialAttendance);
  const [lastSelectedDate, setLastSelectedDate] = useState(selectedDate);

  // selectedDate가 변경될 때만 attendanceData 리셋
  useEffect(() => {
    if (lastSelectedDate.getTime() !== selectedDate.getTime()) {
      console.log('날짜 변경됨 - 출석 데이터 리셋');
      setAttendanceData(initialAttendance);
      setLastSelectedDate(selectedDate);
    }
  }, [selectedDate]);

  // students가 로드되었을 때 초기 데이터 설정 (첫 로드만)
  useEffect(() => {
    if (students.length > 0 && attendanceData.length === 0) {
      console.log('학생 데이터 첫 로드');
      setAttendanceData(initialAttendance);
    }
  }, [students.length]);

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

  // 출석 상태 변경 및 Firebase 저장
  const handleStatusChange = async (studentId, status) => {
    // 로컬 상태 업데이트
    setAttendanceData(prev =>
      prev.map(student =>
        student.id === studentId ? { ...student, status } : student
      )
    );

    // Firebase에 저장
    if (user?.uid) {
      try {
        const student = attendanceData.find(s => s.id === studentId);
        const fullStudent = students.find(s => s.id === studentId);

        const formatDate = (date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        await AttendanceRepository.create({
          studentId,
          studentName: student?.name,
          date: formatDate(selectedDate),
          status,
          note: '',
        });

        // 회차권 학생일 경우 출석 시 횟수 차감
        if (status === 'present' && fullStudent?.ticketType === 'count') {
          const currentCount = fullStudent.ticketCount || 0;

          if (currentCount <= 0) {
            toast.warning(`${fullStudent.name} 학생의 회차권이 모두 소진되었습니다!`);
          } else {
            const newCount = currentCount - 1;
            const { updateStudent } = useStudentStore.getState();
            await updateStudent(studentId, { ticketCount: newCount });

            if (newCount === 0) {
              toast.warning(`${fullStudent.name} 학생의 회차권이 모두 소진되었습니다!`);
            } else if (newCount <= 2) {
              toast.warning(`${fullStudent.name} 학생의 남은 횟수: ${newCount}회`);
            } else {
              toast.success(`출석 체크 완료 (남은 횟수: ${newCount}회)`);
            }
          }
        }

        // 출석 처리 후 수업 일지 모달 열기
        if (status === 'present') {
          setSelectedStudentForNote(fullStudent);
          setShowLessonNoteModal(true);
        }
      } catch (error) {
        console.error('출석 데이터 저장 실패:', error);
        toast.error('출석 저장에 실패했습니다.');
      }
    }
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
  const onDateChange = async (event, date) => {
    if (date) {
      setSelectedDate(date);
      // 날짜가 변경되면 출석 데이터 리셋
      const newDay = getDayOfWeek(date);

      const newAttendance = students
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

      // Firebase에서 해당 날짜의 출석 기록 가져오기
      if (user?.uid) {
        try {
          const formatDate = (d) => {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          };

          const records = await AttendanceRepository.getByDate(formatDate(date));

          // 기존 출석 기록을 반영
          const attendanceWithRecords = newAttendance.map(student => {
            const record = records.find(r => r.studentId === student.id);
            return record ? { ...student, status: record.status } : student;
          });

          setAttendanceData(attendanceWithRecords);
        } catch (error) {
          console.error('출석 기록 로드 실패:', error);
          setAttendanceData(newAttendance);
        }
      } else {
        setAttendanceData(newAttendance);
      }
    }
  };

  // 보강 완료 처리
  const handleCompleteMakeup = async (makeupId) => {
    if (!user?.uid) return;

    try {
      await updateMakeupLesson(makeupId, { status: 'completed' });

      // 로컬 상태 업데이트
      setMakeupLessons(prev => prev.filter(lesson => lesson.id !== makeupId));

      toast.success('보강 수업이 완료 처리되었습니다.');
    } catch (error) {
      console.error('보강 완료 처리 실패:', error);
      toast.error('보강 완료 처리에 실패했습니다.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* 헤더 */}
      <ScreenHeader title="출석 체크" />

      <ScrollView className="flex-1">

        {/* 날짜 선택 */}
        <View className="px-5 mt-4 mb-4">
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
          {Object.keys(groupedByTime).length === 0 ? (
            <View className="bg-white rounded-2xl p-8 items-center">
              <Ionicons name="people-outline" size={64} color={TEACHER_COLORS.gray[300]} />
              <Text className="text-gray-500 mt-4 text-center">
                선택한 날짜에 수업이 있는 학생이 없습니다
              </Text>
              <Text className="text-gray-400 text-sm mt-2 text-center">
                다른 날짜를 선택해주세요
              </Text>
            </View>
          ) : (
            Object.entries(groupedByTime)
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
                    const levelColors = getLevelColors(student.level);
                    const statusColors = getAttendanceStatusColors(student.status);
                    return (
                      <View
                        key={student.id}
                        className="mb-3 rounded-2xl p-4"
                        style={{
                          backgroundColor: statusColors.bg,
                          borderWidth: statusColors.borderWidth,
                          borderColor: statusColors.border,
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
                  <View className="rounded-full px-2 py-1" style={{ backgroundColor: TEACHER_COLORS.danger[500] }}>
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
                    backgroundColor: student.status === 'absent' ? TEACHER_COLORS.danger[500] : TEACHER_COLORS.white,
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
            })
          )}
        </View>

        {/* 이번 주 보강 예정 */}
        <View className="px-5 mt-4 mb-20">
          <View className="rounded-2xl p-4 border" style={{ backgroundColor: TEACHER_COLORS.blue[50], borderColor: TEACHER_COLORS.blue[200] }}>
            <Text className="text-base font-bold text-gray-800 mb-3">이번 주 보강 예정</Text>
            {makeupLessons.length === 0 ? (
              <View className="py-8 items-center">
                <Ionicons name="calendar-outline" size={32} color={TEACHER_COLORS.gray[400]} />
                <Text className="text-sm text-gray-500 mt-2">예정된 보강 수업이 없습니다</Text>
              </View>
            ) : (
              makeupLessons.map((lesson) => {
                // 날짜 포맷팅 (YYYY-MM-DD -> MM/DD (요일))
                const formatDisplayDate = (dateStr) => {
                  const date = new Date(dateStr);
                  const month = date.getMonth() + 1;
                  const day = date.getDate();
                  const weekDay = getDayOfWeek(date);
                  return `${month}/${day} (${weekDay})`;
                };

                return (
                  <View
                    key={lesson.id}
                    className="bg-white rounded-xl p-3 mb-2 flex-row items-center justify-between"
                  >
                    <View>
                      <Text className="text-sm font-bold text-gray-800">{lesson.studentName}</Text>
                      <Text className="text-xs text-gray-600 mt-0.5">
                        {formatDisplayDate(lesson.date)} {lesson.time}
                      </Text>
                      {lesson.reason && (
                        <Text className="text-xs text-gray-500 mt-1">사유: {lesson.reason}</Text>
                      )}
                    </View>
                    <TouchableOpacity
                      className="rounded-lg px-3 py-1"
                      style={{ backgroundColor: TEACHER_COLORS.blue[100] }}
                      onPress={() => handleCompleteMakeup(lesson.id)}
                      activeOpacity={0.7}
                    >
                      <Text className="text-xs font-semibold" style={{ color: TEACHER_COLORS.blue[600] }}>완료 처리</Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>

      {/* 날짜 선택기 */}
      <DatePickerModal
        visible={showDatePicker}
        value={selectedDate}
        mode="date"
        onChange={onDateChange}
        onClose={() => setShowDatePicker(false)}
        title="날짜 선택"
      />

      {/* 수업 일지 모달 */}
      {selectedStudentForNote && (
        <LessonNoteModal
          visible={showLessonNoteModal}
          onClose={() => {
            setShowLessonNoteModal(false);
            setSelectedStudentForNote(null);
          }}
          student={selectedStudentForNote}
          date={(() => {
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDate.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          })()}
        />
      )}
    </SafeAreaView>
  );
}