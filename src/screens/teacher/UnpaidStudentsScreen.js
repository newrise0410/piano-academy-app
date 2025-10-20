import React, { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, LevelBadge, UnpaidBadge, Button, ScreenHeader } from '../../components/common';
import TEACHER_COLORS from '../../styles/teacher_colors';
import { useStudentStore, useToastStore } from '../../store';
import { formatCurrency } from '../../utils';

/**
 * UnpaidStudentsScreen - 미납 학생 전체보기 화면
 * BottomSheet 모달에서 "전체보기" 버튼으로 이동
 * 추가 기능: 학생 상세 이동, 수강료 입력, 정렬 옵션
 */
export default function UnpaidStudentsScreen({ navigation }) {
  const { students, fetchStudents } = useStudentStore();
  const toast = useToastStore();
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState('date'); // 'date' | 'amount' | 'name'

  // 새로고침
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStudents();
    setRefreshing(false);
  };

  // 미납 학생 필터링 및 정렬
  const unpaidStudents = useMemo(() => {
    const filtered = (students || [])
      .filter(s => s.unpaid === true)
      .map(s => ({
        ...s,
        unpaidAmount: 280000, // 실제로는 DB에서
        lastPaymentDate: '2025.01.05', // 실제로는 DB에서
      }));

    // 정렬
    if (sortBy === 'date') {
      return filtered.sort((a, b) => {
        const dateA = new Date(a.lastPaymentDate || '2000-01-01');
        const dateB = new Date(b.lastPaymentDate || '2000-01-01');
        return dateA - dateB;
      });
    } else if (sortBy === 'amount') {
      return filtered.sort((a, b) => (b.unpaidAmount || 0) - (a.unpaidAmount || 0));
    } else {
      return filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
  }, [students, sortBy]);

  // 총 미납 금액
  const totalUnpaid = useMemo(() => {
    return unpaidStudents.reduce((sum, s) => sum + (s.unpaidAmount || 0), 0);
  }, [unpaidStudents]);

  // 연락하기
  const handleContact = (student) => {
    if (student.parentPhone) {
      Alert.alert(
        '학부모 연락',
        `${student.name} 학부모님께 전화하시겠습니까?`,
        [
          { text: '취소', style: 'cancel' },
          {
            text: '전화',
            onPress: () => Linking.openURL(`tel:${student.parentPhone}`),
          },
        ]
      );
    } else {
      toast.warning('등록된 연락처가 없습니다');
    }
  };

  // 수강료 입력
  const handlePayment = (student) => {
    // TODO: 수강료 입력 모달 또는 TuitionScreen으로 이동
    toast.info('수강료 입력 기능 준비 중');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* 헤더 */}
      <ScreenHeader
        title="미납 학생"
        subtitle={`${unpaidStudents.length}명의 미납 학생`}
      />

      {/* 통계 및 정렬 */}
      <View className="bg-white border-b border-gray-200 px-5 py-3">
        {/* 통계 */}
        <View className="bg-red-50 rounded-xl p-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm text-gray-700">총 미납 학생</Text>
            <Text className="text-lg font-bold text-gray-800">{unpaidStudents.length}명</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-gray-700">총 미납 금액</Text>
            <Text className="text-xl font-bold text-red-600">
              {formatCurrency(totalUnpaid)}
            </Text>
          </View>
        </View>

        {/* 정렬 옵션 */}
        <View className="flex-row mt-3 gap-2">
          <TouchableOpacity
            onPress={() => setSortBy('date')}
            className={`flex-1 py-2 px-3 rounded-lg ${
              sortBy === 'date' ? 'bg-primary' : 'bg-gray-100'
            }`}
            activeOpacity={0.7}
          >
            <Text className={`text-xs font-semibold text-center ${
              sortBy === 'date' ? 'text-white' : 'text-gray-600'
            }`}>
              납부일순
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSortBy('amount')}
            className={`flex-1 py-2 px-3 rounded-lg ${
              sortBy === 'amount' ? 'bg-primary' : 'bg-gray-100'
            }`}
            activeOpacity={0.7}
          >
            <Text className={`text-xs font-semibold text-center ${
              sortBy === 'amount' ? 'text-white' : 'text-gray-600'
            }`}>
              금액순
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSortBy('name')}
            className={`flex-1 py-2 px-3 rounded-lg ${
              sortBy === 'name' ? 'bg-primary' : 'bg-gray-100'
            }`}
            activeOpacity={0.7}
          >
            <Text className={`text-xs font-semibold text-center ${
              sortBy === 'name' ? 'text-white' : 'text-gray-600'
            }`}>
              이름순
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 학생 리스트 */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {unpaidStudents.length === 0 ? (
          <View className="py-20 items-center">
            <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="checkmark-circle" size={40} color={TEACHER_COLORS.success[600]} />
            </View>
            <Text className="text-gray-500 text-center">
              미납 학생이 없습니다
            </Text>
          </View>
        ) : (
          <View className="px-5 py-4">
            {unpaidStudents.map((student, idx) => (
              <TouchableOpacity
                key={student.id}
                onPress={() => navigation.navigate('StudentDetail', { studentId: student.id })}
                activeOpacity={0.7}
                className="bg-white border-2 border-red-200 rounded-xl p-4 mb-3"
              >
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    {/* 학생 정보 */}
                    <View className="flex-row items-center mb-2">
                      <Text className="text-base font-bold text-gray-800 mr-2">
                        {student.name}
                      </Text>
                      <LevelBadge level={student.level} />
                      <View className="ml-2">
                        <UnpaidBadge variant="small" />
                      </View>
                    </View>

                    {/* 수업 일정 */}
                    <View className="flex-row items-center mb-1">
                      <Ionicons name="calendar-outline" size={14} color={TEACHER_COLORS.gray[500]} />
                      <Text className="text-sm text-gray-600 ml-1">
                        {student.schedule}
                      </Text>
                    </View>

                    {/* 미납 금액 */}
                    <View className="flex-row items-center mb-1">
                      <Ionicons name="cash-outline" size={14} color={TEACHER_COLORS.red[600]} />
                      <Text className="text-sm font-bold text-red-600 ml-1">
                        미납: {formatCurrency(student.unpaidAmount || 280000)}
                      </Text>
                    </View>

                    {/* 마지막 납부일 */}
                    {student.lastPaymentDate && (
                      <View className="flex-row items-center">
                        <Ionicons name="time-outline" size={14} color={TEACHER_COLORS.gray[500]} />
                        <Text className="text-xs text-gray-500 ml-1">
                          마지막 납부: {student.lastPaymentDate}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* 연락 버튼 */}
                  <TouchableOpacity
                    onPress={() => handleContact(student)}
                    className="w-10 h-10 bg-primary bg-opacity-10 rounded-full items-center justify-center ml-2"
                    activeOpacity={0.7}
                  >
                    <Ionicons name="call" size={18} color={TEACHER_COLORS.primary.DEFAULT} />
                  </TouchableOpacity>
                </View>

                {/* 액션 버튼 */}
                <View className="flex-row gap-2">
                  <Button
                    title="수강료 입력"
                    icon="card"
                    variant="primary"
                    size="small"
                    onPress={() => handlePayment(student)}
                    style={{ flex: 1 }}
                  />
                  <Button
                    title="알림 발송"
                    icon="notifications"
                    variant="outline"
                    size="small"
                    onPress={() => toast.info('알림 발송 기능 준비 중')}
                    style={{ flex: 1 }}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* 안내 메시지 */}
      {unpaidStudents.length > 0 && (
        <View className="bg-yellow-50 border-t border-yellow-200 px-5 py-4">
          <View className="flex-row items-start">
            <Ionicons name="alert-circle" size={20} color={TEACHER_COLORS.warning[600]} />
            <View className="flex-1 ml-2">
              <Text className="text-sm text-gray-700 leading-5">
                정기적인 안내가 중요합니다. 전화 또는 알림장으로 학부모님께 연락해주세요.
              </Text>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
