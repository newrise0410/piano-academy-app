// src/utils/statusHelpers.js

/**
 * 출석 상태를 한글로 변환
 * @param {string} status - 출석 상태 ('present', 'absent', 'late', null)
 * @returns {string} 한글 상태명
 */
export const getAttendanceStatusLabel = (status) => {
  switch (status) {
    case 'present':
      return '출석';
    case 'absent':
      return '결석';
    case 'late':
      return '지각';
    case null:
      return '미확인';
    default:
      return '알 수 없음';
  }
};

/**
 * 결제 상태를 한글로 변환
 * @param {string} status - 결제 상태 ('paid', 'unpaid', 'pending')
 * @returns {string} 한글 상태명
 */
export const getPaymentStatusLabel = (status) => {
  switch (status) {
    case 'paid':
      return '완료';
    case 'unpaid':
      return '미납';
    case 'pending':
      return '대기';
    default:
      return '알 수 없음';
  }
};

/**
 * 출석 상태 아이콘 반환
 * @param {string} status - 출석 상태
 * @returns {string} Ionicons 이름
 */
export const getAttendanceStatusIcon = (status) => {
  switch (status) {
    case 'present':
      return 'checkmark-circle';
    case 'absent':
      return 'close-circle';
    case 'late':
      return 'time';
    case null:
      return 'help-circle';
    default:
      return 'help-circle';
  }
};

/**
 * 수강권 타입을 한글로 변환
 * @param {string} ticketType - 수강권 타입 ('count', 'period')
 * @returns {string} 한글 타입명
 */
export const getTicketTypeLabel = (ticketType) => {
  switch (ticketType) {
    case 'count':
      return '회차권';
    case 'period':
      return '기간권';
    default:
      return '알 수 없음';
  }
};

/**
 * 알림 타입별 아이콘 반환
 * @param {string} type - 알림 타입 ('notice_sent', 'attendance_absent', 'payment_received', 'student_added')
 * @returns {string} Ionicons 이름
 */
export const getNotificationIcon = (type) => {
  switch (type) {
    case 'notice_sent':
      return 'notifications';
    case 'attendance_absent':
      return 'close-circle';
    case 'payment_received':
      return 'card';
    case 'student_added':
      return 'person-add';
    default:
      return 'information-circle';
  }
};

/**
 * 수강권 상태 계산 (정상/주의/미납)
 * @param {Object} student - 학생 정보
 * @returns {string} 'normal' | 'warning' | 'unpaid'
 */
export const getTicketStatus = (student) => {
  if (student.unpaid) return 'unpaid';

  if (student.ticketType === 'count') {
    if (student.ticketCount === 0) return 'unpaid';
    if (student.ticketCount === 1) return 'warning';
    return 'normal';
  }

  // period 타입인 경우 종료일 확인
  if (student.ticketType === 'period' && student.ticketPeriod?.end) {
    const endDate = new Date(student.ticketPeriod.end);
    const today = new Date();
    const daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

    if (daysRemaining < 0) return 'unpaid';
    if (daysRemaining <= 7) return 'warning';
    return 'normal';
  }

  return 'normal';
};

/**
 * 수강권 상태 라벨 반환
 * @param {string} status - 'normal' | 'warning' | 'unpaid'
 * @returns {string} 한글 라벨
 */
export const getTicketStatusLabel = (status) => {
  switch (status) {
    case 'normal':
      return '정상';
    case 'warning':
      return '주의';
    case 'unpaid':
      return '미납';
    default:
      return '알 수 없음';
  }
};
