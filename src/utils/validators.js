// src/utils/validators.js
// 입력 검증 관련 유틸리티 함수

/**
 * 이름 유효성 검사 (2~10자, 한글만)
 * @param {string} name - 이름
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validateName = (name) => {
  if (!name || name.trim() === '') {
    return { isValid: false, message: '이름을 입력해주세요.' };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    return { isValid: false, message: '이름은 최소 2자 이상이어야 합니다.' };
  }

  if (trimmedName.length > 10) {
    return { isValid: false, message: '이름은 최대 10자까지 입력 가능합니다.' };
  }

  const koreanOnlyRegex = /^[가-힣]+$/;
  if (!koreanOnlyRegex.test(trimmedName)) {
    return { isValid: false, message: '이름은 한글만 입력 가능합니다.' };
  }

  return { isValid: true, message: '' };
};

/**
 * 전화번호 유효성 검사
 * @param {string} phone - 전화번호
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validatePhone = (phone) => {
  if (!phone || phone.trim() === '') {
    return { isValid: false, message: '전화번호를 입력해주세요.' };
  }

  // 숫자만 추출
  const cleaned = phone.replace(/\D/g, '');

  // 010, 011, 016, 017, 018, 019 형식 확인 (11자리)
  const mobileRegex = /^01[0-9]\d{7,8}$/;

  if (!mobileRegex.test(cleaned)) {
    return { isValid: false, message: '올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)' };
  }

  return { isValid: true, message: '' };
};

/**
 * 이메일 유효성 검사
 * @param {string} email - 이메일
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validateEmail = (email) => {
  if (!email || email.trim() === '') {
    return { isValid: false, message: '이메일을 입력해주세요.' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return { isValid: false, message: '올바른 이메일 형식이 아닙니다.' };
  }

  return { isValid: true, message: '' };
};

/**
 * 금액 유효성 검사 (0보다 큰 정수)
 * @param {number|string} amount - 금액
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validateAmount = (amount) => {
  if (amount === null || amount === undefined || amount === '') {
    return { isValid: false, message: '금액을 입력해주세요.' };
  }

  const numAmount = typeof amount === 'string' ? parseInt(amount.replace(/,/g, ''), 10) : amount;

  if (isNaN(numAmount)) {
    return { isValid: false, message: '올바른 금액을 입력해주세요.' };
  }

  if (!Number.isInteger(numAmount)) {
    return { isValid: false, message: '금액은 정수로 입력해주세요.' };
  }

  if (numAmount <= 0) {
    return { isValid: false, message: '금액은 0보다 커야 합니다.' };
  }

  if (numAmount > 100000000) { // 1억 제한
    return { isValid: false, message: '금액이 너무 큽니다.' };
  }

  return { isValid: true, message: '' };
};

/**
 * 날짜 유효성 검사
 * @param {string|Date} date - 날짜
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validateDate = (date) => {
  if (!date) {
    return { isValid: false, message: '날짜를 입력해주세요.' };
  }

  const parsedDate = new Date(date);

  if (isNaN(parsedDate.getTime())) {
    return { isValid: false, message: '올바른 날짜 형식이 아닙니다.' };
  }

  return { isValid: true, message: '' };
};

/**
 * 비밀번호 강도 검사
 * @param {string} password - 비밀번호
 * @returns {Object} { isValid: boolean, message: string, strength: 'weak' | 'medium' | 'strong' }
 */
export const validatePassword = (password) => {
  if (!password || password.trim() === '') {
    return { isValid: false, message: '비밀번호를 입력해주세요.', strength: 'weak' };
  }

  if (password.length < 8) {
    return { isValid: false, message: '비밀번호는 최소 8자 이상이어야 합니다.', strength: 'weak' };
  }

  // 강도 체크
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const criteriaCount = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;

  if (criteriaCount < 2) {
    return {
      isValid: false,
      message: '비밀번호는 영문 대소문자, 숫자, 특수문자 중 2가지 이상을 포함해야 합니다.',
      strength: 'weak'
    };
  }

  if (criteriaCount === 2) {
    return { isValid: true, message: '보통 강도의 비밀번호입니다.', strength: 'medium' };
  }

  return { isValid: true, message: '강력한 비밀번호입니다.', strength: 'strong' };
};

/**
 * 나이 유효성 검사
 * @param {number|string} age - 나이
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validateAge = (age) => {
  if (age === null || age === undefined || age === '') {
    return { isValid: false, message: '나이를 입력해주세요.' };
  }

  const numAge = typeof age === 'string' ? parseInt(age, 10) : age;

  if (isNaN(numAge)) {
    return { isValid: false, message: '올바른 나이를 입력해주세요.' };
  }

  if (numAge < 1 || numAge > 150) {
    return { isValid: false, message: '올바른 나이를 입력해주세요. (1-150)' };
  }

  return { isValid: true, message: '' };
};

/**
 * 수강권 회차 유효성 검사
 * @param {number|string} count - 회차 수
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validateTicketCount = (count) => {
  if (count === null || count === undefined || count === '') {
    return { isValid: false, message: '수강권 회차를 입력해주세요.' };
  }

  const numCount = typeof count === 'string' ? parseInt(count, 10) : count;

  if (isNaN(numCount)) {
    return { isValid: false, message: '올바른 회차를 입력해주세요.' };
  }

  if (!Number.isInteger(numCount)) {
    return { isValid: false, message: '회차는 정수로 입력해주세요.' };
  }

  if (numCount < 1) {
    return { isValid: false, message: '회차는 최소 1회 이상이어야 합니다.' };
  }

  if (numCount > 100) {
    return { isValid: false, message: '회차는 최대 100회까지 입력 가능합니다.' };
  }

  return { isValid: true, message: '' };
};

/**
 * 학생 폼 전체 유효성 검사
 * @param {Object} formData - 학생 폼 데이터
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export const validateStudentForm = (formData) => {
  const errors = {};

  // 이름 검사
  const nameValidation = validateName(formData.name);
  if (!nameValidation.isValid) {
    errors.name = nameValidation.message;
  }

  // 나이 검사 (선택사항)
  if (formData.age) {
    const ageValidation = validateAge(formData.age);
    if (!ageValidation.isValid) {
      errors.age = ageValidation.message;
    }
  }

  // 전화번호 검사 (선택사항)
  if (formData.phone) {
    const phoneValidation = validatePhone(formData.phone);
    if (!phoneValidation.isValid) {
      errors.phone = phoneValidation.message;
    }
  }

  // 학부모 전화번호 검사 (선택사항)
  if (formData.parentPhone) {
    const parentPhoneValidation = validatePhone(formData.parentPhone);
    if (!parentPhoneValidation.isValid) {
      errors.parentPhone = parentPhoneValidation.message;
    }
  }

  // 수강권 회차 검사 (회차권인 경우)
  if (formData.ticketType === 'count' && formData.ticketCount) {
    const ticketValidation = validateTicketCount(formData.ticketCount);
    if (!ticketValidation.isValid) {
      errors.ticketCount = ticketValidation.message;
    }
  }

  // 기간권 날짜 검사
  if (formData.ticketType === 'period') {
    if (formData.ticketPeriod?.start) {
      const startDateValidation = validateDate(formData.ticketPeriod.start);
      if (!startDateValidation.isValid) {
        errors.ticketPeriodStart = startDateValidation.message;
      }
    }

    if (formData.ticketPeriod?.end) {
      const endDateValidation = validateDate(formData.ticketPeriod.end);
      if (!endDateValidation.isValid) {
        errors.ticketPeriodEnd = endDateValidation.message;
      }
    }

    // 종료일이 시작일보다 빠른지 검사
    if (formData.ticketPeriod?.start && formData.ticketPeriod?.end) {
      const start = new Date(formData.ticketPeriod.start);
      const end = new Date(formData.ticketPeriod.end);

      if (end < start) {
        errors.ticketPeriodEnd = '종료일은 시작일 이후여야 합니다.';
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * 빈 값 검사
 * @param {any} value - 검사할 값
 * @returns {boolean} 비어있으면 true
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object' && Object.keys(value).length === 0) return true;
  return false;
};
