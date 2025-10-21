// src/components/common/PieChartComponent.js
import React from 'react';
import { View, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import Text from './Text';

const screenWidth = Dimensions.get('window').width;

export default function PieChartComponent({ data, title = "분포도", accessor = "count" }) {
  // data 형식: [
  //   { name: '초급', count: 15, color: '#8B5CF6', legendFontColor: '#374151' },
  //   { name: '중급', count: 8, color: '#EC4899', legendFontColor: '#374151' },
  // ]

  const chartConfig = {
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  };

  // 데이터가 비어있거나 모든 값이 0인 경우 처리
  const hasData = data && data.length > 0 && data.some(item => (item[accessor] || 0) > 0);

  if (!hasData) {
    return (
      <View>
        <Text className="text-base font-bold text-gray-800 mb-3">{title}</Text>
        <View className="items-center justify-center py-12">
          <Text className="text-gray-400 text-center">데이터가 없습니다</Text>
        </View>
      </View>
    );
  }

  return (
    <View>
      <Text className="text-base font-bold text-gray-800 mb-3">{title}</Text>
      <PieChart
        data={data}
        width={screenWidth - 70}
        height={200}
        chartConfig={chartConfig}
        accessor={accessor}
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
        hasLegend={true}
        style={{
          borderRadius: 12,
        }}
      />
    </View>
  );
}
