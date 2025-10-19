import React, { useState, useEffect } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Text from '../../components/common/Text';
import { addStudent, updateStudent } from '../../data/mockStudents';

export default function StudentFormScreen({ navigation, route }) {
  const student = route?.params?.student;
  const isEdit = !!student;

  const [formData, setFormData] = useState({
    name: student?.name || '',
    category: student?.category || '초등',
    level: student?.level || '초급',
    schedule: student?.schedule || '',
    book: student?.book || '',
    ticketType: student?.ticketType || 'count',
    ticketCount: student?.ticketCount || 8,
    ticketPeriodStart: student?.ticketPeriod?.start || '',
    ticketPeriodEnd: student?.ticketPeriod?.end || '',
    unpaid: student?.unpaid || false,
  });

  const categories = ['초등', '고등', '성인'];
  const levels = ['초급', '중급', '고급'];
  const ticketTypes = [
    { value: 'count', label: '회차권' },
    { value: 'period', label: '기간 정액권' }
  ];

  const handleSave = () => {
    // 필수 입력 검증
    if (!formData.name.trim()) {
      Alert.alert('알림', '학생 이름을 입력해주세요.');
      return;
    }
    if (!formData.schedule.trim()) {
      Alert.alert('알림', '수업 일정을 입력해주세요.');
      return;
    }

    // 수강권 검증
    if (formData.ticketType === 'count' && (!formData.ticketCount || formData.ticketCount < 0)) {
      Alert.alert('알림', '수강권 횟수를 입력해주세요.');
      return;
    }
    if (formData.ticketType === 'period' && (!formData.ticketPeriodStart || !formData.ticketPeriodEnd)) {
      Alert.alert('알림', '수강 기간을 입력해주세요.');
      return;
    }

    try {
      const studentData = {
        ...formData,
        ticketPeriod: formData.ticketType === 'period'
          ? { start: formData.ticketPeriodStart, end: formData.ticketPeriodEnd }
          : null,
      };

      if (isEdit) {
        updateStudent(student.id, studentData);
        Alert.alert('성공', '학생 정보가 수정되었습니다.', [
          { text: '확인', onPress: () => navigation.goBack() }
        ]);
      } else {
        addStudent(studentData);
        Alert.alert('성공', '새 학생이 등록되었습니다.', [
          { text: '확인', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      Alert.alert('오류', '저장에 실패했습니다.');
      console.error('학생 저장 오류:', error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* 헤더 */}
      <View className="bg-primary px-5 py-4">
        <View className="flex-row justify-between items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">
            {isEdit ? '학생 정보 수정' : '새 학생 등록'}
          </Text>
          <View style={{ width: 28 }} />
        </View>
      </View>

      <ScrollView className="flex-1 px-5 py-4">
        {/* 기본 정보 */}
        <View className="bg-white rounded-2xl p-4 mb-4">
          <Text className="text-base font-bold text-gray-800 mb-4">기본 정보</Text>

          {/* 이름 */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">이름 *</Text>
            <TextInput
              className="bg-gray-50 rounded-xl p-4 text-base border border-gray-200"
              placeholder="학생 이름"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              style={{ fontFamily: 'MaruBuri-Regular' }}
            />
          </View>

          {/* 카테고리 */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">카테고리 *</Text>
            <View className="flex-row">
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  className={`flex-1 rounded-xl py-3 mr-2 ${
                    formData.category === category
                      ? 'bg-primary'
                      : 'bg-gray-100'
                  }`}
                  onPress={() => setFormData({ ...formData, category })}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`text-center text-sm font-bold ${
                      formData.category === category
                        ? 'text-white'
                        : 'text-gray-700'
                    }`}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 레벨 */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">레벨 *</Text>
            <View className="flex-row">
              {levels.map((level) => (
                <TouchableOpacity
                  key={level}
                  className={`flex-1 rounded-xl py-3 mr-2 ${
                    formData.level === level
                      ? 'bg-primary'
                      : 'bg-gray-100'
                  }`}
                  onPress={() => setFormData({ ...formData, level })}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`text-center text-sm font-bold ${
                      formData.level === level
                        ? 'text-white'
                        : 'text-gray-700'
                    }`}
                  >
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 수업 일정 */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">수업 일정 *</Text>
            <TextInput
              className="bg-gray-50 rounded-xl p-4 text-base border border-gray-200"
              placeholder="예: 월/수 16:00"
              value={formData.schedule}
              onChangeText={(text) => setFormData({ ...formData, schedule: text })}
              style={{ fontFamily: 'MaruBuri-Regular' }}
            />
            <Text className="text-xs text-gray-500 mt-1">
              요일과 시간을 입력해주세요 (예: 월/수 16:00)
            </Text>
          </View>

          {/* 교재 */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">교재</Text>
            <TextInput
              className="bg-gray-50 rounded-xl p-4 text-base border border-gray-200"
              placeholder="예: 바이엘 45p"
              value={formData.book}
              onChangeText={(text) => setFormData({ ...formData, book: text })}
              style={{ fontFamily: 'MaruBuri-Regular' }}
            />
          </View>

          {/* 수강권 타입 */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">수강권 타입 *</Text>
            <View className="flex-row">
              {ticketTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  className={`flex-1 rounded-xl py-3 mr-2 ${
                    formData.ticketType === type.value
                      ? 'bg-primary'
                      : 'bg-gray-100'
                  }`}
                  onPress={() => setFormData({ ...formData, ticketType: type.value })}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`text-center text-sm font-bold ${
                      formData.ticketType === type.value
                        ? 'text-white'
                        : 'text-gray-700'
                    }`}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 회차권일 때 */}
          {formData.ticketType === 'count' && (
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">남은 횟수 *</Text>
              <TextInput
                className="bg-gray-50 rounded-xl p-4 text-base border border-gray-200"
                placeholder="예: 8"
                value={String(formData.ticketCount)}
                onChangeText={(text) => setFormData({ ...formData, ticketCount: parseInt(text) || 0 })}
                keyboardType="numeric"
                style={{ fontFamily: 'MaruBuri-Regular' }}
              />
            </View>
          )}

          {/* 기간 정액권일 때 */}
          {formData.ticketType === 'period' && (
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">수강 기간 *</Text>
              <View className="flex-row items-center">
                <TextInput
                  className="flex-1 bg-gray-50 rounded-xl p-4 text-base border border-gray-200 mr-2"
                  placeholder="2025.01"
                  value={formData.ticketPeriodStart}
                  onChangeText={(text) => setFormData({ ...formData, ticketPeriodStart: text })}
                  style={{ fontFamily: 'MaruBuri-Regular' }}
                />
                <Text className="text-gray-600">~</Text>
                <TextInput
                  className="flex-1 bg-gray-50 rounded-xl p-4 text-base border border-gray-200 ml-2"
                  placeholder="2025.03"
                  value={formData.ticketPeriodEnd}
                  onChangeText={(text) => setFormData({ ...formData, ticketPeriodEnd: text })}
                  style={{ fontFamily: 'MaruBuri-Regular' }}
                />
              </View>
              <Text className="text-xs text-gray-500 mt-1">
                형식: YYYY.MM (예: 2025.01)
              </Text>
            </View>
          )}

          {/* 미납 여부 */}
          <View>
            <Text className="text-sm font-semibold text-gray-700 mb-2">수강료 납부 상태</Text>
            <View className="flex-row">
              <TouchableOpacity
                className={`flex-1 rounded-xl py-3 mr-2 ${
                  !formData.unpaid ? 'bg-green-500' : 'bg-gray-100'
                }`}
                onPress={() => setFormData({ ...formData, unpaid: false })}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-center text-sm font-bold ${
                    !formData.unpaid ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  납부 완료
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 rounded-xl py-3 ml-2 ${
                  formData.unpaid ? 'bg-red-500' : 'bg-gray-100'
                }`}
                onPress={() => setFormData({ ...formData, unpaid: true })}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-center text-sm font-bold ${
                    formData.unpaid ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  미납
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 하단 저장 버튼 */}
      <View className="bg-white px-5 py-4 border-t border-gray-200">
        <TouchableOpacity
          className="bg-primary rounded-xl p-4 items-center"
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text className="text-white text-base font-bold">
            {isEdit ? '수정 완료' : '등록 완료'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
