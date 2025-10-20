// src/utils/formatters.js
// 포맷팅 관련 유틸리티 함수

/**
 * 통화 포맷 (예: 150000 → "150,000원")
 * @param {number} amount - 금액
 * @param {boolean} includeUnit - 단위 포함 여부 (기본값: true)
 * @returns {string} 포맷된 금액 문자열
 */
export const formatCurrency = (amount, includeUnit = true) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return includeUnit ? '0원' : '0';
  }
  const formatted = Number(amount).toLocaleString('ko-KR');
  return includeUnit ? `${formatted}원` : formatted;
};

/**
 * 숫자 포맷 (예: 1000 → "1,000")
 * @param {number} num - 숫자
 * @returns {string} 포맷된 숫자 문자열
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined || isNaN(num)) {
    return '0';
  }
  return Number(num).toLocaleString('ko-KR');
};

/**
 * 퍼센트 포맷 (예: 0.95 → "95%", 85 → "85%")
 * @param {number} value - 퍼센트 값 (0-1 또는 0-100)
 * @param {number} decimals - 소수점 자리수 (기본값: 0)
 * @returns {string} 포맷된 퍼센트 문자열
 */
export const formatPercent = (value, decimals = 0) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }
  // 0-1 범위면 100을 곱함
  const percent = value <= 1 ? value * 100 : value;
  return `${percent.toFixed(decimals)}%`;
};

/**
 * 전화번호 포맷 (예: 01012345678 → "010-1234-5678")
 * @param {string} phone - 전화번호 문자열
 * @returns {string} 포맷된 전화번호
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';

  // 숫자만 추출
  const cleaned = phone.replace(/\D/g, '');

  // 010-1234-5678 형식
  const match = cleaned.match(/^(\d{3})(\d{4})(\d{4})$/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }

  // 02-1234-5678 형식 (서울 지역번호)
  const match2 = cleaned.match(/^(\d{2})(\d{3,4})(\d{4})$/);
  if (match2) {
    return `${match2[1]}-${match2[2]}-${match2[3]}`;
  }

  return phone;
};

/**
 * 수강권 표시 포맷
 * @param {Object} student - 학생 객체
 * @param {string} student.ticketType - 수강권 타입 ('count' | 'period')
 * @param {number} student.ticketCount - 남은 회차 (회차권인 경우)
 * @param {Object} student.ticketPeriod - 기간 정보 (기간권인 경우)
 * @returns {string} 포맷된 수강권 정보
 */
export const formatTicketDisplay = (student) => {
  if (!student) return '-';

  if (student.ticketType === 'count') {
    const count = student.ticketCount || 0;
    return `${count}회 남음`;
  } else if (student.ticketType === 'period' && student.ticketPeriod) {
    return `${student.ticketPeriod.start} ~ ${student.ticketPeriod.end}`;
  }

  return '-';
};

/**
 * 숫자를 한글로 변환 (예: 1 → "일", 2 → "이")
 * @param {number} num - 숫자 (1-10)
 * @returns {string} 한글 숫자
 */
export const numberToKorean = (num) => {
  const korean = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구', '십'];
  if (num < 1 || num > 10) return String(num);
  return korean[num];
};

/**
 * 파일 크기 포맷 (예: 1024 → "1 KB", 1048576 → "1 MB")
 * @param {number} bytes - 바이트 크기
 * @returns {string} 포맷된 파일 크기
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * 시간 포맷 (예: "14:30" → "오후 2:30")
 * @param {string} time - HH:MM 형식의 시간
 * @returns {string} 포맷된 시간
 */
export const formatTime = (time) => {
  if (!time) return '';

  const [hours, minutes] = time.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return time;

  const period = hours >= 12 ? '오후' : '오전';
  const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);

  return `${period} ${displayHours}:${String(minutes).padStart(2, '0')}`;
};

/**
 * 카드 번호 마스킹 (예: "1234567812345678" → "1234-****-****-5678")
 * @param {string} cardNumber - 카드 번호
 * @returns {string} 마스킹된 카드 번호
 */
export const maskCardNumber = (cardNumber) => {
  if (!cardNumber) return '';

  const cleaned = cardNumber.replace(/\D/g, '');
  if (cleaned.length !== 16) return cardNumber;

  return `${cleaned.slice(0, 4)}-****-****-${cleaned.slice(12)}`;
};
