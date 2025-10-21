// src/components/common/DatePickerModal.js
import React from 'react';
import { Modal, Platform, View, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Text from './Text';
import TEACHER_COLORS from '../../styles/teacher_colors';

/**
 * 날짜/시간 선택 모달 컴포넌트
 * iOS는 Modal로 감싸고, Android는 기본 DateTimePicker 사용
 *
 * @param {boolean} visible - 모달 표시 여부
 * @param {Date} value - 선택된 날짜/시간
 * @param {string} mode - 'date' | 'time' | 'datetime'
 * @param {function} onChange - 날짜 변경 콜백 (event, date) => void
 * @param {function} onClose - 모달 닫기 콜백
 * @param {string} title - 모달 제목 (iOS만 해당)
 */
export default function DatePickerModal({
  visible,
  value,
  mode = 'date',
  onChange,
  onClose,
  title = '날짜 선택',
}) {
  const handleChange = (event, selectedValue) => {
    if (Platform.OS === 'android') {
      // Android는 선택 즉시 닫힘
      onClose();
    }

    if (selectedValue) {
      onChange(event, selectedValue);
    }
  };

  // iOS용 모달
  if (Platform.OS === 'ios') {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl">
            {/* 헤더 */}
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-200">
              <TouchableOpacity onPress={onClose}>
                <Text className="text-gray-600 text-base">취소</Text>
              </TouchableOpacity>
              <Text className="text-gray-800 text-base font-bold">{title}</Text>
              <TouchableOpacity onPress={onClose}>
                <Text className="text-primary text-base font-bold">완료</Text>
              </TouchableOpacity>
            </View>

            {/* DateTimePicker */}
            <View className="pb-6">
              <DateTimePicker
                value={value}
                mode={mode}
                display="spinner"
                onChange={handleChange}
                locale="ko-KR"
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  // Android는 모달 없이 기본 DateTimePicker 사용
  if (visible) {
    return (
      <DateTimePicker
        value={value}
        mode={mode}
        display="default"
        onChange={handleChange}
      />
    );
  }

  return null;
}
