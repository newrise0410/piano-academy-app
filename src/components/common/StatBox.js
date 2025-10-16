// src/components/common/StatBox.js
import React from 'react';
import { View } from 'react-native';
import Text from './Text';

export default function StatBox({ number, label, variant = 'default' }) {
  const variants = {
    default: { bg: 'bg-gray-100', text: 'text-primary' },
    warning: { bg: 'bg-warning-50', text: 'text-warning-600' },
    success: { bg: 'bg-success-50', text: 'text-success-600' },
  };

  const { bg, text } = variants[variant];

  return (
    <View className={`flex-1 ${bg} rounded-xl p-4 mx-1 items-center`}>
      <Text className={`text-2xl font-bold ${text} mb-1`}>{number}</Text>
      <Text className="text-xs text-gray-600 text-center">{label}</Text>
    </View>
  );
}