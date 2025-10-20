import React from 'react';
import { View, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Text from './Text';
import TEACHER_COLORS from '../../styles/teacher_colors';

/**
 * ScreenHeader - 화면 상단 헤더 컴포넌트
 *
 * @param {string} title - 헤더 타이틀
 * @param {boolean} showBackButton - 뒤로가기 버튼 표시 여부 (기본: true)
 * @param {function} onBackPress - 뒤로가기 버튼 클릭 핸들러 (기본: navigation.goBack())
 * @param {ReactNode} rightButton - 우측 버튼 (optional)
 * @param {string} subtitle - 부제목 (optional)
 */
export default function ScreenHeader({
  title,
  showBackButton = true,
  onBackPress,
  rightButton,
  subtitle,
}) {
  const navigation = useNavigation();

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
        borderBottomColor: TEACHER_COLORS.gray[200],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 3,
      }}
    >
      <View className="flex-row items-center justify-between px-4 py-3.5">
        {/* 좌측: 뒤로가기 + 타이틀 */}
        <View className="flex-row items-center flex-1">
          {showBackButton && (
            <TouchableOpacity
              onPress={handleBackPress}
              className="mr-3 rounded-full"
              style={{
                width: 34,
                height: 34,
                backgroundColor: TEACHER_COLORS.gray[100],
                alignItems: 'center',
                justifyContent: 'center',
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={TEACHER_COLORS.primary.DEFAULT}
              />
            </TouchableOpacity>
          )}
          <View className="flex-1">
            <Text
              className="text-xl font-bold tracking-tight"
              style={{ color: TEACHER_COLORS.gray[900] }}
            >
              {title}
            </Text>
            {subtitle && (
              <Text
                className="text-sm mt-0.5"
                style={{ color: TEACHER_COLORS.gray[500] }}
              >
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        {/* 우측: 커스텀 버튼 */}
        {rightButton && (
          <View className="ml-3">
            {rightButton}
          </View>
        )}
      </View>
    </View>
  );
}
