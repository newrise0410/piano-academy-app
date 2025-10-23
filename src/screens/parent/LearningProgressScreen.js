// src/screens/parent/LearningProgressScreen.js
import React, { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card, ScreenHeader } from '../../components/common';
import { LineChart, ProgressChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import PARENT_COLORS from '../../styles/parent_colors';

const screenWidth = Dimensions.get('window').width;

export default function LearningProgressScreen({ navigation }) {
  const [selectedPeriod, setSelectedPeriod] = useState('3months');

  const periodOptions = [
    { value: '1month', label: '1개월' },
    { value: '3months', label: '3개월' },
    { value: '6months', label: '6개월' },
  ];

  // 임시 데이터 (나중에 실제 데이터로 교체)
  const progressData = {
    labels: ['8월', '9월', '10월'],
    datasets: [
      {
        data: [65, 75, 82],
        color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  const skillsProgress = {
    labels: ['음감', '리듬', '테크닉', '표현력'],
    data: [0.8, 0.7, 0.75, 0.65],
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScreenHeader title="학습 진도" onBack={() => navigation.goBack()} />

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
                    ? { backgroundColor: PARENT_COLORS.primary.DEFAULT }
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

        {/* 전체 진도율 */}
        <Card className="mx-5 mt-4">
          <Text className="text-base font-bold text-gray-800 mb-4">전체 학습 진도</Text>

          <LineChart
            data={progressData}
            width={screenWidth - 70}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: PARENT_COLORS.primary.DEFAULT,
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
            yAxisSuffix="%"
          />

          <View className="mt-4 pt-4 border-t border-gray-100 flex-row justify-between">
            <View>
              <Text className="text-xs text-gray-500 mb-1">현재 진도율</Text>
              <Text className="text-2xl font-bold" style={{ color: PARENT_COLORS.primary.DEFAULT }}>
                82%
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-xs text-gray-500 mb-1">지난 달 대비</Text>
              <View className="flex-row items-center">
                <Ionicons name="trending-up" size={20} color="#10B981" />
                <Text className="text-lg font-bold text-green-600 ml-1">+7%</Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-xs text-gray-500 mb-1">완료 곡</Text>
              <Text className="text-lg font-bold text-gray-800">12곡</Text>
            </View>
          </View>
        </Card>

        {/* 영역별 실력 */}
        <Card className="mx-5 mt-4">
          <Text className="text-base font-bold text-gray-800 mb-4">영역별 실력</Text>

          <ProgressChart
            data={skillsProgress}
            width={screenWidth - 70}
            height={220}
            strokeWidth={16}
            radius={32}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1, index) => {
                const colors = [
                  PARENT_COLORS.purple[500],
                  PARENT_COLORS.blue[500],
                  PARENT_COLORS.green[500],
                  PARENT_COLORS.pink[500],
                ];
                return colors[index] || PARENT_COLORS.primary.DEFAULT;
              },
              labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
            }}
            hideLegend={false}
          />
        </Card>

        {/* 학습 목표 */}
        <Card className="mx-5 mt-4 mb-5">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-base font-bold text-gray-800">이번 달 학습 목표</Text>
            <View className="bg-purple-100 rounded-full px-3 py-1">
              <Text className="text-purple-700 font-bold text-xs">진행중</Text>
            </View>
          </View>

          <View className="space-y-3">
            {[
              { title: '바이엘 60번까지 완료', progress: 0.75, current: 45, total: 60 },
              { title: '스케일 연습 (C, G, F 장조)', progress: 0.66, current: 2, total: 3 },
              { title: '리듬 패턴 10개 마스터', progress: 0.8, current: 8, total: 10 },
            ].map((goal, index) => (
              <View key={index} className="bg-gray-50 rounded-xl p-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-gray-900 font-semibold text-sm flex-1">
                    {goal.title}
                  </Text>
                  <Text className="text-gray-500 text-xs ml-2">
                    {goal.current}/{goal.total}
                  </Text>
                </View>
                <View className="bg-gray-200 h-2 rounded-full overflow-hidden">
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${goal.progress * 100}%`,
                      backgroundColor: PARENT_COLORS.primary.DEFAULT,
                    }}
                  />
                </View>
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
