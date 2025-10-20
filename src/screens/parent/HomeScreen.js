// src/screens/parent/HomeScreen.js
import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Text from '../../components/common/Text';
import Card from '../../components/common/Card';
import StatBox from '../../components/common/StatBox';
import ListItem from '../../components/common/ListItem';
import { childData, recentActivities, todaySchedule } from '../../data/mockParentData';
import PARENT_COLORS, { PARENT_GRADIENTS, PARENT_SEMANTIC_COLORS, PARENT_OVERLAY_COLORS } from '../../styles/parent_colors';

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 */}
        <View className="px-5 pt-2 pb-8 flex-row justify-between items-center" style={{ backgroundColor: PARENT_COLORS.primary.DEFAULT }}>
          <View>
            <Text className="text-white text-sm opacity-90">안녕하세요 👋</Text>
            <Text className="text-white text-xl font-bold mt-1">{childData.name} 학부모님</Text>
          </View>
          <TouchableOpacity activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* 컨텐츠 */}
        <View className="px-5 -mt-5">
          {/* 자녀 정보 카드 */}
          <Card>
            <View className="flex-row items-center mb-4">
              <LinearGradient
                colors={PARENT_GRADIENTS.primaryGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="w-16 h-16 rounded-2xl items-center justify-center mr-4"
              />
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Text className="text-gray-800 text-xl font-bold">{childData.name}</Text>
                  <View className="ml-2 px-2 py-1 rounded-full" style={{ backgroundColor: PARENT_COLORS.primary[100] }}>
                    <Text className="text-xs font-bold" style={{ color: PARENT_COLORS.primary[600] }}>{childData.level}</Text>
                  </View>
                </View>
                <Text className="text-gray-500 text-sm">{childData.schedule}</Text>
              </View>
            </View>

            {/* 통계 - StatBox 컴포넌트 사용 */}
            <View className="flex-row -mx-1">
              <StatBox
                icon="checkmark-circle"
                label="출석률"
                number={childData.attendanceRate}
                backgroundColor={PARENT_COLORS.success[50]}
                textColor={PARENT_COLORS.success[600]}
                iconColor={PARENT_COLORS.success.DEFAULT}
              />
              <StatBox
                icon="bar-chart"
                label="진도율"
                number={`${childData.progress}%`}
                backgroundColor={PARENT_COLORS.purple[50]}
                textColor={PARENT_COLORS.purple[600]}
                iconColor={PARENT_COLORS.purple[600]}
              />
              <StatBox
                icon="ticket"
                label="남은 수업"
                number={`${childData.ticketCount}회`}
                backgroundColor={PARENT_COLORS.blue[50]}
                textColor={PARENT_COLORS.blue[600]}
                iconColor={PARENT_COLORS.blue[500]}
              />
            </View>
          </Card>

          {/* 오늘의 일정 */}
          <Card className="mt-4">
            <Text className="text-lg font-bold text-gray-800 mb-4">오늘의 일정</Text>

            <View className="rounded-2xl p-4 border-l-4" style={{ backgroundColor: PARENT_COLORS.primary[50], borderLeftColor: PARENT_COLORS.primary.DEFAULT }}>
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-1">
                  <View className="flex-row items-center mb-2">
                    <Text className="text-2xl mr-2">🎹</Text>
                    <View>
                      <Text className="text-gray-800 font-bold text-base">피아노 레슨</Text>
                      <View className="flex-row items-center mt-0.5">
                        <Ionicons name="time-outline" size={14} color={PARENT_COLORS.gray[500]} />
                        <Text className="text-gray-600 text-sm ml-1">
                          {todaySchedule.classTime} - {todaySchedule.classEndTime}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View className="px-3 py-1.5 rounded-lg" style={{ backgroundColor: PARENT_COLORS.primary.DEFAULT }}>
                  <Text className="text-white font-bold text-xs">{todaySchedule.hoursUntilClass}시간 후</Text>
                </View>
              </View>

              <View className="bg-white rounded-xl p-3 border" style={{ borderColor: PARENT_COLORS.gray[200] }}>
                <View className="flex-row items-start">
                  <Text className="text-base mr-2">📝</Text>
                  <View className="flex-1">
                    <Text className="text-gray-500 text-xs font-semibold mb-1">오늘의 과제</Text>
                    <Text className="text-gray-800 text-sm">{todaySchedule.homework}</Text>
                  </View>
                </View>
              </View>
            </View>
          </Card>

          {/* 빠른 메뉴 */}
          <Card className="mt-4">
            <Text className="text-lg font-bold text-gray-800 mb-4">빠른 메뉴</Text>

            <View className="flex-row -mx-1">
              {[
                { icon: 'book', label: '진도', color: PARENT_COLORS.purple[600], bg: PARENT_COLORS.purple[50], screen: 'Progress' },
                { icon: 'calendar', label: '출석', color: PARENT_COLORS.success.DEFAULT, bg: PARENT_COLORS.success[50], screen: 'Attendance' },
                { icon: 'card', label: '수강료', color: PARENT_COLORS.blue[500], bg: PARENT_COLORS.blue[50], screen: 'Tuition' },
                { icon: 'images', label: '앨범', color: PARENT_COLORS.primary.DEFAULT, bg: PARENT_COLORS.primary[50], screen: 'Gallery' },
              ].map((menu) => (
                <View key={menu.label} className="flex-1 mx-1">
                  <TouchableOpacity
                    onPress={() => navigation.navigate(menu.screen)}
                    activeOpacity={0.7}
                    className="rounded-xl p-3 items-center"
                    style={{ backgroundColor: menu.bg }}
                  >
                    <Ionicons name={menu.icon} size={28} color={menu.color} className="mb-2" />
                    <Text className="text-xs font-bold text-center" style={{ color: menu.color }}>{menu.label}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </Card>

          {/* 최근 소식 - ListItem 컴포넌트 사용 */}
          <Card className="mt-4 mb-5">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-gray-800">최근 소식</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text className="text-sm font-semibold" style={{ color: PARENT_COLORS.primary.DEFAULT }}>전체보기</Text>
              </TouchableOpacity>
            </View>

            {recentActivities.slice(0, 4).map((activity, index) => (
              <ListItem
                key={activity.id}
                icon={activity.icon}
                iconColor={activity.color}
                title={activity.title}
                subtitle={`${activity.content} · ${activity.date}`}
                badge={activity.isNew ? 'N' : null}
                badgeColor={PARENT_COLORS.primary.DEFAULT}
                onPress={() => {}}
                isLast={index === 3}
              />
            ))}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
