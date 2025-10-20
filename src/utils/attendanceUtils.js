// src/utils/attendanceUtils.js
// 출석 관련 유틸리티 함수

/**
 * 출석률 계산
 * @param {Array} records - 출석 기록 배열 [{ status: 'present' | 'absent' | 'late' | 'makeup' }]
 * @returns {number} 출석률 (0-100)
 */
export const calculateAttendanceRate = (records) => {
  if (!records || records.length === 0) return 0;

  const totalClasses = records.length;
  const attendedClasses = records.filter(
    r => r.status === 'present' || r.status === 'makeup'
  ).length;

  return Math.round((attendedClasses / totalClasses) * 100);
};

/**
 * 이번 달 출석 통계
 * @param {Array} records - 출석 기록 배열 [{ date: 'YYYY-MM-DD', status: 'present' | 'absent' | 'late' | 'makeup' }]
 * @param {number} year - 연도
 * @param {number} month - 월 (1-12)
 * @returns {Object} { total, present, absent, late, makeup, rate }
 */
export const getMonthlyStats = (records, year, month) => {
  if (!records || records.length === 0) {
    return {
      total: 0,
      present: 0,
      absent: 0,
      late: 0,
      makeup: 0,
      rate: 0
    };
  }

  const monthRecords = records.filter(r => {
    const date = new Date(r.date);
    return date.getFullYear() === year && date.getMonth() + 1 === month;
  });

  const stats = {
    total: monthRecords.length,
    present: monthRecords.filter(r => r.status === 'present').length,
    absent: monthRecords.filter(r => r.status === 'absent').length,
    late: monthRecords.filter(r => r.status === 'late').length,
    makeup: monthRecords.filter(r => r.status === 'makeup').length,
  };

  stats.rate = calculateAttendanceRate(monthRecords);

  return stats;
};

/**
 * 연속 출석 일수 계산
 * @param {Array} records - 출석 기록 배열 (날짜순 정렬 필요)
 * @returns {number} 연속 출석 일수
 */
export const getConsecutiveAttendance = (records) => {
  if (!records || records.length === 0) return 0;

  let consecutive = 0;

  // 최근 기록부터 역순으로 확인
  for (let i = records.length - 1; i >= 0; i--) {
    const record = records[i];
    if (record.status === 'present' || record.status === 'makeup') {
      consecutive++;
    } else if (record.status === 'absent') {
      break; // 결석이 나오면 중단
    }
    // late는 연속 출석에 포함 가능 (정책에 따라 조정)
  }

  return consecutive;
};

/**
 * 출석 상태별 색상 반환
 * @param {string} status - 출석 상태 ('present' | 'absent' | 'late' | 'makeup')
 * @param {Object} colors - 색상 객체 (TEACHER_COLORS 또는 PARENT_COLORS)
 * @returns {Object} { background: string, text: string }
 */
export const getAttendanceStatusColor = (status, colors) => {
  const colorMap = {
    present: {
      background: colors.success[50],
      text: colors.success[600],
      badge: colors.success.DEFAULT
    },
    absent: {
      background: colors.danger[50],
      text: colors.danger[600],
      badge: colors.danger.DEFAULT
    },
    late: {
      background: colors.warning[50],
      text: colors.warning[600],
      badge: colors.warning.DEFAULT
    },
    makeup: {
      background: colors.blue[50],
      text: colors.blue[600],
      badge: colors.blue[500]
    }
  };

  return colorMap[status] || {
    background: colors.gray[50],
    text: colors.gray[600],
    badge: colors.gray[500]
  };
};

/**
 * 출석 상태별 라벨 반환
 * @param {string} status - 출석 상태
 * @returns {string} 라벨
 */
export const getAttendanceStatusLabel = (status) => {
  const labelMap = {
    present: '출석',
    absent: '결석',
    late: '지각',
    makeup: '보강'
  };

  return labelMap[status] || '-';
};

/**
 * 출석 상태별 이모지 반환
 * @param {string} status - 출석 상태
 * @returns {string} 이모지
 */
export const getAttendanceStatusEmoji = (status) => {
  const emojiMap = {
    present: '✅',
    absent: '❌',
    late: '⏰',
    makeup: '🔄'
  };

  return emojiMap[status] || '➖';
};

/**
 * 주별 출석 통계
 * @param {Array} records - 출석 기록 배열
 * @param {Date|string} weekStartDate - 주 시작일 (월요일)
 * @returns {Object} 주별 통계
 */
export const getWeeklyStats = (records, weekStartDate) => {
  if (!records || records.length === 0) {
    return {
      total: 0,
      present: 0,
      absent: 0,
      late: 0,
      makeup: 0,
      rate: 0
    };
  }

  const startDate = new Date(weekStartDate);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6); // 일요일까지

  const weekRecords = records.filter(r => {
    const date = new Date(r.date);
    return date >= startDate && date <= endDate;
  });

  const stats = {
    total: weekRecords.length,
    present: weekRecords.filter(r => r.status === 'present').length,
    absent: weekRecords.filter(r => r.status === 'absent').length,
    late: weekRecords.filter(r => r.status === 'late').length,
    makeup: weekRecords.filter(r => r.status === 'makeup').length,
  };

  stats.rate = calculateAttendanceRate(weekRecords);

  return stats;
};

/**
 * 출석 등급 계산 (S, A, B, C, D)
 * @param {number} attendanceRate - 출석률 (0-100)
 * @returns {string} 등급
 */
export const getAttendanceGrade = (attendanceRate) => {
  if (attendanceRate >= 95) return 'S';
  if (attendanceRate >= 85) return 'A';
  if (attendanceRate >= 75) return 'B';
  if (attendanceRate >= 65) return 'C';
  return 'D';
};

/**
 * 결석 연속 일수 계산
 * @param {Array} records - 출석 기록 배열 (날짜순 정렬 필요)
 * @returns {number} 연속 결석 일수
 */
export const getConsecutiveAbsences = (records) => {
  if (!records || records.length === 0) return 0;

  let consecutive = 0;

  // 최근 기록부터 역순으로 확인
  for (let i = records.length - 1; i >= 0; i--) {
    const record = records[i];
    if (record.status === 'absent') {
      consecutive++;
    } else {
      break; // 출석/지각/보강이 나오면 중단
    }
  }

  return consecutive;
};

/**
 * 월별 출석 트렌드 계산 (최근 N개월)
 * @param {Array} records - 출석 기록 배열
 * @param {number} months - 분석할 개월 수
 * @returns {Array} [{ year, month, rate }]
 */
export const getAttendanceTrend = (records, months = 6) => {
  if (!records || records.length === 0) return [];

  const trend = [];
  const today = new Date();

  for (let i = 0; i < months; i++) {
    const targetDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth() + 1;

    const monthStats = getMonthlyStats(records, year, month);

    trend.unshift({
      year,
      month,
      rate: monthStats.rate,
      total: monthStats.total,
      present: monthStats.present
    });
  }

  return trend;
};
