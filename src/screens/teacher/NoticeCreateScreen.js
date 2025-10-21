import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  Text,
  Card,
  FormInput,
  Button,
  ScreenHeader
} from '../../components/common';
import TEACHER_COLORS from '../../styles/teacher_colors';
import { useNoticeStore, useStudentStore, useNotificationStore, useAuthStore } from '../../store';
import { useToastStore } from '../../store';
import { generateNoticeContent, improveNoticeContent, isGeminiAvailable } from '../../services/geminiService';
import { ActivityRepository } from '../../repositories/ActivityRepository';
import NoticeTemplateSelector from '../../components/teacher/NoticeTemplateSelector';
import NoticeRecipientSelector from '../../components/teacher/NoticeRecipientSelector';
import { NOTICE_TEMPLATES } from '../../constants/noticeTemplates';

export default function NoticeCreateScreen({ navigation }) {
  // Zustand Stores
  const { createNotice, loading: noticeLoading } = useNoticeStore();
  const { students, fetchStudents } = useStudentStore();
  const { addNotification } = useNotificationStore();
  const user = useAuthStore((state) => state.user);
  const toast = useToastStore();

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewContent, setPreviewContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState('compose'); // 'compose' or 'selectRecipients'
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('전체');
  const [dayFilter, setDayFilter] = useState('전체');

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // 학생 목록 로드
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

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
    setAiPrompt(template.prompt || '');
    setPreviewTitle(template.generatedTitle || '');
    setPreviewContent(template.generatedContent || '');
  };

  // AI로 내용 개선하기 (더 친절하게 / 더 간결하게)
  const handleImproveContent = async (direction) => {
    if (!previewContent.trim()) {
      toast.warning('먼저 알림장을 작성해주세요');
      return;
    }

    if (!isGeminiAvailable()) {
      toast.error('Gemini API 키가 설정되지 않았습니다');
      return;
    }

    setIsGenerating(true);

    try {
      const result = await improveNoticeContent(previewContent, direction);

      if (result.success) {
        setPreviewContent(result.content);
        toast.success(direction === 'friendly' ? '더 친절하게 수정했습니다! 😊' : '더 간결하게 수정했습니다! ✂️');
      } else {
        toast.error('내용 개선에 실패했습니다');
      }
    } catch (error) {
      console.error('내용 개선 오류:', error);
      toast.error('내용 개선 중 오류가 발생했습니다');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast.warning('요청 내용을 입력해주세요');
      return;
    }

    // Gemini API 사용 가능 여부 확인
    if (!isGeminiAvailable()) {
      toast.error('Gemini API 키가 설정되지 않았습니다');
      return;
    }

    setIsGenerating(true);

    try {
      // Gemini AI로 알림장 생성
      const result = await generateNoticeContent(aiPrompt, selectedTemplate);

      if (result.success) {
        setPreviewTitle(result.title);
        setPreviewContent(result.content);
        toast.success('AI가 알림장을 작성했습니다! ✨');
      } else {
        // AI 실패시 폴백 컨텐츠 사용
        setPreviewTitle(result.title);
        setPreviewContent(result.content);
        toast.warning('AI 생성에 실패했지만 기본 템플릿을 사용합니다');
      }
    } catch (error) {
      console.error('AI 생성 오류:', error);
      toast.error('AI 생성 중 오류가 발생했습니다');

      // 에러 발생시 기본 템플릿 사용
      setPreviewTitle(generateTitle(aiPrompt));
      setPreviewContent(generateContent(aiPrompt));
    } finally {
      setIsGenerating(false);
    }
  };

  // AI 제목 생성 함수 (목업)
  const generateTitle = (prompt) => {
    if (prompt.includes('발표회') || prompt.includes('공연')) {
      return '[발표회 안내]';
    } else if (prompt.includes('휴강') || prompt.includes('휴일')) {
      return '[휴강 안내]';
    } else if (prompt.includes('수강료') || prompt.includes('납부')) {
      return '[수강료 납부 안내]';
    } else {
      return '[학원 안내]';
    }
  };

  // AI 내용 생성 함수 (목업)
  const generateContent = (prompt) => {
    const greeting = '안녕하세요, 학부모님 😊\n\n';
    const closing = '\n\n감사합니다.';

    // 프롬프트에서 주요 정보 추출하여 내용 생성
    const mainContent = prompt;

    return greeting + mainContent + closing;
  };

  const handleNextStep = () => {
    if (!previewTitle.trim() || !previewContent.trim()) {
      toast.warning('제목과 내용을 입력해주세요');
      return;
    }
    setCurrentStep('selectRecipients');
  };

  const handleStudentToggle = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(s => s.id));
    }
  };

  const handleSend = async () => {
    if (selectedStudents.length === 0) {
      toast.warning('발송할 학생을 선택해주세요');
      return;
    }

    try {
      // 현재 날짜/시간
      const now = new Date();
      const dateStr = formatDate(now);
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      // 알림장 저장 (Zustand Store 사용)
      await createNotice({
        title: previewTitle,
        content: previewContent,
        date: dateStr,
        time: timeStr,
        confirmed: 0,
        total: selectedStudents.length,
        recipients: selectedStudents, // 학생 ID 배열 저장
      });

      // 활동 로그 추가 (대시보드 최근 활동용)
      try {
        await ActivityRepository.create({
          type: 'notice',
          action: '알림장 발송',
          studentName: null,
          details: `${selectedStudents.length}명에게 발송`,
          icon: 'chatbubble-ellipses',
          color: TEACHER_COLORS.primary.DEFAULT,
        });
      } catch (activityError) {
        console.error('활동 로그 저장 실패:', activityError);
        // 활동 로그 실패는 무시하고 계속 진행
      }

      // 알림 추가 (알림 뱃지용)
      try {
        if (user?.uid) {
          await addNotification(
            {
              type: 'notice_sent',
              title: '알림장 발송 완료',
              message: `${selectedStudents.length}명에게 알림장이 발송되었습니다`,
              targetId: null,
            },
            user.uid
          );
        }
      } catch (notificationError) {
        console.error('알림 추가 실패:', notificationError);
        // 알림 추가 실패는 무시하고 계속 진행
      }

      toast.success(`${selectedStudents.length}명의 학생에게 알림장이 발송되었습니다`);
      navigation.goBack();
    } catch (error) {
      toast.error('알림장 발송에 실패했습니다');
      console.error('알림장 발송 오류:', error);
    }
  };

  const isDirectInput = selectedTemplate === '4';

  // 필터링된 학생 목록
  const filteredStudents = students.filter(student => {
    // 카테고리 필터
    const matchesCategory = categoryFilter === '전체' || student.category === categoryFilter;

    // 요일 필터
    let matchesDay = true;
    if (dayFilter !== '전체') {
      const scheduleDays = student.schedule.split(' ')[0].split('/');
      matchesDay = scheduleDays.includes(dayFilter);
    }

    return matchesCategory && matchesDay;
  });

  // 발송 대상 선택 화면
  if (currentStep === 'selectRecipients') {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* 헤더 */}
        <ScreenHeader
          title="발송 대상 선택"
          onBackPress={() => setCurrentStep('compose')}
          rightButton={
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="close" size={24} color={TEACHER_COLORS.gray[800]} />
            </TouchableOpacity>
          }
        />

        <ScrollView className="flex-1 px-5 py-4">
          {/* 필터 섹션 */}
          <View className="bg-white rounded-2xl p-4 mb-4">
            <Text className="text-base font-bold text-gray-800 mb-3">필터</Text>

            {/* 카테고리 필터 */}
            <View className="mb-3">
              <Text className="text-sm font-semibold text-gray-700 mb-2">카테고리</Text>
              <FilterChip
                options={['전체', '초등', '고등', '성인'].map(cat => ({ value: cat, label: cat }))}
                value={categoryFilter}
                onChange={setCategoryFilter}
                layout="wrapped"
              />
            </View>

            {/* 요일 필터 */}
            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-2">요일</Text>
              <FilterChip
                options={['전체', '월', '화', '수', '목', '금', '토', '일'].map(day => ({ value: day, label: day }))}
                value={dayFilter}
                onChange={setDayFilter}
                layout="wrapped"
              />
            </View>
          </View>

          {/* 선택 정보 및 일괄 버튼 */}
          <View className="bg-white rounded-2xl p-4 mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-base font-bold text-gray-800">발송 대상</Text>
              <Text className="text-sm text-primary font-bold">
                {selectedStudents.length}/{filteredStudents.length}명 선택
              </Text>
            </View>

            <View className="flex-row gap-2">
              <Button
                title="모두 선택"
                icon="checkmark-done"
                onPress={() => setSelectedStudents(filteredStudents.map(s => s.id))}
                size="small"
                style={{ flex: 1 }}
              />

              <Button
                title="선택 해제"
                icon="close-circle"
                variant="secondary"
                onPress={() => setSelectedStudents([])}
                size="small"
                style={{ flex: 1 }}
              />
            </View>
          </View>

          {/* 학생 목록 */}
          <View className="bg-white rounded-2xl p-4 mb-4">
            <Text className="text-base font-bold text-gray-800 mb-3">
              학생 목록 ({filteredStudents.length}명)
            </Text>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student, index) => (
                <TouchableOpacity
                  key={student.id}
                  className={`flex-row items-center justify-between py-3 ${
                    index < filteredStudents.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                  onPress={() => handleStudentToggle(student.id)}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center flex-1">
                    <Ionicons
                      name={selectedStudents.includes(student.id) ? "checkbox" : "square-outline"}
                      size={22}
                      color={selectedStudents.includes(student.id) ? TEACHER_COLORS.primary.DEFAULT : TEACHER_COLORS.gray[400]}
                    />
                    <View className="ml-3 flex-1">
                      <View className="flex-row items-center mb-1">
                        <Text className="text-base font-bold text-gray-800 mr-2">
                          {student.name}
                        </Text>
                        <LevelBadge level={student.level} />
                      </View>
                      <Text className="text-xs text-gray-600">{student.schedule}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View className="py-8 items-center">
                <Ionicons name="search-outline" size={48} color={TEACHER_COLORS.gray[200]} />
                <Text className="text-gray-400 mt-3 text-center">
                  해당 조건의 학생이 없습니다
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* 하단 발송 버튼 */}
        <View className="bg-white px-5 py-4 border-t border-gray-200">
          <Button
            title={selectedStudents.length > 0
              ? `${selectedStudents.length}명에게 발송하기`
              : '학생을 선택해주세요'}
            onPress={handleSend}
            loading={noticeLoading}
            disabled={selectedStudents.length === 0 || noticeLoading}
            fullWidth
          />
        </View>
      </SafeAreaView>
    );
  }

  // 알림장 작성 화면
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* 헤더 */}
      <ScreenHeader
        title="알림장 작성"
        rightButton={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={24} color={TEACHER_COLORS.gray[800]} />
          </TouchableOpacity>
        }
      />

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
            <View className="rounded-2xl p-5 mb-4" style={{ backgroundColor: TEACHER_COLORS.purple[50] }}>
              <View className="flex-row items-center mb-3">
                <Ionicons name="sparkles" size={20} color={TEACHER_COLORS.primary.DEFAULT} />
                <Text className="text-base font-bold text-gray-800 ml-2">
                  AI에게 요청하기
                </Text>
              </View>

              {/* AI 입력 영역 */}
              <FormInput
                placeholder="예: 12월 25일 오후 2시에 학원 연주홀에서 발표회를 합니다. 학부모님들께 안내문을 작성해주세요."
                value={aiPrompt}
                onChangeText={setAiPrompt}
                type="multiline"
                numberOfLines={4}
                style={{ marginBottom: 12 }}
              />

              {/* AI로 작성하기 버튼 */}
              <Button
                title={isGenerating ? "AI 작성 중 ⏳" : "AI로 작성하기 ✨"}
                onPress={handleAiGenerate}
                loading={isGenerating}
                disabled={isGenerating}
                fullWidth
              />
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
              {!isDirectInput && selectedTemplate && previewContent && (
                <View className="flex-row">
                  <TouchableOpacity
                    className="border border-gray-300 rounded-lg px-3 py-1 mr-2"
                    onPress={() => handleImproveContent('friendly')}
                    disabled={isGenerating}
                    activeOpacity={0.7}
                  >
                    <Text className="text-xs text-gray-700">{isGenerating ? '⏳' : '더 친절하게'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="border border-gray-300 rounded-lg px-3 py-1"
                    onPress={() => handleImproveContent('concise')}
                    disabled={isGenerating}
                    activeOpacity={0.7}
                  >
                    <Text className="text-xs text-gray-700">{isGenerating ? '⏳' : '더 간결하게'}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* 직접 입력 모드 */}
            {isDirectInput ? (
              <>
                {/* 제목 */}
                <FormInput
                  label="제목"
                  placeholder="제목을 입력하세요"
                  value={previewTitle}
                  onChangeText={setPreviewTitle}
                  style={{ marginBottom: 16 }}
                />

                {/* 내용 */}
                <FormInput
                  label="내용"
                  placeholder="내용을 입력하세요"
                  value={previewContent}
                  onChangeText={setPreviewContent}
                  type="multiline"
                  numberOfLines={10}
                  style={{ marginBottom: 16 }}
                />
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
                    <Ionicons name="document-text-outline" size={48} color={TEACHER_COLORS.gray[200]} />
                    <Text className="text-gray-400 mt-3 text-center">
                      템플릿을 선택하면{'\n'}미리보기가 표시됩니다
                    </Text>
                  </View>
                )}
              </>
            )}

            {/* 액션 버튼 */}
            {selectedTemplate && (
              <View className="flex-row gap-2">
                <Button
                  title="다시 작성"
                  variant="outline"
                  onPress={() => {
                    setSelectedTemplate(null);
                    setAiPrompt('');
                    setPreviewTitle('');
                    setPreviewContent('');
                  }}
                  style={{ flex: 1 }}
                />
                <Button
                  title="다음 →"
                  variant="success"
                  onPress={handleNextStep}
                  style={{ flex: 1 }}
                />
              </View>
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// 템플릿 데이터
const templates = [
  {
    id: '1',
    title: '발표회',
    emoji: '🎹',
    color: TEACHER_COLORS.blue[50],
    prompt: '발표회 안내',
    generatedTitle: '[발표회 안내]',
    generatedContent: '안녕하세요, 학부모님\n\n피아노 발표회를 안내드립니다.\n자세한 내용은 AI로 작성해주세요.\n\n감사합니다.',
  },
  {
    id: '2',
    title: '휴강 안내',
    emoji: '📅',
    color: TEACHER_COLORS.orange[50],
    prompt: '휴강 안내',
    generatedTitle: '[휴강 안내]',
    generatedContent: '안녕하세요, 학부모님\n\n휴강 일정을 안내드립니다.\n자세한 내용은 AI로 작성해주세요.\n\n감사합니다.',
  },
  {
    id: '3',
    title: '수강료',
    emoji: '💰',
    color: TEACHER_COLORS.green[50],
    prompt: '수강료 납부 안내',
    generatedTitle: '[수강료 납부 안내]',
    generatedContent: '안녕하세요, 학부모님\n\n수강료 납부 안내드립니다.\n자세한 내용은 AI로 작성해주세요.\n\n감사합니다.',
  },
  {
    id: '4',
    title: '직접 입력',
    emoji: '✏️',
    color: TEACHER_COLORS.purple[50],
  },
];

// 필터 칩 컴포넌트
function FilterChip({ options, value, onChange, layout = 'wrapped' }) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          className={`px-3 py-2 rounded-lg ${
            value === option.value
              ? 'bg-primary'
              : 'bg-gray-100'
          }`}
          onPress={() => onChange(option.value)}
          activeOpacity={0.7}
        >
          <Text
            className={`text-sm font-semibold ${
              value === option.value
                ? 'text-white'
                : 'text-gray-700'
            }`}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// 레벨 뱃지 컴포넌트
function LevelBadge({ level }) {
  const levelColors = {
    '초급': { bg: TEACHER_COLORS.green[50], text: TEACHER_COLORS.green[700] },
    '중급': { bg: TEACHER_COLORS.blue[50], text: TEACHER_COLORS.blue[700] },
    '고급': { bg: TEACHER_COLORS.purple[50], text: TEACHER_COLORS.purple[700] },
  };

  const colors = levelColors[level] || levelColors['초급'];

  return (
    <View
      className="px-2 py-0.5 rounded"
      style={{ backgroundColor: colors.bg }}
    >
      <Text className="text-xs font-semibold" style={{ color: colors.text }}>
        {level}
      </Text>
    </View>
  );
}

// 날짜 포맷 함수
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}
