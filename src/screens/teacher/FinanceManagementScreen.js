import { useState, useEffect, useMemo, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Text, ScreenHeader } from '../../components/common';
import { useAuthStore } from '../../store/authStore';
import { usePaymentStore } from '../../store';
import { formatCurrency } from '../../utils';
import {
  addExpense,
  updateExpense,
  deleteExpense,
  getExpensesByTeacher,
  EXPENSE_CATEGORIES
} from '../../services/expenseService';

export default function FinanceManagementScreen({ navigation }) {
  const { user } = useAuthStore();
  const { payments, fetchAllPayments } = usePaymentStore();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 지출 추가/수정 모달
  const [expenseModalVisible, setExpenseModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [expenseForm, setExpenseForm] = useState({
    category: 'INSTRUMENT',
    amount: '',
    description: '',
    date: new Date(),
  });

  // 수입 추가/수정 모달
  const [incomeModalVisible, setIncomeModalVisible] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [incomeForm, setIncomeForm] = useState({
    amount: '',
    description: '',
    date: new Date(),
  });

  // 현재 월
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);

  // 수강권 가격표 상태
  const [priceExpanded, setPriceExpanded] = useState(false);
  const [editingPrice, setEditingPrice] = useState(null);
  const [prices, setPrices] = useState({
    count4: '150,000',
    count8: '280,000',
    count12: '400,000',
    period1: '200,000',
    period3: '550,000',
    period6: '1,000,000',
  });

  // 캘린더 상태
  const [calendarExpanded, setCalendarExpanded] = useState(true);

  // 정산일 설정 (1~31일)
  const [settlementDay, setSettlementDay] = useState(10); // 기본값 10일
  const [settlementDayModalVisible, setSettlementDayModalVisible] = useState(false);


  // 정산 기간 계산 (정산일 기준)
  const settlementPeriod = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDate();

    let startDate, endDate;

    // 오늘이 선택된 달이고 정산일 이후라면 다음 정산 기간 사용
    if (selectedYear === today.getFullYear() &&
        selectedMonth === today.getMonth() + 1 &&
        currentDay >= settlementDay) {
      // 다음 정산 기간: 이번 달 정산일 ~ 다음 달 정산일 전날
      startDate = new Date(selectedYear, selectedMonth - 1, settlementDay);
      endDate = new Date(selectedYear, selectedMonth, settlementDay);
      endDate.setDate(endDate.getDate() - 1);
    } else {
      // 이전 정산 기간: 지난 달 정산일 ~ 이번 달 정산일 전날
      startDate = new Date(selectedYear, selectedMonth - 2, settlementDay);
      endDate = new Date(selectedYear, selectedMonth - 1, settlementDay);
      endDate.setDate(endDate.getDate() - 1);
    }

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    return { startDate, endDate };
  }, [selectedYear, selectedMonth, settlementDay]);

  // 월별 수입 계산 (정산 기간 기준)
  const monthlyIncome = useMemo(() => {
    // 정산 기간 내 결제 데이터만 필터링
    const settledPayments = payments.filter(payment => {
      if (!payment.date) return false;
      const paymentDate = payment.date instanceof Date ? payment.date : new Date(payment.date);

      // 정산 기간 내에 있고, paid 상태인 결제만 포함
      return paymentDate >= settlementPeriod.startDate &&
             paymentDate <= settlementPeriod.endDate &&
             payment.status === 'paid';
    });

    // 총 수입 계산
    const total = settledPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

    return total;
  }, [payments, settlementPeriod]);

  // 캘린더 날짜 생성
  const calendarDays = useMemo(() => {
    const firstDay = new Date(selectedYear, selectedMonth - 1, 1);
    const lastDay = new Date(selectedYear, selectedMonth, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0 = 일요일

    const days = [];

    // 앞 빈칸 추가
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ date: null, isEmpty: true });
    }

    // 날짜 추가
    for (let i = 1; i <= daysInMonth; i++) {
      const dateObj = new Date(selectedYear, selectedMonth - 1, i);

      // 해당 날짜의 지출 찾기
      const dayExpenses = expenses.filter(exp => {
        if (!exp.date) return false;
        const expDate = exp.date instanceof Date ? exp.date : new Date(exp.date);
        return expDate.getFullYear() === selectedYear &&
               expDate.getMonth() + 1 === selectedMonth &&
               expDate.getDate() === i;
      });

      const dayExpenseTotal = dayExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

      // 해당 날짜의 수입 찾기
      const dayIncomes = payments.filter(payment => {
        if (!payment.date || payment.status !== 'paid') return false;
        const paymentDate = payment.date instanceof Date ? payment.date : new Date(payment.date);
        return paymentDate.getFullYear() === selectedYear &&
               paymentDate.getMonth() + 1 === selectedMonth &&
               paymentDate.getDate() === i;
      });

      const dayIncomeTotal = dayIncomes.reduce((sum, payment) => sum + (payment.amount || 0), 0);

      days.push({
        date: i,
        dateObj,
        isEmpty: false,
        hasExpense: dayExpenses.length > 0,
        expenseTotal: dayExpenseTotal,
        hasIncome: dayIncomes.length > 0,
        incomeTotal: dayIncomeTotal,
      });
    }

    return days;
  }, [selectedYear, selectedMonth, expenses, payments]);

  // 데이터 로드 (정산 기간 기준)
  const loadData = useCallback(async () => {
    if (!user?.uid) return;

    setLoading(true);

    // 전체 지출 데이터 가져오기
    const result = await getExpensesByTeacher(user.uid);

    if (result.success) {
      // 정산 기간으로 필터링
      const filteredExpenses = result.data.filter(exp => {
        if (!exp.date) return false;
        const expDate = exp.date instanceof Date ? exp.date : new Date(exp.date);
        return expDate >= settlementPeriod.startDate && expDate <= settlementPeriod.endDate;
      });

      setExpenses(filteredExpenses);
    }
    setLoading(false);
  }, [user?.uid, settlementPeriod]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 화면 포커스될 때마다 데이터 새로고침
  useFocusEffect(
    useCallback(() => {
      loadData();
      fetchAllPayments();
    }, [loadData, fetchAllPayments])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    await fetchAllPayments();
    setRefreshing(false);
  };

  // 지출 통계
  const stats = useMemo(() => {
    const totalExpense = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const categoryStats = {};

    expenses.forEach(exp => {
      const cat = exp.category || 'OTHER';
      if (!categoryStats[cat]) {
        categoryStats[cat] = { total: 0, count: 0, items: [] };
      }
      categoryStats[cat].total += exp.amount || 0;
      categoryStats[cat].count += 1;
      categoryStats[cat].items.push(exp);
    });

    return {
      totalExpense,
      count: expenses.length,
      categoryStats,
    };
  }, [expenses]);

  // 지출 추가
  const handleAddExpense = () => {
    setEditingExpense(null);
    setExpenseForm({
      category: 'INSTRUMENT',
      amount: '',
      description: '',
      date: new Date(),
    });
    setExpenseModalVisible(true);
  };

  // 수입 추가
  const handleAddIncome = () => {
    setEditingIncome(null);
    setIncomeForm({
      amount: '',
      description: '',
      date: new Date(),
    });
    setIncomeModalVisible(true);
  };

  // 지출 저장
  const handleSaveExpense = async () => {
    if (!expenseForm.amount || !expenseForm.description) {
      Alert.alert('입력 오류', '금액과 설명을 모두 입력해주세요.');
      return;
    }

    const expenseData = {
      teacherId: user.uid,
      category: expenseForm.category,
      amount: parseInt(expenseForm.amount.replace(/,/g, '')),
      description: expenseForm.description,
      date: expenseForm.date,
    };

    let result;
    if (editingExpense) {
      result = await updateExpense(editingExpense.id, expenseData);
    } else {
      result = await addExpense(expenseData);
    }

    if (result.success) {
      Alert.alert('성공', editingExpense ? '지출이 수정되었습니다.' : '지출이 추가되었습니다.');
      setExpenseModalVisible(false);
      loadData();
    } else {
      Alert.alert('오류', result.error || '저장에 실패했습니다.');
    }
  };

  // 지출 삭제
  const handleDeleteExpense = async (expenseId) => {
    Alert.alert(
      '지출 삭제',
      '이 지출 내역을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteExpense(expenseId);
            if (result.success) {
              loadData();
            } else {
              Alert.alert('오류', result.error || '삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#FAFAFA' }}>
      <ScreenHeader title="재정 관리" onBackPress={() => navigation.goBack()} />

      <ScrollView className="flex-1">
        {/* 월 선택 & 정산일 설정 */}
        <View className="px-6 py-4" style={{ backgroundColor: 'white' }}>
          <View className="flex-row items-center justify-between mb-2">
            <TouchableOpacity
              onPress={() => {
                if (selectedMonth === 1) {
                  setSelectedYear(selectedYear - 1);
                  setSelectedMonth(12);
                } else {
                  setSelectedMonth(selectedMonth - 1);
                }
              }}
              className="p-2"
            >
              <Ionicons name="chevron-back" size={24} color="#6B7280" />
            </TouchableOpacity>

            <Text className="text-gray-900 font-black text-xl">
              {selectedYear}년 {selectedMonth}월
            </Text>

            <TouchableOpacity
              onPress={() => {
                if (selectedMonth === 12) {
                  setSelectedYear(selectedYear + 1);
                  setSelectedMonth(1);
                } else {
                  setSelectedMonth(selectedMonth + 1);
                }
              }}
              className="p-2"
            >
              <Ionicons name="chevron-forward" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* 정산 기간 표시 */}
          <View className="items-center">
            <TouchableOpacity
              onPress={() => setSettlementDayModalVisible(true)}
              activeOpacity={0.7}
              className="flex-row items-center rounded-full px-4 py-2"
              style={{ backgroundColor: '#F9FAFB' }}
            >
              <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
              <Text className="text-gray-500 text-xs ml-1.5">
                {settlementPeriod.startDate.getMonth() + 1}/{settlementPeriod.startDate.getDate()} ~ {settlementPeriod.endDate.getMonth() + 1}/{settlementPeriod.endDate.getDate()}
              </Text>
              <Text className="text-gray-400 text-xs ml-2">
                (매월 {settlementDay}일)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 재정 통계 */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-gray-500 text-sm mb-2">순이익</Text>
          <View className="flex-row items-end mb-4">
            <Text className="text-gray-900 font-black" style={{ fontSize: 48, lineHeight: 52 }}>
              {formatCurrency(Math.abs(monthlyIncome - stats.totalExpense))}
            </Text>
          </View>
        </View>

        {/* 수입/지출 카드 */}
        <View className="px-6 pb-6">
          <View className="flex-row">
            {/* 수입 */}
            <TouchableOpacity
              onPress={() => navigation.navigate('IncomeList', {
                settlementPeriod: {
                  startDate: settlementPeriod.startDate.toISOString(),
                  endDate: settlementPeriod.endDate.toISOString(),
                }
              })}
              activeOpacity={0.7}
              className="flex-1 mr-2 rounded-2xl p-4"
              style={{
                backgroundColor: 'white',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 3,
                elevation: 2,
              }}
            >
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-gray-600 text-xs font-medium">수입</Text>
                <Ionicons name="chevron-forward" size={14} color="#D1D5DB" />
              </View>
              <Text className="text-gray-900 font-black text-xl">
                {formatCurrency(monthlyIncome)}
              </Text>
            </TouchableOpacity>

            {/* 지출 */}
            <TouchableOpacity
              onPress={() => navigation.navigate('ExpenseList', {
                settlementPeriod: {
                  startDate: settlementPeriod.startDate.toISOString(),
                  endDate: settlementPeriod.endDate.toISOString(),
                }
              })}
              activeOpacity={0.7}
              className="flex-1 ml-2 rounded-2xl p-4"
              style={{
                backgroundColor: 'white',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 3,
                elevation: 2,
              }}
            >
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-gray-600 text-xs font-medium">지출</Text>
                <Ionicons name="chevron-forward" size={14} color="#D1D5DB" />
              </View>
              <Text className="text-gray-900 font-black text-xl">
                {formatCurrency(stats.totalExpense)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 수입/지출 추가 버튼 */}
        <View className="px-6 mb-4">
          <View className="flex-row">
            {/* 수입 추가 */}
            <TouchableOpacity
              onPress={handleAddIncome}
              activeOpacity={0.8}
              style={{ backgroundColor: '#3B82F6' }}
              className="flex-1 rounded-3xl py-4 flex-row items-center justify-center mr-2"
            >
              <Ionicons name="add-circle" size={24} color="white" />
              <Text className="text-white font-bold text-base ml-2">수입 추가</Text>
            </TouchableOpacity>

            {/* 지출 추가 */}
            <TouchableOpacity
              onPress={handleAddExpense}
              activeOpacity={0.8}
              style={{ backgroundColor: '#EF4444' }}
              className="flex-1 rounded-3xl py-4 flex-row items-center justify-center ml-2"
            >
              <Ionicons name="add-circle" size={24} color="white" />
              <Text className="text-white font-bold text-base ml-2">지출 추가</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 수입/지출 캘린더 */}
        <View className="px-2 mb-6">
          <TouchableOpacity
            onPress={() => setCalendarExpanded(!calendarExpanded)}
            activeOpacity={0.7}
            className="flex-row items-center justify-between mb-3 px-2"
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: '#F9FAFB' }}>
                <Ionicons name="calendar-outline" size={16} color="#6B7280" />
              </View>
              <Text className="text-gray-900 font-bold text-base">수입/지출 캘린더</Text>
            </View>
            <Ionicons
              name={calendarExpanded ? "chevron-up" : "chevron-down"}
              size={20}
              color="#9CA3AF"
            />
          </TouchableOpacity>

          {calendarExpanded && (
            <View
              className="rounded-2xl p-2"
              style={{
                backgroundColor: 'white',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 3,
                elevation: 2,
              }}
            >
              {/* 요일 헤더 */}
              <View className="flex-row mb-1">
                {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                  <View key={index} className="flex-1 items-center py-1">
                    <Text className="text-xs font-medium text-gray-500">
                      {day}
                    </Text>
                  </View>
                ))}
              </View>

              {/* 날짜 그리드 */}
              <View className="flex-row flex-wrap">
                {calendarDays.map((day, index) => {
                  const isToday = day.dateObj &&
                    day.dateObj.toDateString() === new Date().toDateString();

                  if (day.isEmpty) {
                    return <View key={`empty-${index}`} className="w-[14.28%] px-0.5" />;
                  }

                  return (
                    <View key={index} className="w-[14.28%] px-0.5">
                      <View
                        className="rounded-lg p-0.5"
                        style={{
                          backgroundColor: isToday ? '#F9FAFB' : 'transparent',
                          minHeight: 60,
                        }}
                      >
                        <Text className="text-center font-medium text-xs mb-0.5 text-gray-900">
                          {day.date}
                        </Text>

                        {/* 수입/지출 금액 표시 */}
                        <View className="items-center px-0.5">
                          {day.hasIncome && (
                            <Text
                              numberOfLines={1}
                              adjustsFontSizeToFit={true}
                              style={{ fontSize: 8, color: '#3B82F6', lineHeight: 11 }}
                            >
                              +{formatCurrency(day.incomeTotal)}
                            </Text>
                          )}
                          {day.hasExpense && (
                            <Text
                              numberOfLines={1}
                              adjustsFontSizeToFit={true}
                              style={{ fontSize: 8, color: '#EF4444', lineHeight: 11 }}
                            >
                              -{formatCurrency(day.expenseTotal)}
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* 범례 */}
              <View className="flex-row items-center justify-center mt-3 pt-3 border-t border-gray-100">
                <View className="flex-row items-center mr-4">
                  <View className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: '#3B82F6' }} />
                  <Text className="text-gray-500 text-xs">수입</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: '#EF4444' }} />
                  <Text className="text-gray-500 text-xs">지출</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* 수강권 가격표 */}
        <View className="px-6 mb-6">
          <TouchableOpacity
            onPress={() => setPriceExpanded(!priceExpanded)}
            activeOpacity={0.7}
            className="flex-row items-center justify-between mb-3"
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: '#F9FAFB' }}>
                <Ionicons name="pricetag-outline" size={16} color="#6B7280" />
              </View>
              <Text className="text-gray-900 font-bold text-base">수강권 가격표</Text>
            </View>
            <Ionicons
              name={priceExpanded ? "chevron-up" : "chevron-down"}
              size={20}
              color="#9CA3AF"
            />
          </TouchableOpacity>

          {priceExpanded && (
            <View
              className="rounded-2xl p-4"
              style={{
                backgroundColor: 'white',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 3,
                elevation: 2,
              }}
            >
              <View className="flex-row items-center justify-end mb-4">
                <TouchableOpacity
                  style={{ backgroundColor: '#F9FAFB' }}
                  className="rounded-full px-4 py-2"
                  onPress={() => setEditingPrice(editingPrice ? null : 'editing')}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center">
                    <Ionicons
                      name={editingPrice ? "checkmark-outline" : "pencil-outline"}
                      size={14}
                      color="#6B7280"
                    />
                    <Text className="text-gray-600 text-xs font-medium ml-1.5">
                      {editingPrice ? '완료' : '수정'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* 회차권 */}
              <View className="mb-5">
                <Text className="text-gray-900 font-bold text-sm mb-3">회차권</Text>
                <View className="space-y-2">
                  {[
                    { key: 'count4', label: '4회권', desc: '한달 기준' },
                    { key: 'count8', label: '8회권', desc: '두달 기준' },
                    { key: 'count12', label: '12회권', desc: '세달 기준' },
                  ].map((item) => (
                    <View key={item.key} className="flex-row items-center justify-between rounded-xl p-3.5 mb-2"
                      style={{ backgroundColor: '#FAFAFA' }}>
                      <View className="flex-1">
                        <Text className="text-sm font-bold text-gray-900">{item.label}</Text>
                        <Text className="text-xs text-gray-500 mt-0.5">{item.desc}</Text>
                      </View>
                      {editingPrice ? (
                        <View className="flex-row items-center">
                          <TextInput
                            className="rounded-lg px-3 py-2 text-sm font-bold text-gray-900 text-right"
                            value={prices[item.key]}
                            onChangeText={(text) => setPrices({ ...prices, [item.key]: text })}
                            keyboardType="numeric"
                            style={{
                              fontFamily: 'MaruBuri-Regular',
                              width: 100,
                              backgroundColor: 'white',
                              borderWidth: 1,
                              borderColor: '#E5E7EB',
                            }}
                          />
                          <Text className="text-xs text-gray-500 ml-2">원</Text>
                        </View>
                      ) : (
                        <Text className="text-base font-black text-gray-900">{prices[item.key]}원</Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>

              {/* 기간 정액권 */}
              <View>
                <Text className="text-gray-900 font-bold text-sm mb-3">기간 정액권</Text>
                <View className="space-y-2">
                  {[
                    { key: 'period1', label: '1개월', desc: '무제한 수업' },
                    { key: 'period3', label: '3개월', desc: '무제한 수업' },
                    { key: 'period6', label: '6개월', desc: '무제한 수업' },
                  ].map((item) => (
                    <View key={item.key} className="flex-row items-center justify-between rounded-xl p-3.5 mb-2"
                      style={{ backgroundColor: '#FAFAFA' }}>
                      <View className="flex-1">
                        <Text className="text-sm font-bold text-gray-900">{item.label}</Text>
                        <Text className="text-xs text-gray-500 mt-0.5">{item.desc}</Text>
                      </View>
                      {editingPrice ? (
                        <View className="flex-row items-center">
                          <TextInput
                            className="rounded-lg px-3 py-2 text-sm font-bold text-gray-900 text-right"
                            value={prices[item.key]}
                            onChangeText={(text) => setPrices({ ...prices, [item.key]: text })}
                            keyboardType="numeric"
                            style={{
                              fontFamily: 'MaruBuri-Regular',
                              width: 100,
                              backgroundColor: 'white',
                              borderWidth: 1,
                              borderColor: '#E5E7EB',
                            }}
                          />
                          <Text className="text-xs text-gray-500 ml-2">원</Text>
                        </View>
                      ) : (
                        <Text className="text-base font-black text-gray-900">{prices[item.key]}원</Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}
        </View>

        {/* 추가 기능 메뉴 */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: '#F9FAFB' }}>
                <Ionicons name="apps-outline" size={16} color="#6B7280" />
              </View>
              <Text className="text-gray-900 font-bold text-base">추가 기능</Text>
            </View>
          </View>

          <View className="flex-row flex-wrap">
            {/* 통계/리포트 */}
            <TouchableOpacity
              onPress={() => navigation.navigate('PaymentStatistics')}
              activeOpacity={0.7}
              className="bg-white rounded-2xl p-4 mr-2 mb-2"
              style={{
                width: '31%',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 3,
                elevation: 2,
              }}
            >
              <View className="bg-blue-100 rounded-full w-10 h-10 items-center justify-center mb-2">
                <Ionicons name="stats-chart" size={20} color="#3B82F6" />
              </View>
              <Text className="text-gray-900 font-bold text-xs mb-1">통계</Text>
              <Text className="text-gray-500 text-[10px]">리포트</Text>
            </TouchableOpacity>

            {/* 학생별 이력 */}
            <TouchableOpacity
              onPress={() => navigation.navigate('StudentPaymentHistory')}
              activeOpacity={0.7}
              className="bg-white rounded-2xl p-4 mr-2 mb-2"
              style={{
                width: '31%',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 3,
                elevation: 2,
              }}
            >
              <View className="bg-purple-100 rounded-full w-10 h-10 items-center justify-center mb-2">
                <Ionicons name="people" size={20} color="#A855F7" />
              </View>
              <Text className="text-gray-900 font-bold text-xs mb-1">이력</Text>
              <Text className="text-gray-500 text-[10px]">학생별</Text>
            </TouchableOpacity>

            {/* 할인/할증 */}
            <TouchableOpacity
              onPress={() => navigation.navigate('DiscountManagement')}
              activeOpacity={0.7}
              className="bg-white rounded-2xl p-4 mb-2"
              style={{
                width: '31%',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 3,
                elevation: 2,
              }}
            >
              <View className="bg-green-100 rounded-full w-10 h-10 items-center justify-center mb-2">
                <Ionicons name="pricetag" size={20} color="#10B981" />
              </View>
              <Text className="text-gray-900 font-bold text-xs mb-1">할인</Text>
              <Text className="text-gray-500 text-[10px]">할증 관리</Text>
            </TouchableOpacity>

            {/* 영수증/정산서 */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Receipt')}
              activeOpacity={0.7}
              className="bg-white rounded-2xl p-4 mr-2 mb-2"
              style={{
                width: '31%',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 3,
                elevation: 2,
              }}
            >
              <View className="bg-amber-100 rounded-full w-10 h-10 items-center justify-center mb-2">
                <Ionicons name="receipt" size={20} color="#F59E0B" />
              </View>
              <Text className="text-gray-900 font-bold text-xs mb-1">영수증</Text>
              <Text className="text-gray-500 text-[10px]">정산서</Text>
            </TouchableOpacity>

            {/* 환불 처리 */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Refund')}
              activeOpacity={0.7}
              className="bg-white rounded-2xl p-4 mr-2 mb-2"
              style={{
                width: '31%',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 3,
                elevation: 2,
              }}
            >
              <View className="bg-red-100 rounded-full w-10 h-10 items-center justify-center mb-2">
                <Ionicons name="return-down-back" size={20} color="#EF4444" />
              </View>
              <Text className="text-gray-900 font-bold text-xs mb-1">환불</Text>
              <Text className="text-gray-500 text-[10px]">처리</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>

      {/* 지출 추가/수정 모달 */}
      <Modal
        visible={expenseModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setExpenseModalVisible(false)}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-lg font-bold text-gray-900">
                {editingExpense ? '지출 수정' : '지출 추가'}
              </Text>
              <TouchableOpacity onPress={() => setExpenseModalVisible(false)}>
                <Ionicons name="close-outline" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* 카테고리 선택 */}
              <Text className="text-gray-600 font-medium text-xs mb-2">카테고리</Text>
              <View className="flex-row flex-wrap mb-5">
                {Object.entries(EXPENSE_CATEGORIES).map(([key, label]) => (
                  <TouchableOpacity
                    key={key}
                    onPress={() => setExpenseForm({ ...expenseForm, category: key })}
                    className="rounded-full px-3.5 py-2 mr-2 mb-2"
                    style={{
                      backgroundColor: expenseForm.category === key ? '#111827' : '#F9FAFB',
                    }}
                  >
                    <Text
                      className="font-medium text-xs"
                      style={{ color: expenseForm.category === key ? 'white' : '#6B7280' }}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* 금액 */}
              <Text className="text-gray-600 font-medium text-xs mb-2">금액</Text>
              <TextInput
                className="rounded-xl px-4 py-3.5 mb-5 text-base"
                placeholder="0"
                value={expenseForm.amount}
                onChangeText={(text) => setExpenseForm({ ...expenseForm, amount: text })}
                keyboardType="numeric"
                style={{
                  fontFamily: 'MaruBuri-Regular',
                  backgroundColor: '#FAFAFA',
                  borderWidth: 1,
                  borderColor: '#F3F4F6',
                  color: '#111827',
                }}
              />

              {/* 설명 */}
              <Text className="text-gray-600 font-medium text-xs mb-2">설명</Text>
              <TextInput
                className="rounded-xl px-4 py-3.5 mb-6 text-base"
                placeholder="지출 내역 설명"
                value={expenseForm.description}
                onChangeText={(text) => setExpenseForm({ ...expenseForm, description: text })}
                multiline
                numberOfLines={3}
                style={{
                  fontFamily: 'MaruBuri-Regular',
                  textAlignVertical: 'top',
                  backgroundColor: '#FAFAFA',
                  borderWidth: 1,
                  borderColor: '#F3F4F6',
                  color: '#111827',
                }}
              />

              {/* 저장 버튼 */}
              <TouchableOpacity
                onPress={handleSaveExpense}
                className="rounded-full py-4"
                style={{ backgroundColor: '#EF4444' }}
                activeOpacity={0.8}
              >
                <Text className="text-white font-bold text-center text-base">
                  {editingExpense ? '수정하기' : '추가하기'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 수입 추가/수정 모달 */}
      <Modal
        visible={incomeModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIncomeModalVisible(false)}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-lg font-bold text-gray-900">
                {editingIncome ? '수입 수정' : '수입 추가'}
              </Text>
              <TouchableOpacity onPress={() => setIncomeModalVisible(false)}>
                <Ionicons name="close-outline" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* 금액 */}
              <Text className="text-gray-600 font-medium text-xs mb-2">금액</Text>
              <TextInput
                className="rounded-xl px-4 py-3.5 mb-5 text-base"
                placeholder="0"
                value={incomeForm.amount}
                onChangeText={(text) => setIncomeForm({ ...incomeForm, amount: text })}
                keyboardType="numeric"
                style={{
                  fontFamily: 'MaruBuri-Regular',
                  backgroundColor: '#FAFAFA',
                  borderWidth: 1,
                  borderColor: '#F3F4F6',
                  color: '#111827',
                }}
              />

              {/* 설명 */}
              <Text className="text-gray-600 font-medium text-xs mb-2">설명</Text>
              <TextInput
                className="rounded-xl px-4 py-3.5 mb-6 text-base"
                placeholder="수입 내역 설명 (예: 홍길동 4회권)"
                value={incomeForm.description}
                onChangeText={(text) => setIncomeForm({ ...incomeForm, description: text })}
                multiline
                numberOfLines={3}
                style={{
                  fontFamily: 'MaruBuri-Regular',
                  textAlignVertical: 'top',
                  backgroundColor: '#FAFAFA',
                  borderWidth: 1,
                  borderColor: '#F3F4F6',
                  color: '#111827',
                }}
              />

              {/* 저장 버튼 */}
              <TouchableOpacity
                onPress={() => {
                  // 임시: 모달만 닫기 (추후 실제 저장 구현)
                  Alert.alert('알림', '수입 추가 기능은 추후 구현 예정입니다.');
                  setIncomeModalVisible(false);
                }}
                className="rounded-full py-4"
                style={{ backgroundColor: '#3B82F6' }}
                activeOpacity={0.8}
              >
                <Text className="text-white font-bold text-center text-base">
                  {editingIncome ? '수정하기' : '추가하기'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 정산일 설정 모달 */}
      <Modal
        visible={settlementDayModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSettlementDayModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View className="bg-white rounded-3xl p-6 mx-6" style={{ width: '80%', maxWidth: 400 }}>
            <View className="items-center mb-6">
              <View className="w-14 h-14 rounded-full items-center justify-center mb-3"
                style={{ backgroundColor: '#F9FAFB' }}>
                <Ionicons name="calendar-outline" size={24} color="#6B7280" />
              </View>
              <Text className="text-lg font-bold text-gray-900 mb-2">정산일 설정</Text>
              <Text className="text-gray-500 text-xs text-center">
                매월 정산하는 날짜를 설정하세요
              </Text>
            </View>

            {/* 정산일 선택 */}
            <View className="mb-6">
              <View className="flex-row items-center justify-center mb-4">
                <TouchableOpacity
                  onPress={() => setSettlementDay(Math.max(1, settlementDay - 1))}
                  className="rounded-full p-3"
                  style={{ backgroundColor: '#F9FAFB' }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="remove-outline" size={20} color="#6B7280" />
                </TouchableOpacity>

                <View className="mx-6 rounded-2xl px-8 py-3" style={{ backgroundColor: '#FAFAFA' }}>
                  <Text className="text-3xl font-black text-center text-gray-900">
                    {settlementDay}
                  </Text>
                  <Text className="text-gray-500 text-xs text-center mt-0.5">일</Text>
                </View>

                <TouchableOpacity
                  onPress={() => setSettlementDay(Math.min(31, settlementDay + 1))}
                  className="rounded-full p-3"
                  style={{ backgroundColor: '#F9FAFB' }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add-outline" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* 예시 설명 */}
              <View className="p-3.5 rounded-xl" style={{ backgroundColor: '#F9FAFB' }}>
                <Text className="text-gray-600 text-xs text-center leading-5">
                  정산일이 {settlementDay}일이면{'\n'}
                  {selectedMonth === 1 ? 12 : selectedMonth - 1}월 {settlementDay}일 ~ {selectedMonth}월 {settlementDay - 1}일까지가{'\n'}
                  {selectedYear}년 {selectedMonth}월 정산 기간입니다
                </Text>
              </View>
            </View>

            {/* 버튼 */}
            <View className="flex-row">
              <TouchableOpacity
                onPress={() => setSettlementDayModalVisible(false)}
                className="flex-1 rounded-full py-3.5 mr-2"
                style={{ backgroundColor: '#F9FAFB' }}
                activeOpacity={0.7}
              >
                <Text className="text-gray-700 font-bold text-center text-sm">취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setSettlementDayModalVisible(false);
                  // 정산일 변경 시 데이터 다시 로드
                  loadData();
                }}
                className="flex-1 rounded-full py-3.5 ml-2"
                style={{ backgroundColor: '#111827' }}
                activeOpacity={0.8}
              >
                <Text className="text-white font-bold text-center text-sm">확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}
