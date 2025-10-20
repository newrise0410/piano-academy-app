// src/screens/teacher/StatisticsScreen.js
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Card,
  ScreenHeader,
  MonthlyRevenueChart,
  AttendanceRateChart,
  PieChartComponent,
} from '../../components/common';
import {
  teacherMonthlyRevenue,
  teacherWeeklyAttendance,
  studentLevelDistribution,
  ticketTypeDistribution,
  studentGrowthData,
} from '../../data/mockChartData';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import TEACHER_COLORS from '../../styles/teacher_colors';

const screenWidth = Dimensions.get('window').width;

export default function StatisticsScreen({ navigation }) {
  const [selectedPeriod, setSelectedPeriod] = useState('6months'); // 6months, 3months, 1year

  const periodOptions = [
    { value: '6months', label: '6개월' },
    { value: '3months', label: '3개월' },
    { value: '1year', label: '1년' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScreenHeader title="통계 분석" />

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
          <MonthlyRevenueChart data={teacherMonthlyRevenue} title="월별 매출 현황" />

          <View className="mt-4 pt-4 border-t border-gray-100 flex-row justify-between">
            <View>
              <Text className="text-xs text-gray-500 mb-1">평균 월매출</Text>
              <Text className="text-lg font-bold text-gray-800">270만원</Text>
            </View>
            <View className="items-end">
              <Text className="text-xs text-gray-500 mb-1">최고 매출</Text>
              <Text className="text-lg font-bold text-green-600">350만원</Text>
            </View>
          </View>
        </Card>

        {/* 출석률 통계 */}
        <Card className="mx-5 mt-4">
          <AttendanceRateChart
            data={teacherWeeklyAttendance}
            title="이번 달 주간 출석률"
          />

          <View className="mt-4 pt-4 border-t border-gray-100 flex-row justify-between">
            <View>
              <Text className="text-xs text-gray-500 mb-1">평균 출석률</Text>
              <Text className="text-lg font-bold text-gray-800">93%</Text>
            </View>
            <View className="items-end">
              <Text className="text-xs text-gray-500 mb-1">최고 출석률</Text>
              <Text className="text-lg font-bold text-green-600">97%</Text>
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
            <Text className="text-2xl font-bold text-gray-800">25명</Text>
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
              <Text className="text-lg font-bold text-purple-600">18명</Text>
            </View>
            <View className="items-end">
              <Text className="text-xs text-gray-500 mb-1">기간권</Text>
              <Text className="text-lg font-bold text-blue-600">7명</Text>
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
                  data: studentGrowthData.values,
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
              <Text className="text-xs text-gray-500 mb-1">6개월 증가</Text>
              <Text className="text-lg font-bold text-green-600">+20명</Text>
            </View>
            <View className="items-end">
              <Text className="text-xs text-gray-500 mb-1">월평균 증가</Text>
              <Text className="text-lg font-bold text-gray-800">+3.3명</Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
