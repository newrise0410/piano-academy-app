import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Animated, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Text from '../../components/common/Text';
import NoticeCreateScreen from './NoticeCreateScreen';
import COLORS, { SHADOW_COLORS } from '../../styles/colors';
import { getNotices, deleteNotice } from '../../data/mockNotices';

export default function NoticeListScreen({ navigation }) {
  const [showCreateScreen, setShowCreateScreen] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [notices, setNotices] = useState([]);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // 알림장 목록 로드
  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = () => {
    const noticeList = getNotices();
    setNotices(noticeList);
  };

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
    // 알림장 목록 새로고침
    loadNotices();
  };

  const handleOpenDetail = (notice) => {
    setSelectedNotice(notice);
    setShowDetailModal(true);
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedNotice(null);
    loadNotices();
  };

  const handleDeleteNotice = () => {
    if (!selectedNotice) return;

    Alert.alert(
      '알림장 삭제',
      '이 알림장을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            deleteNotice(selectedNotice.id);
            Alert.alert('완료', '알림장이 삭제되었습니다.');
            handleCloseDetail();
          }
        }
      ]
    );
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
              style={{ backgroundColor: COLORS.primary[600] }}
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
                onPress={() => handleOpenDetail(notice)}
                style={{
                  shadowColor: SHADOW_COLORS.black,
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

      {/* 상세 모달 */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        onRequestClose={handleCloseDetail}
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1 bg-primary" edges={['top']}>
          <View className="flex-1 bg-gray-50">
            {/* 헤더 */}
            <View className="bg-primary px-5 py-4">
              <View className="flex-row justify-between items-center">
                <TouchableOpacity onPress={handleCloseDetail}>
                  <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold">알림장 상세</Text>
                <TouchableOpacity onPress={handleDeleteNotice}>
                  <Ionicons name="trash-outline" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>

          {selectedNotice && (
            <ScrollView className="flex-1 px-5 py-4">
              {/* 발송 정보 카드 */}
              <View className="bg-white rounded-2xl p-5 mb-4 border border-gray-200">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="paper-plane" size={20} color={COLORS.primary.DEFAULT} />
                  <Text className="text-base font-bold text-gray-800 ml-2">발송 정보</Text>
                </View>

                <View className="flex-row justify-between mb-2">
                  <Text className="text-sm text-gray-600">발송일시</Text>
                  <Text className="text-sm font-semibold text-gray-800">
                    {selectedNotice.date} {selectedNotice.time}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">확인 현황</Text>
                  <Text className="text-sm font-semibold text-primary">
                    {selectedNotice.confirmed}/{selectedNotice.total}명 확인
                  </Text>
                </View>
              </View>

              {/* 알림장 내용 카드 */}
              <View className="bg-white rounded-2xl p-5 mb-4 border border-gray-200">
                {/* 제목 */}
                <Text className="text-xl font-bold text-gray-800 mb-4">
                  {selectedNotice.title}
                </Text>

                {/* 내용 */}
                <View className="bg-gray-50 rounded-xl p-4">
                  <Text className="text-base text-gray-700 leading-6">
                    {selectedNotice.content}
                  </Text>
                </View>
              </View>

              {/* 액션 버튼들 */}
              <View className="mb-6">
                <TouchableOpacity
                  className="bg-primary rounded-2xl p-4 flex-row items-center justify-center mb-3"
                  activeOpacity={0.8}
                  onPress={() => Alert.alert('알림', '재발송 되었습니다.')}
                >
                  <Ionicons name="refresh" size={20} color="white" />
                  <Text className="text-white text-base font-bold ml-2">미확인자에게 재발송</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-white border border-gray-300 rounded-2xl p-4 flex-row items-center justify-center"
                  activeOpacity={0.7}
                  onPress={handleCloseDetail}
                >
                  <Text className="text-gray-700 text-base font-semibold">목록으로 돌아가기</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
