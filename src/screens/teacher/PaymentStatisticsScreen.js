// src/screens/teacher/PaymentStatisticsScreen.js
import React, { useState, useMemo, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  Text,
  Card,
  ScreenHeader,
  MonthlyRevenueChart,
  PieChartComponent,
} from '../../components/common';
import TEACHER_COLORS from '../../styles/teacher_colors';
import { useStudentStore, usePaymentStore } from '../../store';
import { useToastStore } from '../../store';

export default function PaymentStatisticsScreen({ navigation }) {
  const toast = useToastStore();
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [loading, setLoading] = useState(true);

  const { students, fetchStudents } = useStudentStore();
  const { payments, fetchAllPayments } = usePaymentStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchStudents(), fetchAllPayments()]);
    setLoading(false);
  };

  const periodOptions = [
    { value: '6months', label: '6개월' },
    { value: '3months', label: '3개월' },
    { value: '1year', label: '1년' },
  ];

  const monthsCount = selectedPeriod === '1year' ? 12 : selectedPeriod === '3months' ? 3 : 6;

  // 월별 매출 데이터 (StatisticsScreen에서 가져옴)
  const monthlyRevenueData = useMemo(() => {
    const now = new Date();
    const monthLabels = [];
    const monthValues = [];

    for (let i = monthsCount - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = `${date.getMonth() + 1}월`;
      monthLabels.push(monthLabel);

      const monthRevenue = payments
        .filter((p) => {
          if (!p.date || p.status !== 'paid') return false;
          const paymentDate = new Date(p.date);
          return (
            paymentDate.getFullYear() === date.getFullYear() &&
            paymentDate.getMonth() === date.getMonth()
          );
        })
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      monthValues.push(monthRevenue / 10000);
    }

    return {
      labels: monthLabels,
      data: monthValues,
    };
  }, [payments, monthsCount]);

  // 매출 통계
  const revenueStats = useMemo(() => {
    const values = monthlyRevenueData.data;
    const average = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    const max = values.length > 0 ? Math.max(...values) : 0;
    const total = values.reduce((a, b) => a + b, 0);

    return {
      average: Math.round(average),
      max: Math.round(max),
      total: Math.round(total),
    };
  }, [monthlyRevenueData]);

  // 납부율 통계
  const paymentRateStats = useMemo(() => {
    const totalStudents = students.length;
    if (totalStudents === 0) return { paid: 0, unpaid: 0, rate: 0 };

    const thisMonth = new Date();
    const monthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
    const monthEnd = new Date(thisMonth.getFullYear(), thisMonth.getMonth() + 1, 0);

    const paidCount = payments.filter((p) => {
      if (p.status !== 'paid' || !p.date) return false;
      const paymentDate = new Date(p.date);
      return paymentDate >= monthStart && paymentDate <= monthEnd;
    }).length;

    return {
      paid: paidCount,
      unpaid: totalStudents - paidCount,
      rate: Math.round((paidCount / totalStudents) * 100),
    };
  }, [payments, students]);

  // 납부율 파이 차트 데이터
  const paymentRateChartData = useMemo(() => {
    return [
      {
        name: '납부',
        count: paymentRateStats.paid,
        color: TEACHER_COLORS.green[500],
        legendFontColor: TEACHER_COLORS.gray[600],
        legendFontSize: 12,
      },
      {
        name: '미납',
        count: paymentRateStats.unpaid,
        color: TEACHER_COLORS.danger[500],
        legendFontColor: TEACHER_COLORS.gray[600],
        legendFontSize: 12,
      },
    ];
  }, [paymentRateStats]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScreenHeader title="수강료 통계" onBack={() => navigation.goBack()} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={TEACHER_COLORS.primary.DEFAULT} />
          <Text className="text-gray-500 mt-4">데이터를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScreenHeader title="수강료 통계" onBack={() => navigation.goBack()} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* 기간 선택 */}
        <View className="px-5 pt-4 pb-2">
          <View className="flex-row bg-white rounded-xl p-1.5 shadow-sm">
            {periodOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => setSelectedPeriod(option.value)}
                className={`flex-1 py-2 rounded-lg`}
                style={
                  selectedPeriod === option.value
                    ? { backgroundColor: TEACHER_COLORS.primary.DEFAULT }
                    : {}
                }
              >
                <Text
                  className={`text-center font-semibold ${
                    selectedPeriod === option.value ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 월별 수입 그래프 */}
        <Card className="mx-5 mt-4">
          <MonthlyRevenueChart data={monthlyRevenueData} title="월별 수입 현황" />

          <View className="mt-4 pt-4 border-t border-gray-100 flex-row justify-between">
            <View>
              <Text className="text-xs text-gray-500 mb-1">평균 월수입</Text>
              <Text className="text-lg font-bold text-gray-800">
                {revenueStats.average}만원
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-xs text-gray-500 mb-1">총 수입</Text>
              <Text className="text-lg font-bold text-purple-600">
                {revenueStats.total}만원
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-xs text-gray-500 mb-1">최고 수입</Text>
              <Text className="text-lg font-bold text-green-600">
                {revenueStats.max}만원
              </Text>
            </View>
          </View>
        </Card>

        {/* 이번 달 납부율 */}
        <Card className="mx-5 mt-4">
          <PieChartComponent data={paymentRateChartData} title="이번 달 납부율" />

          <View className="mt-4 pt-4 border-t border-gray-100 flex-row justify-between">
            <View>
              <Text className="text-xs text-gray-500 mb-1">납부 학생</Text>
              <Text className="text-lg font-bold text-green-600">
                {paymentRateStats.paid}명
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-xs text-gray-500 mb-1">납부율</Text>
              <Text className="text-2xl font-bold text-gray-800">
                {paymentRateStats.rate}%
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-xs text-gray-500 mb-1">미납 학생</Text>
              <Text className="text-lg font-bold text-red-600">
                {paymentRateStats.unpaid}명
              </Text>
            </View>
          </View>
        </Card>

        {/* 학생별 납부 패턴 (준비중) */}
        <Card className="mx-5 mt-4 mb-5">
          <View className="flex-row items-center mb-4">
            <View className="bg-purple-100 rounded-full p-3 mr-3">
              <Ionicons name="people" size={24} color="#A855F7" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-bold text-lg mb-1">학생별 납부 패턴</Text>
              <Text className="text-gray-500 text-sm">정기 납부자 vs 연체자 분석</Text>
            </View>
          </View>
          <View className="bg-gray-50 rounded-xl p-8 items-center">
            <Ionicons name="analytics-outline" size={48} color="#9CA3AF" />
            <Text className="text-gray-400 text-sm mt-2">준비중입니다</Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
