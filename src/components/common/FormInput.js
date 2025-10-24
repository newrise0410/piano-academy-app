import React, { forwardRef } from 'react';
import { View, TextInput, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from './Text';
import { SPACING, TYPOGRAPHY, RADIUS, INPUT_STYLES } from '../../styles/commonStyles';

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
 * @param {string} colorScheme - 색상 스키마 (teacher 또는 parent)
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
  colorScheme = 'teacher',
  style,
  inputStyle,
  ...props
}, ref) => {
  // 색상 스키마에 따른 import
  const COLORS = colorScheme === 'teacher'
    ? require('../../styles/teacher_colors').default
    : require('../../styles/parent_colors').default;
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
      padding: SPACING.md,
      fontSize: TYPOGRAPHY.fontSize.sm,
      icon: 16,
    },
    medium: {
      padding: SPACING.lg,
      fontSize: TYPOGRAPHY.fontSize.base,
      icon: 20,
    },
    large: {
      padding: SPACING.xl,
      fontSize: TYPOGRAPHY.fontSize.lg,
      icon: 24,
    },
  };

  const currentSize = sizeStyles[size];
  const isMultiline = type === 'multiline';

  return (
    <View style={style}>
      {/* 레이블 */}
      {label && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
          <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: COLORS.gray[700] }}>
            {label}
          </Text>
          {required && (
            <Text style={{ color: COLORS.danger[500], marginLeft: SPACING.xs }}>*</Text>
          )}
        </View>
      )}

      {/* 입력 필드 */}
      <View
        style={{
          backgroundColor: disabled ? COLORS.gray[100] : COLORS.gray[50],
          borderRadius: RADIUS.xl,
          borderWidth: error ? 2 : 1,
          borderColor: error ? COLORS.danger[500] : COLORS.gray[200],
          flexDirection: 'row',
          alignItems: isMultiline ? 'flex-start' : 'center',
          padding: currentSize.padding,
          opacity: disabled ? 0.6 : 1,
          minHeight: isMultiline ? 100 : undefined,
        }}
      >
        {/* 왼쪽 아이콘 */}
        {iconName && (
          <Ionicons
            name={iconName}
            size={currentSize.icon}
            color={error ? COLORS.danger[500] : COLORS.gray[400]}
            style={{ marginRight: SPACING.md }}
          />
        )}

        {/* TextInput */}
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.gray[400]}
          keyboardType={getKeyboardType()}
          secureTextEntry={secureTextEntry !== undefined ? secureTextEntry : type === 'password'}
          editable={!disabled}
          maxLength={maxLength}
          multiline={isMultiline}
          numberOfLines={isMultiline ? numberOfLines : 1}
          style={[
            {
              flex: 1,
              fontSize: currentSize.fontSize,
              color: COLORS.gray[800],
              fontFamily: 'MaruBuri-Regular',
              paddingVertical: 0,
              paddingHorizontal: 0,
              margin: 0,
              includeFontPadding: false,
              textAlignVertical: isMultiline ? 'top' : 'center',
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
            color={error ? COLORS.danger[500] : COLORS.gray[400]}
            style={{ marginLeft: SPACING.md }}
            onPress={onRightIconPress}
          />
        )}
      </View>

      {/* 에러 메시지 */}
      {error && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: SPACING.sm }}>
          <Ionicons name="alert-circle" size={14} color={COLORS.danger[500]} />
          <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.danger[500], marginLeft: SPACING.xs }}>
            {error}
          </Text>
        </View>
      )}

      {/* 글자 수 표시 */}
      {maxLength && value && (
        <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.gray[400], textAlign: 'right', marginTop: SPACING.xs }}>
          {value.length}/{maxLength}
        </Text>
      )}
    </View>
  );
});

FormInput.displayName = 'FormInput';

export default FormInput;
