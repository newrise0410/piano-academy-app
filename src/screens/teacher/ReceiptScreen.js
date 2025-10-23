// src/screens/teacher/ReceiptScreen.js
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, ScreenHeader } from '../../components/common';
import { useToastStore } from '../../store';

export default function ReceiptScreen({ navigation }) {
  const toast = useToastStore();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const handleFeature = (featureName) => {
    toast.info(`${featureName} 기능은 준비중입니다`);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScreenHeader
        title="영수증/정산서"
        onBack={() => navigation.goBack()}
      />

      <ScrollView className="flex-1">
        <View className="px-5 py-4">
          {/* 영수증 발급 */}
          <View className="mb-6">
            <Text className="text-gray-900 font-bold text-lg mb-3">영수증 발급</Text>

            <TouchableOpacity
              onPress={() => handleFeature('개별 영수증 발급')}
              activeOpacity={0.7}
              className="bg-white rounded-2xl p-5 mb-3"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View className="flex-row items-center">
                <View className="bg-blue-100 rounded-full p-3 mr-3">
                  <Ionicons name="receipt" size={24} color="#3B82F6" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-bold text-base mb-1">
                    개별 영수증 발급
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    학생별 수강료 영수증
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#D1D5DB" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleFeature('일괄 영수증 발급')}
              activeOpacity={0.7}
              className="bg-white rounded-2xl p-5 mb-3"
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
                  <Ionicons name="documents" size={24} color="#A855F7" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-bold text-base mb-1">
                    일괄 영수증 발급
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    전체 학생 한번에 발급
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#D1D5DB" />
              </View>
            </TouchableOpacity>
          </View>

          {/* 정산서 */}
          <View className="mb-6">
            <Text className="text-gray-900 font-bold text-lg mb-3">정산서</Text>

            <TouchableOpacity
              onPress={() => handleFeature('월별 정산서')}
              activeOpacity={0.7}
              className="bg-white rounded-2xl p-5 mb-3"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View className="flex-row items-center">
                <View className="bg-green-100 rounded-full p-3 mr-3">
                  <Ionicons name="calendar" size={24} color="#10B981" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-bold text-base mb-1">
                    월별 정산서
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    수입/지출 내역 PDF 출력
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#D1D5DB" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleFeature('엑셀 다운로드')}
              activeOpacity={0.7}
              className="bg-white rounded-2xl p-5 mb-3"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View className="flex-row items-center">
                <View className="bg-emerald-100 rounded-full p-3 mr-3">
                  <Ionicons name="document-text" size={24} color="#059669" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-bold text-base mb-1">
                    엑셀 다운로드
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    전체 내역 엑셀 파일로 저장
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#D1D5DB" />
              </View>
            </TouchableOpacity>
          </View>

          {/* 발급 이력 */}
          <View>
            <Text className="text-gray-900 font-bold text-lg mb-3">발급 이력</Text>

            <View className="bg-white rounded-2xl p-8 items-center"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <Ionicons name="folder-open-outline" size={48} color="#9CA3AF" />
              <Text className="text-gray-400 text-sm mt-2">
                발급된 영수증/정산서가 없습니다
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
