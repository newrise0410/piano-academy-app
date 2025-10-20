// src/utils/paymentUtils.js
// 결제 및 수강권 관련 유틸리티 함수

import { getDaysBetween } from './dateUtils';

/**
 * 일할계산: 월 중간 가입 시 금액 계산
 * @param {string|Date} startDate - 시작일 (YYYY-MM-DD)
 * @param {string|Date} endDate - 종료일 (YYYY-MM-DD)
 * @param {number} totalAmount - 월 총 금액
 * @returns {number} 일할계산된 금액
 */
export const calculateProration = (startDate, endDate, totalAmount) => {
  const daysInMonth = 30; // 기준일 (일반적으로 30일 기준)
  const actualDays = getDaysBetween(startDate, endDate);

  const proratedAmount = Math.round((totalAmount * actualDays) / daysInMonth);
  return proratedAmount;
};

/**
 * 수강권 만료까지 남은 일수 계산
 * @param {string|Date} endDate - 만료일
 * @returns {number} 남은 일수 (0 이상)
 */
export const getDaysUntilExpiry = (endDate) => {
  const end = new Date(endDate);
  const today = new Date();

  // 시간을 제거하고 날짜만 비교
  end.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
};

/**
 * 회차권 진행률 계산
 * @param {number} used - 사용한 회차
 * @param {number} total - 총 회차
 * @returns {number} 진행률 (0-100)
 */
export const getTicketProgress = (used, total) => {
  if (!total || total === 0) return 0;
  const progress = (used / total) * 100;
  return Math.min(100, Math.max(0, Math.round(progress)));
};

/**
 * 기간권 진행률 계산
 * @param {string|Date} startDate - 시작일
 * @param {string|Date} endDate - 종료일
 * @returns {number} 진행률 (0-100)
 */
export const getPeriodProgress = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();

  // 시간을 제거
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  const daysUsed = Math.ceil((today - start) / (1000 * 60 * 60 * 24)) + 1;

  const progress = (daysUsed / totalDays) * 100;
  return Math.min(100, Math.max(0, Math.round(progress)));
};

/**
 * 회당 가격 계산
 * @param {number} totalAmount - 총 금액
 * @param {number} sessions - 총 회차
 * @returns {number} 회당 가격
 */
export const calculatePricePerClass = (totalAmount, sessions) => {
  if (!sessions || sessions === 0) return 0;
  return Math.round(totalAmount / sessions);
};

/**
 * 수강권 상태 계산
 * @param {Object} ticket - 수강권 정보
 * @param {string} ticket.ticketType - 수강권 타입 ('count' | 'period')
 * @param {number} ticket.ticketCount - 남은 회차 (회차권인 경우)
 * @param {string} ticket.endDate - 종료일 (기간권인 경우)
 * @returns {Object} { status: 'normal' | 'warning' | 'critical' | 'expired', message: string }
 */
export const getTicketStatus = (ticket) => {
  if (!ticket) {
    return { status: 'expired', message: '수강권 없음' };
  }

  if (ticket.ticketType === 'count') {
    const count = ticket.ticketCount || 0;

    if (count === 0) {
      return { status: 'expired', message: '수강권 만료' };
    } else if (count === 1) {
      return { status: 'critical', message: '1회 남음' };
    } else if (count <= 2) {
      return { status: 'warning', message: `${count}회 남음` };
    } else {
      return { status: 'normal', message: `${count}회 남음` };
    }
  } else if (ticket.ticketType === 'period') {
    const daysLeft = getDaysUntilExpiry(ticket.endDate);

    if (daysLeft === 0) {
      return { status: 'expired', message: '수강권 만료' };
    } else if (daysLeft <= 3) {
      return { status: 'critical', message: `D-${daysLeft}` };
    } else if (daysLeft <= 7) {
      return { status: 'warning', message: `D-${daysLeft}` };
    } else {
      return { status: 'normal', message: `D-${daysLeft}` };
    }
  }

  return { status: 'normal', message: '-' };
};

/**
 * 할인 금액 계산
 * @param {number} originalPrice - 원가
 * @param {number} discountPercent - 할인율 (0-100)
 * @returns {Object} { discountedPrice: number, discountAmount: number }
 */
export const calculateDiscount = (originalPrice, discountPercent) => {
  const discountAmount = Math.round(originalPrice * (discountPercent / 100));
  const discountedPrice = originalPrice - discountAmount;

  return {
    discountedPrice,
    discountAmount
  };
};

/**
 * 수강권 타입별 권장 가격 계산
 * @param {string} ticketType - 수강권 타입 ('count4', 'count8', 'count12', 'period1', 'period3', 'period6')
 * @param {number} basePrice - 기본 가격 (4회권 기준)
 * @returns {number} 권장 가격
 */
export const getRecommendedPrice = (ticketType, basePrice = 150000) => {
  const priceMap = {
    count4: basePrice,
    count8: basePrice * 1.87,      // 약 7% 할인
    count12: basePrice * 2.67,     // 약 11% 할인
    period1: basePrice * 1.33,     // 약간 프리미엄
    period3: basePrice * 3.67,     // 약 8% 할인
    period6: basePrice * 6.67,     // 약 17% 할인
  };

  return Math.round(priceMap[ticketType] || basePrice);
};

/**
 * 월별 예상 수입 계산
 * @param {Array} students - 학생 목록
 * @param {number} avgPricePerStudent - 학생당 평균 가격
 * @returns {Object} { total: number, count: number, avgPrice: number }
 */
export const calculateMonthlyRevenue = (students, avgPricePerStudent = 150000) => {
  const paidStudents = students.filter(s => !s.unpaid);
  const total = paidStudents.length * avgPricePerStudent;

  return {
    total,
    count: paidStudents.length,
    avgPrice: avgPricePerStudent
  };
};
