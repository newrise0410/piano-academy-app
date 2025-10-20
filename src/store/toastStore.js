// src/store/toastStore.js
import { create } from 'zustand';

/**
 * Toast 알림 상태 관리 Store
 *
 * 사용법:
 * import { useToastStore } from '../../store';
 *
 * const toast = useToastStore();
 * toast.success('성공 메시지');
 * toast.error('에러 메시지');
 * toast.warning('경고 메시지');
 * toast.info('정보 메시지');
 */
export const useToastStore = create((set, get) => ({
  // State
  toasts: [], // 현재 표시 중인 Toast 목록 [{ id, message, type, duration }]
  maxToasts: 3, // 동시에 표시할 수 있는 최대 Toast 수

  // Actions
  /**
   * Toast 추가 (내부 함수)
   * @param {string} message - 메시지
   * @param {string} type - 'success' | 'error' | 'warning' | 'info'
   * @param {number} duration - 표시 시간 (ms)
   */
  _addToast: (message, type = 'info', duration = 3000) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);

    const newToast = {
      id,
      message,
      type,
      duration,
      createdAt: Date.now()
    };

    set((state) => {
      // 최대 개수 초과 시 가장 오래된 Toast 제거
      let toasts = [...state.toasts];
      if (toasts.length >= state.maxToasts) {
        toasts = toasts.slice(-(state.maxToasts - 1));
      }

      return {
        toasts: [...toasts, newToast]
      };
    });

    // 자동으로 제거
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }

    return id;
  },

  /**
   * 성공 Toast 표시
   * @param {string} message - 메시지
   * @param {number} duration - 표시 시간 (기본 3초)
   */
  success: (message, duration = 3000) => {
    return get()._addToast(message, 'success', duration);
  },

  /**
   * 에러 Toast 표시
   * @param {string} message - 메시지
   * @param {number} duration - 표시 시간 (기본 4초, 에러는 좀 더 길게)
   */
  error: (message, duration = 4000) => {
    return get()._addToast(message, 'error', duration);
  },

  /**
   * 경고 Toast 표시
   * @param {string} message - 메시지
   * @param {number} duration - 표시 시간 (기본 3초)
   */
  warning: (message, duration = 3000) => {
    return get()._addToast(message, 'warning', duration);
  },

  /**
   * 정보 Toast 표시
   * @param {string} message - 메시지
   * @param {number} duration - 표시 시간 (기본 3초)
   */
  info: (message, duration = 3000) => {
    return get()._addToast(message, 'info', duration);
  },

  /**
   * 특정 Toast 제거
   * @param {string} id - Toast ID
   */
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter(toast => toast.id !== id)
    }));
  },

  /**
   * 모든 Toast 제거
   */
  clearAll: () => {
    set({ toasts: [] });
  },

  /**
   * 최대 Toast 개수 설정
   * @param {number} max - 최대 개수
   */
  setMaxToasts: (max) => {
    set({ maxToasts: max });
  }
}));

// 편의 함수 - Store 외부에서 직접 사용 가능
export const toast = {
  success: (message, duration) => useToastStore.getState().success(message, duration),
  error: (message, duration) => useToastStore.getState().error(message, duration),
  warning: (message, duration) => useToastStore.getState().warning(message, duration),
  info: (message, duration) => useToastStore.getState().info(message, duration),
};
