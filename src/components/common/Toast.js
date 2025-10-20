// src/components/common/Toast.js
import React, { useEffect, useRef } from 'react';
import { View, Animated, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from './Text';

/**
 * Toast 컴포넌트
 *
 * Props:
 * - id: Toast ID
 * - message: 메시지
 * - type: 'success' | 'error' | 'warning' | 'info'
 * - onDismiss: 닫기 콜백
 */
export default function Toast({ id, message, type = 'info', onDismiss }) {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // 타입별 설정
  const config = {
    success: {
      icon: 'checkmark-circle',
      bgColor: '#10B981',
      textColor: '#FFFFFF'
    },
    error: {
      icon: 'close-circle',
      bgColor: '#EF4444',
      textColor: '#FFFFFF'
    },
    warning: {
      icon: 'warning',
      bgColor: '#F59E0B',
      textColor: '#FFFFFF'
    },
    info: {
      icon: 'information-circle',
      bgColor: '#3B82F6',
      textColor: '#FFFFFF'
    }
  };

  const currentConfig = config[type] || config.info;

  // 등장 애니메이션
  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  // 퇴장 애니메이션
  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      })
    ]).start(() => {
      if (onDismiss) {
        onDismiss(id);
      }
    });
  };

  return (
    <Animated.View
      style={{
        transform: [{ translateY: slideAnim }],
        opacity: opacityAnim,
        marginBottom: 8,
        ...Platform.select({
          ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
          },
          android: {
            elevation: 5,
          },
        }),
      }}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleDismiss}
        className="mx-4 rounded-xl overflow-hidden"
        style={{ backgroundColor: currentConfig.bgColor }}
      >
        <View className="flex-row items-center px-4 py-3">
          {/* 아이콘 */}
          <Ionicons
            name={currentConfig.icon}
            size={24}
            color={currentConfig.textColor}
            style={{ marginRight: 12 }}
          />

          {/* 메시지 */}
          <Text
            className="flex-1 text-sm font-medium"
            style={{ color: currentConfig.textColor }}
            numberOfLines={2}
          >
            {message}
          </Text>

          {/* 닫기 버튼 */}
          <TouchableOpacity
            onPress={handleDismiss}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            className="ml-2"
          >
            <Ionicons
              name="close"
              size={20}
              color={currentConfig.textColor}
              style={{ opacity: 0.8 }}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
