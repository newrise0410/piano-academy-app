import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Text from '../../components/common/Text';

export default function TuitionScreen() {
  const [price4Weeks, setPrice4Weeks] = useState('150,000');
  const [price8Weeks, setPrice8Weeks] = useState('280,000');

  // 통계 데이터
  const stats = {
    paid: 42,
    lastWeek: 5,
    unpaid: 3,
  };

  // 미납자 목록
  const unpaidStudents = [
    {
      id: '1',
      name: '이준호',
      deadline: '9/15',
    },
    {
      id: '2',
      name: '최우진',
      deadline: '9/20',
    },
  ];

  // 전여 1회 학생
  const oneSessionLeft = [
    {
      id: '1',
      name: '김민지',
      sessions: '1회 남음',
    },
  ];

  // 월별 수입
  const monthlyRevenue = {
    total: 4800000,
    students: 32,
    sessions: 4,
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* 헤더 */}
      <View className="bg-primary px-5 py-4">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Ionicons name="card" size={24} color="white" />
            <Text className="text-white text-xl font-bold ml-2">피아노 학원 관리</Text>
          </View>
          <Ionicons name="menu" size={28} color="white" />
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* 수강료 관리 화면 헤더 */}
        <View className="px-5 mt-4 mb-3">
          <Text className="text-base text-gray-600">수강료 관리 화면</Text>
        </View>

        {/* 이번 달 수강권 현황 */}
        <View className="px-5 mb-4">
          <View className="bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl p-5">
            <Text className="text-white text-lg font-bold mb-4">이번 달 수강권 현황</Text>

            <View className="flex-row justify-between">
              {/* 정상 */}
              <View className="bg-white/20 backdrop-blur rounded-xl p-4 flex-1 mr-2">
                <Text className="text-white text-3xl font-bold mb-1">{stats.paid}명</Text>
                <Text className="text-white/80 text-xs">정상 (2회+)</Text>
              </View>

              {/* 주의 */}
              <View className="bg-white/20 backdrop-blur rounded-xl p-4 flex-1 mx-1">
                <Text className="text-white text-3xl font-bold mb-1">{stats.lastWeek}명</Text>
                <Text className="text-white/80 text-xs">주의 (1회)</Text>
              </View>

              {/* 미납 */}
              <View className="bg-red-500 rounded-xl p-4 flex-1 ml-2">
                <Text className="text-white text-3xl font-bold mb-1">{stats.unpaid}명</Text>
                <Text className="text-white text-xs">미납 ⚠</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 수강권 미납 (3명) */}
        <View className="px-5 mb-4">
          <View className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <View className="flex-row items-center mb-3">
              <Ionicons name="alert-circle" size={20} color="#EF4444" />
              <Text className="text-red-600 font-bold ml-2">수강권 미납 ({unpaidStudents.length}명)</Text>
            </View>

            {unpaidStudents.map((student) => (
              <View
                key={student.id}
                className="bg-white rounded-xl p-3 mb-2 flex-row items-center justify-between"
              >
                <View>
                  <Text className="text-sm font-bold text-gray-800">{student.name}</Text>
                  <Text className="text-xs text-gray-600 mt-0.5">
                    마지막 결제: {student.deadline}
                  </Text>
                </View>
                <TouchableOpacity className="bg-red-500 rounded-lg px-4 py-2">
                  <Text className="text-xs font-bold text-white">알림 발송</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* 전여 1회 (5명) */}
        <View className="px-5 mb-4">
          <View className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
            <View className="flex-row items-center mb-3">
              <Ionicons name="flash" size={20} color="#F59E0B" />
              <Text className="text-orange-600 font-bold ml-2">전여 1회 ({oneSessionLeft.length}명)</Text>
            </View>

            {oneSessionLeft.map((student) => (
              <View
                key={student.id}
                className="bg-white rounded-xl p-3 mb-2 flex-row items-center justify-between"
              >
                <View>
                  <Text className="text-sm font-bold text-gray-800">{student.name}</Text>
                  <Text className="text-xs text-orange-600 font-semibold mt-0.5">
                    ⚡ {student.sessions}
                  </Text>
                </View>
                <TouchableOpacity className="bg-orange-500 rounded-lg px-4 py-2">
                  <Text className="text-xs font-bold text-white">알림 발송</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* 수강권 가격 설정 */}
        <View className="px-5 mb-4">
          <View className="bg-white rounded-2xl p-4 border border-gray-200">
            <View className="flex-row items-center mb-4">
              <Ionicons name="pricetag" size={20} color="#8B5CF6" />
              <Text className="text-gray-800 font-bold ml-2">수강권 가격 설정</Text>
            </View>

            {/* 4회권 */}
            <View className="mb-4">
              <Text className="text-sm text-gray-600 mb-2">4회권 (기본)</Text>
              <View className="flex-row items-center justify-between bg-gray-50 rounded-xl p-3">
                <TextInput
                  className="flex-1 text-base font-bold text-gray-800"
                  value={price4Weeks}
                  onChangeText={setPrice4Weeks}
                  keyboardType="numeric"
                  style={{ fontFamily: 'MaruBuri-Regular' }}
                />
                <Text className="text-sm text-gray-600 ml-2">원</Text>
                <TouchableOpacity className="ml-3">
                  <Text className="text-sm font-semibold text-primary">수정</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 8회권 */}
            <View>
              <Text className="text-sm text-gray-600 mb-2">8회권</Text>
              <View className="flex-row items-center justify-between bg-gray-50 rounded-xl p-3">
                <TextInput
                  className="flex-1 text-base font-bold text-gray-800"
                  value={price8Weeks}
                  onChangeText={setPrice8Weeks}
                  keyboardType="numeric"
                  style={{ fontFamily: 'MaruBuri-Regular' }}
                />
                <Text className="text-sm text-gray-600 ml-2">원</Text>
                <TouchableOpacity className="ml-3">
                  <Text className="text-sm font-semibold text-primary">수정</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* 이번 달 수입 */}
        <View className="px-5 mb-20">
          <View className="bg-white rounded-2xl p-5 border border-gray-200">
            <View className="flex-row items-center mb-3">
              <Ionicons name="bar-chart" size={20} color="#8B5CF6" />
              <Text className="text-gray-800 font-bold ml-2">이번 달 수입</Text>
            </View>

            <Text className="text-4xl font-bold text-primary mb-2">
              {monthlyRevenue.total.toLocaleString()}원
            </Text>
            <Text className="text-sm text-gray-600">
              {monthlyRevenue.students}건 (4회권 기준)
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}