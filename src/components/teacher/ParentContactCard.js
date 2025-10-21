// src/components/teacher/ParentContactCard.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../styles/colors';

/**
 * 학부모 연락 필요 카드 컴포넌트
 *
 * @param {Object} props
 * @param {string} props.urgency - 'urgent' | 'important' | 'normal'
 * @param {Object} props.student - 학생 정보
 * @param {string} props.reason - 연락 사유
 * @param {string} props.type - 연락 타입
 * @param {Function} props.onGenerateMessage - AI 메시지 생성 핸들러
 * @param {Function} props.onCallParent - 전화 걸기 핸들러
 */
export default function ParentContactCard({
  urgency,
  student,
  reason,
  type,
  onGenerateMessage,
  onCallParent,
}) {
  // 긴급도별 색상 및 아이콘
  const urgencyConfig = {
    urgent: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700',
      badgeBg: 'bg-red-100',
      badgeText: 'text-red-700',
      label: '긴급',
      icon: 'alert-circle',
      iconColor: COLORS.danger.DEFAULT,
    },
    important: {
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-700',
      badgeBg: 'bg-orange-100',
      badgeText: 'text-orange-700',
      label: '중요',
      icon: 'warning',
      iconColor: COLORS.warning.DEFAULT,
    },
    normal: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      badgeBg: 'bg-blue-100',
      badgeText: 'text-blue-700',
      label: '일반',
      icon: 'information-circle',
      iconColor: COLORS.info.DEFAULT,
    },
  };

  const config = urgencyConfig[urgency] || urgencyConfig.normal;

  // 타입별 아이콘
  const typeIcons = {
    payment: 'card',
    attendance: 'calendar',
    lessonExpiry: 'time',
    noticeUnconfirmed: 'chatbubble-ellipses',
  };

  return (
    <View className={`${config.bgColor} ${config.borderColor} border rounded-xl p-4 mb-3`}>
      {/* 헤더: 긴급도 + 학생 이름 */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1">
          <Ionicons name={config.icon} size={20} color={config.iconColor} />
          <Text className={`ml-2 font-semibold text-base ${config.textColor}`}>
            {student.name}
          </Text>
          <View className={`ml-2 ${config.badgeBg} px-2 py-0.5 rounded`}>
            <Text className={`${config.badgeText} text-xs font-medium`}>
              {config.label}
            </Text>
          </View>
        </View>

        {/* 타입 아이콘 */}
        <Ionicons
          name={typeIcons[type] || 'help-circle'}
          size={16}
          color={config.iconColor}
        />
      </View>

      {/* 연락 사유 */}
      <Text className="text-gray-700 text-sm mb-3">
        {reason}
      </Text>

      {/* 학부모 연락처 */}
      {student.parentPhone && (
        <Text className="text-gray-500 text-xs mb-3">
          📞 {student.parentPhone}
        </Text>
      )}

      {/* 액션 버튼 */}
      <View className="flex-row" style={{ gap: 8 }}>
        {/* AI 메시지 생성 */}
        <TouchableOpacity
          onPress={onGenerateMessage}
          className="flex-1 bg-purple-500 rounded-lg py-2.5 flex-row items-center justify-center"
          style={{ gap: 6 }}
        >
          <Ionicons name="sparkles" size={16} color="white" />
          <Text className="text-white font-semibold text-sm">
            AI 메시지 작성
          </Text>
        </TouchableOpacity>

        {/* 전화 걸기 */}
        {student.parentPhone && (
          <TouchableOpacity
            onPress={onCallParent}
            className="bg-green-500 rounded-lg py-2.5 px-4 flex-row items-center justify-center"
            style={{ gap: 6 }}
          >
            <Ionicons name="call" size={16} color="white" />
            <Text className="text-white font-semibold text-sm">
              전화
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
