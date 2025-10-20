// src/screens/parent/ProgressScreen.js
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Text from '../../components/common/Text';
import Card from '../../components/common/Card';
import ProgressBar from '../../components/common/ProgressBar';
import ListItem from '../../components/common/ListItem';
import { childData, completedSongs, weeklyTasks } from '../../data/mockParentData';
import PARENT_COLORS, { PARENT_GRADIENTS, PARENT_SEMANTIC_COLORS, PARENT_OVERLAY_COLORS } from '../../styles/parent_colors';

export default function ProgressScreen() {
  const [tasks, setTasks] = useState(weeklyTasks);

  const toggleTask = (id) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 py-4">
          {/* 현재 교재 진도 */}
          <Card>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-800 font-bold text-lg">{childData.book}</Text>
              <View className="px-3 py-1 rounded-full" style={{ backgroundColor: PARENT_COLORS.purple[600] }}>
                <Text className="text-white text-sm font-bold">{childData.progress}%</Text>
              </View>
            </View>

            <ProgressBar
              progress={childData.progress}
              height={12}
              backgroundColor={PARENT_COLORS.gray[200]}
              progressColor={PARENT_COLORS.purple[600]}
              className="mb-3"
            />

            <View className="flex-row justify-between">
              <Text className="text-sm" style={{ color: PARENT_COLORS.gray[500] }}>
                현재 {childData.progressPage}쪽
              </Text>
              <Text className="text-sm" style={{ color: PARENT_COLORS.gray[500] }}>
                목표 {childData.totalPages}쪽
              </Text>
            </View>
          </Card>

          {/* 월별 진도 그래프 */}
          <Card className="mt-4">
            <Text className="text-gray-800 font-bold text-lg mb-4">월별 진도 추이</Text>

            <View className="flex-row items-end justify-around h-32 mb-4">
              {childData.monthlyStats.map((stat, index) => (
                <View key={index} className="flex-1 items-center mx-1">
                  <View className="w-full items-center mb-2" style={{ height: 100 }}>
                    <View className="w-full items-end justify-end" style={{ height: '100%' }}>
                      <View
                        className="w-full rounded-t-lg"
                        style={{
                          height: `${stat.progress}%`,
                          backgroundColor: PARENT_COLORS.purple[600],
                          minHeight: 4
                        }}
                      />
                    </View>
                  </View>
                  <Text className="text-xs font-semibold" style={{ color: PARENT_COLORS.gray[600] }}>
                    {stat.month}
                  </Text>
                </View>
              ))}
            </View>

            <View className="items-center pt-3 border-t" style={{ borderColor: PARENT_COLORS.gray[200] }}>
              <View className="flex-row items-center px-3 py-1.5 rounded-full" style={{ backgroundColor: PARENT_COLORS.success[50] }}>
                <Ionicons name="trending-up" size={16} color={PARENT_COLORS.success[600]} />
                <Text className="text-sm font-semibold ml-1" style={{ color: PARENT_COLORS.success[600] }}>
                  꾸준히 성장 중이에요!
                </Text>
              </View>
            </View>
          </Card>

          {/* 완료한 곡 목록 */}
          <Card className="mt-4">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-800 font-bold text-lg">완료한 곡 🎵</Text>
              <Text className="text-sm" style={{ color: PARENT_COLORS.gray[500] }}>총 {completedSongs.length}곡</Text>
            </View>

            {completedSongs.map((song, index) => (
              <ListItem
                key={song.id}
                icon="checkmark-circle"
                iconColor={PARENT_COLORS.success.DEFAULT}
                iconBackgroundColor={PARENT_COLORS.success[50]}
                title={song.name}
                subtitle={song.date}
                rightIcon="star"
                isLast={index === completedSongs.length - 1}
              />
            ))}
          </Card>

          {/* 이번 주 연습 과제 */}
          <Card className="mt-4 mb-5">
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 rounded-lg items-center justify-center mr-2" style={{ backgroundColor: PARENT_COLORS.primary.DEFAULT }}>
                <Ionicons name="book" size={18} color="white" />
              </View>
              <Text className="text-gray-800 font-bold text-lg">이번 주 연습 과제</Text>
            </View>

            <View>
              {tasks.map((task, index) => (
                <TouchableOpacity
                  key={task.id}
                  className={`py-3 flex-row items-start ${index !== tasks.length - 1 ? 'border-b' : ''}`}
                  style={{ borderColor: PARENT_COLORS.gray[100] }}
                  onPress={() => toggleTask(task.id)}
                  activeOpacity={0.7}
                >
                  <View
                    className="w-5 h-5 rounded border-2 items-center justify-center mr-3 mt-0.5"
                    style={{
                      backgroundColor: task.completed ? PARENT_COLORS.primary.DEFAULT : 'transparent',
                      borderColor: task.completed ? PARENT_COLORS.primary.DEFAULT : PARENT_COLORS.gray[300]
                    }}
                  >
                    {task.completed && <Ionicons name="checkmark" size={14} color="white" />}
                  </View>
                  <View className="flex-1">
                    <Text className={`text-gray-800 font-semibold text-sm ${task.completed ? 'line-through' : ''}`}>
                      {task.title}
                    </Text>
                    <Text className="text-xs mt-0.5" style={{ color: task.completed ? PARENT_COLORS.success[600] : PARENT_COLORS.gray[500] }}>
                      {task.completed ? '✓ 완료됨' : task.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <View className="mt-3 pt-3 border-t items-center" style={{ borderColor: PARENT_COLORS.gray[100] }}>
              <Text className="text-xs" style={{ color: PARENT_COLORS.gray[500] }}>
                💡 체크 표시는 원장님께 전달됩니다
              </Text>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
