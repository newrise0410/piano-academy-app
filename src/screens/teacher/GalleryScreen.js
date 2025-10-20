// src/screens/teacher/GalleryScreen.js
import React, { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  Text,
  Card,
  ScreenHeader,
  ImageGrid,
  GalleryDetailModal,
  FilterChip,
  GalleryUploadModal,
} from '../../components/common';
import { teacherGalleryItems, albums } from '../../data/mockGalleryData';
import { useStudentStore, useToastStore } from '../../store';
import TEACHER_COLORS from '../../styles/teacher_colors';

export default function GalleryScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAlbum, setSelectedAlbum] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [galleryItems, setGalleryItems] = useState(teacherGalleryItems);

  const { students } = useStudentStore();
  const toast = useToastStore();

  const categories = [
    { value: 'all', label: '전체' },
    { value: 'lesson', label: '수업' },
    { value: 'practice', label: '연습' },
    { value: 'event', label: '이벤트' },
    { value: 'achievement', label: '성취' },
  ];

  const filteredItems = useMemo(() => {
    let items = galleryItems;

    if (selectedCategory !== 'all') {
      items = items.filter(item => item.category === selectedCategory);
    }

    if (selectedAlbum !== 'all') {
      items = items.filter(item => item.album === albums.find(a => a.id === selectedAlbum)?.name);
    }

    return items;
  }, [selectedCategory, selectedAlbum, galleryItems]);

  const handleItemPress = (item) => {
    setSelectedItem(item);
    setViewerVisible(true);
  };

  const handleUpload = (uploadData) => {
    const newItem = {
      id: Date.now().toString(),
      type: uploadData.image.type?.includes('video') ? 'video' : 'image',
      title: uploadData.title,
      date: new Date().toLocaleDateString('ko-KR').replace(/\. /g, '.').replace('.', ''),
      description: uploadData.description,
      category: uploadData.category,
      studentIds: uploadData.studentIds,
      studentNames: students
        .filter(s => uploadData.studentIds.includes(s.id))
        .map(s => s.name),
      uploadedBy: 'teacher',
      likes: 0,
      comments: [],
      imageUrl: uploadData.image.uri,
      album: uploadData.album,
    };

    setGalleryItems(prev => [newItem, ...prev]);
    toast.success('사진이 업로드되었습니다');
  };

  const handleLike = (itemId) => {
    setGalleryItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, likes: item.likes + 1 } : item
      )
    );
    toast.success('좋아요!');
  };

  const handleComment = (itemId, newComment) => {
    setGalleryItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, comments: [...(item.comments || []), newComment] }
          : item
      )
    );
    toast.success('댓글이 추가되었습니다');
  };

  const handleDelete = (itemId) => {
    Alert.alert(
      '삭제 확인',
      '이 사진을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            setGalleryItems(prev => prev.filter(item => item.id !== itemId));
            setViewerVisible(false);
            toast.success('사진이 삭제되었습니다');
          },
        },
      ]
    );
  };

  const imageCount = filteredItems.filter(item => item.type === 'image').length;
  const videoCount = filteredItems.filter(item => item.type === 'video').length;
  const totalLikes = filteredItems.reduce((sum, item) => sum + item.likes, 0);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScreenHeader
        title="갤러리"
        rightButton={
          <TouchableOpacity
            onPress={() => setUploadModalVisible(true)}
            className="w-9 h-9 rounded-full items-center justify-center"
            style={{ backgroundColor: TEACHER_COLORS.primary.DEFAULT }}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        }
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 py-4">
          {/* 통계 */}
          <View className="flex-row mb-4">
            <View className="flex-1 mr-1.5">
              <View className="bg-white rounded-xl p-3 items-center shadow-sm">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mb-1.5"
                  style={{ backgroundColor: TEACHER_COLORS.primary[50] }}
                >
                  <Ionicons name="image" size={20} color={TEACHER_COLORS.primary.DEFAULT} />
                </View>
                <Text className="text-xl font-bold text-gray-800">{imageCount}</Text>
                <Text className="text-xs mt-0.5" style={{ color: TEACHER_COLORS.gray[500] }}>
                  사진
                </Text>
              </View>
            </View>
            <View className="flex-1 mx-1.5">
              <View className="bg-white rounded-xl p-3 items-center shadow-sm">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mb-1.5"
                  style={{ backgroundColor: TEACHER_COLORS.blue[50] }}
                >
                  <Ionicons name="videocam" size={20} color={TEACHER_COLORS.blue[600]} />
                </View>
                <Text className="text-xl font-bold text-gray-800">{videoCount}</Text>
                <Text className="text-xs mt-0.5" style={{ color: TEACHER_COLORS.gray[500] }}>
                  영상
                </Text>
              </View>
            </View>
            <View className="flex-1 ml-1.5">
              <View className="bg-white rounded-xl p-3 items-center shadow-sm">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mb-1.5"
                  style={{ backgroundColor: TEACHER_COLORS.red[50] }}
                >
                  <Ionicons name="heart" size={20} color={TEACHER_COLORS.red[600]} />
                </View>
                <Text className="text-xl font-bold text-gray-800">{totalLikes}</Text>
                <Text className="text-xs mt-0.5" style={{ color: TEACHER_COLORS.gray[500] }}>
                  좋아요
                </Text>
              </View>
            </View>
          </View>

          {/* 앨범 필터 */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">앨범</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5 px-5">
              <View className="flex-row">
                {albums.map((album) => (
                  <FilterChip
                    key={album.id}
                    label={`${album.name} (${album.count})`}
                    selected={selectedAlbum === album.id}
                    onPress={() => setSelectedAlbum(album.id)}
                    className="mr-2"
                  />
                ))}
              </View>
            </ScrollView>
          </View>

          {/* 카테고리 필터 */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">카테고리</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5 px-5">
              <View className="flex-row">
                {categories.map((category) => (
                  <FilterChip
                    key={category.value}
                    label={category.label}
                    selected={selectedCategory === category.value}
                    onPress={() => setSelectedCategory(category.value)}
                    className="mr-2"
                  />
                ))}
              </View>
            </ScrollView>
          </View>

          {/* 사진/영상 그리드 */}
          <Card>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-gray-800 font-bold text-lg">
                {categories.find(c => c.value === selectedCategory)?.label || '전체'}
              </Text>
              <Text className="text-sm" style={{ color: TEACHER_COLORS.gray[500] }}>
                총 {filteredItems.length}개
              </Text>
            </View>

            {filteredItems.length > 0 ? (
              <ImageGrid
                items={filteredItems}
                onItemPress={handleItemPress}
                columns={3}
              />
            ) : (
              <View className="py-12 items-center">
                <Ionicons name="image-outline" size={48} color={TEACHER_COLORS.gray[300]} />
                <Text className="text-gray-500 mt-3">아직 등록된 사진이 없어요</Text>
                <TouchableOpacity
                  onPress={() => setUploadModalVisible(true)}
                  className="mt-4 px-6 py-2.5 rounded-full"
                  style={{ backgroundColor: TEACHER_COLORS.primary.DEFAULT }}
                >
                  <Text className="text-white font-semibold">첫 사진 업로드하기</Text>
                </TouchableOpacity>
              </View>
            )}
          </Card>
        </View>
      </ScrollView>

      {/* 이미지 상세 모달 */}
      <GalleryDetailModal
        visible={viewerVisible}
        onClose={() => setViewerVisible(false)}
        item={selectedItem}
        onLike={handleLike}
        onComment={handleComment}
        onDelete={handleDelete}
      />

      {/* 업로드 모달 */}
      <GalleryUploadModal
        visible={uploadModalVisible}
        onClose={() => setUploadModalVisible(false)}
        onUpload={handleUpload}
        students={students}
        albums={albums}
      />
    </SafeAreaView>
  );
}
