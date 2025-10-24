import React from 'react';
import { View, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Text from './Text';
import TEACHER_COLORS from '../../styles/teacher_colors';
import PARENT_COLORS from '../../styles/parent_colors';
import { SHADOWS, RADIUS, SPACING, TYPOGRAPHY, ICON_CONTAINER } from '../../styles/commonStyles';

/**
 * ScreenHeader - 화면 상단 헤더 컴포넌트
 *
 * @param {string} title - 헤더 타이틀
 * @param {boolean} showBackButton - 뒤로가기 버튼 표시 여부 (기본: true)
 * @param {function} onBackPress - 뒤로가기 버튼 클릭 핸들러 (기본: navigation.goBack())
 * @param {ReactNode} rightButton - 우측 버튼 (optional)
 * @param {string} subtitle - 부제목 (optional)
 * @param {string} colorScheme - 색상 테마 ('teacher' | 'parent', 기본: 'teacher')
 */
export default function ScreenHeader({
  title,
  showBackButton = true,
  onBackPress,
  rightButton,
  subtitle,
  colorScheme = 'teacher',
}) {
  const navigation = useNavigation();

  // 색상 테마 선택
  const COLORS = colorScheme === 'parent' ? PARENT_COLORS : TEACHER_COLORS;

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderBottomWidth: 0.5,
        borderBottomColor: COLORS.gray[200],
        ...SHADOWS.sm,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: SPACING.lg,
          paddingVertical: SPACING.md + 2,
        }}
      >
        {/* 좌측: 뒤로가기 + 타이틀 */}
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          {showBackButton && (
            <TouchableOpacity
              onPress={handleBackPress}
              style={{
                ...ICON_CONTAINER.round(COLORS.gray[100], 34),
                marginRight: SPACING.md,
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={COLORS.primary.DEFAULT}
              />
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: TYPOGRAPHY.fontSize.xl,
                fontWeight: TYPOGRAPHY.fontWeight.bold,
                color: COLORS.gray[900],
                letterSpacing: -0.5,
              }}
            >
              {title}
            </Text>
            {subtitle && (
              <Text
                style={{
                  fontSize: TYPOGRAPHY.fontSize.sm,
                  color: COLORS.gray[500],
                  marginTop: SPACING.xs / 2,
                }}
              >
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        {/* 우측: 커스텀 버튼 */}
        {rightButton && (
          <View style={{ marginLeft: SPACING.md }}>
            {rightButton}
          </View>
        )}
      </View>
    </View>
  );
}
