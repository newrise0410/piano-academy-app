// src/repositories/StudentRepository.js
// 학생 데이터 관리 Repository

import { isMockMode, DEV_CONFIG } from '../config/dataConfig';
import { apiClient } from '../services/api/client';
import { ENDPOINTS } from '../services/api/endpoints';
import {
  getStudents as getMockStudents,
  addStudent as addMockStudent,
  updateStudent as updateMockStudent,
  deleteStudent as deleteMockStudent,
  getStudentById as getMockStudentById,
} from '../data/mockStudents';

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
    console.log(`[StudentRepository.${method}]`, ...args);
  }
};

/**
 * 학생 Repository
 */
export const StudentRepository = {
  /**
   * 전체 학생 목록 조회
   * @returns {Promise<Array>} 학생 목록
   */
  async getAll() {
    log('getAll');

    if (isMockMode()) {
      await simulateNetworkDelay();
      return getMockStudents();
    }

    try {
      const response = await apiClient.get(ENDPOINTS.STUDENTS.LIST);
      return response.data;
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[StudentRepository.getAll] API Error:', error);
      }
      throw error;
    }
  },

  /**
   * 특정 학생 조회
   * @param {string} id - 학생 ID
   * @returns {Promise<Object>} 학생 정보
   */
  async getById(id) {
    log('getById', id);

    if (isMockMode()) {
      await simulateNetworkDelay();
      const student = getMockStudentById(id);
      if (!student) {
        throw new Error('학생을 찾을 수 없습니다');
      }
      return student;
    }

    try {
      const response = await apiClient.get(ENDPOINTS.STUDENTS.DETAIL(id));
      return response.data;
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[StudentRepository.getById] API Error:', error);
      }
      throw error;
    }
  },

  /**
   * 학생 추가
   * @param {Object} studentData - 학생 정보
   * @returns {Promise<Object>} 추가된 학생 정보
   */
  async create(studentData) {
    log('create', studentData);

    if (isMockMode()) {
      await simulateNetworkDelay();
      return addMockStudent(studentData);
    }

    try {
      const response = await apiClient.post(
        ENDPOINTS.STUDENTS.CREATE,
        studentData
      );
      return response.data;
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[StudentRepository.create] API Error:', error);
      }
      throw error;
    }
  },

  /**
   * 학생 정보 수정
   * @param {string} id - 학생 ID
   * @param {Object} studentData - 수정할 학생 정보
   * @returns {Promise<Object>} 수정된 학생 정보
   */
  async update(id, studentData) {
    log('update', id, studentData);

    if (isMockMode()) {
      await simulateNetworkDelay();
      const updated = updateMockStudent(id, studentData);
      if (!updated) {
        throw new Error('학생을 찾을 수 없습니다');
      }
      return updated;
    }

    try {
      const response = await apiClient.put(
        ENDPOINTS.STUDENTS.UPDATE(id),
        studentData
      );
      return response.data;
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[StudentRepository.update] API Error:', error);
      }
      throw error;
    }
  },

  /**
   * 학생 삭제
   * @param {string} id - 학생 ID
   * @returns {Promise<Object>} 삭제 결과
   */
  async delete(id) {
    log('delete', id);

    if (isMockMode()) {
      await simulateNetworkDelay();
      const deleted = deleteMockStudent(id);
      if (!deleted) {
        throw new Error('학생을 찾을 수 없습니다');
      }
      return { success: true, deleted };
    }

    try {
      await apiClient.delete(ENDPOINTS.STUDENTS.DELETE(id));
      return { success: true };
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[StudentRepository.delete] API Error:', error);
      }
      throw error;
    }
  },

  /**
   * 카테고리별 학생 조회
   * @param {string} category - 카테고리 ('초등', '중등', '고등', '성인')
   * @returns {Promise<Array>} 학생 목록
   */
  async getByCategory(category) {
    log('getByCategory', category);

    if (isMockMode()) {
      await simulateNetworkDelay();
      const students = getMockStudents();
      return students.filter((s) => s.category === category);
    }

    try {
      const response = await apiClient.get(ENDPOINTS.STUDENTS.LIST, {
        params: { category },
      });
      return response.data;
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[StudentRepository.getByCategory] API Error:', error);
      }
      throw error;
    }
  },

  /**
   * 미납 학생 조회
   * @returns {Promise<Array>} 미납 학생 목록
   */
  async getUnpaidStudents() {
    log('getUnpaidStudents');

    if (isMockMode()) {
      await simulateNetworkDelay();
      const students = getMockStudents();
      return students.filter((s) => s.unpaid === true);
    }

    try {
      const response = await apiClient.get(ENDPOINTS.STUDENTS.LIST, {
        params: { unpaid: true },
      });
      return response.data;
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[StudentRepository.getUnpaidStudents] API Error:', error);
      }
      throw error;
    }
  },

  /**
   * 학생 검색
   * @param {string} query - 검색어 (이름)
   * @returns {Promise<Array>} 검색 결과
   */
  async search(query) {
    log('search', query);

    if (isMockMode()) {
      await simulateNetworkDelay();
      const students = getMockStudents();
      return students.filter((s) =>
        s.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    try {
      const response = await apiClient.get(ENDPOINTS.STUDENTS.LIST, {
        params: { search: query },
      });
      return response.data;
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[StudentRepository.search] API Error:', error);
      }
      throw error;
    }
  },
};

export default StudentRepository;
