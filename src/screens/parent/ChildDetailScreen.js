// src/screens/parent/ChildDetailScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, ScreenHeader } from '../../components/common';
import PARENT_COLORS from '../../styles/parent_colors';
import { useAuthStore } from '../../store';
import { getStudentById } from '../../services/firestoreService';

export default function ChildDetailScreen({ navigation, route }) {
  const { studentId } = route.params || {};
  const { user } = useAuthStore();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [studentId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const id = studentId || user?.studentId;
      if (id) {
        const result = await getStudentById(id);
        if (result.success) {
          setStudentData(result.data);
        }
      }
    } catch (error) {
      console.error('학생 정보 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScreenHeader title="자녀 상세 정보" colorScheme="parent" hasBackButton />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={PARENT_COLORS.primary.DEFAULT} />
        </View>
      </SafeAreaView>
    );
  }

  if (!studentData) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScreenHeader title="자녀 상세 정보" colorScheme="parent" hasBackButton />
        <View className="flex-1 items-center justify-center px-5">
          <View className="bg-gray-100 rounded-full p-6 mb-4">
            <Ionicons name="person-outline" size={64} color={PARENT_COLORS.gray[400]} />
          </View>
          <Text className="text-gray-800 font-bold text-xl text-center mb-2">
            정보를 불러올 수 없습니다
          </Text>
          <Text className="text-gray-500 text-center">
            잠시 후 다시 시도해주세요
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScreenHeader title={`${studentData.name} 정보`} colorScheme="parent" hasBackButton />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="px-5 py-6">
          {/* 프로필 카드 */}
          <View
            className="bg-white rounded-3xl p-6 mb-4"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            {/* 프로필 헤더 */}
            <View className="items-center mb-6">
              <View
                className="w-24 h-24 rounded-full items-center justify-center mb-3"
                style={{ backgroundColor: PARENT_COLORS.primary[100] }}
              >
                <Text className="text-5xl">🎹</Text>
              </View>
              <Text className="text-gray-800 text-3xl font-bold mb-2">
                {studentData.name}
              </Text>
              <View
                className="px-4 py-2 rounded-full"
                style={{ backgroundColor: PARENT_COLORS.primary[100] }}
              >
                <Text
                  className="text-base font-bold"
                  style={{ color: PARENT_COLORS.primary[600] }}
                >
                  {studentData.level}
                </Text>
              </View>
            </View>

            {/* 기본 통계 */}
            <View className="flex-row justify-around mb-4">
              <View className="items-center">
                <View
                  className="w-16 h-16 rounded-2xl items-center justify-center mb-2"
                  style={{ backgroundColor: PARENT_COLORS.blue[50] }}
                >
                  <Ionicons
                    name="calendar"
                    size={28}
                    color={PARENT_COLORS.blue[500]}
                  />
                </View>
                <Text className="text-gray-500 text-xs">출석률</Text>
                <Text className="text-gray-800 font-bold text-lg">
                  {studentData.attendanceRate || '0'}%
                </Text>
              </View>
              <View className="items-center">
                <View
                  className="w-16 h-16 rounded-2xl items-center justify-center mb-2"
                  style={{ backgroundColor: PARENT_COLORS.success[50] }}
                >
                  <Ionicons
                    name="musical-notes"
                    size={28}
                    color={PARENT_COLORS.success[600]}
                  />
                </View>
                <Text className="text-gray-500 text-xs">수업 완료</Text>
                <Text className="text-gray-800 font-bold text-lg">
                  {studentData.completedLessons || 0}회
                </Text>
              </View>
              <View className="items-center">
                <View
                  className="w-16 h-16 rounded-2xl items-center justify-center mb-2"
                  style={{ backgroundColor: PARENT_COLORS.purple[50] }}
                >
                  <Ionicons
                    name="trophy"
                    size={28}
                    color={PARENT_COLORS.purple[600]}
                  />
                </View>
                <Text className="text-gray-500 text-xs">레벨</Text>
                <Text className="text-gray-800 font-bold text-lg">
                  {studentData.level || '-'}
                </Text>
              </View>
            </View>
          </View>

          {/* 학습 정보 */}
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
            <View className="flex-row items-center mb-4">
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: PARENT_COLORS.blue[100] }}
              >
                <Ionicons name="book" size={20} color={PARENT_COLORS.blue[600]} />
              </View>
              <Text className="text-gray-800 font-bold text-lg">학습 정보</Text>
            </View>

            <View className="space-y-3">
              <View className="flex-row items-center py-3 border-b border-gray-100">
                <Text className="text-gray-600 w-24">교재</Text>
                <Text className="text-gray-800 font-semibold flex-1">
                  {studentData.book || '미정'}
                </Text>
              </View>
              <View className="flex-row items-center py-3 border-b border-gray-100">
                <Text className="text-gray-600 w-24">레벨</Text>
                <Text className="text-gray-800 font-semibold flex-1">
                  {studentData.level || '미정'}
                </Text>
              </View>
              <View className="flex-row items-center py-3">
                <Text className="text-gray-600 w-24">수업 일정</Text>
                <Text className="text-gray-800 font-semibold flex-1">
                  {studentData.schedule || '일정 미정'}
                </Text>
              </View>
            </View>
          </View>

          {/* 티켓 정보 */}
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
            <View className="flex-row items-center mb-4">
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: PARENT_COLORS.success[100] }}
              >
                <Ionicons name="ticket" size={20} color={PARENT_COLORS.success[600]} />
              </View>
              <Text className="text-gray-800 font-bold text-lg">티켓 정보</Text>
            </View>

            {studentData.ticketType === 'period' ? (
              // 기간정액권
              <View className="bg-gray-50 rounded-2xl p-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-gray-700 font-semibold">기간정액권</Text>
                  <View
                    className="px-3 py-1 rounded-full"
                    style={{ backgroundColor: PARENT_COLORS.primary[100] }}
                  >
                    <Text
                      className="text-xs font-bold"
                      style={{ color: PARENT_COLORS.primary[600] }}
                    >
                      정액제
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center justify-between mt-3">
                  <View>
                    <Text className="text-gray-500 text-sm mb-1">시작일</Text>
                    <Text className="text-gray-800 font-bold">
                      {studentData.ticketPeriod?.start || '-'}
                    </Text>
                  </View>
                  <Ionicons name="arrow-forward" size={20} color={PARENT_COLORS.gray[400]} />
                  <View>
                    <Text className="text-gray-500 text-sm mb-1">종료일</Text>
                    <Text className="text-gray-800 font-bold">
                      {studentData.ticketPeriod?.end || '-'}
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              // 회차권
              <View className="bg-gray-50 rounded-2xl p-4">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-gray-700 font-semibold">남은 수업</Text>
                  <Text
                    className="text-3xl font-bold"
                    style={{ color: PARENT_COLORS.primary.DEFAULT }}
                  >
                    {studentData.ticketCount || 0}회
                  </Text>
                </View>
                <View className="bg-gray-200 h-2 rounded-full overflow-hidden">
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(((studentData.ticketCount || 0) / 10) * 100, 100)}%`,
                      backgroundColor: PARENT_COLORS.primary.DEFAULT,
                    }}
                  />
                </View>
              </View>
            )}
          </View>

          {/* 학원 정보 */}
          <View
            className="bg-white rounded-3xl p-5"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View className="flex-row items-center mb-4">
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: PARENT_COLORS.purple[100] }}
              >
                <Ionicons name="business" size={20} color={PARENT_COLORS.purple[600]} />
              </View>
              <Text className="text-gray-800 font-bold text-lg">학원 정보</Text>
            </View>

            <View className="space-y-3">
              <View className="flex-row items-center py-3 border-b border-gray-100">
                <Text className="text-gray-600 w-24">학원명</Text>
                <Text className="text-gray-800 font-semibold flex-1">
                  {studentData.academyName || user?.academyName || '미등록'}
                </Text>
              </View>
              <View className="flex-row items-center py-3">
                <Text className="text-gray-600 w-24">학원 코드</Text>
                <Text className="text-gray-800 font-semibold flex-1">
                  {studentData.academyCode || user?.academyCode || '-'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
