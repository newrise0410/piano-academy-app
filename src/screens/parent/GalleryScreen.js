// src/screens/parent/GalleryScreen.js
import React from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Text from '../../components/common/Text';
import Card from '../../components/common/Card';
import { galleryItems, timeline, achievements } from '../../data/mockParentData';
import PARENT_COLORS from '../../styles/parentColors';

export default function GalleryScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 py-4">
          {/* 최근 업로드 */}
          <Card>
            <Text className="text-gray-800 font-bold text-lg mb-4">최근 순간들</Text>
            <View className="flex-row flex-wrap -mx-1">
              {galleryItems.map((item) => (
                <View key={item.id} className="w-1/3 p-1">
                  <View
                    className="aspect-square rounded-xl items-center justify-center"
                    style={{ backgroundColor: PARENT_COLORS.gray[50] }}
                  >
                    {item.type === 'image' ? (
                      <Text style={{ fontSize: 40 }}>{item.emoji}</Text>
                    ) : (
                      <Ionicons name="image-outline" size={32} color={PARENT_COLORS.gray[300]} />
                    )}
                  </View>
                </View>
              ))}
            </View>
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
                      backgroundColor: event.type === 'achievement' ? PARENT_COLORS.gallery.light : PARENT_COLORS.attendance.light
                    }}
                  >
                    <Ionicons
                      name={event.type === 'achievement' ? 'trophy' : 'star'}
                      size={20}
                      color={event.type === 'achievement' ? PARENT_COLORS.gallery.DEFAULT : PARENT_COLORS.attendance.DEFAULT}
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
                        PARENT_COLORS.gallery.DEFAULT,
                        PARENT_COLORS.tuition.DEFAULT,
                        PARENT_COLORS.primary.DEFAULT
                      ];
                      const bgColors = [
                        PARENT_COLORS.gallery.light,
                        PARENT_COLORS.tuition.light,
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
                      backgroundColor: badge.active ? PARENT_COLORS.gallery.light : PARENT_COLORS.gray[50]
                    }}
                  >
                    <Text style={{ fontSize: 28 }}>{badge.icon}</Text>
                    <Text
                      className="text-xs font-semibold text-center mt-1.5"
                      style={{ color: badge.active ? PARENT_COLORS.gallery.text : PARENT_COLORS.gray[500] }}
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
    </SafeAreaView>
  );
}
