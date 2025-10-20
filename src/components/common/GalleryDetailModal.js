// src/components/common/GalleryDetailModal.js
import React, { useState } from 'react';
import { View, Modal, ScrollView, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
// import * as FileSystem from 'expo-file-system';
// import * as MediaLibrary from 'expo-media-library';
import Text from './Text';

export default function GalleryDetailModal({ visible, onClose, item, onLike, onComment, onDelete }) {
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);

  if (!item) return null;

  const handleLike = () => {
    onLike && onLike(item.id);
  };

  const handleAddComment = () => {
    if (commentText.trim()) {
      const newComment = {
        id: Date.now().toString(),
        userName: '김세욱 선생님',
        text: commentText.trim(),
        date: new Date().toLocaleDateString('ko-KR').replace(/\. /g, '.').replace('.', ''),
      };
      onComment && onComment(item.id, newComment);
      setCommentText('');
    }
  };

  const handleDownload = async () => {
    // FileSystem과 MediaLibrary는 Expo Go에서 지원되지 않을 수 있습니다.
    // 개발 빌드나 프로덕션 빌드에서 사용 가능합니다.
    Alert.alert(
      '다운로드',
      '사진 다운로드 기능은 개발 빌드에서 사용 가능합니다.\n\n현재는 Mock 데이터이므로 실제 이미지가 없습니다.',
      [{ text: '확인' }]
    );

    /* 실제 구현 (개발 빌드에서 사용):
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '사진을 저장하려면 갤러리 접근 권한이 필요합니다.');
        return;
      }

      if (item.imageUrl) {
        const fileUri = FileSystem.documentDirectory + `${item.title}.jpg`;
        const downloadResult = await FileSystem.downloadAsync(item.imageUrl, fileUri);

        const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
        await MediaLibrary.createAlbumAsync('Piano Academy', asset, false);

        Alert.alert('성공', '사진이 저장되었습니다!');
      } else {
        Alert.alert('알림', '다운로드할 수 없는 사진입니다.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('오류', '사진 저장 중 오류가 발생했습니다.');
    }
    */
  };

  const handleDelete = () => {
    onDelete && onDelete(item.id);
  };

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-white">
        {/* 헤더 */}
        <View className="px-5 py-3 flex-row items-center justify-between border-b border-gray-200">
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={28} color="#374151" />
          </TouchableOpacity>
          <View className="flex-row items-center">
            <TouchableOpacity onPress={handleDownload} className="mr-4">
              <Ionicons name="download-outline" size={24} color="#374151" />
            </TouchableOpacity>
            {onDelete && (
              <TouchableOpacity onPress={handleDelete}>
                <Ionicons name="trash-outline" size={24} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* 이미지 */}
            <View className="bg-black">
              {item.imageUrl ? (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={{ width: '100%', aspectRatio: 1 }}
                  resizeMode="contain"
                />
              ) : (
                <View
                  style={{ width: '100%', aspectRatio: 1 }}
                  className="items-center justify-center"
                >
                  <Text style={{ fontSize: 120 }}>{item.emoji || '📷'}</Text>
                </View>
              )}
            </View>

            {/* 정보 */}
            <View className="px-5 py-4">
              {/* 제목 */}
              <Text className="text-xl font-bold text-gray-800 mb-2">{item.title}</Text>

              {/* 날짜 및 카테고리 */}
              <View className="flex-row items-center mb-3">
                <Text className="text-sm text-gray-500">{item.date}</Text>
                <View className="w-1 h-1 rounded-full bg-gray-400 mx-2" />
                <View className="px-2 py-0.5 rounded-full bg-purple-50">
                  <Text className="text-xs font-semibold text-purple-600">
                    {item.category === 'lesson' ? '수업' :
                     item.category === 'practice' ? '연습' :
                     item.category === 'event' ? '이벤트' : '성취'}
                  </Text>
                </View>
              </View>

              {/* 설명 */}
              {item.description && (
                <Text className="text-gray-700 leading-6 mb-4">{item.description}</Text>
              )}

              {/* 학생 태그 */}
              {item.studentNames && item.studentNames.length > 0 && (
                <View className="mb-4">
                  <View className="flex-row flex-wrap">
                    {item.studentNames.map((name, index) => (
                      <View
                        key={index}
                        className="mr-2 mb-2 px-3 py-1 rounded-full bg-gray-100"
                      >
                        <Text className="text-sm text-gray-700">{name}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* 좋아요 및 댓글 버튼 */}
              <View className="flex-row items-center py-3 border-t border-b border-gray-200">
                <TouchableOpacity
                  onPress={handleLike}
                  className="flex-row items-center mr-6"
                >
                  <Ionicons
                    name={item.likes > 0 ? 'heart' : 'heart-outline'}
                    size={24}
                    color={item.likes > 0 ? '#EC4899' : '#6B7280'}
                  />
                  <Text className="ml-2 text-gray-700 font-semibold">
                    {item.likes > 0 ? item.likes : '좋아요'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowComments(!showComments)}
                  className="flex-row items-center"
                >
                  <Ionicons name="chatbubble-outline" size={22} color="#6B7280" />
                  <Text className="ml-2 text-gray-700 font-semibold">
                    {item.comments?.length > 0 ? `${item.comments.length}개` : '댓글'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 댓글 섹션 */}
              {showComments && (
                <View className="mt-4">
                  <Text className="text-base font-bold text-gray-800 mb-3">
                    댓글 {item.comments?.length || 0}개
                  </Text>

                  {/* 댓글 목록 */}
                  {item.comments && item.comments.length > 0 ? (
                    <View className="mb-4">
                      {item.comments.map((comment) => (
                        <View key={comment.id} className="mb-3 pb-3 border-b border-gray-100">
                          <View className="flex-row items-center mb-1">
                            <View className="w-8 h-8 rounded-full bg-purple-100 items-center justify-center mr-2">
                              <Ionicons name="person" size={16} color="#8B5CF6" />
                            </View>
                            <View className="flex-1">
                              <Text className="font-semibold text-gray-800">
                                {comment.userName}
                              </Text>
                              <Text className="text-xs text-gray-500">{comment.date}</Text>
                            </View>
                          </View>
                          <Text className="text-gray-700 ml-10">{comment.text}</Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text className="text-gray-500 text-center py-6">
                      첫 댓글을 남겨보세요
                    </Text>
                  )}

                  {/* 댓글 입력 */}
                  <View className="flex-row items-center pt-3 border-t border-gray-200">
                    <TextInput
                      value={commentText}
                      onChangeText={setCommentText}
                      placeholder="댓글을 입력하세요..."
                      className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-gray-800"
                      multiline
                      maxLength={200}
                    />
                    <TouchableOpacity
                      onPress={handleAddComment}
                      disabled={!commentText.trim()}
                      className="ml-2 w-10 h-10 rounded-full items-center justify-center"
                      style={{
                        backgroundColor: commentText.trim() ? '#8B5CF6' : '#E5E7EB',
                      }}
                    >
                      <Ionicons
                        name="send"
                        size={18}
                        color={commentText.trim() ? 'white' : '#9CA3AF'}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
