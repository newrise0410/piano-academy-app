// src/components/teacher/AiNoticeWriter.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TEACHER_COLORS from '../../styles/teacher_colors';
import PresetSelector from './PresetSelector';
import { getPresetsByCategory, AI_TONE_PRESETS, NOTICE_PRESETS } from '../../constants/aiPresets';
import { generateNoticeContent, improveNoticeContent, isGeminiAvailable } from '../../services/geminiService';
import { useToastStore } from '../../store';

/**
 * AI 알림장 작성 컴포넌트
 * 알림장을 AI로 작성/개선
 *
 * @param {Object} props
 * @param {string} props.title - 알림장 제목
 * @param {string} props.content - 알림장 내용
 * @param {Function} props.onTitleChange - 제목 변경 핸들러
 * @param {Function} props.onContentChange - 내용 변경 핸들러
 * @param {string} props.prompt - AI 프롬프트 (사용자 입력)
 * @param {Function} props.onPromptChange - 프롬프트 변경 핸들러
 */
export default function AiNoticeWriter({
  title,
  content,
  onTitleChange,
  onContentChange,
  prompt,
  onPromptChange,
}) {
  const toast = useToastStore();

  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('event');
  const [selectedTone, setSelectedTone] = useState(null);

  // 프리셋 목록
  const noticePresets = getPresetsByCategory('notice');
  const tonePresets = Object.values(AI_TONE_PRESETS);

  // AI로 알림장 생성
  const handleAiGenerate = async () => {
    if (!prompt.trim()) {
      Alert.alert('알림', 'AI에게 어떤 내용을 작성해달라고 할지 입력해주세요.');
      return;
    }

    if (!isGeminiAvailable()) {
      toast.error('Gemini API 키가 설정되지 않았습니다');
      return;
    }

    setIsAIGenerating(true);

    try {
      // 선택된 템플릿 프리셋 가져오기
      const templatePreset = NOTICE_PRESETS[selectedTemplate.toUpperCase()];
      let customPrompt = prompt;

      // 템플릿 프리셋의 systemPrompt를 프롬프트에 힌트로 추가
      if (templatePreset) {
        customPrompt = `[${templatePreset.name} 형식으로 작성]\n${prompt}`;
      }

      // 톤 수정자 추가
      if (selectedTone) {
        const tone = AI_TONE_PRESETS[selectedTone.toUpperCase()];
        if (tone) {
          customPrompt += `\n\n[${tone.name}: ${tone.description}]`;
        }
      }

      const result = await generateNoticeContent(customPrompt, selectedTemplate);

      if (result.success) {
        onTitleChange(result.title);
        onContentChange(result.content);
        toast.success('AI가 알림장을 작성했습니다! ✨');
      } else {
        toast.error('알림장 생성 중 오류가 발생했습니다');
      }
    } catch (error) {
      console.error('AI 알림장 생성 오류:', error);
      toast.error('알림장 생성 중 오류가 발생했습니다');
    } finally {
      setIsAIGenerating(false);
    }
  };

  // AI로 내용 개선 (더 친절하게 / 더 간결하게)
  const handleImproveContent = async (direction) => {
    if (!content.trim()) {
      Alert.alert('알림', '먼저 알림장 내용을 입력하거나 생성해주세요.');
      return;
    }

    if (!isGeminiAvailable()) {
      toast.error('Gemini API 키가 설정되지 않았습니다');
      return;
    }

    setIsAIGenerating(true);

    try {
      const result = await improveNoticeContent(content, direction);

      if (result.success) {
        onContentChange(result.content);
        toast.success(
          direction === 'friendly'
            ? '더 친절하게 수정했습니다! 😊'
            : '더 간결하게 수정했습니다! ✂️'
        );
      } else {
        toast.error('내용 개선 중 오류가 발생했습니다');
      }
    } catch (error) {
      console.error('AI 내용 개선 오류:', error);
      toast.error('내용 개선 중 오류가 발생했습니다');
    } finally {
      setIsAIGenerating(false);
    }
  };

  return (
    <View>
      {/* AI 템플릿 선택 */}
      <PresetSelector
        presets={noticePresets}
        selectedId={selectedTemplate}
        onSelect={setSelectedTemplate}
        title="알림장 유형"
      />

      {/* 톤 선택 (선택사항) */}
      <PresetSelector
        presets={tonePresets}
        selectedId={selectedTone}
        onSelect={(id) => setSelectedTone(id === selectedTone ? null : id)}
        title="톤 선택 (선택사항)"
      />

      {/* AI 프롬프트 입력 */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-gray-700 mb-2">
          AI에게 요청하기
        </Text>
        <TextInput
          className="bg-purple-50 border-2 border-purple-200 rounded-xl p-3 text-sm min-h-[80px]"
          placeholder="예: 12월 25일 오후 2시에 학원 연주홀에서 발표회를 합니다. 학부모님들께 보낼 알림장을 작성해주세요."
          multiline
          textAlignVertical="top"
          value={prompt}
          onChangeText={onPromptChange}
          style={{ fontFamily: 'MaruBuri-Regular' }}
        />

        {/* AI 생성 버튼 */}
        <TouchableOpacity
          className="mt-3 bg-purple-600 rounded-xl py-3 flex-row items-center justify-center"
          onPress={handleAiGenerate}
          activeOpacity={0.7}
          disabled={isAIGenerating}
          style={{ opacity: isAIGenerating ? 0.6 : 1 }}
        >
          {isAIGenerating ? (
            <>
              <Ionicons name="hourglass-outline" size={20} color="white" />
              <Text className="text-white font-bold ml-2">AI가 작성하는 중...</Text>
            </>
          ) : (
            <>
              <Ionicons name="sparkles" size={20} color="white" />
              <Text className="text-white font-bold ml-2">AI로 작성하기</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* 미리보기 영역 */}
      {(title || content) && (
        <View className="bg-white rounded-2xl p-4 mb-4 border-2 border-purple-100">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-bold text-gray-800">미리보기</Text>
            <View className="flex-row" style={{ gap: 8 }}>
              <TouchableOpacity
                onPress={() => handleImproveContent('friendly')}
                className="bg-pink-100 rounded-lg px-3 py-1.5 flex-row items-center"
                disabled={isAIGenerating}
                activeOpacity={0.7}
              >
                <Ionicons name="heart" size={14} color="#ec4899" />
                <Text className="text-pink-600 text-xs font-semibold ml-1">
                  더 친절하게
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleImproveContent('concise')}
                className="bg-blue-100 rounded-lg px-3 py-1.5 flex-row items-center"
                disabled={isAIGenerating}
                activeOpacity={0.7}
              >
                <Ionicons name="contract" size={14} color="#3b82f6" />
                <Text className="text-blue-600 text-xs font-semibold ml-1">
                  더 간결하게
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 제목 */}
          {title && (
            <View className="mb-3">
              <Text className="text-sm text-gray-500 mb-1">제목</Text>
              <Text className="text-base font-bold text-gray-800">{title}</Text>
            </View>
          )}

          {/* 내용 */}
          {content && (
            <View>
              <Text className="text-sm text-gray-500 mb-1">내용</Text>
              <Text className="text-sm text-gray-700 leading-6">{content}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
