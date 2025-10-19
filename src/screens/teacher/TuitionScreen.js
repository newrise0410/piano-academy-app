import { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Text from '../../components/common/Text';
import { mockStudents } from '../../data/mockStudents';
import { GRADIENTS, OVERLAY_COLORS } from '../../styles/colors';

export default function TuitionScreen() {
  const [editingPrice, setEditingPrice] = useState(null);
  const [prices, setPrices] = useState({
    count4: '150,000',
    count8: '280,000',
    count12: '400,000',
    period1: '200,000', // 1개월
    period3: '550,000', // 3개월
    period6: '1,000,000', // 6개월
  });

  // 수강권 표시 헬퍼 함수
  const getTicketDisplay = (student) => {
    if (student.ticketType === 'count') {
      return `${student.ticketCount}회 남음`;
    } else if (student.ticketType === 'period') {
      return `${student.ticketPeriod.start} ~ ${student.ticketPeriod.end}`;
    }
    return '-';
  };

  // 실제 데이터 기반 통계 계산
  const stats = useMemo(() => {
    const unpaidCount = mockStudents.filter(s => s.unpaid).length;
    const oneSessionCount = mockStudents.filter(s => s.ticketType === 'count' && s.ticketCount === 1).length;
    const twoSessionCount = mockStudents.filter(s => s.ticketType === 'count' && s.ticketCount === 2).length;
    const normalCount = mockStudents.length - unpaidCount - oneSessionCount - twoSessionCount;

    return {
      paid: normalCount,
      lastWeek: twoSessionCount,
      unpaid: unpaidCount,
    };
  }, []);

  // 미납자 목록 (실제 데이터)
  const unpaidStudents = useMemo(() => {
    return mockStudents
      .filter(s => s.unpaid)
      .map(s => ({
        id: s.id,
        name: s.name,
        deadline: '미결제',
        level: s.level,
        ticket: getTicketDisplay(s),
      }));
  }, []);

  // 잔여 1회 학생 (실제 데이터)
  const oneSessionLeft = useMemo(() => {
    return mockStudents
      .filter(s => s.ticketType === 'count' && s.ticketCount === 1)
      .map(s => ({
        id: s.id,
        name: s.name,
        sessions: getTicketDisplay(s),
        level: s.level,
      }));
  }, []);

  // 월별 수입 계산 (실제 데이터 기반)
  const monthlyRevenue = useMemo(() => {
    // 4회권 기준으로 계산 (미납자 제외)
    const paidStudents = mockStudents.filter(s => !s.unpaid);
    const pricePerStudent = 150000; // 4회권 기준
    const total = paidStudents.length * pricePerStudent;

    return {
      total,
      students: paidStudents.length,
      sessions: 4,
    };
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* 타이틀 */}
        <View className="px-5 pt-5 pb-3">
          <Text className="text-lg text-gray-600">수강료 관리 화면</Text>
        </View>

        {/* 이번 달 수강권 현황 - 그라디언트 배경 */}
        <View className="px-5 mb-4">
          <LinearGradient
            colors={GRADIENTS.tuitionHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              borderRadius: 16,
              padding: 20,
            }}
          >
            <Text className="text-white text-lg font-bold mb-4">이번 달 수강권 현황</Text>

            <View className="flex-row justify-between">
              {/* 정상 */}
              <View
                style={{ backgroundColor: OVERLAY_COLORS.whiteLight }}
                className="rounded-xl p-4 flex-1 mr-2 items-center justify-center"
              >
                <Text className="text-white text-3xl font-bold mb-1">{stats.paid}명</Text>
                <Text className="text-white text-xs opacity-80">정상 (2회↑)</Text>
              </View>

              {/* 주의 */}
              <View
                style={{ backgroundColor: OVERLAY_COLORS.whiteLight }}
                className="rounded-xl p-4 flex-1 mx-1 items-center justify-center"
              >
                <Text className="text-white text-3xl font-bold mb-1">{stats.lastWeek}명</Text>
                <Text className="text-white text-xs opacity-80">주의 (1회)</Text>
              </View>

              {/* 미납 */}
              <View className="bg-red-500 rounded-xl p-4 flex-1 ml-2 items-center justify-center">
                <Text className="text-white text-3xl font-bold mb-1">{stats.unpaid}명</Text>
                <Text className="text-white text-xs">미납 ⚠</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* 수강권 미납 (3명) */}
        <View className="px-5 mb-4">
          <View className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <View className="flex-row items-center mb-3">
              <Text className="text-xl mr-2">⚠️</Text>
              <Text className="text-red-600 font-bold">수강권 미납 ({unpaidStudents.length}명)</Text>
            </View>

            {unpaidStudents.map((student, index) => (
              <View
                key={student.id}
                className={`bg-white rounded-xl p-4 flex-row items-center justify-between ${
                  index < unpaidStudents.length - 1 ? 'mb-2' : ''
                }`}
              >
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <Text className="text-base font-bold text-gray-800">{student.name}</Text>
                    <View className="bg-purple-100 rounded-full px-2 py-0.5 ml-2">
                      <Text className="text-xs font-bold text-primary">{student.level}</Text>
                    </View>
                  </View>
                  <Text className="text-xs text-gray-600 mb-1">
                    마지막 결제: {student.deadline}
                  </Text>
                  <View className="flex-row items-center">
                    <Text className="text-xs text-gray-500">수강권: </Text>
                    <Text className="text-xs font-semibold text-red-600">{student.ticket}</Text>
                  </View>
                </View>
                <TouchableOpacity className="bg-red-500 rounded-lg px-4 py-2.5">
                  <Text className="text-sm font-bold text-white">알림</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* 잔여 1회 (5명) */}
        <View className="px-5 mb-4">
          <View className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
            <View className="flex-row items-center mb-3">
              <Text className="text-xl mr-2">⚡</Text>
              <Text className="text-orange-600 font-bold">잔여 1회 ({oneSessionLeft.length}명)</Text>
            </View>

            {oneSessionLeft.map((student, index) => (
              <View
                key={student.id}
                className={`bg-white rounded-xl p-4 flex-row items-center justify-between ${
                  index < oneSessionLeft.length - 1 ? 'mb-2' : ''
                }`}
              >
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <Text className="text-base font-bold text-gray-800">{student.name}</Text>
                    <View className="bg-purple-100 rounded-full px-2 py-0.5 ml-2">
                      <Text className="text-xs font-bold text-primary">{student.level}</Text>
                    </View>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-xs text-gray-500">수강권: </Text>
                    <Text className="text-sm text-orange-600 font-bold">⚡ {student.sessions}</Text>
                  </View>
                </View>
                <TouchableOpacity className="bg-orange-500 rounded-lg px-4 py-2.5">
                  <Text className="text-sm font-bold text-white">알림</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* 수강권 가격 설정 */}
        <View className="px-5 mb-4">
          <View className="bg-white rounded-2xl p-5 border border-gray-200">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <Text className="text-xl mr-2">💰</Text>
                <Text className="text-gray-800 font-bold text-base">수강권 가격표</Text>
              </View>
              <TouchableOpacity
                className="bg-primary rounded-lg px-3 py-2"
                onPress={() => setEditingPrice(editingPrice ? null : 'editing')}
              >
                <Text className="text-xs font-bold text-white">
                  {editingPrice ? '완료' : '가격 수정'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* 회차권 */}
            <View className="mb-4">
              <Text className="text-sm font-bold text-gray-700 mb-3">회차권</Text>
              <View className="space-y-2">
                {[
                  { key: 'count4', label: '4회권', desc: '한달 기준' },
                  { key: 'count8', label: '8회권', desc: '두달 기준' },
                  { key: 'count12', label: '12회권', desc: '세달 기준' },
                ].map((item) => (
                  <View key={item.key} className="flex-row items-center justify-between bg-gray-50 rounded-xl p-3 mb-2">
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-gray-800">{item.label}</Text>
                      <Text className="text-xs text-gray-500 mt-0.5">{item.desc}</Text>
                    </View>
                    {editingPrice ? (
                      <View className="flex-row items-center">
                        <TextInput
                          className="bg-white rounded-lg px-3 py-2 text-sm font-bold text-gray-800 text-right border border-gray-200"
                          value={prices[item.key]}
                          onChangeText={(text) => setPrices({ ...prices, [item.key]: text })}
                          keyboardType="numeric"
                          style={{ fontFamily: 'MaruBuri-Regular', width: 100 }}
                        />
                        <Text className="text-sm text-gray-600 ml-2">원</Text>
                      </View>
                    ) : (
                      <Text className="text-base font-bold text-primary">{prices[item.key]}원</Text>
                    )}
                  </View>
                ))}
              </View>
            </View>

            {/* 기간 정액권 */}
            <View>
              <Text className="text-sm font-bold text-gray-700 mb-3">기간 정액권</Text>
              <View className="space-y-2">
                {[
                  { key: 'period1', label: '1개월', desc: '무제한 수업' },
                  { key: 'period3', label: '3개월', desc: '무제한 수업' },
                  { key: 'period6', label: '6개월', desc: '무제한 수업' },
                ].map((item) => (
                  <View key={item.key} className="flex-row items-center justify-between bg-purple-50 rounded-xl p-3 mb-2">
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-gray-800">{item.label}</Text>
                      <Text className="text-xs text-gray-500 mt-0.5">{item.desc}</Text>
                    </View>
                    {editingPrice ? (
                      <View className="flex-row items-center">
                        <TextInput
                          className="bg-white rounded-lg px-3 py-2 text-sm font-bold text-gray-800 text-right border border-gray-200"
                          value={prices[item.key]}
                          onChangeText={(text) => setPrices({ ...prices, [item.key]: text })}
                          keyboardType="numeric"
                          style={{ fontFamily: 'MaruBuri-Regular', width: 100 }}
                        />
                        <Text className="text-sm text-gray-600 ml-2">원</Text>
                      </View>
                    ) : (
                      <Text className="text-base font-bold text-primary">{prices[item.key]}원</Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* 이번 달 수입 */}
        <View className="px-5 mb-6">
          <View className="bg-white rounded-2xl p-5 border border-gray-200">
            <View className="flex-row items-center mb-4">
              <Text className="text-xl mr-2">📊</Text>
              <Text className="text-gray-800 font-bold text-base">이번 달 수입</Text>
            </View>

            <Text className="text-4xl font-bold text-primary mb-2">
              {monthlyRevenue.total.toLocaleString()}원
            </Text>
            <Text className="text-sm text-gray-600">
              {monthlyRevenue.students}건 (4회권 기준)
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}