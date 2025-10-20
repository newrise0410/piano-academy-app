import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, Alert, Animated, Easing, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Text from '../../components/common/Text';
import Card from '../../components/common/Card';
import TEACHER_COLORS, { TEACHER_TEMPLATE_COLORS } from '../../styles/teacher_colors';
import { NoticeRepository, StudentRepository } from '../../repositories';

export default function NoticeCreateScreen({ navigation }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewContent, setPreviewContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState('compose'); // 'compose' or 'selectRecipients'
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('전체');
  const [dayFilter, setDayFilter] = useState('전체');

  const [students, setStudents] = useState([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // 학생 목록 로드
  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setIsLoadingStudents(true);
    try {
      const data = await StudentRepository.getAll();
      setStudents(data);
    } catch (error) {
      console.error('학생 목록 로드 실패:', error);
      Alert.alert('오류', '학생 목록을 불러오지 못했습니다.');
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const templates = [
    {
      id: '1',
      title: '발표회 안내',
      emoji: '🎹',
      color: TEACHER_TEMPLATE_COLORS.concert,
      prompt: '12월 25일 오후 2시에 학원 연주홀에서 발표회를 개최합니다.',
      generatedTitle: '[발표회 안내]',
      generatedContent: '안녕하세요, 학부모님 😊\n\n12월 25일(수) 오후 2시, 학원 연주홀에서 정기 발표회를 개최합니다.\n\n그동안 열심히 연습한 곡들을 보여드릴 수 있는 소중한 시간이니 많은 참석 부탁드립니다.',
    },
    {
      id: '2',
      title: '휴강 안내',
      emoji: '🏠',
      color: TEACHER_TEMPLATE_COLORS.closure,
      prompt: '10월 18일(금)은 원장님 개인 사정으로 휴강합니다.',
      generatedTitle: '[휴강 안내]',
      generatedContent: '안녕하세요, 학부모님 😊\n\n10월 18일(금)은 원장님 개인 사정으로 휴강하게 되었습니다.\n\n보강 일정은 추후 개별적으로 안내드리겠습니다. 양해 부탁드립니다.',
    },
    {
      id: '3',
      title: '수강료 안내',
      emoji: '💰',
      color: TEACHER_TEMPLATE_COLORS.tuition,
      prompt: '10월 수강료는 10월 5일까지 납부해주세요.',
      generatedTitle: '[수강료 납부 안내]',
      generatedContent: '안녕하세요, 학부모님 😊\n\n10월 수강료 납부 안내드립니다.\n\n납부 기한: 10월 5일(목)까지\n입금 계좌: 국민은행 123-456-789012\n\n기한 내 납부 부탁드립니다.',
    },
    {
      id: '4',
      title: '직접 입력',
      emoji: '✏️',
      color: TEACHER_TEMPLATE_COLORS.custom,
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

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) {
      Alert.alert('알림', '요청 내용을 입력해주세요.');
      return;
    }

    setIsGenerating(true);

    // AI 생성 시뮬레이션 (실제로는 OpenAI API 등을 호출)
    setTimeout(() => {
      // 간단한 AI 시뮬레이션: 프롬프트 기반으로 내용 생성
      const generatedTitle = generateTitle(aiPrompt);
      const generatedContent = generateContent(aiPrompt);

      setPreviewTitle(generatedTitle);
      setPreviewContent(generatedContent);
      setIsGenerating(false);

      Alert.alert('완료', 'AI가 알림장을 작성했습니다!');
    }, 2000); // 2초 딜레이로 AI 생성 시뮬레이션
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
      Alert.alert('알림', '제목과 내용을 입력해주세요.');
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
      Alert.alert('알림', '발송할 학생을 선택해주세요.');
      return;
    }

    setIsSending(true);

    try {
      // 현재 날짜/시간
      const now = new Date();
      const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      // 알림장 저장
      await NoticeRepository.create({
        title: previewTitle,
        content: previewContent,
        date: dateStr,
        time: timeStr,
        recipients: selectedStudents.length,
      });

      Alert.alert('성공', `${selectedStudents.length}명의 학생에게 알림장이 발송되었습니다.`, [
        { text: '확인', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('오류', `알림장 발송에 실패했습니다.\n${error.message}`);
      console.error('알림장 발송 오류:', error);
    } finally {
      setIsSending(false);
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
        <View className="bg-primary px-5 py-4">
          <View className="flex-row justify-between items-center">
            <TouchableOpacity onPress={() => setCurrentStep('compose')}>
              <Ionicons name="arrow-back" size={28} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">발송 대상 선택</Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1 px-5 py-4">
          {/* 필터 섹션 */}
          <View className="bg-white rounded-2xl p-4 mb-4">
            <Text className="text-base font-bold text-gray-800 mb-3">필터</Text>

            {/* 카테고리 필터 */}
            <View className="mb-3">
              <Text className="text-sm font-semibold text-gray-700 mb-2">카테고리</Text>
              <View className="flex-row flex-wrap">
                {['전체', '초등', '고등', '성인'].map((category) => (
                  <TouchableOpacity
                    key={category}
                    className={`rounded-full px-4 py-2 mr-2 mb-2 ${
                      categoryFilter === category
                        ? 'bg-primary'
                        : 'bg-gray-100'
                    }`}
                    onPress={() => setCategoryFilter(category)}
                    activeOpacity={0.7}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        categoryFilter === category
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

            {/* 요일 필터 */}
            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-2">요일</Text>
              <View className="flex-row flex-wrap">
                {['전체', '월', '화', '수', '목', '금', '토', '일'].map((day) => (
                  <TouchableOpacity
                    key={day}
                    className={`rounded-full px-4 py-2 mr-2 mb-2 ${
                      dayFilter === day
                        ? 'bg-primary'
                        : 'bg-gray-100'
                    }`}
                    onPress={() => setDayFilter(day)}
                    activeOpacity={0.7}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        dayFilter === day
                          ? 'text-white'
                          : 'text-gray-700'
                      }`}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
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

            <View className="flex-row">
              <TouchableOpacity
                className="flex-1 bg-primary rounded-xl py-3 mr-2"
                onPress={() => setSelectedStudents(filteredStudents.map(s => s.id))}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons name="checkmark-done" size={18} color="white" />
                  <Text className="text-white text-sm font-bold ml-1">모두 선택</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 bg-gray-500 rounded-xl py-3 ml-2"
                onPress={() => setSelectedStudents([])}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons name="close-circle" size={18} color="white" />
                  <Text className="text-white text-sm font-bold ml-1">선택 해제</Text>
                </View>
              </TouchableOpacity>
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
                        <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: TEACHER_COLORS.purple[100] }}>
                          <Text className="text-xs font-bold text-primary">{student.level}</Text>
                        </View>
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
          <TouchableOpacity
            className={`rounded-xl p-4 items-center ${
              selectedStudents.length > 0 && !isSending ? 'bg-primary' : 'bg-gray-300'
            }`}
            onPress={handleSend}
            activeOpacity={0.8}
            disabled={selectedStudents.length === 0 || isSending}
            style={{ opacity: isSending ? 0.7 : 1 }}
          >
            {isSending ? (
              <View className="flex-row items-center">
                <ActivityIndicator color="white" size="small" />
                <Text className="text-white text-base font-bold ml-2">
                  발송 중...
                </Text>
              </View>
            ) : (
              <Text className="text-white text-base font-bold">
                {selectedStudents.length > 0
                  ? `${selectedStudents.length}명에게 발송하기`
                  : '학생을 선택해주세요'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 알림장 작성 화면
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
            <View className="rounded-2xl p-5 mb-4" style={{ backgroundColor: TEACHER_COLORS.purple[50] }}>
              <View className="flex-row items-center mb-3">
                <Ionicons name="sparkles" size={20} color={TEACHER_COLORS.primary.DEFAULT} />
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
                disabled={isGenerating}
                style={{ opacity: isGenerating ? 0.6 : 1 }}
              >
                {isGenerating ? (
                  <>
                    <Text className="text-white text-base font-bold mr-2">AI 작성 중</Text>
                    <Text className="text-xl">⏳</Text>
                  </>
                ) : (
                  <>
                    <Text className="text-white text-base font-bold mr-1">AI로 작성하기</Text>
                    <Text className="text-xl">✨</Text>
                  </>
                )}
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
                  className="flex-1 rounded-xl p-4 items-center"
                  style={{ backgroundColor: TEACHER_COLORS.blue[500] }}
                  activeOpacity={0.8}
                  onPress={handleNextStep}
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
