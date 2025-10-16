import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, Alert, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Text from '../../components/common/Text';
import Card from '../../components/common/Card';

export default function NoticeCreateScreen({ navigation }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewContent, setPreviewContent] = useState('');

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const templates = [
    {
      id: '1',
      title: '발표회 안내',
      emoji: '🎹',
      color: '#E9D5FF',
      prompt: '12월 25일 오후 2시에 학원 연주홀에서 발표회를 개최합니다.',
      generatedTitle: '[발표회 안내]',
      generatedContent: '안녕하세요, 학부모님 😊\n\n12월 25일(수) 오후 2시, 학원 연주홀에서 정기 발표회를 개최합니다.\n\n그동안 열심히 연습한 곡들을 보여드릴 수 있는 소중한 시간이니 많은 참석 부탁드립니다.',
    },
    {
      id: '2',
      title: '휴강 안내',
      emoji: '🏠',
      color: '#FED7AA',
      prompt: '10월 18일(금)은 원장님 개인 사정으로 휴강합니다.',
      generatedTitle: '[휴강 안내]',
      generatedContent: '안녕하세요, 학부모님 😊\n\n10월 18일(금)은 원장님 개인 사정으로 휴강하게 되었습니다.\n\n보강 일정은 추후 개별적으로 안내드리겠습니다. 양해 부탁드립니다.',
    },
    {
      id: '3',
      title: '수강료 안내',
      emoji: '💰',
      color: '#DBEAFE',
      prompt: '10월 수강료는 10월 5일까지 납부해주세요.',
      generatedTitle: '[수강료 납부 안내]',
      generatedContent: '안녕하세요, 학부모님 😊\n\n10월 수강료 납부 안내드립니다.\n\n납부 기한: 10월 5일(목)까지\n입금 계좌: 국민은행 123-456-789012\n\n기한 내 납부 부탁드립니다.',
    },
    {
      id: '4',
      title: '직접 입력',
      emoji: '✏️',
      color: '#FEE2E2',
      prompt: '',
      generatedTitle: '',
      generatedContent: '',
    },
  ];

  // 템플릿 선택 시 애니메이션
  useEffect(() => {
    if (selectedTemplate) {
      // 부드러운 페이드아웃 후 페이드인
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [selectedTemplate]);

  const handleTemplateSelect = (template) => {
    // 스케일 애니메이션
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    setSelectedTemplate(template.id);
    setAiPrompt(template.prompt);
    setPreviewTitle(template.generatedTitle);
    setPreviewContent(template.generatedContent);
  };

  const handleAiGenerate = () => {
    Alert.alert('AI 작성', 'AI가 알림장을 작성 중입니다...', [
      { text: '확인' }
    ]);
  };

  const handleSave = () => {
    if (!previewTitle.trim() || !previewContent.trim()) {
      Alert.alert('알림', '제목과 내용을 입력해주세요.');
      return;
    }

    Alert.alert('성공', '알림장이 저장되었습니다.', [
      { text: '확인', onPress: () => navigation.goBack() }
    ]);
  };

  const isDirectInput = selectedTemplate === '4';

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* 헤더 */}
      <View className="bg-primary px-5 py-4">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Ionicons name="book" size={24} color="white" />
            <Text className="text-white text-xl font-bold ml-2">피아노 학원 관리</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-5 py-4">


        {/* 템플릿 선택 카드 */}
        <Card className="mb-4">
          <View className="flex-row items-center mb-4">
            <Text className="text-lg">📝</Text>
            <Text className="text-base font-bold text-gray-800 ml-2">
              어떤 알림을 보내시나요?
            </Text>
          </View>

          {/* 템플릿 버튼들 */}
          <View className="flex-row flex-wrap -mx-1">
            {templates.map((template) => (
              <TouchableOpacity
                key={template.id}
                className="w-1/2 px-1 mb-2"
                onPress={() => handleTemplateSelect(template)}
                activeOpacity={0.7}
              >
                <Animated.View
                  className={`rounded-xl p-4 items-center justify-center ${
                    selectedTemplate === template.id ? 'border-2 border-primary' : 'border border-gray-200'
                  }`}
                  style={{
                    backgroundColor: template.color,
                    minHeight: 80,
                    transform: selectedTemplate === template.id ? [{ scale: scaleAnim }] : [{ scale: 1 }],
                  }}
                >
                  <Text className="text-2xl mb-1">{template.emoji}</Text>
                  <Text className="text-sm font-semibold text-gray-700">
                    {template.title}
                  </Text>
                </Animated.View>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* AI에게 요청하기 섹션 - 직접 입력이 아닐 때만 표시 */}
        {selectedTemplate && !isDirectInput && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <View className="bg-purple-50 rounded-2xl p-5 mb-4">
              <View className="flex-row items-center mb-3">
                <Ionicons name="sparkles" size={20} color="#8B5CF6" />
                <Text className="text-base font-bold text-gray-800 ml-2">
                  AI에게 요청하기
                </Text>
              </View>

              {/* AI 입력 영역 */}
              <TextInput
                className="bg-white rounded-xl p-4 text-sm border border-gray-200 mb-3"
                placeholder="예: 12월 25일 오후 2시에 학원 연주홀에서 발표회를 합니다. 학부모님들께 안내문을 작성해주세요."
                value={aiPrompt}
                onChangeText={setAiPrompt}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={{ fontFamily: 'MaruBuri-Regular', minHeight: 100 }}
              />

              {/* AI로 작성하기 버튼 */}
              <TouchableOpacity
                className="bg-primary rounded-xl p-4 flex-row items-center justify-center"
                onPress={handleAiGenerate}
                activeOpacity={0.8}
              >
                <Text className="text-white text-base font-bold mr-1">AI로 작성하기</Text>
                <Text className="text-xl">✨</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* 생성된 알림장 미리보기 - 항상 표시 */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <View className="bg-white rounded-2xl p-5 mb-4">
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center">
                <Text className="text-lg">📋</Text>
                <Text className="text-base font-bold text-gray-800 ml-2">
                  {isDirectInput ? '직접 작성하기' : '생성된 알림장'}
                </Text>
              </View>
              {!isDirectInput && selectedTemplate && (
                <View className="flex-row">
                  <TouchableOpacity className="border border-gray-300 rounded-lg px-3 py-1 mr-2">
                    <Text className="text-xs text-gray-700">더 친절하게</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="border border-gray-300 rounded-lg px-3 py-1">
                    <Text className="text-xs text-gray-700">더 간결하게</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* 직접 입력 모드 */}
            {isDirectInput ? (
              <>
                {/* 제목 */}
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">제목</Text>
                  <TextInput
                    className="bg-gray-50 rounded-xl p-4 text-base border border-gray-200"
                    placeholder="제목을 입력하세요"
                    value={previewTitle}
                    onChangeText={setPreviewTitle}
                    style={{ fontFamily: 'MaruBuri-Regular' }}
                  />
                </View>

                {/* 내용 */}
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">내용</Text>
                  <TextInput
                    className="bg-gray-50 rounded-xl p-4 text-base border border-gray-200"
                    placeholder="내용을 입력하세요"
                    value={previewContent}
                    onChangeText={setPreviewContent}
                    multiline
                    numberOfLines={10}
                    textAlignVertical="top"
                    style={{ fontFamily: 'MaruBuri-Regular', minHeight: 200 }}
                  />
                </View>
              </>
            ) : (
              <>
                {/* AI 생성 미리보기 */}
                {selectedTemplate ? (
                  <>
                    {/* 제목 */}
                    <View className="mb-3">
                      <Text className="text-sm font-bold text-gray-900 mb-1">
                        {previewTitle}
                      </Text>
                    </View>

                    {/* 내용 */}
                    <View className="bg-gray-50 rounded-xl p-4 mb-4">
                      <Text className="text-sm text-gray-700 leading-5">
                        {previewContent}
                      </Text>
                    </View>
                  </>
                ) : (
                  <View className="py-12 items-center justify-center">
                    <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
                    <Text className="text-gray-400 mt-3 text-center">
                      템플릿을 선택하면{'\n'}미리보기가 표시됩니다
                    </Text>
                  </View>
                )}
              </>
            )}

            {/* 액션 버튼 */}
            {selectedTemplate && (
              <View className="flex-row">
                <TouchableOpacity
                  className="flex-1 border border-gray-300 rounded-xl p-4 items-center mr-2"
                  activeOpacity={0.7}
                  onPress={() => {
                    setSelectedTemplate(null);
                    setAiPrompt('');
                    setPreviewTitle('');
                    setPreviewContent('');
                  }}
                >
                  <Text className="text-gray-700 font-semibold">다시 작성</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-blue-500 rounded-xl p-4 items-center"
                  activeOpacity={0.8}
                  onPress={handleSave}
                >
                  <Text className="text-white font-semibold">다음 →</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
