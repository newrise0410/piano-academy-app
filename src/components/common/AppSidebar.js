// src/components/common/AppSidebar.js
import React, { useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './index';
import { useAuthStore } from '../../store';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.75; // 화면의 75%

/**
 * 앱 사이드바 공통 컴포넌트
 * 선생님/학부모 화면에서 모두 사용 가능
 *
 * @param {boolean} visible - 사이드바 표시 여부
 * @param {function} onClose - 닫기 콜백
 * @param {Array} menuSections - 메뉴 섹션 배열 (title, items)
 * @param {Object} theme - 테마 색상 객체
 * @param {string} userRole - 사용자 역할 ('teacher' | 'parent')
 */
export default function AppSidebar({
  visible,
  onClose,
  menuSections = [],
  theme,
  userRole = 'teacher',
}) {
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  // 로그아웃 핸들러
  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃 하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              onClose();
            } catch (error) {
              console.error('로그아웃 오류:', error);
              Alert.alert('오류', '로그아웃에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    if (visible) {
      // 사이드바 열기 애니메이션
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // 사이드바 닫기 애니메이션
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -SIDEBAR_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible && slideAnim.__getValue() === -SIDEBAR_WIDTH) {
    return null;
  }

  // 사용자 역할에 따른 표시 이름
  const roleLabel = userRole === 'teacher' ? '선생님' : '학부모님';
  const displayName = user?.displayName || user?.email?.split('@')[0] || roleLabel;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'auto' : 'none'}>
      {/* 오버레이 (배경 어둡게) */}
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: overlayAnim,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={onClose}
        />
      </Animated.View>

      {/* 사이드바 */}
      <Animated.View
        style={[
          styles.sidebar,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <SafeAreaView style={styles.sidebarContent}>
          {/* 헤더 */}
          <View className="p-6 border-b border-gray-200">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-2xl font-bold text-gray-800">메뉴</Text>
              <TouchableOpacity
                onPress={onClose}
                className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
              >
                <Ionicons name="close" size={24} color={theme.gray[600]} />
              </TouchableOpacity>
            </View>

            {/* 사용자 정보 */}
            <View className="flex-row items-center">
              <View
                className="w-14 h-14 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: theme.primary[100] }}
              >
                <Ionicons name="person" size={28} color={theme.primary.DEFAULT} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-gray-800">
                  {displayName}
                </Text>
                <Text className="text-sm text-gray-500">
                  {user?.email || ''}
                </Text>
              </View>
            </View>
          </View>

          {/* 메뉴 아이템 */}
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {menuSections.map((section, sectionIndex) => (
              <View key={sectionIndex} className="py-3">
                {/* 섹션 제목 */}
                <Text className="text-xs font-bold text-gray-500 px-6 py-2">
                  {section.title}
                </Text>

                {/* 섹션 아이템들 */}
                {section.items.map((item, itemIndex) => (
                  <TouchableOpacity
                    key={itemIndex}
                    onPress={() => {
                      // 로그아웃인 경우 handleLogout 실행
                      if (item.isLogout) {
                        handleLogout();
                      } else {
                        item.onPress?.();
                      }
                    }}
                    className="flex-row items-center justify-between px-6 py-3.5"
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center">
                      <View
                        className="w-9 h-9 rounded-full items-center justify-center"
                        style={{ backgroundColor: theme.gray[100] }}
                      >
                        <Ionicons
                          name={item.icon}
                          size={20}
                          color={item.color || theme.gray[700]}
                        />
                      </View>
                      <Text
                        className="text-base font-medium ml-3"
                        style={{ color: item.color || theme.gray[800] }}
                      >
                        {item.label}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward-outline"
                      size={20}
                      color={theme.gray[400]}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </ScrollView>

          {/* 푸터 */}
          <View className="p-6 border-t border-gray-200">
            <Text className="text-xs text-gray-500 text-center">
              Piano Academy v1.0.0
            </Text>
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayTouchable: {
    flex: 1,
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  sidebarContent: {
    flex: 1,
  },
});
