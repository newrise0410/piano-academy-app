// src/screens/parent/ChildInfoScreen.js
import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { query, collection, where, getDocs } from 'firebase/firestore';
import { Text, ScreenHeader } from '../../components/common';
import { useAuthStore } from '../../store';
import { getStudentById } from '../../services/firestoreService';
import PARENT_COLORS from '../../styles/parent_colors';
import { db } from '../../config/firebase';
import { updateUserProfile } from '../../services/authService';

export default function ChildInfoScreen() {
  const { user } = useAuthStore();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    let studentId = user?.studentId;

    // studentId가 없으면 parentId로 찾기
    if (!studentId && user?.uid) {
      try {
        const q = query(
          collection(db, 'students'),
          where('parentId', '==', user.uid)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          studentId = snapshot.docs[0].id;

          // user profile 업데이트
          await updateUserProfile(user.uid, { studentId });

          // authStore 업데이트
          const { updateUser } = useAuthStore.getState();
          updateUser({ studentId });
        }
      } catch (error) {
        console.error('학생 찾기 실패:', error);
      }
    }

    if (!studentId) {
      setLoading(false);
      return;
    }

    try {
      const result = await getStudentById(studentId);
      if (result.success && result.data) {
        setStudentData(result.data);
      }
    } catch (error) {
      console.error('학생 정보 로드 실패:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStudentData();
  };

  // 레벨에 따른 배지 색상
  const getLevelColor = (level) => {
    switch (level) {
      case '초급':
        return { bg: PARENT_COLORS.success[50], text: PARENT_COLORS.success[600] };
      case '중급':
        return { bg: PARENT_COLORS.blue[50], text: PARENT_COLORS.blue[600] };
      case '고급':
        return { bg: PARENT_COLORS.purple[50], text: PARENT_COLORS.purple[600] };
      default:
        return { bg: PARENT_COLORS.gray[100], text: PARENT_COLORS.gray[600] };
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color={PARENT_COLORS.primary.DEFAULT} />
      </View>
    );
  }

  if (!studentData) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScreenHeader title="우리 아이 정보" colorScheme="parent" />
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* 빈 상태 */}
          <View className="px-5 py-8">
            <View
              className="bg-white rounded-3xl p-8 items-center"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <View className="bg-gray-100 rounded-full p-6 mb-4">
                <Ionicons name="person-add-outline" size={48} color={PARENT_COLORS.gray[400]} />
              </View>
              <Text className="text-gray-800 font-bold text-lg mb-2 text-center">
                학생 정보가 없습니다
              </Text>
              <Text className="text-gray-500 text-center">
                선생님이 학생 정보를 등록하면{'\n'}자동으로 표시됩니다
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const levelColors = getLevelColor(studentData.level);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScreenHeader title="우리 아이 정보" subtitle="자녀의 학습 정보" colorScheme="parent" />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 프로필 카드 */}
        <View className="px-5 pt-4">
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
              <View className="items-center">
                <View className="flex-row items-center mb-2">
                  <Text className="text-gray-800 text-3xl font-bold mr-2">
                    {studentData.name}
                  </Text>
                  <View className="px-3 py-1 rounded-full" style={{ backgroundColor: levelColors.bg }}>
                    <Text className="text-xs font-bold" style={{ color: levelColors.text }}>
                      {studentData.level}
                    </Text>
                  </View>
                </View>

                {studentData.category && (
                  <Text className="text-gray-500 text-base mb-4">
                    {studentData.category}
                  </Text>
                )}

                {/* 통계 */}
                <View className="flex-row w-full mt-2">
                  <View className="flex-1 items-center mr-2 rounded-2xl p-4" style={{ backgroundColor: PARENT_COLORS.blue[50] }}>
                    <Ionicons name="calendar" size={24} color={PARENT_COLORS.blue[600]} />
                    <Text className="text-gray-500 text-xs mt-2 mb-1">수업 일정</Text>
                    <Text className="text-gray-800 font-bold text-sm" numberOfLines={1}>
                      {studentData.schedule || '미정'}
                    </Text>
                  </View>
                  <View className="flex-1 items-center ml-2 rounded-2xl p-4" style={{ backgroundColor: PARENT_COLORS.primary[50] }}>
                    <Ionicons
                      name={studentData.ticketType === 'period' ? 'calendar' : 'ticket'}
                      size={24}
                      color={PARENT_COLORS.primary.DEFAULT}
                    />
                    <Text className="text-gray-500 text-xs mt-2 mb-1">
                      {studentData.ticketType === 'period' ? '수강 기간' : '남은 수업'}
                    </Text>
                    <Text className="text-gray-800 font-bold text-sm" numberOfLines={1}>
                      {studentData.ticketType === 'period'
                        ? (studentData.ticketPeriod?.start && studentData.ticketPeriod?.end
                            ? `${studentData.ticketPeriod.start.slice(5)} ~ ${studentData.ticketPeriod.end.slice(5)}`
                            : '미정')
                        : `${studentData.ticketCount || 0}회`
                      }
                    </Text>
                  </View>
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
                <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: PARENT_COLORS.purple[100] }}>
                  <Ionicons name="book" size={20} color={PARENT_COLORS.purple[600]} />
                </View>
                <Text className="text-gray-800 font-bold text-lg">학습 정보</Text>
              </View>

              <InfoRow
                icon="book-outline"
                label="교재"
                value={studentData.book || '미정'}
              />
              <InfoRow
                icon="trophy-outline"
                label="레벨"
                value={studentData.level}
              />
              <InfoRow
                icon="time-outline"
                label="수업 일정"
                value={studentData.schedule || '미정'}
                isLast
              />
            </View>

            {/* 수강권 정보 */}
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
                <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: PARENT_COLORS.success[100] }}>
                  <Ionicons name="ticket" size={20} color={PARENT_COLORS.success[600]} />
                </View>
                <Text className="text-gray-800 font-bold text-lg">수강권 정보</Text>
              </View>

              <InfoRow
                icon="ticket-outline"
                label="수강권 종류"
                value={studentData.ticketType === 'count' ? '회차권' : '기간권'}
              />
              {studentData.ticketType === 'count' ? (
                <InfoRow
                  icon="albums-outline"
                  label="남은 횟수"
                  value={`${studentData.ticketCount || 0}회`}
                  isLast
                />
              ) : (
                <InfoRow
                  icon="calendar-outline"
                  label="수강 기간"
                  value={studentData.ticketPeriod
                    ? `${studentData.ticketPeriod.start} ~ ${studentData.ticketPeriod.end}`
                    : '미정'
                  }
                  isLast
                />
              )}
            </View>

            {/* 학부모 정보 */}
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
                <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: PARENT_COLORS.primary[100] }}>
                  <Ionicons name="people" size={20} color={PARENT_COLORS.primary.DEFAULT} />
                </View>
                <Text className="text-gray-800 font-bold text-lg">학부모 정보</Text>
              </View>

              <InfoRow
                icon="person-outline"
                label="학부모 이름"
                value={studentData.parentName}
              />
              <InfoRow
                icon="call-outline"
                label="연락처"
                value={studentData.parentPhone}
                isLast
              />
            </View>

            {/* 학원 정보 */}
            <View
              className="bg-white rounded-3xl p-5 mb-6"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: PARENT_COLORS.blue[100] }}>
                  <Ionicons name="business" size={20} color={PARENT_COLORS.blue[600]} />
                </View>
                <Text className="text-gray-800 font-bold text-lg">학원 정보</Text>
              </View>

              <InfoRow
                icon="home-outline"
                label="학원명"
                value={user?.academyName || '-'}
              />
              <InfoRow
                icon="key-outline"
                label="학원 코드"
                value={user?.academyCode || '-'}
                isLast
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
  );
}

// InfoRow 컴포넌트
function InfoRow({ icon, label, value, isLast = false }) {
  return (
    <View className={`flex-row items-center py-3 ${!isLast ? 'border-b' : ''}`} style={{ borderColor: PARENT_COLORS.gray[100] }}>
      <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: PARENT_COLORS.gray[50] }}>
        <Ionicons name={icon} size={20} color={PARENT_COLORS.gray[600]} />
      </View>
      <View className="flex-1">
        <Text className="text-sm text-gray-500 mb-1">{label}</Text>
        <Text className="text-base font-medium text-gray-800">{value}</Text>
      </View>
    </View>
  );
}
