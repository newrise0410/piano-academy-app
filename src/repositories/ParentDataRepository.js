// src/repositories/ParentDataRepository.js
// 학부모 앱 데이터 관리 Repository

import { isMockMode, DEV_CONFIG } from '../config/dataConfig';
import { apiClient } from '../services/api/client';
import { ENDPOINTS } from '../services/api/endpoints';
import {
  childData,
  recentActivities,
  todaySchedule,
  completedSongs,
  weeklyTasks,
  attendanceRecords,
  getAttendanceForMonth,
  getAttendanceStatus,
  upcomingClasses,
  paymentHistory,
  ticketPrices,
  galleryItems,
  timeline,
  achievements,
} from '../data/mockParentData';

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
    console.log(`[ParentDataRepository.${method}]`, ...args);
  }
};

/**
 * 학부모 데이터 Repository
 */
export const ParentDataRepository = {
  /**
   * 자녀 정보 조회
   * @param {string} childId - 자녀 ID
   * @returns {Promise<Object>} 자녀 정보
   */
  async getChildData(childId) {
    log('getChildData', childId);

    if (isMockMode()) {
      await simulateNetworkDelay();
      return childData;
    }

    try {
      const response = await apiClient.get(ENDPOINTS.DASHBOARD.PARENT(childId));
      return response.data.child;
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[ParentDataRepository.getChildData] API Error:', error);
      }
      throw error;
    }
  },

  /**
   * 최근 활동 조회
   * @param {string} childId - 자녀 ID
   * @returns {Promise<Array>} 활동 목록
   */
  async getRecentActivities(childId) {
    log('getRecentActivities', childId);

    if (isMockMode()) {
      await simulateNetworkDelay();
      return recentActivities;
    }

    try {
      const response = await apiClient.get(
        `/parent/${childId}/recent-activities`
      );
      return response.data;
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[ParentDataRepository.getRecentActivities] API Error:', error);
      }
      throw error;
    }
  },

  /**
   * 오늘의 일정 조회
   * @param {string} childId - 자녀 ID
   * @returns {Promise<Object>} 일정 정보
   */
  async getTodaySchedule(childId) {
    log('getTodaySchedule', childId);

    if (isMockMode()) {
      await simulateNetworkDelay();
      return todaySchedule;
    }

    try {
      const response = await apiClient.get(`/parent/${childId}/today-schedule`);
      return response.data;
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[ParentDataRepository.getTodaySchedule] API Error:', error);
      }
      throw error;
    }
  },

  /**
   * 완료한 곡 목록 조회
   * @param {string} childId - 자녀 ID
   * @returns {Promise<Array>} 완료한 곡 목록
   */
  async getCompletedSongs(childId) {
    log('getCompletedSongs', childId);

    if (isMockMode()) {
      await simulateNetworkDelay();
      return completedSongs;
    }

    try {
      const response = await apiClient.get(
        ENDPOINTS.PROGRESS.SONGS(childId)
      );
      return response.data;
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[ParentDataRepository.getCompletedSongs] API Error:', error);
      }
      throw error;
    }
  },

  /**
   * 이번 주 연습 과제 조회
   * @param {string} childId - 자녀 ID
   * @returns {Promise<Array>} 연습 과제 목록
   */
  async getWeeklyTasks(childId) {
    log('getWeeklyTasks', childId);

    if (isMockMode()) {
      await simulateNetworkDelay();
      return weeklyTasks;
    }

    try {
      const response = await apiClient.get(`/parent/${childId}/weekly-tasks`);
      return response.data;
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[ParentDataRepository.getWeeklyTasks] API Error:', error);
      }
      throw error;
    }
  },

  /**
   * 출석 기록 조회
   * @param {string} childId - 자녀 ID
   * @param {number} year - 연도
   * @param {number} month - 월 (1-12)
   * @returns {Promise<Array>} 출석 기록
   */
  async getAttendanceRecords(childId, year, month) {
    log('getAttendanceRecords', childId, year, month);

    if (isMockMode()) {
      await simulateNetworkDelay();
      if (year && month) {
        return getAttendanceForMonth(year, month);
      }
      return attendanceRecords;
    }

    try {
      const response = await apiClient.get(
        ENDPOINTS.ATTENDANCE.BY_STUDENT(childId),
        {
          params: { year, month },
        }
      );
      return response.data;
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[ParentDataRepository.getAttendanceRecords] API Error:', error);
      }
      throw error;
    }
  },

  /**
   * 특정 날짜의 출석 상태 조회
   * @param {string} childId - 자녀 ID
   * @param {number} year - 연도
   * @param {number} month - 월
   * @param {number} day - 일
   * @returns {Promise<string|null>} 출석 상태
   */
  async getAttendanceStatus(childId, year, month, day) {
    log('getAttendanceStatus', childId, year, month, day);

    if (isMockMode()) {
      await simulateNetworkDelay();
      return getAttendanceStatus(year, month, day);
    }

    try {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const response = await apiClient.get(
        ENDPOINTS.ATTENDANCE.BY_DATE(dateStr),
        {
          params: { studentId: childId },
        }
      );
      return response.data.status;
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[ParentDataRepository.getAttendanceStatus] API Error:', error);
      }
      throw error;
    }
  },

  /**
   * 다가오는 수업 일정 조회
   * @param {string} childId - 자녀 ID
   * @returns {Promise<Array>} 수업 일정
   */
  async getUpcomingClasses(childId) {
    log('getUpcomingClasses', childId);

    if (isMockMode()) {
      await simulateNetworkDelay();
      return upcomingClasses;
    }

    try {
      const response = await apiClient.get(`/parent/${childId}/upcoming-classes`);
      return response.data;
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[ParentDataRepository.getUpcomingClasses] API Error:', error);
      }
      throw error;
    }
  },

  /**
   * 결제 내역 조회
   * @param {string} childId - 자녀 ID
   * @returns {Promise<Array>} 결제 내역
   */
  async getPaymentHistory(childId) {
    log('getPaymentHistory', childId);

    if (isMockMode()) {
      await simulateNetworkDelay();
      return paymentHistory;
    }

    try {
      const response = await apiClient.get(
        ENDPOINTS.PAYMENTS.BY_STUDENT(childId)
      );
      return response.data;
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[ParentDataRepository.getPaymentHistory] API Error:', error);
      }
      throw error;
    }
  },

  /**
   * 수강권 가격표 조회
   * @returns {Promise<Array>} 수강권 가격표
   */
  async getTicketPrices() {
    log('getTicketPrices');

    if (isMockMode()) {
      await simulateNetworkDelay();
      return ticketPrices;
    }

    try {
      const response = await apiClient.get('/ticket-prices');
      return response.data;
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[ParentDataRepository.getTicketPrices] API Error:', error);
      }
      throw error;
    }
  },

  /**
   * 갤러리 아이템 조회
   * @param {string} childId - 자녀 ID
   * @returns {Promise<Array>} 갤러리 아이템
   */
  async getGalleryItems(childId) {
    log('getGalleryItems', childId);

    if (isMockMode()) {
      await simulateNetworkDelay();
      return galleryItems;
    }

    try {
      const response = await apiClient.get(`/parent/${childId}/gallery`);
      return response.data;
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[ParentDataRepository.getGalleryItems] API Error:', error);
      }
      throw error;
    }
  },

  /**
   * 성장 타임라인 조회
   * @param {string} childId - 자녀 ID
   * @returns {Promise<Array>} 타임라인 아이템
   */
  async getTimeline(childId) {
    log('getTimeline', childId);

    if (isMockMode()) {
      await simulateNetworkDelay();
      return timeline;
    }

    try {
      const response = await apiClient.get(`/parent/${childId}/timeline`);
      return response.data;
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[ParentDataRepository.getTimeline] API Error:', error);
      }
      throw error;
    }
  },

  /**
   * 성취 배지 조회
   * @param {string} childId - 자녀 ID
   * @returns {Promise<Array>} 배지 목록
   */
  async getAchievements(childId) {
    log('getAchievements', childId);

    if (isMockMode()) {
      await simulateNetworkDelay();
      return achievements;
    }

    try {
      const response = await apiClient.get(`/parent/${childId}/achievements`);
      return response.data;
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[ParentDataRepository.getAchievements] API Error:', error);
      }
      throw error;
    }
  },
};

export default ParentDataRepository;
