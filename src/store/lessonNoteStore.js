// src/store/lessonNoteStore.js
import { create } from 'zustand';
import { LessonNoteRepository } from '../repositories/LessonNoteRepository';

/**
 * 수업 일지 데이터 관리 Store
 *
 * 기능:
 * - 수업 일지 CRUD
 * - 학생별 필터링
 * - 날짜별 필터링
 */
export const useLessonNoteStore = create((set, get) => ({
  // State
  lessonNotes: [], // 전체 수업 일지 목록
  studentNotes: {}, // 학생별 수업 일지 { studentId: [notes] }
  loading: false,
  error: null,
  lastFetched: null,

  // Actions
  /**
   * 수업 일지 목록 조회
   * @param {Object} options - { studentId, startDate, endDate, limit }
   * @param {boolean} forceRefresh - 강제 새로고침
   */
  fetchLessonNotes: async (options = {}, forceRefresh = false) => {
    const state = get();

    // 캐시 확인 (3분)
    const threeMinutesAgo = Date.now() - 3 * 60 * 1000;
    if (!forceRefresh && state.lastFetched && state.lastFetched > threeMinutesAgo) {
      return state.lessonNotes;
    }

    set({ loading: true, error: null });
    try {
      const notes = await LessonNoteRepository.getAll(options);
      set({
        lessonNotes: notes,
        loading: false,
        lastFetched: Date.now(),
      });
      return notes;
    } catch (error) {
      set({
        error: error.message || '수업 일지를 불러오는데 실패했습니다.',
        loading: false,
      });
      throw error;
    }
  },

  /**
   * 특정 학생의 수업 일지 조회
   * @param {string} studentId - 학생 ID
   * @param {Object} options - 쿼리 옵션
   */
  fetchStudentNotes: async (studentId, options = {}) => {
    set({ loading: true, error: null });
    try {
      const notes = await LessonNoteRepository.getByStudentId(studentId, options);
      set((state) => ({
        studentNotes: {
          ...state.studentNotes,
          [studentId]: notes,
        },
        loading: false,
      }));
      return notes;
    } catch (error) {
      set({
        error: error.message || '수업 일지를 불러오는데 실패했습니다.',
        loading: false,
      });
      throw error;
    }
  },

  /**
   * 수업 일지 추가
   * @param {Object} lessonNoteData - { studentId, studentName, date, progress, homework, memo, ... }
   */
  addLessonNote: async (lessonNoteData) => {
    set({ loading: true, error: null });
    try {
      const newNote = await LessonNoteRepository.create(lessonNoteData);
      set((state) => {
        const studentId = lessonNoteData.studentId;
        const existingNotes = state.studentNotes[studentId] || [];

        return {
          lessonNotes: [newNote, ...state.lessonNotes],
          studentNotes: {
            ...state.studentNotes,
            [studentId]: [newNote, ...existingNotes],
          },
          loading: false,
        };
      });
      return newNote;
    } catch (error) {
      set({
        error: error.message || '수업 일지 추가에 실패했습니다.',
        loading: false,
      });
      throw error;
    }
  },

  /**
   * 수업 일지 수정
   * @param {string} noteId - 수업 일지 ID
   * @param {Object} updates - 수정할 데이터
   */
  updateLessonNote: async (noteId, updates) => {
    set({ loading: true, error: null });
    try {
      const updatedNote = await LessonNoteRepository.update(noteId, updates);
      set((state) => ({
        lessonNotes: state.lessonNotes.map(note =>
          note.id === noteId ? { ...note, ...updatedNote } : note
        ),
        loading: false,
      }));

      // 학생별 노트도 업데이트
      const note = get().lessonNotes.find(n => n.id === noteId);
      if (note && get().studentNotes[note.studentId]) {
        set((state) => ({
          studentNotes: {
            ...state.studentNotes,
            [note.studentId]: state.studentNotes[note.studentId].map(n =>
              n.id === noteId ? { ...n, ...updatedNote } : n
            ),
          },
        }));
      }

      return updatedNote;
    } catch (error) {
      set({
        error: error.message || '수업 일지 수정에 실패했습니다.',
        loading: false,
      });
      throw error;
    }
  },

  /**
   * 수업 일지 삭제
   * @param {string} noteId - 수업 일지 ID
   */
  deleteLessonNote: async (noteId) => {
    set({ loading: true, error: null });
    try {
      await LessonNoteRepository.delete(noteId);

      set((state) => {
        // lessonNotes 배열에서 삭제
        const updatedLessonNotes = state.lessonNotes.filter(n => n.id !== noteId);

        // studentNotes 객체의 모든 학생 데이터에서 해당 noteId 삭제
        const updatedStudentNotes = {};
        Object.keys(state.studentNotes).forEach(studentId => {
          updatedStudentNotes[studentId] = state.studentNotes[studentId].filter(n => n.id !== noteId);
        });

        return {
          lessonNotes: updatedLessonNotes,
          studentNotes: updatedStudentNotes,
          loading: false,
        };
      });
    } catch (error) {
      set({
        error: error.message || '수업 일지 삭제에 실패했습니다.',
        loading: false,
      });
      throw error;
    }
  },

  /**
   * 특정 학생의 수업 일지 조회 (Store에서)
   * @param {string} studentId - 학생 ID
   * @returns {Array} 수업 일지 목록
   */
  getStudentNotes: (studentId) => {
    return get().studentNotes[studentId] || [];
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
      lessonNotes: [],
      studentNotes: {},
      loading: false,
      error: null,
      lastFetched: null,
    });
  },
}));

export default useLessonNoteStore;
