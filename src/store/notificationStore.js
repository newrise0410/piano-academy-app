import { create } from 'zustand';
import {
  getNotifications,
  addNotification as addFirebaseNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification as deleteFirebaseNotification,
  subscribeToNotifications,
} from '../services/firestoreService';
import { isFirebaseMode } from '../config/dataConfig';

/**
 * Notification Store
 * 알림 데이터 관리 (Firebase 연동)
 *
 * 기능:
 * - Firebase notifications 컬렉션과 연동
 * - 실시간 알림 구독
 * - 알림 CRUD 작업
 * - 읽음/안읽음 상태 관리
 */
const useNotificationStore = create((set, get) => ({
  // State
  notifications: [],
  loading: false,
  error: null,
  unsubscribe: null, // Real-time listener cleanup function

  /**
   * 알림 목록 가져오기
   * @param {string} teacherId - 선생님 ID
   * @param {Object} options - { isRead, limit }
   */
  fetchNotifications: async (teacherId, options = {}) => {
    if (!isFirebaseMode()) {
      console.warn('Firebase mode not enabled');
      return;
    }

    set({ loading: true, error: null });
    try {
      const result = await getNotifications(teacherId, options);
      if (result.success) {
        set({ notifications: result.data, loading: false });
      } else {
        set({ error: result.error, loading: false });
        console.error('Fetch notifications error:', result.error);
      }
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error('Fetch notifications error:', error);
    }
  },

  /**
   * 알림 실시간 구독 시작
   * @param {string} teacherId - 선생님 ID
   */
  subscribeNotifications: (teacherId) => {
    if (!isFirebaseMode()) {
      console.warn('Firebase mode not enabled');
      return;
    }

    // 기존 구독 해제
    const currentUnsubscribe = get().unsubscribe;
    if (currentUnsubscribe) {
      currentUnsubscribe();
    }

    // 새 구독 시작
    const unsubscribe = subscribeToNotifications(teacherId, (notifications) => {
      set({ notifications, loading: false });
    });

    set({ unsubscribe });
  },

  /**
   * 알림 구독 해제
   */
  unsubscribeNotifications: () => {
    const currentUnsubscribe = get().unsubscribe;
    if (currentUnsubscribe) {
      currentUnsubscribe();
      set({ unsubscribe: null });
    }
  },

  /**
   * 읽지 않은 알림 수
   */
  getUnreadCount: () => {
    const state = get();
    return state.notifications.filter(n => !n.isRead).length;
  },

  /**
   * 알림 읽음 처리
   * @param {string} notificationId - 알림 ID
   */
  markAsRead: async (notificationId) => {
    if (!isFirebaseMode()) {
      // Mock mode: local state only
      set((state) => ({
        notifications: state.notifications.map(notif =>
          notif.id === notificationId
            ? { ...notif, isRead: true }
            : notif
        ),
      }));
      return;
    }

    // Firebase mode
    try {
      const result = await markNotificationAsRead(notificationId);
      if (result.success) {
        // Update local state immediately for better UX
        set((state) => ({
          notifications: state.notifications.map(notif =>
            notif.id === notificationId
              ? { ...notif, isRead: true, readAt: new Date().toISOString() }
              : notif
          ),
        }));
      } else {
        console.error('Mark as read error:', result.error);
        set({ error: result.error });
      }
    } catch (error) {
      console.error('Mark as read error:', error);
      set({ error: error.message });
    }
  },

  /**
   * 모든 알림 읽음 처리
   * @param {string} teacherId - 선생님 ID
   */
  markAllAsRead: async (teacherId) => {
    if (!isFirebaseMode()) {
      // Mock mode: local state only
      set((state) => ({
        notifications: state.notifications.map(notif => ({
          ...notif,
          isRead: true,
        })),
      }));
      return;
    }

    // Firebase mode
    try {
      const result = await markAllNotificationsAsRead(teacherId);
      if (result.success) {
        // Update local state immediately for better UX
        set((state) => ({
          notifications: state.notifications.map(notif => ({
            ...notif,
            isRead: true,
            readAt: new Date().toISOString(),
          })),
        }));
      } else {
        console.error('Mark all as read error:', result.error);
        set({ error: result.error });
      }
    } catch (error) {
      console.error('Mark all as read error:', error);
      set({ error: error.message });
    }
  },

  /**
   * 알림 추가
   * @param {Object} notification - { type, title, message, targetId }
   * @param {string} teacherId - 선생님 ID
   */
  addNotification: async (notification, teacherId) => {
    if (!isFirebaseMode()) {
      // Mock mode: local state only
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
      return;
    }

    // Firebase mode
    try {
      const result = await addFirebaseNotification(notification, teacherId);
      if (result.success) {
        // Real-time listener will update the state automatically
        console.log('Notification added successfully:', result.id);
      } else {
        console.error('Add notification error:', result.error);
        set({ error: result.error });
      }
    } catch (error) {
      console.error('Add notification error:', error);
      set({ error: error.message });
    }
  },

  /**
   * 알림 삭제
   * @param {string} notificationId - 알림 ID
   */
  deleteNotification: async (notificationId) => {
    if (!isFirebaseMode()) {
      // Mock mode: local state only
      set((state) => ({
        notifications: state.notifications.filter(n => n.id !== notificationId),
      }));
      return;
    }

    // Firebase mode
    try {
      const result = await deleteFirebaseNotification(notificationId);
      if (result.success) {
        // Update local state immediately for better UX
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== notificationId),
        }));
      } else {
        console.error('Delete notification error:', result.error);
        set({ error: result.error });
      }
    } catch (error) {
      console.error('Delete notification error:', error);
      set({ error: error.message });
    }
  },

  /**
   * 모든 알림 삭제 (로컬 상태만)
   */
  clearAll: () => {
    set({ notifications: [] });
  },

  /**
   * 에러 초기화
   */
  clearError: () => {
    set({ error: null });
  },

  /**
   * 전체 상태 초기화
   */
  reset: () => {
    const currentUnsubscribe = get().unsubscribe;
    if (currentUnsubscribe) {
      currentUnsubscribe();
    }
    set({
      notifications: [],
      loading: false,
      error: null,
      unsubscribe: null,
    });
  },
}));

export default useNotificationStore;
