// src/components/common/StatBox.js
import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from './Text';

export default function StatBox({
  number,
  label,
  variant = 'default',
  icon,
  backgroundColor,
  textColor,
  iconColor
}) {
  const variants = {
    default: { bg: 'bg-gray-100', text: 'text-primary' },
    warning: { bg: 'bg-warning-50', text: 'text-warning-600' },
    success: { bg: 'bg-success-50', text: 'text-success-600' },
  };

  const { bg, text } = variants[variant];

  return (
    <View
      className={`rounded-xl p-3 items-center ${backgroundColor ? '' : bg}`}
      style={backgroundColor ? { backgroundColor } : {}}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={20}
          color={iconColor || textColor}
          className="mb-1"
        />
      )}
      <Text
        className={`text-xs font-semibold mb-1 ${textColor ? '' : 'text-gray-600'}`}
        style={textColor ? { color: textColor } : {}}
      >
        {label}
      </Text>
      <Text
        className={`text-xl font-bold ${textColor ? '' : text}`}
        style={textColor ? { color: textColor } : {}}
      >
        {number}
      </Text>
    </View>
  );
}