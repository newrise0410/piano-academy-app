// src/screens/parent/NoticeScreen.js
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl, Modal, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Text, CommentSection } from '../../components/common';
import { getNoticesForStudent, markNoticeAsRead } from '../../services/firestoreService';
import { useToastStore, useAuthStore } from '../../store';
import PARENT_COLORS from '../../styles/parent_colors';

export default function NoticeScreen() {
  const navigation = useNavigation();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const toast = useToastStore();
  const user = useAuthStore((state) => state.user);

  const studentId = user?.studentId || user?.uid;

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    if (!studentId) {
      toast.error('학생 정보를 찾을 수 없습니다');
      setLoading(false);
      return;
    }

    try {
      const result = await getNoticesForStudent(studentId);
      if (result.success) {
        setNotices(result.data);
      } else {
        toast.error('알림장을 불러오는데 실패했습니다');
      }
    } catch (error) {
      console.error('알림장 로드 오류:', error);
      toast.error('알림장을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadNotices();
  };

  const handleNoticePress = async (notice) => {
    setSelectedNotice(notice);
    setShowDetailModal(true);

    // 읽지 않은 알림장이면 읽음 처리
    if (!notice.isRead) {
      try {
        await markNoticeAsRead(notice.id, studentId);
        // 목록 새로고침
        loadNotices();
      } catch (error) {
        console.error('읽음 처리 오류:', error);
      }
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return '';

    // Firebase Timestamp, ISO string, Date 객체 모두 처리
    let date;
    if (dateValue.toDate) {
      // Firebase Timestamp
      date = dateValue.toDate();
    } else if (typeof dateValue === 'string') {
      // ISO string
      date = new Date(dateValue);
    } else {
      // Date 객체
      date = dateValue;
    }

    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return '오늘';
    } else if (diffDays === 1) {
      return '1일 전';
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks}주 전`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months}개월 전`;
    } else {
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  };

  const unreadCount = notices.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color={PARENT_COLORS.primary.DEFAULT} />
      </View>
    );
  }

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
            colors={['#8B5CF6', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingTop: 50, paddingBottom: 80 }}
          >
            <View className="px-5">
              <Text className="text-white text-3xl font-bold mb-2">알림장</Text>
              <View className="flex-row items-center">
                <Text className="text-white/80 text-sm">선생님이 보낸 알림</Text>
                <View className="bg-white/20 rounded-full px-3 py-1 ml-3">
                  <Text className="text-white font-bold text-sm">{notices.length}건</Text>
                </View>
                {unreadCount > 0 && (
                  <View className="bg-red-500 rounded-full px-3 py-1 ml-2">
                    <Text className="text-white font-bold text-sm">NEW {unreadCount}</Text>
                  </View>
                )}
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
                    <Ionicons name="mail" size={24} color={PARENT_COLORS.purple[600]} />
                  </View>
                  <Text className="text-gray-500 text-xs mb-1">전체</Text>
                  <Text className="text-gray-800 font-bold text-xl">{notices.length}개</Text>
                </View>

                <View className="items-center">
                  <View className="bg-red-100 rounded-full p-3 mb-2">
                    <Ionicons name="mail-unread" size={24} color={PARENT_COLORS.danger.DEFAULT} />
                  </View>
                  <Text className="text-gray-500 text-xs mb-1">읽지 않음</Text>
                  <Text className="text-gray-800 font-bold text-xl">{unreadCount}개</Text>
                </View>

                <View className="items-center">
                  <View className="bg-green-100 rounded-full p-3 mb-2">
                    <Ionicons name="checkmark-done" size={24} color={PARENT_COLORS.success[600]} />
                  </View>
                  <Text className="text-gray-500 text-xs mb-1">읽음</Text>
                  <Text className="text-gray-800 font-bold text-xl">{notices.length - unreadCount}개</Text>
                </View>
              </View>
            </View>

            {/* 알림장 리스트 */}
            {notices.length === 0 ? (
              <View
                className="bg-white rounded-3xl p-8 mb-6 items-center"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <View className="bg-gray-100 rounded-full p-6 mb-4">
                  <Ionicons name="notifications-off-outline" size={48} color={PARENT_COLORS.gray[400]} />
                </View>
                <Text className="text-gray-800 font-bold text-lg mb-2">알림장이 없습니다</Text>
                <Text className="text-gray-500 text-sm text-center">
                  아직 받은 알림장이 없습니다
                </Text>
              </View>
            ) : (
              <View
                className="bg-white rounded-3xl p-5 mb-6"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <Text className="text-gray-800 font-bold text-lg mb-4">받은 알림장</Text>

                {notices.map((notice, index) => (
                  <TouchableOpacity
                    key={notice.id}
                    className={`${index !== notices.length - 1 ? 'mb-4 pb-4 border-b' : ''}`}
                    style={{ borderColor: PARENT_COLORS.gray[100] }}
                    onPress={() => handleNoticePress(notice)}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-start">
                      <View
                        className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
                        style={{
                          backgroundColor: notice.isRead
                            ? PARENT_COLORS.gray[100]
                            : PARENT_COLORS.purple[50]
                        }}
                      >
                        <Ionicons
                          name={notice.isRead ? 'mail-open' : 'mail'}
                          size={24}
                          color={notice.isRead ? PARENT_COLORS.gray[500] : PARENT_COLORS.purple[600]}
                        />
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-center mb-1">
                          <Text
                            className={`font-bold text-base ${notice.isRead ? 'text-gray-600' : 'text-gray-900'}`}
                            numberOfLines={1}
                          >
                            {notice.title}
                          </Text>
                          {!notice.isRead && (
                            <View className="bg-red-500 rounded-full px-2 py-0.5 ml-2">
                              <Text className="text-white text-xs font-bold">NEW</Text>
                            </View>
                          )}
                        </View>
                        <Text
                          className={`text-sm mb-2 ${notice.isRead ? 'text-gray-500' : 'text-gray-700'}`}
                          numberOfLines={2}
                        >
                          {notice.content}
                        </Text>
                        <View className="flex-row items-center">
                          <Text className="text-xs text-gray-400">
                            {formatDate(notice.createdAt || notice.date)}
                          </Text>
                          {notice.navigateTo === 'Tuition' && (
                            <View className="flex-row items-center ml-2 px-2 py-0.5 rounded-full" style={{ backgroundColor: PARENT_COLORS.warning[100] }}>
                              <Ionicons name="card" size={10} color={PARENT_COLORS.warning[600]} />
                              <Text className="text-xs font-bold ml-1" style={{ color: PARENT_COLORS.warning[600] }}>수강료</Text>
                            </View>
                          )}
                        </View>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={PARENT_COLORS.gray[400]}
                      />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* 상세 보기 모달 */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="bg-white rounded-t-3xl" style={{ maxHeight: '90%' }}>
            {/* 헤더 */}
            <View className="flex-row items-center justify-between p-5 border-b border-gray-100">
              <Text className="text-xl font-bold text-gray-900">알림장</Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Ionicons name="close" size={28} color={PARENT_COLORS.gray[600]} />
              </TouchableOpacity>
            </View>

            {selectedNotice && (
              <ScrollView className="p-5">
                {/* 제목 */}
                <Text className="text-2xl font-bold text-gray-900 mb-3">
                  {selectedNotice.title}
                </Text>

                {/* 날짜 */}
                <View className="flex-row items-center mb-4">
                  <Ionicons name="calendar-outline" size={16} color={PARENT_COLORS.gray[500]} />
                  <Text className="text-sm text-gray-500 ml-2">
                    {formatDate(selectedNotice.createdAt || selectedNotice.date)}
                  </Text>
                </View>

                {/* 구분선 */}
                <View className="border-t border-gray-200 my-4" />

                {/* 내용 */}
                <Text className="text-base text-gray-700 leading-6 mb-4" style={{ lineHeight: 24 }}>
                  {selectedNotice.content}
                </Text>

                {/* 첨부된 미디어 */}
                {selectedNotice.media && selectedNotice.media.length > 0 && (
                  <View className="mb-4">
                    <View className="flex-row items-center mb-3">
                      <Ionicons name="images" size={18} color={PARENT_COLORS.primary.DEFAULT} />
                      <Text className="text-sm font-bold text-gray-800 ml-2">
                        첨부 파일 ({selectedNotice.media.length})
                      </Text>
                    </View>
                    <View className="flex-row flex-wrap -mx-1">
                      {selectedNotice.media.map((media, index) => (
                        <View
                          key={index}
                          className="w-1/3 px-1 mb-2"
                        >
                          <View style={{ aspectRatio: 1 }}>
                            <Image
                              source={{ uri: media.url }}
                              style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: 8,
                                backgroundColor: PARENT_COLORS.gray[200],
                              }}
                              resizeMode="cover"
                            />
                            {media.type === 'video' && (
                              <View
                                className="absolute inset-0 items-center justify-center"
                                style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
                              >
                                <Ionicons name="play-circle" size={32} color="white" />
                              </View>
                            )}
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* 읽음 상태 */}
                {selectedNotice.isRead && (
                  <View
                    className="mt-2 rounded-xl p-4 mb-4"
                    style={{ backgroundColor: PARENT_COLORS.success[50] }}
                  >
                    <View className="flex-row items-center">
                      <Ionicons name="checkmark-circle" size={20} color={PARENT_COLORS.success[600]} />
                      <Text className="font-semibold ml-2" style={{ color: PARENT_COLORS.success[700] }}>
                        읽음 완료
                      </Text>
                    </View>
                  </View>
                )}

                {/* 바로가기 버튼 */}
                {selectedNotice.navigateTo && (
                  <TouchableOpacity
                    onPress={() => {
                      setShowDetailModal(false);
                      navigation.navigate(selectedNotice.navigateTo);
                    }}
                    className="rounded-2xl py-4 mb-4"
                    style={{ backgroundColor: PARENT_COLORS.primary.DEFAULT }}
                    activeOpacity={0.8}
                  >
                    <View className="flex-row items-center justify-center">
                      <Ionicons name="arrow-forward-circle" size={20} color="white" />
                      <Text className="text-white font-bold text-base ml-2">
                        {selectedNotice.navigateTo === 'Tuition' ? '수강료 확인하기' : '바로가기'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}

                {/* 구분선 */}
                <View className="border-t border-gray-200 my-4" />

                {/* 댓글 섹션 */}
                <CommentSection
                  noticeId={selectedNotice.id}
                  userType="parent"
                />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
