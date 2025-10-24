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
import { SPACING, TYPOGRAPHY, RADIUS, SHADOWS, CARD_STYLES, ICON_CONTAINER } from '../../styles/commonStyles';

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
    <SafeAreaView style={{ flex: 1, backgroundColor: TEACHER_COLORS.gray[50] }}>
      <ScreenHeader
        title="갤러리"
        rightButton={
          <TouchableOpacity
            onPress={() => setUploadModalVisible(true)}
            style={{
              ...ICON_CONTAINER.round(TEACHER_COLORS.primary.DEFAULT, 36),
            }}
          >
            <Ionicons name="add" size={24} color={TEACHER_COLORS.white} />
          </TouchableOpacity>
        }
      />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg }}>
          {/* 통계 */}
          <View style={{ flexDirection: 'row', marginBottom: SPACING.lg }}>
            <View style={{ flex: 1, marginRight: SPACING.xs + 2 }}>
              <View
                style={{
                  ...CARD_STYLES.default,
                  alignItems: 'center',
                  padding: SPACING.md,
                }}
              >
                <View
                  style={{
                    ...ICON_CONTAINER.round(TEACHER_COLORS.primary[50], 40),
                    marginBottom: SPACING.xs + 2,
                  }}
                >
                  <Ionicons name="image" size={20} color={TEACHER_COLORS.primary.DEFAULT} />
                </View>
                <Text style={{ fontSize: TYPOGRAPHY.fontSize.xl, fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.gray[800] }}>
                  {imageCount}
                </Text>
                <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs, marginTop: 2, color: TEACHER_COLORS.gray[500] }}>
                  사진
                </Text>
              </View>
            </View>
            <View style={{ flex: 1, marginHorizontal: SPACING.xs + 2 }}>
              <View
                style={{
                  ...CARD_STYLES.default,
                  alignItems: 'center',
                  padding: SPACING.md,
                }}
              >
                <View
                  style={{
                    ...ICON_CONTAINER.round(TEACHER_COLORS.blue[50], 40),
                    marginBottom: SPACING.xs + 2,
                  }}
                >
                  <Ionicons name="videocam" size={20} color={TEACHER_COLORS.blue[600]} />
                </View>
                <Text style={{ fontSize: TYPOGRAPHY.fontSize.xl, fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.gray[800] }}>
                  {videoCount}
                </Text>
                <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs, marginTop: 2, color: TEACHER_COLORS.gray[500] }}>
                  영상
                </Text>
              </View>
            </View>
            <View style={{ flex: 1, marginLeft: SPACING.xs + 2 }}>
              <View
                style={{
                  ...CARD_STYLES.default,
                  alignItems: 'center',
                  padding: SPACING.md,
                }}
              >
                <View
                  style={{
                    ...ICON_CONTAINER.round(TEACHER_COLORS.danger[50], 40),
                    marginBottom: SPACING.xs + 2,
                  }}
                >
                  <Ionicons name="heart" size={20} color={TEACHER_COLORS.danger[600]} />
                </View>
                <Text style={{ fontSize: TYPOGRAPHY.fontSize.xl, fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.gray[800] }}>
                  {totalLikes}
                </Text>
                <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs, marginTop: 2, color: TEACHER_COLORS.gray[500] }}>
                  좋아요
                </Text>
              </View>
            </View>
          </View>

          {/* 앨범 필터 */}
          <View style={{ marginBottom: SPACING.lg }}>
            <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: TEACHER_COLORS.gray[700], marginBottom: SPACING.sm }}>
              앨범
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -SPACING.xl }} contentContainerStyle={{ paddingHorizontal: SPACING.xl }}>
              <View style={{ flexDirection: 'row' }}>
                {albums.map((album) => (
                  <View key={album.id} style={{ marginRight: SPACING.sm }}>
                    <FilterChip
                      label={`${album.name} (${album.count})`}
                      selected={selectedAlbum === album.id}
                      onPress={() => setSelectedAlbum(album.id)}
                    />
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* 카테고리 필터 */}
          <View style={{ marginBottom: SPACING.lg }}>
            <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: TEACHER_COLORS.gray[700], marginBottom: SPACING.sm }}>
              카테고리
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -SPACING.xl }} contentContainerStyle={{ paddingHorizontal: SPACING.xl }}>
              <View style={{ flexDirection: 'row' }}>
                {categories.map((category) => (
                  <View key={category.value} style={{ marginRight: SPACING.sm }}>
                    <FilterChip
                      label={category.label}
                      selected={selectedCategory === category.value}
                      onPress={() => setSelectedCategory(category.value)}
                    />
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* 사진/영상 그리드 */}
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg }}>
              <Text style={{ fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.gray[800] }}>
                {categories.find(c => c.value === selectedCategory)?.label || '전체'}
              </Text>
              <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: TEACHER_COLORS.gray[500] }}>
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
              <View style={{ paddingVertical: SPACING['5xl'], alignItems: 'center' }}>
                <Ionicons name="image-outline" size={48} color={TEACHER_COLORS.gray[300]} />
                <Text style={{ fontSize: TYPOGRAPHY.fontSize.base, color: TEACHER_COLORS.gray[500], marginTop: SPACING.md }}>
                  아직 등록된 사진이 없어요
                </Text>
                <TouchableOpacity
                  onPress={() => setUploadModalVisible(true)}
                  style={{
                    marginTop: SPACING.lg,
                    paddingHorizontal: SPACING['2xl'],
                    paddingVertical: SPACING.sm + 2,
                    borderRadius: RADIUS['3xl'],
                    backgroundColor: TEACHER_COLORS.primary.DEFAULT,
                  }}
                >
                  <Text style={{ fontSize: TYPOGRAPHY.fontSize.base, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: TEACHER_COLORS.white }}>
                    첫 사진 업로드하기
                  </Text>
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
