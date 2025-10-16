// src/components/common/Button.js
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from './Text';

export default function Button({ 
  title, 
  onPress, 
  variant = 'primary',
  icon,
  iconRight = 'chevron-forward',
  className = ''
}) {
  const variants = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
  };

  return (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.7}
      className={`flex-row items-center justify-between ${variants[variant]} rounded-xl p-4 ${className}`}
    >
      <View className="flex-row items-center gap-3">
        {icon && <Ionicons name={icon} size={24} color="#FFFFFF" />}
        <Text className="text-white text-base font-semibold">{title}</Text>
      </View>
      {iconRight && <Ionicons name={iconRight} size={24} color="#FFFFFF" />}
    </TouchableOpacity>
  );
}