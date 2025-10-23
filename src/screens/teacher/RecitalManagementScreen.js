// src/screens/teacher/RecitalManagementScreen.js
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, ScreenHeader } from '../../components/common';
import TEACHER_COLORS from '../../styles/teacher_colors';
import { useToastStore } from '../../store';

export default function RecitalManagementScreen({ navigation }) {
  const toast = useToastStore();
  const [filter, setFilter] = useState('upcoming'); // upcoming, past

  // 임시 데이터
  const recitals = [
    {
      id: 1,
      title: '2024년 겨울 발표회',
      date: '2024-12-25',
      time: '14:00',
      venue: '학원 연주홀',
      participants: 15,
      totalStudents: 20,
      status: 'upcoming',
      description: '한 해를 마무리하는 크리스마스 발표회',
    },
    {
      id: 2,
      title: '2024년 가을 음악회',
      date: '2024-09-15',
      time: '15:00',
      venue: '시민회관 소공연장',
      participants: 18,
      totalStudents: 18,
      status: 'completed',
      description: '가을을 맞이하는 감성 음악회',
    },
  ];

  const filteredRecitals = recitals.filter((r) =>
    filter === 'upcoming' ? r.status === 'upcoming' : r.status === 'completed'
  );

  const handleCreateRecital = () => {
    toast.info('발표회 생성 기능은 준비중입니다');
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScreenHeader title="발표회 관리" onBack={() => navigation.goBack()} />

      <View className="px-5 py-4">
        {/* 발표회 생성 버튼 */}
        <TouchableOpacity
          onPress={handleCreateRecital}
          activeOpacity={0.8}
          className="bg-purple-500 rounded-2xl py-4 mb-4 flex-row items-center justify-center"
          style={{
            shadowColor: TEACHER_COLORS.primary.DEFAULT,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <Ionicons name="add-circle" size={24} color="white" />
          <Text className="text-white font-bold text-base ml-2">새 발표회 만들기</Text>
        </TouchableOpacity>

        {/* 필터 */}
        <View className="flex-row mb-4">
          <TouchableOpacity
            onPress={() => setFilter('upcoming')}
            className={`flex-1 rounded-full py-3 mr-2`}
            style={{
              backgroundColor:
                filter === 'upcoming' ? TEACHER_COLORS.primary.DEFAULT : 'white',
            }}
          >
            <Text
              className={`text-center font-bold ${
                filter === 'upcoming' ? 'text-white' : 'text-gray-600'
              }`}
            >
              예정된 발표회
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilter('past')}
            className={`flex-1 rounded-full py-3 ml-2`}
            style={{
              backgroundColor: filter === 'past' ? TEACHER_COLORS.primary.DEFAULT : 'white',
            }}
          >
            <Text
              className={`text-center font-bold ${
                filter === 'past' ? 'text-white' : 'text-gray-600'
              }`}
            >
              지난 발표회
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-5">
        {filteredRecitals.length > 0 ? (
          filteredRecitals.map((recital) => (
            <TouchableOpacity
              key={recital.id}
              onPress={() =>
                navigation.navigate('RecitalDetail', { recitalId: recital.id })
              }
              activeOpacity={0.7}
              className="bg-white rounded-2xl p-5 mb-4"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              {/* 상태 배지 */}
              <View className="flex-row items-center justify-between mb-3">
                <View
                  className="rounded-full px-3 py-1"
                  style={{
                    backgroundColor:
                      recital.status === 'upcoming'
                        ? TEACHER_COLORS.green[100]
                        : TEACHER_COLORS.gray[100],
                  }}
                >
                  <Text
                    className="font-bold text-xs"
                    style={{
                      color:
                        recital.status === 'upcoming'
                          ? TEACHER_COLORS.green[700]
                          : TEACHER_COLORS.gray[700],
                    }}
                  >
                    {recital.status === 'upcoming' ? '예정' : '완료'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={TEACHER_COLORS.gray[300]} />
              </View>

              {/* 제목 */}
              <Text className="text-gray-900 font-bold text-xl mb-2">{recital.title}</Text>
              <Text className="text-gray-600 text-sm mb-4">{recital.description}</Text>

              {/* 정보 */}
              <View className="space-y-2">
                <View className="flex-row items-center">
                  <Ionicons name="calendar" size={16} color={TEACHER_COLORS.gray[500]} />
                  <Text className="text-gray-700 text-sm ml-2">
                    {formatDate(recital.date)} {recital.time}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="location" size={16} color={TEACHER_COLORS.gray[500]} />
                  <Text className="text-gray-700 text-sm ml-2">{recital.venue}</Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="people" size={16} color={TEACHER_COLORS.gray[500]} />
                  <Text className="text-gray-700 text-sm ml-2">
                    참가 신청: {recital.participants} / {recital.totalStudents}명
                  </Text>
                </View>
              </View>

              {/* 진행률 */}
              <View className="mt-4 pt-4 border-t border-gray-100">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-gray-500 text-xs">참가 신청률</Text>
                  <Text className="text-gray-900 font-bold text-sm">
                    {Math.round((recital.participants / recital.totalStudents) * 100)}%
                  </Text>
                </View>
                <View className="bg-gray-200 h-2 rounded-full overflow-hidden">
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${(recital.participants / recital.totalStudents) * 100}%`,
                      backgroundColor: TEACHER_COLORS.primary.DEFAULT,
                    }}
                  />
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View
            className="bg-white rounded-2xl p-8 items-center"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View className="bg-gray-100 rounded-full p-6 mb-4">
              <Ionicons name="musical-notes-outline" size={48} color="#9CA3AF" />
            </View>
            <Text className="text-gray-900 font-bold text-lg mb-2">
              {filter === 'upcoming' ? '예정된 발표회가 없습니다' : '지난 발표회가 없습니다'}
            </Text>
            <Text className="text-gray-400 text-sm text-center">
              {filter === 'upcoming' && '새 발표회를 만들어보세요'}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
