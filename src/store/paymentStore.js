// src/store/paymentStore.js
import { create } from 'zustand';
import { PaymentRepository } from '../repositories/PaymentRepository';
import { getTicketStatus, getDaysUntilExpiry } from '../utils';
import useNotificationStore from './notificationStore';
import { useAuthStore } from './authStore';
import { addActivity } from '../services/firestoreService';

/**
 * 결제 및 수강권 데이터 관리 Store
 *
 * 기능:
 * - 결제 내역 관리
 * - 수강권 상태 추적
 * - 미납/만료 알림 관리
 */
export const usePaymentStore = create((set, get) => ({
  // State
  payments: [], // 전체 결제 내역
  studentPayments: {}, // 학생별 결제 내역 { studentId: [payments] }
  tickets: {}, // 학생별 현재 수강권 { studentId: ticketInfo }
  stats: {
    total: 0, // 총 수입
    unpaidCount: 0, // 미납 건수
    lowTicketCount: 0, // 잔여 1-2회 학생 수
    expiringCount: 0, // 7일 내 만료 수강권 수
  },
  loading: false,
  error: null,
  lastFetched: null,

  // Actions
  /**
   * 전체 결제 내역 조회
   * @param {boolean} forceRefresh - 강제 새로고침
   */
  fetchAllPayments: async (forceRefresh = false) => {
    const state = get();

    // 캐시 확인 (5분)
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    if (!forceRefresh && state.lastFetched && state.lastFetched > fiveMinutesAgo) {
      return state.payments;
    }

    set({ loading: true, error: null });
    try {
      const payments = await PaymentRepository.getAll();
      set({
        payments,
        loading: false,
        lastFetched: Date.now()
      });

      // 통계 자동 계산
      get().calculateStats();

      return payments;
    } catch (error) {
      set({
        error: error.message || '결제 내역을 불러오는데 실패했습니다.',
        loading: false
      });
      throw error;
    }
  },

  /**
   * 특정 학생의 결제 내역 조회
   * @param {string} studentId - 학생 ID
   */
  fetchStudentPayments: async (studentId) => {
    set({ loading: true, error: null });
    try {
      const payments = await PaymentRepository.getByStudentId(studentId);
      set((state) => ({
        studentPayments: {
          ...state.studentPayments,
          [studentId]: payments
        },
        loading: false
      }));
      return payments;
    } catch (error) {
      set({
        error: error.message || '결제 내역을 불러오는데 실패했습니다.',
        loading: false
      });
      throw error;
    }
  },

  /**
   * 결제 추가
   * @param {Object} paymentData - { studentId, studentName, amount, type, method, date, ticketInfo }
   */
  addPayment: async (paymentData) => {
    set({ loading: true, error: null });
    try {
      const newPayment = await PaymentRepository.create(paymentData);
      set((state) => {
        const studentId = paymentData.studentId;
        const existingPayments = state.studentPayments[studentId] || [];

        return {
          payments: [...state.payments, newPayment],
          studentPayments: {
            ...state.studentPayments,
            [studentId]: [...existingPayments, newPayment]
          },
          loading: false
        };
      });

      // 수강권 정보 업데이트
      if (paymentData.ticketInfo) {
        get().updateTicket(paymentData.studentId, paymentData.ticketInfo);
      }

      // 통계 재계산
      get().calculateStats();

      // 알림 및 활동 추가 (결제 완료 시)
      try {
        const user = useAuthStore.getState().user;
        if (user?.uid) {
          const { addNotification } = useNotificationStore.getState();
          const formattedAmount = new Intl.NumberFormat('ko-KR').format(paymentData.amount);

          // 알림 추가
          await addNotification(
            {
              type: 'payment_received',
              title: '결제 완료',
              message: `${paymentData.studentName || '학생'}의 ${formattedAmount}원 결제가 완료되었습니다`,
              targetId: paymentData.studentId,
            },
            user.uid
          );

          // 활동 로그 추가
          await addActivity(
            {
              type: 'payment',
              action: 'add',
              title: '수강료 결제',
              description: `${paymentData.studentName || '학생'} - ${formattedAmount}원 (${paymentData.type || '수강료'})`,
              studentId: paymentData.studentId,
              studentName: paymentData.studentName,
              relatedId: newPayment.id,
            },
            user.uid
          );
        }
      } catch (error) {
        console.error('알림/활동 추가 실패:', error);
        // 알림/활동 추가 실패는 무시하고 계속 진행
      }

      return newPayment;
    } catch (error) {
      set({
        error: error.message || '결제 추가에 실패했습니다.',
        loading: false
      });
      throw error;
    }
  },

  /**
   * 결제 정보 수정
   * @param {string} paymentId - 결제 ID
   * @param {Object} updates - 수정할 데이터
   */
  updatePayment: async (paymentId, updates) => {
    set({ loading: true, error: null });
    try {
      const updatedPayment = await PaymentRepository.update(paymentId, updates);
      set((state) => ({
        payments: state.payments.map(p => p.id === paymentId ? updatedPayment : p),
        loading: false
      }));

      // 학생별 내역도 업데이트
      const studentId = updatedPayment.studentId;
      if (get().studentPayments[studentId]) {
        set((state) => ({
          studentPayments: {
            ...state.studentPayments,
            [studentId]: state.studentPayments[studentId].map(p =>
              p.id === paymentId ? updatedPayment : p
            )
          }
        }));
      }

      get().calculateStats();

      // 납부 처리 시 활동 로그 추가
      if (updates.status === 'paid') {
        try {
          const user = useAuthStore.getState().user;
          if (user?.uid) {
            const formattedAmount = new Intl.NumberFormat('ko-KR').format(updatedPayment.amount || 0);
            await addActivity(
              {
                type: 'payment',
                action: 'update',
                title: '수강료 납부 처리',
                description: `${updatedPayment.studentName || '학생'} - ${formattedAmount}원 납부 완료`,
                studentId: updatedPayment.studentId,
                studentName: updatedPayment.studentName,
                relatedId: paymentId,
              },
              user.uid
            );
          }
        } catch (error) {
          console.error('활동 추가 실패:', error);
          // 활동 추가 실패는 무시하고 계속 진행
        }
      }

      return updatedPayment;
    } catch (error) {
      set({
        error: error.message || '결제 정보 수정에 실패했습니다.',
        loading: false
      });
      throw error;
    }
  },

  /**
   * 결제 삭제
   * @param {string} paymentId - 결제 ID
   */
  deletePayment: async (paymentId) => {
    set({ loading: true, error: null });
    try {
      // 삭제 전 payment 정보 가져오기 (activity 로그용)
      const paymentToDelete = get().payments.find(p => p.id === paymentId);

      await PaymentRepository.delete(paymentId);
      set((state) => ({
        payments: state.payments.filter(p => p.id !== paymentId),
        loading: false
      }));

      // 학생별 내역에서도 삭제
      set((state) => {
        const updatedStudentPayments = { ...state.studentPayments };
        Object.keys(updatedStudentPayments).forEach(studentId => {
          updatedStudentPayments[studentId] = updatedStudentPayments[studentId].filter(
            p => p.id !== paymentId
          );
        });
        return { studentPayments: updatedStudentPayments };
      });

      get().calculateStats();

      // 활동 로그 추가
      if (paymentToDelete) {
        try {
          const user = useAuthStore.getState().user;
          if (user?.uid) {
            const formattedAmount = new Intl.NumberFormat('ko-KR').format(paymentToDelete.amount || 0);
            await addActivity(
              {
                type: 'payment',
                action: 'delete',
                title: '수강료 삭제',
                description: `${paymentToDelete.studentName || '학생'} - ${formattedAmount}원 삭제됨`,
                studentId: paymentToDelete.studentId,
                studentName: paymentToDelete.studentName,
                relatedId: paymentId,
              },
              user.uid
            );
          }
        } catch (error) {
          console.error('활동 추가 실패:', error);
          // 활동 추가 실패는 무시하고 계속 진행
        }
      }

      return { success: true };
    } catch (error) {
      set({
        error: error.message || '결제 삭제에 실패했습니다.',
        loading: false
      });
      throw error;
    }
  },

  /**
   * 학생의 수강권 정보 업데이트
   * @param {string} studentId - 학생 ID
   * @param {Object} ticketInfo - { ticketType, ticketCount, ticketPeriod }
   */
  updateTicket: (studentId, ticketInfo) => {
    set((state) => ({
      tickets: {
        ...state.tickets,
        [studentId]: {
          ...ticketInfo,
          status: getTicketStatus(ticketInfo),
          updatedAt: Date.now()
        }
      }
    }));

    get().calculateStats();
  },

  /**
   * 수강권 회차 차감
   * @param {string} studentId - 학생 ID
   */
  decrementTicketCount: (studentId) => {
    const ticket = get().tickets[studentId];
    if (ticket && ticket.ticketType === 'count' && ticket.ticketCount > 0) {
      set((state) => ({
        tickets: {
          ...state.tickets,
          [studentId]: {
            ...state.tickets[studentId],
            ticketCount: state.tickets[studentId].ticketCount - 1,
            status: getTicketStatus({
              ...state.tickets[studentId],
              ticketCount: state.tickets[studentId].ticketCount - 1
            }),
            updatedAt: Date.now()
          }
        }
      }));

      get().calculateStats();
    }
  },

  /**
   * 통계 계산
   */
  calculateStats: () => {
    const payments = get().payments;
    const tickets = get().tickets;

    // 총 수입 계산 (최근 30일)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentPayments = payments.filter(p => {
      const paymentDate = new Date(p.date);
      return paymentDate >= thirtyDaysAgo;
    });

    const total = recentPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // 미납 건수 (unpaid 상태)
    const unpaidCount = payments.filter(p => p.status === 'unpaid').length;

    // 잔여 1-2회 학생 수
    const lowTicketCount = Object.values(tickets).filter(t =>
      t.ticketType === 'count' && t.ticketCount <= 2 && t.ticketCount > 0
    ).length;

    // 7일 내 만료 수강권 수
    const expiringCount = Object.values(tickets).filter(t => {
      if (t.ticketType === 'period' && t.ticketPeriod?.end) {
        const daysLeft = getDaysUntilExpiry(t.ticketPeriod.end);
        return daysLeft <= 7 && daysLeft > 0;
      }
      return false;
    }).length;

    set({
      stats: {
        total,
        unpaidCount,
        lowTicketCount,
        expiringCount
      }
    });
  },

  /**
   * 특정 학생의 수강권 조회
   * @param {string} studentId - 학생 ID
   * @returns {Object} 수강권 정보
   */
  getTicket: (studentId) => {
    return get().tickets[studentId] || null;
  },

  /**
   * 미납 학생 목록 조회
   * @returns {Array} 미납 결제 목록
   */
  getUnpaidPayments: () => {
    return get().payments.filter(p => p.status === 'unpaid');
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
      payments: [],
      studentPayments: {},
      tickets: {},
      stats: {
        total: 0,
        unpaidCount: 0,
        lowTicketCount: 0,
        expiringCount: 0
      },
      loading: false,
      error: null,
      lastFetched: null
    });
  },
}));
