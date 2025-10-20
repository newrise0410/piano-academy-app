// src/store/authStore.js
import { create } from 'zustand';

/**
 * 인증 상태 관리 Store
 *
 * 기능:
 * - 로그인/로그아웃
 * - 사용자 정보 관리
 * - 역할 전환 (개발/테스트용)
 */
export const useAuthStore = create((set, get) => ({
  // State
  user: null, // { id, email, name, role: 'teacher' | 'parent' }
  isAuthenticated: false,
  loading: false,
  error: null,

  // Actions
  /**
   * 로그인
   * @param {Object} userData - 사용자 정보 { id, email, name, role }
   */
  login: (userData) => {
    set({
      user: userData,
      isAuthenticated: true,
      error: null
    });
  },

  /**
   * 로그아웃
   */
  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
      error: null
    });
  },

  /**
   * 역할 전환 (개발/테스트용)
   * @param {string} role - 'teacher' | 'parent'
   */
  switchRole: (role) => {
    const currentUser = get().user;
    if (currentUser) {
      set({
        user: { ...currentUser, role }
      });
    }
  },

  /**
   * 사용자 정보 업데이트
   * @param {Object} updates - 업데이트할 필드들
   */
  updateUser: (updates) => {
    const currentUser = get().user;
    if (currentUser) {
      set({
        user: { ...currentUser, ...updates }
      });
    }
  },

  /**
   * 에러 설정
   * @param {string} error - 에러 메시지
   */
  setError: (error) => {
    set({ error });
  },

  /**
   * 에러 초기화
   */
  clearError: () => {
    set({ error: null });
  },

  /**
   * 로딩 상태 설정
   * @param {boolean} loading - 로딩 여부
   */
  setLoading: (loading) => {
    set({ loading });
  },

  /**
   * 현재 사용자가 선생님인지 확인
   * @returns {boolean}
   */
  isTeacher: () => {
    return get().user?.role === 'teacher';
  },

  /**
   * 현재 사용자가 학부모인지 확인
   * @returns {boolean}
   */
  isParent: () => {
    return get().user?.role === 'parent';
  },
}));
