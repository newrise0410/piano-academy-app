import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Text from '../../components/common/Text';

export default function NoticeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 items-center justify-center">
        <Text className="text-2xl font-bold text-gray-800">📢 알림장</Text>
        <Text className="text-gray-600 mt-2">학부모용 알림장</Text>
      </View>
    </SafeAreaView>
  );
}