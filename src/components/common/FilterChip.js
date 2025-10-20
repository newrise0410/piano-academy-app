import React from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from './Text';

/**
 * FilterChip - 재사용 가능한 필터 칩 컴포넌트
 *
 * @param {Array} options - 옵션 배열 [{ value: string, label: string, icon?: string, count?: number }]
 * @param {string|Array} value - 선택된 값 (단일 선택: string, 다중 선택: Array)
 * @param {function} onChange - 값 변경 핸들러 (value) => void
 * @param {boolean} multiple - 다중 선택 여부
 * @param {string} variant - 스타일 변형 (default, outlined, filled)
 * @param {string} layout - 레이아웃 (horizontal, wrapped)
 * @param {string} size - 크기 (small, medium, large)
 * @param {string} activeColor - 활성 배경색 (NativeWind class)
 * @param {string} activeTextColor - 활성 텍스트 색상 (NativeWind class)
 * @param {object} containerStyle - 컨테이너 추가 스타일
 * @param {object} chipStyle - 칩 추가 스타일
 */
export default function FilterChip({
  options = [],
  value,
  onChange,
  multiple = false,
  variant = 'default',
  layout = 'horizontal',
  size = 'medium',
  activeColor = 'bg-primary',
  activeTextColor = 'text-white',
  containerStyle,
  chipStyle,
}) {
  // 선택 상태 확인
  const isSelected = (optionValue) => {
    if (multiple) {
      return Array.isArray(value) && value.includes(optionValue);
    }
    return value === optionValue;
  };

  // 선택 핸들러
  const handleSelect = (optionValue) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      if (currentValues.includes(optionValue)) {
        onChange(currentValues.filter((v) => v !== optionValue));
      } else {
        onChange([...currentValues, optionValue]);
      }
    } else {
      onChange(optionValue);
    }
  };

  // 크기별 스타일
  const sizeStyles = {
    small: {
      padding: 'px-3 py-1.5',
      text: 'text-xs',
      icon: 14,
    },
    medium: {
      padding: 'px-4 py-2',
      text: 'text-sm',
      icon: 16,
    },
    large: {
      padding: 'px-5 py-2.5',
      text: 'text-base',
      icon: 18,
    },
  };

  // 변형별 스타일
  const getChipStyle = (selected) => {
    const baseStyle = `${sizeStyles[size].padding} rounded-full`;

    switch (variant) {
      case 'outlined':
        return selected
          ? `${baseStyle} ${activeColor} ${activeTextColor} border-2 border-transparent`
          : `${baseStyle} bg-white border-2 border-gray-300 text-gray-700`;
      case 'filled':
        return selected
          ? `${baseStyle} ${activeColor} ${activeTextColor}`
          : `${baseStyle} bg-gray-200 text-gray-600`;
      default: // default
        return selected
          ? `${baseStyle} ${activeColor} ${activeTextColor}`
          : `${baseStyle} bg-gray-100 text-gray-600`;
    }
  };

  const currentSize = sizeStyles[size];

  // 칩 렌더링
  const renderChip = (option) => {
    const selected = isSelected(option.value);

    return (
      <TouchableOpacity
        key={option.value}
        onPress={() => handleSelect(option.value)}
        className={getChipStyle(selected)}
        style={chipStyle}
      >
        <View className="flex-row items-center">
          {/* 아이콘 */}
          {option.icon && (
            <Ionicons
              name={option.icon}
              size={currentSize.icon}
              color={selected ? '#FFFFFF' : '#4B5563'}
              style={{ marginRight: 6 }}
            />
          )}

          {/* 레이블 */}
          <Text
            className={`${currentSize.text} font-semibold ${
              selected ? activeTextColor : 'text-gray-700'
            }`}
          >
            {option.label}
          </Text>

          {/* 카운트 */}
          {option.count !== undefined && (
            <View
              className={`ml-2 px-2 py-0.5 rounded-full ${
                selected ? 'bg-white bg-opacity-20' : 'bg-gray-200'
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  selected ? activeTextColor : 'text-gray-600'
                }`}
              >
                {option.count}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // 레이아웃별 렌더링
  if (layout === 'wrapped') {
    return (
      <View
        className="flex-row flex-wrap gap-2"
        style={containerStyle}
      >
        {options.map(renderChip)}
      </View>
    );
  }

  // horizontal (기본)
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8 }}
      style={containerStyle}
    >
      {options.map(renderChip)}
    </ScrollView>
  );
}

/**
 * SegmentedControl - 세그먼트 컨트롤 (필터칩의 변형)
 * 전체 너비를 차지하는 탭 형태의 컨트롤
 */
export function SegmentedControl({
  options = [],
  value,
  onChange,
  activeColor = 'bg-primary',
  activeTextColor = 'text-white',
  containerStyle,
}) {
  return (
    <View
      className="flex-row bg-gray-100 rounded-xl p-1"
      style={containerStyle}
    >
      {options.map((option) => {
        const selected = value === option.value;

        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => onChange(option.value)}
            className={`
              flex-1 py-2 px-3 rounded-lg items-center justify-center
              ${selected ? activeColor : 'bg-transparent'}
            `}
          >
            <View className="flex-row items-center">
              {option.icon && (
                <Ionicons
                  name={option.icon}
                  size={16}
                  color={selected ? '#FFFFFF' : '#6B7280'}
                  style={{ marginRight: 6 }}
                />
              )}
              <Text
                className={`text-sm font-semibold ${
                  selected ? activeTextColor : 'text-gray-600'
                }`}
              >
                {option.label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
