// src/repositories/AttendanceRepository.js
// 출석 데이터 관리 Repository

import { isMockMode, DEV_CONFIG } from '../config/dataConfig';
import { apiClient } from '../services/api/client';
import { ENDPOINTS } from '../services/api/endpoints';

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
    console.log(`[AttendanceRepository.${method}]`, ...args);
  }
};

/**
 * Mock 출석 데이터 (임시)
 */
let mockAttendanceRecords = [
  {
    id: '1',
    studentId: '1',
    studentName: '김지우',
    date: '2025-01-15',
    status: 'present',
    note: ''
  },
  {
    id: '2',
    studentId: '1',
    studentName: '김지우',
    date: '2025-01-13',
    status: 'present',
    note: '30분 조기 하원'
  },
  {
    id: '3',
    studentId: '1',
    studentName: '김지우',
    date: '2025-01-10',
    status: 'absent',
    note: '학교 행사'
  }
];

/**
 * 출석 Repository
 */
export const AttendanceRepository = {
  /**
   * 전체 출석 기록 조회
   * @returns {Promise<Array>} 출석 기록 목록
   */
  async getAll() {
    log('getAll');

    if (isMockMode()) {
      await simulateNetworkDelay();
      return [...mockAttendanceRecords];
    }

    try {
      const response = await apiClient.get(ENDPOINTS.ATTENDANCE?.LIST || '/attendance');
      return response.data;
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[AttendanceRepository.getAll] API Error:', error);
      }
      throw error;
    }
  },

  /**
   * 특정 학생의 출석 기록 조회
   * @param {string} studentId - 학생 ID
   * @returns {Promise<Array>} 출석 기록 목록
   */
  async getByStudentId(studentId) {
    log('getByStudentId', studentId);

    if (isMockMode()) {
      await simulateNetworkDelay();
      return mockAttendanceRecords.filter(r => r.studentId === studentId);
    }

    try {
      const response = await apiClient.get(
        ENDPOINTS.ATTENDANCE?.BY_STUDENT?.(studentId) || `/attendance/student/${studentId}`
      );
      return response.data;
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[AttendanceRepository.getByStudentId] API Error:', error);
      }
      throw error;
    }
  },

  /**
   * 출석 기록 추가
   * @param {Object} recordData - { studentId, date, status, note }
   * @returns {Promise<Object>} 추가된 출석 기록
   */
  async create(recordData) {
    log('create', recordData);

    if (isMockMode()) {
      await simulateNetworkDelay();
      const newRecord = {
        id: Date.now().toString(),
        ...recordData,
        createdAt: new Date().toISOString()
      };
      mockAttendanceRecords.push(newRecord);
      return newRecord;
    }

    try {
      const response = await apiClient.post(
        ENDPOINTS.ATTENDANCE?.CREATE || '/attendance',
        recordData
      );
      return response.data;
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[AttendanceRepository.create] API Error:', error);
      }
      throw error;
    }
  },

  /**
   * 출석 기록 수정
   * @param {string} id - 기록 ID
   * @param {Object} updates - 수정할 데이터
   * @returns {Promise<Object>} 수정된 출석 기록
   */
  async update(id, updates) {
    log('update', id, updates);

    if (isMockMode()) {
      await simulateNetworkDelay();
      const index = mockAttendanceRecords.findIndex(r => r.id === id);
      if (index === -1) {
        throw new Error('출석 기록을 찾을 수 없습니다');
      }
      mockAttendanceRecords[index] = {
        ...mockAttendanceRecords[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      return mockAttendanceRecords[index];
    }

    try {
      const response = await apiClient.put(
        ENDPOINTS.ATTENDANCE?.UPDATE?.(id) || `/attendance/${id}`,
        updates
      );
      return response.data;
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[AttendanceRepository.update] API Error:', error);
      }
      throw error;
    }
  },

  /**
   * 출석 기록 삭제
   * @param {string} id - 기록 ID
   * @returns {Promise<Object>} 삭제 결과
   */
  async delete(id) {
    log('delete', id);

    if (isMockMode()) {
      await simulateNetworkDelay();
      const index = mockAttendanceRecords.findIndex(r => r.id === id);
      if (index === -1) {
        throw new Error('출석 기록을 찾을 수 없습니다');
      }
      mockAttendanceRecords.splice(index, 1);
      return { success: true };
    }

    try {
      await apiClient.delete(
        ENDPOINTS.ATTENDANCE?.DELETE?.(id) || `/attendance/${id}`
      );
      return { success: true };
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[AttendanceRepository.delete] API Error:', error);
      }
      throw error;
    }
  },

  /**
   * 날짜별 출석 기록 조회
   * @param {string} date - 날짜 (YYYY-MM-DD)
   * @returns {Promise<Array>} 출석 기록 목록
   */
  async getByDate(date) {
    log('getByDate', date);

    if (isMockMode()) {
      await simulateNetworkDelay();
      return mockAttendanceRecords.filter(r => r.date === date);
    }

    try {
      const response = await apiClient.get(
        ENDPOINTS.ATTENDANCE?.BY_DATE?.(date) || '/attendance',
        { params: { date } }
      );
      return response.data;
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[AttendanceRepository.getByDate] API Error:', error);
      }
      throw error;
    }
  }
};

export default AttendanceRepository;
