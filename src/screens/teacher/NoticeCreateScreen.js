import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  Text,
  Card,
  FormInput,
  Button,
  ScreenHeader,
  MediaPicker
} from '../../components/common';
import TEACHER_COLORS from '../../styles/teacher_colors';
import { SHADOWS, RADIUS, SPACING, TYPOGRAPHY, CARD_STYLES, BADGE_STYLES } from '../../styles/commonStyles';
import { useNoticeStore, useStudentStore, useNotificationStore, useAuthStore } from '../../store';
import { useToastStore } from '../../store';
import { generateNoticeContent, improveNoticeContent, isGeminiAvailable } from '../../services/geminiService';
import { uploadMultipleMedia } from '../../services/firestoreService';
import { sendNoticeNotification } from '../../services/pushNotificationService';
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
  const [selectedMedia, setSelectedMedia] = useState([]); // 미디어 첨부
  const [uploadProgress, setUploadProgress] = useState(0);

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

      // 미디어 업로드 (있는 경우)
      let uploadedMediaUrls = [];
      if (selectedMedia.length > 0) {
        toast.info('미디어 업로드 중...');
        const uploadResult = await uploadMultipleMedia(
          selectedMedia,
          'notices',
          (progress) => {
            setUploadProgress(progress);
          }
        );

        if (uploadResult.success) {
          uploadedMediaUrls = uploadResult.uploadedMedia;
          toast.success('미디어 업로드 완료');
        } else {
          throw new Error(uploadResult.error || '미디어 업로드 실패');
        }
      }

      // 알림장 저장 (Zustand Store 사용)
      await createNotice({
        title: previewTitle,
        content: previewContent,
        date: dateStr,
        time: timeStr,
        confirmed: 0,
        total: selectedStudents.length,
        recipients: selectedStudents, // 학생 ID 배열 저장
        media: uploadedMediaUrls, // 미디어 URL 배열 저장
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

      // 푸시 알림 전송
      try {
        await sendNoticeNotification(selectedStudents, previewTitle);
        console.log('푸시 알림 전송 완료');
      } catch (pushError) {
        console.error('푸시 알림 전송 실패:', pushError);
        // 푸시 알림 실패는 무시하고 계속 진행
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
      <SafeAreaView style={{ flex: 1, backgroundColor: TEACHER_COLORS.gray[50] }}>
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

        <ScrollView style={{ flex: 1, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg }}>
          {/* 필터 섹션 */}
          <View style={{ ...CARD_STYLES.default, marginBottom: SPACING.lg }}>
            <Text style={{ fontSize: TYPOGRAPHY.fontSize.base, fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.gray[800], marginBottom: SPACING.md }}>
              필터
            </Text>

            {/* 카테고리 필터 */}
            <View style={{ marginBottom: SPACING.md }}>
              <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: TEACHER_COLORS.gray[700], marginBottom: SPACING.sm }}>
                카테고리
              </Text>
              <FilterChip
                options={['전체', '초등', '고등', '성인'].map(cat => ({ value: cat, label: cat }))}
                value={categoryFilter}
                onChange={setCategoryFilter}
                layout="wrapped"
              />
            </View>

            {/* 요일 필터 */}
            <View>
              <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: TEACHER_COLORS.gray[700], marginBottom: SPACING.sm }}>
                요일
              </Text>
              <FilterChip
                options={['전체', '월', '화', '수', '목', '금', '토', '일'].map(day => ({ value: day, label: day }))}
                value={dayFilter}
                onChange={setDayFilter}
                layout="wrapped"
              />
            </View>
          </View>

          {/* 선택 정보 및 일괄 버튼 */}
          <View style={{ ...CARD_STYLES.default, marginBottom: SPACING.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md }}>
              <Text style={{ fontSize: TYPOGRAPHY.fontSize.base, fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.gray[800] }}>
                발송 대상
              </Text>
              <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: TEACHER_COLORS.primary.DEFAULT, fontWeight: TYPOGRAPHY.fontWeight.bold }}>
                {selectedStudents.length}/{filteredStudents.length}명 선택
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
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
          <View style={{ ...CARD_STYLES.default, marginBottom: SPACING.lg }}>
            <Text style={{ fontSize: TYPOGRAPHY.fontSize.base, fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.gray[800], marginBottom: SPACING.md }}>
              학생 목록 ({filteredStudents.length}명)
            </Text>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student, index) => (
                <TouchableOpacity
                  key={student.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: SPACING.md,
                    borderBottomWidth: index < filteredStudents.length - 1 ? 1 : 0,
                    borderBottomColor: TEACHER_COLORS.gray[100],
                  }}
                  onPress={() => handleStudentToggle(student.id)}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Ionicons
                      name={selectedStudents.includes(student.id) ? "checkbox" : "square-outline"}
                      size={22}
                      color={selectedStudents.includes(student.id) ? TEACHER_COLORS.primary.DEFAULT : TEACHER_COLORS.gray[400]}
                    />
                    <View style={{ marginLeft: SPACING.md, flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
                        <Text style={{ fontSize: TYPOGRAPHY.fontSize.base, fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.gray[800], marginRight: SPACING.sm }}>
                          {student.name}
                        </Text>
                        <LevelBadge level={student.level} />
                      </View>
                      <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs, color: TEACHER_COLORS.gray[600] }}>
                        {student.schedule}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={{ paddingVertical: SPACING['4xl'], alignItems: 'center' }}>
                <Ionicons name="search-outline" size={48} color={TEACHER_COLORS.gray[200]} />
                <Text style={{ color: TEACHER_COLORS.gray[400], marginTop: SPACING.md, textAlign: 'center', fontSize: TYPOGRAPHY.fontSize.sm }}>
                  해당 조건의 학생이 없습니다
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* 하단 발송 버튼 */}
        <View
          style={{
            backgroundColor: TEACHER_COLORS.white,
            paddingHorizontal: SPACING.xl,
            paddingVertical: SPACING.lg,
            borderTopWidth: 1,
            borderTopColor: TEACHER_COLORS.gray[200],
          }}
        >
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
    <SafeAreaView style={{ flex: 1, backgroundColor: TEACHER_COLORS.gray[50] }}>
      {/* 헤더 */}
      <ScreenHeader
        title="알림장 작성"
        rightButton={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={24} color={TEACHER_COLORS.gray[800]} />
          </TouchableOpacity>
        }
      />

      <ScrollView style={{ flex: 1, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg }}>


        {/* 템플릿 선택 카드 */}
        <Card style={{ marginBottom: SPACING.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg }}>
            <Text style={{ fontSize: TYPOGRAPHY.fontSize.lg }}>📝</Text>
            <Text style={{ fontSize: TYPOGRAPHY.fontSize.base, fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.gray[800], marginLeft: SPACING.sm }}>
              어떤 알림을 보내시나요?
            </Text>
          </View>

          {/* 템플릿 버튼들 */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -SPACING.xs }}>
            {templates.map((template) => (
              <TouchableOpacity
                key={template.id}
                style={{ width: '50%', paddingHorizontal: SPACING.xs, marginBottom: SPACING.sm }}
                onPress={() => handleTemplateSelect(template)}
                activeOpacity={0.7}
              >
                <Animated.View
                  style={{
                    backgroundColor: template.color,
                    borderRadius: RADIUS.xl,
                    padding: SPACING.lg,
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 80,
                    borderWidth: selectedTemplate === template.id ? 2 : 1,
                    borderColor: selectedTemplate === template.id ? TEACHER_COLORS.primary.DEFAULT : TEACHER_COLORS.gray[200],
                    transform: selectedTemplate === template.id ? [{ scale: scaleAnim }] : [{ scale: 1 }],
                  }}
                >
                  <Text style={{ fontSize: 24, marginBottom: SPACING.xs }}>{template.emoji}</Text>
                  <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: TEACHER_COLORS.gray[700] }}>
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
            <View
              style={{
                borderRadius: RADIUS['2xl'],
                padding: SPACING.xl,
                marginBottom: SPACING.lg,
                backgroundColor: TEACHER_COLORS.purple[50],
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
                <Ionicons name="sparkles" size={20} color={TEACHER_COLORS.primary.DEFAULT} />
                <Text style={{ fontSize: TYPOGRAPHY.fontSize.base, fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.gray[800], marginLeft: SPACING.sm }}>
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
                style={{ marginBottom: SPACING.md }}
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
          <View
            style={{
              ...CARD_STYLES.default,
              marginBottom: SPACING.lg,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: TYPOGRAPHY.fontSize.lg }}>📋</Text>
                <Text style={{ fontSize: TYPOGRAPHY.fontSize.base, fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.gray[800], marginLeft: SPACING.sm }}>
                  {isDirectInput ? '직접 작성하기' : '생성된 알림장'}
                </Text>
              </View>
              {!isDirectInput && selectedTemplate && previewContent && (
                <View style={{ flexDirection: 'row' }}>
                  <TouchableOpacity
                    style={{
                      borderWidth: 1,
                      borderColor: TEACHER_COLORS.gray[300],
                      borderRadius: RADIUS.md,
                      paddingHorizontal: SPACING.md,
                      paddingVertical: SPACING.xs,
                      marginRight: SPACING.sm,
                    }}
                    onPress={() => handleImproveContent('friendly')}
                    disabled={isGenerating}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs, color: TEACHER_COLORS.gray[700] }}>
                      {isGenerating ? '⏳' : '더 친절하게'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      borderWidth: 1,
                      borderColor: TEACHER_COLORS.gray[300],
                      borderRadius: RADIUS.md,
                      paddingHorizontal: SPACING.md,
                      paddingVertical: SPACING.xs,
                    }}
                    onPress={() => handleImproveContent('concise')}
                    disabled={isGenerating}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs, color: TEACHER_COLORS.gray[700] }}>
                      {isGenerating ? '⏳' : '더 간결하게'}
                    </Text>
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
                  style={{ marginBottom: SPACING.lg }}
                />

                {/* 내용 */}
                <FormInput
                  label="내용"
                  placeholder="내용을 입력하세요"
                  value={previewContent}
                  onChangeText={setPreviewContent}
                  type="multiline"
                  numberOfLines={10}
                  style={{ marginBottom: SPACING.lg }}
                />
              </>
            ) : (
              <>
                {/* AI 생성 미리보기 */}
                {selectedTemplate ? (
                  <>
                    {/* 제목 */}
                    <View style={{ marginBottom: SPACING.md }}>
                      <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.gray[900], marginBottom: SPACING.xs }}>
                        {previewTitle}
                      </Text>
                    </View>

                    {/* 내용 */}
                    <View
                      style={{
                        backgroundColor: TEACHER_COLORS.gray[50],
                        borderRadius: RADIUS.xl,
                        padding: SPACING.lg,
                        marginBottom: SPACING.lg,
                      }}
                    >
                      <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: TEACHER_COLORS.gray[700], lineHeight: TYPOGRAPHY.fontSize.sm * 1.5 }}>
                        {previewContent}
                      </Text>
                    </View>
                  </>
                ) : (
                  <View style={{ paddingVertical: SPACING['5xl'], alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="document-text-outline" size={48} color={TEACHER_COLORS.gray[200]} />
                    <Text style={{ color: TEACHER_COLORS.gray[400], marginTop: SPACING.md, textAlign: 'center', fontSize: TYPOGRAPHY.fontSize.sm }}>
                      템플릿을 선택하면{'\n'}미리보기가 표시됩니다
                    </Text>
                  </View>
                )}
              </>
            )}

            {/* 미디어 첨부 */}
            {selectedTemplate && (
              <View style={{ marginBottom: SPACING.lg }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
                  <Ionicons name="images-outline" size={18} color={TEACHER_COLORS.primary.DEFAULT} />
                  <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.gray[800], marginLeft: SPACING.sm }}>
                    사진/동영상 첨부 (선택)
                  </Text>
                </View>
                <MediaPicker
                  selectedMedia={selectedMedia}
                  onMediaChange={setSelectedMedia}
                  maxItems={5}
                  allowVideo={true}
                />
              </View>
            )}

            {/* 액션 버튼 */}
            {selectedTemplate && (
              <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
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
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={{
            paddingHorizontal: SPACING.md,
            paddingVertical: SPACING.sm,
            borderRadius: RADIUS.md,
            backgroundColor: value === option.value ? TEACHER_COLORS.primary.DEFAULT : TEACHER_COLORS.gray[100],
          }}
          onPress={() => onChange(option.value)}
          activeOpacity={0.7}
        >
          <Text
            style={{
              fontSize: TYPOGRAPHY.fontSize.sm,
              fontWeight: TYPOGRAPHY.fontWeight.semibold,
              color: value === option.value ? TEACHER_COLORS.white : TEACHER_COLORS.gray[700],
            }}
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
      style={{
        ...BADGE_STYLES.default(colors.bg),
      }}
    >
      <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: colors.text }}>
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
