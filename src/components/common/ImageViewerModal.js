// src/components/common/ImageViewerModal.js
import React from 'react';
import { View, Modal, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Text from './Text';

const { width, height } = Dimensions.get('window');

export default function ImageViewerModal({ visible, onClose, item }) {
  if (!item) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-black">
        {/* 헤더 */}
        <View className="px-5 py-3 flex-row items-center justify-between">
          <View className="flex-1">
            {item.title && (
              <Text className="text-white text-lg font-bold">{item.title}</Text>
            )}
            {item.date && (
              <Text className="text-white/70 text-sm mt-0.5">{item.date}</Text>
            )}
          </View>
          <TouchableOpacity
            onPress={onClose}
            className="ml-3 w-10 h-10 rounded-full bg-white/10 items-center justify-center"
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* 이미지 */}
        <View className="flex-1 items-center justify-center">
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={{ width, height: height * 0.7 }}
              resizeMode="contain"
            />
          ) : (
            <Text style={{ fontSize: 120 }}>{item.emoji || '📷'}</Text>
          )}
        </View>

        {/* 설명 */}
        {item.description && (
          <View className="px-5 py-4 bg-black/50">
            <Text className="text-white text-sm leading-5">
              {item.description}
            </Text>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}
