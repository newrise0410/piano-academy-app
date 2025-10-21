// src/store/studentStore.js
import { create } from 'zustand';
import { StudentRepository } from '../repositories/StudentRepository';
import { useNotificationStore } from './notificationStore';
import { useAuthStore } from './authStore';

/**
 * 학생 데이터 관리 Store
 *
 * 기능:
 * - 학생 목록 조회 및 캐싱
 * - 학생 CRUD (생성, 조회, 수정, 삭제)
 * - 학생 검색 및 필터링
 * - 로딩/에러 상태 관리
 */
export const useStudentStore = create((set, get) => ({
  // State
  students: [],
  selectedStudent: null,
  loading: false,
  error: null,
  lastFetched: null, // 마지막 fetch 시간 (캐싱용)

  // Actions
  /**
   * 학생 목록 조회
   * @param {boolean} forceRefresh - 강제 새로고침 (캐시 무시)
   */
  fetchStudents: async (forceRefresh = false) => {
    const state = get();

    // 캐시 확인 (5분 이내면 재사용)
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    if (!forceRefresh && state.lastFetched && state.lastFetched > fiveMinutesAgo) {
      console.log('Using cached students data');
      return state.students;
    }

    set({ loading: true, error: null });
    try {
      const students = await StudentRepository.getAll();
      set({
        students,
        loading: false,
        lastFetched: Date.now()
      });
      return students;
    } catch (error) {
      set({
        error: error.message || '학생 목록을 불러오는데 실패했습니다.',
        loading: false
      });
      console.error('학생 목록 조회 오류:', error);
      throw error;
    }
  },

  /**
   * 특정 학생 조회
   * @param {string} id - 학생 ID
   */
  fetchStudentById: async (id) => {
    set({ loading: true, error: null });
    try {
      const student = await StudentRepository.getById(id);
      set({
        selectedStudent: student,
        loading: false
      });
      return student;
    } catch (error) {
      set({
        error: error.message || '학생 정보를 불러오는데 실패했습니다.',
        loading: false
      });
      console.error('학생 조회 오류:', error);
      throw error;
    }
  },

  /**
   * 학생 선택 (로컬 state만 업데이트)
   * @param {string} id - 학생 ID
   */
  selectStudent: (id) => {
    const student = get().students.find(s => s.id === id);
    set({ selectedStudent: student });
  },

  /**
   * 학생 선택 해제
   */
  clearSelectedStudent: () => {
    set({ selectedStudent: null });
  },

  /**
   * 학생 추가
   * @param {Object} studentData - 학생 데이터
   */
  addStudent: async (studentData) => {
    set({ loading: true, error: null });
    try {
      const newStudent = await StudentRepository.create(studentData);
      set((state) => ({
        students: [...state.students, newStudent],
        loading: false,
        lastFetched: Date.now() // 캐시 갱신
      }));

      // 알림 추가 (새 학생 등록)
      try {
        const user = useAuthStore.getState().user;
        if (user?.uid) {
          const { addNotification } = useNotificationStore.getState();
          await addNotification(
            {
              type: 'student_added',
              title: '새 학생 등록',
              message: `${studentData.name} 학생이 등록되었습니다`,
              targetId: newStudent.id,
            },
            user.uid
          );
        }
      } catch (notificationError) {
        console.error('알림 추가 실패:', notificationError);
        // 알림 추가 실패는 무시하고 계속 진행
      }

      return newStudent;
    } catch (error) {
      set({
        error: error.message || '학생 추가에 실패했습니다.',
        loading: false
      });
      console.error('학생 추가 오류:', error);
      throw error;
    }
  },

  /**
   * 학생 정보 수정
   * @param {string} id - 학생 ID
   * @param {Object} studentData - 수정할 데이터
   */
  updateStudent: async (id, studentData) => {
    set({ loading: true, error: null });
    try {
      const updatedStudent = await StudentRepository.update(id, studentData);
      set((state) => ({
        students: state.students.map(s => s.id === id ? updatedStudent : s),
        selectedStudent: state.selectedStudent?.id === id ? updatedStudent : state.selectedStudent,
        loading: false,
        lastFetched: Date.now()
      }));
      return updatedStudent;
    } catch (error) {
      set({
        error: error.message || '학생 정보 수정에 실패했습니다.',
        loading: false
      });
      console.error('학생 수정 오류:', error);
      throw error;
    }
  },

  /**
   * 학생 삭제
   * @param {string} id - 학생 ID
   */
  deleteStudent: async (id) => {
    set({ loading: true, error: null });
    try {
      await StudentRepository.delete(id);
      set((state) => ({
        students: state.students.filter(s => s.id !== id),
        selectedStudent: state.selectedStudent?.id === id ? null : state.selectedStudent,
        loading: false,
        lastFetched: Date.now()
      }));
    } catch (error) {
      set({
        error: error.message || '학생 삭제에 실패했습니다.',
        loading: false
      });
      console.error('학생 삭제 오류:', error);
      throw error;
    }
  },

  /**
   * 학생 검색
   * @param {string} query - 검색어
   * @returns {Array} 검색 결과
   */
  searchStudents: (query) => {
    const students = get().students;
    if (!query || query.trim() === '') {
      return students;
    }

    const lowerQuery = query.toLowerCase().trim();
    return students.filter(student =>
      student.name.toLowerCase().includes(lowerQuery) ||
      student.category?.toLowerCase().includes(lowerQuery) ||
      student.level?.toLowerCase().includes(lowerQuery) ||
      student.book?.toLowerCase().includes(lowerQuery)
    );
  },

  /**
   * 카테고리별 학생 필터
   * @param {string} category - 카테고리 ('초등', '중등', '고등', '성인')
   * @returns {Array} 필터된 학생 목록
   */
  filterByCategory: (category) => {
    const students = get().students;
    if (!category) return students;
    return students.filter(s => s.category === category);
  },

  /**
   * 레벨별 학생 필터
   * @param {string} level - 레벨 ('초급', '중급', '고급')
   * @returns {Array} 필터된 학생 목록
   */
  filterByLevel: (level) => {
    const students = get().students;
    if (!level) return students;
    return students.filter(s => s.level === level);
  },

  /**
   * 미납 학생 조회
   * @returns {Array} 미납 학생 목록
   */
  getUnpaidStudents: () => {
    return get().students.filter(s => s.unpaid === true);
  },

  /**
   * 수강권 1회 남은 학생 조회
   * @returns {Array} 1회 남은 학생 목록
   */
  getLowTicketStudents: () => {
    return get().students.filter(s =>
      s.ticketType === 'count' && s.ticketCount <= 1
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
      students: [],
      selectedStudent: null,
      loading: false,
      error: null,
      lastFetched: null
    });
  },
}));
