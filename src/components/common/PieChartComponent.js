// src/components/common/PieChartComponent.js
import React from 'react';
import { View, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import Text from './Text';

const screenWidth = Dimensions.get('window').width;

export default function PieChartComponent({ data, title = "분포도" }) {
  // data 형식: [
  //   { name: '초급', population: 15, color: '#8B5CF6', legendFontColor: '#374151' },
  //   { name: '중급', population: 8, color: '#EC4899', legendFontColor: '#374151' },
  // ]

  const chartConfig = {
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  };

  return (
    <View>
      <Text className="text-base font-bold text-gray-800 mb-3">{title}</Text>
      <PieChart
        data={data}
        width={screenWidth - 70}
        height={200}
        chartConfig={chartConfig}
        accessor="population"
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
