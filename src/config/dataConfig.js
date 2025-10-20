// src/config/dataConfig.js
// 데이터 소스 설정 (Mock vs API)

/**
 * 데이터 소스 모드 설정
 *
 * - 'mock': Mock 데이터 사용 (개발 중)
 * - 'api': 실제 API 사용 (프로덕션)
 *
 * 개발 중에는 'mock' 모드로 설정하여 빠른 개발이 가능하며,
 * API 서버가 준비되면 이 값을 'api'로 변경하기만 하면 됩니다.
 */
export const DATA_SOURCE_MODE = 'mock'; // 'mock' or 'api'

/**
 * Mock 모드인지 확인
 */
export const isMockMode = () => DATA_SOURCE_MODE === 'mock';

/**
 * API 모드인지 확인
 */
export const isApiMode = () => DATA_SOURCE_MODE === 'api';

/**
 * 개발자 모드 설정
 */
export const DEV_CONFIG = {
  // API 에러를 콘솔에 로그
  logApiErrors: true,

  // Repository 호출을 콘솔에 로그
  logRepositoryCalls: __DEV__,

  // 네트워크 딜레이 시뮬레이션 (ms)
  // Mock 모드에서 실제 API처럼 딜레이를 추가하여 로딩 상태 테스트
  mockNetworkDelay: 500,
};

export default {
  DATA_SOURCE_MODE,
  isMockMode,
  isApiMode,
  DEV_CONFIG,
};
