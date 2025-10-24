import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  Text,
  FormInput,
  Button,
  StatusBadge,
  AttendanceStatusBadge,
  PaymentStatusBadge,
  SectionCard,
  ScreenHeader,
  SegmentedControl
} from '../../components/common';
import TEACHER_COLORS, { TEACHER_SHADOW_COLORS, TEACHER_OVERLAY_COLORS } from '../../styles/teacher_colors';
import { SPACING, TYPOGRAPHY, RADIUS, SHADOWS, CARD_STYLES } from '../../styles/commonStyles';
import { useStudentStore, usePaymentStore, useAttendanceStore, useLessonNoteStore } from '../../store';
import { useToastStore } from '../../store';
import { formatDate, formatCurrency } from '../../utils';
import LessonNoteCard from '../../components/common/LessonNoteCard';
import LessonNoteModal from '../../components/teacher/LessonNoteModal';
import ProgressManageModal from '../../components/teacher/ProgressManageModal';
import ProgressEditModal from '../../components/teacher/ProgressEditModal';
import { getStudentProgress, calculateProgressStats, getMonthlyProgressData } from '../../services/progressService';
import { ProgressRepository } from '../../repositories/ProgressRepository';
import { getLearningStepById } from '../../constants/learningSteps';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

export default function StudentDetailScreen({ route, navigation }) {
  const { studentId } = route?.params || {};

  // Zustand Store
  const { students, deleteStudent, loading: studentLoading } = useStudentStore();
  const { payments, fetchAllPayments } = usePaymentStore();
  const { records, fetchAllRecords } = useAttendanceStore();
  const { studentNotes, fetchStudentNotes, deleteLessonNote } = useLessonNoteStore();
  const toast = useToastStore();

  const [activeTab, setActiveTab] = useState('정보');
  const [loading, setLoading] = useState(true);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showLessonNoteModal, setShowLessonNoteModal] = useState(false);
  const [selectedLessonNote, setSelectedLessonNote] = useState(null);
  const [ticketFormData, setTicketFormData] = useState({
    ticketType: 'count',
    ticketCount: 8,
    ticketPeriodStart: '',
    ticketPeriodEnd: '',
  });

  // 진도 관리 state
  const [progressList, setProgressList] = useState([]);
  const [progressLoading, setProgressLoading] = useState(false);
  const [expandedBooks, setExpandedBooks] = useState({}); // 교재별 펼침 상태
  const [showProgressManageModal, setShowProgressManageModal] = useState(false);
  const [showProgressEditModal, setShowProgressEditModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null); // 곡 추가 시 선택된 교재

  // 학생 정보 가져오기
  const student = useMemo(() => {
    return students.find(s => s.id === studentId);
  }, [students, studentId]);

  // 학생의 출석 기록 가져오기
  const attendanceRecords = useMemo(() => {
    return records
      .filter(r => r.studentId === studentId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [records, studentId]);

  // 학생의 결제 기록 가져오기
  const paymentRecords = useMemo(() => {
    return payments
      .filter(p => p.studentId === studentId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [payments, studentId]);

  // 학생의 수업 일지 가져오기 (정보 탭용 - 최근 5개)
  const recentLessonNotes = useMemo(() => {
    const notes = studentNotes[studentId] || [];
    return notes
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5); // 최근 5개만
  }, [studentNotes, studentId]);

  // 전체 수업 일지 (일지 탭용)
  const allLessonNotes = useMemo(() => {
    const notes = studentNotes[studentId] || [];
    return notes
      .sort((a, b) => new Date(b.date) - new Date(a.date)); // 전체 목록
  }, [studentNotes, studentId]);

  // 출석 통계 계산
  const attendanceStats = useMemo(() => {
    const now = new Date();
    const thisMonth = attendanceRecords.filter(r => {
      const recordDate = new Date(r.date);
      return recordDate.getMonth() === now.getMonth() &&
             recordDate.getFullYear() === now.getFullYear();
    });

    const present = thisMonth.filter(r => r.status === 'present').length;
    const absent = thisMonth.filter(r => r.status === 'absent').length;
    const late = thisMonth.filter(r => r.status === 'late').length;
    const total = thisMonth.length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

    return { present, absent, late, rate, total };
  }, [attendanceRecords]);

  useEffect(() => {
    loadData();
    loadProgress(); // 진도 데이터 로드
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      fetchAllPayments(),
      fetchAllRecords(),
      fetchStudentNotes(studentId),
    ]);
    setLoading(false);
  };

  // 진도 데이터 로드
  const loadProgress = async () => {
    if (!studentId) return;

    setProgressLoading(true);
    try {
      const data = await getStudentProgress(studentId);
      setProgressList(data);
      console.log('✅ 진도 데이터 로드 완료:', data);
    } catch (error) {
      console.error('진도 데이터 로드 실패:', error);
      toast.error('진도 데이터 로드에 실패했습니다.');
    } finally {
      setProgressLoading(false);
    }
  };

  // 교재 추가 모달 열기
  const handleOpenAddBookModal = () => {
    setSelectedBook(null);
    setShowProgressManageModal(true);
  };

  // 곡 추가 모달 열기
  const handleOpenAddSongModal = (progress) => {
    setSelectedBook(progress);
    setShowProgressManageModal(true);
  };

  // 진도 저장 완료 핸들러
  const handleProgressSaved = () => {
    setShowProgressManageModal(false);
    setSelectedBook(null);
    loadProgress(); // 진도 데이터 다시 로드
  };

  // 진도 수정 핸들러
  const handleEditProgress = (progress) => {
    setSelectedBook(progress);
    setShowProgressEditModal(true);
  };

  // 진도 삭제 핸들러
  const handleDeleteProgress = (progress) => {
    Alert.alert(
      '교재 삭제',
      `"${progress.book.name}" 교재를 삭제하시겠습니까?\n모든 진도 기록이 삭제됩니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await ProgressRepository.delete(progress.id);
              toast.success('교재가 삭제되었습니다');
              loadProgress(); // 진도 데이터 다시 로드
            } catch (error) {
              console.error('진도 삭제 오류:', error);
              toast.error('삭제에 실패했습니다');
            }
          },
        },
      ]
    );
  };

  const tabs = ['정보', '진도', '일지', '출석', '수강료'];

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

  // 출석 상태 배지 색상
  const getAttendanceStatusColor = (status) => {
    switch (status) {
      case 'present':
        return { bg: TEACHER_COLORS.success[50], text: TEACHER_COLORS.success[600], label: '출석' };
      case 'absent':
        return { bg: TEACHER_COLORS.danger[100], text: TEACHER_COLORS.danger[600], label: '결석' };
      case 'late':
        return { bg: TEACHER_COLORS.warning[50], text: TEACHER_COLORS.warning[600], label: '지각' };
      default:
        return { bg: TEACHER_COLORS.gray[100], text: TEACHER_COLORS.gray[600], label: '-' };
    }
  };

  // 결제 상태 배지 색상
  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return { bg: TEACHER_COLORS.success[50], text: TEACHER_COLORS.success[600], label: '완료' };
      case 'unpaid':
        return { bg: TEACHER_COLORS.danger[100], text: TEACHER_COLORS.danger[600], label: '미납' };
      case 'overdue':
        return { bg: TEACHER_COLORS.warning[50], text: TEACHER_COLORS.warning[600], label: '연체' };
      default:
        return { bg: TEACHER_COLORS.gray[100], text: TEACHER_COLORS.gray[600], label: '-' };
    }
  };

  // 새 결제 추가
  const handleAddPayment = () => {
    toast.info('결제 등록 기능은 수강료 탭에서 사용할 수 있습니다');
  };

  const handleRechargeTicket = () => {
    if (!student || student.ticketType !== 'count') return;

    Alert.alert(
      '회차권 충전',
      '충전할 횟수를 선택해주세요',
      [
        {
          text: '+4회',
          onPress: async () => {
            try {
              const { updateStudent } = useStudentStore.getState();
              const newCount = (student.ticketCount || 0) + 4;
              await updateStudent(student.id, { ticketCount: newCount });
              toast.success(`회차권 4회 충전 완료 (총 ${newCount}회)`);
            } catch (error) {
              toast.error('충전에 실패했습니다');
              console.error('회차권 충전 오류:', error);
            }
          }
        },
        {
          text: '+8회',
          onPress: async () => {
            try {
              const { updateStudent } = useStudentStore.getState();
              const newCount = (student.ticketCount || 0) + 8;
              await updateStudent(student.id, { ticketCount: newCount });
              toast.success(`회차권 8회 충전 완료 (총 ${newCount}회)`);
            } catch (error) {
              toast.error('충전에 실패했습니다');
              console.error('회차권 충전 오류:', error);
            }
          },
          style: 'default'
        },
        {
          text: '+12회',
          onPress: async () => {
            try {
              const { updateStudent } = useStudentStore.getState();
              const newCount = (student.ticketCount || 0) + 12;
              await updateStudent(student.id, { ticketCount: newCount });
              toast.success(`회차권 12회 충전 완료 (총 ${newCount}회)`);
            } catch (error) {
              toast.error('충전에 실패했습니다');
              console.error('회차권 충전 오류:', error);
            }
          }
        },
        {
          text: '취소',
          style: 'cancel'
        }
      ]
    );
  };

  const handleOpenTicketModal = () => {
    if (!student) return;

    setTicketFormData({
      ticketType: student.ticketType || 'count',
      ticketCount: student.ticketCount || 8,
      ticketPeriodStart: student.ticketPeriod?.start || '',
      ticketPeriodEnd: student.ticketPeriod?.end || '',
    });
    setShowTicketModal(true);
  };

  const handleSaveTicket = async () => {
    try {
      const { updateStudent } = useStudentStore.getState();

      const updateData = {
        ticketType: ticketFormData.ticketType,
      };

      if (ticketFormData.ticketType === 'count') {
        if (!ticketFormData.ticketCount || ticketFormData.ticketCount < 0) {
          toast.warning('회차권 횟수를 입력해주세요');
          return;
        }
        updateData.ticketCount = ticketFormData.ticketCount;
        updateData.ticketPeriod = null;
      } else {
        if (!ticketFormData.ticketPeriodStart || !ticketFormData.ticketPeriodEnd) {
          toast.warning('수강 기간을 입력해주세요');
          return;
        }
        updateData.ticketPeriod = {
          start: ticketFormData.ticketPeriodStart,
          end: ticketFormData.ticketPeriodEnd,
        };
      }

      await updateStudent(student.id, updateData);
      toast.success('수강권 정보가 변경되었습니다');
      setShowTicketModal(false);
    } catch (error) {
      toast.error('변경에 실패했습니다');
      console.error('수강권 변경 오류:', error);
    }
  };

  // 날짜 포맷 함수
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}.${month}.${day}`;
    } catch {
      return dateStr;
    }
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator size="large" color={TEACHER_COLORS.primary.DEFAULT} />
          <Text className="text-gray-500 mt-4">데이터를 불러오는 중...</Text>
        </View>
      );
    }

    switch (activeTab) {
      case '정보':
        return (
          <View className="p-5">
            {/* 학생 상태 요약 */}
            <View className="bg-white rounded-2xl p-4 mb-4">
              <Text className="text-base font-bold text-gray-800 mb-3">학생 현황</Text>

              <View className="flex-row justify-around">
                {/* 출석률 */}
                <TouchableOpacity
                  className="items-center"
                  onPress={() => setActiveTab('출석')}
                  activeOpacity={0.7}
                >
                  <View className="w-16 h-16 rounded-full items-center justify-center mb-2"
                    style={{ backgroundColor: TEACHER_COLORS.success[50] }}>
                    <Text className="text-2xl font-bold" style={{ color: TEACHER_COLORS.success[600] }}>
                      {attendanceStats.rate}%
                    </Text>
                  </View>
                  <Text className="text-xs text-gray-600">출석률</Text>
                  <Text className="text-xs text-gray-400">이번 달</Text>
                </TouchableOpacity>

                {/* 진행 중인 교재 */}
                <TouchableOpacity
                  className="items-center"
                  onPress={() => setActiveTab('진도')}
                  activeOpacity={0.7}
                >
                  <View className="w-16 h-16 rounded-full items-center justify-center mb-2"
                    style={{ backgroundColor: TEACHER_COLORS.primary[50] }}>
                    <Text className="text-2xl font-bold" style={{ color: TEACHER_COLORS.primary.DEFAULT }}>
                      {progressList.length}
                    </Text>
                  </View>
                  <Text className="text-xs text-gray-600">진행 교재</Text>
                  <Text className="text-xs text-gray-400">권</Text>
                </TouchableOpacity>

                {/* 수업일지 */}
                <TouchableOpacity
                  className="items-center"
                  onPress={() => setActiveTab('일지')}
                  activeOpacity={0.7}
                >
                  <View className="w-16 h-16 rounded-full items-center justify-center mb-2"
                    style={{ backgroundColor: TEACHER_COLORS.purple[50] }}>
                    <Text className="text-2xl font-bold" style={{ color: TEACHER_COLORS.purple[600] }}>
                      {allLessonNotes.length}
                    </Text>
                  </View>
                  <Text className="text-xs text-gray-600">수업일지</Text>
                  <Text className="text-xs text-gray-400">개</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 수강권 정보 */}
            {student?.ticketType && (
              <View className="bg-white rounded-2xl p-4 mb-4">
                <Text className="text-base font-bold text-gray-800 mb-3">수강권 정보</Text>

                {student.ticketType === 'count' ? (
                  <View>
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-sm text-gray-600">잔여 횟수</Text>
                      <Text className="text-lg font-bold" style={{
                        color: (student.ticketCount || 0) > 3
                          ? TEACHER_COLORS.success[600]
                          : TEACHER_COLORS.warning[600]
                      }}>
                        {student.ticketCount || 0}회
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={handleRechargeTicket}
                      className="flex-row items-center justify-center py-2 rounded-lg mt-2"
                      style={{ backgroundColor: TEACHER_COLORS.primary[50] }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="add-circle" size={18} color={TEACHER_COLORS.primary.DEFAULT} />
                      <Text className="text-sm font-semibold ml-1" style={{ color: TEACHER_COLORS.primary.DEFAULT }}>
                        회차권 충전
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View>
                    <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                      <Text className="text-sm text-gray-600">시작일</Text>
                      <Text className="text-sm font-semibold text-gray-800">
                        {student.ticketPeriodStart || '-'}
                      </Text>
                    </View>
                    <View className="flex-row justify-between items-center py-2">
                      <Text className="text-sm text-gray-600">종료일</Text>
                      <Text className="text-sm font-semibold text-gray-800">
                        {student.ticketPeriodEnd || '-'}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* 기본 정보 */}
            <View className="bg-white rounded-2xl p-4 mb-4">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-base font-bold text-gray-800">학생 정보</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('StudentForm', { student })}
                  activeOpacity={0.7}
                >
                  <Ionicons name="create-outline" size={20} color={TEACHER_COLORS.gray[500]} />
                </TouchableOpacity>
              </View>

              <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                <Text className="text-sm text-gray-600">이름</Text>
                <Text className="text-sm font-semibold text-gray-800">
                  {student?.name || '-'}
                </Text>
              </View>

              <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                <Text className="text-sm text-gray-600">생년월일</Text>
                <Text className="text-sm font-semibold text-gray-800">
                  {student?.birthDate || '-'}
                </Text>
              </View>

              {student?.school && (
                <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                  <Text className="text-sm text-gray-600">학교</Text>
                  <Text className="text-sm font-semibold text-gray-800">
                    {student.school} {student.grade ? `(${student.grade})` : ''}
                  </Text>
                </View>
              )}

              <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                <Text className="text-sm text-gray-600">등록일</Text>
                <Text className="text-sm font-semibold text-gray-800">
                  {formatDisplayDate(student?.createdAt) || '-'}
                </Text>
              </View>

              <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                <Text className="text-sm text-gray-600">레벨</Text>
                <View className="flex-row items-center">
                  <View
                    className="px-2 py-1 rounded"
                    style={{
                      backgroundColor:
                        student?.level === '초급'
                          ? TEACHER_COLORS.success[50]
                          : student?.level === '중급'
                          ? TEACHER_COLORS.blue[50]
                          : TEACHER_COLORS.purple[50],
                    }}
                  >
                    <Text
                      className="text-xs font-semibold"
                      style={{
                        color:
                          student?.level === '초급'
                            ? TEACHER_COLORS.success[600]
                            : student?.level === '중급'
                            ? TEACHER_COLORS.blue[600]
                            : TEACHER_COLORS.purple[600],
                      }}
                    >
                      {student?.level || '-'}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                <Text className="text-sm text-gray-600">학부모</Text>
                <Text className="text-sm font-semibold text-gray-800">
                  {student?.parentName || '-'}
                </Text>
              </View>

              <View className="flex-row justify-between items-center py-2">
                <Text className="text-sm text-gray-600">연락처</Text>
                <TouchableOpacity activeOpacity={0.7}>
                  <Text className="text-sm font-semibold" style={{ color: TEACHER_COLORS.primary.DEFAULT }}>
                    {student?.parentPhone || '-'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 특이사항/메모 */}
            <View className="bg-white rounded-2xl p-4 mb-4">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-base font-bold text-gray-800">학생 메모</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('StudentForm', { student })}
                  activeOpacity={0.7}
                >
                  <Ionicons name="create-outline" size={20} color={TEACHER_COLORS.gray[500]} />
                </TouchableOpacity>
              </View>

              {student?.memo ? (
                <Text className="text-sm text-gray-700 leading-5">
                  {student.memo}
                </Text>
              ) : (
                <TouchableOpacity
                  onPress={() => navigation.navigate('StudentForm', { student })}
                  activeOpacity={0.7}
                >
                  <Text className="text-sm text-gray-400 italic">
                    특이사항이나 메모를 작성하려면 탭하세요
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* 빠른 액션 */}
            <View className="bg-white rounded-2xl p-4 mb-4">
              <Text className="text-base font-bold text-gray-800 mb-3">빠른 작업</Text>

              <View className="flex-row flex-wrap gap-2">
                <TouchableOpacity
                  className="flex-1 flex-row items-center justify-center py-3 rounded-xl"
                  style={{ backgroundColor: TEACHER_COLORS.purple[50], minWidth: '45%' }}
                  onPress={() => {
                    setSelectedLessonNote(null);
                    setShowLessonNoteModal(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="create" size={18} color={TEACHER_COLORS.purple[600]} />
                  <Text className="text-sm font-semibold ml-2" style={{ color: TEACHER_COLORS.purple[600] }}>
                    수업일지
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 flex-row items-center justify-center py-3 rounded-xl"
                  style={{ backgroundColor: TEACHER_COLORS.primary[50], minWidth: '45%' }}
                  onPress={() => setActiveTab('진도')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="book" size={18} color={TEACHER_COLORS.primary.DEFAULT} />
                  <Text className="text-sm font-semibold ml-2" style={{ color: TEACHER_COLORS.primary.DEFAULT }}>
                    진도 관리
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 flex-row items-center justify-center py-3 rounded-xl"
                  style={{ backgroundColor: TEACHER_COLORS.success[50], minWidth: '45%' }}
                  onPress={() => setActiveTab('출석')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="checkmark-circle" size={18} color={TEACHER_COLORS.success[600]} />
                  <Text className="text-sm font-semibold ml-2" style={{ color: TEACHER_COLORS.success[600] }}>
                    출석 체크
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 flex-row items-center justify-center py-3 rounded-xl"
                  style={{ backgroundColor: TEACHER_COLORS.blue[50], minWidth: '45%' }}
                  onPress={() => setActiveTab('수강료')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="card" size={18} color={TEACHER_COLORS.blue[600]} />
                  <Text className="text-sm font-semibold ml-2" style={{ color: TEACHER_COLORS.blue[600] }}>
                    수강료
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );

      case '진도':
        const progressStats = calculateProgressStats(progressList);

        return (
          <View style={{ padding: SPACING.xl }}>
            {progressLoading ? (
              <View style={{ padding: SPACING['4xl'], alignItems: 'center' }}>
                <ActivityIndicator size="large" color={TEACHER_COLORS.primary.DEFAULT} />
                <Text style={{ marginTop: SPACING.md, fontSize: TYPOGRAPHY.fontSize.sm, color: TEACHER_COLORS.gray[500] }}>
                  진도 데이터 로딩 중...
                </Text>
              </View>
            ) : progressList.length === 0 ? (
              /* 진도 데이터가 없을 때 */
              <View
                style={{
                  ...CARD_STYLES.default,
                  padding: SPACING['4xl'],
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: TEACHER_COLORS.primary[50],
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: SPACING.lg,
                  }}
                >
                  <Ionicons name="book-outline" size={40} color={TEACHER_COLORS.primary.DEFAULT} />
                </View>
                <Text style={{ fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.gray[800], marginBottom: SPACING.sm }}>
                  아직 진도 기록이 없습니다
                </Text>
                <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: TEACHER_COLORS.gray[500], textAlign: 'center', lineHeight: 20 }}>
                  수업일지에 진도를 작성하면{'\n'}AI가 자동으로 진도를 분석해드립니다!
                </Text>
                <TouchableOpacity
                  onPress={() => setShowLessonNoteModal(true)}
                  style={{
                    marginTop: SPACING.xl,
                    paddingHorizontal: SPACING.xl,
                    paddingVertical: SPACING.md,
                    borderRadius: RADIUS.xl,
                    backgroundColor: TEACHER_COLORS.primary.DEFAULT,
                  }}
                >
                  <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: TEACHER_COLORS.white }}>
                    수업일지 작성하기
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* 전체 통계 */}
                <View
                  style={{
                    ...CARD_STYLES.default,
                    marginBottom: SPACING.lg,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.lg }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="stats-chart" size={22} color={TEACHER_COLORS.primary.DEFAULT} />
                      <Text style={{ marginLeft: SPACING.sm, fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.gray[800] }}>
                        전체 진행 상황
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={handleOpenAddBookModal}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: SPACING.md,
                        paddingVertical: SPACING.sm,
                        borderRadius: RADIUS.lg,
                        backgroundColor: TEACHER_COLORS.primary.DEFAULT,
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="add" size={18} color={TEACHER_COLORS.white} />
                      <Text style={{ marginLeft: SPACING.xs, fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: TEACHER_COLORS.white }}>
                        교재 추가
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ fontSize: TYPOGRAPHY.fontSize['2xl'], fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.primary.DEFAULT }}>
                        {progressStats.totalBooks}
                      </Text>
                      <Text style={{ marginTop: SPACING.xs, fontSize: TYPOGRAPHY.fontSize.xs, color: TEACHER_COLORS.gray[500] }}>
                        진행 중인 교재
                      </Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ fontSize: TYPOGRAPHY.fontSize['2xl'], fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.success[600] }}>
                        {progressStats.completedSongs}
                      </Text>
                      <Text style={{ marginTop: SPACING.xs, fontSize: TYPOGRAPHY.fontSize.xs, color: TEACHER_COLORS.gray[500] }}>
                        완료한 곡
                      </Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ fontSize: TYPOGRAPHY.fontSize['2xl'], fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.secondary.DEFAULT }}>
                        {progressStats.averageCompletionRate.toFixed(0)}%
                      </Text>
                      <Text style={{ marginTop: SPACING.xs, fontSize: TYPOGRAPHY.fontSize.xs, color: TEACHER_COLORS.gray[500] }}>
                        평균 진행률
                      </Text>
                    </View>
                  </View>
                </View>

                {/* 월별 진도 그래프 */}
                {(() => {
                  const chartData = getMonthlyProgressData(progressList, 6);
                  const hasData = chartData.data && chartData.data.some(value => value > 0);

                  return hasData ? (
                    <View
                      style={{
                        ...CARD_STYLES.default,
                        marginBottom: SPACING.lg,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg }}>
                        <Ionicons name="trending-up" size={22} color={TEACHER_COLORS.secondary.DEFAULT} />
                        <Text style={{ marginLeft: SPACING.sm, fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.gray[800] }}>
                          월별 학습 진행
                        </Text>
                      </View>

                      <LineChart
                        data={{
                          labels: chartData.labels,
                          datasets: [
                            {
                              data: chartData.data,
                            },
                          ],
                        }}
                        width={Dimensions.get('window').width - SPACING.xl * 4}
                        height={200}
                        chartConfig={{
                          backgroundColor: TEACHER_COLORS.white,
                          backgroundGradientFrom: TEACHER_COLORS.white,
                          backgroundGradientTo: TEACHER_COLORS.white,
                          decimalPlaces: 0,
                          color: (opacity = 1) => `rgba(123, 97, 255, ${opacity})`,
                          labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                          style: {
                            borderRadius: RADIUS.xl,
                          },
                          propsForDots: {
                            r: '6',
                            strokeWidth: '2',
                            stroke: TEACHER_COLORS.secondary.DEFAULT,
                          },
                          propsForBackgroundLines: {
                            strokeDasharray: '',
                            stroke: TEACHER_COLORS.gray[200],
                            strokeWidth: 1,
                          },
                        }}
                        bezier
                        style={{
                          marginVertical: SPACING.sm,
                          borderRadius: RADIUS.xl,
                        }}
                      />

                      <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs, color: TEACHER_COLORS.gray[500], textAlign: 'center', marginTop: SPACING.sm }}>
                        최근 6개월간 완료한 곡 수
                      </Text>
                    </View>
                  ) : null;
                })()}

                {/* 교재별 진도 */}
                {progressList.map((progress, index) => {
                  const isExpanded = expandedBooks[progress.id];
                  const completionRate = progress.stats?.completionRate || 0;

                  return (
                    <View
                      key={progress.id}
                      style={{
                        ...CARD_STYLES.default,
                        marginBottom: SPACING.lg,
                      }}
                    >
                      {/* 교재 헤더 */}
                      <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.md }}>
                        <TouchableOpacity
                          onPress={() =>
                            setExpandedBooks({
                              ...expandedBooks,
                              [progress.id]: !isExpanded,
                            })
                          }
                          style={{ flex: 1 }}
                          activeOpacity={0.7}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View style={{ flex: 1 }}>
                              <Text style={{ fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.gray[800] }}>
                                📖 {progress.book.name}
                              </Text>
                              <Text style={{ marginTop: SPACING.xs, fontSize: TYPOGRAPHY.fontSize.xs, color: TEACHER_COLORS.gray[500] }}>
                                {progress.stats?.completedSongs || 0} / {progress.stats?.totalSongs || 0} 곡 완료
                              </Text>
                            </View>
                            <Ionicons
                              name={isExpanded ? 'chevron-up' : 'chevron-down'}
                              size={24}
                              color={TEACHER_COLORS.gray[400]}
                            />
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleEditProgress(progress)}
                          style={{ marginLeft: SPACING.sm, padding: SPACING.xs }}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="create-outline" size={20} color={TEACHER_COLORS.primary.DEFAULT} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteProgress(progress)}
                          style={{ marginLeft: SPACING.sm, padding: SPACING.xs }}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="trash-outline" size={20} color={TEACHER_COLORS.danger[600]} />
                        </TouchableOpacity>
                      </View>

                      {/* 진행률 바 */}
                      <View
                        style={{
                          height: 8,
                          borderRadius: RADIUS.full,
                          backgroundColor: TEACHER_COLORS.gray[100],
                          overflow: 'hidden',
                        }}
                      >
                        <View
                          style={{
                            width: `${completionRate}%`,
                            height: '100%',
                            backgroundColor: TEACHER_COLORS.primary.DEFAULT,
                          }}
                        />
                      </View>
                      <Text style={{ marginTop: SPACING.xs, fontSize: TYPOGRAPHY.fontSize.xs, color: TEACHER_COLORS.primary.DEFAULT, textAlign: 'right' }}>
                        {completionRate.toFixed(1)}%
                      </Text>

                      {/* 곡 추가 버튼 */}
                      <TouchableOpacity
                        onPress={() => handleOpenAddSongModal(progress)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          paddingVertical: SPACING.sm,
                          marginTop: SPACING.md,
                          borderRadius: RADIUS.lg,
                          borderWidth: 1.5,
                          borderColor: TEACHER_COLORS.primary[200],
                          borderStyle: 'dashed',
                          backgroundColor: TEACHER_COLORS.primary[50],
                        }}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="add-circle" size={16} color={TEACHER_COLORS.primary.DEFAULT} />
                        <Text style={{ marginLeft: SPACING.xs, fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: TEACHER_COLORS.primary.DEFAULT }}>
                          곡 추가
                        </Text>
                      </TouchableOpacity>

                      {/* 곡 목록 (펼쳤을 때만 표시) */}
                      {isExpanded && progress.songs && progress.songs.length > 0 && (
                        <View style={{ marginTop: SPACING.lg, paddingTop: SPACING.lg, borderTopWidth: 1, borderTopColor: TEACHER_COLORS.gray[100] }}>
                          {progress.songs
                            .sort((a, b) => {
                              // 진행중 > 완료 > 미시작 순서
                              const order = { in_progress: 0, completed: 1, not_started: 2 };
                              return (order[a.status] || 2) - (order[b.status] || 2);
                            })
                            .map((song, idx) => {
                              const getStatusInfo = (status) => {
                                switch (status) {
                                  case 'completed':
                                    return {
                                      icon: 'checkmark-circle',
                                      color: TEACHER_COLORS.success[600],
                                      bgColor: TEACHER_COLORS.success[50],
                                      label: '완료',
                                    };
                                  case 'in_progress':
                                    return {
                                      icon: 'play-circle',
                                      color: TEACHER_COLORS.warning[600],
                                      bgColor: TEACHER_COLORS.warning[50],
                                      label: '진행중',
                                    };
                                  default:
                                    return {
                                      icon: 'ellipse-outline',
                                      color: TEACHER_COLORS.gray[400],
                                      bgColor: TEACHER_COLORS.gray[50],
                                      label: '대기',
                                    };
                                }
                              };

                              const statusInfo = getStatusInfo(song.status);

                              return (
                                <View
                                  key={idx}
                                  style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    paddingVertical: SPACING.md,
                                    borderBottomWidth: idx < progress.songs.length - 1 ? 1 : 0,
                                    borderBottomColor: TEACHER_COLORS.gray[50],
                                  }}
                                >
                                  <View
                                    style={{
                                      width: 32,
                                      height: 32,
                                      borderRadius: 16,
                                      backgroundColor: statusInfo.bgColor,
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      marginRight: SPACING.md,
                                    }}
                                  >
                                    <Ionicons name={statusInfo.icon} size={18} color={statusInfo.color} />
                                  </View>
                                  <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.medium, color: TEACHER_COLORS.gray[800] }}>
                                      {song.title}
                                    </Text>
                                    {song.learningStep?.currentStep && (() => {
                                      const stepInfo = getLearningStepById(song.learningStep.currentStep);
                                      return stepInfo ? (
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                          <Text style={{ fontSize: TYPOGRAPHY.fontSize.lg, marginRight: 4 }}>
                                            {stepInfo.icon}
                                          </Text>
                                          <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: stepInfo.color }}>
                                            {stepInfo.name}
                                          </Text>
                                        </View>
                                      ) : null;
                                    })()}
                                    {song.notes && (
                                      <Text style={{ marginTop: 2, fontSize: TYPOGRAPHY.fontSize.xs, color: TEACHER_COLORS.gray[500] }}>
                                        {song.notes}
                                      </Text>
                                    )}
                                    {song.completedDate && (
                                      <Text style={{ marginTop: 2, fontSize: TYPOGRAPHY.fontSize.xs, color: TEACHER_COLORS.gray[400] }}>
                                        완료일: {song.completedDate}
                                      </Text>
                                    )}
                                  </View>
                                  <View
                                    style={{
                                      paddingHorizontal: SPACING.sm,
                                      paddingVertical: SPACING.xs - 2,
                                      borderRadius: RADIUS.md,
                                      backgroundColor: statusInfo.bgColor,
                                    }}
                                  >
                                    <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs, fontWeight: TYPOGRAPHY.fontWeight.bold, color: statusInfo.color }}>
                                      {statusInfo.label}
                                    </Text>
                                  </View>
                                </View>
                              );
                            })}
                        </View>
                      )}
                    </View>
                  );
                })}

                {/* 안내 메시지 */}
                <View
                  style={{
                    backgroundColor: TEACHER_COLORS.blue[50],
                    borderRadius: RADIUS.xl,
                    padding: SPACING.lg,
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                  }}
                >
                  <Ionicons name="information-circle" size={20} color={TEACHER_COLORS.blue[600]} style={{ marginTop: 2 }} />
                  <View style={{ flex: 1, marginLeft: SPACING.md }}>
                    <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: TEACHER_COLORS.gray[700], lineHeight: 20 }}>
                      수업일지에 "바이엘 45번 완료", "체르니 30-5번 시작" 등을 작성하면 AI가 자동으로 진도를 업데이트합니다!
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        );

      case '일지':
        return (
          <View style={{ flex: 1 }}>
            {/* 헤더 - 작성 버튼 */}
            <View style={{
              ...CARD_STYLES.default,
              marginHorizontal: SPACING.xl,
              marginTop: SPACING.xl,
              marginBottom: SPACING.md,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="document-text" size={22} color={TEACHER_COLORS.purple[600]} />
                <Text style={{
                  marginLeft: SPACING.sm,
                  fontSize: TYPOGRAPHY.fontSize.lg,
                  fontWeight: TYPOGRAPHY.fontWeight.bold,
                  color: TEACHER_COLORS.gray[800]
                }}>
                  수업일지 게시판
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setSelectedLessonNote(null);
                  setShowLessonNoteModal(true);
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: SPACING.lg,
                  paddingVertical: SPACING.sm,
                  borderRadius: RADIUS.lg,
                  backgroundColor: TEACHER_COLORS.purple[500],
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle" size={20} color={TEACHER_COLORS.white} />
                <Text style={{
                  marginLeft: SPACING.xs,
                  fontSize: TYPOGRAPHY.fontSize.sm,
                  fontWeight: TYPOGRAPHY.fontWeight.semibold,
                  color: TEACHER_COLORS.white
                }}>
                  일지 작성
                </Text>
              </TouchableOpacity>
            </View>

            {/* 수업일지 타임라인 */}
            <ScrollView
              style={{ flex: 1, paddingHorizontal: SPACING.xl }}
              showsVerticalScrollIndicator={false}
            >
              {allLessonNotes.length > 0 ? (
                <>
                  <View style={{ marginBottom: SPACING.md }}>
                    <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: TEACHER_COLORS.gray[500] }}>
                      총 {allLessonNotes.length}개의 수업일지
                    </Text>
                  </View>
                  {allLessonNotes.map((note, index) => (
                    <View key={note.id} style={{ marginBottom: SPACING.lg }}>
                      <LessonNoteCard
                        lessonNote={note}
                        student={student}
                        onEdit={() => {
                          setSelectedLessonNote(note);
                          setShowLessonNoteModal(true);
                        }}
                        onDelete={async () => {
                          Alert.alert(
                            '수업 일지 삭제',
                            '이 수업 일지를 삭제하시겠습니까?',
                            [
                              { text: '취소', style: 'cancel' },
                              {
                                text: '삭제',
                                style: 'destructive',
                                onPress: async () => {
                                  try {
                                    await deleteLessonNote(note.id);
                                    toast.success('수업 일지가 삭제되었습니다');
                                  } catch (error) {
                                    toast.error('삭제에 실패했습니다');
                                  }
                                }
                              }
                            ]
                          );
                        }}
                      />
                    </View>
                  ))}
                  <View style={{ height: SPACING['4xl'] }} />
                </>
              ) : (
                <View style={{
                  ...CARD_STYLES.default,
                  padding: SPACING['4xl'],
                  alignItems: 'center',
                }}>
                  <View style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: TEACHER_COLORS.purple[50],
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: SPACING.lg,
                  }}>
                    <Ionicons name="document-text-outline" size={40} color={TEACHER_COLORS.purple[400]} />
                  </View>
                  <Text style={{
                    fontSize: TYPOGRAPHY.fontSize.lg,
                    fontWeight: TYPOGRAPHY.fontWeight.bold,
                    color: TEACHER_COLORS.gray[800],
                    marginBottom: SPACING.sm
                  }}>
                    작성된 수업 일지가 없습니다
                  </Text>
                  <Text style={{
                    fontSize: TYPOGRAPHY.fontSize.sm,
                    color: TEACHER_COLORS.gray[500],
                    textAlign: 'center',
                    lineHeight: 20,
                    marginBottom: SPACING.xl
                  }}>
                    수업 후 진도와 메모를 작성하면{'\n'}AI가 자동으로 분석해드립니다
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedLessonNote(null);
                      setShowLessonNoteModal(true);
                    }}
                    style={{
                      paddingHorizontal: SPACING.xl,
                      paddingVertical: SPACING.md,
                      borderRadius: RADIUS.xl,
                      backgroundColor: TEACHER_COLORS.purple[500],
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={{
                      fontSize: TYPOGRAPHY.fontSize.sm,
                      fontWeight: TYPOGRAPHY.fontWeight.semibold,
                      color: TEACHER_COLORS.white
                    }}>
                      첫 수업 일지 작성하기
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
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
                  <Text className="text-2xl font-bold" style={{ color: TEACHER_COLORS.success[600] }}>
                    {attendanceStats.present}
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1">출석</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold" style={{ color: TEACHER_COLORS.danger[600] }}>
                    {attendanceStats.absent}
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1">결석</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold" style={{ color: TEACHER_COLORS.warning[600] }}>
                    {attendanceStats.late}
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1">지각</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold text-primary">{attendanceStats.rate}%</Text>
                  <Text className="text-xs text-gray-500 mt-1">출석률</Text>
                </View>
              </View>
            </View>

            {/* 출석 기록 */}
            <View className="bg-white rounded-2xl p-4">
              <Text className="text-base font-bold text-gray-800 mb-3">출석 기록</Text>
              {attendanceRecords.length > 0 ? (
                attendanceRecords.map((record) => {
                  const statusInfo = getAttendanceStatusColor(record.status);
                  return (
                    <View key={record.id} className="flex-row items-center py-3 border-b border-gray-100">
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-gray-800 mb-1">
                          {formatDisplayDate(record.date)}
                        </Text>
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
                })
              ) : (
                <View className="py-12 items-center">
                  <Ionicons name="calendar-outline" size={48} color={TEACHER_COLORS.gray[200]} />
                  <Text className="text-gray-400 mt-3">출석 기록이 없습니다</Text>
                </View>
              )}
            </View>
          </View>
        );

      case '수강료':
        return (
          <View className="p-5">
            {/* 수강권 정보 */}
            <View className="bg-white rounded-2xl p-4 mb-4">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-base font-bold text-gray-800">현재 수강권</Text>
                <TouchableOpacity
                  className="flex-row items-center rounded-lg px-3 py-1.5"
                  style={{ backgroundColor: TEACHER_COLORS.gray[100] }}
                  onPress={handleOpenTicketModal}
                  activeOpacity={0.7}
                >
                  <Ionicons name="settings-outline" size={16} color={TEACHER_COLORS.gray[700]} />
                  <Text className="text-xs font-semibold text-gray-700 ml-1">변경</Text>
                </TouchableOpacity>
              </View>

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
                    <View
                      className="rounded-full px-3 py-1"
                      style={{
                        backgroundColor: (student?.ticketCount || 0) <= 2 ? TEACHER_COLORS.danger[50] : TEACHER_COLORS.white
                      }}
                    >
                      <Text
                        className="text-xs font-bold"
                        style={{
                          color: (student?.ticketCount || 0) <= 2
                            ? TEACHER_COLORS.danger[600]
                            : TEACHER_COLORS.purple[600]
                        }}
                      >
                        {student?.ticketCount || 0}회 남음
                      </Text>
                    </View>
                  )}
                </View>
                {student?.ticketType === 'period' && (
                  <Text className="text-sm text-gray-600">
                    {student?.ticketPeriod?.start || '-'} ~ {student?.ticketPeriod?.end || '-'}
                  </Text>
                )}
              </View>

              {/* 회차권 충전 버튼 */}
              {student?.ticketType === 'count' && (
                <TouchableOpacity
                  className="rounded-xl py-3 mt-2 flex-row items-center justify-center"
                  style={{ backgroundColor: TEACHER_COLORS.purple[500] }}
                  onPress={handleRechargeTicket}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add-circle" size={18} color="white" />
                  <Text className="text-white text-sm font-bold ml-2">회차권 충전</Text>
                </TouchableOpacity>
              )}
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

              {paymentRecords.length > 0 ? (
                <>
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
                                {record.type || '수강료'}
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
                            <Text className="text-xs text-gray-500">
                              {formatDisplayDate(record.date)}
                            </Text>
                          </View>
                          <View className="items-end">
                            <Text className="text-base font-bold text-gray-800">
                              {formatCurrency(record.amount)}
                            </Text>
                            <Text className="text-xs text-gray-500 mt-1">
                              {record.method || '-'}
                            </Text>
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
                        {formatCurrency(paymentRecords.reduce((sum, record) => sum + (record.amount || 0), 0))}
                      </Text>
                    </View>
                  </View>
                </>
              ) : (
                <View className="py-12 items-center">
                  <Ionicons name="card-outline" size={48} color={TEACHER_COLORS.gray[200]} />
                  <Text className="text-gray-400 mt-3">결제 내역이 없습니다</Text>
                </View>
              )}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  if (!student) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScreenHeader title="학생 상세" navigation={navigation} />
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">학생 정보를 찾을 수 없습니다</Text>
        </View>
      </SafeAreaView>
    );
  }

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
              <Ionicons name="trash-outline" size={22} color={TEACHER_COLORS.danger[500]} />
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

      {/* 수강권 설정 모달 */}
      <Modal
        visible={showTicketModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTicketModal(false)}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="bg-white rounded-t-3xl p-6" style={{ maxHeight: '80%' }}>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-gray-800">수강권 설정</Text>
              <TouchableOpacity onPress={() => setShowTicketModal(false)}>
                <Ionicons name="close" size={28} color={TEACHER_COLORS.gray[600]} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {/* 수강권 타입 선택 */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">수강권 타입</Text>
                <SegmentedControl
                  options={[
                    { value: 'count', label: '회차권' },
                    { value: 'period', label: '기간 정액권' }
                  ]}
                  value={ticketFormData.ticketType}
                  onChange={(value) => setTicketFormData({ ...ticketFormData, ticketType: value })}
                />
              </View>

              {/* 회차권일 때 */}
              {ticketFormData.ticketType === 'count' && (
                <View className="mb-4">
                  <FormInput
                    label="남은 횟수"
                    placeholder="예: 8"
                    value={String(ticketFormData.ticketCount)}
                    onChangeText={(text) => setTicketFormData({ ...ticketFormData, ticketCount: parseInt(text) || 0 })}
                    type="numeric"
                    iconName="ticket-outline"
                    required
                  />
                </View>
              )}

              {/* 기간 정액권일 때 */}
              {ticketFormData.ticketType === 'period' && (
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">수강 기간 *</Text>
                  <View className="flex-row items-center gap-2">
                    <FormInput
                      placeholder="2025.01"
                      value={ticketFormData.ticketPeriodStart}
                      onChangeText={(text) => setTicketFormData({ ...ticketFormData, ticketPeriodStart: text })}
                      style={{ flex: 1 }}
                    />
                    <Text className="text-gray-600">~</Text>
                    <FormInput
                      placeholder="2025.03"
                      value={ticketFormData.ticketPeriodEnd}
                      onChangeText={(text) => setTicketFormData({ ...ticketFormData, ticketPeriodEnd: text })}
                      style={{ flex: 1 }}
                    />
                  </View>
                  <Text className="text-xs text-gray-500 mt-1">
                    형식: YYYY.MM (예: 2025.01)
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* 저장 버튼 */}
            <View className="flex-row gap-2 mt-4">
              <TouchableOpacity
                className="flex-1 rounded-xl py-3 items-center justify-center"
                style={{ backgroundColor: TEACHER_COLORS.gray[200] }}
                onPress={() => setShowTicketModal(false)}
                activeOpacity={0.7}
              >
                <Text className="text-gray-700 text-sm font-bold">취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 rounded-xl py-3 items-center justify-center"
                style={{ backgroundColor: TEACHER_COLORS.primary[600] }}
                onPress={handleSaveTicket}
                activeOpacity={0.7}
              >
                <Text className="text-white text-sm font-bold">저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 수업 일지 모달 */}
      <LessonNoteModal
        visible={showLessonNoteModal}
        onClose={() => {
          setShowLessonNoteModal(false);
          setSelectedLessonNote(null);
          fetchStudentNotes(studentId);
          loadProgress(); // 진도 데이터도 새로고침
        }}
        student={student}
        date={new Date().toISOString().split('T')[0]}
        existingNote={selectedLessonNote}
      />

      {/* 진도 관리 모달 */}
      <ProgressManageModal
        visible={showProgressManageModal}
        onClose={() => {
          setShowProgressManageModal(false);
          setSelectedBook(null);
        }}
        studentId={studentId}
        studentName={student?.name}
        existingProgress={selectedBook}
        onSaved={handleProgressSaved}
        navigation={navigation}
      />

      {/* 진도 수정 모달 */}
      <ProgressEditModal
        visible={showProgressEditModal}
        onClose={() => {
          setShowProgressEditModal(false);
          setSelectedBook(null);
        }}
        progress={selectedBook}
        onSaved={() => {
          setShowProgressEditModal(false);
          setSelectedBook(null);
          loadProgress();
        }}
        navigation={navigation}
      />
    </SafeAreaView>
  );
}
