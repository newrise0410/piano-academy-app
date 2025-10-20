import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Text from './Text';
import Card from './Card';

/**
 * SectionCard - 섹션 제목이 있는 카드 컴포넌트
 *
 * @param {string} title - 섹션 제목
 * @param {string} subtitle - 섹션 부제목
 * @param {string} iconName - 제목 옆 아이콘
 * @param {string} rightText - 오른쪽 텍스트
 * @param {function} onRightPress - 오른쪽 영역 클릭 핸들러
 * @param {string} rightIconName - 오른쪽 아이콘
 * @param {string} variant - 스타일 변형 (default, gradient, outlined, flat)
 * @param {Array} gradientColors - 그라디언트 색상 배열
 * @param {string} accentColor - 강조 색상 (왼쪽 보더)
 * @param {boolean} noPadding - 콘텐츠 패딩 제거 여부
 * @param {object} style - 추가 스타일
 * @param {object} contentStyle - 콘텐츠 영역 스타일
 * @param {ReactNode} children - 콘텐츠
 */
export default function SectionCard({
  title,
  subtitle,
  iconName,
  rightText,
  onRightPress,
  rightIconName = 'chevron-forward',
  variant = 'default',
  gradientColors,
  accentColor,
  noPadding = false,
  style,
  contentStyle,
  children,
}) {
  // 헤더 렌더링
  const renderHeader = () => {
    if (!title) return null;

    return (
      <View className="flex-row items-center justify-between mb-3">
        {/* 왼쪽: 아이콘 + 제목 */}
        <View className="flex-row items-center flex-1">
          {iconName && (
            <View className="w-8 h-8 bg-primary bg-opacity-10 rounded-lg items-center justify-center mr-3">
              <Ionicons name={iconName} size={18} color="#8B5CF6" />
            </View>
          )}
          <View className="flex-1">
            <Text className="text-base font-bold text-gray-800">
              {title}
            </Text>
            {subtitle && (
              <Text className="text-xs text-gray-500 mt-0.5">
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        {/* 오른쪽: 액션 */}
        {(rightText || onRightPress) && (
          <TouchableOpacity
            onPress={onRightPress}
            disabled={!onRightPress}
            className="flex-row items-center ml-2"
          >
            {rightText && (
              <Text className="text-sm font-semibold text-primary mr-1">
                {rightText}
              </Text>
            )}
            {onRightPress && (
              <Ionicons name={rightIconName} size={18} color="#8B5CF6" />
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // 콘텐츠 래퍼
  const contentClass = noPadding ? '' : 'p-4';

  // 변형별 렌더링
  switch (variant) {
    case 'gradient':
      return (
        <LinearGradient
          colors={gradientColors || ['#8B5CF6', '#7C3AED']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-2xl p-5"
          style={style}
        >
          {renderHeader()}
          <View style={contentStyle}>
            {children}
          </View>
        </LinearGradient>
      );

    case 'outlined':
      return (
        <View
          className="border-2 border-gray-200 rounded-2xl p-4 bg-white"
          style={style}
        >
          {renderHeader()}
          <View className={contentClass} style={contentStyle}>
            {children}
          </View>
        </View>
      );

    case 'flat':
      return (
        <View
          className="bg-gray-50 rounded-2xl p-4"
          style={style}
        >
          {renderHeader()}
          <View className={contentClass} style={contentStyle}>
            {children}
          </View>
        </View>
      );

    case 'accent':
      return (
        <View
          className="bg-white rounded-2xl shadow-sm overflow-hidden"
          style={style}
        >
          {/* 왼쪽 강조 보더 */}
          <View
            className="absolute left-0 top-0 bottom-0 w-1"
            style={{ backgroundColor: accentColor || '#8B5CF6' }}
          />
          <View className="p-4 pl-6">
            {renderHeader()}
            <View className={contentClass} style={contentStyle}>
              {children}
            </View>
          </View>
        </View>
      );

    default: // default
      return (
        <Card style={style}>
          {renderHeader()}
          <View className={contentClass} style={contentStyle}>
            {children}
          </View>
        </Card>
      );
  }
}

/**
 * InfoCard - 정보 표시용 카드 (키-값 쌍)
 */
export function InfoCard({ title, items, style }) {
  return (
    <SectionCard title={title} style={style}>
      <View className="gap-3">
        {items.map((item, index) => (
          <View key={index}>
            <View className="flex-row justify-between items-center py-2">
              <Text className="text-sm text-gray-600">
                {item.label}
              </Text>
              <Text className="text-sm font-semibold text-gray-800">
                {item.value}
              </Text>
            </View>
            {index < items.length - 1 && (
              <View className="border-b border-gray-100" />
            )}
          </View>
        ))}
      </View>
    </SectionCard>
  );
}

/**
 * StatCard - 통계 표시용 카드
 */
export function StatCard({
  title,
  value,
  subtitle,
  iconName,
  variant = 'default',
  color = '#8B5CF6',
  style,
}) {
  const variantClass =
    variant === 'gradient'
      ? 'bg-gradient-to-br from-primary to-primary-600'
      : 'bg-white';

  const textColor = variant === 'gradient' ? 'text-white' : 'text-gray-800';
  const subtitleColor = variant === 'gradient' ? 'text-white text-opacity-80' : 'text-gray-500';

  return (
    <Card style={style}>
      <View className="flex-row items-center justify-between">
        {/* 아이콘 */}
        {iconName && (
          <View
            className="w-12 h-12 rounded-xl items-center justify-center"
            style={{ backgroundColor: `${color}20` }}
          >
            <Ionicons name={iconName} size={24} color={color} />
          </View>
        )}

        {/* 텍스트 */}
        <View className="flex-1 ml-4">
          {title && (
            <Text className={`text-xs font-semibold ${subtitleColor} mb-1`}>
              {title}
            </Text>
          )}
          <Text className={`text-2xl font-bold ${textColor}`}>
            {value}
          </Text>
          {subtitle && (
            <Text className={`text-xs ${subtitleColor} mt-1`}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
    </Card>
  );
}

/**
 * ActionCard - 클릭 가능한 액션 카드
 */
export function ActionCard({
  title,
  description,
  iconName,
  onPress,
  color = '#8B5CF6',
  style,
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={style}>
        <View className="flex-row items-center">
          {/* 아이콘 */}
          <View
            className="w-12 h-12 rounded-xl items-center justify-center"
            style={{ backgroundColor: `${color}20` }}
          >
            <Ionicons name={iconName} size={24} color={color} />
          </View>

          {/* 텍스트 */}
          <View className="flex-1 ml-4">
            <Text className="text-base font-bold text-gray-800">
              {title}
            </Text>
            {description && (
              <Text className="text-sm text-gray-500 mt-1">
                {description}
              </Text>
            )}
          </View>

          {/* 화살표 */}
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </View>
      </Card>
    </TouchableOpacity>
  );
}
