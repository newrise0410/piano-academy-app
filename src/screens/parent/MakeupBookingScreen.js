// src/screens/parent/MakeupBookingScreen.js
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, ScreenHeader } from '../../components/common';
import PARENT_COLORS from '../../styles/parent_colors';
import { useToastStore } from '../../store';

export default function MakeupBookingScreen({ navigation }) {
  const toast = useToastStore();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

  // 임시 데이터
  const availableDates = [
    { date: '2024-10-28', day: '월', slots: ['14:00', '15:00', '16:00'] },
    { date: '2024-10-29', day: '화', slots: ['14:00', '17:00'] },
    { date: '2024-10-30', day: '수', slots: ['15:00', '16:00'] },
    { date: '2024-10-31', day: '목', slots: ['14:00', '15:00', '16:00', '17:00'] },
    { date: '2024-11-01', day: '금', slots: ['14:00', '16:00'] },
  ];

  const handleBooking = () => {
    if (!selectedDate || !selectedTimeSlot) {
      toast.info('날짜와 시간을 선택해주세요');
      return;
    }
    toast.info('보강 수업 예약 기능은 준비중입니다');
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScreenHeader title="보강 수업 예약" onBack={() => navigation.goBack()} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* 안내 */}
        <View className="px-5 py-4">
          <View
            className="bg-blue-50 rounded-2xl p-4 flex-row items-start"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 3,
              elevation: 2,
            }}
          >
            <Ionicons name="information-circle" size={24} color={PARENT_COLORS.blue[600]} />
            <View className="flex-1 ml-3">
              <Text className="text-gray-900 font-bold text-sm mb-1">보강 수업 안내</Text>
              <Text className="text-gray-600 text-xs leading-5">
                • 결석한 수업에 대해 보강 수업을 신청할 수 있습니다{'\n'}
                • 가능한 시간대를 선택하시면 선생님이 확인 후 승인해드립니다{'\n'}
                • 예약 확정 시 알림으로 안내드립니다
              </Text>
            </View>
          </View>
        </View>

        {/* 날짜 선택 */}
        <View className="px-5 mb-4">
          <View className="flex-row items-center mb-3">
            <Ionicons name="calendar" size={20} color={PARENT_COLORS.primary.DEFAULT} />
            <Text className="text-gray-900 font-bold text-base ml-2">날짜 선택</Text>
          </View>

          <View className="flex-row flex-wrap">
            {availableDates.map((item, index) => {
              const isSelected = selectedDate === item.date;
              return (
                <TouchableOpacity
                  key={item.date}
                  onPress={() => {
                    setSelectedDate(item.date);
                    setSelectedTimeSlot(null);
                  }}
                  activeOpacity={0.7}
                  className={`rounded-2xl p-4 mb-3 ${index % 2 === 0 ? 'mr-2' : 'ml-2'}`}
                  style={{
                    width: '47%',
                    backgroundColor: isSelected ? PARENT_COLORS.primary.DEFAULT : 'white',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 3,
                  }}
                >
                  <Text
                    className={`font-bold text-xs mb-1 ${
                      isSelected ? 'text-white' : 'text-gray-500'
                    }`}
                  >
                    {item.day}요일
                  </Text>
                  <Text
                    className={`font-bold text-lg mb-2 ${
                      isSelected ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {formatDate(item.date)}
                  </Text>
                  <View
                    className={`rounded-full px-2 py-1 ${
                      isSelected ? 'bg-white bg-opacity-20' : 'bg-green-100'
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        isSelected ? 'text-white' : 'text-green-600'
                      }`}
                    >
                      {item.slots.length}개 가능
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 시간대 선택 */}
        {selectedDate && (
          <View className="px-5 mb-6">
            <View className="flex-row items-center mb-3">
              <Ionicons name="time" size={20} color={PARENT_COLORS.primary.DEFAULT} />
              <Text className="text-gray-900 font-bold text-base ml-2">시간 선택</Text>
            </View>

            <View
              className="bg-white rounded-2xl p-4"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              {availableDates
                .find((d) => d.date === selectedDate)
                ?.slots.map((slot) => {
                  const isSelected = selectedTimeSlot === slot;
                  return (
                    <TouchableOpacity
                      key={slot}
                      onPress={() => setSelectedTimeSlot(slot)}
                      activeOpacity={0.7}
                      className="rounded-xl p-4 mb-2 flex-row items-center justify-between"
                      style={{
                        backgroundColor: isSelected
                          ? PARENT_COLORS.primary[50]
                          : PARENT_COLORS.gray[50],
                      }}
                    >
                      <View className="flex-row items-center">
                        <Ionicons
                          name="time-outline"
                          size={20}
                          color={
                            isSelected ? PARENT_COLORS.primary.DEFAULT : PARENT_COLORS.gray[500]
                          }
                        />
                        <Text
                          className={`ml-3 font-bold text-base ${
                            isSelected ? 'text-primary' : 'text-gray-700'
                          }`}
                          style={isSelected ? { color: PARENT_COLORS.primary.DEFAULT } : {}}
                        >
                          {slot}
                        </Text>
                      </View>
                      {isSelected && (
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color={PARENT_COLORS.primary.DEFAULT}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
            </View>
          </View>
        )}

        {/* 예약 정보 */}
        {selectedDate && selectedTimeSlot && (
          <View className="px-5 mb-6">
            <View
              className="bg-purple-50 rounded-2xl p-5"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <Text className="text-gray-900 font-bold text-base mb-3">예약 정보</Text>
              <View className="flex-row items-center mb-2">
                <Ionicons name="calendar" size={16} color={PARENT_COLORS.gray[600]} />
                <Text className="text-gray-700 ml-2">
                  {formatDate(selectedDate)} ({availableDates.find((d) => d.date === selectedDate)?.day}요일)
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="time" size={16} color={PARENT_COLORS.gray[600]} />
                <Text className="text-gray-700 ml-2">{selectedTimeSlot}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* 예약하기 버튼 */}
      <View className="px-5 py-4 bg-white">
        <TouchableOpacity
          onPress={handleBooking}
          activeOpacity={0.8}
          className="rounded-2xl py-4"
          style={{
            backgroundColor:
              selectedDate && selectedTimeSlot
                ? PARENT_COLORS.primary.DEFAULT
                : PARENT_COLORS.gray[300],
          }}
          disabled={!selectedDate || !selectedTimeSlot}
        >
          <Text className="text-white font-bold text-center text-base">
            보강 수업 신청하기
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
