// src/screens/parent/CompletedSongsScreen.js
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, ScreenHeader } from '../../components/common';
import PARENT_COLORS from '../../styles/parent_colors';

export default function CompletedSongsScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');

  const levels = [
    { value: 'all', label: '전체' },
    { value: 'beginner', label: '초급' },
    { value: 'intermediate', label: '중급' },
    { value: 'advanced', label: '고급' },
  ];

  // 임시 데이터 (나중에 실제 데이터로 교체)
  const completedSongs = [
    {
      id: 1,
      title: '엘리제를 위하여',
      composer: '베토벤',
      level: 'intermediate',
      completedDate: '2024-10-15',
      rating: 5,
      teacherComment: '감정 표현이 아주 좋았어요!',
    },
    {
      id: 2,
      title: '바이엘 45번',
      composer: '바이엘',
      level: 'beginner',
      completedDate: '2024-10-10',
      rating: 4,
      teacherComment: '리듬이 정확해요.',
    },
    {
      id: 3,
      title: '작은 별',
      composer: '전래동요',
      level: 'beginner',
      completedDate: '2024-09-28',
      rating: 5,
      teacherComment: '완벽해요!',
    },
  ];

  const filteredSongs = completedSongs.filter((song) => {
    const matchesSearch =
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.composer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || song.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const getLevelColor = (level) => {
    switch (level) {
      case 'beginner':
        return PARENT_COLORS.green[500];
      case 'intermediate':
        return PARENT_COLORS.blue[500];
      case 'advanced':
        return PARENT_COLORS.purple[500];
      default:
        return PARENT_COLORS.gray[500];
    }
  };

  const getLevelLabel = (level) => {
    switch (level) {
      case 'beginner':
        return '초급';
      case 'intermediate':
        return '중급';
      case 'advanced':
        return '고급';
      default:
        return '';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScreenHeader title="완료한 곡" onBack={() => navigation.goBack()} />

      <View className="px-5 py-4">
        {/* 검색 */}
        <View className="mb-4">
          <View
            className="bg-white rounded-2xl px-4 py-3 flex-row items-center"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 3,
              elevation: 2,
            }}
          >
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="곡 제목이나 작곡가 검색"
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-2 text-gray-900"
            />
          </View>
        </View>

        {/* 레벨 필터 */}
        <View className="flex-row mb-4">
          {levels.map((level) => (
            <TouchableOpacity
              key={level.value}
              onPress={() => setSelectedLevel(level.value)}
              className={`flex-1 rounded-full py-2.5 mr-2 ${
                level.value === levels[levels.length - 1].value ? 'mr-0' : ''
              }`}
              style={
                selectedLevel === level.value
                  ? { backgroundColor: PARENT_COLORS.primary.DEFAULT }
                  : { backgroundColor: 'white' }
              }
            >
              <Text
                className={`text-center font-bold text-sm ${
                  selectedLevel === level.value ? 'text-white' : 'text-gray-600'
                }`}
              >
                {level.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 통계 */}
        <View className="flex-row mb-4">
          <View
            className="flex-1 bg-white rounded-2xl p-4 mr-2"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 3,
              elevation: 2,
            }}
          >
            <Text className="text-gray-500 text-xs mb-1">총 완료 곡</Text>
            <Text className="text-2xl font-bold" style={{ color: PARENT_COLORS.primary.DEFAULT }}>
              {completedSongs.length}곡
            </Text>
          </View>
          <View
            className="flex-1 bg-white rounded-2xl p-4 ml-2"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 3,
              elevation: 2,
            }}
          >
            <Text className="text-gray-500 text-xs mb-1">이번 달</Text>
            <Text className="text-2xl font-bold text-green-600">2곡</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-5">
        {filteredSongs.length > 0 ? (
          filteredSongs.map((song) => (
            <View
              key={song.id}
              className="bg-white rounded-2xl p-5 mb-3"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              {/* 곡 정보 */}
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-1">
                  <Text className="text-gray-900 font-bold text-lg mb-1">{song.title}</Text>
                  <Text className="text-gray-500 text-sm">{song.composer}</Text>
                </View>
                <View
                  className="rounded-full px-3 py-1"
                  style={{ backgroundColor: `${getLevelColor(song.level)}15` }}
                >
                  <Text className="font-bold text-xs" style={{ color: getLevelColor(song.level) }}>
                    {getLevelLabel(song.level)}
                  </Text>
                </View>
              </View>

              {/* 별점 */}
              <View className="flex-row items-center mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= song.rating ? 'star' : 'star-outline'}
                    size={18}
                    color="#F59E0B"
                    style={{ marginRight: 4 }}
                  />
                ))}
              </View>

              {/* 선생님 코멘트 */}
              {song.teacherComment && (
                <View className="bg-purple-50 rounded-xl p-3 mb-3">
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="chatbubble" size={14} color={PARENT_COLORS.primary[600]} />
                    <Text className="text-xs font-bold ml-1" style={{ color: PARENT_COLORS.primary[600] }}>
                      선생님 코멘트
                    </Text>
                  </View>
                  <Text className="text-gray-700 text-sm">{song.teacherComment}</Text>
                </View>
              )}

              {/* 완료 날짜 */}
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
                <Text className="text-gray-400 text-xs ml-1">
                  {new Date(song.completedDate).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                  완료
                </Text>
              </View>
            </View>
          ))
        ) : (
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
              <Ionicons name="musical-notes-outline" size={48} color="#9CA3AF" />
            </View>
            <Text className="text-gray-900 font-bold text-lg mb-2">
              {searchQuery ? '검색 결과가 없습니다' : '완료한 곡이 없습니다'}
            </Text>
            <Text className="text-gray-400 text-sm text-center">
              {searchQuery ? '다른 검색어로 시도해보세요' : '곡을 완료하면 여기에 표시됩니다'}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
