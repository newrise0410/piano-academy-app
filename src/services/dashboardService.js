// src/services/dashboardService.js
import COLORS from '../styles/colors';
import { ActivityRepository } from '../repositories/ActivityRepository';
import { StudentRepository } from '../repositories/studentRepository';

// 시간 포맷 헬퍼
const formatActivityTime = (timestamp) => {
  const now = new Date();
  const activityTime = new Date(timestamp);
  const diffMs = now - activityTime;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;

  return activityTime.toLocaleDateString('ko-KR', {
    month: 'numeric',
    day: 'numeric'
  });
};

// 대시보드 통계 (Firebase 데이터 기반)
export const getDashboardStats = async () => {
  try {
    const students = await StudentRepository.getAll();

    // 오늘 요일 확인
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const today = days[new Date().getDay()];

    const todayStudents = students.filter(student => {
      const schedule = student.schedule || '';
      const scheduleDays = schedule.split(' ')[0]?.split('/') || [];
      return scheduleDays.includes(today);
    });

    const unpaidCount = students.filter(s => s.unpaid).length;
    const makeupClassesCount = students.filter(s =>
      s.ticketType === 'count' && (s.ticketCount === 1 || s.ticketCount === 2)
    ).length;

    return {
      todayClasses: todayStudents.length,
      unpaidStudents: unpaidCount,
      makeupClasses: makeupClassesCount,
    };
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return {
      todayClasses: 0,
      unpaidStudents: 0,
      makeupClasses: 0,
    };
  }
};

// 최근 활동 (Firebase 데이터 기반)
export const getRecentActivities = async () => {
  try {
    const activities = [];

    // 학생 데이터 가져오기
    const students = await StudentRepository.getAll();

    // 미납 학생이 있으면 알림 추가 (최우선)
    const unpaidStudents = students.filter(s => s.unpaid);
    if (unpaidStudents.length > 0) {
      activities.push({
        id: 'unpaid-alert',
        title: '수강료 미납 알림',
        description: `${unpaidStudents.length}명 미납 · 확인 필요`,
        icon: 'alert-circle',
        color: COLORS.danger.DEFAULT,
      });
    }

    // 잔여 회차 적은 학생 알림
    const lowSessionStudents = students.filter(s =>
      s.ticketType === 'count' && (s.ticketCount === 1 || s.ticketCount === 2)
    );
    if (lowSessionStudents.length > 0) {
      activities.push({
        id: 'low-session-alert',
        title: '수강권 갱신 필요',
        description: `${lowSessionStudents.length}명 수강권 부족 · ${lowSessionStudents[0]?.name} 외`,
        icon: 'time',
        color: COLORS.warning.DEFAULT,
      });
    }

    // Firebase에서 최근 활동 데이터 가져오기
    const recentActivityData = await ActivityRepository.getRecent(5);
    recentActivityData.forEach((activity) => {
      let title = activity.action || '활동';
      if (activity.studentName) {
        title = `${activity.studentName} ${activity.action}`;
      }

      activities.push({
        id: activity.id,
        title: title,
        description: `${activity.details || ''} · ${formatActivityTime(activity.timestamp)}`,
        icon: activity.icon || 'information-circle',
        color: activity.color || COLORS.primary.DEFAULT,
      });
    });

    return activities.slice(0, 5); // 최대 5개 표시
  } catch (error) {
    console.error('Recent activities error:', error);
    return [];
  }
};