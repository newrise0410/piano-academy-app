// src/components/teacher/AiMemoEditor.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import TEACHER_COLORS from '../../styles/teacher_colors';
import PresetSelector from './PresetSelector';
import { getPresetsByCategory, AI_TONE_PRESETS } from '../../constants/aiPresets';
import { improveStudentMemo, generateStudentHomework, isGeminiAvailable } from '../../services/geminiService';
import { useToastStore } from '../../store';

/**
 * AI 메모 에디터 컴포넌트
 * 학생 관찰 메모, 진도 피드백, 연습 과제 등을 AI로 작성/개선
 *
 * @param {Object} props
 * @param {string} props.value - 메모 내용
 * @param {Function} props.onChange - 메모 변경 핸들러
 * @param {Object} props.studentInfo - { name, level, book, recentProgress }
 * @param {string} props.placeholder - 입력란 플레이스홀더
 * @param {boolean} props.enableAttachments - 첨부파일 기능 활성화 (기본: false)
 * @param {boolean} props.enableHomeworkGenerator - 연습 과제 생성 버튼 표시 (기본: false)
 */
export default function AiMemoEditor({
  value,
  onChange,
  studentInfo,
  placeholder = '학생에 대한 메모를 입력하세요...',
  enableAttachments = false,
  enableHomeworkGenerator = false,
}) {
  const toast = useToastStore();

  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('progress');
  const [selectedTone, setSelectedTone] = useState(null);
  const [attachments, setAttachments] = useState([]);

  // 프리셋 목록
  const studentMemoPresets = getPresetsByCategory('studentMemo');
  const tonePresets = Object.values(AI_TONE_PRESETS);

  // 사진/영상 선택
  const pickMedia = async (type) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진/영상 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: type === 'video' ? ImagePicker.MediaTypeOptions.Videos : ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setAttachments([...attachments, {
        id: Date.now().toString(),
        uri: result.assets[0].uri,
        type: type,
      }]);
    }
  };

  // 첨부파일 삭제
  const removeAttachment = (id) => {
    setAttachments(attachments.filter(att => att.id !== id));
  };

  // AI로 메모 개선
  const handleAIImprove = async () => {
    if (!value.trim()) {
      Alert.alert('알림', '먼저 메모를 입력해주세요.');
      return;
    }

    if (!isGeminiAvailable()) {
      Alert.alert('알림', 'Gemini API 키가 설정되지 않았습니다.');
      return;
    }

    setIsAIGenerating(true);

    try {
      const result = await improveStudentMemo(value, studentInfo, selectedPreset, selectedTone);

      if (result.success) {
        onChange(result.improvedMemo);
        toast.success('AI가 메모를 개선했습니다! ✨');
      } else {
        toast.error('메모 개선 중 오류가 발생했습니다');
      }
    } catch (error) {
      console.error('AI 메모 개선 오류:', error);
      toast.error('메모 개선 중 오류가 발생했습니다');
    } finally {
      setIsAIGenerating(false);
    }
  };

  // AI로 연습 과제 생성
  const handleGenerateHomework = async () => {
    if (!isGeminiAvailable()) {
      Alert.alert('알림', 'Gemini API 키가 설정되지 않았습니다.');
      return;
    }

    setIsAIGenerating(true);

    try {
      const homeworkInfo = {
        ...studentInfo,
        weakPoints: '리듬감, 손가락 독립성', // 추후 실제 데이터로 대체
        strengths: '음감, 표현력', // 추후 실제 데이터로 대체
      };

      const result = await generateStudentHomework(homeworkInfo);

      if (result.success) {
        onChange(result.homework);
        toast.success('AI가 연습 과제를 생성했습니다! 📝');
      } else {
        toast.error('연습 과제 생성 중 오류가 발생했습니다');
      }
    } catch (error) {
      console.error('AI 연습 과제 생성 오류:', error);
      toast.error('연습 과제 생성 중 오류가 발생했습니다');
    } finally {
      setIsAIGenerating(false);
    }
  };

  return (
    <View>
      {/* AI 프리셋 선택 */}
      <PresetSelector
        presets={studentMemoPresets}
        selectedId={selectedPreset}
        onSelect={setSelectedPreset}
        title="메모 유형"
      />

      {/* 톤 선택 (선택사항) */}
      <PresetSelector
        presets={tonePresets}
        selectedId={selectedTone}
        onSelect={(id) => setSelectedTone(id === selectedTone ? null : id)}
        title="톤 선택 (선택사항)"
      />

      {/* 메모 입력란 */}
      <TextInput
        className="bg-gray-50 rounded-xl p-3 text-sm min-h-[100px]"
        placeholder={placeholder}
        multiline
        textAlignVertical="top"
        value={value}
        onChangeText={onChange}
        style={{ fontFamily: 'MaruBuri-Regular' }}
      />

      {/* 첨부파일 목록 */}
      {enableAttachments && attachments.length > 0 && (
        <View className="mt-3">
          <View className="flex-row flex-wrap">
            {attachments.map((attachment) => (
              <View key={attachment.id} className="mr-2 mb-2 relative">
                <Image
                  source={{ uri: attachment.uri }}
                  className="w-20 h-20 rounded-lg"
                />
                {attachment.type === 'video' && (
                  <View className="absolute inset-0 items-center justify-center">
                    <View className="bg-black/50 rounded-full p-2">
                      <Ionicons name="play" size={20} color="white" />
                    </View>
                  </View>
                )}
                <TouchableOpacity
                  className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 items-center justify-center"
                  onPress={() => removeAttachment(attachment.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={14} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 첨부 및 AI 버튼 */}
      <View className="mt-3" style={{ gap: 8 }}>
        {/* 첫 번째 줄: 사진, 영상, AI 개선 */}
        <View className="flex-row" style={{ gap: 8 }}>
          {enableAttachments && (
            <>
              <TouchableOpacity
                className="flex-1 rounded-xl py-3 flex-row items-center justify-center"
                style={{ backgroundColor: TEACHER_COLORS.gray[100] }}
                onPress={() => pickMedia('image')}
                activeOpacity={0.7}
              >
                <Ionicons name="image-outline" size={20} color={TEACHER_COLORS.gray[600]} />
                <Text className="text-gray-700 text-sm font-semibold ml-2">사진</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 rounded-xl py-3 flex-row items-center justify-center"
                style={{ backgroundColor: TEACHER_COLORS.gray[100] }}
                onPress={() => pickMedia('video')}
                activeOpacity={0.7}
              >
                <Ionicons name="videocam-outline" size={20} color={TEACHER_COLORS.gray[600]} />
                <Text className="text-gray-700 text-sm font-semibold ml-2">영상</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            className={`${enableAttachments ? 'flex-1' : 'flex-1'} bg-primary rounded-xl py-3 flex-row items-center justify-center`}
            onPress={handleAIImprove}
            activeOpacity={0.7}
            disabled={isAIGenerating}
            style={{ opacity: isAIGenerating ? 0.6 : 1 }}
          >
            {isAIGenerating ? (
              <>
                <Ionicons name="hourglass-outline" size={18} color="white" />
                <Text className="text-white text-xs font-semibold ml-1">생성중</Text>
              </>
            ) : (
              <>
                <Ionicons name="sparkles-outline" size={18} color="white" />
                <Text className="text-white text-xs font-semibold ml-1">AI 개선</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* 두 번째 줄: AI 연습 과제 생성 (옵션) */}
        {enableHomeworkGenerator && (
          <TouchableOpacity
            className="rounded-xl py-3 flex-row items-center justify-center"
            style={{ backgroundColor: '#9333ea' }}
            onPress={handleGenerateHomework}
            activeOpacity={0.7}
            disabled={isAIGenerating}
          >
            <Ionicons name="document-text" size={20} color="white" />
            <Text className="text-white text-sm font-semibold ml-2">
              AI 연습 과제 생성
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
