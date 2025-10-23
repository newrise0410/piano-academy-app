// src/screens/teacher/ChatListScreen.js
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, ScreenHeader } from '../../components/common';
import TEACHER_COLORS from '../../styles/teacher_colors';
import { useStudentStore } from '../../store';

export default function ChatListScreen({ navigation }) {
  const { students } = useStudentStore();
  const [searchQuery, setSearchQuery] = useState('');

  // 임시 채팅 데이터 (나중에 실제 데이터로 교체)
  const chats = students.map((student, index) => ({
    id: student.id,
    studentName: student.name,
    parentName: student.parentName || '학부모',
    lastMessage: index === 0 ? '다음 주 수업 시간 변경 가능할까요?' : '네, 감사합니다!',
    lastMessageTime: index === 0 ? '방금 전' : `${index}시간 전`,
    unreadCount: index === 0 ? 2 : 0,
    isOnline: index === 0,
  }));

  const filteredChats = chats.filter((chat) =>
    chat.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.parentName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScreenHeader title="학부모 채팅" onBack={() => navigation.goBack()} />

      <View className="px-5 py-4">
        {/* 검색 */}
        <View
          className="bg-white rounded-2xl px-4 py-3 flex-row items-center mb-4"
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
            placeholder="학생 이름이나 학부모 검색"
            placeholderTextColor="#9CA3AF"
            className="flex-1 ml-2 text-gray-900"
          />
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
            <Text className="text-gray-500 text-xs mb-1">전체 대화</Text>
            <Text className="text-2xl font-bold" style={{ color: TEACHER_COLORS.primary.DEFAULT }}>
              {chats.length}
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
            <Text className="text-gray-500 text-xs mb-1">읽지 않음</Text>
            <Text className="text-2xl font-bold text-red-600">
              {chats.filter((c) => c.unreadCount > 0).length}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-5">
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <TouchableOpacity
              key={chat.id}
              onPress={() => navigation.navigate('ChatRoom', {
                studentId: chat.id,
                studentName: chat.studentName,
                parentName: chat.parentName,
              })}
              activeOpacity={0.7}
              className="bg-white rounded-2xl p-4 mb-3 flex-row items-center"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              {/* 프로필 이미지 */}
              <View className="relative mr-3">
                <View
                  className="w-14 h-14 rounded-full items-center justify-center"
                  style={{ backgroundColor: TEACHER_COLORS.purple[100] }}
                >
                  <Text className="text-purple-700 font-bold text-xl">
                    {chat.studentName.charAt(0)}
                  </Text>
                </View>
                {chat.isOnline && (
                  <View
                    className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white"
                    style={{ backgroundColor: '#10B981' }}
                  />
                )}
              </View>

              {/* 메시지 정보 */}
              <View className="flex-1">
                <View className="flex-row items-center justify-between mb-1">
                  <View className="flex-row items-center">
                    <Text className="text-gray-900 font-bold text-base mr-2">
                      {chat.studentName}
                    </Text>
                    <Text className="text-gray-500 text-sm">({chat.parentName})</Text>
                  </View>
                  <Text className="text-gray-400 text-xs">{chat.lastMessageTime}</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text
                    className="text-gray-600 text-sm flex-1"
                    numberOfLines={1}
                    style={{ fontWeight: chat.unreadCount > 0 ? 'bold' : 'normal' }}
                  >
                    {chat.lastMessage}
                  </Text>
                  {chat.unreadCount > 0 && (
                    <View
                      className="ml-2 w-6 h-6 rounded-full items-center justify-center"
                      style={{ backgroundColor: TEACHER_COLORS.primary.DEFAULT }}
                    >
                      <Text className="text-white font-bold text-xs">
                        {chat.unreadCount}
                      </Text>
                    </View>
                  )}
                </View>
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
              <Ionicons name="chatbubbles-outline" size={48} color="#9CA3AF" />
            </View>
            <Text className="text-gray-900 font-bold text-lg mb-2">
              {searchQuery ? '검색 결과가 없습니다' : '대화 내역이 없습니다'}
            </Text>
            <Text className="text-gray-400 text-sm text-center">
              {searchQuery
                ? '다른 검색어로 시도해보세요'
                : '학부모와 대화를 시작해보세요'}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
