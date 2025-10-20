// src/data/mockParentData.js
// 학부모 앱용 Mock 데이터

// 자녀 정보
export const childData = {
  id: '1',
  name: '김민지',
  photo: null,
  birthDate: '2015.03.15',
  level: '초급',
  schedule: '월/수 16:00',
  teacher: '김원장',
  teacherId: '1',
  book: '바이엘',
  progress: 48, // %
  progressPage: 48,
  totalPages: 100,
  ticketType: 'count', // 'count' or 'period'
  ticketCount: 3, // 회차권: 남은 횟수
  ticketUsed: 1,
  ticketTotal: 4,
  ticketStartDate: null, // 기간권: 시작일
  ticketEndDate: null, // 기간권: 종료일
  ticketDaysRemaining: null, // 기간권: 남은 일수
  attendanceRate: '95%',
  totalAttendance: 38,
  consecutiveAttendance: 12,
  monthlyStats: [
    { month: '8월', progress: 40 },
    { month: '9월', progress: 65 },
    { month: '10월', progress: 85 },
    { month: '11월', progress: 30 },
  ],
};

// 최근 소식/활동
export const recentActivities = [
  {
    id: '1',
    type: 'notice',
    title: '발표회 안내',
    content: '12월 25일 발표회가 있습니다',
    date: '방금 전',
    isNew: true,
    icon: 'notifications',
    color: '#8B5CF6',
  },
  {
    id: '2',
    type: 'attendance',
    title: '출석 완료',
    content: '오늘 수업 잘 마쳤습니다 👏',
    date: '2시간 전',
    isNew: false,
    icon: 'checkmark-circle',
    color: '#10B981',
  },
  {
    id: '3',
    type: 'memo',
    title: '선생님 메모',
    content: '"리듬감이 많이 좋아졌어요!"',
    date: '어제',
    isNew: false,
    icon: 'chatbubble',
    color: '#3B82F6',
  },
];

// 오늘의 일정
export const todaySchedule = {
  hasClass: true,
  classTime: '16:00',
  classEndTime: '16:50',
  hoursUntilClass: 2,
  homework: '바이엘 48~50쪽 복습',
};

// 완료한 곡 목록
export const completedSongs = [
  { id: '1', name: '바이엘 48번', date: '2025.10.16', rating: 5 },
  { id: '2', name: '바이엘 47번', date: '2025.10.15', rating: 5 },
  { id: '3', name: '바이엘 46번', date: '2025.10.14', rating: 4 },
  { id: '4', name: '바이엘 45번', date: '2025.10.13', rating: 5 },
  { id: '5', name: '바이엘 44번', date: '2025.10.12', rating: 4 },
];

// 이번 주 연습 과제
export const weeklyTasks = [
  {
    id: '1',
    title: '바이엘 48~50쪽 복습',
    description: '매일 10분씩',
    completed: false,
  },
  {
    id: '2',
    title: '리듬 연습: 8분음표 패턴',
    description: '매일',
    completed: true,
  },
  {
    id: '3',
    title: '스케일 C major 5회',
    description: '매일',
    completed: false,
  },
];

// 출석 기록 (김민지 - 월/수 수업)
export const attendanceRecords = [
  // 10월 (월/수)
  { date: '2025-10-01', status: 'present' },  // 수
  { date: '2025-10-06', status: 'present' },  // 월
  { date: '2025-10-08', status: 'present' },  // 수
  { date: '2025-10-13', status: 'absent' },   // 월 - 결석
  { date: '2025-10-15', status: 'present' },  // 수
  { date: '2025-10-17', status: 'makeup' },   // 목 - 보강 예정
  { date: '2025-10-20', status: 'present' },  // 월 (오늘로부터 미래)
  { date: '2025-10-22', status: 'present' },  // 수 (미래)
  // 9월 (월/수)
  { date: '2025-09-01', status: 'present' },  // 월
  { date: '2025-09-03', status: 'present' },  // 수
  { date: '2025-09-08', status: 'present' },  // 월
  { date: '2025-09-10', status: 'late' },     // 수 - 지각
  { date: '2025-09-15', status: 'present' },  // 월
  { date: '2025-09-17', status: 'present' },  // 수
  { date: '2025-09-22', status: 'present' },  // 월
  { date: '2025-09-24', status: 'present' },  // 수
  { date: '2025-09-29', status: 'present' },  // 월
];

// 출석 관련 헬퍼 함수
export const getAttendanceForMonth = (year, month) => {
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;
  return attendanceRecords.filter(record => record.date.startsWith(monthStr));
};

export const getAttendanceStatus = (year, month, day) => {
  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const record = attendanceRecords.find(r => r.date === dateStr);
  return record ? record.status : null;
};

export const getMonthCalendar = (year, month) => {
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();

  return {
    daysInMonth,
    firstDayOfWeek: firstDay === 0 ? 6 : firstDay - 1, // 월요일을 0으로
    days: Array.from({ length: daysInMonth }, (_, i) => i + 1)
  };
};

// 다음 수업 일정
export const upcomingClasses = [
  { date: '10월 21일 (월)', time: '오후 4:00 - 4:50', isPrimary: true },
  { date: '10월 23일 (수)', time: '오후 4:00 - 4:50', isPrimary: false },
];

// 결제 내역
export const paymentHistory = [
  {
    id: '1',
    ticketType: 'count', // 'count' or 'period'
    type: '4회권',
    amount: 150000,
    date: '2025.10.01',
    status: 'active', // 'active', 'completed', 'expired'
    used: 1,
    total: 4,
    method: '카드',
    // 기간권 필드
    startDate: null,
    endDate: null,
    daysTotal: null,
    daysUsed: null,
  },
  {
    id: '2',
    ticketType: 'period',
    type: '기간정액권 (1개월)',
    amount: 320000,
    originalAmount: 400000, // 일할계산 전 원래 금액
    date: '2025.09.10', // 10일에 결제
    status: 'completed',
    used: null,
    total: null,
    method: '카드',
    // 기간권 필드
    startDate: '2025.09.10',
    endDate: '2025.10.09',
    daysTotal: 30,
    daysUsed: 30,
    proratedDays: 20, // 9/10~9/30 = 21일
    proratedAmount: 320000, // 400000 * (21/30) ≈ 280000 + 다음달 10일치
  },
  {
    id: '3',
    ticketType: 'count',
    type: '8회권',
    amount: 280000,
    date: '2025.08.15',
    status: 'completed',
    used: 8,
    total: 8,
    method: '현금',
    startDate: null,
    endDate: null,
    daysTotal: null,
    daysUsed: null,
  },
];

// 수강권 가격표
export const ticketPrices = [
  {
    ticketType: 'count',
    type: '4회권',
    price: 150000,
    pricePerClass: 37500,
    highlighted: true,
    description: '주 1회 수업'
  },
  {
    ticketType: 'count',
    type: '8회권',
    price: 280000,
    pricePerClass: 35000,
    highlighted: false,
    description: '주 2회 수업'
  },
  {
    ticketType: 'period',
    type: '기간정액권 (1개월)',
    price: 400000,
    pricePerClass: null,
    highlighted: false,
    description: '매일 1일~30일',
    period: 30
  },
];

// 갤러리 - 최근 사진/영상
export const galleryItems = [
  {
    id: '1',
    type: 'image',
    emoji: '🏆',
    title: '10월 발표회',
    date: '2025.10.15',
    description: '첫 발표회에서 멋진 연주를 선보였어요!',
    category: 'event',
    imageUrl: null,
  },
  {
    id: '2',
    type: 'video',
    emoji: '🎥',
    title: '바이엘 48번 연습',
    date: '2025.10.14',
    description: '리듬감이 많이 좋아졌어요',
    category: 'practice',
    imageUrl: null,
  },
  {
    id: '3',
    type: 'image',
    emoji: '🎹',
    title: '수업 중',
    date: '2025.10.13',
    description: '열심히 연습하는 모습',
    category: 'lesson',
    imageUrl: null,
  },
  {
    id: '4',
    type: 'image',
    emoji: '📜',
    title: '바이엘 25번 완주',
    date: '2025.09.20',
    description: '첫 완주 달성!',
    category: 'achievement',
    imageUrl: null,
  },
  {
    id: '5',
    type: 'video',
    emoji: '🎵',
    title: '스케일 연습',
    date: '2025.09.15',
    description: 'C major 스케일 완벽하게 연주',
    category: 'practice',
    imageUrl: null,
  },
  {
    id: '6',
    type: 'image',
    emoji: '👏',
    title: '첫 수업',
    date: '2025.08.01',
    description: '피아노 학원 첫 수업 날',
    category: 'lesson',
    imageUrl: null,
  },
  {
    id: '7',
    type: 'image',
    emoji: '🎊',
    title: '생일 축하',
    date: '2025.03.15',
    description: '학원에서 생일 파티',
    category: 'event',
    imageUrl: null,
  },
  {
    id: '8',
    type: 'video',
    emoji: '🎼',
    title: '발표회 리허설',
    date: '2025.10.10',
    description: '발표회 연습 중',
    category: 'event',
    imageUrl: null,
  },
  {
    id: '9',
    type: 'image',
    emoji: '✨',
    title: '손 모양 교정',
    date: '2025.09.01',
    description: '올바른 손 자세 배우기',
    category: 'lesson',
    imageUrl: null,
  },
];

// 성장 타임라인
export const timeline = [
  {
    id: '1',
    type: 'achievement',
    title: '발표회 참여 🎊',
    description: '10월 학원 발표회에서 멋진 연주를 선보였어요!',
    date: '2025.10.15',
    hasMedia: true,
    mediaCount: 3,
  },
  {
    id: '2',
    type: 'milestone',
    title: '첫 완주 달성! 🎉',
    description: '바이엘 25번을 처음으로 완벽하게 연주했어요',
    date: '2025.09.20',
    hasMedia: false,
    mediaCount: 0,
  },
];

// 성취 배지
export const achievements = [
  { id: '1', icon: '🎯', name: '첫 수업', active: true },
  { id: '2', icon: '🔥', name: '10회 출석', active: true },
  { id: '3', icon: '📚', name: '10곡 완주', active: true },
  { id: '4', icon: '🎪', name: '발표회', active: true },
  { id: '5', icon: '💯', name: '완벽한 출석', active: false },
  { id: '6', icon: '🎼', name: '50곡 완주', active: false },
  { id: '7', icon: '👑', name: '100일', active: false },
  { id: '8', icon: '⭐', name: '1년', active: false },
];
