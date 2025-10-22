// src/utils/academyUtils.js
// 학원 관리 유틸리티 함수

/**
 * 고유한 학원 코드 생성
 * 형식: 6자리 영문 대문자 + 숫자 조합 (예: A3B7K9)
 * @returns {string} 생성된 학원 코드
 */
export const generateAcademyCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }

  return code;
};

/**
 * 사업자등록번호 형식 검증
 * 형식: 000-00-00000 (숫자 10자리)
 * @param {string} businessNumber - 사업자등록번호
 * @returns {boolean} 유효 여부
 */
export const validateBusinessNumber = (businessNumber) => {
  if (!businessNumber) return false;

  // 하이픈 제거
  const cleaned = businessNumber.replace(/-/g, '');

  // 숫자 10자리인지 확인
  if (!/^\d{10}$/.test(cleaned)) {
    return false;
  }

  // 체크섬 검증 (사업자등록번호 검증 알고리즘)
  const checksum = [1, 3, 7, 1, 3, 7, 1, 3, 5];
  let sum = 0;

  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * checksum[i];
  }

  sum += Math.floor((parseInt(cleaned[8]) * 5) / 10);
  const checkDigit = (10 - (sum % 10)) % 10;

  return checkDigit === parseInt(cleaned[9]);
};

/**
 * 사업자등록번호 포맷팅 (000-00-00000)
 * @param {string} businessNumber - 사업자등록번호
 * @returns {string} 포맷팅된 사업자등록번호
 */
export const formatBusinessNumber = (businessNumber) => {
  if (!businessNumber) return '';

  // 숫자만 추출
  const cleaned = businessNumber.replace(/\D/g, '');

  // 최대 10자리까지만
  const limited = cleaned.substring(0, 10);

  // 포맷팅
  if (limited.length <= 3) {
    return limited;
  } else if (limited.length <= 5) {
    return `${limited.slice(0, 3)}-${limited.slice(3)}`;
  } else {
    return `${limited.slice(0, 3)}-${limited.slice(3, 5)}-${limited.slice(5)}`;
  }
};

/**
 * 학원 코드 포맷 검증
 * @param {string} code - 학원 코드
 * @returns {boolean} 유효 여부
 */
export const validateAcademyCode = (code) => {
  if (!code) return false;

  // 6자리 영문 대문자 + 숫자 조합
  return /^[A-Z0-9]{6}$/.test(code);
};
