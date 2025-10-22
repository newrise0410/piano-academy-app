// src/repositories/LessonNoteRepository.js
// 수업 일지 데이터 관리 Repository

import { isMockMode, isFirebaseMode, DEV_CONFIG } from '../config/dataConfig';
import { apiClient } from '../services/api/client';
import { ENDPOINTS } from '../services/api/endpoints';
import {
  getLessonNotes,
  getLessonNotesByStudent,
  saveLessonNote,
  updateLessonNote,
  deleteLessonNote,
} from '../services/firestoreService';
import { getCurrentUser } from '../services/authService';

/**
 * 네트워크 딜레이 시뮬레이션 (Mock 모드에서만)
 */
const simulateNetworkDelay = () => {
  if (isMockMode() && DEV_CONFIG.mockNetworkDelay > 0) {
    return new Promise((resolve) =>
      setTimeout(resolve, DEV_CONFIG.mockNetworkDelay)
    );
  }
  return Promise.resolve();
};

/**
 * Repository 호출 로그
 */
const log = (method, ...args) => {
  if (DEV_CONFIG.logRepositoryCalls) {
    console.log(`[LessonNoteRepository.${method}]`, ...args);
  }
};

/**
 * Mock 수업 일지 데이터 (임시)
 */
let mockLessonNotes = [
  {
    id: '1',
    studentId: '1',
    studentName: '김지우',
    teacherId: 'teacher1',
    date: '2025-01-22',
    progress: '체르니 30-1, 바이엘 60번',
    homework: '체르니 30-1 3회 반복 연습',
    memo: '리듬감이 좋아졌어요',
    strengths: '박자 정확도 향상',
    improvements: '손목 긴장 풀기',
    practicePoints: '느린 템포로 연습',
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

/**
 * 수업 일지 Repository
 */
export const LessonNoteRepository = {
  /**
   * 수업 일지 목록 조회
   * @param {Object} options - { studentId, startDate, endDate, limit }
   * @returns {Promise<Array>} 수업 일지 목록
   */
  async getAll(options = {}) {
    log('getAll', options);

    if (isMockMode()) {
      await simulateNetworkDelay();
      let filtered = [...mockLessonNotes];

      // studentId 필터링
      if (options.studentId) {
        filtered = filtered.filter(note => note.studentId === options.studentId);
      }

      // 날짜 범위 필터링
      if (options.startDate && options.endDate) {
        filtered = filtered.filter(
          note => note.date >= options.startDate && note.date <= options.endDate
        );
      }

      // limit 적용
      if (options.limit) {
        filtered = filtered.slice(0, options.limit);
      }

      return filtered;
    }

    if (isFirebaseMode()) {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        throw new Error('로그인이 필요합니다');
      }

      const result = await getLessonNotes(currentUser.uid, options);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    }

    try {
      const response = await apiClient.get(ENDPOINTS.LESSON_NOTES?.LIST || '/lesson-notes', {
        params: options
      });
      return response.data;
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[LessonNoteRepository.getAll] API Error:', error);
      }
      throw error;
    }
  },

  /**
   * 학생별 수업 일지 조회 (학부모용)
   * @param {string} studentId - 학생 ID
   * @param {Object} options - 쿼리 옵션
   * @returns {Promise<Array>} 수업 일지 목록
   */
  async getByStudentId(studentId, options = {}) {
    log('getByStudentId', studentId, options);

    if (isMockMode()) {
      await simulateNetworkDelay();
      let filtered = mockLessonNotes.filter(
        note => note.studentId === studentId && note.isPublic
      );

      if (options.limit) {
        filtered = filtered.slice(0, options.limit);
      }

      return filtered;
    }

    if (isFirebaseMode()) {
      const result = await getLessonNotesByStudent(studentId, options);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    }

    try {
      const response = await apiClient.get(
        ENDPOINTS.LESSON_NOTES?.BY_STUDENT?.(studentId) || `/lesson-notes/student/${studentId}`,
        { params: options }
      );
      return response.data;
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[LessonNoteRepository.getByStudentId] API Error:', error);
      }
      throw error;
    }
  },

  /**
   * 수업 일지 추가
   * @param {Object} lessonNoteData - 수업 일지 데이터
   * @returns {Promise<Object>} 추가된 수업 일지
   */
  async create(lessonNoteData) {
    log('create', lessonNoteData);

    if (isMockMode()) {
      await simulateNetworkDelay();
      const newNote = {
        id: Date.now().toString(),
        ...lessonNoteData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockLessonNotes.unshift(newNote);
      return newNote;
    }

    if (isFirebaseMode()) {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        throw new Error('로그인이 필요합니다');
      }

      const result = await saveLessonNote(lessonNoteData, currentUser.uid);
      if (!result.success) {
        throw new Error(result.error);
      }
      return { ...lessonNoteData, id: result.id };
    }

    try {
      const response = await apiClient.post(
        ENDPOINTS.LESSON_NOTES?.CREATE || '/lesson-notes',
        lessonNoteData
      );
      return response.data;
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[LessonNoteRepository.create] API Error:', error);
      }
      throw error;
    }
  },

  /**
   * 수업 일지 수정
   * @param {string} id - 수업 일지 ID
   * @param {Object} updates - 수정할 데이터
   * @returns {Promise<Object>} 수정된 수업 일지
   */
  async update(id, updates) {
    log('update', id, updates);

    if (isMockMode()) {
      await simulateNetworkDelay();
      const index = mockLessonNotes.findIndex(note => note.id === id);
      if (index === -1) {
        throw new Error('수업 일지를 찾을 수 없습니다');
      }
      mockLessonNotes[index] = {
        ...mockLessonNotes[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      return mockLessonNotes[index];
    }

    if (isFirebaseMode()) {
      const result = await updateLessonNote(id, updates);
      if (!result.success) {
        throw new Error(result.error);
      }
      return { id, ...updates };
    }

    try {
      const response = await apiClient.put(
        ENDPOINTS.LESSON_NOTES?.UPDATE?.(id) || `/lesson-notes/${id}`,
        updates
      );
      return response.data;
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[LessonNoteRepository.update] API Error:', error);
      }
      throw error;
    }
  },

  /**
   * 수업 일지 삭제
   * @param {string} id - 수업 일지 ID
   * @returns {Promise<Object>} 삭제 결과
   */
  async delete(id) {
    log('delete', id);

    if (isMockMode()) {
      await simulateNetworkDelay();
      const index = mockLessonNotes.findIndex(note => note.id === id);
      if (index === -1) {
        throw new Error('수업 일지를 찾을 수 없습니다');
      }
      mockLessonNotes.splice(index, 1);
      return { success: true };
    }

    if (isFirebaseMode()) {
      const result = await deleteLessonNote(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return { success: true };
    }

    try {
      await apiClient.delete(
        ENDPOINTS.LESSON_NOTES?.DELETE?.(id) || `/lesson-notes/${id}`
      );
      return { success: true };
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[LessonNoteRepository.delete] API Error:', error);
      }
      throw error;
    }
  }
};

export default LessonNoteRepository;
