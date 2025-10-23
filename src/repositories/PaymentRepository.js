// src/repositories/PaymentRepository.js
// 결제 및 수강권 데이터 관리 Repository

import { isMockMode, isFirebaseMode, DEV_CONFIG } from '../config/dataConfig';
import { apiClient } from '../services/api/client';
import { ENDPOINTS } from '../services/api/endpoints';
import {
  getTuitionRecords,
  saveTuitionRecord,
  updateTuitionStatus,
  deleteTuitionRecord,
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

    if (isFirebaseMode()) {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        throw new Error('로그인이 필요합니다');
      }
      // 최근 12개월 + 미래 1개월 데이터 조회 (타임존 문제 대응)
      const allPayments = [];
      const now = new Date();

      console.log('[PaymentRepository.getAll] Fetching payments for 13 months (current +1 to -11)');

      // i = -1부터 시작하여 미래 1개월도 포함
      for (let i = -1; i < 12; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const month = date.toISOString().slice(0, 7); // YYYY-MM
        const result = await getTuitionRecords(currentUser.uid, month);
        if (result.success && result.data) {
          console.log(`[PaymentRepository.getAll] Month ${month}: Found ${result.data.length} payments`);
          // Firebase 데이터를 앱 형식으로 변환
          const convertedData = result.data.map(payment => ({
            ...payment,
            status: payment.isPaid ? 'paid' : 'unpaid',
            date: payment.paidDate || payment.date,
          }));
          allPayments.push(...convertedData);
        }
      }

      console.log(`[PaymentRepository.getAll] Total payments fetched: ${allPayments.length}`);
      console.log('[PaymentRepository.getAll] Sample payment:', allPayments[0]);

      return allPayments;
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

    if (isFirebaseMode()) {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        throw new Error('로그인이 필요합니다');
      }
      // 현재 월의 모든 결제를 가져온 후 필터링
      const currentMonth = new Date().toISOString().slice(0, 7);
      const result = await getTuitionRecords(currentUser.uid, currentMonth);
      if (!result.success) {
        throw new Error(result.error);
      }
      // Firebase 데이터를 앱 형식으로 변환
      const convertedData = result.data.map(payment => ({
        ...payment,
        status: payment.isPaid ? 'paid' : 'unpaid',
        date: payment.paidDate || payment.date,
      }));
      return convertedData.filter(p => p.studentId === studentId);
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

    if (isFirebaseMode()) {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        throw new Error('로그인이 필요합니다');
      }
      // 앱 형식을 Firebase 형식으로 변환
      const paymentDate = paymentData.date instanceof Date
        ? paymentData.date
        : new Date(paymentData.date);
      const month = paymentDate.toISOString().slice(0, 7); // YYYY-MM

      const firebaseData = {
        ...paymentData,
        isPaid: paymentData.status === 'paid',
        paidDate: paymentDate.toISOString(),
        month: month,
      };
      // status와 date 필드 제거 (Firebase에서는 isPaid와 paidDate 사용)
      delete firebaseData.status;
      delete firebaseData.date;

      const result = await saveTuitionRecord(firebaseData, currentUser.uid);
      if (!result.success) {
        throw new Error(result.error);
      }
      return { ...paymentData, id: result.id };
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

    if (isFirebaseMode()) {
      // Firebase에서는 주로 결제 상태만 업데이트
      if (updates.status || updates.isPaid !== undefined || updates.date) {
        const isPaid = updates.isPaid !== undefined ? updates.isPaid : updates.status === 'paid';

        // date를 ISO 문자열로 변환
        let paidDate;
        if (updates.date) {
          paidDate = updates.date instanceof Date
            ? updates.date.toISOString()
            : new Date(updates.date).toISOString();
        } else if (updates.paidDate) {
          paidDate = updates.paidDate instanceof Date
            ? updates.paidDate.toISOString()
            : updates.paidDate;
        } else {
          paidDate = isPaid ? new Date().toISOString() : null;
        }

        console.log('[PaymentRepository.update] Updating payment:', {
          id,
          isPaid,
          paidDate,
          month: paidDate?.slice(0, 7)
        });

        const result = await updateTuitionStatus(id, isPaid, paidDate);
        if (!result.success) {
          console.error('[PaymentRepository.update] Update failed:', result.error);
          throw new Error(result.error);
        }
        console.log('[PaymentRepository.update] Update successful');

        // Firebase에서 업데이트된 문서를 다시 가져와서 전체 데이터 반환
        const currentUser = getCurrentUser();
        if (!currentUser) {
          throw new Error('로그인이 필요합니다');
        }

        // paidDate에서 month 추출
        const month = paidDate ? paidDate.slice(0, 7) : new Date().toISOString().slice(0, 7);
        const getResult = await getTuitionRecords(currentUser.uid, month);

        if (getResult.success) {
          const updatedDoc = getResult.data.find(doc => doc.id === id);
          if (updatedDoc) {
            // Firebase 형식을 앱 형식으로 변환
            return {
              ...updatedDoc,
              status: updatedDoc.isPaid ? 'paid' : 'unpaid',
              date: updatedDoc.paidDate || updatedDoc.date,
            };
          }
        }

        // 만약 문서를 찾지 못했다면 기본 응답 반환
        return {
          id,
          status: isPaid ? 'paid' : 'unpaid',
          date: paidDate,
          ...updates
        };
      }
      // 다른 필드 업데이트는 지원하지 않음
      throw new Error('Firebase 모드에서는 결제 상태만 수정할 수 있습니다');
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

    if (isFirebaseMode()) {
      const result = await deleteTuitionRecord(id);
      if (!result.success) {
        throw new Error(result.error);
      }
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

    if (isFirebaseMode()) {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        throw new Error('로그인이 필요합니다');
      }
      // 현재 월의 모든 결제를 가져온 후 미납만 필터링
      const currentMonth = new Date().toISOString().slice(0, 7);
      const result = await getTuitionRecords(currentUser.uid, currentMonth);
      if (!result.success) {
        throw new Error(result.error);
      }
      // Firebase 데이터를 앱 형식으로 변환
      const convertedData = result.data.map(payment => ({
        ...payment,
        status: payment.isPaid ? 'paid' : 'unpaid',
        date: payment.paidDate || payment.date,
      }));
      return convertedData.filter(p => p.status === 'unpaid');
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

    if (isFirebaseMode()) {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        throw new Error('로그인이 필요합니다');
      }
      // Firebase에서는 월별로 조회하므로 해당 월의 데이터를 가져온 후 필터링
      // 간단하게 startDate의 월을 사용
      const month = startDate.slice(0, 7); // YYYY-MM
      const result = await getTuitionRecords(currentUser.uid, month);
      if (!result.success) {
        throw new Error(result.error);
      }
      // Firebase 데이터를 앱 형식으로 변환
      const convertedData = result.data.map(payment => ({
        ...payment,
        status: payment.isPaid ? 'paid' : 'unpaid',
        date: payment.paidDate || payment.date,
      }));
      // 날짜 범위로 필터링
      return convertedData.filter(p => {
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
