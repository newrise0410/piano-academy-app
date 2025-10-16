// src/screens/parent/HomeScreen.js
import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Text from '../../components/common/Text';

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-pink">
      <View className="bg-pink px-5 pt-2 pb-8">
        <Text className="text-white text-xl font-bold">우리 아이</Text>
      </View>

      <View className="flex-1 bg-gray-50">
        {/* 내용 */}
      </View>
    </SafeAreaView>
  );
}