// src/screens/teacher/NoticeDetailScreen.js
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Text from '../../components/common/Text';
import CommentSection from '../../components/common/CommentSection';
import { deleteNotice as deleteNoticeFromFirestore } from '../../services/firestoreService';
import { useStudentStore, useToastStore } from '../../store';
import TEACHER_COLORS from '../../styles/teacher_colors';

export default function NoticeDetailScreen({ route, navigation }) {
  const { notice } = route.params;
  const { students, fetchStudents } = useStudentStore();
  const toast = useToastStore();
  const [unreadStudents, setUnreadStudents] = useState([]);

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (students.length > 0 && notice) {
      calculateUnreadStudents();
    }
  }, [students, notice]);

  const loadStudents = async () => {
    try {
      await fetchStudents();
    } catch (error) {
      console.error('학생 정보 로드 실패:', error);
    }
  };

  const calculateUnreadStudents = () => {
    const recipients = notice.recipients || [];
    const readBy = notice.readBy || [];

    // Get list of student IDs who have read
    const readStudentIds = readBy.map(item => item.studentId);

    // Filter recipients who haven't read
    const unreadIds = recipients.filter(id => !readStudentIds.includes(id));

    // Get student details for unread recipients
    const unreadStudentDetails = unreadIds
      .map(id => students.find(s => s.id === id))
      .filter(Boolean); // Remove any undefined values

    setUnreadStudents(unreadStudentDetails);
  };

  const handleDelete = async () => {
    Alert.alert(
      '알림장 삭제',
      '이 알림장을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNoticeFromFirestore(notice.id);
              toast.success('알림장이 삭제되었습니다.');
              navigation.goBack();
            } catch (error) {
              console.error('알림장 삭제 오류:', error);
              toast.error('삭제에 실패했습니다.');
            }
          }
        }
      ]
    );
  };

  const handleEdit = () => {
    Alert.alert('알림', '수정 기능은 준비 중입니다.');
  };

  const handleResend = () => {
    Alert.alert('알림', '재발송 되었습니다.');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* 헤더 */}
      <View className="bg-primary px-5 py-4">
        <View className="flex-row justify-between items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-bold">알림장 상세</Text>
          <View className="flex-row">
            <TouchableOpacity onPress={handleEdit} className="mr-4">
              <Ionicons name="create-outline" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete}>
              <Ionicons name="trash-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-5 py-4">
        {/* 발송 정보 카드 */}
        <View className="bg-white rounded-2xl p-5 mb-4 border border-gray-200">
          <View className="flex-row items-center mb-3">
            <Ionicons name="paper-plane" size={20} color={TEACHER_COLORS.primary.DEFAULT} />
            <Text className="text-base font-bold text-gray-800 ml-2">발송 정보</Text>
          </View>

          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-gray-600">발송일시</Text>
            <Text className="text-sm font-semibold text-gray-800">
              {notice.date} {notice.time}
            </Text>
          </View>

          <View className="flex-row justify-between">
            <Text className="text-sm text-gray-600">확인 현황</Text>
            <Text className="text-sm font-semibold text-primary">
              {notice.confirmed}/{notice.total}명 확인
            </Text>
          </View>
        </View>

        {/* 알림장 내용 카드 */}
        <View className="bg-white rounded-2xl p-5 mb-4 border border-gray-200">
          {/* 제목 */}
          <Text className="text-xl font-bold text-gray-800 mb-4">
            {notice.title}
          </Text>

          {/* 내용 */}
          <View className="bg-gray-50 rounded-xl p-4 mb-4">
            <Text className="text-base text-gray-700 leading-6">
              {notice.content}
            </Text>
          </View>

          {/* 첨부된 미디어 */}
          {notice.media && notice.media.length > 0 && (
            <View>
              <View className="flex-row items-center mb-3">
                <Ionicons name="images" size={18} color={TEACHER_COLORS.primary.DEFAULT} />
                <Text className="text-sm font-bold text-gray-800 ml-2">
                  첨부 파일 ({notice.media.length})
                </Text>
              </View>
              <View className="flex-row flex-wrap -mx-1">
                {notice.media.map((media, index) => (
                  <View
                    key={index}
                    className="w-1/3 px-1 mb-2"
                  >
                    <View style={{ aspectRatio: 1 }}>
                      <Image
                        source={{ uri: media.url }}
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: 8,
                          backgroundColor: TEACHER_COLORS.gray[200],
                        }}
                        resizeMode="cover"
                      />
                      {media.type === 'video' && (
                        <View
                          className="absolute inset-0 items-center justify-center"
                          style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
                        >
                          <Ionicons name="play-circle" size={32} color="white" />
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* 미확인 학부모 */}
        {unreadStudents.length > 0 && (
          <View className="rounded-2xl p-4 mb-4 border" style={{ backgroundColor: TEACHER_COLORS.orange[50], borderColor: TEACHER_COLORS.orange[200] }}>
            <View className="flex-row items-center mb-3">
              <Ionicons name="alert-circle" size={20} color={TEACHER_COLORS.orange[500]} />
              <Text className="font-bold ml-2" style={{ color: TEACHER_COLORS.orange[600] }}>
                미확인 학부모 ({unreadStudents.length}명)
              </Text>
            </View>

            {unreadStudents.map((student, index) => (
              <View
                key={student.id}
                className="bg-white rounded-xl p-3"
                style={{ marginBottom: index < unreadStudents.length - 1 ? 8 : 0 }}
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-gray-700">
                    {student.name} {student.parentName ? `(${student.parentName})` : '학부모님'}
                  </Text>
                  {student.parentPhone && (
                    <Text className="text-xs text-gray-500">{student.parentPhone}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 댓글 섹션 */}
        <View className="bg-white rounded-2xl p-5 mb-4 border border-gray-200">
          <CommentSection
            noticeId={notice.id}
            userType="teacher"
          />
        </View>

        {/* 액션 버튼들 */}
        <View className="mb-6">
          <TouchableOpacity
            className="bg-primary rounded-2xl p-4 flex-row items-center justify-center mb-3"
            activeOpacity={0.8}
            onPress={handleResend}
          >
            <Ionicons name="refresh" size={20} color="white" />
            <Text className="text-white text-base font-bold ml-2">미확인자에게 재발송</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white border border-gray-300 rounded-2xl p-4 flex-row items-center justify-center"
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
          >
            <Text className="text-gray-700 text-base font-semibold">목록으로 돌아가기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
