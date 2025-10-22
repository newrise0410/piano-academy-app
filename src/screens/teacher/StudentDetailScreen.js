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
import { useStudentStore, usePaymentStore, useAttendanceStore, useLessonNoteStore } from '../../store';
import { useToastStore } from '../../store';
import { formatDate, formatCurrency } from '../../utils';
import AiMemoEditor from '../../components/teacher/AiMemoEditor';
import LessonNoteCard from '../../components/common/LessonNoteCard';
import LessonNoteModal from '../../components/teacher/LessonNoteModal';

export default function StudentDetailScreen({ route, navigation }) {
  const { studentId } = route?.params || {};

  // Zustand Store
  const { students, deleteStudent, loading: studentLoading } = useStudentStore();
  const { payments, fetchAllPayments } = usePaymentStore();
  const { records, fetchAllRecords } = useAttendanceStore();
  const { lessonNotes, fetchStudentNotes, deleteLessonNote } = useLessonNoteStore();
  const toast = useToastStore();

  const [activeTab, setActiveTab] = useState('정보');
  const [memo, setMemo] = useState('');
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

  // 학생의 수업 일지 가져오기
  const studentLessonNotes = useMemo(() => {
    return lessonNotes
      .filter(note => note.studentId === studentId)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5); // 최근 5개만
  }, [lessonNotes, studentId]);

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
            {/* 기본 정보 */}
            <View className="bg-white rounded-2xl p-4 mb-4">
              <Text className="text-base font-bold text-gray-800 mb-3">기본 정보</Text>

              <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                <Text className="text-sm text-gray-600">생년월일</Text>
                <Text className="text-sm font-semibold text-gray-800">
                  {student?.birthDate || '-'}
                </Text>
              </View>

              <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                <Text className="text-sm text-gray-600">등록일</Text>
                <Text className="text-sm font-semibold text-gray-800">
                  {formatDisplayDate(student?.createdAt) || '-'}
                </Text>
              </View>

              <View className="flex-row justify-between items-center py-2">
                <Text className="text-sm text-gray-600">연락처</Text>
                <Text className="text-sm font-semibold text-primary">
                  {student?.parentName || '학부모'} ({student?.parentPhone || '-'})
                </Text>
              </View>
            </View>

            {/* 현재 진도 */}
            {student?.book && (
              <View className="bg-white rounded-2xl p-4 mb-4">
                <Text className="text-base font-bold text-gray-800 mb-3">현재 진도</Text>

                <View className="mb-3">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-sm text-gray-600">{student.book}</Text>
                    {student.progress !== undefined && (
                      <Text className="text-sm font-bold text-primary">{student.progress}%</Text>
                    )}
                  </View>
                  {student.progress !== undefined && (
                    <>
                      <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <View className="h-full bg-primary rounded-full" style={{ width: `${student.progress}%` }} />
                      </View>
                      {student.progressPage && student.totalPages && (
                        <Text className="text-xs text-gray-500 mt-1">
                          {student.progressPage}/{student.totalPages}곡 완료
                        </Text>
                      )}
                    </>
                  )}
                </View>
              </View>
            )}

            {/* 최근 수업 일지 */}
            <View className="bg-white rounded-2xl p-4 mb-4">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-base font-bold text-gray-800">최근 수업 일지</Text>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    className="flex-row items-center rounded-lg px-3 py-1.5"
                    style={{ backgroundColor: TEACHER_COLORS.purple[50] }}
                    onPress={() => {
                      setSelectedLessonNote(null);
                      setShowLessonNoteModal(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add" size={16} color={TEACHER_COLORS.purple[600]} />
                    <Text className="text-xs font-semibold ml-1" style={{ color: TEACHER_COLORS.purple[600] }}>
                      작성
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-row items-center rounded-lg px-3 py-1.5"
                    style={{ backgroundColor: TEACHER_COLORS.gray[100] }}
                    onPress={() => navigation.navigate('LessonNoteScreen')}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="list" size={16} color={TEACHER_COLORS.gray[700]} />
                    <Text className="text-xs font-semibold text-gray-700 ml-1">전체</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {studentLessonNotes.length > 0 ? (
                studentLessonNotes.map((note) => (
                  <View key={note.id} className="mb-2">
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
                ))
              ) : (
                <View className="items-center py-8">
                  <Ionicons name="document-text-outline" size={48} color={TEACHER_COLORS.gray[300]} />
                  <Text className="text-gray-400 mt-2">작성된 수업 일지가 없습니다</Text>
                  <TouchableOpacity
                    className="mt-3 rounded-lg px-4 py-2"
                    style={{ backgroundColor: TEACHER_COLORS.purple[500] }}
                    onPress={() => {
                      setSelectedLessonNote(null);
                      setShowLessonNoteModal(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text className="text-white text-sm font-semibold">첫 수업 일지 작성하기</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* 메모 */}
            <View className="bg-white rounded-2xl p-4 mb-4">
              <Text className="text-base font-bold text-gray-800 mb-3">학생 전반 메모</Text>

              <AiMemoEditor
                value={memo}
                onChange={setMemo}
                studentInfo={{
                  name: student?.name,
                  level: student?.level,
                  book: student?.book || '바이엘',
                  recentProgress: student?.progress,
                }}
                placeholder="학생에 대한 전반적인 메모를 입력하세요..."
                enableAttachments={true}
                enableHomeworkGenerator={true}
              />
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
                  <Text className="text-2xl font-bold" style={{ color: TEACHER_COLORS.success[600] }}>
                    {attendanceStats.present}
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1">출석</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold" style={{ color: TEACHER_COLORS.red[600] }}>
                    {attendanceStats.absent}
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1">결석</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold" style={{ color: TEACHER_COLORS.orange[600] }}>
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
                        backgroundColor: (student?.ticketCount || 0) <= 2 ? TEACHER_COLORS.red[50] : TEACHER_COLORS.white
                      }}
                    >
                      <Text
                        className="text-xs font-bold"
                        style={{
                          color: (student?.ticketCount || 0) <= 2
                            ? TEACHER_COLORS.red[600]
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
        }}
        student={student}
        date={new Date().toISOString().split('T')[0]}
        existingNote={selectedLessonNote}
      />
    </SafeAreaView>
  );
}
