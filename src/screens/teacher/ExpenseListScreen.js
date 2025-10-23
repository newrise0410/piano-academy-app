import { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, ScreenHeader } from '../../components/common';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency } from '../../utils';
import {
  getExpensesByTeacher,
  deleteExpense,
  EXPENSE_CATEGORIES
} from '../../services/expenseService';

export default function ExpenseListScreen({ route, navigation }) {
  const { settlementPeriod: settlementPeriodParam } = route.params || {};
  const { user } = useAuthStore();
  const [expenses, setExpenses] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Convert ISO string dates to Date objects
  const settlementPeriod = useMemo(() => {
    if (!settlementPeriodParam) return null;
    return {
      startDate: new Date(settlementPeriodParam.startDate),
      endDate: new Date(settlementPeriodParam.endDate),
    };
  }, [settlementPeriodParam]);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    if (!user?.uid) return;

    setLoading(true);
    const result = await getExpensesByTeacher(user.uid);

    if (result.success) {
      // 정산 기간으로 필터링
      const filteredExpenses = result.data.filter(exp => {
        if (!exp.date || !settlementPeriod) return false;
        const expDate = exp.date instanceof Date ? exp.date : new Date(exp.date);
        return expDate >= settlementPeriod.startDate && expDate <= settlementPeriod.endDate;
      });

      setExpenses(filteredExpenses);
    }
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadExpenses();
    setRefreshing(false);
  };

  // 카테고리별로 그룹화
  const groupedExpenses = useMemo(() => {
    const groups = {};
    expenses.forEach(exp => {
      const cat = exp.category || 'OTHER';
      if (!groups[cat]) {
        groups[cat] = { total: 0, count: 0, items: [] };
      }
      groups[cat].total += exp.amount || 0;
      groups[cat].count += 1;
      groups[cat].items.push(exp);
    });

    // 날짜순 정렬
    Object.values(groups).forEach(group => {
      group.items.sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date : new Date(a.date);
        const dateB = b.date instanceof Date ? b.date : new Date(b.date);
        return dateB - dateA; // 최신순
      });
    });

    return groups;
  }, [expenses]);

  const totalExpense = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

  const handleEditExpense = (expense) => {
    navigation.navigate('FinanceManagement', {
      screen: 'FinanceManagementMain',
      params: { editExpense: expense }
    });
  };

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
              loadExpenses();
              Alert.alert('완료', '지출이 삭제되었습니다.');
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
      <ScreenHeader title="지출 내역" onBackPress={() => navigation.goBack()} />

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* 헤더 통계 */}
        <View className="px-6 pt-4 pb-6">
          <View className="mb-2">
            <Text className="text-gray-500 text-sm">총 지출</Text>
          </View>
          <View className="flex-row items-end mb-3">
            <Text className="text-gray-900 font-black" style={{ fontSize: 48, lineHeight: 52 }}>
              {formatCurrency(totalExpense)}
            </Text>
            <Text className="text-gray-900 font-black text-2xl mb-2 ml-1">원</Text>
          </View>
          <View className="flex-row items-center">
            <View className="rounded-full px-3 py-1 mr-2" style={{ backgroundColor: '#FEF2F2' }}>
              <Text className="text-red-600 text-xs font-bold">{expenses.length}건</Text>
            </View>
            <Text className="text-gray-400 text-xs">
              {settlementPeriod?.startDate.getMonth() + 1}/{settlementPeriod?.startDate.getDate()} ~ {settlementPeriod?.endDate.getMonth() + 1}/{settlementPeriod?.endDate.getDate()}
            </Text>
          </View>
        </View>

        {/* 지출 내역 리스트 */}
        <View className="px-6">
          {Object.entries(groupedExpenses).length > 0 ? (
            Object.entries(groupedExpenses).map(([category, data]) => (
              <View key={category} className="mb-5">
                {/* 카테고리 헤더 */}
                <View className="flex-row items-center justify-between mb-3 px-2">
                  <Text className="text-gray-900 font-bold text-sm">
                    {EXPENSE_CATEGORIES[category] || '기타'}
                  </Text>
                  <Text className="text-gray-500 text-xs">
                    {data.count}건 · {formatCurrency(data.total)}원
                  </Text>
                </View>

                {/* 카테고리별 항목들 */}
                {data.items.map((expense, index) => (
                  <View
                    key={expense.id || index}
                    className="rounded-2xl p-4 mb-3"
                    style={{
                      backgroundColor: 'white',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 3,
                      elevation: 2,
                    }}
                  >
                    <View className="flex-row items-start justify-between mb-3">
                      <View className="flex-1 mr-3">
                        <Text className="text-gray-900 font-bold text-base mb-1">
                          {expense.description}
                        </Text>
                        <Text className="text-gray-400 text-xs">
                          {expense.date instanceof Date
                            ? expense.date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
                            : new Date(expense.date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-gray-900 font-black text-xl mb-1">
                          -{formatCurrency(expense.amount)}
                        </Text>
                      </View>
                    </View>

                    {/* 편집 버튼 */}
                    <View className="flex-row items-center pt-3 border-t border-gray-50">
                      <TouchableOpacity
                        onPress={() => handleEditExpense(expense)}
                        className="flex-1 rounded-full py-2 mr-2"
                        style={{ backgroundColor: '#F9FAFB' }}
                        activeOpacity={0.7}
                      >
                        <View className="flex-row items-center justify-center">
                          <Ionicons name="pencil-outline" size={14} color="#6B7280" />
                          <Text className="text-gray-600 font-medium text-xs ml-1.5">수정</Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteExpense(expense.id)}
                        className="flex-1 rounded-full py-2 ml-2"
                        style={{ backgroundColor: '#FEF2F2' }}
                        activeOpacity={0.7}
                      >
                        <View className="flex-row items-center justify-center">
                          <Ionicons name="trash-outline" size={14} color="#EF4444" />
                          <Text className="text-red-600 font-medium text-xs ml-1.5">삭제</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            ))
          ) : (
            <View className="items-center py-32">
              <View className="w-16 h-16 rounded-full items-center justify-center mb-3"
                style={{ backgroundColor: '#F9FAFB' }}>
                <Ionicons name="wallet-outline" size={32} color="#D1D5DB" />
              </View>
              <Text className="text-gray-900 font-bold text-base mb-1">지출 내역이 없습니다</Text>
              <Text className="text-gray-400 text-sm">
                정산 기간 내 지출 내역이 없습니다
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
