import { useState, useMemo, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Text, ScreenHeader } from '../../components/common';
import { GradientIconBadge, CollapsibleSectionHeader } from '../../components/teacher';
import { useStudentStore, usePaymentStore } from '../../store';
import { useUnpaidStudents } from '../../hooks/useUnpaidStudents';
import TEACHER_COLORS, { TEACHER_GRADIENTS, TEACHER_OVERLAY_COLORS } from '../../styles/teacher_colors';
import { formatCurrency, formatTicketDisplay } from '../../utils';
import { getTuitionByStudentId, createNotice } from '../../services/firestoreService';
import { useAuthStore } from '../../store/authStore';
import { getExpensesByTeacher } from '../../services/expenseService';

export default function TuitionScreen({ navigation }) {
  // Zustand Store
  const { students, fetchStudents } = useStudentStore();
  const { payments, fetchAllPayments } = usePaymentStore();
  const { user } = useAuthStore();

  // 미납 학생 Hook 사용 (DashboardScreen과 통합)
  const unpaidStudentsData = useUnpaidStudents();

  // 지출 데이터
  const [expenses, setExpenses] = useState([]);

  // Fetch students, payments, expenses on mount
  useEffect(() => {
    fetchStudents();
    fetchAllPayments();

    // 지출 데이터 로드
    const loadExpenses = async () => {
      if (!user?.uid) return;
      const result = await getExpensesByTeacher(user.uid);
      if (result.success) {
        setExpenses(result.data);
      }
    };
    loadExpenses();
  }, [fetchStudents, fetchAllPayments, user?.uid]);

  // 상세보기 모달
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentPayments, setStudentPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  // 잔여 1회 섹션 접기/펼치기
  const [oneSessionExpanded, setOneSessionExpanded] = useState(false);


  // 실제 데이터 기반 통계 계산
  const stats = useMemo(() => {
    const unpaidCount = unpaidStudentsData.length;
    const oneSessionCount = students.filter(s => s.ticketType === 'count' && s.ticketCount === 1).length;
    const twoSessionCount = students.filter(s => s.ticketType === 'count' && s.ticketCount === 2).length;
    const normalCount = students.length - unpaidCount - oneSessionCount - twoSessionCount;

    return {
      paid: normalCount,
      lastWeek: twoSessionCount,
      unpaid: unpaidCount,
    };
  }, [students, unpaidStudentsData]);

  // 미납자 목록 (화면에 맞게 포맷팅)
  const unpaidStudents = useMemo(() => {
    return unpaidStudentsData.map(student => ({
      id: student.id,
      name: student.name,
      deadline: student.lastPaymentDate,
      level: student.level,
      ticket: formatTicketDisplay(student),
      parentId: student.parentId,
    }));
  }, [unpaidStudentsData]);

  // 잔여 1회 학생 (실제 데이터)
  const oneSessionLeft = useMemo(() => {
    return students
      .filter(s => s.ticketType === 'count' && s.ticketCount === 1)
      .map(s => ({
        id: s.id,
        name: s.name,
        sessions: formatTicketDisplay(s),
        level: s.level,
        parentId: s.parentId,
      }));
  }, [students]);

  // 월별 수입/지출 계산 (실제 데이터 기반)
  const monthlyFinance = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // 이번 달 수입 계산 (paid 상태인 결제만)
    const monthlyIncome = payments
      .filter(payment => {
        if (payment.status !== 'paid' || !payment.date) return false;
        const paymentDate = payment.date instanceof Date ? payment.date : new Date(payment.date);
        return paymentDate.getFullYear() === currentYear &&
               paymentDate.getMonth() + 1 === currentMonth;
      })
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);

    // 이번 달 지출 계산
    const monthlyExpense = expenses
      .filter(expense => {
        if (!expense.date) return false;
        const expenseDate = expense.date instanceof Date ? expense.date : new Date(expense.date);
        return expenseDate.getFullYear() === currentYear &&
               expenseDate.getMonth() + 1 === currentMonth;
      })
      .reduce((sum, expense) => sum + (expense.amount || 0), 0);

    // 순이익
    const netProfit = monthlyIncome - monthlyExpense;

    return {
      income: monthlyIncome,
      expense: monthlyExpense,
      netProfit: netProfit,
      incomeCount: payments.filter(p => {
        if (p.status !== 'paid' || !p.date) return false;
        const paymentDate = p.date instanceof Date ? p.date : new Date(p.date);
        return paymentDate.getFullYear() === currentYear &&
               paymentDate.getMonth() + 1 === currentMonth;
      }).length,
      expenseCount: expenses.filter(e => {
        if (!e.date) return false;
        const expenseDate = e.date instanceof Date ? e.date : new Date(e.date);
        return expenseDate.getFullYear() === currentYear &&
               expenseDate.getMonth() + 1 === currentMonth;
      }).length,
    };
  }, [payments, expenses]);

  // 학생 결제 내역 상세보기
  const handleViewStudentPayments = async (student) => {
    setSelectedStudent(student);
    setDetailModalVisible(true);
    setLoadingPayments(true);

    try {
      const result = await getTuitionByStudentId(student.id);
      if (result.success) {
        setStudentPayments(result.data);
      }
    } catch (error) {
      console.error('결제 내역 로드 실패:', error);
    } finally {
      setLoadingPayments(false);
    }
  };

  // 잔여 1회 학생에게 알림 보내기
  const handleSendOneSessionNotice = async (student) => {
    if (!student.parentId) {
      Alert.alert('알림 실패', '학부모 정보가 없습니다.');
      return;
    }

    Alert.alert(
      '수강권 충전 안내',
      `${student.name} 학부모님께 수강권 충전 안내를 보내시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '보내기',
          onPress: async () => {
            try {
              const result = await createNotice({
                title: '⚡ 수강권 충전 안내',
                content: `${student.name} 학생의 수강권이 1회 남았습니다.\n\n현재 수강권: ${student.sessions}\n\n수강권 충전이 필요합니다.`,
                targetType: 'individual',
                targetStudents: [student.id],
                createdBy: user.uid,
                navigateTo: 'Tuition',
              });

              if (result.success) {
                Alert.alert('알림 전송 완료', '학부모님께 수강권 충전 안내를 보냈습니다.');
              } else {
                Alert.alert('알림 전송 실패', result.error || '알림 전송에 실패했습니다.');
              }
            } catch (error) {
              console.error('알림 전송 오류:', error);
              Alert.alert('오류', '알림 전송 중 오류가 발생했습니다.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Modern Gradient Header with Decorative Elements */}
        <LinearGradient
          colors={['#8B5CF6', '#7C3AED', '#6D28D9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: 60, paddingBottom: 80, position: 'relative', overflow: 'hidden' }}
        >
          {/* Decorative circles */}
          <View style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.1)' }} />
          <View style={{ position: 'absolute', bottom: 20, left: -30, width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.05)' }} />

          <View className="px-6">
            <View className="mb-2">
              <Text className="text-white/80 text-sm mb-1">💰 Tuition</Text>
              <Text className="text-white text-3xl font-bold tracking-tight">수강료 관리</Text>
            </View>
            <Text className="text-white/70 text-sm">학생들의 수강권 현황을 확인하세요</Text>
          </View>
        </LinearGradient>

        {/* Statistics Cards with White Background - positioned to overlap header */}
        <View className="px-6" style={{ marginTop: -50 }}>
          <View
            className="rounded-3xl p-5"
            style={{
              backgroundColor: 'white',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 5,
            }}
          >
            <View className="flex-row justify-around">
              {/* 정상 */}
              <View className="items-center">
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                    backgroundColor: '#D1FAE5',
                  }}
                >
                  <Ionicons name="checkmark-circle" size={28} color="#059669" />
                </View>
                <Text className="text-gray-500 text-xs mb-1">정상</Text>
                <Text className="text-gray-900 font-black text-2xl">{stats.paid}</Text>
                <Text className="text-gray-400 text-xs">2회 이상</Text>
              </View>

              {/* 주의 */}
              <View className="items-center">
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                    backgroundColor: '#FEF3C7',
                  }}
                >
                  <Ionicons name="warning" size={28} color="#D97706" />
                </View>
                <Text className="text-gray-500 text-xs mb-1">주의</Text>
                <Text className="text-gray-900 font-black text-2xl">{stats.lastWeek}</Text>
                <Text className="text-gray-400 text-xs">1회 남음</Text>
              </View>

              {/* 미납 */}
              <View className="items-center">
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                    backgroundColor: '#FEE2E2',
                  }}
                >
                  <Ionicons name="alert-circle" size={28} color="#DC2626" />
                </View>
                <Text className="text-gray-500 text-xs mb-1">미납</Text>
                <Text className="text-gray-900 font-black text-2xl">{stats.unpaid}</Text>
                <Text className="text-gray-400 text-xs">납부 필요</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Spacing */}
        <View style={{ height: 24 }} />

        {/* 수강권 미납 */}
        {unpaidStudents.length > 0 && (
          <View className="px-6 mb-4">
            <TouchableOpacity
              onPress={() => navigation.navigate('UnpaidStudentsScreen')}
              activeOpacity={0.7}
              className="rounded-3xl p-5"
              style={{
                backgroundColor: 'white',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View className="flex-row items-center">
                <View className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
                  style={{ backgroundColor: '#FEE2E2' }}>
                  <Ionicons name="alert-circle" size={28} color="#DC2626" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-bold text-lg mb-1">수강권 미납</Text>
                  <Text className="text-gray-500 text-sm">{unpaidStudents.length}명의 학생</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#D1D5DB" />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* 잔여 1회 */}
        {oneSessionLeft.length > 0 && (
          <View className="px-6 mb-4">
            <CollapsibleSectionHeader
              iconName="flash"
              gradientColors={['#F59E0B', '#D97706']}
              backgroundColor="#FEF3C7"
              title="잔여 1회"
              subtitle={`${oneSessionLeft.length}명의 학생`}
              isExpanded={oneSessionExpanded}
              onToggle={() => setOneSessionExpanded(!oneSessionExpanded)}
            />

            {oneSessionExpanded && oneSessionLeft.map((student, index) => (
              <TouchableOpacity
                key={student.id}
                onPress={() => handleViewStudentPayments(student)}
                activeOpacity={0.7}
                className="rounded-3xl p-5 mb-3"
                style={{
                  backgroundColor: 'white',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                  elevation: 3,
                  marginTop: index === 0 ? 12 : 0,
                }}
              >
                <View className="flex-row items-center mb-4">
                  <View className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
                    style={{ backgroundColor: '#FEF3C7' }}>
                    <Ionicons name="person" size={28} color="#D97706" />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                      <Text className="text-gray-900 font-bold text-lg">{student.name}</Text>
                      <View className="rounded-full px-2.5 py-1 ml-2" style={{ backgroundColor: '#F3E8FF' }}>
                        <Text className="text-xs font-bold" style={{ color: '#7C3AED' }}>{student.level}</Text>
                      </View>
                    </View>
                    <View className="flex-row items-center">
                      <Text className="text-gray-500 text-sm">수강권: </Text>
                      <Text className="text-orange-600 font-bold text-sm">⚡ {student.sessions}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#D1D5DB" />
                </View>
                <TouchableOpacity
                  onPress={() => handleSendOneSessionNotice(student)}
                  activeOpacity={0.8}
                  style={{ backgroundColor: '#D97706' }}
                  className="rounded-2xl py-3.5 px-4"
                >
                  <Text className="text-white font-bold text-center text-base">⚡ 알림 보내기</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* 이번 달 재정 */}
        <View className="px-6 mb-6">
          <TouchableOpacity
            onPress={() => navigation.navigate('FinanceManagement')}
            activeOpacity={0.7}
            className="rounded-3xl p-6"
            style={{
              backgroundColor: 'white',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 10,
              elevation: 4,
            }}
          >
            {/* 헤더 */}
            <View className="flex-row items-center justify-between mb-5">
              <View className="flex-row items-center flex-1">
                <View className="mr-3">
                  <GradientIconBadge
                    iconName="stats-chart"
                    gradientColors={['#6366F1', '#4F46E5']}
                    backgroundColor="#EEF2FF"
                    iconSize={24}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-500 text-sm mb-1">💰 Finance</Text>
                  <Text className="text-gray-900 font-black text-xl">이번 달 재정</Text>
                </View>
              </View>
              <View className="rounded-2xl p-2" style={{ backgroundColor: '#F3F4F6' }}>
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
              </View>
            </View>

            {/* 순이익 */}
            <View className="mb-5 p-5 rounded-3xl" style={{ backgroundColor: '#F9FAFB' }}>
              <Text className="text-gray-500 text-sm mb-2 font-medium">순이익</Text>
              <Text className="text-gray-900 text-4xl font-black" style={{ letterSpacing: -2 }}>
                {monthlyFinance.netProfit >= 0 ? '+' : ''}{formatCurrency(Math.abs(monthlyFinance.netProfit))}
              </Text>
            </View>

            {/* 수입/지출 상세 */}
            <View className="flex-row items-stretch mb-4">
              {/* 수입 */}
              <View className="flex-1 mr-2 rounded-3xl p-4" style={{ backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#DBEAFE' }}>
                <View className="flex-row items-center mb-3">
                  <View className="w-9 h-9 rounded-2xl items-center justify-center mr-2"
                    style={{ backgroundColor: '#3B82F6' }}>
                    <Ionicons name="trending-up" size={18} color="white" />
                  </View>
                  <Text className="text-blue-700 text-sm font-bold">수입</Text>
                </View>
                <Text className="text-blue-900 font-black text-xl mb-1">
                  {formatCurrency(monthlyFinance.income)}
                </Text>
                <Text className="text-blue-600 text-xs">
                  {monthlyFinance.incomeCount}건
                </Text>
              </View>

              {/* 지출 */}
              <View className="flex-1 ml-2 rounded-3xl p-4" style={{ backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' }}>
                <View className="flex-row items-center mb-3">
                  <View className="w-9 h-9 rounded-2xl items-center justify-center mr-2"
                    style={{ backgroundColor: '#EF4444' }}>
                    <Ionicons name="trending-down" size={18} color="white" />
                  </View>
                  <Text className="text-red-700 text-sm font-bold">지출</Text>
                </View>
                <Text className="text-red-900 font-black text-xl mb-1">
                  {formatCurrency(monthlyFinance.expense)}
                </Text>
                <Text className="text-red-600 text-xs">
                  {monthlyFinance.expenseCount}건
                </Text>
              </View>
            </View>

            {/* CTA */}
            <View className="rounded-2xl p-3 flex-row items-center justify-center"
              style={{ backgroundColor: '#F3F4F6' }}>
              <Ionicons name="bar-chart" size={18} color="#6B7280" />
              <Text className="text-gray-700 font-bold text-sm ml-2">상세 재정 관리 보기</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 학생 결제 내역 상세보기 모달 */}
      <Modal
        visible={detailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="bg-white rounded-t-3xl" style={{ maxHeight: '85%' }}>
            {/* Modal Header with Gradient */}
            <LinearGradient
              colors={['#8B5CF6', '#7C3AED']}
              className="rounded-t-3xl px-6 pt-6 pb-8"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-white/80 text-sm mb-1">💳 Payment History</Text>
                  <Text className="text-white text-2xl font-black">
                    {selectedStudent?.name}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setDetailModalVisible(false)}
                  className="rounded-2xl p-2"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </LinearGradient>

            {/* Modal Content */}
            <View className="px-6 py-4" style={{ flex: 1 }}>
              {loadingPayments ? (
                <View className="items-center justify-center py-20">
                  <View className="w-16 h-16 rounded-full items-center justify-center mb-4"
                    style={{ backgroundColor: '#F3E8FF' }}>
                    <Ionicons name="time-outline" size={32} color="#8B5CF6" />
                  </View>
                  <Text className="text-gray-500 font-medium">로딩 중...</Text>
                </View>
              ) : studentPayments.length > 0 ? (
                <ScrollView showsVerticalScrollIndicator={false}>
                  {studentPayments.map((payment, index) => (
                    <View
                      key={payment.id || index}
                      className="rounded-3xl p-5 mb-3"
                      style={{
                        backgroundColor: 'white',
                        borderWidth: 1,
                        borderColor: payment.isPaid ? '#D1FAE5' : '#FEE2E2',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.04,
                        shadowRadius: 6,
                        elevation: 2,
                      }}
                    >
                      <View className="flex-row items-center mb-3">
                        <View className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
                          style={{ backgroundColor: payment.isPaid ? '#D1FAE5' : '#FEE2E2' }}>
                          <Ionicons
                            name={payment.isPaid ? 'checkmark-circle' : 'alert-circle'}
                            size={24}
                            color={payment.isPaid ? '#059669' : '#DC2626'}
                          />
                        </View>
                        <View className="flex-1">
                          <Text className="text-gray-900 font-bold text-base mb-1">
                            {payment.type || '수강료'}
                          </Text>
                          <Text className="text-gray-500 text-sm">
                            {new Date(payment.date).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </Text>
                        </View>
                        <View className="items-end">
                          <Text className="text-gray-900 font-black text-xl mb-1">
                            {formatCurrency(payment.amount)}
                          </Text>
                          <View
                            className="px-3 py-1 rounded-full"
                            style={{
                              backgroundColor: payment.isPaid ? '#D1FAE5' : '#FEE2E2'
                            }}
                          >
                            <Text
                              className="text-xs font-bold"
                              style={{
                                color: payment.isPaid ? '#059669' : '#DC2626'
                              }}
                            >
                              {payment.isPaid ? '✓ 완료' : '⚠ 미납'}
                            </Text>
                          </View>
                        </View>
                      </View>
                      {payment.method && (
                        <View className="flex-row items-center mb-2">
                          <Ionicons name="card-outline" size={16} color="#9CA3AF" />
                          <Text className="text-gray-600 text-sm ml-2">
                            {payment.method}
                          </Text>
                        </View>
                      )}
                      {payment.memo && (
                        <View className="rounded-2xl p-3 mt-2" style={{ backgroundColor: '#F9FAFB' }}>
                          <Text className="text-gray-700 text-sm">{payment.memo}</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <View className="items-center justify-center py-20">
                  <View className="w-20 h-20 rounded-full items-center justify-center mb-4"
                    style={{ backgroundColor: '#F3F4F6' }}>
                    <Ionicons name="receipt-outline" size={40} color="#9CA3AF" />
                  </View>
                  <Text className="text-gray-500 font-medium text-base">결제 내역이 없습니다</Text>
                  <Text className="text-gray-400 text-sm mt-1">첫 결제를 기다리고 있어요</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
