// src/components/teacher/NoticeTemplateSelector.js
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../common';
import TEACHER_COLORS from '../../styles/teacher_colors';

/**
 * 알림장 템플릿 선택 컴포넌트
 *
 * @param {Array} templates - 템플릿 목록
 * @param {string} selectedTemplateId - 선택된 템플릿 ID
 * @param {function} onSelectTemplate - 템플릿 선택 콜백
 */
export default function NoticeTemplateSelector({
  templates,
  selectedTemplateId,
  onSelectTemplate,
}) {
  return (
    <View className="px-5 mb-4">
      <View className="flex-row items-center mb-3">
        <Ionicons name="bookmark" size={20} color={TEACHER_COLORS.primary.DEFAULT} />
        <Text className="text-base font-bold text-gray-800 ml-2">템플릿 선택</Text>
      </View>

      <View className="flex-row flex-wrap">
        {templates.map((template) => {
          const isSelected = selectedTemplateId === template.id;

          return (
            <TouchableOpacity
              key={template.id}
              className="mr-2 mb-2"
              onPress={() => onSelectTemplate(template)}
              activeOpacity={0.7}
            >
              <View
                className="rounded-2xl p-4 flex-row items-center"
                style={{
                  backgroundColor: isSelected ? template.color : TEACHER_COLORS.white,
                  borderWidth: isSelected ? 0 : 1,
                  borderColor: TEACHER_COLORS.gray[200],
                }}
              >
                <Text className="text-2xl mr-2">{template.emoji}</Text>
                <Text
                  className="text-sm font-bold"
                  style={{
                    color: isSelected ? TEACHER_COLORS.white : TEACHER_COLORS.gray[700],
                  }}
                >
                  {template.title}
                </Text>
                {isSelected && (
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={TEACHER_COLORS.white}
                    style={{ marginLeft: 4 }}
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
