// src/components/common/MonthlyRevenueChart.js
import React from 'react';
import { View, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Text from './Text';
import TEACHER_COLORS from '../../styles/teacher_colors';

const screenWidth = Dimensions.get('window').width;

export default function MonthlyRevenueChart({ data, title = "월별 매출" }) {
  // data 형식: { labels: ['1월', '2월', ...], values: [1200000, 1500000, ...] }

  const chartConfig = {
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
      r: '5',
      strokeWidth: '2',
      stroke: TEACHER_COLORS.primary.DEFAULT,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: '#e5e7eb',
      strokeWidth: 1,
    },
  };

  // 값을 만 단위로 변환
  const formatValue = (value) => {
    if (value >= 10000) {
      return `${Math.round(value / 10000)}만`;
    }
    return value.toString();
  };

  const chartData = {
    labels: data.labels || [],
    datasets: [
      {
        data: data.values || [0],
        color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  return (
    <View>
      <Text className="text-base font-bold text-gray-800 mb-3">{title}</Text>
      <LineChart
        data={chartData}
        width={screenWidth - 70}
        height={200}
        chartConfig={chartConfig}
        bezier
        style={{
          borderRadius: 12,
        }}
        formatYLabel={formatValue}
        withInnerLines={true}
        withOuterLines={false}
        withVerticalLines={false}
        withHorizontalLines={true}
        withVerticalLabels={true}
        withHorizontalLabels={true}
        fromZero={true}
      />
    </View>
  );
}
