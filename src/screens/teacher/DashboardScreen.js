// src/screens/teacher/DashboardScreen.js
import React from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../styles/colors';

import Text from '../../components/common/Text';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatBox from '../../components/common/StatBox';
import ActivityItem from '../../components/common/ActivityItem';

import useDashboard from '../../hooks/useDashboard';
import useActivities from '../../hooks/useActivities';

export default function DashboardScreen({ navigation }) {
  const { stats, loading: statsLoading, refresh: refreshStats } = useDashboard();
  const { activities, loading: activitiesLoading, refresh: refreshActivities } = useActivities();

  const onRefresh = async () => {
    await Promise.all([refreshStats(), refreshActivities()]);
  };

  const isLoading = statsLoading || activitiesLoading;

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScrollView 
        className="flex-1 bg-gray-50"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
      >
        {/* 헤더 */}
        <View className="bg-primary px-5 pt-2 pb-8 flex-row justify-between items-center">
          <View>
            <Text className="text-white text-sm opacity-90">안녕하세요 👋</Text>
            <Text className="text-white text-xl font-bold mt-1">김세욱 선생님</Text>
          </View>
          <Ionicons name="notifications-outline" size={24} color={COLORS.white} />
        </View>

        {/* 컨텐츠 */}
        <View className="px-5 -mt-5">
          {/* 오늘의 현황 */}
          <Card>
            <Text className="text-lg font-bold text-gray-800 mb-4">오늘의 현황</Text>
            <View className="flex-row justify-between -mx-1">
              <StatBox 
                number={`${stats.todayClasses}명`}
                label="오늘 수업"
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
          </Card>

          {/* 빠른 작업 */}
          <Card className="mt-4">
            <Text className="text-lg font-bold text-gray-800 mb-4">빠른 작업</Text>
            
            <Button 
              title="알림장 작성하기"
              icon="notifications"
              variant="primary"
              onPress={() => navigation.navigate('NoticeTab')}
            />

            <Button 
              title="오늘 출석 체크"
              icon="checkmark-circle"
              variant="secondary"
              onPress={() => navigation.navigate('Attendance')}
              className="mt-3"
            />
          </Card>

          {/* 최근 활동 */}
          <Card className="mt-4 mb-5">
            <Text className="text-lg font-bold text-gray-800 mb-4">최근 활동</Text>
            
            {activities.map((activity, index) => (
              <ActivityItem
                key={activity.id}
                icon={activity.icon}
                iconColor={activity.color}
                title={activity.title}
                description={activity.description}
                isLast={index === activities.length - 1}
              />
            ))}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}