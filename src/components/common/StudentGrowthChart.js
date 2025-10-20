// src/components/common/StudentGrowthChart.js
import React from 'react';
import { View, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Text from './Text';
import PARENT_COLORS from '../../styles/parent_colors';

const screenWidth = Dimensions.get('window').width;

export default function StudentGrowthChart({ data, title = "월별 진도" }) {
  // data 형식: { labels: ['1월', '2월', ...], values: [10, 15, 18, ...] }

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(236, 72, 153, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: PARENT_COLORS.primary.DEFAULT,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: '#e5e7eb',
      strokeWidth: 1,
    },
  };

  const chartData = {
    labels: data.labels || [],
    datasets: [
      {
        data: data.values || [0],
        color: (opacity = 1) => `rgba(236, 72, 153, ${opacity})`,
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
        withInnerLines={true}
        withOuterLines={false}
        withVerticalLines={false}
        withHorizontalLines={true}
        withVerticalLabels={true}
        withHorizontalLabels={true}
        fromZero={true}
        yAxisSuffix="곡"
      />
    </View>
  );
}
