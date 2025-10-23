// src/screens/parent/WeeklyHomeworkScreen.js
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, ScreenHeader } from '../../components/common';
import PARENT_COLORS from '../../styles/parent_colors';

export default function WeeklyHomeworkScreen({ navigation }) {
  const [selectedWeek, setSelectedWeek] = useState('current');

  const weekOptions = [
    { value: 'current', label: '이번 주' },
    { value: 'last', label: '지난 주' },
  ];

  // 임시 데이터 (나중에 실제 데이터로 교체)
  const [homeworks, setHomeworks] = useState([
    {
      id: 1,
      category: 'practice',
      title: '바이엘 45번 연습',
      description: '손가락 번호에 주의하며 천천히 연습하기',
      dueDate: '2024-10-25',
      completed: true,
      completedDate: '2024-10-23',
    },
    {
      id: 2,
      category: 'theory',
      title: '음계 쓰기',
      description: 'C장조 음계를 오선지에 5번 쓰기',
      dueDate: '2024-10-25',
      completed: true,
      completedDate: '2024-10-24',
    },
    {
      id: 3,
      category: 'practice',
      title: '스케일 연습',
      description: 'C, G, F 장조 스케일 각 10번씩',
      dueDate: '2024-10-26',
      completed: false,
    },
    {
      id: 4,
      category: 'listening',
      title: '클래식 감상',
      description: '베토벤 월광 소나타 듣고 느낀 점 적어오기',
      dueDate: '2024-10-27',
      completed: false,
    },
    {
      id: 5,
      category: 'theory',
      title: '리듬 연습',
      description: '교재 p.24 리듬 패턴 손뼉으로 연습',
      dueDate: '2024-10-27',
      completed: false,
    },
  ]);

  const toggleHomework = (id) => {
    setHomeworks((prev) =>
      prev.map((hw) =>
        hw.id === id
          ? {
              ...hw,
              completed: !hw.completed,
              completedDate: !hw.completed ? new Date().toISOString() : null,
            }
          : hw
      )
    );
  };

  const getCategoryInfo = (category) => {
    switch (category) {
      case 'practice':
        return { label: '연습', icon: 'musical-notes', color: PARENT_COLORS.purple[500] };
      case 'theory':
        return { label: '이론', icon: 'book', color: PARENT_COLORS.blue[500] };
      case 'listening':
        return { label: '감상', icon: 'headset', color: PARENT_COLORS.green[500] };
      default:
        return { label: '과제', icon: 'clipboard', color: PARENT_COLORS.gray[500] };
    }
  };

  const completedCount = homeworks.filter((hw) => hw.completed).length;
  const totalCount = homeworks.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScreenHeader title="주간 과제" onBack={() => navigation.goBack()} />

      <View className="px-5 py-4">
        {/* 주차 선택 */}
        <View className="flex-row mb-4">
          {weekOptions.map((week) => (
            <TouchableOpacity
              key={week.value}
              onPress={() => setSelectedWeek(week.value)}
              className={`flex-1 rounded-full py-3 ${week.value === 'current' ? 'mr-2' : 'ml-2'}`}
              style={
                selectedWeek === week.value
                  ? { backgroundColor: PARENT_COLORS.primary.DEFAULT }
                  : { backgroundColor: 'white' }
              }
            >
              <Text
                className={`text-center font-bold ${
                  selectedWeek === week.value ? 'text-white' : 'text-gray-600'
                }`}
              >
                {week.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 진행 현황 */}
        <View
          className="bg-white rounded-2xl p-5 mb-4"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-gray-500 text-sm mb-1">완료율</Text>
              <Text className="text-3xl font-bold" style={{ color: PARENT_COLORS.primary.DEFAULT }}>
                {completionRate}%
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-gray-500 text-sm mb-1">진행 상황</Text>
              <Text className="text-xl font-bold text-gray-800">
                {completedCount} / {totalCount}
              </Text>
            </View>
          </View>

          {/* 진행바 */}
          <View className="bg-gray-200 h-3 rounded-full overflow-hidden">
            <View
              className="h-full rounded-full"
              style={{
                width: `${completionRate}%`,
                backgroundColor: PARENT_COLORS.primary.DEFAULT,
              }}
            />
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-5">
        {homeworks.map((homework) => {
          const categoryInfo = getCategoryInfo(homework.category);
          const isOverdue =
            !homework.completed && new Date(homework.dueDate) < new Date();

          return (
            <TouchableOpacity
              key={homework.id}
              onPress={() => toggleHomework(homework.id)}
              activeOpacity={0.7}
              className="bg-white rounded-2xl p-5 mb-3"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 3,
                opacity: homework.completed ? 0.7 : 1,
              }}
            >
              <View className="flex-row items-start">
                {/* 체크박스 */}
                <TouchableOpacity
                  onPress={() => toggleHomework(homework.id)}
                  className="mr-3 mt-1"
                >
                  <View
                    className="w-6 h-6 rounded-full items-center justify-center"
                    style={{
                      backgroundColor: homework.completed
                        ? PARENT_COLORS.primary.DEFAULT
                        : 'white',
                      borderWidth: homework.completed ? 0 : 2,
                      borderColor: '#D1D5DB',
                    }}
                  >
                    {homework.completed && (
                      <Ionicons name="checkmark" size={16} color="white" />
                    )}
                  </View>
                </TouchableOpacity>

                {/* 내용 */}
                <View className="flex-1">
                  {/* 카테고리 */}
                  <View className="flex-row items-center mb-2">
                    <View
                      className="rounded-full px-3 py-1 flex-row items-center"
                      style={{ backgroundColor: `${categoryInfo.color}15` }}
                    >
                      <Ionicons
                        name={categoryInfo.icon}
                        size={12}
                        color={categoryInfo.color}
                      />
                      <Text
                        className="font-bold text-xs ml-1"
                        style={{ color: categoryInfo.color }}
                      >
                        {categoryInfo.label}
                      </Text>
                    </View>

                    {isOverdue && (
                      <View className="bg-red-100 rounded-full px-2 py-1 ml-2">
                        <Text className="text-red-600 font-bold text-xs">기한 초과</Text>
                      </View>
                    )}
                  </View>

                  {/* 제목 */}
                  <Text
                    className="text-gray-900 font-bold text-base mb-2"
                    style={{
                      textDecorationLine: homework.completed ? 'line-through' : 'none',
                    }}
                  >
                    {homework.title}
                  </Text>

                  {/* 설명 */}
                  <Text className="text-gray-600 text-sm mb-3">
                    {homework.description}
                  </Text>

                  {/* 날짜 정보 */}
                  <View className="flex-row items-center">
                    <Ionicons
                      name={homework.completed ? 'checkmark-circle' : 'calendar-outline'}
                      size={14}
                      color={homework.completed ? PARENT_COLORS.green[500] : '#9CA3AF'}
                    />
                    <Text className="text-gray-400 text-xs ml-1">
                      {homework.completed
                        ? `${new Date(homework.completedDate).toLocaleDateString('ko-KR', {
                            month: 'short',
                            day: 'numeric',
                          })} 완료`
                        : `${new Date(homework.dueDate).toLocaleDateString('ko-KR', {
                            month: 'short',
                            day: 'numeric',
                          })} 까지`}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {homeworks.length === 0 && (
          <View
            className="bg-white rounded-2xl p-8 items-center"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View className="bg-gray-100 rounded-full p-6 mb-4">
              <Ionicons name="clipboard-outline" size={48} color="#9CA3AF" />
            </View>
            <Text className="text-gray-900 font-bold text-lg mb-2">
              이번 주 과제가 없습니다
            </Text>
            <Text className="text-gray-400 text-sm text-center">
              선생님이 과제를 내주시면 여기에 표시됩니다
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
