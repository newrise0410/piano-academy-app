// src/screens/parent/ScheduleScreen.js
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
import PARENT_COLORS from '../../styles/parent_colors';
import { useAuthStore } from '../../store';
import { getStudentById } from '../../services/firestoreService';
import {
  createScheduleChangeRequest,
  getScheduleChangeRequests,
} from '../../services/scheduleService';

export default function ScheduleScreen({ navigation }) {
  const { user } = useAuthStore();
  const [studentData, setStudentData] = useState(null);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [requestedSchedule, setRequestedSchedule] = useState('');
  const [requestReason, setRequestReason] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // 학생 정보 가져오기
      if (user?.studentId) {
        const studentResult = await getStudentById(user.studentId);
        if (studentResult.success) {
          setStudentData(studentResult.data);
        }
      }

      // 내가 보낸 요청 가져오기
      const requestsResult = await getScheduleChangeRequests(user.uid, 'parent');
      if (requestsResult.success) {
        setMyRequests(requestsResult.requests);
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

  const handleSubmitRequest = async () => {
    if (!requestedSchedule.trim()) {
      Alert.alert('오류', '변경 희망 일정을 입력해주세요.');
      return;
    }

    try {
      const result = await createScheduleChangeRequest({
        studentId: user.studentId,
        studentName: studentData.name,
        parentId: user.uid,
        parentName: user.name || user.displayName,
        teacherId: studentData.teacherId,
        currentSchedule: studentData.schedule || '일정 미정',
        requestedSchedule: requestedSchedule,
        reason: requestReason,
      });

      if (result.success) {
        Alert.alert('요청 완료', '시간 변경 요청이 전송되었습니다.\n선생님의 승인을 기다려주세요.');
        setRequestModalVisible(false);
        setRequestedSchedule('');
        setRequestReason('');
        loadData();
      } else {
        Alert.alert('오류', result.error || '요청 전송에 실패했습니다.');
      }
    } catch (error) {
      Alert.alert('오류', '요청 전송 중 오류가 발생했습니다.');
    }
  };

  // 수업 요일을 캘린더에 마킹
  const getMarkedDates = () => {
    const marked = {};

    if (studentData?.schedule) {
      const [days] = studentData.schedule.split(' ');
      const scheduleDays = days.split('/');

      // 요일을 숫자로 변환
      const dayMap = { '일': 0, '월': 1, '화': 2, '수': 3, '목': 4, '금': 5, '토': 6 };

      // 이번 달의 모든 날짜를 확인
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay();
        const dayName = Object.keys(dayMap).find(key => dayMap[key] === dayOfWeek);

        if (scheduleDays.includes(dayName)) {
          const dateString = date.toISOString().split('T')[0];
          marked[dateString] = {
            marked: true,
            dotColor: PARENT_COLORS.primary.DEFAULT,
          };
        }
      }
    }

    // 선택한 날짜 표시
    if (marked[selectedDate]) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: PARENT_COLORS.primary.DEFAULT,
      };
    } else {
      marked[selectedDate] = {
        selected: true,
        selectedColor: PARENT_COLORS.primary.DEFAULT,
      };
    }

    return marked;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return { bg: PARENT_COLORS.warning[100], text: PARENT_COLORS.warning[600], label: '대기중' };
      case 'approved':
        return { bg: PARENT_COLORS.success[100], text: PARENT_COLORS.success[600], label: '승인됨' };
      case 'rejected':
        return { bg: PARENT_COLORS.error[100], text: PARENT_COLORS.error[600], label: '거절됨' };
      default:
        return { bg: PARENT_COLORS.gray[100], text: PARENT_COLORS.gray[600], label: '알 수 없음' };
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScreenHeader title="수업 일정" colorScheme="parent" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={PARENT_COLORS.primary.DEFAULT} />
        </View>
      </SafeAreaView>
    );
  }

  if (!studentData) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScreenHeader title="수업 일정" colorScheme="parent" />
        <View className="flex-1 items-center justify-center px-5">
          <Text className="text-gray-500 text-center">
            등록된 자녀 정보가 없습니다
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScreenHeader title="수업 일정" colorScheme="parent" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 현재 일정 카드 */}
        <View className="px-5 pt-4 pb-2">
          <View
            className="bg-white rounded-3xl p-5"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-gray-800">
                {studentData.name}의 수업 일정
              </Text>
              <TouchableOpacity
                onPress={() => setRequestModalVisible(true)}
                className="px-3 py-2 rounded-xl"
                style={{ backgroundColor: PARENT_COLORS.primary.DEFAULT }}
              >
                <Text className="text-white font-bold text-sm">변경 요청</Text>
              </TouchableOpacity>
            </View>

            <View className="bg-gray-50 rounded-2xl p-4">
              <View className="flex-row items-center mb-2">
                <Ionicons
                  name="calendar"
                  size={20}
                  color={PARENT_COLORS.primary[600]}
                />
                <Text className="text-gray-700 font-semibold ml-2">현재 일정</Text>
              </View>
              <Text className="text-gray-900 text-xl font-bold">
                {studentData.schedule || '일정 미정'}
              </Text>
            </View>
          </View>
        </View>

        {/* 캘린더 */}
        <View className="bg-white my-4">
          <Calendar
            current={selectedDate}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={getMarkedDates()}
            theme={{
              todayTextColor: PARENT_COLORS.primary.DEFAULT,
              selectedDayBackgroundColor: PARENT_COLORS.primary.DEFAULT,
              selectedDayTextColor: '#ffffff',
              arrowColor: PARENT_COLORS.primary.DEFAULT,
              monthTextColor: PARENT_COLORS.gray[800],
              textMonthFontWeight: 'bold',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              dotColor: PARENT_COLORS.primary.DEFAULT,
              selectedDotColor: '#ffffff',
            }}
          />
          <View className="px-5 py-3 border-t border-gray-100">
            <View className="flex-row items-center">
              <View
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: PARENT_COLORS.primary.DEFAULT }}
              />
              <Text className="text-gray-600 text-sm">수업이 있는 날</Text>
            </View>
          </View>
        </View>

        {/* 내 요청 내역 */}
        <View className="px-5 pb-6">
          <Text className="text-lg font-bold text-gray-800 mb-3">요청 내역</Text>

          {myRequests.length > 0 ? (
            myRequests.map((request) => {
              const statusInfo = getStatusColor(request.status);
              return (
                <View
                  key={request.id}
                  className="bg-white rounded-2xl p-4 mb-3"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 6,
                    elevation: 2,
                  }}
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-gray-800 font-bold text-base">
                      {request.studentName}
                    </Text>
                    <View
                      className="px-3 py-1 rounded-full"
                      style={{ backgroundColor: statusInfo.bg }}
                    >
                      <Text
                        className="text-xs font-bold"
                        style={{ color: statusInfo.text }}
                      >
                        {statusInfo.label}
                      </Text>
                    </View>
                  </View>

                  <View className="mb-2">
                    <View className="flex-row items-center mb-1">
                      <Text className="text-gray-600 font-medium w-20">현재:</Text>
                      <Text className="text-gray-800">{request.currentSchedule}</Text>
                    </View>
                    <View className="flex-row items-center">
                      <Text className="text-gray-600 font-medium w-20">요청:</Text>
                      <Text
                        className="font-bold"
                        style={{ color: PARENT_COLORS.primary.DEFAULT }}
                      >
                        {request.requestedSchedule}
                      </Text>
                    </View>
                  </View>

                  {request.reason && (
                    <View className="bg-gray-50 rounded-xl p-3 mb-2">
                      <Text className="text-gray-600 text-sm font-medium mb-1">
                        사유
                      </Text>
                      <Text className="text-gray-700 text-sm">{request.reason}</Text>
                    </View>
                  )}

                  {request.rejectionReason && (
                    <View
                      className="rounded-xl p-3"
                      style={{ backgroundColor: PARENT_COLORS.error[50] }}
                    >
                      <Text
                        className="text-sm font-medium mb-1"
                        style={{ color: PARENT_COLORS.error[600] }}
                      >
                        거절 사유
                      </Text>
                      <Text className="text-gray-700 text-sm">
                        {request.rejectionReason}
                      </Text>
                    </View>
                  )}

                  <Text className="text-gray-400 text-xs mt-2">
                    {request.createdAt?.toDate?.()?.toLocaleDateString('ko-KR') || '날짜 없음'}
                  </Text>
                </View>
              );
            })
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
              <View className="bg-gray-100 rounded-full p-4 mb-3">
                <Ionicons
                  name="document-text-outline"
                  size={40}
                  color={PARENT_COLORS.gray[400]}
                />
              </View>
              <Text className="text-gray-500 font-medium">
                아직 보낸 요청이 없습니다
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 시간 변경 요청 모달 */}
      <Modal
        visible={requestModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setRequestModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6" style={{ maxHeight: '80%' }}>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-gray-800">시간 변경 요청</Text>
              <TouchableOpacity onPress={() => setRequestModalVisible(false)}>
                <Ionicons name="close" size={28} color={PARENT_COLORS.gray[600]} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="mb-4">
                <Text className="text-gray-600 font-medium mb-2">현재 일정</Text>
                <View className="bg-gray-50 rounded-xl p-4">
                  <Text className="text-gray-800 font-bold text-base">
                    {studentData.schedule || '일정 미정'}
                  </Text>
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-gray-600 font-medium mb-2">
                  변경 희망 일정 <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  value={requestedSchedule}
                  onChangeText={setRequestedSchedule}
                  placeholder="예: 월/수 15:00"
                  className="bg-gray-50 rounded-xl p-4 text-base"
                  style={{
                    borderWidth: 1,
                    borderColor: PARENT_COLORS.gray[200],
                  }}
                />
                <Text className="text-gray-500 text-sm mt-2">
                  형식: 요일/요일 시간 (예: 월/수 14:00, 화 15:30)
                </Text>
              </View>

              <View className="mb-6">
                <Text className="text-gray-600 font-medium mb-2">
                  변경 사유 (선택사항)
                </Text>
                <TextInput
                  value={requestReason}
                  onChangeText={setRequestReason}
                  placeholder="변경이 필요한 이유를 입력해주세요"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  className="bg-gray-50 rounded-xl p-4 text-base"
                  style={{
                    borderWidth: 1,
                    borderColor: PARENT_COLORS.gray[200],
                    minHeight: 100,
                  }}
                />
              </View>

              <TouchableOpacity
                onPress={handleSubmitRequest}
                className="rounded-2xl py-4 mb-4"
                style={{ backgroundColor: PARENT_COLORS.primary.DEFAULT }}
              >
                <Text className="text-white text-center font-bold text-base">
                  요청 보내기
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
