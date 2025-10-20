import { create } from 'zustand';

/**
 * Notification Store
 * 알림 데이터 관리
 */
const useNotificationStore = create((set) => ({
  notifications: [
    {
      id: '1',
      type: 'payment', // 'payment', 'notice', 'makeup', 'attendance'
      title: '수강료 납부 완료',
      message: '김민지 학생의 수강료가 입금되었습니다.',
      timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10분 전
      isRead: false,
      targetId: '1', // 관련 학생 ID 등
    },
    {
      id: '2',
      type: 'notice',
      title: '새로운 알림장',
      message: '원장님이 새 알림장을 보냈습니다.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2시간 전
      isRead: false,
    },
    {
      id: '3',
      type: 'makeup',
      title: '보강 일정 확정',
      message: '이영희 학생의 보강 일정이 확정되었습니다.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5시간 전
      isRead: true,
    },
    {
      id: '4',
      type: 'attendance',
      title: '출석 체크 알림',
      message: '오늘 수업 출석 체크를 완료해주세요.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1일 전
      isRead: true,
    },
  ],

  // 읽지 않은 알림 수
  getUnreadCount: () => {
    const state = useNotificationStore.getState();
    return state.notifications.filter(n => !n.isRead).length;
  },

  // 알림 읽음 처리
  markAsRead: (notificationId) => {
    set((state) => ({
      notifications: state.notifications.map(notif =>
        notif.id === notificationId
          ? { ...notif, isRead: true }
          : notif
      ),
    }));
  },

  // 모든 알림 읽음 처리
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map(notif => ({
        ...notif,
        isRead: true,
      })),
    }));
  },

  // 알림 추가
  addNotification: (notification) => {
    set((state) => ({
      notifications: [
        {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          isRead: false,
          ...notification,
        },
        ...state.notifications,
      ],
    }));
  },

  // 알림 삭제
  deleteNotification: (notificationId) => {
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== notificationId),
    }));
  },

  // 모든 알림 삭제
  clearAll: () => {
    set({ notifications: [] });
  },
}));

export default useNotificationStore;
