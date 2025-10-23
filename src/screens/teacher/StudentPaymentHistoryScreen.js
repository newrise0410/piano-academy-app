// src/screens/teacher/StudentPaymentHistoryScreen.js
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, ScreenHeader } from '../../components/common';
import { useToastStore, useStudentStore } from '../../store';

export default function StudentPaymentHistoryScreen({ navigation }) {
  const toast = useToastStore();
  const { students } = useStudentStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewHistory = (student) => {
    toast.info('학생별 수강료 이력 조회 기능은 준비중입니다');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScreenHeader
        title="학생별 수강료 이력"
        onBack={() => navigation.goBack()}
      />

      <View className="px-5 py-4">
        {/* 검색 */}
        <View className="mb-4">
          <View className="bg-white rounded-2xl px-4 py-3 flex-row items-center"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 3,
              elevation: 2,
            }}
          >
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="학생 이름 검색"
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-2 text-gray-900"
            />
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-5">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student, index) => (
            <TouchableOpacity
              key={student.id}
              onPress={() => handleViewHistory(student)}
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
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="bg-purple-100 rounded-full w-12 h-12 items-center justify-center mr-3">
                    <Text className="text-purple-700 font-bold text-lg">
                      {student.name.charAt(0)}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-bold text-base mb-1">
                      {student.name}
                    </Text>
                    <View className="flex-row items-center">
                      <View className="bg-gray-100 rounded-full px-2 py-1 mr-2">
                        <Text className="text-gray-600 text-xs">{student.level}</Text>
                      </View>
                      <Text className="text-gray-400 text-xs">전체 이력 조회</Text>
                    </View>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#D1D5DB" />
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View className="bg-white rounded-2xl p-8 items-center">
            <Ionicons name="person-outline" size={48} color="#9CA3AF" />
            <Text className="text-gray-400 text-sm mt-2">
              {searchQuery ? '검색 결과가 없습니다' : '등록된 학생이 없습니다'}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
