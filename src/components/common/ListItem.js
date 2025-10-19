// src/components/common/ListItem.js
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from './Text';

export default function ListItem({
  icon,
  iconColor,
  iconBackgroundColor,
  title,
  subtitle,
  rightText,
  rightIcon = 'chevron-forward',
  badge,
  badgeColor,
  onPress,
  isLast = false,
  className = ''
}) {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      className={`flex-row items-center py-3 ${!isLast && 'border-b border-gray-100'} ${className}`}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {icon && (
        <View
          className="w-10 h-10 rounded-xl items-center justify-center mr-3"
          style={{ backgroundColor: iconBackgroundColor || `${iconColor}20` }}
        >
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
      )}

      <View className="flex-1">
        <View className="flex-row items-center mb-0.5">
          {badge && (
            <View
              className="px-1.5 py-0.5 rounded mr-1.5"
              style={{ backgroundColor: badgeColor }}
            >
              <Text className="text-white text-xs font-bold">{badge}</Text>
            </View>
          )}
          <Text className="text-gray-800 font-semibold text-sm flex-1" numberOfLines={1}>
            {title}
          </Text>
        </View>
        {subtitle && (
          <Text className="text-gray-600 text-xs" numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>

      {rightText && (
        <Text className="text-gray-500 text-sm mr-2">{rightText}</Text>
      )}

      {rightIcon && onPress && (
        <Ionicons name={rightIcon} size={18} color="#D1D5DB" />
      )}
    </Container>
  );
}
