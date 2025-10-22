// src/screens/parent/HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { query, collection, where, getDocs } from 'firebase/firestore';
import {
  Text,
  Card,
  StatBox,
  ListItem,
  NotificationBadge,
  NotificationModal,
  AppSidebar,
} from '../../components/common';
import PARENT_COLORS, { PARENT_GRADIENTS } from '../../styles/parent_colors';
import { useAuthStore } from '../../store';
import { getStudentById, getLessonNotesByStudent, getNoticesForStudent } from '../../services/firestoreService';
import { getParentMenuSections } from '../../config/sidebarConfig';
import { db } from '../../config/firebase';
import { updateUserProfile } from '../../services/authService';

export default function HomeScreen({ navigation }) {
  const { user } = useAuthStore();
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [recentNotes, setRecentNotes] = useState([]);
  const [recentNotices, setRecentNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 학부모용 사이드바 메뉴 설정
  const parentMenuSections = getParentMenuSections(navigation, () => {
    console.log('사이드바 닫기');
    setSidebarVisible(false);
  });

  const handleOpenSidebar = () => {
    console.log('사이드바 열기 클릭');
    setSidebarVisible(true);
    console.log('sidebarVisible 상태:', true);
  };

  useEffect(() => {
    loadData();
  }, [user?.studentId]);

  useEffect(() => {
    console.log('🎨 sidebarVisible 변경:', sidebarVisible);
  }, [sidebarVisible]);

  const loadData = async () => {
    console.log('🏠 HomeScreen - loadData 시작');
    console.log('👤 User:', user);
    console.log('🆔 StudentId:', user?.studentId);
    console.log('👶 ChildName:', user?.childName);

    // studentId가 없으면 childName으로 찾기
    let studentId = user?.studentId;

    if (!studentId && user?.childName) {
      console.warn('⚠️ studentId가 없습니다. childName으로 학생 찾기 시도:', user.childName);

      try {
        // parentId로 학생 찾기
        const q = query(
          collection(db, 'students'),
          where('parentId', '==', user.uid)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const foundStudent = snapshot.docs[0];
          studentId = foundStudent.id;
          console.log('✅ 학생 찾음:', studentId);

          // user profile 업데이트
          await updateUserProfile(user.uid, { studentId });

          // authStore 업데이트
          const { updateUser } = useAuthStore.getState();
          updateUser({ studentId });

          console.log('✅ studentId 업데이트 완료');
        } else {
          console.error('❌ 학생을 찾을 수 없습니다');
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('❌ 학생 찾기 실패:', error);
        setLoading(false);
        return;
      }
    }

    if (!studentId) {
      console.warn('⚠️ studentId를 찾을 수 없습니다');
      setLoading(false);
      return;
    }

    try {
      // 학생 정보 로드
      console.log('📖 학생 정보 로드 시작:', studentId);
      const studentResult = await getStudentById(studentId);
      console.log('📖 학생 정보 결과:', studentResult);

      if (studentResult.success && studentResult.data) {
        setStudentData(studentResult.data);
        console.log('✅ 학생 정보 설정 완료');
      } else {
        console.error('❌ 학생 정보 로드 실패:', studentResult);
      }

      // 최근 수업 일지 3개 로드
      console.log('📝 수업 일지 로드 시작');
      const notesResult = await getLessonNotesByStudent(studentId, { limit: 3 });
      console.log('📝 수업 일지 결과:', notesResult);

      if (notesResult.success && notesResult.notes) {
        setRecentNotes(notesResult.notes);
        console.log('✅ 수업 일지 설정 완료:', notesResult.notes.length, '개');
      }

      // 최근 알림장 4개 로드
      console.log('📢 알림장 로드 시작');
      const noticesResult = await getNoticesForStudent(studentId);
      console.log('📢 알림장 결과:', noticesResult);

      if (noticesResult.success && noticesResult.data) {
        // 최근 4개만 저장
        setRecentNotices(noticesResult.data.slice(0, 4));
        console.log('✅ 알림장 설정 완료:', noticesResult.data.slice(0, 4).length, '개');
      }
    } catch (error) {
      console.error('❌ 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // 오늘 요일 확인
  const getTodaySchedule = () => {
    if (!studentData?.schedule) return { hasClass: false };

    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const today = days[new Date().getDay()];

    const scheduleParts = studentData.schedule.split(' ');
    const scheduleDays = scheduleParts[0]?.split('/') || [];
    const scheduleTime = scheduleParts[1] || '';

    if (scheduleDays.includes(today)) {
      return {
        hasClass: true,
        time: scheduleTime,
        day: today,
      };
    }

    return { hasClass: false };
  };

  const todaySchedule = getTodaySchedule();

  // 읽지 않은 알림장 개수 (학부모 알림)
  const unreadCount = recentNotices.filter(n => !n.isRead).length;

  // 날짜 형식 포맷 함수
  const formatDate = (dateValue) => {
    if (!dateValue) return '날짜 없음';

    let date;
    if (dateValue.toDate) {
      date = dateValue.toDate();
    } else if (typeof dateValue === 'string') {
      date = new Date(dateValue);
    } else {
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

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={PARENT_COLORS.primary.DEFAULT} />
        </View>
      </View>
    );
  }

  if (!studentData) {
    return (
      <View className="flex-1 bg-gray-50">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* 그라디언트 헤더 */}
          <LinearGradient
            colors={PARENT_GRADIENTS.primaryGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingTop: 50, paddingBottom: 80 }}
          >
            <View className="px-5 flex-row justify-between items-center">
              <TouchableOpacity onPress={handleOpenSidebar} activeOpacity={0.7}>
                <View>
                  <Text className="text-white text-sm opacity-90">안녕하세요 👋</Text>
                  <Text className="text-white text-2xl font-bold mt-1">{user?.displayName || user?.name}님</Text>
                </View>
              </TouchableOpacity>
              <NotificationBadge
                count={unreadCount}
                onPress={() => setNotificationModalVisible(true)}
                iconColor="white"
              />
            </View>
          </LinearGradient>

          {/* 자녀 등록 안내 */}
          <View className="px-5" style={{ marginTop: -60 }}>
            <View
              className="bg-white rounded-3xl p-8 mb-4"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <View className="items-center">
                <View className="bg-gray-100 rounded-full p-6 mb-4">
                  <Ionicons name="person-add-outline" size={64} color={PARENT_COLORS.primary.DEFAULT} />
                </View>
                <Text className="text-gray-800 font-bold text-2xl text-center mb-2">
                  등록된 자녀 정보가 없습니다
                </Text>
                <Text className="text-gray-500 text-center mb-6">
                  자녀 정보를 등록하면{'\n'}수업 일지, 출석 현황 등을 확인할 수 있어요
                </Text>

                <TouchableOpacity
                  onPress={() => navigation.navigate('ChildRegistrationRequest')}
                  activeOpacity={0.8}
                  className="rounded-2xl py-4 px-8 w-full"
                  style={{
                    backgroundColor: PARENT_COLORS.primary.DEFAULT,
                    shadowColor: PARENT_COLORS.primary.DEFAULT,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons name="add-circle-outline" size={24} color="white" />
                    <Text className="text-white font-bold text-lg ml-2">자녀 등록 요청하기</Text>
                  </View>
                </TouchableOpacity>

                <Text className="text-gray-400 text-sm mt-4 text-center">
                  등록 요청 후 선생님이 승인하면{'\n'}자동으로 연결됩니다
                </Text>
              </View>
            </View>

            {/* 안내 카드 */}
            <View
              className="bg-white rounded-3xl p-6 mb-6"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View className="flex-row items-center mb-4">
                <View className="bg-blue-50 rounded-full p-2 mr-3">
                  <Ionicons name="information-circle" size={24} color={PARENT_COLORS.blue[500]} />
                </View>
                <Text className="text-gray-800 font-bold text-lg">자녀 등록 절차</Text>
              </View>
              <View>
                <View className="flex-row items-start mb-3">
                  <View className="bg-blue-100 rounded-full w-6 h-6 items-center justify-center mr-3">
                    <Text className="text-blue-600 font-bold text-sm">1</Text>
                  </View>
                  <Text className="text-gray-600 flex-1 pt-0.5">자녀 정보 입력 (이름, 나이 등)</Text>
                </View>
                <View className="flex-row items-start mb-3">
                  <View className="bg-blue-100 rounded-full w-6 h-6 items-center justify-center mr-3">
                    <Text className="text-blue-600 font-bold text-sm">2</Text>
                  </View>
                  <Text className="text-gray-600 flex-1 pt-0.5">선생님에게 등록 요청</Text>
                </View>
                <View className="flex-row items-start">
                  <View className="bg-blue-100 rounded-full w-6 h-6 items-center justify-center mr-3">
                    <Text className="text-blue-600 font-bold text-sm">3</Text>
                  </View>
                  <Text className="text-gray-600 flex-1 pt-0.5">선생님 승인 후 학생 등록 완료</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* 알림 모달 */}
        <NotificationModal
          visible={notificationModalVisible}
          onClose={() => setNotificationModalVisible(false)}
          userType="parent"
          customNotifications={recentNotices}
          onNotificationPress={(notice) => {
            setNotificationModalVisible(false);
            if (notice.navigateTo) {
              navigation.navigate(notice.navigateTo);
            } else {
              navigation.navigate('Notice');
            }
          }}
        />

        {/* 사이드바 */}
        <AppSidebar
          visible={sidebarVisible}
          onClose={() => setSidebarVisible(false)}
          menuSections={parentMenuSections}
          theme={PARENT_COLORS}
          userRole="parent"
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 그라디언트 헤더 */}
        <LinearGradient
          colors={PARENT_GRADIENTS.primaryGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: 50, paddingBottom: 80 }}
        >
          <View className="px-5 flex-row justify-between items-center">
            <TouchableOpacity onPress={handleOpenSidebar} activeOpacity={0.7}>
              <View>
                <Text className="text-white text-sm opacity-90">안녕하세요 👋</Text>
                <Text className="text-white text-2xl font-bold mt-1">{studentData.name} 학부모님</Text>
              </View>
            </TouchableOpacity>
            <NotificationBadge
              count={unreadCount}
              onPress={() => setNotificationModalVisible(true)}
              iconColor="white"
            />
          </View>
        </LinearGradient>

        {/* 컨텐츠 */}
        <View className="px-5" style={{ marginTop: -60 }}>
          {/* 자녀 정보 플로팅 카드 */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate('ChildInfo')}
          >
            <View
              className="bg-white rounded-3xl p-6 mb-4"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-1">
                  <Text className="text-gray-800 text-3xl font-bold mb-2">{studentData.name}</Text>
                  <View className="flex-row items-center">
                    <View className="px-3 py-1.5 rounded-full mr-2" style={{ backgroundColor: PARENT_COLORS.primary[100] }}>
                      <Text className="text-xs font-bold" style={{ color: PARENT_COLORS.primary[600] }}>{studentData.level}</Text>
                    </View>
                    <Ionicons name="time-outline" size={16} color={PARENT_COLORS.gray[400]} />
                    <Text className="text-gray-500 text-sm ml-1">{studentData.schedule || '일정 미정'}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={28} color={PARENT_COLORS.primary.DEFAULT} />
              </View>

              {/* 진행 상황 */}
              <View className="bg-gray-50 rounded-2xl p-4">
                {studentData.ticketType === 'period' ? (
                  // 기간정액권
                  <View>
                    <View className="flex-row items-center mb-2">
                      <Ionicons name="calendar" size={20} color={PARENT_COLORS.primary[600]} />
                      <Text className="text-gray-700 font-semibold ml-2">기간정액권</Text>
                    </View>
                    <View className="flex-row items-center justify-between">
                      <Text className="text-gray-600">
                        {studentData.ticketPeriod?.start || '-'} ~ {studentData.ticketPeriod?.end || '-'}
                      </Text>
                    </View>
                  </View>
                ) : (
                  // 회차권
                  <View>
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-gray-700 font-semibold">남은 수업</Text>
                      <Text className="text-2xl font-bold" style={{ color: PARENT_COLORS.primary.DEFAULT }}>
                        {studentData.ticketCount || 0}회
                      </Text>
                    </View>
                    {/* 진행바 */}
                    <View className="bg-gray-200 h-2 rounded-full overflow-hidden">
                      <View
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(((studentData.ticketCount || 0) / 10) * 100, 100)}%`,
                          backgroundColor: PARENT_COLORS.primary.DEFAULT
                        }}
                      />
                    </View>
                  </View>
                )}
                <View className="flex-row justify-between mt-3">
                  <View className="items-center">
                    <Ionicons name="book" size={20} color={PARENT_COLORS.purple[600]} />
                    <Text className="text-gray-500 text-xs mt-1">교재</Text>
                    <Text className="text-gray-800 font-semibold text-sm">{studentData.book || '미정'}</Text>
                  </View>
                  <View className="items-center">
                    <Ionicons name="calendar" size={20} color={PARENT_COLORS.blue[500]} />
                    <Text className="text-gray-500 text-xs mt-1">레벨</Text>
                    <Text className="text-gray-800 font-semibold text-sm">{studentData.level}</Text>
                  </View>
                  <View className="items-center">
                    <Ionicons name="time" size={20} color={PARENT_COLORS.success.DEFAULT} />
                    <Text className="text-gray-500 text-xs mt-1">수업 시간</Text>
                    <Text className="text-gray-800 font-semibold text-sm">{studentData.schedule?.split(' ')[1] || '-'}</Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* 오늘의 일정 */}
          {todaySchedule.hasClass ? (
            <View
              className="rounded-3xl p-5 mb-4"
              style={{
                backgroundColor: PARENT_COLORS.primary.DEFAULT,
                shadowColor: PARENT_COLORS.primary.DEFAULT,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <View className="flex-row items-center justify-between mb-3">
                <View>
                  <Text className="text-white text-xs font-semibold opacity-90 mb-1">오늘의 수업</Text>
                  <Text className="text-white text-2xl font-bold">🎹 피아노 레슨</Text>
                </View>
                <View className="bg-white/20 px-4 py-2 rounded-full">
                  <Text className="text-white font-bold text-sm">오늘</Text>
                </View>
              </View>
              <View className="flex-row items-center bg-white/20 rounded-2xl p-3">
                <Ionicons name="time" size={20} color="white" />
                <Text className="text-white font-semibold ml-2 text-base">{todaySchedule.time}</Text>
              </View>
            </View>
          ) : (
            <View className="bg-white rounded-3xl p-6 mb-4" style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 3,
            }}>
              <Text className="text-lg font-bold text-gray-800 mb-3">오늘의 일정</Text>
              <View className="items-center py-6">
                <View className="bg-gray-100 rounded-full p-4 mb-3">
                  <Ionicons name="calendar-outline" size={40} color={PARENT_COLORS.gray[400]} />
                </View>
                <Text className="text-gray-500 font-medium">오늘은 수업이 없어요</Text>
                {studentData.schedule && (
                  <Text className="text-gray-400 text-sm mt-1">다음 수업: {studentData.schedule}</Text>
                )}
              </View>
            </View>
          )}

          {/* 최근 알림장 */}
          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-gray-800">최근 알림장</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate('Notice')}
              >
                <View className="flex-row items-center">
                  <Text className="text-sm font-semibold mr-1" style={{ color: PARENT_COLORS.primary.DEFAULT }}>전체보기</Text>
                  <Ionicons name="chevron-forward" size={16} color={PARENT_COLORS.primary.DEFAULT} />
                </View>
              </TouchableOpacity>
            </View>

            {recentNotices.length > 0 ? (
              recentNotices.map((notice) => (
                <TouchableOpacity
                  key={notice.id}
                  activeOpacity={0.8}
                  onPress={() => {
                    if (notice.navigateTo) {
                      navigation.navigate(notice.navigateTo);
                    } else {
                      navigation.navigate('Notice');
                    }
                  }}
                  className="rounded-2xl p-4 mb-3"
                  style={{
                    backgroundColor: notice.isRead ? '#ffffff' : PARENT_COLORS.primary[50],
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 6,
                    elevation: 2,
                  }}
                >
                  <View className="flex-row items-start">
                    <View className="rounded-full p-2 mr-3" style={{
                      backgroundColor: notice.isRead ? PARENT_COLORS.gray[100] : PARENT_COLORS.primary[100]
                    }}>
                      <Ionicons
                        name={notice.isRead ? 'mail-open' : 'mail'}
                        size={20}
                        color={notice.isRead ? PARENT_COLORS.gray[500] : PARENT_COLORS.primary[600]}
                      />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center mb-1">
                        <Text className="text-gray-800 font-bold flex-1" numberOfLines={1}>
                          {notice.title || '알림장'}
                        </Text>
                        {!notice.isRead && (
                          <View className="rounded-full px-2 py-0.5 ml-2" style={{ backgroundColor: PARENT_COLORS.primary.DEFAULT }}>
                            <Text className="text-white text-xs font-bold">NEW</Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-gray-500 text-sm mb-1" numberOfLines={2}>
                        {notice.content || '내용이 없습니다'}
                      </Text>
                      <View className="flex-row items-center">
                        <Text className="text-gray-400 text-xs">
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
                    <Ionicons name="chevron-forward" size={20} color={PARENT_COLORS.gray[300]} />
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View className="bg-white rounded-2xl p-8 items-center" style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 6,
                elevation: 2,
              }}>
                <View className="bg-gray-100 rounded-full p-4 mb-3">
                  <Ionicons name="notifications-outline" size={40} color={PARENT_COLORS.gray[400]} />
                </View>
                <Text className="text-gray-500 font-medium">아직 받은 알림장이 없어요</Text>
              </View>
            )}
          </View>

          {/* 최근 수업 일지 */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-gray-800">최근 수업 일지</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate('LessonNote')}
              >
                <View className="flex-row items-center">
                  <Text className="text-sm font-semibold mr-1" style={{ color: PARENT_COLORS.primary.DEFAULT }}>전체보기</Text>
                  <Ionicons name="chevron-forward" size={16} color={PARENT_COLORS.primary.DEFAULT} />
                </View>
              </TouchableOpacity>
            </View>

            {recentNotes.length > 0 ? (
              recentNotes.map((note, index) => (
                <TouchableOpacity
                  key={note.id}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('LessonNote')}
                  className="bg-white rounded-2xl p-4 mb-3"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 6,
                    elevation: 2,
                  }}
                >
                  <View className="flex-row items-start">
                    <View className="rounded-full p-2 mr-3" style={{ backgroundColor: PARENT_COLORS.purple[50] }}>
                      <Ionicons name="book" size={20} color={PARENT_COLORS.purple[600]} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-800 font-bold mb-1">{note.title || `${note.date} 수업`}</Text>
                      <Text className="text-gray-500 text-sm" numberOfLines={2}>
                        {note.description || '수업 일지 내용이 없습니다'}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={PARENT_COLORS.gray[300]} />
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View className="bg-white rounded-2xl p-8 items-center" style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 6,
                elevation: 2,
              }}>
                <View className="bg-gray-100 rounded-full p-4 mb-3">
                  <Ionicons name="document-text-outline" size={40} color={PARENT_COLORS.gray[400]} />
                </View>
                <Text className="text-gray-500 font-medium">아직 작성된 수업 일지가 없어요</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* 알림 모달 */}
      <NotificationModal
        visible={notificationModalVisible}
        onClose={() => setNotificationModalVisible(false)}
        userType="parent"
        customNotifications={recentNotices}
        onNotificationPress={(notice) => {
          setNotificationModalVisible(false);
          if (notice.navigateTo) {
            navigation.navigate(notice.navigateTo);
          } else {
            navigation.navigate('Notice');
          }
        }}
      />

      {/* 사이드바 */}
      <AppSidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        menuSections={parentMenuSections}
        theme={PARENT_COLORS}
        userRole="parent"
      />
    </View>
  );
}
