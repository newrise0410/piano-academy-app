// src/screens/teacher/DiscountManagementScreen.js
import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, ScreenHeader } from '../../components/common';
import { useToastStore } from '../../store';

export default function DiscountManagementScreen({ navigation }) {
  const toast = useToastStore();

  const handleFeature = (featureName) => {
    toast.info(`${featureName} 기능은 준비중입니다`);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScreenHeader
        title="할인/할증 관리"
        onBack={() => navigation.goBack()}
      />

      <ScrollView className="flex-1">
        <View className="px-5 py-4">
          {/* 형제 할인 */}
          <TouchableOpacity
            onPress={() => handleFeature('형제 할인 설정')}
            activeOpacity={0.7}
            className="bg-white rounded-2xl p-6 mb-4"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View className="flex-row items-center mb-4">
              <View className="bg-blue-100 rounded-full p-3 mr-3">
                <Ionicons name="people" size={24} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-bold text-lg mb-1">형제 할인</Text>
                <Text className="text-gray-500 text-sm">2명 이상 등록 시 할인 혜택</Text>
              </View>
              <View className="items-end">
                <View className="bg-blue-50 rounded-full px-3 py-1">
                  <Text className="text-blue-600 font-bold text-xs">설정</Text>
                </View>
              </View>
            </View>
            <View className="bg-gray-50 rounded-xl p-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-gray-600 text-sm">2인 등록</Text>
                <Text className="text-gray-900 font-bold">10% 할인</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-600 text-sm">3인 이상</Text>
                <Text className="text-gray-900 font-bold">15% 할인</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* 조기 납부 할인 */}
          <TouchableOpacity
            onPress={() => handleFeature('조기 납부 할인 설정')}
            activeOpacity={0.7}
            className="bg-white rounded-2xl p-6 mb-4"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View className="flex-row items-center mb-4">
              <View className="bg-green-100 rounded-full p-3 mr-3">
                <Ionicons name="time" size={24} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-bold text-lg mb-1">조기 납부 할인</Text>
                <Text className="text-gray-500 text-sm">정산일 이전 납부 시 할인</Text>
              </View>
              <View className="items-end">
                <View className="bg-green-50 rounded-full px-3 py-1">
                  <Text className="text-green-600 font-bold text-xs">설정</Text>
                </View>
              </View>
            </View>
            <View className="bg-gray-50 rounded-xl p-4">
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-600 text-sm">7일 전 납부</Text>
                <Text className="text-gray-900 font-bold">5% 할인</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* 연체료 */}
          <TouchableOpacity
            onPress={() => handleFeature('연체료 설정')}
            activeOpacity={0.7}
            className="bg-white rounded-2xl p-6 mb-4"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View className="flex-row items-center mb-4">
              <View className="bg-red-100 rounded-full p-3 mr-3">
                <Ionicons name="alert-circle" size={24} color="#EF4444" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-bold text-lg mb-1">연체료</Text>
                <Text className="text-gray-500 text-sm">기한 경과 시 추가 요금</Text>
              </View>
              <View className="items-end">
                <View className="bg-red-50 rounded-full px-3 py-1">
                  <Text className="text-red-600 font-bold text-xs">설정</Text>
                </View>
              </View>
            </View>
            <View className="bg-gray-50 rounded-xl p-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-gray-600 text-sm">7일 이상 연체</Text>
                <Text className="text-gray-900 font-bold">5,000원</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-600 text-sm">14일 이상 연체</Text>
                <Text className="text-gray-900 font-bold">10,000원</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* 특별 할인 */}
          <TouchableOpacity
            onPress={() => handleFeature('특별 할인 추가')}
            activeOpacity={0.7}
            className="bg-white rounded-2xl p-6 mb-4"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View className="flex-row items-center">
              <View className="bg-purple-100 rounded-full p-3 mr-3">
                <Ionicons name="gift" size={24} color="#A855F7" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-bold text-lg mb-1">특별 할인</Text>
                <Text className="text-gray-500 text-sm">개별 학생 맞춤 할인</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#D1D5DB" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
