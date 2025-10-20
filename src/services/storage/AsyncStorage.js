// src/services/storage/AsyncStorage.js
// AsyncStorage를 사용한 로컬 데이터 저장

import AsyncStorage from '@react-native-async-storage/async-storage';

// 스토리지 키 상수
const STORAGE_KEYS = {
  AUTH_TOKEN: '@piano_academy:auth_token',
  USER_DATA: '@piano_academy:user_data',
  SELECTED_CHILD: '@piano_academy:selected_child',
  CACHED_DATA: '@piano_academy:cached_data',
};

// 인증 토큰 관련
export const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    return token;
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
};

export const setAuthToken = async (token) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    return true;
  } catch (error) {
    console.error('Failed to set auth token:', error);
    return false;
  }
};

export const removeAuthToken = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    return true;
  } catch (error) {
    console.error('Failed to remove auth token:', error);
    return false;
  }
};

// 사용자 데이터 관련
export const getUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Failed to get user data:', error);
    return null;
  }
};

export const setUserData = async (userData) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    return true;
  } catch (error) {
    console.error('Failed to set user data:', error);
    return false;
  }
};

export const removeUserData = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
    return true;
  } catch (error) {
    console.error('Failed to remove user data:', error);
    return false;
  }
};

// 선택된 자녀 (학부모용)
export const getSelectedChild = async () => {
  try {
    const childId = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_CHILD);
    return childId;
  } catch (error) {
    console.error('Failed to get selected child:', error);
    return null;
  }
};

export const setSelectedChild = async (childId) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_CHILD, childId);
    return true;
  } catch (error) {
    console.error('Failed to set selected child:', error);
    return false;
  }
};

// 캐시 데이터 관련
export const getCachedData = async (key) => {
  try {
    const cacheKey = `${STORAGE_KEYS.CACHED_DATA}:${key}`;
    const data = await AsyncStorage.getItem(cacheKey);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to get cached data:', error);
    return null;
  }
};

export const setCachedData = async (key, data, ttl = 3600000) => {
  // ttl: Time to live (기본 1시간)
  try {
    const cacheKey = `${STORAGE_KEYS.CACHED_DATA}:${key}`;
    const cacheData = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    return true;
  } catch (error) {
    console.error('Failed to set cached data:', error);
    return false;
  }
};

export const isCacheValid = async (key) => {
  try {
    const cacheKey = `${STORAGE_KEYS.CACHED_DATA}:${key}`;
    const cached = await AsyncStorage.getItem(cacheKey);
    if (!cached) return false;

    const { timestamp, ttl } = JSON.parse(cached);
    return Date.now() - timestamp < ttl;
  } catch (error) {
    console.error('Failed to check cache validity:', error);
    return false;
  }
};

export const clearCache = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((key) => key.startsWith(STORAGE_KEYS.CACHED_DATA));
    await AsyncStorage.multiRemove(cacheKeys);
    return true;
  } catch (error) {
    console.error('Failed to clear cache:', error);
    return false;
  }
};

// 모든 데이터 삭제 (로그아웃 시 사용)
export const clearAllData = async () => {
  try {
    await AsyncStorage.clear();
    return true;
  } catch (error) {
    console.error('Failed to clear all data:', error);
    return false;
  }
};

export default {
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  getUserData,
  setUserData,
  removeUserData,
  getSelectedChild,
  setSelectedChild,
  getCachedData,
  setCachedData,
  isCacheValid,
  clearCache,
  clearAllData,
};
