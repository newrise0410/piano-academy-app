// src/screens/parent/InquiryScreen.js
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../../components/common';
import { useAuthStore, useToastStore } from '../../store';
import PARENT_COLORS from '../../styles/parent_colors';
import { getInquiriesByParent, createInquiry } from '../../services/firestoreService';

export default function InquiryScreen() {
  const { user } = useAuthStore();
  const toast = useToastStore();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadInquiries();
  }, []);

  const loadInquiries = async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      const result = await getInquiriesByParent(user.uid);
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

  const onRefresh = () => {
    setRefreshing(true);
    loadInquiries();
  };

  const handleCreateInquiry = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('제목과 내용을 모두 입력해주세요');
      return;
    }

    setSubmitting(true);
    try {
      const result = await createInquiry({
        parentId: user.uid,
        parentName: user.displayName || user.name,
        studentId: user.studentId,
        title: title.trim(),
        content: content.trim(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      });

      if (result.success) {
        toast.success('문의가 등록되었습니다');
        setTitle('');
        setContent('');
        setShowCreateModal(false);
        loadInquiries();
      } else {
        toast.error('문의 등록에 실패했습니다');
      }
    } catch (error) {
      console.error('문의 생성 실패:', error);
      toast.error('문의 등록에 실패했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInquiryPress = (inquiry) => {
    setSelectedInquiry(inquiry);
    setShowDetailModal(true);
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
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color={PARENT_COLORS.primary.DEFAULT} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <SafeAreaView className="flex-1">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* 그라디언트 헤더 */}
          <LinearGradient
            colors={['#3B82F6', '#1D4ED8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingTop: 50, paddingBottom: 80 }}
          >
            <View className="px-5">
              <Text className="text-white text-3xl font-bold mb-2">문의하기</Text>
              <View className="flex-row items-center">
                <Text className="text-white/80 text-sm">선생님에게 문의하기</Text>
                <View className="bg-white/20 rounded-full px-3 py-1 ml-3">
                  <Text className="text-white font-bold text-sm">{inquiries.length}건</Text>
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* 플로팅 통계 카드 */}
          <View className="px-5" style={{ marginTop: -60 }}>
            <View
              className="bg-white rounded-3xl p-5 mb-4"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <View className="flex-row justify-around">
                <View className="items-center">
                  <View className="bg-blue-100 rounded-full p-3 mb-2">
                    <Ionicons name="chatbubbles" size={24} color={PARENT_COLORS.blue[600]} />
                  </View>
                  <Text className="text-gray-500 text-xs mb-1">전체</Text>
                  <Text className="text-gray-800 font-bold text-xl">{inquiries.length}개</Text>
                </View>

                <View className="items-center">
                  <View className="bg-orange-100 rounded-full p-3 mb-2">
                    <Ionicons name="time" size={24} color={PARENT_COLORS.warning.DEFAULT} />
                  </View>
                  <Text className="text-gray-500 text-xs mb-1">대기중</Text>
                  <Text className="text-gray-800 font-bold text-xl">{pendingCount}개</Text>
                </View>

                <View className="items-center">
                  <View className="bg-green-100 rounded-full p-3 mb-2">
                    <Ionicons name="checkmark-circle" size={24} color={PARENT_COLORS.success[600]} />
                  </View>
                  <Text className="text-gray-500 text-xs mb-1">답변완료</Text>
                  <Text className="text-gray-800 font-bold text-xl">{answeredCount}개</Text>
                </View>
              </View>
            </View>

            {/* 새 문의 작성 버튼 */}
            <TouchableOpacity
              onPress={() => setShowCreateModal(true)}
              activeOpacity={0.8}
              className="rounded-3xl p-5 mb-4 flex-row items-center justify-center"
              style={{
                backgroundColor: PARENT_COLORS.blue[500],
                shadowColor: PARENT_COLORS.blue[500],
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Ionicons name="add-circle" size={24} color="white" />
              <Text className="text-white font-bold text-lg ml-2">새 문의 작성</Text>
            </TouchableOpacity>

            {/* 문의 리스트 */}
            {inquiries.length === 0 ? (
              <View
                className="bg-white rounded-3xl p-8 mb-6 items-center"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <View className="bg-gray-100 rounded-full p-6 mb-4">
                  <Ionicons name="chatbubbles-outline" size={48} color={PARENT_COLORS.gray[400]} />
                </View>
                <Text className="text-gray-800 font-bold text-lg mb-2">문의 내역이 없습니다</Text>
                <Text className="text-gray-500 text-sm text-center">
                  궁금한 점이 있으시면{'\n'}언제든지 문의해주세요
                </Text>
              </View>
            ) : (
              <View
                className="bg-white rounded-3xl p-5 mb-6"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <Text className="text-gray-800 font-bold text-lg mb-4">문의 내역</Text>

                {inquiries.map((inquiry, index) => {
                  const statusConfig = inquiry.status === 'answered'
                    ? { icon: 'checkmark-circle', color: PARENT_COLORS.success[600], bg: PARENT_COLORS.success[50], label: '답변완료' }
                    : { icon: 'time', color: PARENT_COLORS.warning.DEFAULT, bg: PARENT_COLORS.warning.DEFAULT + '20', label: '대기중' };

                  return (
                    <TouchableOpacity
                      key={inquiry.id}
                      className={`${index !== inquiries.length - 1 ? 'mb-4 pb-4 border-b' : ''}`}
                      style={{ borderColor: PARENT_COLORS.gray[100] }}
                      onPress={() => handleInquiryPress(inquiry)}
                      activeOpacity={0.7}
                    >
                      <View className="flex-row items-start">
                        <View
                          className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
                          style={{ backgroundColor: statusConfig.bg }}
                        >
                          <Ionicons name={statusConfig.icon} size={24} color={statusConfig.color} />
                        </View>
                        <View className="flex-1">
                          <View className="flex-row items-center mb-1">
                            <Text className="font-bold text-base text-gray-900 flex-1" numberOfLines={1}>
                              {inquiry.title}
                            </Text>
                            <View
                              className="px-2 py-1 rounded-full ml-2"
                              style={{ backgroundColor: statusConfig.bg }}
                            >
                              <Text className="text-xs font-bold" style={{ color: statusConfig.color }}>
                                {statusConfig.label}
                              </Text>
                            </View>
                          </View>
                          <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
                            {inquiry.content}
                          </Text>
                          <Text className="text-xs text-gray-400">
                            {formatDate(inquiry.createdAt)}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={PARENT_COLORS.gray[400]} />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* 새 문의 작성 모달 */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="bg-white rounded-t-3xl" style={{ maxHeight: '90%' }}>
            {/* 헤더 */}
            <View className="flex-row items-center justify-between p-5 border-b border-gray-100">
              <Text className="text-xl font-bold text-gray-900">새 문의 작성</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={28} color={PARENT_COLORS.gray[600]} />
              </TouchableOpacity>
            </View>

            <ScrollView className="p-5">
              {/* 제목 */}
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2">제목</Text>
                <TextInput
                  className="bg-gray-50 rounded-2xl p-4 text-base"
                  placeholder="문의 제목을 입력하세요"
                  value={title}
                  onChangeText={setTitle}
                  style={{ borderWidth: 1, borderColor: PARENT_COLORS.gray[200] }}
                />
              </View>

              {/* 내용 */}
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2">내용</Text>
                <TextInput
                  className="bg-gray-50 rounded-2xl p-4 text-base"
                  placeholder="문의 내용을 입력하세요"
                  value={content}
                  onChangeText={setContent}
                  multiline
                  numberOfLines={8}
                  textAlignVertical="top"
                  style={{ borderWidth: 1, borderColor: PARENT_COLORS.gray[200], minHeight: 200 }}
                />
              </View>

              {/* 안내 */}
              <View className="rounded-xl p-4 mb-4" style={{ backgroundColor: PARENT_COLORS.blue[50] }}>
                <View className="flex-row items-start">
                  <Ionicons name="information-circle" size={20} color={PARENT_COLORS.blue[600]} />
                  <Text className="text-sm ml-2 flex-1" style={{ color: PARENT_COLORS.blue[700] }}>
                    선생님이 확인 후 답변을 남겨드립니다.{'\n'}
                    급한 경우 전화로 연락해주세요.
                  </Text>
                </View>
              </View>

              {/* 버튼 */}
              <TouchableOpacity
                onPress={handleCreateInquiry}
                disabled={submitting}
                activeOpacity={0.8}
                className="rounded-2xl py-4 items-center mb-4"
                style={{
                  backgroundColor: submitting ? PARENT_COLORS.gray[300] : PARENT_COLORS.blue[500],
                }}
              >
                {submitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-lg">문의 등록</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 문의 상세 모달 */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="bg-white rounded-t-3xl" style={{ maxHeight: '90%' }}>
            {/* 헤더 */}
            <View className="flex-row items-center justify-between p-5 border-b border-gray-100">
              <Text className="text-xl font-bold text-gray-900">문의 내용</Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Ionicons name="close" size={28} color={PARENT_COLORS.gray[600]} />
              </TouchableOpacity>
            </View>

            {selectedInquiry && (
              <ScrollView className="p-5">
                {/* 상태 */}
                <View className="flex-row items-center mb-4">
                  <View
                    className="px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: selectedInquiry.status === 'answered'
                        ? PARENT_COLORS.success[50]
                        : PARENT_COLORS.warning.DEFAULT + '20'
                    }}
                  >
                    <Text
                      className="text-sm font-bold"
                      style={{
                        color: selectedInquiry.status === 'answered'
                          ? PARENT_COLORS.success[600]
                          : PARENT_COLORS.warning.DEFAULT
                      }}
                    >
                      {selectedInquiry.status === 'answered' ? '답변완료' : '대기중'}
                    </Text>
                  </View>
                  <Text className="text-sm text-gray-400 ml-3">
                    {formatDate(selectedInquiry.createdAt)}
                  </Text>
                </View>

                {/* 제목 */}
                <Text className="text-2xl font-bold text-gray-900 mb-4">
                  {selectedInquiry.title}
                </Text>

                {/* 내용 */}
                <View className="bg-gray-50 rounded-2xl p-4 mb-4">
                  <Text className="text-base text-gray-700 leading-6">
                    {selectedInquiry.content}
                  </Text>
                </View>

                {/* 답변 */}
                {selectedInquiry.answer && (
                  <View>
                    <View className="flex-row items-center mb-3">
                      <Ionicons name="chatbubble-ellipses" size={20} color={PARENT_COLORS.blue[600]} />
                      <Text className="text-lg font-bold text-gray-900 ml-2">선생님 답변</Text>
                    </View>
                    <View
                      className="rounded-2xl p-4 mb-4"
                      style={{ backgroundColor: PARENT_COLORS.blue[50] }}
                    >
                      <Text className="text-base leading-6" style={{ color: PARENT_COLORS.blue[900] }}>
                        {selectedInquiry.answer}
                      </Text>
                      {selectedInquiry.answeredAt && (
                        <Text className="text-xs text-gray-400 mt-2">
                          {formatDate(selectedInquiry.answeredAt)}
                        </Text>
                      )}
                    </View>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
