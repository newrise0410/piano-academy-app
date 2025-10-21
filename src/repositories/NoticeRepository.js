// src/repositories/NoticeRepository.js
// 알림장 데이터 관리 Repository

import { isMockMode, isFirebaseMode, DEV_CONFIG } from '../config/dataConfig';
import { apiClient } from '../services/api/client';
import { ENDPOINTS } from '../services/api/endpoints';
import {
  getNotices as getMockNotices,
  addNotice as addMockNotice,
  deleteNotice as deleteMockNotice,
  updateNotice as updateMockNotice,
  getNoticeById as getMockNoticeById,
} from '../data/mockNotices';
import {
  getAllNotices,
  getNoticeById as getFirebaseNoticeById,
  createNotice,
  updateNotice as updateFirebaseNotice,
  deleteNotice as deleteFirebaseNotice,
} from '../services/firestoreService';
import { getCurrentUser } from '../services/authService';

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
    console.log(`[NoticeRepository.${method}]`, ...args);
  }
};

/**
 * 알림장 Repository
 */
export const NoticeRepository = {
  /**
   * 전체 알림장 목록 조회 (최신순)
   * @returns {Promise<Array>} 알림장 목록
   */
  async getAll() {
    log('getAll');

    if (isMockMode()) {
      await simulateNetworkDelay();
      return getMockNotices();
    }

    if (isFirebaseMode()) {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        throw new Error('로그인이 필요합니다');
      }
      const result = await getAllNotices(currentUser.uid);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    }

    try {
      const response = await apiClient.get(ENDPOINTS.NOTICES.LIST);
      return response.data;
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[NoticeRepository.getAll] API Error:', error);
      }
      throw error;
    }
  },

  /**
   * 특정 알림장 조회
   * @param {string} id - 알림장 ID
   * @returns {Promise<Object>} 알림장 정보
   */
  async getById(id) {
    log('getById', id);

    if (isMockMode()) {
      await simulateNetworkDelay();
      const notice = getMockNoticeById(id);
      if (!notice) {
        throw new Error('알림장을 찾을 수 없습니다');
      }
      return notice;
    }

    if (isFirebaseMode()) {
      const result = await getFirebaseNoticeById(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    }

    try {
      const response = await apiClient.get(ENDPOINTS.NOTICES.DETAIL(id));
      return response.data;
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[NoticeRepository.getById] API Error:', error);
      }
      throw error;
    }
  },

  /**
   * 알림장 작성
   * @param {Object} noticeData - 알림장 정보 { title, content, date, time }
   * @returns {Promise<Object>} 작성된 알림장 정보
   */
  async create(noticeData) {
    log('create', noticeData);

    if (isMockMode()) {
      await simulateNetworkDelay();
      return addMockNotice(noticeData);
    }

    if (isFirebaseMode()) {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        throw new Error('로그인이 필요합니다');
      }
      const result = await createNotice(noticeData, currentUser.uid);
      if (!result.success) {
        throw new Error(result.error);
      }
      return { ...noticeData, id: result.id };
    }

    try {
      const response = await apiClient.post(
        ENDPOINTS.NOTICES.CREATE,
        noticeData
      );
      return response.data;
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[NoticeRepository.create] API Error:', error);
      }
      throw error;
    }
  },

  /**
   * 알림장 수정
   * @param {string} id - 알림장 ID
   * @param {Object} noticeData - 수정할 알림장 정보
   * @returns {Promise<Object>} 수정된 알림장 정보
   */
  async update(id, noticeData) {
    log('update', id, noticeData);

    if (isMockMode()) {
      await simulateNetworkDelay();
      const updated = updateMockNotice(id, noticeData);
      if (!updated) {
        throw new Error('알림장을 찾을 수 없습니다');
      }
      return updated;
    }

    if (isFirebaseMode()) {
      const result = await updateFirebaseNotice(id, noticeData);
      if (!result.success) {
        throw new Error(result.error);
      }
      return { id, ...noticeData };
    }

    try {
      const response = await apiClient.put(
        ENDPOINTS.NOTICES.UPDATE(id),
        noticeData
      );
      return response.data;
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[NoticeRepository.update] API Error:', error);
      }
      throw error;
    }
  },

  /**
   * 알림장 삭제
   * @param {string} id - 알림장 ID
   * @returns {Promise<Object>} 삭제 결과
   */
  async delete(id) {
    log('delete', id);

    if (isMockMode()) {
      await simulateNetworkDelay();
      const result = deleteMockNotice(id);
      if (!result) {
        throw new Error('알림장을 찾을 수 없습니다');
      }
      return { success: true };
    }

    if (isFirebaseMode()) {
      const result = await deleteFirebaseNotice(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return { success: true };
    }

    try {
      await apiClient.delete(ENDPOINTS.NOTICES.DELETE(id));
      return { success: true };
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[NoticeRepository.delete] API Error:', error);
      }
      throw error;
    }
  },

  /**
   * 알림장 확인 (학부모가 읽음 처리)
   * @param {string} id - 알림장 ID
   * @param {string} parentId - 학부모 ID
   * @returns {Promise<Object>} 확인 결과
   */
  async confirm(id, parentId) {
    log('confirm', id, parentId);

    if (isMockMode()) {
      await simulateNetworkDelay();
      // Mock에서는 confirmed 카운트 증가
      const notice = getMockNoticeById(id);
      if (!notice) {
        throw new Error('알림장을 찾을 수 없습니다');
      }
      const updated = updateMockNotice(id, {
        confirmed: Math.min(notice.confirmed + 1, notice.total),
      });
      return { success: true, notice: updated };
    }

    try {
      const response = await apiClient.post(ENDPOINTS.NOTICES.CONFIRM(id), {
        parentId,
      });
      return response.data;
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[NoticeRepository.confirm] API Error:', error);
      }
      throw error;
    }
  },

  /**
   * 최근 알림장 조회 (개수 제한)
   * @param {number} limit - 조회할 개수
   * @returns {Promise<Array>} 알림장 목록
   */
  async getRecent(limit = 5) {
    log('getRecent', limit);

    if (isMockMode()) {
      await simulateNetworkDelay();
      const notices = getMockNotices();
      return notices.slice(0, limit);
    }

    try {
      const response = await apiClient.get(ENDPOINTS.NOTICES.LIST, {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[NoticeRepository.getRecent] API Error:', error);
      }
      throw error;
    }
  },
};

export default NoticeRepository;
