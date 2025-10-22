// src/components/common/MediaPicker.js
import React, { useState } from 'react';
import { View, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Text from './Text';
import TEACHER_COLORS from '../../styles/teacher_colors';

/**
 * 미디어 선택 컴포넌트
 * @param {Array} selectedMedia - 선택된 미디어 목록 [{ uri, type: 'image'|'video' }]
 * @param {Function} onMediaChange - 미디어 변경 콜백
 * @param {number} maxItems - 최대 선택 가능 개수 (기본: 5)
 * @param {boolean} allowVideo - 비디오 허용 여부 (기본: true)
 */
export default function MediaPicker({
  selectedMedia = [],
  onMediaChange,
  maxItems = 5,
  allowVideo = true,
}) {
  const [loading, setLoading] = useState(false);

  // 권한 요청
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        '권한 필요',
        '사진 및 비디오를 선택하려면 갤러리 접근 권한이 필요합니다.',
        [{ text: '확인' }]
      );
      return false;
    }
    return true;
  };

  // 이미지 선택
  const pickImage = async () => {
    if (selectedMedia.length >= maxItems) {
      Alert.alert('최대 개수 초과', `최대 ${maxItems}개까지 선택 가능합니다.`);
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      setLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: allowVideo
          ? ImagePicker.MediaTypeOptions.All
          : ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: maxItems - selectedMedia.length,
      });

      if (!result.canceled && result.assets) {
        const newMedia = result.assets.map(asset => ({
          uri: asset.uri,
          type: asset.type === 'video' ? 'video' : 'image',
        }));

        const updatedMedia = [...selectedMedia, ...newMedia].slice(0, maxItems);
        onMediaChange(updatedMedia);
      }
    } catch (error) {
      console.error('이미지 선택 오류:', error);
      Alert.alert('오류', '이미지를 선택하는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 카메라로 촬영
  const takePhoto = async () => {
    if (selectedMedia.length >= maxItems) {
      Alert.alert('최대 개수 초과', `최대 ${maxItems}개까지 선택 가능합니다.`);
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        '권한 필요',
        '사진을 촬영하려면 카메라 접근 권한이 필요합니다.',
        [{ text: '확인' }]
      );
      return;
    }

    try {
      setLoading(true);
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        const newMedia = {
          uri: result.assets[0].uri,
          type: 'image',
        };

        const updatedMedia = [...selectedMedia, newMedia];
        onMediaChange(updatedMedia);
      }
    } catch (error) {
      console.error('카메라 촬영 오류:', error);
      Alert.alert('오류', '사진을 촬영하는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 미디어 삭제
  const removeMedia = (index) => {
    const updatedMedia = selectedMedia.filter((_, i) => i !== index);
    onMediaChange(updatedMedia);
  };

  return (
    <View className="mb-4">
      {/* 선택된 미디어 미리보기 */}
      {selectedMedia.length > 0 && (
        <View className="flex-row flex-wrap mb-3">
          {selectedMedia.map((media, index) => (
            <View
              key={index}
              className="mr-2 mb-2 relative"
              style={{ width: 80, height: 80 }}
            >
              <Image
                source={{ uri: media.uri }}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 8,
                  backgroundColor: TEACHER_COLORS.gray[200],
                }}
                resizeMode="cover"
              />

              {/* 비디오 아이콘 */}
              {media.type === 'video' && (
                <View
                  className="absolute bottom-1 left-1 rounded px-1"
                  style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                >
                  <Ionicons name="videocam" size={12} color="white" />
                </View>
              )}

              {/* 삭제 버튼 */}
              <TouchableOpacity
                className="absolute -top-1 -right-1 rounded-full"
                style={{ backgroundColor: TEACHER_COLORS.red[500], padding: 2 }}
                onPress={() => removeMedia(index)}
              >
                <Ionicons name="close" size={14} color="white" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* 미디어 추가 버튼 */}
      {selectedMedia.length < maxItems && (
        <View className="flex-row">
          <TouchableOpacity
            className="flex-1 rounded-xl py-3 mr-2 flex-row items-center justify-center"
            style={{ backgroundColor: TEACHER_COLORS.purple[100] }}
            onPress={pickImage}
            disabled={loading}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator size="small" color={TEACHER_COLORS.primary.DEFAULT} />
            ) : (
              <>
                <Ionicons name="images-outline" size={20} color={TEACHER_COLORS.primary.DEFAULT} />
                <Text className="text-primary text-sm font-semibold ml-2">
                  갤러리에서 선택
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 rounded-xl py-3 ml-2 flex-row items-center justify-center"
            style={{ backgroundColor: TEACHER_COLORS.blue[100] }}
            onPress={takePhoto}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Ionicons name="camera-outline" size={20} color={TEACHER_COLORS.blue[600]} />
            <Text className="text-sm font-semibold ml-2" style={{ color: TEACHER_COLORS.blue[600] }}>
              사진 촬영
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 개수 표시 */}
      {selectedMedia.length > 0 && (
        <View className="mt-2">
          <Text className="text-xs text-gray-500 text-center">
            {selectedMedia.length}/{maxItems}개 선택됨
          </Text>
        </View>
      )}
    </View>
  );
}
