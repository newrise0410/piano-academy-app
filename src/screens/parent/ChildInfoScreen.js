import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Text from '../../components/common/Text';

export default function ChildInfoScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 items-center justify-center">
        <Text className="text-2xl font-bold text-gray-800">👶 우리 아이 정보</Text>
        <Text className="text-gray-600 mt-2">곧 만들어질 화면입니다</Text>
      </View>
    </SafeAreaView>
  );
}