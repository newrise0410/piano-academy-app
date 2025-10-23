// src/screens/parent/ChildInfoScreen.js
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

export default function ChildInfoScreen({ navigation }) {
  const { user } = useAuthStore();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // TODO: 실제로는 부모의 모든 자녀 목록을 가져와야 함
      // 현재는 user.studentId만 사용
      if (user?.studentId) {
        const result = await getStudentById(user.studentId);
        if (result.success) {
          setChildren([result.data]);
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
        <ScreenHeader title="우리 아이 정보" colorScheme="parent" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={PARENT_COLORS.primary.DEFAULT} />
        </View>
      </SafeAreaView>
    );
  }

  if (children.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScreenHeader title="우리 아이 정보" colorScheme="parent" />
        <View className="flex-1 items-center justify-center px-5">
          <View className="bg-gray-100 rounded-full p-6 mb-4">
            <Ionicons name="person-outline" size={64} color={PARENT_COLORS.gray[400]} />
          </View>
          <Text className="text-gray-800 font-bold text-xl text-center mb-2">
            등록된 자녀 정보가 없습니다
          </Text>
          <Text className="text-gray-500 text-center mb-6">
            자녀 정보를 등록하면{'\n'}학습 정보를 확인할 수 있어요
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('ChildRegistrationRequest')}
            className="rounded-2xl py-3 px-6"
            style={{ backgroundColor: PARENT_COLORS.primary.DEFAULT }}
          >
            <Text className="text-white font-bold text-base">자녀 등록 요청하기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
        <View className="px-5 py-6">
          {/* 자녀 카드 목록 */}
          {children.map((child, index) => (
            <TouchableOpacity
              key={child.id || index}
              onPress={() => navigation.navigate('ChildDetail', { studentId: child.id })}
              className="bg-white rounded-3xl p-5 mb-4"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <View className="flex-row items-center">
                {/* 프로필 아이콘 */}
                <View
                  className="w-16 h-16 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: PARENT_COLORS.primary[100] }}
                >
                  <Text className="text-3xl">🎹</Text>
                </View>

                {/* 자녀 정보 */}
                <View className="flex-1">
                  <View className="flex-row items-center mb-2">
                    <Text className="text-gray-800 text-xl font-bold mr-2">
                      {child.name}
                    </Text>
                    <View
                      className="px-2 py-1 rounded-full"
                      style={{ backgroundColor: PARENT_COLORS.primary[100] }}
                    >
                      <Text
                        className="text-xs font-bold"
                        style={{ color: PARENT_COLORS.primary[600] }}
                      >
                        {child.level}
                      </Text>
                    </View>
                  </View>

                  {/* 통계 요약 */}
                  <View className="flex-row items-center">
                    <View className="flex-row items-center mr-4">
                      <Ionicons
                        name="calendar-outline"
                        size={14}
                        color={PARENT_COLORS.gray[500]}
                      />
                      <Text className="text-gray-600 text-xs ml-1">
                        출석 {child.attendanceRate || 0}%
                      </Text>
                    </View>
                    <View className="flex-row items-center mr-4">
                      <Ionicons
                        name="musical-notes-outline"
                        size={14}
                        color={PARENT_COLORS.gray[500]}
                      />
                      <Text className="text-gray-600 text-xs ml-1">
                        수업 {child.completedLessons || 0}회
                      </Text>
                    </View>
                    {child.ticketType === 'count' && (
                      <View className="flex-row items-center">
                        <Ionicons
                          name="ticket-outline"
                          size={14}
                          color={PARENT_COLORS.gray[500]}
                        />
                        <Text className="text-gray-600 text-xs ml-1">
                          남은 {child.ticketCount || 0}회
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* 화살표 아이콘 */}
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color={PARENT_COLORS.gray[400]}
                />
              </View>
            </TouchableOpacity>
          ))}

          {/* 자녀 등록 요청 버튼 */}
          <TouchableOpacity
            onPress={() => navigation.navigate('ChildRegistrationRequest')}
            className="bg-white rounded-3xl p-5 border-2 border-dashed"
            style={{
              borderColor: PARENT_COLORS.gray[300],
            }}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons
                name="add-circle-outline"
                size={24}
                color={PARENT_COLORS.primary.DEFAULT}
              />
              <Text
                className="text-base font-bold ml-2"
                style={{ color: PARENT_COLORS.primary.DEFAULT }}
              >
                자녀 등록 요청하기
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
