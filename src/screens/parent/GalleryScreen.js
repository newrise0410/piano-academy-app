// src/screens/parent/GalleryScreen.js
import React, { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card, ScreenHeader, ImageGrid, GalleryDetailModal, FilterChip } from '../../components/common';
import { galleryItems, timeline, achievements } from '../../data/mockParentData';
import PARENT_COLORS, { PARENT_GRADIENTS, PARENT_SEMANTIC_COLORS, PARENT_OVERLAY_COLORS } from '../../styles/parent_colors';

export default function GalleryScreen() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewerVisible, setViewerVisible] = useState(false);

  // 좋아요와 댓글 필드가 없는 아이템에 추가
  const [items, setItems] = useState(
    galleryItems.map(item => ({
      ...item,
      likes: item.likes || 0,
      comments: item.comments || [],
    }))
  );

  const categories = [
    { value: 'all', label: '전체' },
    { value: 'lesson', label: '수업' },
    { value: 'practice', label: '연습' },
    { value: 'event', label: '이벤트' },
    { value: 'achievement', label: '성취' },
  ];

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') {
      return items;
    }
    return items.filter(item => item.category === selectedCategory);
  }, [selectedCategory, items]);

  const handleItemPress = (item) => {
    setSelectedItem(item);
    setViewerVisible(true);
  };

  const handleLike = (itemId) => {
    setItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, likes: item.likes + 1 } : item
      )
    );
  };

  const handleComment = (itemId, newComment) => {
    setItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, comments: [...item.comments, newComment] }
          : item
      )
    );
  };

  const imageCount = filteredItems.filter(item => item.type === 'image').length;
  const videoCount = filteredItems.filter(item => item.type === 'video').length;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScreenHeader title="갤러리" colorScheme="parent" />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 py-4">
          {/* 통계 */}
          <View className="flex-row mb-4">
            <View className="flex-1 mr-2">
              <View className="bg-white rounded-xl p-4 items-center shadow-sm">
                <View className="w-12 h-12 rounded-full items-center justify-center mb-2" style={{ backgroundColor: PARENT_COLORS.primary[50] }}>
                  <Ionicons name="image" size={24} color={PARENT_COLORS.primary.DEFAULT} />
                </View>
                <Text className="text-2xl font-bold text-gray-800">{imageCount}</Text>
                <Text className="text-xs mt-1" style={{ color: PARENT_COLORS.gray[500] }}>사진</Text>
              </View>
            </View>
            <View className="flex-1 ml-2">
              <View className="bg-white rounded-xl p-4 items-center shadow-sm">
                <View className="w-12 h-12 rounded-full items-center justify-center mb-2" style={{ backgroundColor: PARENT_COLORS.blue[50] }}>
                  <Ionicons name="videocam" size={24} color={PARENT_COLORS.blue[600]} />
                </View>
                <Text className="text-2xl font-bold text-gray-800">{videoCount}</Text>
                <Text className="text-xs mt-1" style={{ color: PARENT_COLORS.gray[500] }}>영상</Text>
              </View>
            </View>
          </View>

          {/* 카테고리 필터 */}
          <View className="mb-4">
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
              <Text className="text-sm" style={{ color: PARENT_COLORS.gray[500] }}>
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
                <Ionicons name="image-outline" size={48} color={PARENT_COLORS.gray[300]} />
                <Text className="text-gray-500 mt-3">아직 등록된 사진이 없어요</Text>
              </View>
            )}
          </Card>

          {/* 타임라인 */}
          <Card className="mt-4">
            <Text className="text-gray-800 font-bold text-lg mb-4">성장 타임라인</Text>
            {timeline.map((event, index) => (
              <View
                key={event.id}
                className={`${index !== 0 ? 'pt-4' : ''} ${index !== timeline.length - 1 ? 'pb-4 border-b' : ''}`}
                style={{ borderColor: PARENT_COLORS.gray[100] }}
              >
                <View className="flex-row items-start mb-3">
                  <View
                    className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                    style={{
                      backgroundColor: event.type === 'achievement' ? PARENT_COLORS.primary[50] : PARENT_COLORS.success[50]
                    }}
                  >
                    <Ionicons
                      name={event.type === 'achievement' ? 'trophy' : 'star'}
                      size={20}
                      color={event.type === 'achievement' ? PARENT_COLORS.primary.DEFAULT : PARENT_COLORS.success.DEFAULT}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-800 font-bold mb-1">{event.title}</Text>
                    <Text className="text-sm mb-2" style={{ color: PARENT_COLORS.gray[600] }}>
                      {event.description}
                    </Text>
                    <Text className="text-xs" style={{ color: PARENT_COLORS.gray[500] }}>
                      {event.date}
                    </Text>
                  </View>
                </View>
                {event.hasMedia && (
                  <View className="flex-row -mx-1">
                    {[...Array(event.mediaCount)].map((_, i) => {
                      const iconColors = [
                        PARENT_COLORS.primary.DEFAULT,
                        PARENT_COLORS.blue[500],
                        PARENT_COLORS.primary.DEFAULT
                      ];
                      const bgColors = [
                        PARENT_COLORS.primary[50],
                        PARENT_COLORS.blue[50],
                        PARENT_COLORS.primary[100]
                      ];
                      return (
                        <View key={i} className="flex-1 mx-1">
                          <View
                            className="aspect-square rounded-lg items-center justify-center"
                            style={{ backgroundColor: bgColors[i] }}
                          >
                            <Ionicons
                              name={i === 0 ? 'musical-notes' : i === 1 ? 'videocam' : 'image'}
                              size={24}
                              color={iconColors[i]}
                            />
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            ))}
          </Card>

          {/* 성취 배지 */}
          <Card className="mt-4 mb-5">
            <Text className="text-gray-800 font-bold text-lg mb-4">성취 배지</Text>
            <View className="flex-row flex-wrap -mx-1">
              {achievements.map((badge) => (
                <View key={badge.id} className="w-1/4 p-1">
                  <View
                    className={`items-center p-3 rounded-xl ${!badge.active && 'opacity-40'}`}
                    style={{
                      backgroundColor: badge.active ? PARENT_COLORS.primary[50] : PARENT_COLORS.gray[50]
                    }}
                  >
                    <Text style={{ fontSize: 28 }}>{badge.icon}</Text>
                    <Text
                      className="text-xs font-semibold text-center mt-1.5"
                      style={{ color: badge.active ? PARENT_COLORS.primary[600] : PARENT_COLORS.gray[500] }}
                    >
                      {badge.name}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
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
      />
    </SafeAreaView>
  );
}
