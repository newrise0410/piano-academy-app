// src/services/api/endpoints.js
// API 엔드포인트 상수 관리

export const ENDPOINTS = {
  // 인증
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    REFRESH_TOKEN: '/auth/refresh',
    VERIFY_TOKEN: '/auth/verify',
  },

  // 학생 관리
  STUDENTS: {
    LIST: '/students',
    DETAIL: (id) => `/students/${id}`,
    CREATE: '/students',
    UPDATE: (id) => `/students/${id}`,
    DELETE: (id) => `/students/${id}`,
  },

  // 출석 관리
  ATTENDANCE: {
    LIST: '/attendance',
    BY_STUDENT: (studentId) => `/attendance/student/${studentId}`,
    BY_DATE: (date) => `/attendance/date/${date}`,
    CREATE: '/attendance',
    UPDATE: (id) => `/attendance/${id}`,
    DELETE: (id) => `/attendance/${id}`,
    STATS: (studentId) => `/attendance/stats/${studentId}`,
  },

  // 알림장
  NOTICES: {
    LIST: '/notices',
    DETAIL: (id) => `/notices/${id}`,
    CREATE: '/notices',
    UPDATE: (id) => `/notices/${id}`,
    DELETE: (id) => `/notices/${id}`,
    CONFIRM: (id) => `/notices/${id}/confirm`,
  },

  // 수강료/결제
  PAYMENTS: {
    LIST: '/payments',
    BY_STUDENT: (studentId) => `/payments/student/${studentId}`,
    CREATE: '/payments',
    UPDATE: (id) => `/payments/${id}`,
    DELETE: (id) => `/payments/${id}`,
    STATS: '/payments/stats',
  },

  // 진도 관리
  PROGRESS: {
    BY_STUDENT: (studentId) => `/progress/student/${studentId}`,
    UPDATE: (studentId) => `/progress/student/${studentId}`,
    SONGS: (studentId) => `/progress/student/${studentId}/songs`,
    ADD_SONG: (studentId) => `/progress/student/${studentId}/songs`,
  },

  // 활동 기록
  ACTIVITIES: {
    LIST: '/activities',
    RECENT: '/activities/recent',
    BY_TYPE: (type) => `/activities/type/${type}`,
  },

  // 대시보드
  DASHBOARD: {
    TEACHER: '/dashboard/teacher',
    PARENT: (childId) => `/dashboard/parent/${childId}`,
    STATS: '/dashboard/stats',
  },
};

export default ENDPOINTS;
