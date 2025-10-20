// src/components/common/ErrorBoundary.js
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from './Text';

/**
 * Error Boundary 컴포넌트
 *
 * React 컴포넌트 트리에서 발생하는 에러를 catch하여
 * 앱 전체가 크래시되는 것을 방지합니다.
 *
 * 사용법:
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  /**
   * 에러가 발생했을 때 state 업데이트
   */
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  /**
   * 에러 정보 로깅
   * 향후 Sentry 등 에러 로깅 서비스와 연동 가능
   */
  componentDidCatch(error, errorInfo) {
    // 에러 정보 저장
    this.setState({
      error,
      errorInfo
    });

    // 개발 환경에서 콘솔에 로그
    if (__DEV__) {
      console.error('🚨 ErrorBoundary caught an error:', error);
      console.error('📍 Error Info:', errorInfo);
      console.error('📚 Component Stack:', errorInfo.componentStack);
    }

    // TODO: 프로덕션 환경에서 Sentry로 전송
    // if (!__DEV__) {
    //   Sentry.captureException(error, {
    //     contexts: {
    //       react: {
    //         componentStack: errorInfo.componentStack,
    //       },
    //     },
    //   });
    // }
  }

  /**
   * 에러 상태 초기화 (다시 시도)
   */
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // 에러 발생 시 표시할 UI
      return (
        <View className="flex-1 items-center justify-center px-6 bg-gray-50">
          {/* 에러 아이콘 */}
          <View
            className="w-24 h-24 rounded-full items-center justify-center mb-6"
            style={{ backgroundColor: '#FEF2F2' }}
          >
            <Ionicons name="warning" size={48} color="#EF4444" />
          </View>

          {/* 에러 메시지 */}
          <Text className="text-2xl font-bold text-gray-800 mb-3 text-center">
            문제가 발생했습니다
          </Text>

          <Text className="text-base text-gray-600 text-center mb-2 px-4">
            예상치 못한 오류가 발생했습니다.
          </Text>

          <Text className="text-sm text-gray-500 text-center mb-8 px-4">
            앱을 다시 시작하거나 계속 문제가 발생하면{'\n'}
            관리자에게 문의해주세요.
          </Text>

          {/* 개발 환경에서만 에러 상세 정보 표시 */}
          {__DEV__ && this.state.error && (
            <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 w-full max-w-md">
              <Text className="text-xs font-bold text-red-800 mb-2">
                개발 모드 - 에러 정보:
              </Text>
              <Text className="text-xs text-red-700 mb-1">
                {this.state.error.toString()}
              </Text>
              {this.state.errorInfo && (
                <Text className="text-xs text-red-600 mt-2" numberOfLines={5}>
                  {this.state.errorInfo.componentStack}
                </Text>
              )}
            </View>
          )}

          {/* 다시 시도 버튼 */}
          <TouchableOpacity
            className="rounded-xl py-4 px-8 items-center justify-center shadow-sm"
            style={{ backgroundColor: '#8B5CF6' }}
            onPress={this.handleReset}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center">
              <Ionicons name="refresh" size={20} color="white" style={{ marginRight: 8 }} />
              <Text className="text-white font-bold text-base">
                다시 시도
              </Text>
            </View>
          </TouchableOpacity>

          {/* 앱 재시작 안내 */}
          <Text className="text-xs text-gray-400 mt-6 text-center">
            문제가 계속되면 앱을 완전히 종료 후 다시 실행해주세요
          </Text>
        </View>
      );
    }

    // 에러가 없으면 자식 컴포넌트 렌더링
    return this.props.children;
  }
}

export default ErrorBoundary;
