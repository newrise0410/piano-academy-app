// src/utils/dateHelpers.js

/**
 * 날짜를 'YYYY-MM-DD' 형식으로 포맷팅
 * @param {Date|string} date - 날짜 객체 또는 문자열
 * @returns {string} 'YYYY-MM-DD' 형식의 날짜 문자열
 */
export const formatDateToYYYYMMDD = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 날짜를 '2025년 1월 15일 (수)' 형식으로 포맷팅
 * @param {Date|string} date - 날짜 객체 또는 문자열
 * @returns {string} 포맷팅된 날짜 문자열
 */
export const formatDateToKorean = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekDay = getDayOfWeek(d);
  return `${year}년 ${month}월 ${day}일 (${weekDay})`;
};

/**
 * 날짜를 '1월 15일' 형식으로 포맷팅
 * @param {Date|string} date - 날짜 객체 또는 문자열
 * @returns {string} 포맷팅된 날짜 문자열
 */
export const formatDateToShortKorean = (date) => {
  const d = new Date(date);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  return `${month}월 ${day}일`;
};

/**
 * 요일 반환 (한글)
 * @param {Date|string} date - 날짜 객체 또는 문자열
 * @returns {string} 요일 ('월', '화', ...)
 */
export const getDayOfWeek = (date) => {
  const d = new Date(date);
  const dayMap = ['일', '월', '화', '수', '목', '금', '토'];
  return dayMap[d.getDay()];
};

/**
 * 월 이름 반환 (한글)
 * @param {number} monthIndex - 월 인덱스 (0-11)
 * @returns {string} 월 이름 ('1월', '2월', ...)
 */
export const getMonthName = (monthIndex) => {
  return `${monthIndex + 1}월`;
};

/**
 * 두 날짜 사이의 일수 계산
 * @param {Date|string} startDate - 시작 날짜
 * @param {Date|string} endDate - 종료 날짜
 * @returns {number} 일수
 */
export const getDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * 오늘 날짜 여부 확인
 * @param {Date|string} date - 확인할 날짜
 * @returns {boolean} 오늘이면 true
 */
export const isToday = (date) => {
  const d = new Date(date);
  const today = new Date();
  return d.toDateString() === today.toDateString();
};

/**
 * 과거 날짜 여부 확인
 * @param {Date|string} date - 확인할 날짜
 * @returns {boolean} 과거면 true
 */
export const isPast = (date) => {
  const d = new Date(date);
  const today = new Date();
  d.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return d < today;
};

/**
 * 미래 날짜 여부 확인
 * @param {Date|string} date - 확인할 날짜
 * @returns {boolean} 미래면 true
 */
export const isFuture = (date) => {
  const d = new Date(date);
  const today = new Date();
  d.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return d > today;
};

/**
 * N일 후 날짜 반환
 * @param {number} days - 일수
 * @param {Date|string} fromDate - 기준 날짜 (기본값: 오늘)
 * @returns {Date} N일 후 날짜
 */
export const addDays = (days, fromDate = new Date()) => {
  const date = new Date(fromDate);
  date.setDate(date.getDate() + days);
  return date;
};

/**
 * 날짜 비교 (정렬용)
 * @param {Date|string} dateA - 날짜 A
 * @param {Date|string} dateB - 날짜 B
 * @returns {number} -1, 0, 1
 */
export const compareDates = (dateA, dateB) => {
  const a = new Date(dateA);
  const b = new Date(dateB);
  return a - b;
};

/**
 * 날짜 배열을 최신순으로 정렬
 * @param {Array} dates - 날짜 배열
 * @returns {Array} 정렬된 날짜 배열
 */
export const sortDatesByNewest = (dates) => {
  return [...dates].sort((a, b) => new Date(b) - new Date(a));
};

/**
 * 날짜 배열을 오래된순으로 정렬
 * @param {Array} dates - 날짜 배열
 * @returns {Array} 정렬된 날짜 배열
 */
export const sortDatesByOldest = (dates) => {
  return [...dates].sort((a, b) => new Date(a) - new Date(b));
};
