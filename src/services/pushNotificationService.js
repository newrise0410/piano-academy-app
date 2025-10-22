// src/services/pushNotificationService.js
// Expo Push Notifications 서비스
import { Platform } from 'react-native';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

let Notifications = null;
let Device = null;
let notificationsAvailable = false;

// 안전하게 모듈 로드 (Expo Go에서는 SDK 53부터 지원 안함)
try {
  const NotificationModule = require('expo-notifications');
  const DeviceModule = require('expo-device');

  Notifications = NotificationModule;
  Device = DeviceModule;
  notificationsAvailable = true;

  // 알림 핸들러 설정
  if (Notifications?.setNotificationHandler) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }
} catch (error) {
  console.log('⚠️ 푸시 알림 비활성화 (Expo Go에서는 Development Build 필요)');
  notificationsAvailable = false;
}

/**
 * 푸시 알림 권한 요청 및 토큰 가져오기
 * @returns {Promise<string|null>} 푸시 토큰 또는 null
 */
export const registerForPushNotifications = async () => {
  // 알림 모듈을 사용할 수 없으면 null 반환
  if (!notificationsAvailable || !Notifications || !Device) {
    return null;
  }

  let token = null;

  // 실제 디바이스에서만 푸시 알림 등록
  if (!Device.isDevice) {
    console.log('푸시 알림은 실제 디바이스에서만 작동합니다');
    return null;
  }

  try {
    // 기존 권한 확인
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // 권한이 없으면 요청
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('푸시 알림 권한이 거부되었습니다');
      return null;
    }

    // Expo Push Token 가져오기
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID, // Expo 프로젝트 ID
    });
    token = tokenData.data;

    // Android 채널 설정
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: '기본 알림',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return token;
  } catch (error) {
    console.error('푸시 토큰 등록 오류:', error);
    return null;
  }
};

/**
 * 사용자의 푸시 토큰을 Firestore에 저장
 * @param {string} userId - 사용자 ID
 * @param {string} token - 푸시 토큰
 * @param {string} userType - 'teacher' | 'parent'
 * @returns {Promise<boolean>} 성공 여부
 */
export const savePushToken = async (userId, token, userType = 'parent') => {
  if (!userId || !token) return false;

  try {
    const collection = userType === 'teacher' ? 'teachers' : 'students';
    const userRef = doc(db, collection, userId);

    await updateDoc(userRef, {
      pushToken: token,
      pushTokenUpdatedAt: new Date().toISOString(),
    });

    console.log('푸시 토큰 저장 완료:', token);
    return true;
  } catch (error) {
    console.error('푸시 토큰 저장 오류:', error);
    return false;
  }
};

/**
 * Expo Push API를 사용하여 푸시 알림 전송
 * @param {string|Array} pushTokens - 푸시 토큰 (단일 또는 배열)
 * @param {Object} notification - 알림 데이터
 * @returns {Promise<Object>} 결과
 */
export const sendPushNotification = async (pushTokens, notification) => {
  try {
    // 배열이 아니면 배열로 변환
    const tokens = Array.isArray(pushTokens) ? pushTokens : [pushTokens];

    // 유효한 토큰만 필터링
    const validTokens = tokens.filter(token => token && token.startsWith('ExponentPushToken'));

    if (validTokens.length === 0) {
      console.log('유효한 푸시 토큰이 없습니다');
      return { success: false, error: 'No valid tokens' };
    }

    // 메시지 배열 생성
    const messages = validTokens.map(token => ({
      to: token,
      sound: 'default',
      title: notification.title || '피아노 학원',
      body: notification.body || '',
      data: notification.data || {},
      badge: 1,
    }));

    // Expo Push API로 전송
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    const result = await response.json();
    console.log('푸시 알림 전송 결과:', result);

    return { success: true, result };
  } catch (error) {
    console.error('푸시 알림 전송 오류:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 학생들의 푸시 토큰 가져오기
 * @param {Array} studentIds - 학생 ID 배열
 * @returns {Promise<Array>} 푸시 토큰 배열
 */
export const getStudentPushTokens = async (studentIds) => {
  const tokens = [];

  try {
    for (const studentId of studentIds) {
      const studentRef = doc(db, 'students', studentId);
      const studentSnap = await getDoc(studentRef);

      if (studentSnap.exists()) {
        const studentData = studentSnap.data();
        if (studentData.pushToken) {
          tokens.push(studentData.pushToken);
        }
      }
    }

    return tokens;
  } catch (error) {
    console.error('학생 푸시 토큰 가져오기 오류:', error);
    return [];
  }
};

/**
 * 알림장 발송 시 푸시 알림 전송
 * @param {Array} studentIds - 수신 학생 ID 배열
 * @param {string} noticeTitle - 알림장 제목
 * @returns {Promise<Object>} 결과
 */
export const sendNoticeNotification = async (studentIds, noticeTitle) => {
  try {
    const pushTokens = await getStudentPushTokens(studentIds);

    if (pushTokens.length === 0) {
      console.log('푸시 토큰이 없는 학생들입니다');
      return { success: false, message: 'No tokens' };
    }

    const notification = {
      title: '새 알림장이 도착했어요 📝',
      body: noticeTitle,
      data: { type: 'notice', screen: 'NoticeScreen' },
    };

    return await sendPushNotification(pushTokens, notification);
  } catch (error) {
    console.error('알림장 푸시 알림 전송 오류:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 댓글 작성 시 푸시 알림 전송
 * @param {string} noticeId - 알림장 ID
 * @param {string} commenterName - 댓글 작성자 이름
 * @param {string} recipientId - 수신자 ID
 * @param {string} recipientType - 'teacher' | 'parent'
 * @returns {Promise<Object>} 결과
 */
export const sendCommentNotification = async (
  noticeId,
  commenterName,
  recipientId,
  recipientType = 'teacher'
) => {
  try {
    // 수신자의 푸시 토큰 가져오기
    const collection = recipientType === 'teacher' ? 'teachers' : 'students';
    const recipientRef = doc(db, collection, recipientId);
    const recipientSnap = await getDoc(recipientRef);

    if (!recipientSnap.exists()) {
      return { success: false, error: 'Recipient not found' };
    }

    const recipientData = recipientSnap.data();
    if (!recipientData.pushToken) {
      return { success: false, error: 'No push token' };
    }

    const notification = {
      title: '새 댓글이 달렸어요 💬',
      body: `${commenterName}님이 댓글을 남겼습니다`,
      data: { type: 'comment', noticeId, screen: 'NoticeDetail' },
    };

    return await sendPushNotification(recipientData.pushToken, notification);
  } catch (error) {
    console.error('댓글 푸시 알림 전송 오류:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 알림 리스너 설정
 * @param {Function} onNotification - 알림 수신 시 콜백
 * @param {Function} onNotificationResponse - 알림 클릭 시 콜백
 * @returns {Object} unsubscribe 함수들
 */
export const setupNotificationListeners = (onNotification, onNotificationResponse) => {
  // 알림 모듈을 사용할 수 없으면 빈 객체 반환
  if (!notificationsAvailable || !Notifications) {
    return { remove: () => {} };
  }

  // 앱이 포그라운드에 있을 때 알림 수신
  const notificationListener = Notifications.addNotificationReceivedListener(onNotification);

  // 사용자가 알림을 탭했을 때
  const responseListener = Notifications.addNotificationResponseReceivedListener(onNotificationResponse);

  return {
    remove: () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    },
  };
};
