// src/screens/teacher/DashboardScreen.js
import React, { useState, useMemo, useEffect } from 'react';
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
  MonthlyRevenueChart,
  AttendanceRateChart,
} from '../../components/common';

// 모달 컴포넌트
import TodayClassesModal from '../../components/teacher/TodayClassesModal';
import UnpaidStudentsModal from '../../components/teacher/UnpaidStudentsModal';
import MakeupClassesModal from '../../components/teacher/MakeupClassesModal';

import useDashboard from '../../hooks/useDashboard';
import useActivities from '../../hooks/useActivities';
import {
  useStudentStore,
  useToastStore,
  useNotificationStore,
  usePaymentStore,
  useAttendanceStore,
  useAuthStore
} from '../../store';

export default function DashboardScreen({ navigation }) {
  const { stats, loading: statsLoading, refresh: refreshStats } = useDashboard();
  const { activities, loading: activitiesLoading, refresh: refreshActivities } = useActivities();
  const { students, fetchStudents } = useStudentStore();
  const { getUnreadCount, subscribeNotifications, unsubscribeNotifications } = useNotificationStore();
  const { payments, fetchAllPayments } = usePaymentStore();
  const { records, fetchAllRecords } = useAttendanceStore();
  const user = useAuthStore((state) => state.user);
  const toast = useToastStore();

  // 모달 상태
  const [todayClassesModalVisible, setTodayClassesModalVisible] = useState(false);
  const [unpaidModalVisible, setUnpaidModalVisible] = useState(false);
  const [makeupModalVisible, setMakeupModalVisible] = useState(false);
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);

  // 읽지 않은 알림 수
  const unreadCount = getUnreadCount();

  // 초기 데이터 로드
  useEffect(() => {
    fetchStudents();
    fetchAllPayments();
    fetchAllRecords();
  }, []);

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

  const onRefresh = async () => {
    await Promise.all([
      refreshStats(),
      refreshActivities(),
      fetchStudents(),
      fetchAllPayments(),
      fetchAllRecords()
    ]);
  };

  const isLoading = statsLoading || activitiesLoading;

  // 오늘 수업 학생 필터링 (실제로는 요일/시간 기반으로 필터링)
  const todayStudents = useMemo(() => {
    const today = new Date().getDay(); // 0: 일, 1: 월, ...
    const dayMap = ['일', '월', '화', '수', '목', '금', '토'];
    const todayKorean = dayMap[today];

    return students.filter(student => {
      const schedule = student.schedule || '';
      return schedule.includes(todayKorean);
    });
  }, [students]);

  // 미납 학생 필터링
  const unpaidStudents = useMemo(() => {
    return students.filter(student => student.unpaid === true).map(student => ({
      ...student,
      unpaidAmount: 280000, // 실제로는 DB에서
      lastPaymentDate: '2025.01.05', // 실제로는 DB에서
    }));
  }, [students]);

  // 보강 예정 (Mock 데이터 - 실제로는 별도 Store에서)
  const makeupClasses = useMemo(() => [
    {
      id: '1',
      studentName: '김철수',
      level: '중급',
      originalDate: '2025-01-13',
      reason: '학교 행사',
      scheduledDate: '2025-01-20',
      scheduledTime: '16:00',
    },
    {
      id: '2',
      studentName: '이영희',
      level: '초급',
      originalDate: '2025-01-14',
      reason: '감기',
      scheduledDate: null,
      scheduledTime: null,
    },
  ], []);

  // 월별 매출 차트 데이터 (최근 6개월)
  const monthlyRevenueData = useMemo(() => {
    const labels = [];
    const values = [];
    const now = new Date();

    // 최근 6개월 생성
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM
      const monthLabel = `${date.getMonth() + 1}월`;

      labels.push(monthLabel);

      // 해당 월의 결제 합계
      if (payments && payments.length > 0) {
        const monthPayments = payments.filter(p => {
          const paymentMonth = p.date?.slice(0, 7);
          return paymentMonth === monthKey && p.status === 'paid';
        });
        const total = monthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
        values.push(total);
      } else {
        values.push(0);
      }
    }

    return { labels, values };
  }, [payments]);

  // 주별 출석률 차트 데이터 (이번 달)
  const weeklyAttendanceData = useMemo(() => {
    const labels = [];
    const values = [];
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM

    // 이번 달 출석 기록만 필터
    const monthRecords = records && records.length > 0
      ? records.filter(r => r.date?.startsWith(currentMonth))
      : [];

    // 주차별로 그룹화 (간단하게 7일씩 나눔)
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    let weekNum = 1;
    for (let d = new Date(startDate); d <= endDate; weekNum++) {
      const weekEnd = new Date(d);
      weekEnd.setDate(weekEnd.getDate() + 6);

      labels.push(`${weekNum}주`);

      if (monthRecords.length > 0) {
        const weekRecords = monthRecords.filter(r => {
          const recordDate = new Date(r.date);
          return recordDate >= d && recordDate <= weekEnd;
        });

        const presentCount = weekRecords.filter(r => r.status === 'present' || r.status === 'makeup').length;
        const rate = weekRecords.length > 0 ? (presentCount / weekRecords.length) * 100 : 0;
        values.push(Math.round(rate));
      } else {
        values.push(0);
      }

      d.setDate(d.getDate() + 7);
      if (labels.length >= 4) break; // 최대 4주
    }

    return { labels, values };
  }, [records]);

  // 연락하기 핸들러
  const handleContact = (student) => {
    if (student.parentPhone) {
      Alert.alert(
        '학부모 연락',
        `${student.name} 학부모님께 연락하시겠습니까?`,
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

  // 보강 일정 잡기
  const handleScheduleMakeup = (makeup) => {
    toast.info('일정 잡기 기능은 준비 중입니다');
    // TODO: 날짜/시간 선택 모달 열기
  };

  // 보강 완료 처리
  const handleCompleteMakeup = (makeup) => {
    Alert.alert(
      '보강 완료',
      `${makeup.studentName}의 보강을 완료 처리하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '완료',
          onPress: () => {
            toast.success('보강이 완료되었습니다');
            setMakeupModalVisible(false);
            // TODO: Store 업데이트
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScrollView 
        className="flex-1 bg-gray-50"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
      >
        {/* 헤더 */}
        <View className="bg-primary px-5 pt-2 pb-8 flex-row justify-between items-center">
          <View>
            <Text className="text-white text-sm opacity-90">안녕하세요 👋</Text>
            <Text className="text-white text-xl font-bold mt-1">김세욱 선생님</Text>
          </View>
          <NotificationBadge
            count={unreadCount}
            onPress={() => setNotificationModalVisible(true)}
            iconColor={TEACHER_COLORS.white}
          />
        </View>

        {/* 컨텐츠 */}
        <View className="px-5 -mt-5">
          {/* 오늘의 현황 */}
          <Card>
            <Text className="text-lg font-bold text-gray-800 mb-4">오늘의 현황</Text>
            <View className="flex-row justify-between -mx-1">
              <TouchableOpacity
                onPress={() => setTodayClassesModalVisible(true)}
                activeOpacity={0.7}
                style={{ flex: 1 }}
              >
                <StatBox
                  number={`${todayStudents.length}명`}
                  label="오늘 수업"
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setUnpaidModalVisible(true)}
                activeOpacity={0.7}
                style={{ flex: 1 }}
              >
                <StatBox
                  number={`${unpaidStudents.length}명`}
                  label="미납 학생"
                  variant="warning"
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setMakeupModalVisible(true)}
                activeOpacity={0.7}
                style={{ flex: 1 }}
              >
                <StatBox
                  number={`${makeupClasses.length}건`}
                  label="보강 예정"
                  variant="success"
                />
              </TouchableOpacity>
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
              title="갤러리 관리"
              icon="images"
              variant="outline"
              onPress={() => navigation.navigate('GalleryScreen')}
              className="mt-3"
            />

            <Button
              title="🔥 Firebase 테스트"
              icon="flask"
              variant="outline"
              onPress={() => navigation.navigate('FirebaseTestScreen')}
              className="mt-3"
            />
          </Card>

          {/* 통계 차트 */}
          <Card className="mt-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-gray-800">통계 분석</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('StatisticsScreen')}
                className="flex-row items-center"
              >
                <Text className="text-sm font-medium mr-1" style={{ color: TEACHER_COLORS.primary.DEFAULT }}>
                  전체보기
                </Text>
                <Ionicons name="chevron-forward" size={16} color={TEACHER_COLORS.primary.DEFAULT} />
              </TouchableOpacity>
            </View>

            <MonthlyRevenueChart
              data={monthlyRevenueData}
              title="최근 6개월 매출"
            />
          </Card>

          <Card className="mt-4">
            <AttendanceRateChart
              data={weeklyAttendanceData}
              title="이번 달 출석률"
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
        onContact={handleContact}
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
    </SafeAreaView>
  );
}