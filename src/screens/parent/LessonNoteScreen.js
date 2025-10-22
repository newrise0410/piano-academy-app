// src/screens/parent/LessonNoteScreen.js
import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { query, collection, where, getDocs } from 'firebase/firestore';
import { Text, ScreenHeader } from '../../components/common';
import LessonNoteCard from '../../components/common/LessonNoteCard';
import { useLessonNoteStore, useAuthStore } from '../../store';
import { db } from '../../config/firebase';
import { updateUserProfile } from '../../services/authService';
import PARENT_COLORS, { PARENT_GRADIENTS } from '../../styles/parent_colors';

export default function LessonNoteScreen() {
  const { user } = useAuthStore();
  const { studentNotes, fetchStudentNotes, loading } = useLessonNoteStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [user?.studentId]);

  const loadData = async () => {
    let studentId = user?.studentId;

    // studentId가 없으면 parentId로 찾기
    if (!studentId && user?.uid) {
      try {
        const q = query(
          collection(db, 'students'),
          where('parentId', '==', user.uid)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          studentId = snapshot.docs[0].id;

          // user profile 업데이트
          await updateUserProfile(user.uid, { studentId });

          // authStore 업데이트
          const { updateUser } = useAuthStore.getState();
          updateUser({ studentId });
        }
      } catch (error) {
        console.error('학생 찾기 실패:', error);
      }
    }

    if (!studentId) {
      return;
    }

    try {
      // 자녀의 수업 일지만 가져오기 (공개된 것만)
      await fetchStudentNotes(studentId);
    } catch (error) {
      console.error('수업 일지 로드 실패:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const childNotes = user?.studentId ? (studentNotes[user.studentId] || []) : [];

  // 월별 그룹핑
  const groupedByMonth = childNotes.reduce((acc, note) => {
    const date = new Date(note.date);
    const key = `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(note);
    return acc;
  }, {});

  return (
    <View className="flex-1 bg-gray-50">
      <SafeAreaView className="flex-1">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* 그라디언트 헤더 */}
          <LinearGradient
            colors={['#A855F7', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingTop: 50, paddingBottom: 80 }}
          >
            <View className="px-5">
              <Text className="text-white text-3xl font-bold mb-2">수업 일지</Text>
              <View className="flex-row items-center">
                <Text className="text-white/80 text-sm">선생님이 작성한 수업 기록</Text>
                <View className="bg-white/20 rounded-full px-3 py-1 ml-3">
                  <Text className="text-white font-bold text-sm">{childNotes.length}개</Text>
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* 플로팅 통계 카드 */}
          <View className="px-5" style={{ marginTop: -60 }}>
            <View
              className="bg-white rounded-3xl p-5 mb-4"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <View className="flex-row justify-around">
                <View className="items-center">
                  <View className="bg-purple-100 rounded-full p-3 mb-2">
                    <Ionicons name="book" size={24} color={PARENT_COLORS.purple[600]} />
                  </View>
                  <Text className="text-gray-500 text-xs mb-1">전체</Text>
                  <Text className="text-gray-800 font-bold text-xl">{childNotes.length}</Text>
                </View>
                <View className="items-center">
                  <View className="bg-pink-100 rounded-full p-3 mb-2">
                    <Ionicons name="calendar" size={24} color={PARENT_COLORS.primary.DEFAULT} />
                  </View>
                  <Text className="text-gray-500 text-xs mb-1">이번 달</Text>
                  <Text className="text-gray-800 font-bold text-xl">
                    {childNotes.filter(note => {
                      const noteDate = new Date(note.date);
                      const now = new Date();
                      return noteDate.getMonth() === now.getMonth() && noteDate.getFullYear() === now.getFullYear();
                    }).length}
                  </Text>
                </View>
                <View className="items-center">
                  <View className="bg-blue-100 rounded-full p-3 mb-2">
                    <Ionicons name="time" size={24} color={PARENT_COLORS.blue[500]} />
                  </View>
                  <Text className="text-gray-500 text-xs mb-1">최근</Text>
                  <Text className="text-gray-800 font-bold text-xl">
                    {childNotes.filter(note => {
                      const noteDate = new Date(note.date);
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return noteDate >= weekAgo;
                    }).length}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* 수업 일지 목록 */}
          <View className="px-5 pb-20">
            {childNotes.length === 0 ? (
              <View
                className="bg-white rounded-3xl p-10 items-center"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <View className="bg-purple-50 rounded-full p-6 mb-4">
                  <Ionicons name="document-text-outline" size={48} color={PARENT_COLORS.purple[600]} />
                </View>
                <Text className="text-gray-800 font-bold text-lg text-center mb-2">
                  아직 작성된 수업 일지가 없습니다
                </Text>
                <Text className="text-gray-500 text-sm text-center">
                  선생님이 수업 일지를 작성하면 이곳에 표시됩니다
                </Text>
              </View>
            ) : (
              Object.entries(groupedByMonth)
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([month, notes]) => (
                  <View key={month} className="mb-6">
                    {/* 월 헤더 */}
                    <View className="flex-row items-center mb-3">
                      <View
                        className="px-4 py-2 rounded-full"
                        style={{
                          backgroundColor: PARENT_COLORS.purple[100],
                        }}
                      >
                        <Text className="font-bold" style={{ color: PARENT_COLORS.purple[600] }}>
                          {month}
                        </Text>
                      </View>
                      <View
                        className="ml-2 px-3 py-1 rounded-full"
                        style={{ backgroundColor: PARENT_COLORS.gray[100] }}
                      >
                        <Text className="text-xs font-semibold text-gray-600">
                          {notes.length}개
                        </Text>
                      </View>
                    </View>

                    {/* 해당 월의 수업 일지 */}
                    {notes
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((note) => (
                        <View
                          key={note.id}
                          className="bg-white rounded-2xl p-4 mb-3"
                          style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.05,
                            shadowRadius: 6,
                            elevation: 2,
                          }}
                        >
                          <View className="flex-row items-start mb-3">
                            <View
                              className="rounded-full p-2 mr-3"
                              style={{ backgroundColor: PARENT_COLORS.purple[50] }}
                            >
                              <Ionicons name="book" size={20} color={PARENT_COLORS.purple[600]} />
                            </View>
                            <View className="flex-1">
                              <Text className="text-gray-800 font-bold text-base mb-1">
                                {note.title || `${note.date} 수업`}
                              </Text>
                              <Text className="text-gray-400 text-xs">
                                {new Date(note.date).toLocaleDateString('ko-KR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  weekday: 'short'
                                })}
                              </Text>
                            </View>
                          </View>
                          {note.description && (
                            <Text className="text-gray-600 text-sm leading-5 mb-3">
                              {note.description}
                            </Text>
                          )}
                          {note.homework && (
                            <View
                              className="rounded-xl p-3"
                              style={{ backgroundColor: PARENT_COLORS.blue[50] }}
                            >
                              <View className="flex-row items-center mb-1">
                                <Ionicons name="pencil" size={14} color={PARENT_COLORS.blue[500]} />
                                <Text
                                  className="text-xs font-bold ml-1"
                                  style={{ color: PARENT_COLORS.blue[600] }}
                                >
                                  숙제
                                </Text>
                              </View>
                              <Text className="text-gray-700 text-sm">{note.homework}</Text>
                            </View>
                          )}
                        </View>
                      ))}
                  </View>
                ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
