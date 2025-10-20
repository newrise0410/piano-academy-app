import React, { useEffect, useRef, useState } from 'react';
import { View, Modal, TouchableOpacity, Animated, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Text from './Text';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * BottomSheet - 하단에서 올라오는 모달 컴포넌트
 *
 * @param {boolean} visible - 모달 표시 여부
 * @param {function} onClose - 모달 닫기 핸들러
 * @param {string} title - 모달 제목
 * @param {string} subtitle - 모달 부제목
 * @param {ReactNode} children - 모달 콘텐츠
 * @param {string} height - 모달 높이 (small: 40%, medium: 60%, large: 80%, full: 90%)
 * @param {function} onViewAll - 전체보기 버튼 핸들러 (선택적)
 */
export default function BottomSheet({
  visible,
  onClose,
  title,
  subtitle,
  children,
  height = 'medium',
  onViewAll,
}) {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [modalVisible, setModalVisible] = useState(false);

  const heightMap = {
    small: SCREEN_HEIGHT * 0.4,
    medium: SCREEN_HEIGHT * 0.6,
    large: SCREEN_HEIGHT * 0.8,
    full: SCREEN_HEIGHT * 0.9,
  };

  const modalHeight = heightMap[height] || heightMap.medium;

  useEffect(() => {
    if (visible) {
      // Modal을 먼저 표시
      setModalVisible(true);
      // 약간의 딜레이 후 애니메이션 시작
      setTimeout(() => {
        Animated.parallel([
          Animated.spring(slideAnim, {
            toValue: 0,
            tension: 65,
            friction: 11,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start();
      }, 50);
    } else if (modalVisible) {
      // 닫기 애니메이션
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // 애니메이션 완료 후 Modal 숨김
        setModalVisible(false);
        // 값 초기화
        slideAnim.setValue(SCREEN_HEIGHT);
        opacityAnim.setValue(0);
      });
    }
  }, [visible]);

  const handleBackdropPress = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleBackdropPress}
        style={{ flex: 1 }}
      >
        <Animated.View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            opacity: opacityAnim,
          }}
        />
      </TouchableOpacity>

      {/* Bottom Sheet Content */}
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: modalHeight,
          backgroundColor: 'white',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          transform: [{ translateY: slideAnim }],
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
          {/* Handle Bar */}
          <View className="items-center py-3">
            <View className="w-12 h-1 bg-gray-300 rounded-full" />
          </View>

          {/* Header */}
          {(title || subtitle) && (
            <View className="px-6 pb-4 border-b border-gray-100">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  {title && (
                    <Text className="text-xl font-bold text-gray-800">
                      {title}
                    </Text>
                  )}
                  {subtitle && (
                    <Text className="text-sm text-gray-500 mt-1">
                      {subtitle}
                    </Text>
                  )}
                </View>

                {/* 전체보기 버튼 (onViewAll이 있을 때만 표시) */}
                {onViewAll && (
                  <TouchableOpacity
                    onPress={onViewAll}
                    className="bg-primary rounded-lg px-3 py-2 mr-2"
                    activeOpacity={0.7}
                  >
                    <Text className="text-white text-xs font-bold">전체보기</Text>
                  </TouchableOpacity>
                )}

                {/* 닫기 버튼 */}
                <TouchableOpacity
                  onPress={onClose}
                  className="w-8 h-8 items-center justify-center bg-gray-100 rounded-full ml-3"
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Content */}
          <ScrollView
            className="flex-1 px-6"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View className="py-4">
              {children}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
}
