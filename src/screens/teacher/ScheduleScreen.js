// src/screens/teacher/ScheduleScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { Text, ScreenHeader } from '../../components/common';
import TEACHER_COLORS from '../../styles/teacher_colors';
import { useAuthStore } from '../../store';
import {
  getSchedulesByDate,
  updateStudentSchedule,
  getScheduleChangeRequests,
  approveScheduleChangeRequest,
  rejectScheduleChangeRequest,
} from '../../services/scheduleService';

export default function ScheduleScreen({ navigation }) {
  const { user } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [schedules, setSchedules] = useState([]);
  const [changeRequests, setChangeRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [requestsModalVisible, setRequestsModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newSchedule, setNewSchedule] = useState('');

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    try {
      setLoading(true);

      // 선택한 날짜의 일정 가져오기
      const date = new Date(selectedDate);
      const schedulesResult = await getSchedulesByDate(user.uid, date);

      if (schedulesResult.success) {
        setSchedules(schedulesResult.schedules);
      }

      // 시간 변경 요청 가져오기
      const requestsResult = await getScheduleChangeRequests(user.uid, 'teacher');

      if (requestsResult.success) {
        const pendingRequests = requestsResult.requests.filter(
          (req) => req.status === 'pending'
        );
        setChangeRequests(pendingRequests);
      }
    } catch (error) {
      console.error('데이터 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleEditSchedule = (schedule) => {
    setSelectedStudent(schedule);
    setNewSchedule(schedule.fullSchedule || '');
    setEditModalVisible(true);
  };

  const handleSaveSchedule = async () => {
    if (!newSchedule.trim()) {
      Alert.alert('오류', '일정을 입력해주세요.');
      return;
    }

    try {
      const result = await updateStudentSchedule(selectedStudent.studentId, newSchedule);

      if (result.success) {
        Alert.alert('성공', '일정이 수정되었습니다.');
        setEditModalVisible(false);
        loadData();
      } else {
        Alert.alert('오류', result.error || '일정 수정에 실패했습니다.');
      }
    } catch (error) {
      Alert.alert('오류', '일정 수정 중 오류가 발생했습니다.');
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      const result = await approveScheduleChangeRequest(requestId);

      if (result.success) {
        Alert.alert('승인 완료', '시간 변경 요청을 승인했습니다.');
        loadData();
      } else {
        Alert.alert('오류', result.error || '승인에 실패했습니다.');
      }
    } catch (error) {
      Alert.alert('오류', '승인 중 오류가 발생했습니다.');
    }
  };

  const handleRejectRequest = async (requestId) => {
    Alert.prompt(
      '거절 사유',
      '거절 사유를 입력해주세요 (선택사항)',
      async (reason) => {
        try {
          const result = await rejectScheduleChangeRequest(requestId, reason);

          if (result.success) {
            Alert.alert('거절 완료', '시간 변경 요청을 거절했습니다.');
            loadData();
          } else {
            Alert.alert('오류', result.error || '거절에 실패했습니다.');
          }
        } catch (error) {
          Alert.alert('오류', '거절 중 오류가 발생했습니다.');
        }
      },
      'plain-text'
    );
  };

  // 캘린더에 표시할 마커
  const getMarkedDates = () => {
    const marked = {};

    // 선택한 날짜 표시
    marked[selectedDate] = {
      selected: true,
      selectedColor: TEACHER_COLORS.primary.DEFAULT,
    };

    return marked;
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScreenHeader title="수업 일정" showBackButton={false} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={TEACHER_COLORS.primary.DEFAULT} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScreenHeader
        title="수업 일정"
        showBackButton={false}
        rightButton={
          changeRequests.length > 0 && (
            <TouchableOpacity
              onPress={() => setRequestsModalVisible(true)}
              className="relative"
            >
              <Ionicons name="notifications" size={24} color="white" />
              <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
                <Text className="text-white text-xs font-bold">
                  {changeRequests.length}
                </Text>
              </View>
            </TouchableOpacity>
          )
        }
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 캘린더 */}
        <View className="bg-white mb-4">
          <Calendar
            current={selectedDate}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={getMarkedDates()}
            theme={{
              todayTextColor: TEACHER_COLORS.primary.DEFAULT,
              selectedDayBackgroundColor: TEACHER_COLORS.primary.DEFAULT,
              selectedDayTextColor: '#ffffff',
              arrowColor: TEACHER_COLORS.primary.DEFAULT,
              monthTextColor: TEACHER_COLORS.gray[800],
              textMonthFontWeight: 'bold',
              textDayFontSize: 16,
              textMonthFontSize: 18,
            }}
          />
        </View>

        {/* 선택한 날짜의 수업 목록 */}
        <View className="px-5 pb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-gray-800">
              {new Date(selectedDate).toLocaleDateString('ko-KR', {
                month: 'long',
                day: 'numeric',
                weekday: 'short',
              })}
              {' 수업'}
            </Text>
            <View
              className="px-3 py-1 rounded-full"
              style={{ backgroundColor: TEACHER_COLORS.primary[100] }}
            >
              <Text
                className="text-sm font-bold"
                style={{ color: TEACHER_COLORS.primary[600] }}
              >
                {schedules.length}개
              </Text>
            </View>
          </View>

          {schedules.length > 0 ? (
            schedules.map((schedule, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleEditSchedule(schedule)}
                className="bg-white rounded-2xl p-4 mb-3"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 6,
                  elevation: 2,
                }}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-2">
                      <Text className="text-gray-800 font-bold text-lg mr-2">
                        {schedule.studentName}
                      </Text>
                      <View
                        className="px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: TEACHER_COLORS.blue[100] }}
                      >
                        <Text
                          className="text-xs font-bold"
                          style={{ color: TEACHER_COLORS.blue[600] }}
                        >
                          {schedule.level}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row items-center">
                      <Ionicons
                        name="time-outline"
                        size={16}
                        color={TEACHER_COLORS.gray[500]}
                      />
                      <Text className="text-gray-600 ml-1 text-base font-medium">
                        {schedule.time}
                      </Text>
                    </View>
                    {schedule.book && (
                      <View className="flex-row items-center mt-1">
                        <Ionicons
                          name="book-outline"
                          size={16}
                          color={TEACHER_COLORS.gray[500]}
                        />
                        <Text className="text-gray-500 ml-1 text-sm">
                          {schedule.book}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={24}
                    color={TEACHER_COLORS.gray[300]}
                  />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View
              className="bg-white rounded-2xl p-8 items-center"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <View
                className="bg-gray-100 rounded-full p-4 mb-3"
              >
                <Ionicons
                  name="calendar-outline"
                  size={40}
                  color={TEACHER_COLORS.gray[400]}
                />
              </View>
              <Text className="text-gray-500 font-medium">
                이 날은 수업이 없습니다
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 일정 수정 모달 */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6" style={{ maxHeight: '80%' }}>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-gray-800">일정 수정</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={28} color={TEACHER_COLORS.gray[600]} />
              </TouchableOpacity>
            </View>

            {selectedStudent && (
              <>
                <View className="mb-4">
                  <Text className="text-gray-600 font-medium mb-1">학생</Text>
                  <Text className="text-gray-800 text-lg font-bold">
                    {selectedStudent.studentName}
                  </Text>
                </View>

                <View className="mb-6">
                  <Text className="text-gray-600 font-medium mb-2">
                    수업 일정 (예: 월/수 14:00)
                  </Text>
                  <TextInput
                    value={newSchedule}
                    onChangeText={setNewSchedule}
                    placeholder="월/수 14:00"
                    className="bg-gray-50 rounded-xl p-4 text-base"
                    style={{
                      borderWidth: 1,
                      borderColor: TEACHER_COLORS.gray[200],
                    }}
                  />
                  <Text className="text-gray-500 text-sm mt-2">
                    형식: 요일/요일 시간 (예: 월/수 14:00, 화 15:30)
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={handleSaveSchedule}
                  className="rounded-2xl py-4"
                  style={{ backgroundColor: TEACHER_COLORS.primary.DEFAULT }}
                >
                  <Text className="text-white text-center font-bold text-base">
                    저장
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* 시간 변경 요청 모달 */}
      <Modal
        visible={requestsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setRequestsModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6" style={{ maxHeight: '80%' }}>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-gray-800">
                시간 변경 요청 ({changeRequests.length})
              </Text>
              <TouchableOpacity onPress={() => setRequestsModalVisible(false)}>
                <Ionicons name="close" size={28} color={TEACHER_COLORS.gray[600]} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {changeRequests.map((request) => (
                <View
                  key={request.id}
                  className="bg-gray-50 rounded-2xl p-4 mb-3"
                  style={{
                    borderWidth: 1,
                    borderColor: TEACHER_COLORS.gray[200],
                  }}
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <View>
                      <Text className="text-gray-800 font-bold text-lg">
                        {request.studentName}
                      </Text>
                      <Text className="text-gray-500 text-sm">
                        {request.parentName} 학부모
                      </Text>
                    </View>
                    <View
                      className="px-3 py-1 rounded-full"
                      style={{ backgroundColor: TEACHER_COLORS.warning[100] }}
                    >
                      <Text
                        className="text-xs font-bold"
                        style={{ color: TEACHER_COLORS.warning[600] }}
                      >
                        대기중
                      </Text>
                    </View>
                  </View>

                  <View className="mb-3">
                    <View className="flex-row items-center mb-1">
                      <Text className="text-gray-600 font-medium w-20">현재:</Text>
                      <Text className="text-gray-800">
                        {request.currentSchedule}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Text className="text-gray-600 font-medium w-20">요청:</Text>
                      <Text
                        className="font-bold"
                        style={{ color: TEACHER_COLORS.primary.DEFAULT }}
                      >
                        {request.requestedSchedule}
                      </Text>
                    </View>
                  </View>

                  {request.reason && (
                    <View className="mb-3 p-3 bg-white rounded-xl">
                      <Text className="text-gray-600 text-sm font-medium mb-1">
                        사유
                      </Text>
                      <Text className="text-gray-700">{request.reason}</Text>
                    </View>
                  )}

                  <View className="flex-row space-x-2">
                    <TouchableOpacity
                      onPress={() => handleRejectRequest(request.id)}
                      className="flex-1 rounded-xl py-3 mr-2"
                      style={{
                        backgroundColor: TEACHER_COLORS.gray[200],
                      }}
                    >
                      <Text className="text-gray-700 text-center font-bold">
                        거절
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleApproveRequest(request.id)}
                      className="flex-1 rounded-xl py-3"
                      style={{
                        backgroundColor: TEACHER_COLORS.primary.DEFAULT,
                      }}
                    >
                      <Text className="text-white text-center font-bold">
                        승인
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {changeRequests.length === 0 && (
                <View className="items-center py-8">
                  <Text className="text-gray-500">대기중인 요청이 없습니다</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
