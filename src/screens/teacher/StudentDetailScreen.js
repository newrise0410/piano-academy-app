import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Image, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import {
  Text,
  FormInput,
  Button,
  StatusBadge,
  AttendanceStatusBadge,
  PaymentStatusBadge,
  SectionCard,
  ScreenHeader
} from '../../components/common';
import TEACHER_COLORS, { TEACHER_SHADOW_COLORS, TEACHER_OVERLAY_COLORS } from '../../styles/teacher_colors';
import { useStudentStore } from '../../store';
import { useToastStore } from '../../store';
import { formatDate, formatCurrency } from '../../utils';

export default function StudentDetailScreen({ route, navigation }) {
  const { student } = route?.params || {};

  // Zustand Store
  const { deleteStudent, loading } = useStudentStore();

  const [activeTab, setActiveTab] = useState('정보');
  const [memo, setMemo] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isAIGenerating, setIsAIGenerating] = useState(false);

  // 출석 관련 상태
  const [attendanceRecords, setAttendanceRecords] = useState([
    { id: '1', date: '2025.01.15', status: 'present', note: '' },
    { id: '2', date: '2025.01.13', status: 'present', note: '30분 조기 하원' },
    { id: '3', date: '2025.01.10', status: 'absent', note: '학교 행사' },
    { id: '4', date: '2025.01.08', status: 'present', note: '' },
    { id: '5', date: '2025.01.06', status: 'late', note: '10분 지각' },
  ]);

  // 수강료 관련 상태
  const [paymentRecords, setPaymentRecords] = useState([
    { id: '1', date: '2025.01.01', amount: 280000, type: '8회권', status: 'paid', method: '카드' },
    { id: '2', date: '2024.12.01', amount: 280000, type: '8회권', status: 'paid', method: '현금' },
    { id: '3', date: '2024.11.01', amount: 280000, type: '8회권', status: 'paid', method: '카드' },
  ]);

  const tabs = ['정보', '진도', '출석', '수강료'];

  const handleGoBack = () => {
    if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  const handleEdit = () => {
    navigation.navigate('StudentForm', { student });
  };

  const handleDelete = () => {
    Alert.alert(
      '학생 삭제',
      `${student?.name || '학생'}을(를) 정말 삭제하시겠습니까?`,
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteStudent(student.id);
              Alert.alert('성공', '학생이 삭제되었습니다.', [
                { text: '확인', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              Alert.alert('오류', `삭제에 실패했습니다.\n${error.message}`);
              console.error('학생 삭제 오류:', error);
            }
          },
        },
      ]
    );
  };

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
    if (!memo.trim()) {
      Alert.alert('알림', '먼저 메모를 입력해주세요.');
      return;
    }

    setIsAIGenerating(true);

    // AI 생성 시뮬레이션
    setTimeout(() => {
      const improvedMemo = `[AI 개선]\n${memo}\n\n추가 관찰사항:\n- 리듬감이 향상되고 있습니다.\n- 다음 주까지 ${student?.book || '교재'} 복습 필요`;
      setMemo(improvedMemo);
      setIsAIGenerating(false);
      Alert.alert('완료', 'AI가 메모를 개선했습니다!');
    }, 2000);
  };

  // 출석 상태 배지 색상
  const getAttendanceStatusColor = (status) => {
    switch (status) {
      case 'present':
        return { bg: TEACHER_COLORS.green[50], text: TEACHER_COLORS.success[600], label: '출석' };
      case 'absent':
        return { bg: TEACHER_COLORS.red[100], text: TEACHER_COLORS.red[600], label: '결석' };
      case 'late':
        return { bg: '#FEF3C7', text: TEACHER_COLORS.warning[600], label: '지각' };
      default:
        return { bg: TEACHER_COLORS.gray[100], text: TEACHER_COLORS.gray[600], label: '-' };
    }
  };

  // 결제 상태 배지 색상
  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return { bg: TEACHER_COLORS.green[50], text: TEACHER_COLORS.success[600], label: '완료' };
      case 'unpaid':
        return { bg: TEACHER_COLORS.red[100], text: TEACHER_COLORS.red[600], label: '미납' };
      case 'overdue':
        return { bg: '#FEF3C7', text: TEACHER_COLORS.warning[600], label: '연체' };
      default:
        return { bg: TEACHER_COLORS.gray[100], text: TEACHER_COLORS.gray[600], label: '-' };
    }
  };

  // 새 결제 추가
  const handleAddPayment = () => {
    Alert.prompt(
      '수강료 등록',
      '금액을 입력하세요',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '등록',
          onPress: (amount) => {
            if (amount && !isNaN(amount)) {
              const newPayment = {
                id: Date.now().toString(),
                date: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
                amount: parseInt(amount),
                type: student?.ticketType === 'count' ? `${student?.ticketCount}회권` : '기간권',
                status: 'paid',
                method: '카드',
              };
              setPaymentRecords([newPayment, ...paymentRecords]);
              Alert.alert('완료', '수강료가 등록되었습니다.');
            }
          },
        },
      ],
      'plain-text',
      '',
      'numeric'
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case '정보':
        return (
          <View className="p-5">
            {/* 기본 정보 */}
            <View className="bg-white rounded-2xl p-4 mb-4">
              <Text className="text-base font-bold text-gray-800 mb-3">기본 정보</Text>

              <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                <Text className="text-sm text-gray-600">생년월일</Text>
                <Text className="text-sm font-semibold text-gray-800">2015.03.15</Text>
              </View>

              <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                <Text className="text-sm text-gray-600">등록일</Text>
                <Text className="text-sm font-semibold text-gray-800">2024.01.10</Text>
              </View>

              <View className="flex-row justify-between items-center py-2">
                <Text className="text-sm text-gray-600">연락처</Text>
                <Text className="text-sm font-semibold text-primary">김OO (010-1234-5678)</Text>
              </View>
            </View>

            {/* 현재 진도 */}
            <View className="bg-white rounded-2xl p-4 mb-4">
              <Text className="text-base font-bold text-gray-800 mb-3">현재 진도</Text>

              <View className="mb-3">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-sm text-gray-600">바이엘</Text>
                  <Text className="text-sm font-bold text-primary">48%</Text>
                </View>
                <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <View className="h-full bg-primary rounded-full" style={{ width: '48%' }} />
                </View>
                <Text className="text-xs text-gray-500 mt-1">48/100곡 완료</Text>
              </View>
            </View>

            {/* 메모 */}
            <View className="bg-white rounded-2xl p-4 mb-4">
              <Text className="text-base font-bold text-gray-800 mb-3">메모</Text>
              <TextInput
                className="bg-gray-50 rounded-xl p-3 text-sm min-h-[100px]"
                placeholder="학생에 대한 메모를 입력하세요..."
                multiline
                textAlignVertical="top"
                value={memo}
                onChangeText={setMemo}
                style={{ fontFamily: 'MaruBuri-Regular' }}
              />

              {/* 첨부파일 목록 */}
              {attachments.length > 0 && (
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
              <View className="flex-row mt-3">
                <TouchableOpacity
                  className="flex-1 rounded-xl py-3 mr-2 flex-row items-center justify-center"
                  style={{ backgroundColor: TEACHER_COLORS.gray[100] }}
                  onPress={() => pickMedia('image')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="image-outline" size={20} color={TEACHER_COLORS.gray[600]} />
                  <Text className="text-gray-700 text-sm font-semibold ml-2">사진</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 rounded-xl py-3 mr-2 flex-row items-center justify-center"
                  style={{ backgroundColor: TEACHER_COLORS.gray[100] }}
                  onPress={() => pickMedia('video')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="videocam-outline" size={20} color={TEACHER_COLORS.gray[600]} />
                  <Text className="text-gray-700 text-sm font-semibold ml-2">영상</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 bg-primary rounded-xl py-3 flex-row items-center justify-center"
                  onPress={handleAIImprove}
                  activeOpacity={0.7}
                  disabled={isAIGenerating}
                  style={{ opacity: isAIGenerating ? 0.6 : 1 }}
                >
                  {isAIGenerating ? (
                    <>
                      <Ionicons name="hourglass-outline" size={20} color="white" />
                      <Text className="text-white text-sm font-semibold ml-2">생성중...</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="sparkles-outline" size={20} color="white" />
                      <Text className="text-white text-sm font-semibold ml-2">AI 개선</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* 저장하기 버튼 */}
            <TouchableOpacity
              className="bg-primary rounded-2xl p-4 items-center"
              activeOpacity={0.8}
              style={{
                shadowColor: TEACHER_COLORS.primary[600],
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Text className="text-white text-base font-bold">저장하기</Text>
            </TouchableOpacity>
          </View>
        );

      case '진도':
        return (
          <View className="p-5">
            <View className="bg-white rounded-2xl p-4">
              <Text className="text-base font-bold text-gray-800 mb-3">교재별 진도</Text>
              <Text className="text-sm text-gray-500">진도 관리 기능은 준비 중입니다.</Text>
            </View>
          </View>
        );

      case '출석':
        return (
          <View className="p-5">
            {/* 출석 통계 */}
            <View className="bg-white rounded-2xl p-4 mb-4">
              <Text className="text-base font-bold text-gray-800 mb-3">이번 달 출석률</Text>
              <View className="flex-row justify-around">
                <View className="items-center">
                  <Text className="text-2xl font-bold" style={{ color: TEACHER_COLORS.success[600] }}>8</Text>
                  <Text className="text-xs text-gray-500 mt-1">출석</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold" style={{ color: TEACHER_COLORS.red[600] }}>1</Text>
                  <Text className="text-xs text-gray-500 mt-1">결석</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold" style={{ color: TEACHER_COLORS.orange[600] }}>1</Text>
                  <Text className="text-xs text-gray-500 mt-1">지각</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold text-primary">80%</Text>
                  <Text className="text-xs text-gray-500 mt-1">출석률</Text>
                </View>
              </View>
            </View>

            {/* 출석 기록 */}
            <View className="bg-white rounded-2xl p-4">
              <Text className="text-base font-bold text-gray-800 mb-3">출석 기록</Text>
              {attendanceRecords.map((record) => {
                const statusInfo = getAttendanceStatusColor(record.status);
                return (
                  <View key={record.id} className="flex-row items-center py-3 border-b border-gray-100">
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-gray-800 mb-1">{record.date}</Text>
                      {record.note ? (
                        <Text className="text-xs text-gray-500">{record.note}</Text>
                      ) : null}
                    </View>
                    <View
                      className="px-3 py-1 rounded-full"
                      style={{ backgroundColor: statusInfo.bg }}
                    >
                      <Text className="text-xs font-bold" style={{ color: statusInfo.text }}>
                        {statusInfo.label}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        );

      case '수강료':
        return (
          <View className="p-5">
            {/* 수강권 정보 */}
            <View className="bg-white rounded-2xl p-4 mb-4">
              <Text className="text-base font-bold text-gray-800 mb-3">현재 수강권</Text>
              <View className="rounded-xl p-4" style={{ backgroundColor: TEACHER_COLORS.purple[50] }}>
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center">
                    <Ionicons
                      name={student?.ticketType === 'period' ? 'calendar' : 'ticket'}
                      size={20}
                      color={TEACHER_COLORS.primary[600]}
                    />
                    <Text className="text-sm font-semibold text-gray-700 ml-2">
                      {student?.ticketType === 'period' ? '기간정액권' : '회차권'}
                    </Text>
                  </View>
                  {student?.ticketType === 'count' && (
                    <View className="bg-white rounded-full px-3 py-1">
                      <Text className="text-xs font-bold" style={{ color: TEACHER_COLORS.purple[600] }}>
                        {student?.ticketCount}회 남음
                      </Text>
                    </View>
                  )}
                </View>
                {student?.ticketType === 'period' && (
                  <Text className="text-sm text-gray-600">
                    {student?.ticketPeriod?.start} ~ {student?.ticketPeriod?.end}
                  </Text>
                )}
              </View>
            </View>

            {/* 결제 내역 */}
            <View className="bg-white rounded-2xl p-4">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-base font-bold text-gray-800">결제 내역</Text>
                <TouchableOpacity
                  className="bg-primary rounded-xl px-4 py-2"
                  onPress={handleAddPayment}
                  activeOpacity={0.7}
                >
                  <Text className="text-white text-xs font-bold">+ 결제 등록</Text>
                </TouchableOpacity>
              </View>

              {paymentRecords.map((record) => {
                const statusInfo = getPaymentStatusColor(record.status);
                return (
                  <View
                    key={record.id}
                    className="py-3 border-b border-gray-100"
                  >
                    <View className="flex-row items-start justify-between mb-2">
                      <View className="flex-1">
                        <View className="flex-row items-center mb-1">
                          <Text className="text-sm font-semibold text-gray-800">
                            {record.type}
                          </Text>
                          <View
                            className="ml-2 px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: statusInfo.bg }}
                          >
                            <Text className="text-xs font-bold" style={{ color: statusInfo.text }}>
                              {statusInfo.label}
                            </Text>
                          </View>
                        </View>
                        <Text className="text-xs text-gray-500">{record.date}</Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-base font-bold text-gray-800">
                          {formatCurrency(record.amount)}
                        </Text>
                        <Text className="text-xs text-gray-500 mt-1">{record.method}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}

              {/* 총 결제 금액 */}
              <View className="mt-4 pt-4 border-t border-gray-200">
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm font-semibold text-gray-600">총 결제 금액</Text>
                  <Text className="text-lg font-bold text-primary">
                    {formatCurrency(paymentRecords.reduce((sum, record) => sum + record.amount, 0))}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* 헤더 */}
      <ScreenHeader
        title={student?.name || '학생 상세'}
        subtitle={`${student?.level || '초급'} · ${student?.schedule || '월/수 16:00'}`}
        rightButton={
          <View className="flex-row">
            <TouchableOpacity
              onPress={handleEdit}
              className="p-2 mr-1"
              activeOpacity={0.7}
            >
              <Ionicons name="create-outline" size={22} color={TEACHER_COLORS.primary.DEFAULT} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDelete}
              className="p-2"
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={22} color={TEACHER_COLORS.red[500]} />
            </TouchableOpacity>
          </View>
        }
      />

      {/* 탭 메뉴 */}
      <View className="bg-white border-b border-gray-200">
        <View className="flex-row">
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              className={`flex-1 py-4 items-center ${
                activeTab === tab ? 'border-b-2 border-primary' : ''
              }`}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
            >
              <Text
                className={`text-sm font-bold ${
                  activeTab === tab ? 'text-primary' : 'text-gray-500'
                }`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 탭 컨텐츠 */}
      <ScrollView className="flex-1">
        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
  );
}
