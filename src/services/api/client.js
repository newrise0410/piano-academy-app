// src/services/api/client.js
// API 클라이언트 설정 및 인터셉터

import axios from 'axios';
import { getAuthToken } from '../storage/AsyncStorage';

// API 베이스 URL (환경에 따라 변경 가능)
const getBaseURL = () => {
  // 개발 환경
  if (__DEV__) {
    return 'http://localhost:3000/api/v1';
  }
  // 프로덕션 환경
  return 'https://api.piano-academy.com/v1';
};

// Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 인증 토큰 자동 추가
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Failed to get auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리
apiClient.interceptors.response.use(
  (response) => {
    // 성공 응답 그대로 반환
    return response;
  },
  (error) => {
    // 에러 처리
    if (error.response) {
      // 서버에서 응답을 받았지만 에러 상태 코드
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // 인증 만료 또는 실패
          console.error('Authentication failed');
          // TODO: 로그아웃 처리 또는 토큰 갱신
          break;

        case 403:
          // 권한 없음
          console.error('Permission denied');
          break;

        case 404:
          // 리소스 없음
          console.error('Resource not found');
          break;

        case 500:
          // 서버 에러
          console.error('Server error');
          break;

        default:
          console.error('API Error:', status, data);
      }

      // 에러 메시지를 포함한 객체로 변환
      const errorMessage = data?.message || error.message || 'An error occurred';
      return Promise.reject(new Error(errorMessage));
    } else if (error.request) {
      // 요청은 보냈지만 응답을 받지 못함 (네트워크 에러)
      console.error('Network Error:', error.message);
      return Promise.reject(new Error('네트워크 연결을 확인해주세요'));
    } else {
      // 요청 설정 중 에러 발생
      console.error('Request Error:', error.message);
      return Promise.reject(error);
    }
  }
);

export default apiClient;
