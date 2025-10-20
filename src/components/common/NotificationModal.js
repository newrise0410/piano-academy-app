import React from 'react';
import { View, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Text from './Text';
import TEACHER_COLORS from '../../styles/teacher_colors';
import { useNotificationStore, useAuthStore } from '../../store';

// 타입별 아이콘과 색상
const getNotificationStyle = (type) => {
  switch (type) {
    case 'payment':
      return { icon: 'card', color: TEACHER_COLORS.success.DEFAULT, bg: TEACHER_COLORS.success[50] };
    case 'notice':
      return { icon: 'notifications', color: TEACHER_COLORS.primary.DEFAULT, bg: TEACHER_COLORS.primary[50] };
    case 'makeup':
      return { icon: 'calendar', color: TEACHER_COLORS.blue[500], bg: TEACHER_COLORS.blue[50] };
    case 'attendance':
      return { icon: 'checkmark-circle', color: TEACHER_COLORS.purple[600], bg: TEACHER_COLORS.purple[50] };
    default:
      return { icon: 'information-circle', color: TEACHER_COLORS.gray[600], bg: TEACHER_COLORS.gray[50] };
  }
};

// 시간 포맷팅
const formatTimestamp = (timestamp) => {
  const now = new Date();
  const notifTime = new Date(timestamp);
  const diffMs = now - notifTime;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;

  const month = notifTime.getMonth() + 1;
  const day = notifTime.getDate();
  return `${month}월 ${day}일`;
};

/**
 * NotificationModal - 알림 목록 모달
 *
 * @param {boolean} visible - 모달 표시 여부
 * @param {function} onClose - 모달 닫기 핸들러
 */
export default function NotificationModal({ visible, onClose }) {
  const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotificationStore();
  const user = useAuthStore((state) => state.user);

  const handleNotificationPress = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    // TODO: 알림 타입에 따라 해당 화면으로 네비게이션
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
        {/* 헤더 */}
        <View className="bg-white border-b border-gray-200 px-5 py-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <TouchableOpacity onPress={onClose} className="mr-3">
                <Ionicons name="close" size={24} color={TEACHER_COLORS.gray[800]} />
              </TouchableOpacity>
              <View>
                <Text className="text-xl font-bold text-gray-800">알림</Text>
                {unreadCount > 0 && (
                  <Text className="text-sm text-gray-500 mt-0.5">
                    {unreadCount}개의 새 알림
                  </Text>
                )}
              </View>
            </View>
            {unreadCount > 0 && (
              <TouchableOpacity onPress={() => markAllAsRead(user?.uid)}>
                <Text className="text-sm font-semibold text-primary">모두 읽음</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 알림 목록 */}
        <ScrollView className="flex-1">
          {notifications.length === 0 ? (
            <View className="flex-1 items-center justify-center py-20">
              <Ionicons name="notifications-outline" size={64} color={TEACHER_COLORS.gray[300]} />
              <Text className="text-gray-400 mt-4">알림이 없습니다</Text>
            </View>
          ) : (
            notifications.map((notification, index) => {
              const style = getNotificationStyle(notification.type);
              return (
                <TouchableOpacity
                  key={notification.id}
                  onPress={() => handleNotificationPress(notification)}
                  activeOpacity={0.7}
                  className={`px-5 py-4 flex-row items-start ${
                    index !== notifications.length - 1 ? 'border-b border-gray-100' : ''
                  } ${!notification.isRead ? 'bg-blue-50' : 'bg-white'}`}
                >
                  {/* 아이콘 */}
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3 mt-1"
                    style={{ backgroundColor: style.bg }}
                  >
                    <Ionicons name={style.icon} size={20} color={style.color} />
                  </View>

                  {/* 내용 */}
                  <View className="flex-1">
                    <View className="flex-row items-start justify-between mb-1">
                      <Text
                        className={`flex-1 text-base ${
                          notification.isRead ? 'text-gray-800' : 'text-gray-900 font-bold'
                        }`}
                      >
                        {notification.title}
                      </Text>
                      {!notification.isRead && (
                        <View
                          className="w-2 h-2 rounded-full ml-2 mt-1"
                          style={{ backgroundColor: TEACHER_COLORS.primary.DEFAULT }}
                        />
                      )}
                    </View>
                    <Text className="text-sm text-gray-600 mb-2">
                      {notification.message}
                    </Text>
                    <Text className="text-xs text-gray-400">
                      {formatTimestamp(notification.timestamp)}
                    </Text>
                  </View>

                  {/* 삭제 버튼 */}
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    className="ml-2 p-2"
                  >
                    <Ionicons name="close-circle" size={20} color={TEACHER_COLORS.gray[400]} />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
