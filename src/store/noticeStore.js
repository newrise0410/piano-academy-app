// src/store/noticeStore.js
import { create } from 'zustand';
import { NoticeRepository } from '../repositories/NoticeRepository';

/**
 * 알림장 데이터 관리 Store
 *
 * 기능:
 * - 알림장 목록 조회 및 관리
 * - 알림장 CRUD (생성, 조회, 수정, 삭제)
 * - 템플릿별 필터링
 * - 읽음 상태 관리
 */
export const useNoticeStore = create((set, get) => ({
  // State
  notices: [],
  selectedNotice: null,
  loading: false,
  error: null,
  lastFetched: null,

  // Actions
  /**
   * 알림장 목록 조회
   * @param {boolean} forceRefresh - 강제 새로고침
   */
  fetchNotices: async (forceRefresh = false) => {
    const state = get();

    // 캐시 확인 (3분)
    const threeMinutesAgo = Date.now() - 3 * 60 * 1000;
    if (!forceRefresh && state.lastFetched && state.lastFetched > threeMinutesAgo) {
      return state.notices;
    }

    set({ loading: true, error: null });
    try {
      const notices = await NoticeRepository.getAll();
      set({
        notices,
        loading: false,
        lastFetched: Date.now()
      });
      return notices;
    } catch (error) {
      set({
        error: error.message || '알림장 목록을 불러오는데 실패했습니다.',
        loading: false
      });
      throw error;
    }
  },

  /**
   * 특정 알림장 조회
   * @param {string} id - 알림장 ID
   */
  fetchNoticeById: async (id) => {
    set({ loading: true, error: null });
    try {
      const notice = await NoticeRepository.getById(id);
      set({
        selectedNotice: notice,
        loading: false
      });
      return notice;
    } catch (error) {
      set({
        error: error.message || '알림장을 불러오는데 실패했습니다.',
        loading: false
      });
      throw error;
    }
  },

  /**
   * 특정 학생의 알림장 조회
   * @param {string} studentId - 학생 ID
   */
  fetchNoticesByStudent: async (studentId) => {
    set({ loading: true, error: null });
    try {
      const notices = await NoticeRepository.getByStudentId(studentId);
      return notices;
    } catch (error) {
      set({
        error: error.message || '알림장 목록을 불러오는데 실패했습니다.',
        loading: false
      });
      throw error;
    }
  },

  /**
   * 알림장 선택 (로컬 state만 업데이트)
   * @param {string} id - 알림장 ID
   */
  selectNotice: (id) => {
    const notice = get().notices.find(n => n.id === id);
    set({ selectedNotice: notice });
  },

  /**
   * 알림장 선택 해제
   */
  clearSelectedNotice: () => {
    set({ selectedNotice: null });
  },

  /**
   * 알림장 생성
   * @param {Object} noticeData - 알림장 데이터
   */
  createNotice: async (noticeData) => {
    set({ loading: true, error: null });
    try {
      const newNotice = await NoticeRepository.create(noticeData);
      set((state) => ({
        notices: [newNotice, ...state.notices], // 최신 알림장이 위로
        loading: false,
        lastFetched: Date.now()
      }));
      return newNotice;
    } catch (error) {
      set({
        error: error.message || '알림장 생성에 실패했습니다.',
        loading: false
      });
      throw error;
    }
  },

  /**
   * 알림장 수정
   * @param {string} id - 알림장 ID
   * @param {Object} updates - 수정할 데이터
   */
  updateNotice: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const updatedNotice = await NoticeRepository.update(id, updates);
      set((state) => ({
        notices: state.notices.map(n => n.id === id ? updatedNotice : n),
        selectedNotice: state.selectedNotice?.id === id ? updatedNotice : state.selectedNotice,
        loading: false,
        lastFetched: Date.now()
      }));
      return updatedNotice;
    } catch (error) {
      set({
        error: error.message || '알림장 수정에 실패했습니다.',
        loading: false
      });
      throw error;
    }
  },

  /**
   * 알림장 삭제
   * @param {string} id - 알림장 ID
   */
  deleteNotice: async (id) => {
    set({ loading: true, error: null });
    try {
      await NoticeRepository.delete(id);
      set((state) => ({
        notices: state.notices.filter(n => n.id !== id),
        selectedNotice: state.selectedNotice?.id === id ? null : state.selectedNotice,
        loading: false,
        lastFetched: Date.now()
      }));
    } catch (error) {
      set({
        error: error.message || '알림장 삭제에 실패했습니다.',
        loading: false
      });
      throw error;
    }
  },

  /**
   * 알림장 읽음 상태 변경
   * @param {string} id - 알림장 ID
   * @param {boolean} isRead - 읽음 여부
   */
  markAsRead: async (id, isRead = true) => {
    try {
      const updatedNotice = await NoticeRepository.update(id, { isRead });
      set((state) => ({
        notices: state.notices.map(n => n.id === id ? updatedNotice : n),
        selectedNotice: state.selectedNotice?.id === id ? updatedNotice : state.selectedNotice
      }));
      return updatedNotice;
    } catch (error) {
      console.error('읽음 상태 변경 오류:', error);
      throw error;
    }
  },

  /**
   * 템플릿별 알림장 필터
   * @param {string} template - 템플릿 타입 ('concert', 'closure', 'tuition', 'custom')
   * @returns {Array} 필터된 알림장 목록
   */
  filterByTemplate: (template) => {
    const notices = get().notices;
    if (!template) return notices;
    return notices.filter(n => n.template === template);
  },

  /**
   * 날짜별 알림장 필터
   * @param {string} startDate - 시작일 (YYYY-MM-DD)
   * @param {string} endDate - 종료일 (YYYY-MM-DD)
   * @returns {Array} 필터된 알림장 목록
   */
  filterByDateRange: (startDate, endDate) => {
    const notices = get().notices;
    const start = new Date(startDate);
    const end = new Date(endDate);

    return notices.filter(n => {
      const noticeDate = new Date(n.date);
      return noticeDate >= start && noticeDate <= end;
    });
  },

  /**
   * 읽지 않은 알림장 조회
   * @returns {Array} 읽지 않은 알림장 목록
   */
  getUnreadNotices: () => {
    return get().notices.filter(n => !n.isRead);
  },

  /**
   * 읽지 않은 알림장 개수
   * @returns {number}
   */
  getUnreadCount: () => {
    return get().notices.filter(n => !n.isRead).length;
  },

  /**
   * 알림장 검색
   * @param {string} query - 검색어
   * @returns {Array} 검색 결과
   */
  searchNotices: (query) => {
    const notices = get().notices;
    if (!query || query.trim() === '') {
      return notices;
    }

    const lowerQuery = query.toLowerCase().trim();
    return notices.filter(notice =>
      notice.title?.toLowerCase().includes(lowerQuery) ||
      notice.content?.toLowerCase().includes(lowerQuery) ||
      notice.studentName?.toLowerCase().includes(lowerQuery)
    );
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
    set({
      notices: [],
      selectedNotice: null,
      loading: false,
      error: null,
      lastFetched: null
    });
  },
}));
