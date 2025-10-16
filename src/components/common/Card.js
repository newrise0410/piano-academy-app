// src/components/common/Card.js
import React from 'react';
import { View } from 'react-native';

export default function Card({ children, className = '' }) {
  return (
    <View className={`bg-white rounded-2xl p-5 shadow-sm ${className}`}>
      {children}
    </View>
  );
}