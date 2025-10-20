// src/components/common/ImageGrid.js
import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from './Text';

export default function ImageGrid({ items, onItemPress, columns = 3 }) {
  const columnWidth = `${100 / columns}%`;

  return (
    <View className="flex-row flex-wrap -mx-1">
      {items.map((item) => (
        <View key={item.id} className="p-1" style={{ width: columnWidth }}>
          <TouchableOpacity
            onPress={() => onItemPress && onItemPress(item)}
            activeOpacity={0.8}
            className="relative"
          >
            <View
              className="aspect-square rounded-xl items-center justify-center overflow-hidden"
              style={{ backgroundColor: '#F3F4F6' }}
            >
              {item.imageUrl ? (
                <Image
                  source={{ uri: item.imageUrl }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <Text style={{ fontSize: 40 }}>{item.emoji || '📷'}</Text>
              )}
            </View>

            {/* 비디오 표시 */}
            {item.type === 'video' && (
              <View className="absolute inset-0 items-center justify-center">
                <View className="w-10 h-10 rounded-full bg-black/50 items-center justify-center">
                  <Ionicons name="play" size={20} color="white" />
                </View>
              </View>
            )}

            {/* 날짜 표시 */}
            {item.date && (
              <View className="absolute bottom-1 left-1 right-1 bg-black/60 rounded px-1.5 py-0.5">
                <Text className="text-white text-[10px] font-semibold">
                  {item.date}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}
