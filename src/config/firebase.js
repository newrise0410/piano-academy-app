// src/config/firebase.js
// Firebase 초기화 및 설정 (Firebase v12.4.0 기준)

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence
} from 'firebase/auth';
import {
  getFirestore,
  connectFirestoreEmulator
} from 'firebase/firestore';
import {
  getStorage
} from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase 설정
// Expo의 환경변수는 EXPO_PUBLIC_ 접두사로 시작해야 클라이언트에서 접근 가능합니다
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Firebase 앱 초기화
let app;
let auth;
let db;
let storage;

try {
  // Firebase 앱 초기화
  app = initializeApp(firebaseConfig);

  // React Native용 Auth 초기화
  // getAuth() 대신 initializeAuth()를 사용하여 AsyncStorage persistence 설정
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    // 이미 초기화된 경우 (Hot Reload 시)
    if (error.code === 'auth/already-initialized') {
      auth = getAuth(app);
    } else {
      throw error;
    }
  }

  // Firestore 초기화
  db = getFirestore(app);

  // Storage 초기화
  storage = getStorage(app);

  console.log('✅ Firebase v12.4.0 initialized successfully');

  // 개발 환경에서 Firestore Emulator 사용 (선택사항)
  // if (__DEV__ && process.env.EXPO_PUBLIC_USE_FIRESTORE_EMULATOR === 'true') {
  //   connectFirestoreEmulator(db, 'localhost', 8080);
  //   console.log('🔧 Connected to Firestore Emulator');
  // }

} catch (error) {
  console.error('❌ Firebase initialization error:', error);
}

// Firebase 서비스 내보내기
export { app, auth, db, storage };

// Firebase 초기화 상태 확인 함수
export const isFirebaseConfigured = () => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
  );
};

// Firebase 버전 정보
export const FIREBASE_VERSION = '12.4.0';
