// src/components/common/ActivityItem.js
import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from './Text';

export default function ActivityItem({ icon, iconColor, title, description, isLast }) {
  return (
    <View className={`flex-row items-center py-3 ${!isLast && 'border-b border-gray-100'}`}>
      <View 
        className="w-10 h-10 rounded-full justify-center items-center mr-3"
        style={{ backgroundColor: `${iconColor}20` }}
      >
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      
      <View className="flex-1">
        <Text className="text-sm font-semibold text-gray-800 mb-0.5">
          {title}
        </Text>
        <Text className="text-xs text-gray-500">{description}</Text>
      </View>
    </View>
  );
}