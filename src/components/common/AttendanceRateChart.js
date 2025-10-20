// src/components/common/AttendanceRateChart.js
import React from 'react';
import { View, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import Text from './Text';
import TEACHER_COLORS from '../../styles/teacher_colors';

const screenWidth = Dimensions.get('window').width;

export default function AttendanceRateChart({ data, title = "출석률 통계" }) {
  // data 형식: { labels: ['1주', '2주', ...], values: [95, 88, 92, ...] }

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: '#e5e7eb',
      strokeWidth: 1,
    },
    barPercentage: 0.6,
  };

  const chartData = {
    labels: data.labels || [],
    datasets: [
      {
        data: data.values || [0],
        color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
      },
    ],
  };

  return (
    <View>
      <Text className="text-base font-bold text-gray-800 mb-3">{title}</Text>
      <BarChart
        data={chartData}
        width={screenWidth - 70}
        height={200}
        chartConfig={chartConfig}
        style={{
          borderRadius: 12,
        }}
        showValuesOnTopOfBars={true}
        fromZero={true}
        withInnerLines={true}
        withHorizontalLabels={true}
        withVerticalLabels={true}
        yAxisSuffix="%"
      />
    </View>
  );
}
