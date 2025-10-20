// src/repositories/PaymentRepository.js
// 결제 및 수강권 데이터 관리 Repository

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
    console.log(`[PaymentRepository.${method}]`, ...args);
  }
};

/**
 * Mock 결제 데이터 (임시)
 */
let mockPayments = [
  {
    id: '1',
    studentId: '1',
    studentName: '김지우',
    date: '2025-01-01',
    amount: 280000,
    type: '8회권',
    status: 'paid',
    method: '카드',
    ticketInfo: {
      ticketType: 'count',
      ticketCount: 8,
      ticketPeriod: null
    }
  },
  {
    id: '2',
    studentId: '1',
    studentName: '김지우',
    date: '2024-12-01',
    amount: 280000,
    type: '8회권',
    status: 'paid',
    method: '현금',
    ticketInfo: {
      ticketType: 'count',
      ticketCount: 8,
      ticketPeriod: null
    }
  }
];

/**
 * 결제 Repository
 */
export const PaymentRepository = {
  /**
   * 전체 결제 내역 조회
   * @returns {Promise<Array>} 결제 내역 목록
   */
  async getAll() {
    log('getAll');

    if (isMockMode()) {
      await simulateNetworkDelay();
      return [...mockPayments];
    }

    try {
      const response = await apiClient.get(ENDPOINTS.PAYMENTS?.LIST || '/payments');
      return response.data;
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[PaymentRepository.getAll] API Error:', error);
      }
      throw error;
    }
  },

  /**
   * 특정 학생의 결제 내역 조회
   * @param {string} studentId - 학생 ID
   * @returns {Promise<Array>} 결제 내역 목록
   */
  async getByStudentId(studentId) {
    log('getByStudentId', studentId);

    if (isMockMode()) {
      await simulateNetworkDelay();
      return mockPayments.filter(p => p.studentId === studentId);
    }

    try {
      const response = await apiClient.get(
        ENDPOINTS.PAYMENTS?.BY_STUDENT?.(studentId) || `/payments/student/${studentId}`
      );
      return response.data;
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[PaymentRepository.getByStudentId] API Error:', error);
      }
      throw error;
    }
  },

  /**
   * 결제 추가
   * @param {Object} paymentData - { studentId, amount, type, method, date, ticketInfo }
   * @returns {Promise<Object>} 추가된 결제 정보
   */
  async create(paymentData) {
    log('create', paymentData);

    if (isMockMode()) {
      await simulateNetworkDelay();
      const newPayment = {
        id: Date.now().toString(),
        status: 'paid',
        ...paymentData,
        createdAt: new Date().toISOString()
      };
      mockPayments.unshift(newPayment); // 최신 결제가 먼저
      return newPayment;
    }

    try {
      const response = await apiClient.post(
        ENDPOINTS.PAYMENTS?.CREATE || '/payments',
        paymentData
      );
      return response.data;
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[PaymentRepository.create] API Error:', error);
      }
      throw error;
    }
  },

  /**
   * 결제 정보 수정
   * @param {string} id - 결제 ID
   * @param {Object} updates - 수정할 데이터
   * @returns {Promise<Object>} 수정된 결제 정보
   */
  async update(id, updates) {
    log('update', id, updates);

    if (isMockMode()) {
      await simulateNetworkDelay();
      const index = mockPayments.findIndex(p => p.id === id);
      if (index === -1) {
        throw new Error('결제 내역을 찾을 수 없습니다');
      }
      mockPayments[index] = {
        ...mockPayments[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      return mockPayments[index];
    }

    try {
      const response = await apiClient.put(
        ENDPOINTS.PAYMENTS?.UPDATE?.(id) || `/payments/${id}`,
        updates
      );
      return response.data;
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[PaymentRepository.update] API Error:', error);
      }
      throw error;
    }
  },

  /**
   * 결제 삭제
   * @param {string} id - 결제 ID
   * @returns {Promise<Object>} 삭제 결과
   */
  async delete(id) {
    log('delete', id);

    if (isMockMode()) {
      await simulateNetworkDelay();
      const index = mockPayments.findIndex(p => p.id === id);
      if (index === -1) {
        throw new Error('결제 내역을 찾을 수 없습니다');
      }
      mockPayments.splice(index, 1);
      return { success: true };
    }

    try {
      await apiClient.delete(
        ENDPOINTS.PAYMENTS?.DELETE?.(id) || `/payments/${id}`
      );
      return { success: true };
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[PaymentRepository.delete] API Error:', error);
      }
      throw error;
    }
  },

  /**
   * 미납 결제 조회
   * @returns {Promise<Array>} 미납 결제 목록
   */
  async getUnpaid() {
    log('getUnpaid');

    if (isMockMode()) {
      await simulateNetworkDelay();
      return mockPayments.filter(p => p.status === 'unpaid');
    }

    try {
      const response = await apiClient.get(
        ENDPOINTS.PAYMENTS?.UNPAID || '/payments',
        { params: { status: 'unpaid' } }
      );
      return response.data;
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[PaymentRepository.getUnpaid] API Error:', error);
      }
      throw error;
    }
  },

  /**
   * 기간별 결제 내역 조회
   * @param {string} startDate - 시작일 (YYYY-MM-DD)
   * @param {string} endDate - 종료일 (YYYY-MM-DD)
   * @returns {Promise<Array>} 결제 내역 목록
   */
  async getByDateRange(startDate, endDate) {
    log('getByDateRange', startDate, endDate);

    if (isMockMode()) {
      await simulateNetworkDelay();
      return mockPayments.filter(p => {
        const paymentDate = new Date(p.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return paymentDate >= start && paymentDate <= end;
      });
    }

    try {
      const response = await apiClient.get(
        ENDPOINTS.PAYMENTS?.BY_DATE_RANGE || '/payments',
        { params: { startDate, endDate } }
      );
      return response.data;
    } catch (error) {
      if (DEV_CONFIG.logApiErrors) {
        console.error('[PaymentRepository.getByDateRange] API Error:', error);
      }
      throw error;
    }
  }
};

export default PaymentRepository;
