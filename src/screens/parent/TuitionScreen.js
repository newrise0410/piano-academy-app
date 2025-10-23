// src/screens/parent/TuitionScreen.js
import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Modal, TextInput, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
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

  // 상세보기 모달
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // 자동 알림 설정 모달
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [autoReminderEnabled, setAutoReminderEnabled] = useState(false);
  const [reminderDay, setReminderDay] = useState('25');

  const loadTuition = async () => {
    if (!user?.studentId) {
      setLoading(false);
      return;
    }

    try {
      const studentResult = await getStudentById(user.studentId);
      if (studentResult.success && studentResult.data) {
        setStudentData(studentResult.data);
      }

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

  const activePayment = useMemo(() => {
    const paidRecords = tuitionRecords.filter(r => r.isPaid);
    return paidRecords.length > 0 ? paidRecords[0] : null;
  }, [tuitionRecords]);

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const handleOpenDetail = (record) => {
    setSelectedRecord(record);
    setDetailModalVisible(true);
  };

  const handleSaveReminderSettings = () => {
    Alert.alert('저장 완료', `매월 ${reminderDay}일에 수강료 납부 알림을 받습니다.`);
    setSettingsModalVisible(false);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color={PARENT_COLORS.primary.DEFAULT} />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: '#F8F9FC' }}>
      <SafeAreaView className="flex-1">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* 모던 그라디언트 헤더 */}
          <LinearGradient
            colors={['#FF6B9D', '#C44569', '#A73489']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingTop: 60, paddingBottom: 100, position: 'relative' }}
          >
            {/* 장식용 원형 요소 */}
            <View style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.1)' }} />
            <View style={{ position: 'absolute', bottom: -30, left: -30, width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.08)' }} />

            <View className="px-6">
              <View className="flex-row items-center justify-between mb-3">
                <View>
                  <Text className="text-white/80 text-sm mb-1">💳 Payment</Text>
                  <Text className="text-white text-3xl font-bold tracking-tight">수강료 관리</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setSettingsModalVisible(true)}
                  className="rounded-2xl p-3"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="settings-sharp" size={22} color="white" />
                </TouchableOpacity>
              </View>
              <View className="flex-row items-center mt-2">
                <View className="bg-white/20 rounded-full px-3 py-1.5 backdrop-blur">
                  <Text className="text-white font-bold text-sm">{tuitionRecords.length}건의 내역</Text>
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* 플로팅 통계 카드 */}
          <View className="px-6" style={{ marginTop: -70 }}>
            <View
              className="bg-white rounded-3xl p-6 mb-5"
              style={{
                shadowColor: '#FF6B9D',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15,
                shadowRadius: 20,
                elevation: 12,
              }}
            >
              <View className="flex-row justify-around">
                <View className="items-center">
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    className="rounded-2xl p-4 mb-3"
                    style={{ width: 64, height: 64 }}
                  >
                    <Ionicons name="checkmark-circle" size={32} color="white" />
                  </LinearGradient>
                  <Text className="text-gray-500 text-xs mb-1 font-medium">완료</Text>
                  <Text className="text-gray-900 font-black text-2xl">{stats.totalPaid}</Text>
                </View>

                <View className="items-center">
                  <LinearGradient
                    colors={['#F59E0B', '#D97706']}
                    className="rounded-2xl p-4 mb-3"
                    style={{ width: 64, height: 64 }}
                  >
                    <Ionicons name="wallet" size={32} color="white" />
                  </LinearGradient>
                  <Text className="text-gray-500 text-xs mb-1 font-medium">총 납부액</Text>
                  <Text className="text-gray-900 font-black text-base">{formatCurrency(stats.totalAmount).replace('₩', '')}</Text>
                </View>

                <View className="items-center">
                  <LinearGradient
                    colors={['#3B82F6', '#2563EB']}
                    className="rounded-2xl p-4 mb-3"
                    style={{ width: 64, height: 64 }}
                  >
                    <Ionicons name="ticket" size={32} color="white" />
                  </LinearGradient>
                  <Text className="text-gray-500 text-xs mb-1 font-medium">남은 수업</Text>
                  <Text className="text-gray-900 font-black text-2xl">{stats.remainingLessons}</Text>
                </View>
              </View>
            </View>

            {/* 현재 수강권 - 글래스모피즘 */}
            {activePayment && (
              <View
                className="rounded-3xl p-6 mb-5 overflow-hidden"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.08,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                <View className="flex-row items-center justify-between mb-4">
                  <View>
                    <Text className="text-gray-500 text-sm mb-1">현재 사용중</Text>
                    <Text className="text-gray-900 font-bold text-xl">Active Plan</Text>
                  </View>
                  <View
                    className="px-4 py-2 rounded-full"
                    style={{ backgroundColor: PARENT_COLORS.success[100] }}
                  >
                    <Text className="text-xs font-bold" style={{ color: PARENT_COLORS.success[700] }}>
                      ● ACTIVE
                    </Text>
                  </View>
                </View>

                <LinearGradient
                  colors={['#FEF3C7', '#FDE68A']}
                  className="rounded-2xl p-5"
                  style={{ borderWidth: 2, borderColor: '#FCD34D' }}
                >
                  <View className="flex-row items-center mb-4">
                    <View
                      className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
                      style={{ backgroundColor: 'rgba(245,158,11,0.2)' }}
                    >
                      <Ionicons name="ticket" size={28} color="#D97706" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-900 font-bold text-lg">{activePayment.type}</Text>
                      <Text className="text-gray-600 text-sm mt-1">
                        {new Date(activePayment.date).toLocaleDateString('ko-KR')} 결제
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center justify-between pt-4 border-t-2 border-amber-300">
                    <Text className="text-gray-700 font-medium">결제 금액</Text>
                    <Text className="text-gray-900 font-black text-2xl">
                      {formatCurrency(activePayment.amount)}
                    </Text>
                  </View>
                </LinearGradient>
              </View>
            )}

            {/* 미납 알림 - 모던 디자인 */}
            {stats.totalUnpaid > 0 && (
              <View
                className="rounded-3xl p-5 mb-5"
                style={{
                  backgroundColor: '#FEE2E2',
                  borderWidth: 2,
                  borderColor: '#FECACA',
                }}
              >
                <View className="flex-row items-center mb-4">
                  <View
                    className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                    style={{ backgroundColor: PARENT_COLORS.danger.DEFAULT }}
                  >
                    <Ionicons name="warning-sharp" size={24} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-bold text-base">미납 내역 {stats.totalUnpaid}건</Text>
                    <Text className="text-gray-600 text-sm mt-0.5">빠른 납부 부탁드립니다</Text>
                  </View>
                </View>
                <TouchableOpacity
                  className="rounded-2xl py-4 items-center"
                  style={{
                    backgroundColor: PARENT_COLORS.danger.DEFAULT,
                    shadowColor: PARENT_COLORS.danger.DEFAULT,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                  }}
                  activeOpacity={0.8}
                >
                  <Text className="text-white font-bold text-base">납부하기</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 결제 내역 - 모던 리스트 */}
            {tuitionRecords.length > 0 ? (
              <View className="mb-6">
                <Text className="text-gray-900 font-bold text-xl mb-4">결제 내역</Text>

                {tuitionRecords.map((record, index) => {
                  const isPaid = record.isPaid;
                  const statusConfig = isPaid
                    ? { icon: 'checkmark-circle-sharp', color: '#10B981', bg: '#D1FAE5', label: '완료' }
                    : { icon: 'time', color: '#EF4444', bg: '#FEE2E2', label: '미납' };

                  return (
                    <TouchableOpacity
                      key={record.id || index}
                      onPress={() => handleOpenDetail(record)}
                      className="rounded-3xl p-5 mb-3"
                      style={{
                        backgroundColor: 'white',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.06,
                        shadowRadius: 8,
                        elevation: 3,
                      }}
                      activeOpacity={0.7}
                    >
                      <View className="flex-row items-center">
                        <View
                          className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
                          style={{ backgroundColor: statusConfig.bg }}
                        >
                          <Ionicons name={statusConfig.icon} size={28} color={statusConfig.color} />
                        </View>
                        <View className="flex-1">
                          <Text className="text-gray-900 font-bold text-base mb-1">
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
                            <Text className="text-gray-400 text-xs mt-1">{record.method}</Text>
                          )}
                        </View>
                        <View className="items-end">
                          <Text className="text-gray-900 font-black text-lg mb-2">
                            {formatCurrency(record.amount)}
                          </Text>
                          <View
                            className="px-3 py-1.5 rounded-full"
                            style={{ backgroundColor: statusConfig.bg }}
                          >
                            <Text className="text-xs font-bold" style={{ color: statusConfig.color }}>
                              {statusConfig.label}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View
                className="bg-white rounded-3xl p-10 mb-6 items-center"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <View
                  className="bg-gray-100 rounded-3xl p-8 mb-4"
                  style={{ width: 100, height: 100 }}
                >
                  <Ionicons name="receipt-outline" size={64} color={PARENT_COLORS.gray[400]} />
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

      {/* 결제 내역 상세보기 모달 */}
      <Modal
        visible={detailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="bg-white rounded-t-3xl p-6" style={{ maxHeight: '85%' }}>
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-gray-900 font-bold text-2xl">결제 상세</Text>
              <TouchableOpacity
                onPress={() => setDetailModalVisible(false)}
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: PARENT_COLORS.gray[100] }}
              >
                <Ionicons name="close" size={24} color={PARENT_COLORS.gray[600]} />
              </TouchableOpacity>
            </View>

            {selectedRecord && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="items-center mb-8">
                  <LinearGradient
                    colors={selectedRecord.isPaid ? ['#10B981', '#059669'] : ['#EF4444', '#DC2626']}
                    className="w-24 h-24 rounded-3xl items-center justify-center mb-4"
                  >
                    <Ionicons
                      name={selectedRecord.isPaid ? 'checkmark-circle-sharp' : 'time'}
                      size={56}
                      color="white"
                    />
                  </LinearGradient>
                  <Text className="text-gray-900 font-black text-3xl mb-2">
                    {formatCurrency(selectedRecord.amount)}
                  </Text>
                  <View
                    className="px-5 py-2 rounded-full"
                    style={{
                      backgroundColor: selectedRecord.isPaid ? '#D1FAE5' : '#FEE2E2'
                    }}
                  >
                    <Text
                      className="text-sm font-bold"
                      style={{
                        color: selectedRecord.isPaid ? '#059669' : '#DC2626'
                      }}
                    >
                      {selectedRecord.isPaid ? '✓ 결제 완료' : '⏱ 미납'}
                    </Text>
                  </View>
                </View>

                <View className="bg-gray-50 rounded-3xl p-5 mb-4">
                  <View className="flex-row items-center py-4 border-b border-gray-200">
                    <Text className="text-gray-600 w-24 font-medium">항목</Text>
                    <Text className="text-gray-900 font-bold flex-1">
                      {selectedRecord.type || '수강료'}
                    </Text>
                  </View>
                  <View className="flex-row items-center py-4 border-b border-gray-200">
                    <Text className="text-gray-600 w-24 font-medium">결제일</Text>
                    <Text className="text-gray-900 font-semibold flex-1">
                      {new Date(selectedRecord.date).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'short',
                      })}
                    </Text>
                  </View>
                  {selectedRecord.method && (
                    <View className="flex-row items-center py-4 border-b border-gray-200">
                      <Text className="text-gray-600 w-24 font-medium">결제 방법</Text>
                      <Text className="text-gray-900 font-semibold flex-1">
                        {selectedRecord.method}
                      </Text>
                    </View>
                  )}
                  <View className="flex-row items-center py-4">
                    <Text className="text-gray-600 w-24 font-medium">금액</Text>
                    <Text
                      className="font-black text-xl flex-1"
                      style={{ color: PARENT_COLORS.primary.DEFAULT }}
                    >
                      {formatCurrency(selectedRecord.amount)}
                    </Text>
                  </View>
                </View>

                {selectedRecord.memo && (
                  <View className="rounded-3xl p-5 mb-4" style={{ backgroundColor: '#EFF6FF' }}>
                    <View className="flex-row items-center mb-3">
                      <Ionicons name="document-text" size={22} color="#3B82F6" />
                      <Text className="text-gray-900 font-bold ml-2 text-base">메모</Text>
                    </View>
                    <Text className="text-gray-700 leading-6">{selectedRecord.memo}</Text>
                  </View>
                )}

                {selectedRecord.receiptNumber && (
                  <View className="bg-gray-50 rounded-3xl p-5">
                    <View className="flex-row items-center justify-between">
                      <View>
                        <Text className="text-gray-600 text-sm mb-1 font-medium">영수증 번호</Text>
                        <Text className="text-gray-900 font-bold text-base">
                          {selectedRecord.receiptNumber}
                        </Text>
                      </View>
                      <TouchableOpacity
                        className="px-5 py-3 rounded-2xl"
                        style={{ backgroundColor: PARENT_COLORS.primary.DEFAULT }}
                      >
                        <Text className="text-white font-bold">복사</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* 자동 알림 설정 모달 */}
      <Modal
        visible={settingsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSettingsModalVisible(false)}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-gray-900 font-bold text-2xl">수강료 알림 설정</Text>
              <TouchableOpacity
                onPress={() => setSettingsModalVisible(false)}
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: PARENT_COLORS.gray[100] }}
              >
                <Ionicons name="close" size={24} color={PARENT_COLORS.gray[600]} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="flex-row items-center justify-between py-5 px-4 rounded-2xl mb-4" style={{ backgroundColor: '#F9FAFB' }}>
                <View className="flex-1 mr-4">
                  <Text className="text-gray-900 font-bold text-base mb-2">
                    자동 납부 알림
                  </Text>
                  <Text className="text-gray-600 text-sm leading-5">
                    매월 지정한 날짜에 수강료 납부 알림을 받습니다
                  </Text>
                </View>
                <Switch
                  value={autoReminderEnabled}
                  onValueChange={setAutoReminderEnabled}
                  trackColor={{ false: '#D1D5DB', true: PARENT_COLORS.primary.DEFAULT }}
                  thumbColor="white"
                />
              </View>

              {autoReminderEnabled && (
                <View className="py-5">
                  <Text className="text-gray-900 font-bold mb-4 text-lg">알림 받을 날짜</Text>
                  <View className="flex-row items-center justify-center py-8 rounded-3xl" style={{ backgroundColor: '#FEF3C7' }}>
                    <Text className="text-gray-700 text-lg font-medium mr-3">매월</Text>
                    <TextInput
                      value={reminderDay}
                      onChangeText={setReminderDay}
                      keyboardType="number-pad"
                      maxLength={2}
                      className="bg-white rounded-2xl px-6 py-4 text-center font-black text-2xl"
                      style={{
                        borderWidth: 3,
                        borderColor: '#FCD34D',
                        width: 90,
                        shadowColor: '#F59E0B',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 8,
                      }}
                    />
                    <Text className="text-gray-700 text-lg font-medium ml-3">일</Text>
                  </View>
                  <Text className="text-gray-500 text-sm mt-4 text-center">
                    매월 {reminderDay}일에 수강료 납부 알림을 받습니다
                  </Text>
                </View>
              )}

              <TouchableOpacity
                onPress={handleSaveReminderSettings}
                className="rounded-2xl py-5 mt-6"
                style={{
                  backgroundColor: PARENT_COLORS.primary.DEFAULT,
                  shadowColor: PARENT_COLORS.primary.DEFAULT,
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                }}
              >
                <Text className="text-white text-center font-bold text-base">
                  저장하기
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
