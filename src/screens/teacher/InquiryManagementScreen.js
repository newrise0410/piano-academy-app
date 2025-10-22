// src/screens/teacher/InquiryManagementScreen.js
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card, ScreenHeader } from '../../components/common';
import { useAuthStore } from '../../store';
import TEACHER_COLORS from '../../styles/teacher_colors';
import { getInquiriesByTeacher, answerInquiry } from '../../services/firestoreService';
import { improveInquiryAnswer } from '../../services/geminiService';

export default function InquiryManagementScreen() {
  const { user } = useAuthStore();
  const [inquiries, setInquiries] = useState([]);
  const [filteredInquiries, setFilteredInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [improvingAI, setImprovingAI] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'answered'

  useEffect(() => {
    loadInquiries();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [filter, inquiries]);

  const loadInquiries = async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      const result = await getInquiriesByTeacher(user.uid);
      if (result.success) {
        setInquiries(result.data);
      }
    } catch (error) {
      console.error('문의 로드 실패:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilter = () => {
    if (filter === 'all') {
      setFilteredInquiries(inquiries);
    } else if (filter === 'pending') {
      setFilteredInquiries(inquiries.filter(i => i.status === 'pending'));
    } else if (filter === 'answered') {
      setFilteredInquiries(inquiries.filter(i => i.status === 'answered'));
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadInquiries();
  };

  const handleInquiryPress = (inquiry) => {
    setSelectedInquiry(inquiry);
    setAnswer(inquiry.answer || '');
    setShowAnswerModal(true);
  };

  const handleAnswerSubmit = async () => {
    if (!answer.trim()) {
      Alert.alert('알림', '답변을 입력해주세요');
      return;
    }

    setSubmitting(true);
    try {
      const result = await answerInquiry(selectedInquiry.id, answer.trim());

      if (result.success) {
        Alert.alert('완료', '답변이 등록되었습니다');
        setAnswer('');
        setShowAnswerModal(false);
        loadInquiries();
      } else {
        Alert.alert('오류', '답변 등록에 실패했습니다');
      }
    } catch (error) {
      console.error('답변 제출 실패:', error);
      Alert.alert('오류', '답변 등록에 실패했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  const handleImproveWithAI = async () => {
    if (!answer.trim()) {
      Alert.alert('알림', '답변을 먼저 작성해주세요');
      return;
    }

    setImprovingAI(true);
    try {
      const result = await improveInquiryAnswer(answer, selectedInquiry.content);

      if (result.success) {
        setAnswer(result.content);
        Alert.alert('완료', 'AI가 답변을 개선했습니다');
      } else {
        Alert.alert('오류', 'AI 개선에 실패했습니다');
      }
    } catch (error) {
      console.error('AI 개선 실패:', error);
      Alert.alert('오류', 'AI 개선에 실패했습니다');
    } finally {
      setImprovingAI(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const pendingCount = inquiries.filter(i => i.status === 'pending').length;
  const answeredCount = inquiries.filter(i => i.status === 'answered').length;

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScreenHeader title="문의 관리" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={TEACHER_COLORS.primary.DEFAULT} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScreenHeader title="문의 관리" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="px-5 py-4">
          {/* 통계 카드 */}
          <Card className="mb-4">
            <Text className="text-lg font-bold text-gray-800 mb-4">문의 현황</Text>
            <View className="flex-row -mx-1">
              <View className="flex-1 mx-1">
                <View className="rounded-2xl p-4" style={{ backgroundColor: TEACHER_COLORS.blue[50] }}>
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-sm text-gray-600">전체</Text>
                    <Ionicons name="chatbubbles" size={20} color={TEACHER_COLORS.blue[500]} />
                  </View>
                  <Text className="text-2xl font-bold text-gray-800">{inquiries.length}</Text>
                </View>
              </View>
              <View className="flex-1 mx-1">
                <View className="rounded-2xl p-4" style={{ backgroundColor: TEACHER_COLORS.orange[50] }}>
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-sm text-gray-600">대기중</Text>
                    <Ionicons name="time" size={20} color={TEACHER_COLORS.orange[500]} />
                  </View>
                  <Text className="text-2xl font-bold text-gray-800">{pendingCount}</Text>
                </View>
              </View>
              <View className="flex-1 mx-1">
                <View className="rounded-2xl p-4" style={{ backgroundColor: TEACHER_COLORS.green[50] }}>
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-sm text-gray-600">완료</Text>
                    <Ionicons name="checkmark-circle" size={20} color={TEACHER_COLORS.green[500]} />
                  </View>
                  <Text className="text-2xl font-bold text-gray-800">{answeredCount}</Text>
                </View>
              </View>
            </View>
          </Card>

          {/* 필터 */}
          <Card className="mb-4">
            <View className="flex-row">
              <TouchableOpacity
                onPress={() => setFilter('all')}
                className={`flex-1 py-3 rounded-xl mr-2 items-center ${filter === 'all' ? '' : ''}`}
                style={{
                  backgroundColor: filter === 'all' ? TEACHER_COLORS.primary.DEFAULT : TEACHER_COLORS.gray[100]
                }}
              >
                <Text className={`font-bold ${filter === 'all' ? 'text-white' : 'text-gray-600'}`}>
                  전체 ({inquiries.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFilter('pending')}
                className={`flex-1 py-3 rounded-xl mr-2 items-center`}
                style={{
                  backgroundColor: filter === 'pending' ? TEACHER_COLORS.orange[500] : TEACHER_COLORS.gray[100]
                }}
              >
                <Text className={`font-bold ${filter === 'pending' ? 'text-white' : 'text-gray-600'}`}>
                  대기 ({pendingCount})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFilter('answered')}
                className={`flex-1 py-3 rounded-xl items-center`}
                style={{
                  backgroundColor: filter === 'answered' ? TEACHER_COLORS.green[500] : TEACHER_COLORS.gray[100]
                }}
              >
                <Text className={`font-bold ${filter === 'answered' ? 'text-white' : 'text-gray-600'}`}>
                  완료 ({answeredCount})
                </Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* 문의 리스트 */}
          {filteredInquiries.length === 0 ? (
            <Card className="py-16 items-center">
              <Ionicons name="chatbubbles-outline" size={64} color={TEACHER_COLORS.gray[300]} />
              <Text className="text-gray-400 mt-4">
                {filter === 'pending' ? '대기중인 문의가 없습니다' :
                 filter === 'answered' ? '답변 완료된 문의가 없습니다' :
                 '문의가 없습니다'}
              </Text>
            </Card>
          ) : (
            filteredInquiries.map((inquiry, index) => {
              const statusConfig = inquiry.status === 'answered'
                ? { icon: 'checkmark-circle', color: TEACHER_COLORS.green[600], bg: TEACHER_COLORS.green[50], label: '답변완료' }
                : { icon: 'time', color: TEACHER_COLORS.orange[500], bg: TEACHER_COLORS.orange[50], label: '대기중' };

              return (
                <Card key={inquiry.id} className={index !== filteredInquiries.length - 1 ? 'mb-3' : 'mb-5'}>
                  <TouchableOpacity
                    onPress={() => handleInquiryPress(inquiry)}
                    activeOpacity={0.7}
                  >
                    {/* 상태 배지 */}
                    <View className="flex-row items-center justify-between mb-3">
                      <View
                        className="px-3 py-1 rounded-full flex-row items-center"
                        style={{ backgroundColor: statusConfig.bg }}
                      >
                        <Ionicons name={statusConfig.icon} size={16} color={statusConfig.color} />
                        <Text className="text-xs font-bold ml-1" style={{ color: statusConfig.color }}>
                          {statusConfig.label}
                        </Text>
                      </View>
                      <Text className="text-xs text-gray-400">
                        {formatDate(inquiry.createdAt)}
                      </Text>
                    </View>

                    {/* 제목 */}
                    <Text className="text-gray-800 font-bold text-base mb-2">
                      {inquiry.title}
                    </Text>

                    {/* 내용 미리보기 */}
                    <Text className="text-gray-600 text-sm mb-3" numberOfLines={2}>
                      {inquiry.content}
                    </Text>

                    {/* 학부모 정보 */}
                    <View className="flex-row items-center pt-3 border-t" style={{ borderColor: TEACHER_COLORS.gray[100] }}>
                      <Ionicons name="person" size={16} color={TEACHER_COLORS.gray[400]} />
                      <Text className="text-sm text-gray-500 ml-2">
                        {inquiry.parentName}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </Card>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* 답변 모달 */}
      <Modal
        visible={showAnswerModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAnswerModal(false)}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="bg-white rounded-t-3xl" style={{ maxHeight: '90%' }}>
            {/* 헤더 */}
            <View className="flex-row items-center justify-between p-5 border-b border-gray-100">
              <Text className="text-xl font-bold text-gray-900">문의 답변</Text>
              <TouchableOpacity onPress={() => setShowAnswerModal(false)}>
                <Ionicons name="close" size={28} color={TEACHER_COLORS.gray[600]} />
              </TouchableOpacity>
            </View>

            {selectedInquiry && (
              <ScrollView className="p-5">
                {/* 상태 */}
                <View className="flex-row items-center justify-between mb-4">
                  <View
                    className="px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: selectedInquiry.status === 'answered'
                        ? TEACHER_COLORS.green[50]
                        : TEACHER_COLORS.orange[50]
                    }}
                  >
                    <Text
                      className="text-sm font-bold"
                      style={{
                        color: selectedInquiry.status === 'answered'
                          ? TEACHER_COLORS.green[600]
                          : TEACHER_COLORS.orange[500]
                      }}
                    >
                      {selectedInquiry.status === 'answered' ? '답변완료' : '대기중'}
                    </Text>
                  </View>
                  <Text className="text-sm text-gray-400">
                    {formatDate(selectedInquiry.createdAt)}
                  </Text>
                </View>

                {/* 학부모 정보 */}
                <View className="mb-4">
                  <Text className="text-gray-500 text-sm mb-1">문의자</Text>
                  <Text className="text-gray-800 font-bold text-base">
                    {selectedInquiry.parentName}
                  </Text>
                </View>

                {/* 제목 */}
                <View className="mb-4">
                  <Text className="text-gray-500 text-sm mb-1">제목</Text>
                  <Text className="text-gray-800 font-bold text-lg">
                    {selectedInquiry.title}
                  </Text>
                </View>

                {/* 문의 내용 */}
                <View className="mb-4">
                  <Text className="text-gray-500 text-sm mb-2">문의 내용</Text>
                  <View className="bg-gray-50 rounded-2xl p-4">
                    <Text className="text-base text-gray-700 leading-6">
                      {selectedInquiry.content}
                    </Text>
                  </View>
                </View>

                {/* 답변 입력 */}
                <View className="mb-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-gray-700 font-semibold">답변</Text>
                    <TouchableOpacity
                      onPress={handleImproveWithAI}
                      disabled={improvingAI || !answer.trim()}
                      className="flex-row items-center px-3 py-2 rounded-xl"
                      style={{
                        backgroundColor: improvingAI || !answer.trim()
                          ? TEACHER_COLORS.gray[200]
                          : TEACHER_COLORS.purple[50]
                      }}
                    >
                      {improvingAI ? (
                        <ActivityIndicator size="small" color={TEACHER_COLORS.purple[600]} />
                      ) : (
                        <Ionicons name="sparkles" size={16} color={TEACHER_COLORS.purple[600]} />
                      )}
                      <Text
                        className="text-sm font-bold ml-1"
                        style={{
                          color: improvingAI || !answer.trim()
                            ? TEACHER_COLORS.gray[400]
                            : TEACHER_COLORS.purple[600]
                        }}
                      >
                        AI 개선
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    className="bg-gray-50 rounded-2xl p-4 text-base"
                    placeholder="답변을 입력하세요"
                    value={answer}
                    onChangeText={setAnswer}
                    multiline
                    numberOfLines={8}
                    textAlignVertical="top"
                    style={{
                      borderWidth: 1,
                      borderColor: TEACHER_COLORS.gray[200],
                      minHeight: 200
                    }}
                  />
                </View>

                {/* 안내 */}
                <View className="rounded-xl p-4 mb-4" style={{ backgroundColor: TEACHER_COLORS.blue[50] }}>
                  <View className="flex-row items-start">
                    <Ionicons name="information-circle" size={20} color={TEACHER_COLORS.blue[600]} />
                    <Text className="text-sm ml-2 flex-1" style={{ color: TEACHER_COLORS.blue[700] }}>
                      AI 개선 버튼을 누르면 작성하신 답변을{'\n'}
                      더 정중하고 친절한 표현으로 개선해드립니다.
                    </Text>
                  </View>
                </View>

                {/* 버튼 */}
                <TouchableOpacity
                  onPress={handleAnswerSubmit}
                  disabled={submitting}
                  activeOpacity={0.8}
                  className="rounded-2xl py-4 items-center mb-4"
                  style={{
                    backgroundColor: submitting
                      ? TEACHER_COLORS.gray[300]
                      : TEACHER_COLORS.primary.DEFAULT,
                  }}
                >
                  {submitting ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-bold text-lg">답변 등록</Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
