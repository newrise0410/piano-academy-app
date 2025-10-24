// src/repositories/LessonNoteRepository.js
// 수업 일지 데이터 관리 Repository

import { DEV_CONFIG } from '../config/dataConfig';
import {
  getLessonNotes,
  saveLessonNote,
  updateLessonNote,
  deleteLessonNote,
} from '../services/firestoreService';
import { getCurrentUser } from '../services/authService';

/**
 * Repository 호출 로그
 */
const log = (method, ...args) => {
  if (DEV_CONFIG.logRepositoryCalls) {
    console.log(`[LessonNoteRepository.${method}]`, ...args);
  }
};

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

    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('로그인이 필요합니다');
    }

    const result = await getLessonNotes(currentUser.uid, options);
    if (!result.success) {
      throw new Error(result.error);
    }
    return result.data;
  },

  /**
   * 학생별 수업 일지 조회
   * @param {string} studentId - 학생 ID
   * @param {Object} options - 쿼리 옵션
   * @returns {Promise<Array>} 수업 일지 목록
   */
  async getByStudentId(studentId, options = {}) {
    log('getByStudentId', studentId, options);

    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('로그인이 필요합니다');
    }

    console.log('🔍 [LessonNoteRepository.getByStudentId] teacherId로 조회:', currentUser.uid, 'studentId:', studentId);

    // 선생님용: teacherId와 studentId로 조회
    const result = await getLessonNotes(currentUser.uid, { ...options, studentId });
    if (!result.success) {
      throw new Error(result.error);
    }

    console.log('✅ [LessonNoteRepository.getByStudentId] 조회 결과:', result.data.length, '개');
    return result.data;
  },

  /**
   * 수업 일지 추가
   * @param {Object} lessonNoteData - 수업 일지 데이터
   * @returns {Promise<Object>} 추가된 수업 일지
   */
  async create(lessonNoteData) {
    log('create', lessonNoteData);

    console.log('✅ Firebase에 수업일지 저장');
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('로그인이 필요합니다');
    }

    const result = await saveLessonNote(lessonNoteData, currentUser.uid);
    if (!result.success) {
      throw new Error(result.error);
    }
    console.log('✅ Firebase에 저장 완료:', result.id);
    return { ...lessonNoteData, id: result.id };
  },

  /**
   * 수업 일지 수정
   * @param {string} id - 수업 일지 ID
   * @param {Object} updates - 수정할 데이터
   * @returns {Promise<Object>} 수정된 수업 일지
   */
  async update(id, updates) {
    log('update', id, updates);

    const result = await updateLessonNote(id, updates);
    if (!result.success) {
      throw new Error(result.error);
    }
    return { id, ...updates };
  },

  /**
   * 수업 일지 삭제
   * @param {string} id - 수업 일지 ID
   * @returns {Promise<Object>} 삭제 결과
   */
  async delete(id) {
    log('delete', id);

    const result = await deleteLessonNote(id);
    if (!result.success) {
      throw new Error(result.error);
    }
    return { success: true };
  }
};

export default LessonNoteRepository;
