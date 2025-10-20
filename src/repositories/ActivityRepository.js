// src/repositories/ActivityRepository.js
// 활동 기록 데이터 관리 Repository

import { isMockMode, DEV_CONFIG } from '../config/dataConfig';
import { apiClient } from '../services/api/client';
import { ENDPOINTS } from '../services/api/endpoints';
import {
  getActivities as getMockActivities,
  addActivity as addMockActivity,
  getStudentActivities as getMockStudentActivities,
  getActivitiesByType as getMockActivitiesByType,
} from '../data/mockActivities';

const simulateNetworkDelay = () => {
  if (isMockMode() && DEV_CONFIG.mockNetworkDelay > 0) {
    return new Promise((resolve) =>
      setTimeout(resolve, DEV_CONFIG.mockNetworkDelay)
    );
  }
  return Promise.resolve();
};

const log = (method, ...args) => {
  if (DEV_CONFIG.logRepositoryCalls) {
    console.log(`[ActivityRepository.${method}]`, ...args);
  }
};

/**
 * 활동 Repository
 */
export const ActivityRepository = {
  /**
   * 전체 활동 목록 조회 (최신순)
   * @returns {Promise<Array>} 활동 목록
   */
  async getAll() {
    log('getAll');

    if (isMockMode()) {
      await simulateNetworkDelay();
      return getMockActivities();
    }

    try {
      const response = await apiClient.get(ENDPOINTS.ACTIVITIES.LIST);
      return response.data;
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[ActivityRepository.getAll] API Error:', error);
      }
      throw error;
    }
  },

  /**
   * 최근 활동 조회 (개수 제한)
   * @param {number} limit - 조회할 개수
   * @returns {Promise<Array>} 활동 목록
   */
  async getRecent(limit = 10) {
    log('getRecent', limit);

    if (isMockMode()) {
      await simulateNetworkDelay();
      const activities = getMockActivities();
      return activities.slice(0, limit);
    }

    try {
      const response = await apiClient.get(ENDPOINTS.ACTIVITIES.RECENT, {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[ActivityRepository.getRecent] API Error:', error);
      }
      throw error;
    }
  },

  /**
   * 특정 학생의 활동 조회
   * @param {string} studentId - 학생 ID
   * @returns {Promise<Array>} 활동 목록
   */
  async getByStudent(studentId) {
    log('getByStudent', studentId);

    if (isMockMode()) {
      await simulateNetworkDelay();
      return getMockStudentActivities(studentId);
    }

    try {
      const response = await apiClient.get(ENDPOINTS.ACTIVITIES.LIST, {
        params: { studentId },
      });
      return response.data;
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[ActivityRepository.getByStudent] API Error:', error);
      }
      throw error;
    }
  },

  /**
   * 특정 타입의 활동 조회
   * @param {string} type - 활동 타입 ('attendance', 'payment', 'notice', 'student')
   * @returns {Promise<Array>} 활동 목록
   */
  async getByType(type) {
    log('getByType', type);

    if (isMockMode()) {
      await simulateNetworkDelay();
      return getMockActivitiesByType(type);
    }

    try {
      const response = await apiClient.get(ENDPOINTS.ACTIVITIES.BY_TYPE(type));
      return response.data;
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[ActivityRepository.getByType] API Error:', error);
      }
      throw error;
    }
  },

  /**
   * 새 활동 추가
   * @param {Object} activityData - 활동 정보
   * @returns {Promise<Object>} 추가된 활동 정보
   */
  async create(activityData) {
    log('create', activityData);

    if (isMockMode()) {
      await simulateNetworkDelay();
      return addMockActivity(activityData);
    }

    try {
      const response = await apiClient.post(
        ENDPOINTS.ACTIVITIES.LIST,
        activityData
      );
      return response.data;
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[ActivityRepository.create] API Error:', error);
      }
      throw error;
    }
  },

  /**
   * 날짜 범위로 활동 조회
   * @param {string} startDate - 시작 날짜 (YYYY-MM-DD)
   * @param {string} endDate - 종료 날짜 (YYYY-MM-DD)
   * @returns {Promise<Array>} 활동 목록
   */
  async getByDateRange(startDate, endDate) {
    log('getByDateRange', startDate, endDate);

    if (isMockMode()) {
      await simulateNetworkDelay();
      const activities = getMockActivities();
      return activities.filter((activity) => {
        const activityDate = new Date(activity.timestamp);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return activityDate >= start && activityDate <= end;
      });
    }

    try {
      const response = await apiClient.get(ENDPOINTS.ACTIVITIES.LIST, {
        params: { startDate, endDate },
      });
      return response.data;
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[ActivityRepository.getByDateRange] API Error:', error);
      }
      throw error;
    }
  },
};

export default ActivityRepository;
