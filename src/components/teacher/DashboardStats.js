// src/components/teacher/DashboardStats.js
import React from 'react';
import { View } from 'react-native';
import Text from '../common/Text';
import StatBox from '../common/StatBox';

export default function DashboardStats({ stats }) {
  return (
    <View>
      <Text className="text-lg font-bold text-gray-800 mb-4">오늘의 현황</Text>
      <View className="flex-row justify-between -mx-1">
        <StatBox
          number={`${stats.todayClasses}명`}
          label="오늘 수업"
          variant="default"
        />
        <StatBox
          number={`${stats.unpaidStudents}명`}
          label="미납 학생"
          variant="warning"
        />
        <StatBox
          number={`${stats.makeupClasses}건`}
          label="보강 예정"
          variant="success"
        />
      </View>
    </View>
  );
}
