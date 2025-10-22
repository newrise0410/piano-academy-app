// src/screens/teacher/DashboardScreen.js
import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl, TouchableOpacity, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import TEACHER_COLORS from '../../styles/teacher_colors';

import {
  Text,
  Card,
  Button,
  StatBox,
  ActivityItem,
  NotificationBadge,
  NotificationModal,
  AppSidebar,
} from '../../components/common';

// 모달 컴포넌트
import TodayClassesModal from '../../components/teacher/TodayClassesModal';
import UnpaidStudentsModal from '../../components/teacher/UnpaidStudentsModal';
import MakeupClassesModal from '../../components/teacher/MakeupClassesModal';
import ParentContactCard from '../../components/teacher/ParentContactCard';
import AiMessageModal from '../../components/teacher/AiMessageModal';

import useDashboard from '../../hooks/useDashboard';
import useActivities from '../../hooks/useActivities';
import { useUnpaidStudents } from '../../hooks/useUnpaidStudents';
import { useTodayStudents } from '../../hooks/useTodayStudents';
import { useMakeupClasses } from '../../hooks/useMakeupClasses';
import {
  useStudentStore,
  useToastStore,
  useNotificationStore,
  usePaymentStore,
  useAttendanceStore,
  useAuthStore
} from '../../store';
import { getParentContactNeeds } from '../../services/dashboardService';
import { getTeacherMenuSections } from '../../config/sidebarConfig';
import { NoticeRepository } from '../../repositories/NoticeRepository';

export default function DashboardScreen({ navigation }) {
  const { stats, loading: statsLoading, refresh: refreshStats } = useDashboard();
  const { activities, loading: activitiesLoading, refresh: refreshActivities } = useActivities();
  const { fetchStudents } = useStudentStore();
  const { getUnreadCount, subscribeNotifications, unsubscribeNotifications } = useNotificationStore();
  const { fetchAllPayments } = usePaymentStore();
  const { fetchAllRecords } = useAttendanceStore();
  const user = useAuthStore((state) => state.user);
  const toast = useToastStore();

  // Custom Hooks
  const unpaidStudents = useUnpaidStudents();
  const todayStudents = useTodayStudents();
  const makeupClasses = useMakeupClasses();

  // 모달 상태
  const [todayClassesModalVisible, setTodayClassesModalVisible] = useState(false);
  const [unpaidModalVisible, setUnpaidModalVisible] = useState(false);
  const [makeupModalVisible, setMakeupModalVisible] = useState(false);
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  const [aiMessageModalVisible, setAiMessageModalVisible] = useState(false);
  const [selectedContactNeed, setSelectedContactNeed] = useState(null);

  // 연락 필요한 학부모 목록
  const [contactNeeds, setContactNeeds] = useState([]);

  // 읽지 않은 알림 수
  const unreadCount = getUnreadCount();

  // 초기 데이터 로드
  useEffect(() => {
    fetchStudents();
    fetchAllPayments();
    fetchAllRecords();
    loadContactNeeds();
  }, []);

  // 연락 필요 목록 로드
  const loadContactNeeds = async () => {
    try {
      const needs = await getParentContactNeeds();
      setContactNeeds(needs);
    } catch (error) {
      console.error('연락 필요 목록 로드 오류:', error);
    }
  };

  // Firebase 알림 구독
  useEffect(() => {
    if (user?.uid) {
      subscribeNotifications(user.uid);
    }

    // Cleanup: 컴포넌트 unmount 시 구독 해제
    return () => {
      unsubscribeNotifications();
    };
  }, [user?.uid]);

  // 화면 포커스 시 활동 새로고침
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refreshActivities();
      refreshStats();
    });

    return unsubscribe;
  }, [navigation]);

  const onRefresh = async () => {
    await Promise.all([
      refreshStats(),
      refreshActivities(),
      fetchStudents(),
      fetchAllPayments(),
      fetchAllRecords(),
      loadContactNeeds()
    ]);
  };

  const isLoading = statsLoading || activitiesLoading;

  // 보강 일정 잡기
  const handleScheduleMakeup = () => {
    toast.info('일정 잡기 기능은 준비 중입니다');
  };

  // 보강 완료 처리
  const handleCompleteMakeup = async (makeup) => {
    Alert.alert(
      '보강 완료',
      `${makeup.studentName}의 보강을 완료 처리하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '완료',
          onPress: async () => {
            try {
              // 출석 기록 업데이트 (absent -> makeup)
              await fetchAllRecords(true);
              toast.success('보강이 완료되었습니다');
              setMakeupModalVisible(false);
            } catch (error) {
              console.error('보강 완료 처리 오류:', error);
              toast.error('보강 완료 처리에 실패했습니다');
            }
          },
        },
      ]
    );
  };

  // AI 메시지 생성 핸들러
  const handleGenerateMessage = (contactNeed) => {
    setSelectedContactNeed({
      type: contactNeed.type,
      student: contactNeed.student,
      reason: contactNeed.reason,
      daysOverdue: contactNeed.daysOverdue,
      absenceCount: contactNeed.absenceCount,
      remainingSessions: contactNeed.remainingSessions,
      noticeTitle: contactNeed.noticeTitle,
    });
    setAiMessageModalVisible(true);
  };

  // 전화 걸기 핸들러
  const handleCallParent = (contactNeed) => {
    const student = contactNeed.student;
    if (student.parentPhone) {
      Alert.alert(
        '학부모 연락',
        `${student.name} 학부모님께 전화하시겠습니까?`,
        [
          { text: '취소', style: 'cancel' },
          {
            text: '전화',
            onPress: () => Linking.openURL(`tel:${student.parentPhone}`),
          },
        ]
      );
    } else {
      toast.warning('등록된 연락처가 없습니다');
    }
  };

  // 미납 학생 알림 전송 핸들러
  const handleSendUnpaidNotice = async (student) => {
    Alert.alert(
      '미납 알림 전송',
      `${student.name} 학부모님께 미납 알림을 전송하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '전송',
          onPress: async () => {
            try {
              await NoticeRepository.create({
                title: '수강료 미납 안내',
                content: '수강료가 미납 중입니다. 수강료 탭을 눌러 확인해주세요.',
                recipients: [student.id],
                type: 'payment',
                navigateTo: 'Tuition', // 클릭 시 수강료 탭으로 이동
                createdAt: new Date().toISOString(),
                confirmed: 0,
                total: 1,
              });

              toast.success('미납 알림이 전송되었습니다');
              setUnpaidModalVisible(false);
            } catch (error) {
              console.error('알림 전송 오류:', error);
              toast.error('알림 전송에 실패했습니다');
            }
          },
        },
      ]
    );
  };

  // 사이드바 상태
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // 선생님용 사이드바 메뉴 설정
  const teacherMenuSections = getTeacherMenuSections(navigation, () => setSidebarVisible(false));

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* 헤더 */}
      <View className="bg-primary px-5 pb-8 pt-2">
        <View className="flex-row justify-between items-center">
          <TouchableOpacity onPress={() => setSidebarVisible(true)} activeOpacity={0.7}>
            <View>
              <Text className="text-white text-sm opacity-90">안녕하세요 👋</Text>
              <Text className="text-white text-xl font-bold mt-1">
                {user?.displayName || user?.email?.split('@')[0] || ''} 선생님
              </Text>
            </View>
          </TouchableOpacity>
          <NotificationBadge
            count={unreadCount}
            onPress={() => setNotificationModalVisible(true)}
            iconColor={TEACHER_COLORS.white}
          />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
      >
        {/* 컨텐츠 */}
        <View className="px-5 pt-4">
          {/* 오늘 연락할 학부모 - 최우선 섹션 */}
          {contactNeeds && contactNeeds.length > 0 && (
            <Card className="mb-4">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <Ionicons name="call" size={22} color={TEACHER_COLORS.primary.DEFAULT} />
                  <Text className="ml-2 text-lg font-bold text-gray-800">
                    오늘 연락할 학부모
                  </Text>
                </View>
                <View className="bg-red-100 px-2 py-1 rounded-full">
                  <Text className="text-red-700 text-xs font-bold">
                    {contactNeeds.length}건
                  </Text>
                </View>
              </View>

              {contactNeeds.slice(0, 3).map((need, index) => (
                <ParentContactCard
                  key={`${need.student.id}-${need.type}-${index}`}
                  urgency={need.urgency}
                  student={need.student}
                  reason={need.reason}
                  type={need.type}
                  onGenerateMessage={() => handleGenerateMessage(need)}
                  onCallParent={() => handleCallParent(need)}
                />
              ))}

              {contactNeeds.length > 3 && (
                <TouchableOpacity
                  onPress={() => navigation.navigate('ParentContactsScreen')}
                  className="mt-2 py-2 flex-row items-center justify-center"
                >
                  <Text className="font-medium mr-1" style={{ color: TEACHER_COLORS.primary.DEFAULT }}>
                    {contactNeeds.length - 3}건 더보기
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={TEACHER_COLORS.primary.DEFAULT} />
                </TouchableOpacity>
              )}
            </Card>
          )}

          {/* 오늘의 현황 */}
          <Card>
            <Text className="text-lg font-bold text-gray-800 mb-4">오늘의 현황</Text>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1, paddingRight: 4 }}>
                <TouchableOpacity
                  onPress={() => setTodayClassesModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <StatBox
                    number={`${todayStudents.length}명`}
                    label="오늘 수업"
                  />
                </TouchableOpacity>
              </View>

              <View style={{ flex: 1, paddingHorizontal: 4 }}>
                <TouchableOpacity
                  onPress={() => setUnpaidModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <StatBox
                    number={`${unpaidStudents.length}명`}
                    label="미납 학생"
                    variant="warning"
                  />
                </TouchableOpacity>
              </View>

              <View style={{ flex: 1, paddingLeft: 4 }}>
                <TouchableOpacity
                  onPress={() => setMakeupModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <StatBox
                    number={`${makeupClasses.length}건`}
                    label="보강 예정"
                    variant="success"
                  />
                </TouchableOpacity>
              </View>
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

            <Button
              title="통계 분석 보기"
              icon="stats-chart"
              variant="outline"
              onPress={() => navigation.navigate('StatisticsScreen')}
              className="mt-3"
            />

            <Button
              title="갤러리 관리"
              icon="images"
              variant="outline"
              onPress={() => navigation.navigate('GalleryScreen')}
              className="mt-3"
            />
          </Card>

          {/* 최근 활동 */}
          <Card className="mt-4 mb-5">
            <Text className="text-lg font-bold text-gray-800 mb-4">최근 활동</Text>

            {(activities || []).map((activity, index) => (
              <ActivityItem
                key={activity.id}
                icon={activity.icon}
                iconColor={activity.color}
                title={activity.title}
                description={activity.description}
                isLast={index === (activities || []).length - 1}
              />
            ))}
          </Card>
        </View>
      </ScrollView>

      {/* 모달들 */}
      <TodayClassesModal
        visible={todayClassesModalVisible}
        onClose={() => setTodayClassesModalVisible(false)}
        students={todayStudents}
        onViewAll={() => {
          setTodayClassesModalVisible(false);
          navigation.navigate('TodayClassesScreen');
        }}
      />

      <UnpaidStudentsModal
        visible={unpaidModalVisible}
        onClose={() => setUnpaidModalVisible(false)}
        students={unpaidStudents}
        onSendNotice={handleSendUnpaidNotice}
        onViewAll={() => {
          setUnpaidModalVisible(false);
          navigation.navigate('UnpaidStudentsScreen');
        }}
      />

      <MakeupClassesModal
        visible={makeupModalVisible}
        onClose={() => setMakeupModalVisible(false)}
        makeupClasses={makeupClasses}
        onSchedule={handleScheduleMakeup}
        onComplete={handleCompleteMakeup}
        onViewAll={() => {
          setMakeupModalVisible(false);
          navigation.navigate('MakeupClassesScreen');
        }}
      />

      {/* 알림 모달 */}
      <NotificationModal
        visible={notificationModalVisible}
        onClose={() => setNotificationModalVisible(false)}
      />

      {/* AI 메시지 생성 모달 */}
      {selectedContactNeed && (
        <AiMessageModal
          visible={aiMessageModalVisible}
          onClose={() => {
            setAiMessageModalVisible(false);
            setSelectedContactNeed(null);
          }}
          type={selectedContactNeed.type}
          context={selectedContactNeed}
        />
      )}

      {/* 사이드바 */}
      <AppSidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        menuSections={teacherMenuSections}
        theme={TEACHER_COLORS}
        userRole="teacher"
      />
    </SafeAreaView>
  );
}