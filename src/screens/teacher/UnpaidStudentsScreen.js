import React, { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl, Linking, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Button, ScreenHeader } from '../../components/common';
import TEACHER_COLORS, { TEACHER_SEMANTIC_COLORS } from '../../styles/teacher_colors';
import { SHADOWS, RADIUS, SPACING, TYPOGRAPHY, CARD_STYLES, INPUT_STYLES, BADGE_STYLES, ICON_CONTAINER } from '../../styles/commonStyles';
import { useStudentStore, usePaymentStore, useToastStore } from '../../store';
import { useUnpaidStudents } from '../../hooks/useUnpaidStudents';
import { formatCurrency } from '../../utils';

/**
 * UnpaidStudentsScreen - 미납 학생 전체보기 화면
 * BottomSheet 모달에서 "전체보기" 버튼으로 이동
 * 추가 기능: 학생 상세 이동, 수강료 입력, 정렬 옵션
 */
export default function UnpaidStudentsScreen({ navigation }) {
  const { fetchStudents } = useStudentStore();
  const { fetchAllPayments, addPayment } = usePaymentStore();
  const toast = useToastStore();

  // useUnpaidStudents 훅 사용 - 실제 DB에서 마지막 결제일 및 미납 금액 가져오기
  const unpaidStudentsData = useUnpaidStudents();

  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState('date'); // 'date' | 'amount' | 'name'

  // 수강료 입력 모달
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedStudentForPayment, setSelectedStudentForPayment] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  // 새로고침
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchStudents(), fetchAllPayments()]);
    setRefreshing(false);
  };

  // 미납 학생 정렬
  const unpaidStudents = useMemo(() => {
    const filtered = [...unpaidStudentsData];

    // 정렬
    if (sortBy === 'date') {
      return filtered.sort((a, b) => {
        const dateA = new Date(a.lastPaymentDate || '2000-01-01');
        const dateB = new Date(b.lastPaymentDate || '2000-01-01');
        return dateA - dateB;
      });
    } else if (sortBy === 'amount') {
      return filtered.sort((a, b) => (b.unpaidAmount || 0) - (a.unpaidAmount || 0));
    } else {
      return filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
  }, [unpaidStudentsData, sortBy]);

  // 총 미납 금액
  const totalUnpaid = useMemo(() => {
    return unpaidStudents.reduce((sum, s) => sum + (s.unpaidAmount || 0), 0);
  }, [unpaidStudents]);

  // 납부 처리
  const handleMarkAsPaid = async (student) => {
    const { payments } = usePaymentStore.getState();
    const unpaidPayments = payments.filter(
      p => p.studentId === student.id && p.status === 'unpaid'
    );

    // 미납 결제 내역이 있는 경우: 상태를 paid로 변경
    if (unpaidPayments.length > 0) {
      Alert.alert(
        '납부 처리',
        `${student.name} 학생의 미납 수강료를 납부 완료 처리하시겠습니까?\n\n금액: ${formatCurrency(student.unpaidAmount)}`,
        [
          { text: '취소', style: 'cancel' },
          {
            text: '확인',
            onPress: async () => {
              try {
                const { updatePayment } = usePaymentStore.getState();

                // 모든 미납 결제를 paid로 업데이트
                await Promise.all(
                  unpaidPayments.map(payment =>
                    updatePayment(payment.id, {
                      status: 'paid',
                      date: new Date() // 현재 시간으로 업데이트
                    })
                  )
                );

                toast.success('납부 처리가 완료되었습니다.');

                // 데이터 새로고침
                await Promise.all([fetchStudents(), fetchAllPayments()]);
              } catch (error) {
                console.error('납부 처리 실패:', error);
                toast.error('납부 처리에 실패했습니다.');
              }
            },
          },
        ]
      );
    } else {
      // 결제 내역이 없는 경우: 새 결제 생성
      Alert.alert(
        '수강료 입력 필요',
        `${student.name} 학생은 결제 내역이 없습니다.\n수강료를 입력하시겠습니까?`,
        [
          { text: '취소', style: 'cancel' },
          {
            text: '입력하기',
            onPress: () => {
              setSelectedStudentForPayment(student);
              setPaymentAmount('');
              setPaymentModalVisible(true);
            },
          },
        ]
      );
    }
  };

  // 수강료 저장
  const handleSavePayment = async () => {
    if (!paymentAmount || !selectedStudentForPayment) {
      toast.error('금액을 입력해주세요.');
      return;
    }

    const amount = parseInt(paymentAmount.replace(/,/g, ''));
    if (isNaN(amount) || amount <= 0) {
      toast.error('올바른 금액을 입력해주세요.');
      return;
    }

    try {
      await addPayment({
        studentId: selectedStudentForPayment.id,
        studentName: selectedStudentForPayment.name,
        amount: amount,
        status: 'paid',
        date: new Date(),
        type: '수강료',
        method: '현금',
      });

      toast.success('수강료가 입력되었습니다.');
      setPaymentModalVisible(false);
      setPaymentAmount('');
      setSelectedStudentForPayment(null);

      // 데이터 새로고침
      await Promise.all([fetchStudents(), fetchAllPayments()]);
    } catch (error) {
      console.error('수강료 입력 실패:', error);
      toast.error('수강료 입력에 실패했습니다.');
    }
  };

  // 알림 발송
  const handleSendNotice = (student) => {
    // TODO: 알림장 작성 화면으로 이동하거나 수강료 안내 템플릿 사용
    toast.info('알림 발송 기능 준비 중');
  };

  // 수강료 입력
  const handlePayment = (student) => {
    // TODO: 수강료 입력 모달 또는 TuitionScreen으로 이동
    toast.info('수강료 입력 기능 준비 중');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: TEACHER_COLORS.gray[50] }}>
      {/* 헤더 */}
      <ScreenHeader
        title="미납 학생"
        subtitle={`${unpaidStudents.length}명의 미납 학생`}
      />

      {/* 통계 및 정렬 */}
      <View
        style={{
          backgroundColor: TEACHER_COLORS.white,
          borderBottomWidth: 1,
          borderBottomColor: TEACHER_COLORS.gray[200],
          paddingHorizontal: SPACING.xl,
          paddingVertical: SPACING.md,
        }}
      >
        {/* 통계 */}
        <View
          style={{
            backgroundColor: TEACHER_COLORS.danger[50],
            borderRadius: RADIUS.xl,
            padding: SPACING.lg,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
            <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: TEACHER_COLORS.gray[700] }}>총 미납 학생</Text>
            <Text style={{ fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.gray[800] }}>
              {unpaidStudents.length}명
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: TEACHER_COLORS.gray[700] }}>총 미납 금액</Text>
            <Text style={{ fontSize: TYPOGRAPHY.fontSize['2xl'], fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.danger[600] }}>
              {formatCurrency(totalUnpaid)}
            </Text>
          </View>
        </View>

        {/* 정렬 옵션 */}
        <View style={{ flexDirection: 'row', marginTop: SPACING.md, gap: SPACING.sm }}>
          <TouchableOpacity
            onPress={() => setSortBy('date')}
            style={{
              flex: 1,
              paddingVertical: SPACING.sm,
              paddingHorizontal: SPACING.md,
              borderRadius: RADIUS.md,
              backgroundColor: sortBy === 'date' ? TEACHER_COLORS.primary.DEFAULT : TEACHER_COLORS.gray[100],
            }}
            activeOpacity={0.7}
          >
            <Text
              style={{
                fontSize: TYPOGRAPHY.fontSize.xs,
                fontWeight: TYPOGRAPHY.fontWeight.semibold,
                textAlign: 'center',
                color: sortBy === 'date' ? TEACHER_COLORS.white : TEACHER_COLORS.gray[600],
              }}
            >
              납부일순
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSortBy('amount')}
            style={{
              flex: 1,
              paddingVertical: SPACING.sm,
              paddingHorizontal: SPACING.md,
              borderRadius: RADIUS.md,
              backgroundColor: sortBy === 'amount' ? TEACHER_COLORS.primary.DEFAULT : TEACHER_COLORS.gray[100],
            }}
            activeOpacity={0.7}
          >
            <Text
              style={{
                fontSize: TYPOGRAPHY.fontSize.xs,
                fontWeight: TYPOGRAPHY.fontWeight.semibold,
                textAlign: 'center',
                color: sortBy === 'amount' ? TEACHER_COLORS.white : TEACHER_COLORS.gray[600],
              }}
            >
              금액순
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSortBy('name')}
            style={{
              flex: 1,
              paddingVertical: SPACING.sm,
              paddingHorizontal: SPACING.md,
              borderRadius: RADIUS.md,
              backgroundColor: sortBy === 'name' ? TEACHER_COLORS.primary.DEFAULT : TEACHER_COLORS.gray[100],
            }}
            activeOpacity={0.7}
          >
            <Text
              style={{
                fontSize: TYPOGRAPHY.fontSize.xs,
                fontWeight: TYPOGRAPHY.fontWeight.semibold,
                textAlign: 'center',
                color: sortBy === 'name' ? TEACHER_COLORS.white : TEACHER_COLORS.gray[600],
              }}
            >
              이름순
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 학생 리스트 */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {unpaidStudents.length === 0 ? (
          <View style={{ paddingVertical: SPACING['5xl'], alignItems: 'center' }}>
            <View
              style={{
                ...ICON_CONTAINER.round(TEACHER_COLORS.success[100], 80),
                marginBottom: SPACING.lg,
              }}
            >
              <Ionicons name="checkmark-circle" size={40} color={TEACHER_COLORS.success[600]} />
            </View>
            <Text style={{ color: TEACHER_COLORS.gray[500], textAlign: 'center', fontSize: TYPOGRAPHY.fontSize.base }}>
              미납 학생이 없습니다
            </Text>
          </View>
        ) : (
          <View style={{ paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg }}>
            {unpaidStudents.map((student, idx) => (
              <View
                key={student.id}
                style={{
                  ...CARD_STYLES.default,
                  marginBottom: SPACING.md,
                }}
              >
                {/* 상단: 학생 정보 */}
                <TouchableOpacity
                  onPress={() => navigation.navigate('StudentDetail', { studentId: student.id })}
                  activeOpacity={0.7}
                  style={{ marginBottom: SPACING.md }}
                >
                  <View style={{ flex: 1 }}>
                    {/* 학생 정보 */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
                      <Text style={{ fontSize: TYPOGRAPHY.fontSize.base, fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.gray[800] }}>
                        {student.name}
                      </Text>
                      <View
                        style={{
                          ...BADGE_STYLES.default(TEACHER_COLORS.purple[100]),
                          marginLeft: SPACING.sm,
                        }}
                      >
                        <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs, fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.primary.DEFAULT }}>
                          {student.level}
                        </Text>
                      </View>
                    </View>

                    {/* 마지막 납부일 */}
                    <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs, color: TEACHER_COLORS.gray[600], marginBottom: SPACING.xs }}>
                      마지막 결제: {student.lastPaymentDate}
                    </Text>

                    {/* 미납 금액 */}
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs, color: TEACHER_COLORS.gray[500] }}>미납 금액: </Text>
                      <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: TEACHER_COLORS.danger[600] }}>
                        {formatCurrency(student.unpaidAmount || 280000)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* 납부처리 / 알림보내기 버튼 */}
                <View style={{ flexDirection: 'row', marginBottom: SPACING.md, gap: SPACING.sm }}>
                  <TouchableOpacity
                    onPress={() => handleMarkAsPaid(student)}
                    style={{
                      flex: 1,
                      borderRadius: RADIUS.md,
                      paddingHorizontal: SPACING.lg,
                      paddingVertical: SPACING.sm + 2,
                      backgroundColor: TEACHER_COLORS.success[500],
                      ...SHADOWS.sm,
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.white, textAlign: 'center' }}>
                      납부처리
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleSendNotice(student)}
                    style={{
                      flex: 1,
                      borderRadius: RADIUS.md,
                      paddingHorizontal: SPACING.lg,
                      paddingVertical: SPACING.sm + 2,
                      backgroundColor: TEACHER_COLORS.danger[500],
                      ...SHADOWS.sm,
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.white, textAlign: 'center' }}>
                      알림보내기
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* 하단: 액션 버튼 */}
                <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
                  <Button
                    title="수강료 입력"
                    icon="card"
                    variant="primary"
                    size="small"
                    onPress={() => handlePayment(student)}
                    style={{ flex: 1 }}
                  />
                  <Button
                    title="상세보기"
                    icon="person"
                    variant="outline"
                    size="small"
                    onPress={() => navigation.navigate('StudentDetail', { studentId: student.id })}
                    style={{ flex: 1 }}
                  />
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* 안내 메시지 */}
      {unpaidStudents.length > 0 && (
        <View
          style={{
            backgroundColor: TEACHER_COLORS.warning[50],
            borderTopWidth: 1,
            borderTopColor: TEACHER_COLORS.warning[200],
            paddingHorizontal: SPACING.xl,
            paddingVertical: SPACING.lg,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Ionicons name="alert-circle" size={20} color={TEACHER_COLORS.warning[600]} />
            <View style={{ flex: 1, marginLeft: SPACING.sm }}>
              <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: TEACHER_COLORS.gray[700], lineHeight: TYPOGRAPHY.fontSize.sm * TYPOGRAPHY.lineHeight.relaxed }}>
                메시지 아이콘을 눌러 수강료 안내 알림장을 보내거나, 하단의 "알림 발송" 버튼을 이용해주세요.
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* 수강료 입력 모달 */}
      <Modal
        visible={paymentModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View
            style={{
              backgroundColor: TEACHER_COLORS.white,
              borderTopLeftRadius: RADIUS['3xl'],
              borderTopRightRadius: RADIUS['3xl'],
              padding: SPACING['2xl'],
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING['2xl'] }}>
              <Text style={{ fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.gray[900] }}>
                수강료 입력
              </Text>
              <TouchableOpacity onPress={() => setPaymentModalVisible(false)}>
                <Ionicons name="close-outline" size={24} color={TEACHER_COLORS.gray[400]} />
              </TouchableOpacity>
            </View>

            <View style={{ marginBottom: SPACING.lg }}>
              <Text style={{ color: TEACHER_COLORS.gray[600], fontWeight: TYPOGRAPHY.fontWeight.medium, fontSize: TYPOGRAPHY.fontSize.sm, marginBottom: SPACING.sm }}>
                학생
              </Text>
              <View
                style={{
                  backgroundColor: TEACHER_COLORS.gray[50],
                  borderRadius: RADIUS.xl,
                  paddingHorizontal: SPACING.lg,
                  paddingVertical: SPACING.md,
                }}
              >
                <Text style={{ color: TEACHER_COLORS.gray[900], fontWeight: TYPOGRAPHY.fontWeight.bold, fontSize: TYPOGRAPHY.fontSize.base }}>
                  {selectedStudentForPayment?.name}
                </Text>
              </View>
            </View>

            <View style={{ marginBottom: SPACING['2xl'] }}>
              <Text style={{ color: TEACHER_COLORS.gray[600], fontWeight: TYPOGRAPHY.fontWeight.medium, fontSize: TYPOGRAPHY.fontSize.sm, marginBottom: SPACING.sm }}>
                금액
              </Text>
              <TextInput
                style={{
                  ...INPUT_STYLES.default,
                  paddingVertical: SPACING.md + 2,
                  fontSize: TYPOGRAPHY.fontSize.base,
                  fontFamily: 'MaruBuri-Regular',
                  color: TEACHER_COLORS.gray[900],
                }}
                placeholder="금액을 입력하세요"
                placeholderTextColor={TEACHER_COLORS.gray[400]}
                value={paymentAmount}
                onChangeText={setPaymentAmount}
                keyboardType="numeric"
              />
            </View>

            <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
              <TouchableOpacity
                onPress={() => setPaymentModalVisible(false)}
                style={{
                  flex: 1,
                  borderRadius: RADIUS.full,
                  paddingVertical: SPACING.lg,
                  backgroundColor: TEACHER_COLORS.gray[100],
                }}
                activeOpacity={0.7}
              >
                <Text style={{ color: TEACHER_COLORS.gray[700], fontWeight: TYPOGRAPHY.fontWeight.bold, textAlign: 'center', fontSize: TYPOGRAPHY.fontSize.base }}>
                  취소
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSavePayment}
                style={{
                  flex: 1,
                  borderRadius: RADIUS.full,
                  paddingVertical: SPACING.lg,
                  backgroundColor: TEACHER_COLORS.success[500],
                  ...SHADOWS.md,
                }}
                activeOpacity={0.8}
              >
                <Text style={{ color: TEACHER_COLORS.white, fontWeight: TYPOGRAPHY.fontWeight.bold, textAlign: 'center', fontSize: TYPOGRAPHY.fontSize.base }}>
                  저장
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
