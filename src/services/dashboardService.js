// src/services/dashboardService.js
import { mockStudents } from '../data/mockStudents';
import { getActivities, formatActivityTime } from '../data/mockActivities';
import COLORS from '../styles/colors';

// 오늘 요일에 해당하는 학생 필터링 헬퍼 함수
const getTodayStudents = () => {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const today = days[new Date().getDay()]; // 오늘 요일

  return mockStudents.filter(student => {
    // schedule: '월/수 16:00' 형식에서 요일 추출
    const scheduleDays = student.schedule.split(' ')[0].split('/');
    return scheduleDays.includes(today);
  });
};

// 대시보드 통계 (실제 데이터 기반)
export const getDashboardStats = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 실제 데이터 기반 계산
      const todayStudents = getTodayStudents();
      const unpaidCount = mockStudents.filter(s => s.unpaid).length;
      const makeupClassesCount = mockStudents.filter(s => s.ticketType === 'count' && (s.ticketCount === 1 || s.ticketCount === 2)).length;

      resolve({
        todayClasses: todayStudents.length,
        unpaidStudents: unpaidCount,
        makeupClasses: makeupClassesCount,
      });
    }, 300);
  });
};

// 최근 활동 (실제 데이터 기반)
export const getRecentActivities = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const activities = [];

      // 미납 학생이 있으면 알림 추가 (최우선)
      const unpaidStudents = mockStudents.filter(s => s.unpaid);
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
      const lowSessionStudents = mockStudents.filter(s => s.ticketType === 'count' && (s.ticketCount === 1 || s.ticketCount === 2));
      if (lowSessionStudents.length > 0) {
        activities.push({
          id: 'low-session-alert',
          title: '수강권 갱신 필요',
          description: `${lowSessionStudents.length}명 수강권 부족 · ${lowSessionStudents[0]?.name} 외`,
          icon: 'time',
          color: COLORS.warning.DEFAULT,
        });
      }

      // 실제 최근 활동 데이터 가져오기
      const recentActivityData = getActivities().slice(0, 5);
      recentActivityData.forEach((activity) => {
        let title = activity.action;
        if (activity.studentName) {
          title = `${activity.studentName} ${activity.action}`;
        }

        activities.push({
          id: activity.id,
          title: title,
          description: `${activity.details} · ${formatActivityTime(activity.timestamp)}`,
          icon: activity.icon,
          color: activity.color,
        });
      });

      resolve(activities.slice(0, 5)); // 최대 5개 표시
    }, 300);
  });
};