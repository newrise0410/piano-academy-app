// src/components/common/ToastContainer.js
import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from './Toast';
import { useToastStore } from '../../store/toastStore';

/**
 * ToastContainer 컴포넌트
 *
 * 앱 전체에서 Toast를 표시하는 컨테이너
 * App.js에 한 번만 추가하면 됩니다.
 *
 * 사용법:
 * <ToastContainer />
 */
export default function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);
  const insets = useSafeAreaInsets();

  // Toast가 없으면 렌더링하지 않음
  if (toasts.length === 0) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        {
          top: Platform.OS === 'ios' ? insets.top + 10 : insets.top + 20,
        }
      ]}
      pointerEvents="box-none" // Toast만 터치 가능, 배경은 터치 이벤트 통과
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onDismiss={removeToast}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 9999, // 최상위에 표시
    alignItems: 'stretch',
  }
});
