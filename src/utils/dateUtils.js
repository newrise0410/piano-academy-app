// src/utils/dateUtils.js
// 날짜 관련 유틸리티 함수

/**
 * 날짜를 "YYYY.MM.DD" 형식으로 포맷
 * @param {Date|string} date - 날짜 객체 또는 문자열
 * @returns {string} YYYY.MM.DD 형식의 문자열
 */
export const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
};

/**
 * 날짜를 "MM월 DD일" 형식으로 포맷
 * @param {Date|string} date - 날짜 객체 또는 문자열
 * @returns {string} MM월 DD일 형식의 문자열
 */
export const formatDateKorean = (date) => {
  const d = new Date(date);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  return `${month}월 ${day}일`;
};

/**
 * 상대 시간 표시 ("방금 전", "2시간 전", "어제")
 * @param {Date|string} date - 날짜 객체 또는 문자열
 * @returns {string} 상대 시간 문자열
 */
export const getRelativeTime = (date) => {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now - target;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays === 1) return '어제';
  if (diffDays < 7) return `${diffDays}일 전`;
  return formatDate(date);
};

/**
 * 요일 가져오기
 * @param {Date|string} date - 날짜 객체 또는 문자열
 * @returns {string} 요일 ("월", "화", ...)
 */
export const getDayOfWeek = (date) => {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return days[new Date(date).getDay()];
};

/**
 * 특정 날짜까지 남은 일수 계산 (D-day)
 * @param {Date|string} endDate - 종료일
 * @returns {number} 남은 일수 (음수면 지난 날)
 */
export const getDaysRemaining = (endDate) => {
  const end = new Date(endDate);
  const today = new Date();
  // 시간을 제거하고 날짜만 비교
  end.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
  return diff;
};

/**
 * 월 이름 가져오기
 * @param {number} month - 월 (1-12)
 * @returns {string} 월 이름 ("1월", "2월", ...)
 */
export const getMonthName = (month) => {
  const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  return months[month - 1] || '';
};

/**
 * 오늘 날짜인지 확인
 * @param {Date|string} date - 날짜 객체 또는 문자열
 * @param {Date|string} compareDate - 비교할 날짜 (기본값: 오늘)
 * @returns {boolean} 같은 날짜면 true
 */
export const isSameDate = (date, compareDate = new Date()) => {
  const d1 = new Date(date);
  const d2 = new Date(compareDate);
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

/**
 * 날짜에 일수 추가
 * @param {Date|string} date - 기준 날짜
 * @param {number} days - 추가할 일수 (음수 가능)
 * @returns {Date} 새로운 날짜 객체
 */
export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * 두 날짜 사이의 일수 계산
 * @param {Date|string} startDate - 시작일
 * @param {Date|string} endDate - 종료일
 * @returns {number} 일수
 */
export const getDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
};

/**
 * 현재 날짜와 시간 가져오기
 * @returns {string} YYYY.MM.DD HH:MM 형식
 */
export const getCurrentDateTime = () => {
  const now = new Date();
  const date = formatDate(now);
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${date} ${hours}:${minutes}`;
};
