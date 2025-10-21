// src/utils/styleHelpers.js
import TEACHER_COLORS from '../styles/teacher_colors';

/**
 * 레벨별 색상 반환
 * @param {string} level - 학생 레벨 ('초급', '중급', '고급')
 * @returns {Object} { bg, text } - 배경색과 텍스트 색상
 */
export const getLevelColors = (level) => {
  switch (level) {
    case '초급':
      return { bg: TEACHER_COLORS.blue[50], text: TEACHER_COLORS.blue[600] };
    case '중급':
      return { bg: TEACHER_COLORS.purple[50], text: TEACHER_COLORS.primary[600] };
    case '고급':
      return { bg: TEACHER_COLORS.orange[50], text: TEACHER_COLORS.orange[600] };
    default:
      return { bg: TEACHER_COLORS.gray[50], text: TEACHER_COLORS.gray[600] };
  }
};

/**
 * 출석 상태별 색상 반환
 * @param {string} status - 출석 상태 ('present', 'absent', 'late', null)
 * @returns {Object} { bg, border, borderWidth } - 배경색, 테두리 색상, 테두리 굵기
 */
export const getAttendanceStatusColors = (status) => {
  const isUnchecked = status === null;

  return {
    bg: status === 'present' ? TEACHER_COLORS.green[50] :
        status === 'absent' ? TEACHER_COLORS.red[50] :
        status === 'late' ? TEACHER_COLORS.orange[50] :
        isUnchecked ? '#FEFCE8' :
        TEACHER_COLORS.white,
    border: isUnchecked ? '#EAB308' : TEACHER_COLORS.gray[200],
    borderWidth: isUnchecked ? 2 : 1,
  };
};

/**
 * 결제 상태별 색상 반환
 * @param {string} status - 결제 상태 ('paid', 'unpaid', 'pending')
 * @returns {Object} { bg, text } - 배경색과 텍스트 색상
 */
export const getPaymentStatusColors = (status) => {
  switch (status) {
    case 'paid':
      return { bg: TEACHER_COLORS.green[50], text: TEACHER_COLORS.green[600] };
    case 'unpaid':
      return { bg: TEACHER_COLORS.red[50], text: TEACHER_COLORS.red[600] };
    case 'pending':
      return { bg: TEACHER_COLORS.orange[50], text: TEACHER_COLORS.orange[600] };
    default:
      return { bg: TEACHER_COLORS.gray[50], text: TEACHER_COLORS.gray[600] };
  }
};

/**
 * 카테고리별 색상 반환
 * @param {string} category - 학생 카테고리 ('초등', '중등', '고등', '성인')
 * @returns {Object} { bg, text } - 배경색과 텍스트 색상
 */
export const getCategoryColors = (category) => {
  switch (category) {
    case '초등':
      return { bg: TEACHER_COLORS.blue[50], text: TEACHER_COLORS.blue[600] };
    case '중등':
      return { bg: TEACHER_COLORS.purple[50], text: TEACHER_COLORS.purple[600] };
    case '고등':
      return { bg: TEACHER_COLORS.orange[50], text: TEACHER_COLORS.orange[600] };
    case '성인':
      return { bg: TEACHER_COLORS.gray[100], text: TEACHER_COLORS.gray[700] };
    default:
      return { bg: TEACHER_COLORS.gray[50], text: TEACHER_COLORS.gray[600] };
  }
};

/**
 * 긴급도별 색상 반환
 * @param {string} urgency - 긴급도 ('high', 'medium', 'low')
 * @returns {Object} { bg, text, border } - 배경색, 텍스트 색상, 테두리 색상
 */
export const getUrgencyColors = (urgency) => {
  switch (urgency) {
    case 'high':
      return {
        bg: TEACHER_COLORS.red[50],
        text: TEACHER_COLORS.red[600],
        border: TEACHER_COLORS.red[200],
      };
    case 'medium':
      return {
        bg: TEACHER_COLORS.orange[50],
        text: TEACHER_COLORS.orange[600],
        border: TEACHER_COLORS.orange[200],
      };
    case 'low':
      return {
        bg: TEACHER_COLORS.blue[50],
        text: TEACHER_COLORS.blue[600],
        border: TEACHER_COLORS.blue[200],
      };
    default:
      return {
        bg: TEACHER_COLORS.gray[50],
        text: TEACHER_COLORS.gray[600],
        border: TEACHER_COLORS.gray[200],
      };
  }
};

/**
 * 수강권 색상 반환
 * @param {Object} student - 학생 정보 ({ ticketType, ticketCount })
 * @returns {string} 색상 코드
 */
export const getTicketColor = (student) => {
  if (student.ticketType === 'count') {
    const count = student.ticketCount || 0;
    if (count >= 8) return '#10B981'; // green
    if (count >= 4) return '#3B82F6'; // blue
    if (count >= 2) return '#F59E0B'; // orange
    return '#EF4444'; // red
  }
  return '#8B5CF6'; // purple - 기간권
};

/**
 * 출석률 색상 반환
 * @param {string|number} attendance - 출석률 ('95%' 또는 95)
 * @returns {string} 색상 코드
 */
export const getAttendanceColor = (attendance) => {
  const rate = typeof attendance === 'string' ? parseInt(attendance) : attendance;
  if (rate >= 95) return '#10B981'; // green
  if (rate >= 85) return '#3B82F6'; // blue
  if (rate >= 75) return '#F59E0B'; // orange
  return '#EF4444'; // red
};
