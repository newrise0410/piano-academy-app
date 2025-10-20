import React, { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, LevelBadge, Button } from '../../components/common';
import TEACHER_COLORS from '../../styles/teacher_colors';
import { useToastStore } from '../../store';
import { formatDate } from '../../utils';

/**
 * MakeupClassesScreen - 보강 예정 전체보기 화면
 * BottomSheet 모달에서 "전체보기" 버튼으로 이동
 * 추가 기능: 일정 잡기, 완료 처리, 캘린더 뷰
 */
export default function MakeupClassesScreen({ navigation }) {
  const toast = useToastStore();
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'

  // Mock 데이터 (실제로는 Store에서)
  const [makeupClasses, setMakeupClasses] = useState([
    {
      id: '1',
      studentId: '1',
      studentName: '김철수',
      level: '중급',
      originalDate: '2025-01-13',
      reason: '학교 행사',
      scheduledDate: '2025-01-20',
      scheduledTime: '16:00',
    },
    {
      id: '2',
      studentId: '2',
      studentName: '이영희',
      level: '초급',
      originalDate: '2025-01-14',
      reason: '감기',
      scheduledDate: null,
      scheduledTime: null,
    },
    {
      id: '3',
      studentId: '3',
      studentName: '박민수',
      level: '고급',
      originalDate: '2025-01-15',
      reason: '가족 행사',
      scheduledDate: '2025-01-22',
      scheduledTime: '17:00',
    },
  ]);

  // 새로고침
  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: 보강 데이터 fetch
    setTimeout(() => setRefreshing(false), 1000);
  };

  // 날짜별 그룹화
  const groupedByDate = useMemo(() => {
    const groups = makeupClasses.reduce((acc, makeup) => {
      const date = makeup.scheduledDate || '날짜 미정';
      if (!acc[date]) acc[date] = [];
      acc[date].push(makeup);
      return acc;
    }, {});

    // 날짜순 정렬 (미정은 마지막)
    const sortedDates = Object.keys(groups).sort((a, b) => {
      if (a === '날짜 미정') return 1;
      if (b === '날짜 미정') return -1;
      return new Date(a) - new Date(b);
    });

    const sorted = {};
    sortedDates.forEach(date => {
      sorted[date] = groups[date];
    });
    return sorted;
  }, [makeupClasses]);

  // 통계
  const stats = useMemo(() => {
    const total = makeupClasses.length;
    const scheduled = makeupClasses.filter(m => m.scheduledDate).length;
    const unscheduled = makeupClasses.filter(m => !m.scheduledDate).length;
    return { total, scheduled, unscheduled };
  }, [makeupClasses]);

  // 일정 잡기
  const handleSchedule = (makeup) => {
    // TODO: DatePicker 모달 열기
    toast.info('일정 잡기 기능 준비 중');
  };

  // 보강 완료
  const handleComplete = (makeup) => {
    Alert.alert(
      '보강 완료',
      `${makeup.studentName}의 보강을 완료 처리하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '완료',
          onPress: () => {
            // TODO: 보강 완료 처리
            setMakeupClasses(prev => prev.filter(m => m.id !== makeup.id));
            toast.success('보강이 완료되었습니다');
          },
        },
      ]
    );
  };

  // 보강 연기
  const handlePostpone = (makeup) => {
    // TODO: DatePicker 모달 열기 (다른 날짜로 변경)
    toast.info('보강 연기 기능 준비 중');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* 헤더 */}
      <View className="bg-white border-b border-gray-200 px-5 py-4">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="mr-3"
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color={TEACHER_COLORS.gray[800]} />
            </TouchableOpacity>
            <View>
              <Text className="text-xl font-bold text-gray-800">보강 예정</Text>
              <Text className="text-sm text-gray-500 mt-0.5">
                {stats.total}건의 보강
              </Text>
            </View>
          </View>
        </View>

        {/* 통계 */}
        <View className="bg-green-50 rounded-xl p-4 mb-3">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm text-gray-700">일정 확정</Text>
            <Text className="text-lg font-bold text-green-600">{stats.scheduled}건</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-gray-700">일정 미정</Text>
            <Text className="text-lg font-bold text-yellow-600">{stats.unscheduled}건</Text>
          </View>
        </View>

        {/* 뷰 모드 전환 (TODO: 캘린더 뷰 추가시) */}
        {/* <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => setViewMode('list')}
            className={`flex-1 py-2 px-3 rounded-lg ${
              viewMode === 'list' ? 'bg-primary' : 'bg-gray-100'
            }`}
          >
            <Text className={`text-xs font-semibold text-center ${
              viewMode === 'list' ? 'text-white' : 'text-gray-600'
            }`}>
              리스트
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setViewMode('calendar')}
            className={`flex-1 py-2 px-3 rounded-lg ${
              viewMode === 'calendar' ? 'bg-primary' : 'bg-gray-100'
            }`}
          >
            <Text className={`text-xs font-semibold text-center ${
              viewMode === 'calendar' ? 'text-white' : 'text-gray-600'
            }`}>
              캘린더
            </Text>
          </TouchableOpacity>
        </View> */}
      </View>

      {/* 보강 리스트 */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {makeupClasses.length === 0 ? (
          <View className="py-20 items-center">
            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="repeat-outline" size={40} color={TEACHER_COLORS.gray[400]} />
            </View>
            <Text className="text-gray-500 text-center">
              예정된 보강이 없습니다
            </Text>
          </View>
        ) : (
          <View className="px-5 py-4">
            {Object.keys(groupedByDate).map((date, idx) => (
              <View key={date} className={idx > 0 ? 'mt-6' : ''}>
                {/* 날짜 헤더 */}
                <View className="flex-row items-center mb-3">
                  <View className={`w-1 h-5 rounded-full mr-2 ${
                    date === '날짜 미정' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <Text className="text-lg font-bold text-gray-800">
                    {date === '날짜 미정' ? date : formatDate(new Date(date))}
                  </Text>
                  <Text className="text-sm text-gray-500 ml-2">
                    ({groupedByDate[date].length}건)
                  </Text>
                </View>

                {/* 보강 항목 */}
                {groupedByDate[date].map((makeup) => (
                  <TouchableOpacity
                    key={makeup.id}
                    onPress={() => navigation.navigate('StudentDetail', { studentId: makeup.studentId })}
                    activeOpacity={0.7}
                    className={`bg-white border-2 rounded-xl p-4 mb-3 ${
                      makeup.scheduledDate ? 'border-green-200' : 'border-yellow-200'
                    }`}
                  >
                    <View className="flex-row items-start justify-between mb-3">
                      <View className="flex-1">
                        {/* 학생 정보 */}
                        <View className="flex-row items-center mb-2">
                          <Text className="text-base font-bold text-gray-800 mr-2">
                            {makeup.studentName}
                          </Text>
                          <LevelBadge level={makeup.level} />
                        </View>

                        {/* 결석 사유 */}
                        <View className="flex-row items-center mb-1">
                          <Ionicons name="information-circle-outline" size={14} color={TEACHER_COLORS.gray[500]} />
                          <Text className="text-sm text-gray-600 ml-1">
                            사유: {makeup.reason || '미기재'}
                          </Text>
                        </View>

                        {/* 원래 수업일 */}
                        <View className="flex-row items-center mb-1">
                          <Ionicons name="calendar-outline" size={14} color={TEACHER_COLORS.gray[500]} />
                          <Text className="text-sm text-gray-600 ml-1">
                            결석일: {formatDate(new Date(makeup.originalDate))}
                          </Text>
                        </View>

                        {/* 예정 시간 */}
                        {makeup.scheduledTime && (
                          <View className="flex-row items-center">
                            <Ionicons name="time-outline" size={14} color={TEACHER_COLORS.success[600]} />
                            <Text className="text-sm font-semibold text-green-600 ml-1">
                              예정: {makeup.scheduledTime}
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* 상태 아이콘 */}
                      <View
                        className={`w-10 h-10 rounded-full items-center justify-center ${
                          makeup.scheduledDate ? 'bg-green-100' : 'bg-yellow-100'
                        }`}
                      >
                        <Ionicons
                          name={makeup.scheduledDate ? 'checkmark-circle' : 'time'}
                          size={20}
                          color={
                            makeup.scheduledDate
                              ? TEACHER_COLORS.success[600]
                              : TEACHER_COLORS.warning[600]
                          }
                        />
                      </View>
                    </View>

                    {/* 액션 버튼 */}
                    <View className="flex-row gap-2">
                      {!makeup.scheduledDate ? (
                        <Button
                          title="일정 잡기"
                          icon="calendar"
                          variant="success"
                          size="small"
                          onPress={() => handleSchedule(makeup)}
                          style={{ flex: 1 }}
                        />
                      ) : (
                        <>
                          <Button
                            title="보강 완료"
                            icon="checkmark-done"
                            variant="success"
                            size="small"
                            onPress={() => handleComplete(makeup)}
                            style={{ flex: 1 }}
                          />
                          <Button
                            title="연기"
                            icon="swap-horizontal"
                            variant="outline"
                            size="small"
                            onPress={() => handlePostpone(makeup)}
                            style={{ flex: 1 }}
                          />
                        </>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* 안내 메시지 */}
      {stats.unscheduled > 0 && (
        <View className="bg-yellow-50 border-t border-yellow-200 px-5 py-4">
          <View className="flex-row items-start">
            <Ionicons name="alert-circle" size={20} color={TEACHER_COLORS.warning[600]} />
            <View className="flex-1 ml-2">
              <Text className="text-sm text-gray-700 leading-5">
                {stats.unscheduled}건의 보강 일정이 아직 확정되지 않았습니다.
                학부모님과 상의하여 일정을 잡아주세요.
              </Text>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
