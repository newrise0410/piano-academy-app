// src/config/dataConfig.js
// 데이터 소스 설정 (Mock vs API)

/**
 * 데이터 소스 모드 설정
 *
 * - 'mock': Mock 데이터 사용 (개발 중)
 * - 'api': REST API 사용 (외부 서버)
 * - 'firebase': Firebase 사용 (Firebase 백엔드)
 *
 * 개발 중에는 'mock' 모드로 설정하여 빠른 개발이 가능하며,
 * Firebase가 설정되면 이 값을 'firebase'로 변경하기만 하면 됩니다.
 *
 * 환경변수를 통해 설정 가능: EXPO_PUBLIC_DATA_MODE
 */
export const DATA_SOURCE_MODE = process.env.EXPO_PUBLIC_DATA_MODE || 'mock'; // 'mock', 'api', or 'firebase'

/**
 * Mock 모드인지 확인
 */
export const isMockMode = () => DATA_SOURCE_MODE === 'mock';

/**
 * API 모드인지 확인
 */
export const isApiMode = () => DATA_SOURCE_MODE === 'api';

/**
 * Firebase 모드인지 확인
 */
export const isFirebaseMode = () => DATA_SOURCE_MODE === 'firebase';

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
  isFirebaseMode,
  DEV_CONFIG,
};
