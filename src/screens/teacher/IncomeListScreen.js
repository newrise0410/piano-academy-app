import { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, ScreenHeader } from '../../components/common';
import { usePaymentStore } from '../../store';
import { formatCurrency } from '../../utils';

export default function IncomeListScreen({ route, navigation }) {
  const { settlementPeriod: settlementPeriodParam } = route.params || {};
  const [refreshing, setRefreshing] = useState(false);
  const { payments, fetchAllPayments, deletePayment } = usePaymentStore();

  // Convert ISO string dates to Date objects
  const settlementPeriod = useMemo(() => {
    if (!settlementPeriodParam) return null;
    return {
      startDate: new Date(settlementPeriodParam.startDate),
      endDate: new Date(settlementPeriodParam.endDate),
    };
  }, [settlementPeriodParam]);

  useEffect(() => {
    fetchAllPayments();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllPayments(true);
    setRefreshing(false);
  };

  const handleEditPayment = (payment) => {
    // TODO: 수정 기능 구현 (FinanceManagement로 이동하여 수정)
    navigation.navigate('FinanceManagement', {
      screen: 'FinanceManagementMain',
      params: { editPayment: payment }
    });
  };

  const handleDeletePayment = async (paymentId) => {
    Alert.alert(
      '수입 삭제',
      '이 수입 내역을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePayment(paymentId);
              await fetchAllPayments();
              Alert.alert('완료', '수입이 삭제되었습니다.');
            } catch (error) {
              Alert.alert('오류', error.message || '삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  // 정산 기간 내 수입 필터링
  const incomePayments = payments.filter(payment => {
    if (!payment.date || !settlementPeriod) return false;
    const paymentDate = payment.date instanceof Date ? payment.date : new Date(payment.date);
    return paymentDate >= settlementPeriod.startDate &&
           paymentDate <= settlementPeriod.endDate &&
           payment.status === 'paid';
  }).sort((a, b) => {
    const dateA = a.date instanceof Date ? a.date : new Date(a.date);
    const dateB = b.date instanceof Date ? b.date : new Date(b.date);
    return dateB - dateA; // 최신순
  });

  const totalIncome = incomePayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#FAFAFA' }}>
      <ScreenHeader title="수입 내역" onBackPress={() => navigation.goBack()} />

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* 헤더 통계 */}
        <View className="px-6 pt-4 pb-6">
          <View className="mb-2">
            <Text className="text-gray-500 text-sm">총 수입</Text>
          </View>
          <View className="flex-row items-end mb-3">
            <Text className="text-gray-900 font-black" style={{ fontSize: 48, lineHeight: 52 }}>
              {formatCurrency(totalIncome)}
            </Text>
            <Text className="text-gray-900 font-black text-2xl mb-2 ml-1">원</Text>
          </View>
          <View className="flex-row items-center">
            <View className="rounded-full px-3 py-1 mr-2" style={{ backgroundColor: '#F0F9FF' }}>
              <Text className="text-blue-600 text-xs font-bold">{incomePayments.length}건</Text>
            </View>
            <Text className="text-gray-400 text-xs">
              {settlementPeriod?.startDate.getMonth() + 1}/{settlementPeriod?.startDate.getDate()} ~ {settlementPeriod?.endDate.getMonth() + 1}/{settlementPeriod?.endDate.getDate()}
            </Text>
          </View>
        </View>

        {/* 수입 내역 리스트 */}
        <View className="px-6">
          {incomePayments.length > 0 ? (
            incomePayments.map((payment, index) => (
              <View
                key={payment.id || index}
                className="rounded-2xl p-4 mb-3"
                style={{
                  backgroundColor: 'white',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 3,
                  elevation: 2,
                }}
              >
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1 mr-3">
                    <Text className="text-gray-900 font-bold text-base mb-1">
                      {payment.studentName || '학생'}
                    </Text>
                    <Text className="text-gray-400 text-xs">
                      {payment.date instanceof Date
                        ? payment.date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
                        : new Date(payment.date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-gray-900 font-black text-xl mb-1">
                      +{formatCurrency(payment.amount)}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center flex-wrap">
                  {payment.type && (
                    <View className="rounded-full px-2.5 py-1 mr-2 mb-1" style={{ backgroundColor: '#F0F9FF' }}>
                      <Text className="text-blue-600 text-xs font-medium">{payment.type}</Text>
                    </View>
                  )}
                  {payment.method && (
                    <View className="rounded-full px-2.5 py-1 mr-2 mb-1" style={{ backgroundColor: '#F9FAFB' }}>
                      <Text className="text-gray-600 text-xs font-medium">{payment.method}</Text>
                    </View>
                  )}
                  <View className="rounded-full px-2.5 py-1 mb-1" style={{ backgroundColor: '#ECFDF5' }}>
                    <Text className="text-green-600 text-xs font-medium">완료</Text>
                  </View>
                </View>

                {payment.memo && (
                  <View className="mt-3 pt-3 border-t border-gray-50">
                    <Text className="text-gray-500 text-sm">{payment.memo}</Text>
                  </View>
                )}

                {/* 수정/삭제 버튼 */}
                <View className="flex-row items-center pt-3 mt-3 border-t border-gray-50">
                  <TouchableOpacity
                    onPress={() => handleEditPayment(payment)}
                    className="flex-1 rounded-full py-2 mr-2"
                    style={{ backgroundColor: '#F9FAFB' }}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center justify-center">
                      <Ionicons name="pencil-outline" size={14} color="#6B7280" />
                      <Text className="text-gray-600 font-medium text-xs ml-1.5">수정</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeletePayment(payment.id)}
                    className="flex-1 rounded-full py-2 ml-2"
                    style={{ backgroundColor: '#FEF2F2' }}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center justify-center">
                      <Ionicons name="trash-outline" size={14} color="#EF4444" />
                      <Text className="text-red-600 font-medium text-xs ml-1.5">삭제</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View className="items-center py-32">
              <View className="w-16 h-16 rounded-full items-center justify-center mb-3"
                style={{ backgroundColor: '#F9FAFB' }}>
                <Ionicons name="wallet-outline" size={32} color="#D1D5DB" />
              </View>
              <Text className="text-gray-900 font-bold text-base mb-1">수입 내역이 없습니다</Text>
              <Text className="text-gray-400 text-sm">
                정산 기간 내 결제 내역이 없습니다
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
