// src/store/attendanceStore.js
import { create } from 'zustand';
import { AttendanceRepository } from '../repositories/AttendanceRepository';
import { calculateAttendanceRate, getMonthlyStats } from '../utils';
import useNotificationStore from './notificationStore';
import { useAuthStore } from './authStore';

/**
 * 출석 데이터 관리 Store
 *
 * 기능:
 * - 출석 기록 조회 및 관리
 * - 출석 통계 계산
 * - 출석 상태 변경 (출석, 결석, 지각, 보강)
 */
export const useAttendanceStore = create((set, get) => ({
  // State
  records: [], // 전체 출석 기록
  studentRecords: {}, // 학생별 출석 기록 { studentId: [records] }
  stats: {}, // 통계 캐시 { studentId: { rate, total, present, absent, late, makeup } }
  loading: false,
  error: null,
  lastFetched: null,

  // Actions
  /**
   * 전체 출석 기록 조회
   * @param {boolean} forceRefresh - 강제 새로고침
   */
  fetchAllRecords: async (forceRefresh = false) => {
    const state = get();

    // 캐시 확인 (3분)
    const threeMinutesAgo = Date.now() - 3 * 60 * 1000;
    if (!forceRefresh && state.lastFetched && state.lastFetched > threeMinutesAgo) {
      return state.records;
    }

    set({ loading: true, error: null });
    try {
      const records = await AttendanceRepository.getAll();
      set({
        records,
        loading: false,
        lastFetched: Date.now()
      });
      return records;
    } catch (error) {
      set({
        error: error.message || '출석 기록을 불러오는데 실패했습니다.',
        loading: false
      });
      throw error;
    }
  },

  /**
   * 특정 학생의 출석 기록 조회
   * @param {string} studentId - 학생 ID
   */
  fetchStudentRecords: async (studentId) => {
    set({ loading: true, error: null });
    try {
      const records = await AttendanceRepository.getByStudentId(studentId);
      set((state) => ({
        studentRecords: {
          ...state.studentRecords,
          [studentId]: records
        },
        loading: false
      }));

      // 통계 자동 계산
      get().calculateStats(studentId, records);

      return records;
    } catch (error) {
      set({
        error: error.message || '출석 기록을 불러오는데 실패했습니다.',
        loading: false
      });
      throw error;
    }
  },

  /**
   * 출석 기록 추가
   * @param {Object} recordData - { studentId, date, status, note, studentName }
   */
  addRecord: async (recordData) => {
    set({ loading: true, error: null });
    try {
      const newRecord = await AttendanceRepository.create(recordData);
      set((state) => {
        const studentId = recordData.studentId;
        const existingRecords = state.studentRecords[studentId] || [];

        return {
          records: [...state.records, newRecord],
          studentRecords: {
            ...state.studentRecords,
            [studentId]: [...existingRecords, newRecord]
          },
          loading: false
        };
      });

      // 통계 재계산
      const studentId = recordData.studentId;
      const updatedRecords = get().studentRecords[studentId];
      get().calculateStats(studentId, updatedRecords);

      // 알림 추가 (결석인 경우)
      try {
        const user = useAuthStore.getState().user;
        if (user?.uid && recordData.status === 'absent') {
          const { addNotification } = useNotificationStore.getState();
          await addNotification(
            {
              type: 'attendance_absent',
              title: '결석 기록',
              message: `${recordData.studentName || '학생'}이(가) ${recordData.date}에 결석했습니다`,
              targetId: studentId,
            },
            user.uid
          );
        }
      } catch (notificationError) {
        console.error('알림 추가 실패:', notificationError);
        // 알림 추가 실패는 무시하고 계속 진행
      }

      return newRecord;
    } catch (error) {
      set({
        error: error.message || '출석 기록 추가에 실패했습니다.',
        loading: false
      });
      throw error;
    }
  },

  /**
   * 출석 기록 수정
   * @param {string} recordId - 기록 ID
   * @param {Object} updates - 수정할 데이터
   */
  updateRecord: async (recordId, updates) => {
    set({ loading: true, error: null });
    try {
      const updatedRecord = await AttendanceRepository.update(recordId, updates);
      set((state) => ({
        records: state.records.map(r => r.id === recordId ? updatedRecord : r),
        loading: false
      }));

      // 학생별 기록도 업데이트
      const studentId = updatedRecord.studentId;
      if (get().studentRecords[studentId]) {
        set((state) => ({
          studentRecords: {
            ...state.studentRecords,
            [studentId]: state.studentRecords[studentId].map(r =>
              r.id === recordId ? updatedRecord : r
            )
          }
        }));

        // 통계 재계산
        const updatedRecords = get().studentRecords[studentId];
        get().calculateStats(studentId, updatedRecords);
      }

      return updatedRecord;
    } catch (error) {
      set({
        error: error.message || '출석 기록 수정에 실패했습니다.',
        loading: false
      });
      throw error;
    }
  },

  /**
   * 출석 기록 삭제
   * @param {string} recordId - 기록 ID
   */
  deleteRecord: async (recordId) => {
    set({ loading: true, error: null });
    try {
      await AttendanceRepository.delete(recordId);

      const record = get().records.find(r => r.id === recordId);
      const studentId = record?.studentId;

      set((state) => ({
        records: state.records.filter(r => r.id !== recordId),
        loading: false
      }));

      // 학생별 기록도 삭제
      if (studentId && get().studentRecords[studentId]) {
        set((state) => ({
          studentRecords: {
            ...state.studentRecords,
            [studentId]: state.studentRecords[studentId].filter(r => r.id !== recordId)
          }
        }));

        // 통계 재계산
        const updatedRecords = get().studentRecords[studentId];
        get().calculateStats(studentId, updatedRecords);
      }
    } catch (error) {
      set({
        error: error.message || '출석 기록 삭제에 실패했습니다.',
        loading: false
      });
      throw error;
    }
  },

  /**
   * 출석 통계 계산
   * @param {string} studentId - 학생 ID
   * @param {Array} records - 출석 기록 배열 (선택)
   */
  calculateStats: (studentId, records = null) => {
    const recordsToUse = records || get().studentRecords[studentId] || [];

    const rate = calculateAttendanceRate(recordsToUse);
    const total = recordsToUse.length;
    const present = recordsToUse.filter(r => r.status === 'present').length;
    const absent = recordsToUse.filter(r => r.status === 'absent').length;
    const late = recordsToUse.filter(r => r.status === 'late').length;
    const makeup = recordsToUse.filter(r => r.status === 'makeup').length;

    set((state) => ({
      stats: {
        ...state.stats,
        [studentId]: {
          rate,
          total,
          present,
          absent,
          late,
          makeup
        }
      }
    }));
  },

  /**
   * 월별 출석 통계 조회
   * @param {string} studentId - 학생 ID
   * @param {number} year - 연도
   * @param {number} month - 월 (1-12)
   * @returns {Object} 월별 통계
   */
  getMonthlyStats: (studentId, year, month) => {
    const records = get().studentRecords[studentId] || [];
    return getMonthlyStats(records, year, month);
  },

  /**
   * 특정 학생의 통계 조회
   * @param {string} studentId - 학생 ID
   * @returns {Object} 통계 객체
   */
  getStats: (studentId) => {
    return get().stats[studentId] || {
      rate: 0,
      total: 0,
      present: 0,
      absent: 0,
      late: 0,
      makeup: 0
    };
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
      records: [],
      studentRecords: {},
      stats: {},
      loading: false,
      error: null,
      lastFetched: null
    });
  },
}));
