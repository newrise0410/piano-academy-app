import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Text from '../../components/common/Text';

export default function StudentDetailScreen({ route, navigation }) {
  const { student } = route?.params || {};
  const [activeTab, setActiveTab] = useState('정보');
  const [memo, setMemo] = useState('');

  const tabs = ['정보', '진도', '출석', '수강료'];

  const handleGoBack = () => {
    if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case '정보':
        return (
          <View className="p-5">
            {/* 기본 정보 */}
            <View className="bg-white rounded-2xl p-4 mb-4">
              <Text className="text-base font-bold text-gray-800 mb-3">기본 정보</Text>

              <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                <Text className="text-sm text-gray-600">생년월일</Text>
                <Text className="text-sm font-semibold text-gray-800">2015.03.15</Text>
              </View>

              <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                <Text className="text-sm text-gray-600">등록일</Text>
                <Text className="text-sm font-semibold text-gray-800">2024.01.10</Text>
              </View>

              <View className="flex-row justify-between items-center py-2">
                <Text className="text-sm text-gray-600">연락처</Text>
                <Text className="text-sm font-semibold text-primary">김OO (010-1234-5678)</Text>
              </View>
            </View>

            {/* 현재 진도 */}
            <View className="bg-white rounded-2xl p-4 mb-4">
              <Text className="text-base font-bold text-gray-800 mb-3">현재 진도</Text>

              <View className="mb-3">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-sm text-gray-600">바이엘</Text>
                  <Text className="text-sm font-bold text-primary">48%</Text>
                </View>
                <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <View className="h-full bg-primary rounded-full" style={{ width: '48%' }} />
                </View>
                <Text className="text-xs text-gray-500 mt-1">48/100곡 완료</Text>
              </View>
            </View>

            {/* 메모 */}
            <View className="bg-white rounded-2xl p-4 mb-4">
              <Text className="text-base font-bold text-gray-800 mb-3">메모</Text>
              <TextInput
                className="bg-gray-50 rounded-xl p-3 text-sm min-h-[100px]"
                placeholder="학생에 대한 메모를 입력하세요..."
                multiline
                textAlignVertical="top"
                value={memo}
                onChangeText={setMemo}
                style={{ fontFamily: 'MaruBuri-Regular' }}
              />
            </View>

            {/* 저장하기 버튼 */}
            <TouchableOpacity
              className="bg-primary rounded-2xl p-4 items-center"
              activeOpacity={0.8}
              style={{
                shadowColor: '#8B5CF6',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Text className="text-white text-base font-bold">저장하기</Text>
            </TouchableOpacity>
          </View>
        );

      case '진도':
        return (
          <View className="p-5">
            <View className="bg-white rounded-2xl p-4">
              <Text className="text-base font-bold text-gray-800 mb-3">교재별 진도</Text>
              <Text className="text-sm text-gray-500">진도 관리 기능은 준비 중입니다.</Text>
            </View>
          </View>
        );

      case '출석':
        return (
          <View className="p-5">
            <View className="bg-white rounded-2xl p-4">
              <Text className="text-base font-bold text-gray-800 mb-3">출석 현황</Text>
              <Text className="text-sm text-gray-500">출석 관리 기능은 준비 중입니다.</Text>
            </View>
          </View>
        );

      case '수강료':
        return (
          <View className="p-5">
            <View className="bg-white rounded-2xl p-4">
              <Text className="text-base font-bold text-gray-800 mb-3">수강료 내역</Text>
              <Text className="text-sm text-gray-500">수강료 관리 기능은 준비 중입니다.</Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* 헤더 */}
      <View className="bg-primary px-5 py-4">
        <View className="flex-row items-center justify-between mb-3">
          <TouchableOpacity
            onPress={handleGoBack}
            className="w-8 h-8 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-bold">학생 상세 정보 화면</Text>
          <View className="w-8 h-8" />
        </View>

        {/* 학생 정보 카드 */}
        <View className="bg-white/10 backdrop-blur rounded-2xl p-4">
          <View className="flex-row items-center">
            <View
              className="w-12 h-12 rounded-xl items-center justify-center mr-3"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            >
              <Ionicons name="person" size={24} color="white" />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center mb-1">
                <Text className="text-white text-xl font-bold mr-2">{student?.name || '김민지'}</Text>
                <View
                  className="rounded-full px-2 py-0.5"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                >
                  <Text className="text-white text-xs font-bold">{student?.level || '초급'}</Text>
                </View>
              </View>
              <Text className="text-white/80 text-sm">
                매주 {student?.schedule?.split('/')[0] || '월/수'} {student?.schedule?.split(' ')[1] || '16:00'} | 010-1234-5678
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* 탭 메뉴 */}
      <View className="bg-white border-b border-gray-200">
        <View className="flex-row">
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              className={`flex-1 py-4 items-center ${
                activeTab === tab ? 'border-b-2 border-primary' : ''
              }`}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
            >
              <Text
                className={`text-sm font-bold ${
                  activeTab === tab ? 'text-primary' : 'text-gray-500'
                }`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 탭 컨텐츠 */}
      <ScrollView className="flex-1">
        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
  );
}
