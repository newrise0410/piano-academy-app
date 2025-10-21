// src/screens/teacher/StatisticsScreen.js
import React, { useState, useMemo, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Card,
  ScreenHeader,
  MonthlyRevenueChart,
  AttendanceRateChart,
  PieChartComponent,
} from '../../components/common';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import TEACHER_COLORS from '../../styles/teacher_colors';
import { useStudentStore, usePaymentStore, useAttendanceStore } from '../../store';

const screenWidth = Dimensions.get('window').width;

export default function StatisticsScreen({ navigation }) {
  const [selectedPeriod, setSelectedPeriod] = useState('6months'); // 6months, 3months, 1year
  const [loading, setLoading] = useState(true);

  const { students, fetchStudents } = useStudentStore();
  const { payments, fetchAllPayments } = usePaymentStore();
  const { records, fetchAllRecords } = useAttendanceStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchStudents(), fetchAllPayments(), fetchAllRecords()]);
    setLoading(false);
  };

  const periodOptions = [
    { value: '6months', label: '6개월' },
    { value: '3months', label: '3개월' },
    { value: '1year', label: '1년' },
  ];

  // 기간에 따른 개월 수 계산
  const monthsCount = selectedPeriod === '1year' ? 12 : selectedPeriod === '3months' ? 3 : 6;

  // 월별 매출 데이터 계산 (실제 결제 데이터 기반)
  const monthlyRevenueData = useMemo(() => {
    const now = new Date();
    const monthLabels = [];
    const monthValues = [];

    for (let i = monthsCount - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = `${date.getMonth() + 1}월`;
      monthLabels.push(monthLabel);

      // 해당 월의 결제 금액 합계
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

      monthValues.push(monthRevenue / 10000); // 만원 단위
    }

    return {
      labels: monthLabels,
      data: monthValues,
    };
  }, [payments, monthsCount]);

  // 평균 및 최고 매출 계산
  const revenueStats = useMemo(() => {
    const values = monthlyRevenueData.data;
    const average = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    const max = values.length > 0 ? Math.max(...values) : 0;

    return {
      average: Math.round(average),
      max: Math.round(max),
    };
  }, [monthlyRevenueData]);

  // 주간 출석률 데이터 계산
  const weeklyAttendanceData = useMemo(() => {
    const now = new Date();
    const weekLabels = [];
    const weekValues = [];

    // 최근 4주 데이터
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      weekLabels.push(`${i === 0 ? '이번주' : `${i + 1}주전`}`);

      // 해당 주의 출석률 계산
      const weekRecords = records.filter((r) => {
        if (!r.date) return false;
        const recordDate = new Date(r.date);
        return recordDate >= weekStart && recordDate < weekEnd;
      });

      const attendanceRate =
        weekRecords.length > 0
          ? (weekRecords.filter((r) => r.status === 'present').length / weekRecords.length) * 100
          : 0;

      weekValues.push(Math.round(attendanceRate));
    }

    return {
      labels: weekLabels,
      data: weekValues,
    };
  }, [records]);

  // 출석률 통계
  const attendanceStats = useMemo(() => {
    const values = weeklyAttendanceData.data;
    const average = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    const max = values.length > 0 ? Math.max(...values) : 0;

    return {
      average: Math.round(average),
      max: Math.round(max),
    };
  }, [weeklyAttendanceData]);

  // 학생 레벨 분포
  const studentLevelDistribution = useMemo(() => {
    const levelCounts = students.reduce((acc, student) => {
      const level = student.level || '초급';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});

    const colors = {
      초급: TEACHER_COLORS.green[500],
      중급: TEACHER_COLORS.blue[500],
      고급: TEACHER_COLORS.purple[500],
    };

    return Object.entries(levelCounts).map(([level, count]) => ({
      name: level,
      count,
      color: colors[level] || TEACHER_COLORS.gray[500],
      legendFontColor: TEACHER_COLORS.gray[600],
      legendFontSize: 12,
    }));
  }, [students]);

  // 수강권 타입 분포
  const ticketTypeDistribution = useMemo(() => {
    const typeCounts = students.reduce(
      (acc, student) => {
        const type = student.ticketType === 'period' ? '기간권' : '회차권';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      },
      { 회차권: 0, 기간권: 0 }
    );

    return [
      {
        name: '회차권',
        count: typeCounts['회차권'],
        color: TEACHER_COLORS.purple[500],
        legendFontColor: TEACHER_COLORS.gray[600],
        legendFontSize: 12,
      },
      {
        name: '기간권',
        count: typeCounts['기간권'],
        color: TEACHER_COLORS.blue[500],
        legendFontColor: TEACHER_COLORS.gray[600],
        legendFontSize: 12,
      },
    ];
  }, [students]);

  // 학생 수 증가 추이
  const studentGrowthData = useMemo(() => {
    const now = new Date();
    const monthLabels = [];
    const monthValues = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthLabels.push(`${date.getMonth() + 1}월`);

      // 실제 구현에서는 createdAt 기반으로 해당 시점의 학생 수를 계산해야 함
      // 현재는 간단하게 현재 학생 수를 표시
      monthValues.push(students.length);
    }

    return {
      labels: monthLabels,
      values: monthValues,
    };
  }, [students]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScreenHeader title="통계 분석" navigation={navigation} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={TEACHER_COLORS.primary.DEFAULT} />
          <Text className="text-gray-500 mt-4">데이터를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScreenHeader title="통계 분석" navigation={navigation} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* 기간 선택 */}
        <View className="px-5 pt-4 pb-2">
          <View className="flex-row bg-white rounded-xl p-1.5 shadow-sm">
            {periodOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => setSelectedPeriod(option.value)}
                className={`flex-1 py-2 rounded-lg ${
                  selectedPeriod === option.value ? 'bg-primary' : ''
                }`}
                style={
                  selectedPeriod === option.value
                    ? { backgroundColor: TEACHER_COLORS.primary.DEFAULT }
                    : {}
                }
              >
                <Text
                  className={`text-center font-semibold ${
                    selectedPeriod === option.value
                      ? 'text-white'
                      : 'text-gray-600'
                  }`}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 매출 통계 */}
        <Card className="mx-5 mt-4">
          <MonthlyRevenueChart data={monthlyRevenueData} title="월별 매출 현황" />

          <View className="mt-4 pt-4 border-t border-gray-100 flex-row justify-between">
            <View>
              <Text className="text-xs text-gray-500 mb-1">평균 월매출</Text>
              <Text className="text-lg font-bold text-gray-800">
                {revenueStats.average}만원
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-xs text-gray-500 mb-1">최고 매출</Text>
              <Text className="text-lg font-bold text-green-600">
                {revenueStats.max}만원
              </Text>
            </View>
          </View>
        </Card>

        {/* 출석률 통계 */}
        <Card className="mx-5 mt-4">
          <AttendanceRateChart
            data={weeklyAttendanceData}
            title="이번 달 주간 출석률"
          />

          <View className="mt-4 pt-4 border-t border-gray-100 flex-row justify-between">
            <View>
              <Text className="text-xs text-gray-500 mb-1">평균 출석률</Text>
              <Text className="text-lg font-bold text-gray-800">
                {attendanceStats.average}%
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-xs text-gray-500 mb-1">최고 출석률</Text>
              <Text className="text-lg font-bold text-green-600">
                {attendanceStats.max}%
              </Text>
            </View>
          </View>
        </Card>

        {/* 학생 레벨 분포 */}
        <Card className="mx-5 mt-4">
          <PieChartComponent
            data={studentLevelDistribution}
            title="학생 레벨 분포"
          />

          <View className="mt-4 pt-4 border-t border-gray-100">
            <Text className="text-xs text-gray-500 mb-2">총 학생 수</Text>
            <Text className="text-2xl font-bold text-gray-800">{students.length}명</Text>
          </View>
        </Card>

        {/* 수강권 타입 분포 */}
        <Card className="mx-5 mt-4">
          <PieChartComponent
            data={ticketTypeDistribution}
            title="수강권 타입 분포"
          />

          <View className="mt-4 pt-4 border-t border-gray-100 flex-row justify-between">
            <View>
              <Text className="text-xs text-gray-500 mb-1">회차권</Text>
              <Text className="text-lg font-bold text-purple-600">
                {ticketTypeDistribution[0]?.count || 0}명
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-xs text-gray-500 mb-1">기간권</Text>
              <Text className="text-lg font-bold text-blue-600">
                {ticketTypeDistribution[1]?.count || 0}명
              </Text>
            </View>
          </View>
        </Card>

        {/* 학생 수 추이 */}
        <Card className="mx-5 mt-4 mb-5">
          <Text className="text-base font-bold text-gray-800 mb-3">
            학생 수 증가 추이
          </Text>
          <LineChart
            data={{
              labels: studentGrowthData.labels,
              datasets: [
                {
                  data: studentGrowthData.values.length > 0 ? studentGrowthData.values : [0],
                  color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
                  strokeWidth: 3,
                },
              ],
            }}
            width={screenWidth - 70}
            height={200}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '5',
                strokeWidth: '2',
                stroke: '#22C55E',
              },
              propsForBackgroundLines: {
                strokeDasharray: '',
                stroke: '#e5e7eb',
                strokeWidth: 1,
              },
            }}
            bezier
            style={{
              borderRadius: 12,
            }}
            withInnerLines={true}
            withOuterLines={false}
            withVerticalLines={false}
            withHorizontalLines={true}
            yAxisSuffix="명"
          />

          <View className="mt-4 pt-4 border-t border-gray-100 flex-row justify-between">
            <View>
              <Text className="text-xs text-gray-500 mb-1">현재 학생 수</Text>
              <Text className="text-lg font-bold text-green-600">{students.length}명</Text>
            </View>
            <View className="items-end">
              <Text className="text-xs text-gray-500 mb-1">목표 학생 수</Text>
              <Text className="text-lg font-bold text-gray-800">30명</Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
