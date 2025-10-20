import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, Modal, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  Text,
  FormInput,
  Button,
  SectionCard,
  SegmentedControl
} from '../../components/common';
import TEACHER_COLORS from '../../styles/teacher_colors';
import { useStudentStore } from '../../store';
import { useToastStore } from '../../store';

export default function StudentFormScreen({ navigation, route }) {
  const student = route?.params?.student;
  const isEdit = !!student;

  // Zustand Stores
  const { addStudent, updateStudent, loading } = useStudentStore();
  const toast = useToastStore();

  // 기존 schedule을 파싱 (예: "월/수 16:00" -> selectedDays: ['월', '수'], selectedTime: '16:00')
  const parseSchedule = (schedule) => {
    if (!schedule) return { days: [], time: '09:00' };
    const parts = schedule.split(' ');
    const days = parts[0] ? parts[0].split('/') : [];
    const time = parts[1] || '09:00';
    return { days, time };
  };

  const parsed = parseSchedule(student?.schedule);

  const [formData, setFormData] = useState({
    name: student?.name || '',
    age: student?.age || '',
    phone: student?.phone || '',
    parentName: student?.parentName || '',
    parentPhone: student?.parentPhone || '',
    category: student?.category || '초등',
    level: student?.level || '초급',
    book: student?.book || '',
    ticketType: student?.ticketType || 'count',
    ticketCount: student?.ticketCount || 8,
    ticketPeriodStart: student?.ticketPeriod?.start || '',
    ticketPeriodEnd: student?.ticketPeriod?.end || '',
    unpaid: student?.unpaid || false,
  });

  const [selectedDays, setSelectedDays] = useState(parsed.days);
  const [selectedTime, setSelectedTime] = useState(parsed.time);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const categories = ['초등', '고등', '성인'];
  const levels = ['초급', '중급', '고급'];
  const ticketTypes = [
    { value: 'count', label: '회차권' },
    { value: 'period', label: '기간 정액권' }
  ];

  const daysOfWeek = ['월', '화', '수', '목', '금', '토', '일'];

  // 요일 토글
  const toggleDay = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day].sort((a, b) =>
        daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b)
      ));
    }
  };

  // 시간 변경 핸들러
  const onTimeChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      setSelectedTime(`${hours}:${minutes}`);
    }
  };

  // schedule 문자열 생성
  const getScheduleString = () => {
    if (selectedDays.length === 0) return '';
    return `${selectedDays.join('/')} ${selectedTime}`;
  };

  const handleSave = async () => {
    // 필수 입력 검증
    if (!formData.name.trim()) {
      toast.warning('학생 이름을 입력해주세요');
      return;
    }
    if (selectedDays.length === 0) {
      toast.warning('수업 요일을 선택해주세요');
      return;
    }

    // 수강권 검증
    if (formData.ticketType === 'count' && (!formData.ticketCount || formData.ticketCount < 0)) {
      toast.warning('수강권 횟수를 입력해주세요');
      return;
    }
    if (formData.ticketType === 'period' && (!formData.ticketPeriodStart || !formData.ticketPeriodEnd)) {
      toast.warning('수강 기간을 입력해주세요');
      return;
    }

    try {
      const studentData = {
        ...formData,
        schedule: getScheduleString(),
        ticketPeriod: formData.ticketType === 'period'
          ? { start: formData.ticketPeriodStart, end: formData.ticketPeriodEnd }
          : null,
      };

      if (isEdit) {
        await updateStudent(student.id, studentData);
        toast.success('학생 정보가 수정되었습니다');
      } else {
        await addStudent(studentData);
        toast.success('새 학생이 등록되었습니다');
      }
      navigation.goBack();
    } catch (error) {
      toast.error('저장에 실패했습니다');
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
        <SectionCard title="기본 정보" iconName="person-outline" style={{ marginBottom: 16 }}>
          {/* 이름 */}
          <FormInput
            label="이름"
            placeholder="학생 이름"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            required
            style={{ marginBottom: 16 }}
          />

          {/* 나이 */}
          <FormInput
            label="나이"
            placeholder="예: 10"
            value={formData.age}
            onChangeText={(text) => setFormData({ ...formData, age: text })}
            type="numeric"
            style={{ marginBottom: 16 }}
          />

          {/* 학생 연락처 */}
          <FormInput
            label="학생 연락처"
            placeholder="010-0000-0000"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            type="phone"
            iconName="call-outline"
            style={{ marginBottom: 16 }}
          />

          {/* 카테고리 */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">카테고리 *</Text>
            <SegmentedControl
              options={categories.map(cat => ({ value: cat, label: cat }))}
              value={formData.category}
              onChange={(value) => setFormData({ ...formData, category: value })}
            />
          </View>

          {/* 레벨 */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">레벨 *</Text>
            <SegmentedControl
              options={levels.map(level => ({ value: level, label: level }))}
              value={formData.level}
              onChange={(value) => setFormData({ ...formData, level: value })}
            />
          </View>

          {/* 수업 일정 */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">수업 요일 *</Text>
            <View className="flex-row flex-wrap mb-3">
              {daysOfWeek.map((day) => (
                <TouchableOpacity
                  key={day}
                  className={`rounded-full w-12 h-12 items-center justify-center mr-2 mb-2 ${
                    selectedDays.includes(day) ? 'bg-primary' : 'bg-gray-100'
                  }`}
                  onPress={() => toggleDay(day)}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`text-base font-bold ${
                      selectedDays.includes(day) ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-sm font-semibold text-gray-700 mb-2">수업 시간 *</Text>
            <TouchableOpacity
              className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex-row items-center justify-between"
              onPress={() => setShowTimePicker(true)}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={20} color={TEACHER_COLORS.gray[600]} />
                <Text className="text-base text-gray-700 ml-2" style={{ fontFamily: 'MaruBuri-Regular' }}>
                  {selectedTime}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={TEACHER_COLORS.gray[400]} />
            </TouchableOpacity>

            {selectedDays.length > 0 && (
              <View className="rounded-xl p-3 mt-2" style={{ backgroundColor: TEACHER_COLORS.purple[50] }}>
                <Text className="text-sm text-gray-700">
                  <Text className="font-bold text-primary">선택된 일정: </Text>
                  {getScheduleString()}
                </Text>
              </View>
            )}
          </View>

          {/* 교재 */}
          <FormInput
            label="교재"
            placeholder="예: 바이엘 45p"
            value={formData.book}
            onChangeText={(text) => setFormData({ ...formData, book: text })}
            iconName="book-outline"
          />
        </SectionCard>

        {/* 학부모 정보 */}
        <SectionCard title="학부모 정보" iconName="people-outline" style={{ marginBottom: 16 }}>
          {/* 학부모 이름 */}
          <FormInput
            label="학부모 이름"
            placeholder="예: 김영희"
            value={formData.parentName}
            onChangeText={(text) => setFormData({ ...formData, parentName: text })}
            iconName="person-outline"
            style={{ marginBottom: 16 }}
          />

          {/* 학부모 연락처 */}
          <FormInput
            label="학부모 연락처"
            placeholder="010-0000-0000"
            value={formData.parentPhone}
            onChangeText={(text) => setFormData({ ...formData, parentPhone: text })}
            type="phone"
            iconName="call-outline"
          />
        </SectionCard>

        {/* 수강권 정보 */}
        <SectionCard title="수강권 정보" iconName="ticket-outline" style={{ marginBottom: 16 }}>
          {/* 수강권 타입 */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">수강권 타입 *</Text>
            <SegmentedControl
              options={ticketTypes}
              value={formData.ticketType}
              onChange={(value) => setFormData({ ...formData, ticketType: value })}
            />
          </View>

          {/* 회차권일 때 */}
          {formData.ticketType === 'count' && (
            <FormInput
              label="남은 횟수"
              placeholder="예: 8"
              value={String(formData.ticketCount)}
              onChangeText={(text) => setFormData({ ...formData, ticketCount: parseInt(text) || 0 })}
              type="numeric"
              iconName="ticket-outline"
              required
              style={{ marginBottom: 16 }}
            />
          )}

          {/* 기간 정액권일 때 */}
          {formData.ticketType === 'period' && (
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">수강 기간 *</Text>
              <View className="flex-row items-center gap-2">
                <FormInput
                  placeholder="2025.01"
                  value={formData.ticketPeriodStart}
                  onChangeText={(text) => setFormData({ ...formData, ticketPeriodStart: text })}
                  style={{ flex: 1 }}
                />
                <Text className="text-gray-600">~</Text>
                <FormInput
                  placeholder="2025.03"
                  value={formData.ticketPeriodEnd}
                  onChangeText={(text) => setFormData({ ...formData, ticketPeriodEnd: text })}
                  style={{ flex: 1 }}
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
            <SegmentedControl
              options={[
                { value: false, label: '납부 완료' },
                { value: true, label: '미납' }
              ]}
              value={formData.unpaid}
              onChange={(value) => setFormData({ ...formData, unpaid: value })}
              activeColor={formData.unpaid ? 'bg-red-500' : 'bg-green-500'}
            />
          </View>
        </SectionCard>
      </ScrollView>

      {/* 하단 저장 버튼 */}
      <View className="bg-white px-5 py-4 border-t border-gray-200">
        <Button
          title={isEdit ? '수정 완료' : '등록 완료'}
          onPress={handleSave}
          loading={loading}
          disabled={loading}
          fullWidth
        />
      </View>

      {/* 시간 선택 모달 */}
      {Platform.OS === 'ios' ? (
        <Modal
          visible={showTimePicker}
          transparent={true}
          animationType="slide"
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-3xl p-5">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-bold text-gray-800">수업 시간 선택</Text>
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <Text className="text-primary text-base font-bold">완료</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={new Date(`2000-01-01T${selectedTime}:00`)}
                mode="time"
                display="spinner"
                onChange={onTimeChange}
                locale="ko-KR"
              />
            </View>
          </View>
        </Modal>
      ) : (
        showTimePicker && (
          <DateTimePicker
            value={new Date(`2000-01-01T${selectedTime}:00`)}
            mode="time"
            display="default"
            onChange={onTimeChange}
          />
        )
      )}
    </SafeAreaView>
  );
}
