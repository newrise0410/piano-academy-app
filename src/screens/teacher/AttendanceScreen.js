import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Text from '../../components/common/Text';

export default function AttendanceScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState([
    {
      id: '1',
      name: '김민지',
      level: '초급',
      time: '16:00 - 16:50',
      status: 'present', // present, absent, makeup
    },
    {
      id: '2',
      name: '박서연',
      level: '고급',
      time: '18:00 - 18:50',
      status: null,
    },
    {
      id: '3',
      name: '이준호',
      level: '중급',
      time: '17:00 - 17:50',
      status: 'absent',
    },
  ]);

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

  // 출석률 계산
  const calculateAttendanceRate = () => {
    const total = attendanceData.length;
    const present = attendanceData.filter(s => s.status === 'present').length;
    return total > 0 ? Math.round((present / total) * 100) : 0;
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
              <Ionicons name="calendar-outline" size={20} color="#8B5CF6" />
              <Text className="text-lg font-bold text-gray-800 ml-2">
                2025년 10월 16일 (수)
              </Text>
            </View>
            <TouchableOpacity className="flex-row items-center">
              <Text className="text-primary text-sm font-semibold mr-1">날짜 변경</Text>
              <Ionicons name="chevron-forward" size={16} color="#8B5CF6" />
            </TouchableOpacity>
          </View>

          <View className="mt-2 px-4">
            <Text className="text-sm text-gray-600">오늘 수업: 8명</Text>
          </View>
        </View>

        {/* 출석 카드 목록 */}
        <View className="px-5">
          {attendanceData.map((student) => (
            <View
              key={student.id}
              className={`mb-3 rounded-2xl p-4 ${
                student.status === 'present'
                  ? 'bg-green-50 border border-green-200'
                  : student.status === 'absent'
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-white border border-gray-200'
              }`}
            >
              {/* 학생 정보 */}
              <View className="flex-row items-center justify-between mb-3">
                <View>
                  <View className="flex-row items-center mb-1">
                    <Text className="text-lg font-bold text-gray-800 mr-2">
                      {student.name}
                    </Text>
                    <View className="bg-purple-100 rounded-full px-2 py-0.5">
                      <Text className="text-xs font-bold text-primary">{student.level}</Text>
                    </View>
                  </View>
                  <Text className="text-sm text-gray-600">{student.time}</Text>
                </View>
                {student.status === 'present' && (
                  <Ionicons name="checkmark-circle" size={28} color="#10B981" />
                )}
                {student.status === 'absent' && (
                  <View className="bg-red-500 rounded-full px-2 py-1">
                    <Text className="text-xs font-bold text-white">결석</Text>
                  </View>
                )}
              </View>

              {/* 출석 버튼 */}
              <View className="flex-row">
                <TouchableOpacity
                  className={`flex-1 rounded-xl py-3 mr-2 ${
                    student.status === 'present' ? 'bg-green-500' : 'bg-white border border-gray-200'
                  }`}
                  onPress={() => handleStatusChange(student.id, 'present')}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color={student.status === 'present' ? 'white' : '#6B7280'}
                    />
                    <Text
                      className={`text-sm font-bold ml-1 ${
                        student.status === 'present' ? 'text-white' : 'text-gray-600'
                      }`}
                    >
                      출석
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`flex-1 rounded-xl py-3 mx-1 ${
                    student.status === 'absent' ? 'bg-red-500' : 'bg-white border border-gray-200'
                  }`}
                  onPress={() => handleStatusChange(student.id, 'absent')}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons
                      name="close"
                      size={18}
                      color={student.status === 'absent' ? 'white' : '#6B7280'}
                    />
                    <Text
                      className={`text-sm font-bold ml-1 ${
                        student.status === 'absent' ? 'text-white' : 'text-gray-600'
                      }`}
                    >
                      결석
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`flex-1 rounded-xl py-3 ml-2 ${
                    student.status === 'makeup' ? 'bg-blue-500' : 'bg-white border border-gray-200'
                  }`}
                  onPress={() => handleStatusChange(student.id, 'makeup')}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons
                      name="calendar"
                      size={18}
                      color={student.status === 'makeup' ? 'white' : '#6B7280'}
                    />
                    <Text
                      className={`text-sm font-bold ml-1 ${
                        student.status === 'makeup' ? 'text-white' : 'text-gray-600'
                      }`}
                    >
                      보강
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* 결석 시 보강 예약 버튼 */}
              {student.status === 'absent' && (
                <TouchableOpacity
                  className="mt-3 bg-blue-500 rounded-xl py-3"
                  activeOpacity={0.8}
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons name="calendar" size={18} color="white" />
                    <Text className="text-white text-sm font-bold ml-2">보강 일정 잡기</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* 이번 주 보강 예정 */}
        <View className="px-5 mt-4 mb-20">
          <View className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
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
                <TouchableOpacity className="bg-blue-100 rounded-lg px-3 py-1">
                  <Text className="text-xs font-semibold text-blue-600">완료 처리</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}