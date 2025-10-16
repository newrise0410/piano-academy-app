// src/services/dashboardService.js

// 대시보드 통계 (목업 데이터)
export const getDashboardStats = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        todayClasses: 8,
        unpaidStudents: 3,
        makeupClasses: 2,
      });
    }, 500);
  });
};

// 최근 활동 (목업 데이터)
export const getRecentActivities = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          title: '발표회 안내 발송',
          description: '28/30명 확인 · 2시간 전',
          icon: 'notifications',
          color: '#8B5CF6',
        },
        {
          id: 2,
          title: '김민지 진도 업데이트',
          description: '바이엘 48쪽 완료 · 5시간 전',
          icon: 'book',
          color: '#3B82F6',
        },
        {
          id: 3,
          title: '이준호 출석 체크',
          description: '보강 예약 완료 · 1일 전',
          icon: 'checkmark-circle',
          color: '#10B981',
        },
      ]);
    }, 500);
  });
};