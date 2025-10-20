// src/components/common/ImageUploadButton.js
import React from 'react';
import { TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Text from './Text';

export default function ImageUploadButton({ onImageSelected, type = 'image', iconSize = 24, iconColor = 'white' }) {
  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진 업로드를 위해 갤러리 접근 권한이 필요합니다.');
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: type === 'video' ? ImagePicker.MediaTypeOptions.Videos : ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'video' ? undefined : [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onImageSelected && onImageSelected(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('오류', '이미지를 불러오는 중 오류가 발생했습니다.');
      console.error(error);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진 촬영을 위해 카메라 접근 권한이 필요합니다.');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onImageSelected && onImageSelected(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('오류', '사진을 촬영하는 중 오류가 발생했습니다.');
      console.error(error);
    }
  };

  const handlePress = () => {
    Alert.alert(
      type === 'video' ? '영상 업로드' : '사진 업로드',
      type === 'video' ? '영상을 선택하세요' : '사진을 선택하세요',
      [
        { text: '취소', style: 'cancel' },
        type !== 'video' && { text: '카메라로 촬영', onPress: takePhoto },
        { text: '갤러리에서 선택', onPress: pickImage },
      ].filter(Boolean)
    );
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <Ionicons
        name={type === 'video' ? 'videocam' : 'camera'}
        size={iconSize}
        color={iconColor}
      />
    </TouchableOpacity>
  );
}
