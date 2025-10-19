// src/data/mockActivities.js
// 최근 활동 데이터 관리

let recentActivities = [
  {
    id: '1',
    type: 'attendance',
    studentId: '1',
    studentName: '김지우',
    action: '출석 체크',
    details: '정상 출석',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30분 전
    icon: 'checkmark-circle',
    color: '#10B981',
  },
  {
    id: '2',
    type: 'payment',
    studentId: '2',
    studentName: '박서준',
    action: '수강료 납부',
    details: '8회권 · 280,000원',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2시간 전
    icon: 'card',
    color: '#6366F1',
  },
  {
    id: '3',
    type: 'notice',
    studentId: null,
    studentName: null,
    action: '알림장 발송',
    details: '5명에게 발송 완료',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5시간 전
    icon: 'notifications',
    color: '#8B5CF6',
  },
  {
    id: '4',
    type: 'student',
    studentId: '5',
    studentName: '최민서',
    action: '학생 등록',
    details: '초급 · 월/수 16:00',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1일 전
    icon: 'person-add',
    color: '#06B6D4',
  },
  {
    id: '5',
    type: 'attendance',
    studentId: '3',
    studentName: '이민준',
    action: '출석 체크',
    details: '10분 지각',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2일 전
    icon: 'time',
    color: '#F59E0B',
  },
];

// 새 활동 추가
export const addActivity = (activityData) => {
  const newActivity = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    ...activityData,
  };

  recentActivities = [newActivity, ...recentActivities];

  // 최대 50개까지만 유지
  if (recentActivities.length > 50) {
    recentActivities = recentActivities.slice(0, 50);
  }

  return newActivity;
};

// 모든 활동 조회 (최신순)
export const getActivities = () => {
  return [...recentActivities].sort((a, b) =>
    new Date(b.timestamp) - new Date(a.timestamp)
  );
};

// 특정 학생의 활동 조회
export const getStudentActivities = (studentId) => {
  return recentActivities.filter(activity => activity.studentId === studentId);
};

// 특정 타입의 활동 조회
export const getActivitiesByType = (type) => {
  return recentActivities.filter(activity => activity.type === type);
};

// 시간 포맷 헬퍼
export const formatActivityTime = (timestamp) => {
  const now = new Date();
  const activityTime = new Date(timestamp);
  const diffMs = now - activityTime;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;

  return activityTime.toLocaleDateString('ko-KR', {
    month: 'numeric',
    day: 'numeric'
  });
};

export default recentActivities;
