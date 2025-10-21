// src/components/teacher/PresetSelector.js
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TEACHER_COLORS from '../../styles/teacher_colors';

/**
 * AI 프리셋 선택기 컴포넌트
 *
 * @param {Object} props
 * @param {Array} props.presets - 프리셋 목록
 * @param {string} props.selectedId - 선택된 프리셋 ID
 * @param {Function} props.onSelect - 선택 핸들러
 * @param {string} props.title - 섹션 제목 (선택사항)
 */
export default function PresetSelector({ presets, selectedId, onSelect, title }) {
  return (
    <View className="mb-4">
      {title && (
        <Text className="text-sm font-semibold text-gray-700 mb-2">{title}</Text>
      )}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {presets.map((preset) => {
          const isSelected = preset.id === selectedId;
          return (
            <TouchableOpacity
              key={preset.id}
              onPress={() => onSelect(preset.id)}
              className={`rounded-xl px-4 py-3 flex-row items-center ${
                isSelected ? 'bg-primary' : 'bg-gray-100'
              }`}
              style={{
                borderWidth: isSelected ? 2 : 0,
                borderColor: isSelected ? TEACHER_COLORS.primary[600] : 'transparent',
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name={preset.icon || 'star'}
                size={18}
                color={isSelected ? 'white' : TEACHER_COLORS.gray[600]}
              />
              <Text
                className={`ml-2 text-sm font-semibold ${
                  isSelected ? 'text-white' : 'text-gray-700'
                }`}
              >
                {preset.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 선택된 프리셋 설명 */}
      {selectedId && (
        <View className="mt-2 bg-purple-50 rounded-lg p-3">
          <Text className="text-xs text-purple-700">
            {presets.find(p => p.id === selectedId)?.description}
          </Text>
        </View>
      )}
    </View>
  );
}
