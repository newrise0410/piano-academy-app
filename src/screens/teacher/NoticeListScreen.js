import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Text from '../../components/common/Text';
import NoticeCreateScreen from './NoticeCreateScreen';

export default function NoticeListScreen({ navigation }) {
  const [showCreateScreen, setShowCreateScreen] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // 목업 데이터
  const notices = [
    {
      id: '1',
      title: '12월 발표회 안내',
      content: '12월 25일 오후 2시, 학원 연주홀에서...',
      date: '2025.10.15',
      confirmed: 28,
      total: 30,
    },
    {
      id: '2',
      title: '10월 셋째 주 휴강 안내',
      content: '10월 18일(금)은 원장님 개인 사정으로...',
      date: '2025.10.10',
      confirmed: 30,
      total: 30,
    },
    {
      id: '3',
      title: '수강료 납부 안내',
      content: '10월 수강료는 10월 5일까지 납부해...',
      date: '2025.10.01',
      confirmed: 30,
      total: 30,
    },
  ];

  // 화면 전환 애니메이션
  useEffect(() => {
    if (showCreateScreen) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showCreateScreen]);

  const handleOpenCreate = () => {
    setShowCreateScreen(true);
  };

  const handleCloseCreate = () => {
    setShowCreateScreen(false);
  };

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -1000],
  });

  const createScreenTranslateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1000, 0],
  });

  return (
    <View style={{ flex: 1 }}>
      {/* 목록 화면 */}
      <Animated.View
        style={{
          flex: 1,
          transform: [{ translateX }],
        }}
      >
        <SafeAreaView className="flex-1 bg-gray-50">
          {/* 헤더 */}
          <View className="bg-primary px-5 py-4">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Ionicons name="book" size={24} color="white" />
                <Text className="text-white text-xl font-bold ml-2">피아노 학원 관리</Text>
              </View>
              <Ionicons name="menu" size={28} color="white" />
            </View>
          </View>



          {/* 새 알림장 작성 버튼 */}
          <View className="px-5 mt-4">
            <TouchableOpacity
              className="bg-gradient-to-r from-primary to-purple-600 rounded-2xl p-5 flex-row items-center justify-center"
              style={{ backgroundColor: '#8B5CF6' }}
              activeOpacity={0.8}
              onPress={handleOpenCreate}
            >
              <Ionicons name="chatbubble-ellipses" size={24} color="white" />
              <Text className="text-white text-lg font-bold ml-2">새로운 알림장 작성하기</Text>
            </TouchableOpacity>
          </View>

          {/* 발송 내역 섹션 */}
          <View className="px-5 mt-6 mb-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-base font-bold text-gray-800">발송 내역</Text>
              <TouchableOpacity className="flex-row items-center">
                <Ionicons name="search" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* 알림장 목록 */}
          <ScrollView className="flex-1 px-5">
            {notices.map((notice, index) => (
              <TouchableOpacity
                key={notice.id}
                className="bg-white rounded-2xl p-4 mb-3 border border-gray-100"
                activeOpacity={0.7}
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              >
                {/* 제목과 수정 아이콘 */}
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-row items-start flex-1">
                    {index === 0 && (
                      <Ionicons name="star" size={16} color="#F59E0B" style={{ marginTop: 2, marginRight: 4 }} />
                    )}
                    <Text className="text-base font-bold text-gray-800 flex-1">
                      {notice.title}
                    </Text>
                  </View>
                  <Ionicons name="create-outline" size={20} color="#9CA3AF" />
                </View>

                {/* 내용 미리보기 */}
                <Text className="text-sm text-gray-600 mb-3" numberOfLines={1}>
                  {notice.content}
                </Text>

                {/* 날짜와 확인 현황 */}
                <View className="flex-row justify-between items-center">
                  <Text className="text-xs text-gray-400">{notice.date}</Text>
                  <View className="bg-green-50 px-3 py-1 rounded-full">
                    <Text className="text-xs text-green-600 font-semibold">
                      {notice.confirmed}/{notice.total}명 확인
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            {notices.length === 0 && (
              <View className="flex-1 items-center justify-center py-20">
                <Ionicons name="notifications-outline" size={64} color="#D1D5DB" />
                <Text className="text-gray-400 mt-4">아직 작성된 알림장이 없습니다</Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Animated.View>

      {/* 작성 화면 */}
      {showCreateScreen && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            transform: [{ translateX: createScreenTranslateX }],
          }}
        >
          <NoticeCreateScreen
            navigation={{
              goBack: handleCloseCreate
            }}
          />
        </Animated.View>
      )}
    </View>
  );
}
