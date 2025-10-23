// src/screens/teacher/RefundScreen.js
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, ScreenHeader } from '../../components/common';
import { useToastStore, useStudentStore } from '../../store';

export default function RefundScreen({ navigation }) {
  const toast = useToastStore();
  const { students } = useStudentStore();
  const [filter, setFilter] = useState('all'); // all, pending, completed

  const handleRequestRefund = () => {
    toast.info('환불 신청 기능은 준비중입니다');
  };

  const handleProcessRefund = (refund) => {
    toast.info('환불 처리 기능은 준비중입니다');
  };

  // 임시 환불 신청 데이터 (실제로는 백엔드에서 가져와야 함)
  const mockRefunds = [];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScreenHeader
        title="환불 관리"
        onBack={() => navigation.goBack()}
      />

      <View className="px-5 py-4">
        {/* 환불 신청 버튼 */}
        <TouchableOpacity
          onPress={handleRequestRefund}
          activeOpacity={0.8}
          className="bg-red-500 rounded-2xl py-4 mb-4 flex-row items-center justify-center"
          style={{
            shadowColor: '#EF4444',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <Ionicons name="return-down-back" size={24} color="white" />
          <Text className="text-white font-bold text-base ml-2">환불 신청하기</Text>
        </TouchableOpacity>

        {/* 필터 */}
        <View className="flex-row mb-4">
          <TouchableOpacity
            onPress={() => setFilter('all')}
            className={`flex-1 rounded-full py-3 mr-2 ${
              filter === 'all' ? 'bg-purple-500' : 'bg-white'
            }`}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 3,
              elevation: 2,
            }}
          >
            <Text
              className={`text-center font-bold ${
                filter === 'all' ? 'text-white' : 'text-gray-600'
              }`}
            >
              전체
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilter('pending')}
            className={`flex-1 rounded-full py-3 mx-1 ${
              filter === 'pending' ? 'bg-purple-500' : 'bg-white'
            }`}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 3,
              elevation: 2,
            }}
          >
            <Text
              className={`text-center font-bold ${
                filter === 'pending' ? 'text-white' : 'text-gray-600'
              }`}
            >
              처리 대기
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilter('completed')}
            className={`flex-1 rounded-full py-3 ml-2 ${
              filter === 'completed' ? 'bg-purple-500' : 'bg-white'
            }`}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 3,
              elevation: 2,
            }}
          >
            <Text
              className={`text-center font-bold ${
                filter === 'completed' ? 'text-white' : 'text-gray-600'
              }`}
            >
              처리 완료
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-5">
        {mockRefunds.length > 0 ? (
          mockRefunds.map((refund, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleProcessRefund(refund)}
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
              {/* 환불 신청 카드 내용 */}
            </TouchableOpacity>
          ))
        ) : (
          <View className="bg-white rounded-2xl p-8 items-center"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View className="bg-gray-100 rounded-full p-6 mb-4">
              <Ionicons name="receipt-outline" size={48} color="#9CA3AF" />
            </View>
            <Text className="text-gray-900 font-bold text-lg mb-2">
              환불 신청 내역이 없습니다
            </Text>
            <Text className="text-gray-400 text-sm text-center">
              환불이 필요한 경우{'\n'}상단의 '환불 신청하기' 버튼을 눌러주세요
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
