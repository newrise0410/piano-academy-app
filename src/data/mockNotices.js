// src/data/mockNotices.js
// 알림장 데이터 (실제로는 AsyncStorage나 서버에 저장)

let notices = [
  {
    id: '1',
    title: '12월 발표회 안내',
    content: '안녕하세요, 학부모님 😊\n\n12월 25일(수) 오후 2시, 학원 연주홀에서 정기 발표회를 개최합니다.\n\n그동안 열심히 연습한 곡들을 보여드릴 수 있는 소중한 시간이니 많은 참석 부탁드립니다.',
    date: '2025.10.15',
    time: '14:30',
    confirmed: 28,
    total: 30,
    createdAt: new Date('2025-10-15T14:30:00'),
  },
  {
    id: '2',
    title: '10월 셋째 주 휴강 안내',
    content: '안녕하세요, 학부모님 😊\n\n10월 18일(금)은 원장님 개인 사정으로 휴강하게 되었습니다.\n\n보강 일정은 추후 개별적으로 안내드리겠습니다. 양해 부탁드립니다.',
    date: '2025.10.10',
    time: '09:15',
    confirmed: 30,
    total: 30,
    createdAt: new Date('2025-10-10T09:15:00'),
  },
  {
    id: '3',
    title: '수강료 납부 안내',
    content: '안녕하세요, 학부모님 😊\n\n10월 수강료 납부 안내드립니다.\n\n납부 기한: 10월 5일(목)까지\n입금 계좌: 국민은행 123-456-789012\n\n기한 내 납부 부탁드립니다.',
    date: '2025.10.01',
    time: '10:00',
    confirmed: 30,
    total: 30,
    createdAt: new Date('2025-10-01T10:00:00'),
  },
];

// 알림장 목록 가져오기
export const getNotices = () => {
  return [...notices].sort((a, b) => b.createdAt - a.createdAt);
};

// 알림장 추가
export const addNotice = (notice) => {
  const newNotice = {
    id: Date.now().toString(),
    ...notice,
    confirmed: 0,
    total: 30, // 전체 학생 수 (mockStudents.length로 대체 가능)
    createdAt: new Date(),
  };

  notices = [newNotice, ...notices];
  return newNotice;
};

// 알림장 삭제
export const deleteNotice = (id) => {
  notices = notices.filter(notice => notice.id !== id);
  return true;
};

// 알림장 수정
export const updateNotice = (id, updates) => {
  notices = notices.map(notice =>
    notice.id === id ? { ...notice, ...updates } : notice
  );
  return notices.find(notice => notice.id === id);
};

// 특정 알림장 가져오기
export const getNoticeById = (id) => {
  return notices.find(notice => notice.id === id);
};

export default {
  getNotices,
  addNotice,
  deleteNotice,
  updateNotice,
  getNoticeById,
};
