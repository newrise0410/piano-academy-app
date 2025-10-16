import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Text from '../../components/common/Text';

export default function LoginScreen() {
  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="flex-1 items-center justify-center">
        <Text className="text-3xl font-bold text-white">🎹 피아노학원</Text>
        <Text className="text-white mt-2">로그인 화면</Text>
      </View>
    </SafeAreaView>
  );
}