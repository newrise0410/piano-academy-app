// src/screens/parent/LessonVideosScreen.js
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, ScreenHeader } from '../../components/common';
import PARENT_COLORS from '../../styles/parent_colors';
import { useToastStore } from '../../store';

export default function LessonVideosScreen({ navigation }) {
  const toast = useToastStore();
  const [selectedTab, setSelectedTab] = useState('lesson'); // lesson, practice

  // 임시 데이터
  const lessonVideos = [
    {
      id: 1,
      title: '바이엘 45번 수업 영상',
      date: '2024-10-20',
      duration: '15:32',
      thumbnail: null,
      teacher: '선생님',
      views: 5,
    },
    {
      id: 2,
      title: '스케일 연습 방법',
      date: '2024-10-18',
      duration: '08:45',
      thumbnail: null,
      teacher: '선생님',
      views: 3,
    },
  ];

  const practiceVideos = [
    {
      id: 1,
      title: '바이엘 45번 집 연습',
      date: '2024-10-22',
      duration: '12:15',
      thumbnail: null,
      feedback: '손가락 번호가 정확해요! 리듬을 조금 더 신경써보세요.',
      hasFeedback: true,
    },
    {
      id: 2,
      title: '스케일 연습',
      date: '2024-10-21',
      duration: '05:30',
      thumbnail: null,
      feedback: null,
      hasFeedback: false,
    },
  ];

  const handleUploadVideo = () => {
    toast.info('영상 업로드 기능은 준비중입니다');
  };

  const handlePlayVideo = (video) => {
    toast.info('영상 재생 기능은 준비중입니다');
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });
  };

  const videos = selectedTab === 'lesson' ? lessonVideos : practiceVideos;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScreenHeader title="수업/연습 영상" onBack={() => navigation.goBack()} />

      <View className="px-5 py-4">
        {/* 탭 */}
        <View className="flex-row mb-4">
          <TouchableOpacity
            onPress={() => setSelectedTab('lesson')}
            className={`flex-1 rounded-full py-3 mr-2`}
            style={{
              backgroundColor:
                selectedTab === 'lesson' ? PARENT_COLORS.primary.DEFAULT : 'white',
            }}
          >
            <Text
              className={`text-center font-bold ${
                selectedTab === 'lesson' ? 'text-white' : 'text-gray-600'
              }`}
            >
              수업 영상
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedTab('practice')}
            className={`flex-1 rounded-full py-3 ml-2`}
            style={{
              backgroundColor:
                selectedTab === 'practice' ? PARENT_COLORS.primary.DEFAULT : 'white',
            }}
          >
            <Text
              className={`text-center font-bold ${
                selectedTab === 'practice' ? 'text-white' : 'text-gray-600'
              }`}
            >
              연습 영상
            </Text>
          </TouchableOpacity>
        </View>

        {/* 업로드 버튼 (연습 영상 탭일 때만) */}
        {selectedTab === 'practice' && (
          <TouchableOpacity
            onPress={handleUploadVideo}
            activeOpacity={0.8}
            className="bg-purple-500 rounded-2xl py-4 mb-4 flex-row items-center justify-center"
            style={{
              shadowColor: PARENT_COLORS.primary.DEFAULT,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            <Ionicons name="cloud-upload" size={24} color="white" />
            <Text className="text-white font-bold text-base ml-2">연습 영상 올리기</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView className="flex-1 px-5">
        {videos.length > 0 ? (
          videos.map((video) => (
            <TouchableOpacity
              key={video.id}
              onPress={() => handlePlayVideo(video)}
              activeOpacity={0.7}
              className="bg-white rounded-2xl mb-4 overflow-hidden"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              {/* 썸네일 */}
              <View className="relative">
                <View
                  className="w-full items-center justify-center bg-gray-200"
                  style={{ height: 180 }}
                >
                  {video.thumbnail ? (
                    <Image source={{ uri: video.thumbnail }} className="w-full h-full" />
                  ) : (
                    <Ionicons name="videocam" size={48} color="#9CA3AF" />
                  )}
                </View>
                {/* 재생 버튼 */}
                <View
                  className="absolute inset-0 items-center justify-center"
                  style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
                >
                  <View
                    className="w-16 h-16 rounded-full items-center justify-center"
                    style={{ backgroundColor: PARENT_COLORS.primary.DEFAULT }}
                  >
                    <Ionicons name="play" size={32} color="white" style={{ marginLeft: 4 }} />
                  </View>
                </View>
                {/* 길이 */}
                <View className="absolute bottom-2 right-2 bg-black bg-opacity-75 rounded px-2 py-1">
                  <Text className="text-white text-xs font-bold">{video.duration}</Text>
                </View>
              </View>

              {/* 정보 */}
              <View className="p-4">
                <Text className="text-gray-900 font-bold text-base mb-2">{video.title}</Text>
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-gray-500 text-sm">{formatDate(video.date)}</Text>
                  {selectedTab === 'lesson' && video.views !== undefined && (
                    <View className="flex-row items-center">
                      <Ionicons name="eye-outline" size={16} color="#9CA3AF" />
                      <Text className="text-gray-500 text-sm ml-1">{video.views}회</Text>
                    </View>
                  )}
                </View>

                {/* 피드백 (연습 영상) */}
                {selectedTab === 'practice' && video.hasFeedback && (
                  <View
                    className="bg-purple-50 rounded-xl p-3 mt-2"
                    style={{ borderLeftWidth: 3, borderLeftColor: PARENT_COLORS.primary.DEFAULT }}
                  >
                    <View className="flex-row items-center mb-2">
                      <Ionicons
                        name="chatbubble"
                        size={14}
                        color={PARENT_COLORS.primary[600]}
                      />
                      <Text
                        className="text-xs font-bold ml-1"
                        style={{ color: PARENT_COLORS.primary[600] }}
                      >
                        선생님 피드백
                      </Text>
                    </View>
                    <Text className="text-gray-700 text-sm">{video.feedback}</Text>
                  </View>
                )}

                {selectedTab === 'practice' && !video.hasFeedback && (
                  <View className="bg-gray-50 rounded-xl p-3 mt-2">
                    <Text className="text-gray-400 text-sm text-center">
                      피드백 대기중...
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
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
              <Ionicons name="videocam-outline" size={48} color="#9CA3AF" />
            </View>
            <Text className="text-gray-900 font-bold text-lg mb-2">
              {selectedTab === 'lesson' ? '수업 영상이 없습니다' : '연습 영상이 없습니다'}
            </Text>
            <Text className="text-gray-400 text-sm text-center">
              {selectedTab === 'lesson'
                ? '선생님이 수업 영상을 올려주시면 여기에 표시됩니다'
                : '연습 영상을 올리고 선생님의 피드백을 받아보세요'}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
