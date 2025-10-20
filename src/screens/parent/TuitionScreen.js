// src/screens/parent/TuitionScreen.js
import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Text from '../../components/common/Text';
import Card from '../../components/common/Card';
import ProgressBar from '../../components/common/ProgressBar';
import { childData, paymentHistory, ticketPrices } from '../../data/mockParentData';
import PARENT_COLORS, { PARENT_GRADIENTS, PARENT_SEMANTIC_COLORS, PARENT_OVERLAY_COLORS } from '../../styles/parent_colors';

export default function TuitionScreen() {
  const activePayment = paymentHistory.find(p => p.status === 'active');

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 py-4">
          {/* 현재 수강권 */}
          {activePayment && (
            <Card>
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <View
                    className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                    style={{ backgroundColor: PARENT_COLORS.primary[100] }}
                  >
                    <Ionicons
                      name={activePayment.ticketType === 'count' ? 'ticket' : 'calendar'}
                      size={24}
                      color={PARENT_COLORS.primary.DEFAULT}
                    />
                  </View>
                  <View>
                    <Text className="text-gray-500 text-xs">현재 수강권</Text>
                    <Text className="text-gray-800 font-bold text-base">{activePayment.type}</Text>
                  </View>
                </View>
                <View className="px-3 py-1 rounded-full" style={{ backgroundColor: PARENT_COLORS.success[50] }}>
                  <Text className="text-xs font-bold" style={{ color: PARENT_COLORS.success[600] }}>사용중</Text>
                </View>
              </View>

              {activePayment.ticketType === 'count' ? (
                <>
                  <View className="mb-3">
                    <View className="flex-row items-end justify-between mb-2">
                      <Text className="text-gray-500 text-sm">남은 수업</Text>
                      <Text className="text-3xl font-bold" style={{ color: PARENT_COLORS.primary.DEFAULT }}>
                        {childData.ticketCount}회
                      </Text>
                    </View>
                    <ProgressBar
                      progress={(activePayment.used / activePayment.total) * 100}
                      height={12}
                      backgroundColor={PARENT_COLORS.gray[200]}
                      progressColor={PARENT_COLORS.primary.DEFAULT}
                    />
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-xs" style={{ color: PARENT_COLORS.gray[500] }}>
                      {activePayment.used}회 사용 / 총 {activePayment.total}회
                    </Text>
                    <Text className="text-xs font-semibold" style={{ color: PARENT_COLORS.primary.DEFAULT }}>
                      {Math.round((activePayment.total - activePayment.used) / activePayment.total * 100)}% 남음
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <View className="mb-3">
                    <View className="flex-row items-end justify-between mb-2">
                      <Text className="text-gray-500 text-sm">남은 기간</Text>
                      <Text className="text-3xl font-bold" style={{ color: PARENT_COLORS.primary.DEFAULT }}>
                        D-{Math.max(0, Math.ceil((new Date(activePayment.endDate) - new Date()) / (1000 * 60 * 60 * 24)))}
                      </Text>
                    </View>
                    <ProgressBar
                      progress={(activePayment.daysUsed / activePayment.daysTotal) * 100}
                      height={12}
                      backgroundColor={PARENT_COLORS.gray[200]}
                      progressColor={PARENT_COLORS.primary.DEFAULT}
                    />
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-xs" style={{ color: PARENT_COLORS.gray[500] }}>
                      {activePayment.startDate} ~ {activePayment.endDate}
                    </Text>
                    <Text className="text-xs font-semibold" style={{ color: PARENT_COLORS.blue[600] }}>
                      무제한 수업
                    </Text>
                  </View>
                </>
              )}
            </Card>
          )}

          {/* 결제 알림 */}
          <Card className="mt-4">
            <View className="flex-row items-center mb-3">
              <View className="w-8 h-8 rounded-lg items-center justify-center mr-2" style={{ backgroundColor: PARENT_COLORS.warning.DEFAULT }}>
                <Ionicons name="notifications" size={18} color="white" />
              </View>
              <Text className="text-gray-800 font-bold text-lg">결제 안내</Text>
            </View>
            <Text className="text-sm mb-3" style={{ color: PARENT_COLORS.gray[700] }}>
              {activePayment?.ticketType === 'count'
                ? `현재 속도로 약 10일 후 수강권이 소진될 예정입니다.`
                : `기간권이 곧 만료됩니다. 갱신이 필요합니다.`
              }
            </Text>
            <TouchableOpacity
              className="rounded-xl py-3 items-center"
              style={{ backgroundColor: PARENT_COLORS.primary.DEFAULT }}
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-sm">결제하기</Text>
            </TouchableOpacity>
          </Card>

          {/* 결제 내역 */}
          <Card className="mt-4">
            <Text className="text-gray-800 font-bold text-lg mb-4">결제 내역</Text>

            {paymentHistory.map((payment, index) => (
              <View
                key={payment.id}
                className={`py-3 ${index !== paymentHistory.length - 1 ? 'border-b' : ''}`}
                style={{ borderColor: PARENT_COLORS.gray[100] }}
              >
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                      <Text className="text-gray-800 font-bold">{payment.type}</Text>
                      {payment.status === 'active' && (
                        <View className="ml-2 px-2 py-0.5 rounded" style={{ backgroundColor: PARENT_COLORS.success.DEFAULT }}>
                          <Text className="text-white text-xs font-bold">사용중</Text>
                        </View>
                      )}
                      {payment.ticketType === 'period' && payment.proratedDays && (
                        <View className="ml-2 px-2 py-0.5 rounded" style={{ backgroundColor: PARENT_COLORS.warning.DEFAULT }}>
                          <Text className="text-white text-xs font-bold">일할계산</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-sm" style={{ color: PARENT_COLORS.gray[600] }}>{payment.date}</Text>
                    {payment.ticketType === 'period' && payment.proratedDays && (
                      <Text className="text-xs mt-1" style={{ color: PARENT_COLORS.gray[500] }}>
                        {payment.startDate} ~ {payment.endDate} ({payment.proratedDays}일)
                      </Text>
                    )}
                  </View>
                  <View className="items-end">
                    <Text className="text-gray-800 font-bold">{payment.amount.toLocaleString()}원</Text>
                    <Text className="text-xs font-semibold" style={{ color: PARENT_COLORS.gray[500] }}>
                      {payment.method}
                    </Text>
                  </View>
                </View>

                {/* 회차권 진행상황 */}
                {payment.status === 'active' && payment.ticketType === 'count' && (
                  <View>
                    <ProgressBar
                      progress={(payment.used / payment.total) * 100}
                      height={8}
                      backgroundColor={PARENT_COLORS.gray[200]}
                      progressColor={PARENT_COLORS.primary.DEFAULT}
                      className="mb-1"
                    />
                    <Text className="text-xs" style={{ color: PARENT_COLORS.gray[600] }}>
                      {payment.used}/{payment.total} 사용 중
                    </Text>
                  </View>
                )}

                {/* 기간권 진행상황 */}
                {payment.status === 'active' && payment.ticketType === 'period' && (
                  <View>
                    <ProgressBar
                      progress={(payment.daysUsed / payment.daysTotal) * 100}
                      height={8}
                      backgroundColor={PARENT_COLORS.gray[200]}
                      progressColor={PARENT_COLORS.primary.DEFAULT}
                      className="mb-1"
                    />
                    <Text className="text-xs" style={{ color: PARENT_COLORS.gray[600] }}>
                      {payment.daysUsed}/{payment.daysTotal}일 경과
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </Card>

          {/* 수강권 가격표 */}
          <Card className="mt-4 mb-5">
            <Text className="text-gray-800 font-bold text-lg mb-4">수강권 가격표</Text>

            {ticketPrices.map((ticket, index) => (
              <View
                key={index}
                className={`flex-row items-center justify-between p-3 rounded-xl ${index !== ticketPrices.length - 1 ? 'mb-2' : ''} ${ticket.highlighted ? 'border-2' : ''}`}
                style={{
                  backgroundColor: ticket.highlighted ? PARENT_COLORS.primary[50] : PARENT_COLORS.gray[50],
                  borderColor: ticket.highlighted ? PARENT_COLORS.primary.DEFAULT : 'transparent'
                }}
              >
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <Text className="text-gray-800 font-bold">{ticket.type}</Text>
                    {ticket.highlighted && (
                      <View className="ml-2 px-2 py-0.5 rounded" style={{ backgroundColor: PARENT_COLORS.primary.DEFAULT }}>
                        <Text className="text-white text-xs font-bold">추천</Text>
                      </View>
                    )}
                    {ticket.ticketType === 'period' && (
                      <View className="ml-2 px-2 py-0.5 rounded" style={{ backgroundColor: PARENT_COLORS.blue[500] }}>
                        <Text className="text-white text-xs font-bold">기간권</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-xs" style={{ color: PARENT_COLORS.gray[600] }}>
                    {ticket.ticketType === 'count'
                      ? `1회당 ${ticket.pricePerClass.toLocaleString()}원 · ${ticket.description}`
                      : ticket.description
                    }
                  </Text>
                </View>
                <Text className="text-lg font-bold ml-2" style={{ color: ticket.highlighted ? PARENT_COLORS.primary.DEFAULT : PARENT_COLORS.gray[700] }}>
                  {ticket.price.toLocaleString()}원
                </Text>
              </View>
            ))}

            <View className="mt-4 pt-3 border-t" style={{ borderColor: PARENT_COLORS.gray[200] }}>
              <Text className="text-xs text-center" style={{ color: PARENT_COLORS.gray[500] }}>
                💡 기간권은 중간 가입 시 일할 계산되어 정산됩니다
              </Text>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
