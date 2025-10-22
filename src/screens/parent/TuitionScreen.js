// src/screens/parent/TuitionScreen.js
import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../../components/common';
import PARENT_COLORS from '../../styles/parent_colors';
import { getTuitionByStudentId, getStudentById } from '../../services/firestoreService';
import { useAuthStore } from '../../store/authStore';

export default function TuitionScreen() {
  const { user } = useAuthStore();
  const [tuitionRecords, setTuitionRecords] = useState([]);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 수강료 데이터 로드
  const loadTuition = async () => {
    if (!user?.studentId) {
      setLoading(false);
      return;
    }

    try {
      // 학생 정보 가져오기
      const studentResult = await getStudentById(user.studentId);
      if (studentResult.success && studentResult.data) {
        setStudentData(studentResult.data);
      }

      // 수강료 내역 가져오기
      const tuitionResult = await getTuitionByStudentId(user.studentId);
      if (tuitionResult.success) {
        setTuitionRecords(tuitionResult.data);
      }
    } catch (error) {
      console.error('수강료 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTuition();
  }, [user?.studentId]);

  const onRefresh = () => {
    setRefreshing(true);
    loadTuition();
  };

  // 현재 활성 수강권 찾기 (가장 최근 결제)
  const activePayment = useMemo(() => {
    const paidRecords = tuitionRecords.filter(r => r.isPaid);
    return paidRecords.length > 0 ? paidRecords[0] : null;
  }, [tuitionRecords]);

  // 통계 계산
  const stats = useMemo(() => {
    const totalPaid = tuitionRecords.filter(r => r.isPaid).length;
    const totalUnpaid = tuitionRecords.filter(r => !r.isPaid).length;
    const totalAmount = tuitionRecords
      .filter(r => r.isPaid)
      .reduce((sum, r) => sum + (r.amount || 0), 0);

    return {
      totalPaid,
      totalUnpaid,
      totalAmount,
      remainingLessons: studentData?.ticketCount || 0,
    };
  }, [tuitionRecords, studentData]);

  // 금액 포맷팅
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color={PARENT_COLORS.primary.DEFAULT} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <SafeAreaView className="flex-1">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* 그라디언트 헤더 */}
          <LinearGradient
            colors={['#F59E0B', '#D97706']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingTop: 50, paddingBottom: 80 }}
          >
            <View className="px-5">
              <Text className="text-white text-3xl font-bold mb-2">수강료 관리</Text>
              <View className="flex-row items-center">
                <Text className="text-white/80 text-sm">결제 내역 및 수강권 정보</Text>
                <View className="bg-white/20 rounded-full px-3 py-1 ml-3">
                  <Text className="text-white font-bold text-sm">{tuitionRecords.length}건</Text>
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* 플로팅 통계 카드 */}
          <View className="px-5" style={{ marginTop: -60 }}>
            <View
              className="bg-white rounded-3xl p-5 mb-4"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <View className="flex-row justify-around">
                <View className="items-center">
                  <View className="bg-green-100 rounded-full p-3 mb-2">
                    <Ionicons name="checkmark-circle" size={24} color={PARENT_COLORS.success[600]} />
                  </View>
                  <Text className="text-gray-500 text-xs mb-1">완료</Text>
                  <Text className="text-gray-800 font-bold text-xl">{stats.totalPaid}건</Text>
                </View>

                <View className="items-center">
                  <View className="bg-orange-100 rounded-full p-3 mb-2">
                    <Ionicons name="card" size={24} color={PARENT_COLORS.warning.DEFAULT} />
                  </View>
                  <Text className="text-gray-500 text-xs mb-1">총 납부액</Text>
                  <Text className="text-gray-800 font-bold text-lg">{formatCurrency(stats.totalAmount)}</Text>
                </View>

                <View className="items-center">
                  <View className="bg-blue-100 rounded-full p-3 mb-2">
                    <Ionicons name="ticket" size={24} color={PARENT_COLORS.blue[600]} />
                  </View>
                  <Text className="text-gray-500 text-xs mb-1">남은 수업</Text>
                  <Text className="text-gray-800 font-bold text-xl">{stats.remainingLessons}회</Text>
                </View>
              </View>
            </View>

            {/* 현재 수강권 */}
            {activePayment && (
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
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-gray-800 font-bold text-lg">현재 수강권</Text>
                  <View
                    className="px-3 py-1 rounded-full"
                    style={{ backgroundColor: PARENT_COLORS.success[50] }}
                  >
                    <Text className="text-xs font-bold" style={{ color: PARENT_COLORS.success[600] }}>
                      사용중
                    </Text>
                  </View>
                </View>

                <View
                  className="rounded-2xl p-4"
                  style={{
                    backgroundColor: PARENT_COLORS.warning.DEFAULT + '10',
                    borderWidth: 2,
                    borderColor: PARENT_COLORS.warning.DEFAULT + '30',
                  }}
                >
                  <View className="flex-row items-center mb-3">
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: PARENT_COLORS.warning.DEFAULT + '20' }}
                    >
                      <Ionicons name="ticket" size={24} color={PARENT_COLORS.warning.DEFAULT} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-800 font-bold text-lg">{activePayment.type}</Text>
                      <Text className="text-gray-500 text-sm">
                        {new Date(activePayment.date).toLocaleDateString('ko-KR')} 결제
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center justify-between pt-3 border-t" style={{ borderColor: PARENT_COLORS.warning.DEFAULT + '20' }}>
                    <Text className="text-gray-600">결제 금액</Text>
                    <Text className="text-gray-800 font-bold text-xl">
                      {formatCurrency(activePayment.amount)}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* 미납 알림 */}
            {stats.totalUnpaid > 0 && (
              <View
                className="rounded-3xl p-5 mb-4"
                style={{
                  backgroundColor: PARENT_COLORS.danger[50],
                  borderWidth: 1,
                  borderColor: PARENT_COLORS.danger[200],
                }}
              >
                <View className="flex-row items-center mb-3">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: PARENT_COLORS.danger.DEFAULT }}
                  >
                    <Ionicons name="warning" size={20} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-800 font-bold text-base">미납 내역 {stats.totalUnpaid}건</Text>
                    <Text className="text-gray-600 text-sm">빠른 납부 부탁드립니다</Text>
                  </View>
                </View>
                <TouchableOpacity
                  className="rounded-xl py-3 items-center"
                  style={{ backgroundColor: PARENT_COLORS.danger.DEFAULT }}
                  activeOpacity={0.8}
                >
                  <Text className="text-white font-bold">납부하기</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 결제 내역 */}
            {tuitionRecords.length > 0 ? (
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
                <Text className="text-gray-800 font-bold text-lg mb-4">결제 내역</Text>

                {tuitionRecords.map((record, index) => {
                  const isPaid = record.isPaid;
                  const statusConfig = isPaid
                    ? { icon: 'checkmark-circle', color: PARENT_COLORS.success[600], bg: PARENT_COLORS.success[50], label: '완료' }
                    : { icon: 'time', color: PARENT_COLORS.danger.DEFAULT, bg: PARENT_COLORS.danger[50], label: '미납' };

                  return (
                    <View
                      key={record.id || index}
                      className={`flex-row items-center ${index !== tuitionRecords.length - 1 ? 'mb-4 pb-4 border-b' : ''}`}
                      style={{ borderColor: PARENT_COLORS.gray[100] }}
                    >
                      <View
                        className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
                        style={{ backgroundColor: statusConfig.bg }}
                      >
                        <Ionicons name={statusConfig.icon} size={24} color={statusConfig.color} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-800 font-bold text-base mb-1">
                          {record.type || '수강료'}
                        </Text>
                        <Text className="text-gray-500 text-sm">
                          {new Date(record.date).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </Text>
                        {record.method && (
                          <Text className="text-gray-400 text-xs mt-0.5">{record.method}</Text>
                        )}
                      </View>
                      <View className="items-end">
                        <Text className="text-gray-800 font-bold text-lg mb-1">
                          {formatCurrency(record.amount)}
                        </Text>
                        <View
                          className="px-2 py-1 rounded-full"
                          style={{ backgroundColor: statusConfig.bg }}
                        >
                          <Text className="text-xs font-bold" style={{ color: statusConfig.color }}>
                            {statusConfig.label}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View
                className="bg-white rounded-3xl p-8 mb-6 items-center"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <View className="bg-gray-100 rounded-full p-6 mb-4">
                  <Ionicons name="receipt-outline" size={48} color={PARENT_COLORS.gray[400]} />
                </View>
                <Text className="text-gray-800 font-bold text-lg mb-2">결제 내역이 없습니다</Text>
                <Text className="text-gray-500 text-sm text-center">
                  아직 등록된 결제 내역이 없습니다
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
