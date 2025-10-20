import React, { useEffect, useRef, useState } from 'react';
import { View, Modal, TouchableOpacity, Animated, Dimensions, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Text from './Text';
import TEACHER_COLORS, { TEACHER_GRADIENTS } from '../../styles/teacher_colors';
import { useAuthStore } from '../../store/authStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.85, 320);

/**
 * Drawer - 왼쪽에서 슬라이드되는 사이드바 메뉴
 *
 * @param {boolean} visible - Drawer 표시 여부
 * @param {function} onClose - Drawer 닫기 핸들러
 * @param {object} navigation - React Navigation 객체
 * @param {string} userType - 'teacher' | 'parent'
 */
export default function Drawer({ visible, onClose, navigation, userType = 'teacher' }) {
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [modalVisible, setModalVisible] = useState(false);
  const { user, logout } = useAuthStore();

  // 사용자 이름 안전하게 가져오기
  const userName = user?.name || '사용자';

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
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
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setModalVisible(false);
        slideAnim.setValue(-DRAWER_WIDTH);
        opacityAnim.setValue(0);
      });
    }
  }, [visible]);

  const handleBackdropPress = () => {
    onClose();
  };

  const handleMenuPress = (action) => {
    onClose();
    setTimeout(() => {
      action();
    }, 300);
  };

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: () => {
            handleMenuPress(() => {
              logout();
            });
          },
        },
      ]
    );
  };

  const MenuItem = ({ icon, text, badge, divider, onPress }) => (
    <>
      <TouchableOpacity
        onPress={() => handleMenuPress(onPress)}
        className="flex-row items-center justify-between px-5 py-4 active:bg-gray-100"
        activeOpacity={0.7}
      >
        <View className="flex-row items-center flex-1">
          <Ionicons name={icon} size={20} color={TEACHER_COLORS.gray[600]} />
          <Text className="text-gray-800 text-sm ml-3">{text}</Text>
        </View>
        <View className="flex-row items-center gap-2">
          {badge && (
            <View className="bg-red-500 rounded-full px-2 py-0.5 min-w-[20px] items-center">
              <Text className="text-white text-xs font-bold">{badge}</Text>
            </View>
          )}
          <Ionicons name="chevron-forward" size={16} color={TEACHER_COLORS.gray[400]} />
        </View>
      </TouchableOpacity>
      {divider && <View className="h-px bg-gray-200 mx-5 my-2" />}
    </>
  );

  const SectionTitle = ({ text }) => (
    <View className="px-5 py-2 mt-4">
      <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider">
        {text}
      </Text>
    </View>
  );

  return (
    <Modal
      visible={modalVisible}
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

      {/* Drawer Content */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: DRAWER_WIDTH,
          backgroundColor: 'white',
          transform: [{ translateX: slideAnim }],
          shadowColor: '#000',
          shadowOffset: { width: 2, height: 0 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 16,
        }}
      >
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
          <View className="flex-1">
            {/* Header */}
            <LinearGradient
              colors={TEACHER_GRADIENTS.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ paddingHorizontal: 20, paddingVertical: 24 }}
            >
              <View className="flex-row items-start justify-between mb-4">
                <Text className="text-white text-lg font-bold">메뉴</Text>
                <TouchableOpacity
                  onPress={onClose}
                  className="bg-white bg-opacity-20 rounded-lg p-1"
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Profile Section */}
              <View className="flex-row items-center">
                <View className="w-14 h-14 bg-white rounded-full items-center justify-center">
                  <Ionicons name="person" size={28} color={TEACHER_COLORS.primary.DEFAULT} />
                </View>
                <View className="flex-1 ml-3">
                  <Text className="text-white font-bold text-base">
                    {userName} {userType === 'teacher' ? '선생님' : '학부모님'}
                  </Text>
                  <Text className="text-purple-100 text-sm">안녕하세요 👋</Text>
                </View>
              </View>
            </LinearGradient>

            {/* Menu Items */}
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              <SectionTitle text="계정 관리" />
              <MenuItem
                icon="create-outline"
                text="내 정보 수정"
                onPress={() => {
                  // TODO: 내 정보 수정 화면으로 이동
                  Alert.alert('준비 중', '내 정보 수정 기능 준비 중입니다');
                }}
              />
              <MenuItem
                icon="key-outline"
                text="비밀번호 변경"
                divider
                onPress={() => {
                  // TODO: 비밀번호 변경 화면으로 이동
                  Alert.alert('준비 중', '비밀번호 변경 기능 준비 중입니다');
                }}
              />

              {userType === 'teacher' && (
                <>
                  <SectionTitle text="학원/센터" />
                  <MenuItem
                    icon="business-outline"
                    text="학원 선택"
                    onPress={() => {
                      Alert.alert('준비 중', '학원 선택 기능 준비 중입니다');
                    }}
                  />
                  <MenuItem
                    icon="business-outline"
                    text="학원 정보 관리"
                    divider
                    onPress={() => {
                      Alert.alert('준비 중', '학원 정보 관리 기능 준비 중입니다');
                    }}
                  />

                  <SectionTitle text="통계" />
                  <MenuItem
                    icon="bar-chart-outline"
                    text="통계 보기"
                    onPress={() => {
                      Alert.alert('준비 중', '통계 보기 기능 준비 중입니다');
                    }}
                  />
                  <MenuItem
                    icon="trending-up-outline"
                    text="월별 리포트"
                    onPress={() => {
                      Alert.alert('준비 중', '월별 리포트 기능 준비 중입니다');
                    }}
                  />
                  <MenuItem
                    icon="wallet-outline"
                    text="수익 현황"
                    divider
                    onPress={() => {
                      Alert.alert('준비 중', '수익 현황 기능 준비 중입니다');
                    }}
                  />
                </>
              )}

              <SectionTitle text="설정" />
              <MenuItem
                icon="notifications-outline"
                text="알림 설정"
                badge="3"
                onPress={() => {
                  Alert.alert('준비 중', '알림 설정 기능 준비 중입니다');
                }}
              />
              <MenuItem
                icon="settings-outline"
                text="앱 환경설정"
                onPress={() => {
                  Alert.alert('준비 중', '앱 환경설정 기능 준비 중입니다');
                }}
              />
              <MenuItem
                icon="moon-outline"
                text="화면 모드"
                divider
                onPress={() => {
                  Alert.alert('준비 중', '화면 모드 기능 준비 중입니다');
                }}
              />

              <SectionTitle text="지원 및 도움말" />
              <MenuItem
                icon="chatbubble-outline"
                text="문의하기"
                onPress={() => {
                  Alert.alert('준비 중', '문의하기 기능 준비 중입니다');
                }}
              />
              <MenuItem
                icon="book-outline"
                text="사용 가이드"
                onPress={() => {
                  Alert.alert('준비 중', '사용 가이드 기능 준비 중입니다');
                }}
              />
              <MenuItem
                icon="megaphone-outline"
                text="공지사항"
                badge="2"
                onPress={() => {
                  Alert.alert('준비 중', '공지사항 기능 준비 중입니다');
                }}
              />
              <MenuItem
                icon="help-circle-outline"
                text="자주 묻는 질문"
                divider
                onPress={() => {
                  Alert.alert('준비 중', 'FAQ 기능 준비 중입니다');
                }}
              />

              <SectionTitle text="앱 정보" />
              <MenuItem
                icon="information-circle-outline"
                text="버전 정보"
                onPress={() => {
                  Alert.alert('버전 정보', 'Piano Academy v1.0.0');
                }}
              />
              <MenuItem
                icon="document-text-outline"
                text="이용약관"
                onPress={() => {
                  Alert.alert('준비 중', '이용약관 기능 준비 중입니다');
                }}
              />
              <MenuItem
                icon="shield-checkmark-outline"
                text="개인정보처리방침"
                onPress={() => {
                  Alert.alert('준비 중', '개인정보처리방침 기능 준비 중입니다');
                }}
              />
              <MenuItem
                icon="star-outline"
                text="앱 평가하기"
                onPress={() => {
                  Alert.alert('준비 중', '앱 평가하기 기능 준비 중입니다');
                }}
              />

              {/* Bottom spacing */}
              <View className="h-4" />
            </ScrollView>

            {/* Logout Button */}
            <View className="border-t border-gray-200 p-4">
              <TouchableOpacity
                onPress={handleLogout}
                className="flex-row items-center justify-center bg-gray-100 py-3 rounded-lg"
                activeOpacity={0.7}
              >
                <Ionicons name="log-out-outline" size={20} color={TEACHER_COLORS.gray[700]} />
                <Text className="text-gray-700 font-semibold ml-2">로그아웃</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
}
