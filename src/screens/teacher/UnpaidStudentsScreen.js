import React, { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl, Linking, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Button, ScreenHeader } from '../../components/common';
import TEACHER_COLORS from '../../styles/teacher_colors';
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
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* 헤더 */}
      <ScreenHeader
        title="미납 학생"
        subtitle={`${unpaidStudents.length}명의 미납 학생`}
      />

      {/* 통계 및 정렬 */}
      <View className="bg-white border-b border-gray-200 px-5 py-3">
        {/* 통계 */}
        <View className="bg-red-50 rounded-xl p-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm text-gray-700">총 미납 학생</Text>
            <Text className="text-lg font-bold text-gray-800">{unpaidStudents.length}명</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-gray-700">총 미납 금액</Text>
            <Text className="text-xl font-bold text-red-600">
              {formatCurrency(totalUnpaid)}
            </Text>
          </View>
        </View>

        {/* 정렬 옵션 */}
        <View className="flex-row mt-3 gap-2">
          <TouchableOpacity
            onPress={() => setSortBy('date')}
            className={`flex-1 py-2 px-3 rounded-lg ${
              sortBy === 'date' ? 'bg-primary' : 'bg-gray-100'
            }`}
            activeOpacity={0.7}
          >
            <Text className={`text-xs font-semibold text-center ${
              sortBy === 'date' ? 'text-white' : 'text-gray-600'
            }`}>
              납부일순
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSortBy('amount')}
            className={`flex-1 py-2 px-3 rounded-lg ${
              sortBy === 'amount' ? 'bg-primary' : 'bg-gray-100'
            }`}
            activeOpacity={0.7}
          >
            <Text className={`text-xs font-semibold text-center ${
              sortBy === 'amount' ? 'text-white' : 'text-gray-600'
            }`}>
              금액순
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSortBy('name')}
            className={`flex-1 py-2 px-3 rounded-lg ${
              sortBy === 'name' ? 'bg-primary' : 'bg-gray-100'
            }`}
            activeOpacity={0.7}
          >
            <Text className={`text-xs font-semibold text-center ${
              sortBy === 'name' ? 'text-white' : 'text-gray-600'
            }`}>
              이름순
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 학생 리스트 */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {unpaidStudents.length === 0 ? (
          <View className="py-20 items-center">
            <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="checkmark-circle" size={40} color={TEACHER_COLORS.success[600]} />
            </View>
            <Text className="text-gray-500 text-center">
              미납 학생이 없습니다
            </Text>
          </View>
        ) : (
          <View className="px-5 py-4">
            {unpaidStudents.map((student, idx) => (
              <View
                key={student.id}
                className="bg-white rounded-xl p-4 mb-3"
              >
                {/* 상단: 학생 정보 */}
                <TouchableOpacity
                  onPress={() => navigation.navigate('StudentDetail', { studentId: student.id })}
                  activeOpacity={0.7}
                  className="mb-3"
                >
                  <View className="flex-1">
                    {/* 학생 정보 */}
                    <View className="flex-row items-center mb-1">
                      <Text className="text-base font-bold text-gray-800">
                        {student.name}
                      </Text>
                      <View className="rounded-full px-2 py-0.5 ml-2" style={{ backgroundColor: TEACHER_COLORS.purple[100] }}>
                        <Text className="text-xs font-bold text-primary">{student.level}</Text>
                      </View>
                    </View>

                    {/* 마지막 납부일 */}
                    <Text className="text-xs text-gray-600 mb-1">
                      마지막 결제: {student.lastPaymentDate}
                    </Text>

                    {/* 미납 금액 */}
                    <View className="flex-row items-center">
                      <Text className="text-xs text-gray-500">미납 금액: </Text>
                      <Text className="text-xs font-semibold" style={{ color: TEACHER_COLORS.red[600] }}>
                        {formatCurrency(student.unpaidAmount || 280000)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* 납부처리 / 알림보내기 버튼 */}
                <View className="flex-row mb-3 gap-2">
                  <TouchableOpacity
                    onPress={() => handleMarkAsPaid(student)}
                    className="flex-1 rounded-lg px-4 py-2.5"
                    style={{ backgroundColor: TEACHER_COLORS.success[500] }}
                    activeOpacity={0.7}
                  >
                    <Text className="text-sm font-bold text-white text-center">납부처리</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleSendNotice(student)}
                    className="flex-1 rounded-lg px-4 py-2.5"
                    style={{ backgroundColor: TEACHER_COLORS.red[500] }}
                    activeOpacity={0.7}
                  >
                    <Text className="text-sm font-bold text-white text-center">알림보내기</Text>
                  </TouchableOpacity>
                </View>

                {/* 하단: 액션 버튼 */}
                <View className="flex-row gap-2">
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
        <View className="bg-yellow-50 border-t border-yellow-200 px-5 py-4">
          <View className="flex-row items-start">
            <Ionicons name="alert-circle" size={20} color={TEACHER_COLORS.warning[600]} />
            <View className="flex-1 ml-2">
              <Text className="text-sm text-gray-700 leading-5">
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
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-lg font-bold text-gray-900">
                수강료 입력
              </Text>
              <TouchableOpacity onPress={() => setPaymentModalVisible(false)}>
                <Ionicons name="close-outline" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <Text className="text-gray-600 font-medium text-sm mb-2">학생</Text>
              <View className="bg-gray-50 rounded-xl px-4 py-3">
                <Text className="text-gray-900 font-bold text-base">
                  {selectedStudentForPayment?.name}
                </Text>
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-gray-600 font-medium text-sm mb-2">금액</Text>
              <TextInput
                className="rounded-xl px-4 py-3.5 text-base"
                placeholder="금액을 입력하세요"
                value={paymentAmount}
                onChangeText={setPaymentAmount}
                keyboardType="numeric"
                style={{
                  fontFamily: 'MaruBuri-Regular',
                  backgroundColor: '#FAFAFA',
                  borderWidth: 1,
                  borderColor: '#F3F4F6',
                  color: '#111827',
                }}
              />
            </View>

            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setPaymentModalVisible(false)}
                className="flex-1 rounded-full py-4"
                style={{ backgroundColor: '#F9FAFB' }}
                activeOpacity={0.7}
              >
                <Text className="text-gray-700 font-bold text-center text-base">취소</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSavePayment}
                className="flex-1 rounded-full py-4"
                style={{ backgroundColor: TEACHER_COLORS.success[500] }}
                activeOpacity={0.8}
              >
                <Text className="text-white font-bold text-center text-base">저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
