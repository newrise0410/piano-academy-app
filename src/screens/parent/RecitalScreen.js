// src/screens/parent/RecitalScreen.js
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, ScreenHeader } from '../../components/common';
import PARENT_COLORS from '../../styles/parent_colors';
import { useToastStore } from '../../store';

export default function RecitalScreen({ navigation }) {
  const toast = useToastStore();

  // 임시 데이터
  const recitals = [
    {
      id: 1,
      title: '2024년 겨울 발표회',
      date: '2024-12-25',
      time: '14:00',
      venue: '학원 연주홀',
      description: '한 해를 마무리하는 크리스마스 발표회',
      isParticipating: false,
      deadline: '2024-12-10',
      program: [
        { order: 1, student: '김민준', song: '엘리제를 위하여' },
        { order: 2, student: '이서연', song: '작은 별 변주곡' },
      ],
    },
  ];

  const handleParticipate = (recitalId) => {
    toast.info('발표회 참가 신청 기능은 준비중입니다');
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDaysUntil = (dateStr) => {
    const today = new Date();
    const targetDate = new Date(dateStr);
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScreenHeader title="발표회" onBack={() => navigation.goBack()} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 py-4">
          {recitals.length > 0 ? (
            recitals.map((recital) => {
              const daysUntil = getDaysUntil(recital.date);
              const deadlineDays = getDaysUntil(recital.deadline);

              return (
                <View key={recital.id}>
                  {/* 메인 카드 */}
                  <View
                    className="bg-white rounded-2xl p-6 mb-4"
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.1,
                      shadowRadius: 12,
                      elevation: 8,
                    }}
                  >
                    {/* D-Day 배지 */}
                    <View className="flex-row items-center justify-between mb-4">
                      <View
                        className="rounded-full px-4 py-2"
                        style={{ backgroundColor: PARENT_COLORS.primary[100] }}
                      >
                        <Text
                          className="font-bold"
                          style={{ color: PARENT_COLORS.primary[700] }}
                        >
                          D-{daysUntil}
                        </Text>
                      </View>
                      {recital.isParticipating && (
                        <View className="bg-green-100 rounded-full px-3 py-1">
                          <Text className="text-green-700 font-bold text-xs">참가 신청 완료</Text>
                        </View>
                      )}
                    </View>

                    {/* 제목 */}
                    <Text className="text-gray-900 font-bold text-2xl mb-2">{recital.title}</Text>
                    <Text className="text-gray-600 text-sm mb-5">{recital.description}</Text>

                    {/* 정보 */}
                    <View className="space-y-3 mb-5">
                      <View className="flex-row items-center">
                        <View
                          className="w-10 h-10 rounded-full items-center justify-center mr-3"
                          style={{ backgroundColor: PARENT_COLORS.blue[50] }}
                        >
                          <Ionicons name="calendar" size={20} color={PARENT_COLORS.blue[600]} />
                        </View>
                        <View>
                          <Text className="text-gray-500 text-xs">날짜</Text>
                          <Text className="text-gray-900 font-bold">
                            {formatDate(recital.date)} {recital.time}
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row items-center">
                        <View
                          className="w-10 h-10 rounded-full items-center justify-center mr-3"
                          style={{ backgroundColor: PARENT_COLORS.purple[50] }}
                        >
                          <Ionicons name="location" size={20} color={PARENT_COLORS.purple[600]} />
                        </View>
                        <View>
                          <Text className="text-gray-500 text-xs">장소</Text>
                          <Text className="text-gray-900 font-bold">{recital.venue}</Text>
                        </View>
                      </View>

                      <View className="flex-row items-center">
                        <View
                          className="w-10 h-10 rounded-full items-center justify-center mr-3"
                          style={{ backgroundColor: PARENT_COLORS.amber[50] }}
                        >
                          <Ionicons name="time" size={20} color={PARENT_COLORS.amber[600]} />
                        </View>
                        <View>
                          <Text className="text-gray-500 text-xs">신청 마감</Text>
                          <Text className="text-gray-900 font-bold">
                            {formatDate(recital.deadline)} (D-{deadlineDays})
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* 참가 신청 버튼 */}
                    {!recital.isParticipating && (
                      <TouchableOpacity
                        onPress={() => handleParticipate(recital.id)}
                        activeOpacity={0.8}
                        className="rounded-2xl py-4"
                        style={{ backgroundColor: PARENT_COLORS.primary.DEFAULT }}
                      >
                        <Text className="text-white font-bold text-center text-base">
                          발표회 참가 신청하기
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* 프로그램 */}
                  <View
                    className="bg-white rounded-2xl p-5 mb-4"
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 8,
                      elevation: 3,
                    }}
                  >
                    <View className="flex-row items-center mb-4">
                      <Ionicons name="list" size={20} color={PARENT_COLORS.primary.DEFAULT} />
                      <Text className="text-gray-900 font-bold text-lg ml-2">프로그램</Text>
                    </View>

                    {recital.program.map((item) => (
                      <View
                        key={item.order}
                        className="flex-row items-center py-3 border-b border-gray-100"
                      >
                        <View
                          className="w-8 h-8 rounded-full items-center justify-center mr-3"
                          style={{ backgroundColor: PARENT_COLORS.primary[100] }}
                        >
                          <Text
                            className="font-bold text-sm"
                            style={{ color: PARENT_COLORS.primary[700] }}
                          >
                            {item.order}
                          </Text>
                        </View>
                        <View className="flex-1">
                          <Text className="text-gray-900 font-bold text-sm">{item.song}</Text>
                          <Text className="text-gray-500 text-xs mt-0.5">{item.student}</Text>
                        </View>
                      </View>
                    ))}
                  </View>

                  {/* 안내 사항 */}
                  <View
                    className="bg-blue-50 rounded-2xl p-5 mb-6"
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 8,
                      elevation: 3,
                    }}
                  >
                    <View className="flex-row items-center mb-3">
                      <Ionicons name="information-circle" size={20} color={PARENT_COLORS.blue[600]} />
                      <Text className="text-gray-900 font-bold ml-2">안내 사항</Text>
                    </View>
                    <Text className="text-gray-700 text-sm leading-6">
                      • 발표회 30분 전까지 입장 부탁드립니다{'\n'}
                      • 공연 중 사진/영상 촬영은 자유입니다{'\n'}
                      • 리허설은 하루 전 진행됩니다{'\n'}
                      • 문의사항은 선생님께 연락주세요
                    </Text>
                  </View>
                </View>
              );
            })
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
                예정된 발표회가 없습니다
              </Text>
              <Text className="text-gray-400 text-sm text-center">
                발표회 일정이 잡히면 알려드릴게요
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
