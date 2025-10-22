import React, { forwardRef } from 'react';
import { View, TextInput, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from './Text';

/**
 * FormInput - 재사용 가능한 폼 입력 컴포넌트
 *
 * @param {string} label - 입력 필드 레이블
 * @param {string} value - 입력값
 * @param {function} onChangeText - 값 변경 핸들러
 * @param {string} placeholder - 플레이스홀더 텍스트
 * @param {string} error - 에러 메시지
 * @param {string} iconName - Ionicons 아이콘 이름 (prefix)
 * @param {string} rightIconName - 오른쪽 아이콘 이름 (suffix)
 * @param {function} onRightIconPress - 오른쪽 아이콘 클릭 핸들러
 * @param {string} type - 입력 타입 (text, email, phone, password, numeric, multiline)
 * @param {boolean} disabled - 비활성화 상태
 * @param {boolean} required - 필수 입력 여부
 * @param {number} maxLength - 최대 글자 수
 * @param {number} numberOfLines - multiline 시 줄 수
 * @param {string} size - 크기 (small, medium, large)
 * @param {object} style - 추가 스타일
 * @param {object} inputStyle - TextInput 추가 스타일
 */
const FormInput = forwardRef(({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  iconName,
  rightIconName,
  onRightIconPress,
  type = 'text',
  secureTextEntry,
  disabled = false,
  required = false,
  maxLength,
  numberOfLines = 1,
  size = 'medium',
  style,
  inputStyle,
  ...props
}, ref) => {
  // 타입별 키보드 설정
  const getKeyboardType = () => {
    switch (type) {
      case 'email':
        return 'email-address';
      case 'phone':
        return 'phone-pad';
      case 'numeric':
        return 'numeric';
      default:
        return 'default';
    }
  };

  // 크기별 스타일
  const sizeStyles = {
    small: {
      container: 'p-3',
      text: 'text-sm',
      icon: 16,
    },
    medium: {
      container: 'p-4',
      text: 'text-base',
      icon: 20,
    },
    large: {
      container: 'p-5',
      text: 'text-lg',
      icon: 24,
    },
  };

  const currentSize = sizeStyles[size];
  const isMultiline = type === 'multiline';

  return (
    <View style={style}>
      {/* 레이블 */}
      {label && (
        <View className="flex-row items-center mb-2">
          <Text className="text-sm font-semibold text-gray-700">
            {label}
          </Text>
          {required && (
            <Text className="text-red-500 ml-1">*</Text>
          )}
        </View>
      )}

      {/* 입력 필드 */}
      <View
        className={`
          bg-gray-50 rounded-xl border flex-row items-center
          ${error ? 'border-red-500' : 'border-gray-200'}
          ${disabled ? 'bg-gray-100 opacity-60' : ''}
          ${currentSize.container}
          ${isMultiline ? 'min-h-[100px] items-start' : ''}
        `}
      >
        {/* 왼쪽 아이콘 */}
        {iconName && (
          <Ionicons
            name={iconName}
            size={currentSize.icon}
            color={error ? '#EF4444' : '#9CA3AF'}
            style={{ marginRight: 12 }}
          />
        )}

        {/* TextInput */}
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          keyboardType={getKeyboardType()}
          secureTextEntry={secureTextEntry !== undefined ? secureTextEntry : type === 'password'}
          editable={!disabled}
          maxLength={maxLength}
          multiline={isMultiline}
          numberOfLines={isMultiline ? numberOfLines : 1}
          className={`flex-1 ${currentSize.text} text-gray-800`}
          style={[
            {
              fontFamily: 'MaruBuri-Regular',
              paddingVertical: 0,
              paddingHorizontal: 0,
              margin: 0,
              includeFontPadding: false,
              textAlignVertical: 'center',
            },
            inputStyle,
          ]}
          {...props}
        />

        {/* 오른쪽 아이콘 */}
        {rightIconName && (
          <Ionicons
            name={rightIconName}
            size={currentSize.icon}
            color={error ? '#EF4444' : '#9CA3AF'}
            style={{ marginLeft: 12 }}
            onPress={onRightIconPress}
          />
        )}
      </View>

      {/* 에러 메시지 */}
      {error && (
        <View className="flex-row items-center mt-2">
          <Ionicons name="alert-circle" size={14} color="#EF4444" />
          <Text className="text-xs text-red-500 ml-1">
            {error}
          </Text>
        </View>
      )}

      {/* 글자 수 표시 */}
      {maxLength && value && (
        <Text className="text-xs text-gray-400 text-right mt-1">
          {value.length}/{maxLength}
        </Text>
      )}
    </View>
  );
});

FormInput.displayName = 'FormInput';

export default FormInput;
