// src/components/teacher/AiMessageModal.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { generateParentContactMessage } from '../../services/geminiService';
import * as Clipboard from 'expo-clipboard';
import { useToastStore } from '../../store';

/**
 * AI 메시지 생성 모달
 *
 * @param {Object} props
 * @param {boolean} props.visible - 모달 표시 여부
 * @param {Function} props.onClose - 모달 닫기 핸들러
 * @param {string} props.type - 메시지 타입
 * @param {Object} props.context - 메시지 생성 컨텍스트
 */
export default function AiMessageModal({ visible, onClose, type, context }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const toast = useToastStore();

  // 모달 열릴 때 AI 메시지 자동 생성
  useEffect(() => {
    if (visible) {
      generateMessage();
    } else {
      // 모달 닫힐 때 상태 초기화
      setMessage('');
      setIsEditing(false);
    }
  }, [visible]);

  // AI 메시지 생성
  const generateMessage = async () => {
    setLoading(true);
    try {
      const result = await generateParentContactMessage(type, context);
      setMessage(result.message);
    } catch (error) {
      console.error('AI 메시지 생성 오류:', error);
      toast.error('메시지 생성 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  // 메시지 재생성
  const handleRegenerate = () => {
    Alert.alert(
      '메시지 재생성',
      '새로운 메시지를 생성하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '재생성',
          onPress: generateMessage,
        },
      ]
    );
  };

  // 클립보드에 복사
  const handleCopyToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(message);
      toast.success('메시지가 복사되었습니다 📋');
    } catch (error) {
      console.error('클립보드 복사 오류:', error);
      toast.error('복사 중 오류가 발생했습니다');
    }
  };

  // 카카오톡으로 보내기 (URL 스킴)
  const handleSendViaKakao = async () => {
    try {
      // 카카오톡 URL 스킴 (전화번호가 있는 경우)
      const phoneNumber = context.student?.parentPhone?.replace(/-/g, '');
      if (phoneNumber) {
        // 실제 카카오톡 연동은 추가 설정 필요
        Alert.alert(
          '카카오톡 전송',
          '메시지가 클립보드에 복사되었습니다.\n카카오톡을 열어서 붙여넣기 해주세요.',
          [
            { text: '취소', style: 'cancel' },
            {
              text: '카카오톡 열기',
              onPress: async () => {
                await Clipboard.setStringAsync(message);
                Linking.openURL('kakaotalk://');
              },
            },
          ]
        );
      } else {
        await handleCopyToClipboard();
      }
    } catch (error) {
      console.error('카카오톡 전송 오류:', error);
      toast.error('전송 중 오류가 발생했습니다');
    }
  };

  // SMS로 보내기
  const handleSendViaSMS = async () => {
    try {
      const phoneNumber = context.student?.parentPhone?.replace(/-/g, '');
      if (phoneNumber) {
        const smsUrl = `sms:${phoneNumber}${Platform.OS === 'ios' ? '&' : '?'}body=${encodeURIComponent(message)}`;
        await Linking.openURL(smsUrl);
      } else {
        Alert.alert('알림', '학부모 연락처가 등록되지 않았습니다');
      }
    } catch (error) {
      console.error('SMS 전송 오류:', error);
      toast.error('전송 중 오류가 발생했습니다');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl" style={{ maxHeight: '90%' }}>
          {/* 헤더 */}
          <View className="flex-row items-center justify-between p-5 border-b border-gray-200">
            <View className="flex-row items-center">
              <Ionicons name="sparkles" size={24} color="#9333ea" />
              <Text className="ml-2 text-xl font-bold text-gray-800">
                AI 메시지
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* 컨텍스트 정보 */}
          <View className="bg-purple-50 px-5 py-3 border-b border-purple-100">
            <Text className="text-purple-900 font-semibold text-base">
              {context.student?.name} 학생 학부모님께
            </Text>
            <Text className="text-purple-700 text-sm mt-1">
              {context.reason || '연락 필요'}
            </Text>
          </View>

          {/* 메시지 내용 */}
          <ScrollView className="flex-1 px-5 py-4">
            {loading ? (
              <View className="items-center justify-center py-20">
                <ActivityIndicator size="large" color="#9333ea" />
                <Text className="text-gray-500 mt-4">AI가 메시지를 작성하고 있습니다...</Text>
              </View>
            ) : (
              <>
                {isEditing ? (
                  <TextInput
                    className="bg-gray-50 rounded-xl p-4 text-base text-gray-800 min-h-[200px]"
                    style={{ textAlignVertical: 'top' }}
                    multiline
                    value={message}
                    onChangeText={setMessage}
                    placeholder="메시지를 수정하세요"
                  />
                ) : (
                  <View className="bg-gray-50 rounded-xl p-4 min-h-[200px]">
                    <Text className="text-base text-gray-800 leading-6">
                      {message}
                    </Text>
                  </View>
                )}

                {/* 편집/재생성 버튼 */}
                <View className="flex-row mt-4" style={{ gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => setIsEditing(!isEditing)}
                    className="flex-1 bg-gray-100 rounded-lg py-3 flex-row items-center justify-center"
                    style={{ gap: 6 }}
                  >
                    <Ionicons
                      name={isEditing ? 'checkmark' : 'create'}
                      size={18}
                      color="#4b5563"
                    />
                    <Text className="text-gray-700 font-semibold">
                      {isEditing ? '완료' : '수정'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleRegenerate}
                    className="flex-1 bg-purple-100 rounded-lg py-3 flex-row items-center justify-center"
                    style={{ gap: 6 }}
                  >
                    <Ionicons name="refresh" size={18} color="#9333ea" />
                    <Text className="text-purple-700 font-semibold">
                      재생성
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>

          {/* 액션 버튼 */}
          {!loading && (
            <View className="px-5 py-4 border-t border-gray-200" style={{ gap: 10 }}>
              {/* 복사 */}
              <TouchableOpacity
                onPress={handleCopyToClipboard}
                className="bg-gray-600 rounded-xl py-4 flex-row items-center justify-center"
                style={{ gap: 8 }}
              >
                <Ionicons name="copy" size={20} color="white" />
                <Text className="text-white font-bold text-base">
                  복사하기
                </Text>
              </TouchableOpacity>

              {/* 전송 버튼들 */}
              <View className="flex-row" style={{ gap: 10 }}>
                <TouchableOpacity
                  onPress={handleSendViaKakao}
                  className="flex-1 bg-yellow-400 rounded-xl py-4 flex-row items-center justify-center"
                  style={{ gap: 8 }}
                >
                  <Ionicons name="chatbubble" size={20} color="#3c1e1e" />
                  <Text className="text-gray-900 font-bold text-base">
                    카카오톡
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSendViaSMS}
                  className="flex-1 bg-green-500 rounded-xl py-4 flex-row items-center justify-center"
                  style={{ gap: 8 }}
                >
                  <Ionicons name="mail" size={20} color="white" />
                  <Text className="text-white font-bold text-base">
                    문자
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
