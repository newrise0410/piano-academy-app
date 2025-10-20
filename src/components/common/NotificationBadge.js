import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from './Text';

/**
 * NotificationBadge - 알림 아이콘 + 배지 컴포넌트
 *
 * @param {number} count - 읽지 않은 알림 수
 * @param {function} onPress - 클릭 핸들러
 * @param {string} iconColor - 아이콘 색상 (기본: white)
 * @param {number} size - 아이콘 크기 (기본: 24)
 */
export default function NotificationBadge({
  count = 0,
  onPress,
  iconColor = 'white',
  size = 24
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="relative"
    >
      <Ionicons
        name={count > 0 ? "notifications" : "notifications-outline"}
        size={size}
        color={iconColor}
      />
      {count > 0 && (
        <View
          className="absolute -top-1 -right-1 rounded-full items-center justify-center min-w-[18px] h-[18px] px-1"
          style={{ backgroundColor: '#EF4444' }}
        >
          <Text className="text-white text-[10px] font-bold">
            {count > 99 ? '99+' : count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
