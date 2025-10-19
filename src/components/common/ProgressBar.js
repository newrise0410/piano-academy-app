// src/components/common/ProgressBar.js
import React from 'react';
import { View } from 'react-native';
import Text from './Text';

export default function ProgressBar({
  progress = 0,
  height = 12,
  backgroundColor = '#E5E7EB',
  progressColor = '#8B5CF6',
  showLabel = false,
  label = '',
  className = ''
}) {
  return (
    <View className={className}>
      {showLabel && label && (
        <Text className="text-xs text-gray-600 mb-1">{label}</Text>
      )}
      <View
        className="w-full rounded-full overflow-hidden"
        style={{ height, backgroundColor }}
      >
        <View
          className="h-full rounded-full"
          style={{
            width: `${Math.min(Math.max(progress, 0), 100)}%`,
            backgroundColor: progressColor
          }}
        />
      </View>
    </View>
  );
}
