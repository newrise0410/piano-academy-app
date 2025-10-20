// src/store/authStore.js
import { create } from 'zustand';
import { logout as firebaseLogout, onAuthStateChange } from '../services/authService';
import { isFirebaseMode } from '../config/dataConfig';

/**
 * 인증 상태 관리 Store
 *
 * 기능:
 * - 로그인/로그아웃
 * - 사용자 정보 관리
 * - 역할 전환 (개발/테스트용)
 * - Firebase Authentication 연동
 */
export const useAuthStore = create((set, get) => ({
  // State
  user: null, // { uid, email, name, role: 'teacher' | 'parent' }
  isAuthenticated: false,
  loading: true, // 초기 로딩 상태
  error: null,
  authInitialized: false, // Firebase 인증 초기화 여부

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
  logout: async () => {
    if (isFirebaseMode()) {
      await firebaseLogout();
    }
    set({
      user: null,
      isAuthenticated: false,
      error: null
    });
  },

  /**
   * Firebase 인증 상태 초기화
   * 앱 시작 시 호출하여 자동 로그인 처리
   */
  initializeAuth: () => {
    if (!isFirebaseMode()) {
      set({ loading: false, authInitialized: true });
      return;
    }

    // Firebase 인증 상태 리스너 설정
    const unsubscribe = onAuthStateChange((user) => {
      if (user) {
        set({
          user: {
            uid: user.uid,
            email: user.email,
            name: user.displayName || user.name,
            role: user.role || 'teacher',
            ...user,
          },
          isAuthenticated: true,
          loading: false,
          authInitialized: true,
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          loading: false,
          authInitialized: true,
        });
      }
    });

    return unsubscribe;
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
