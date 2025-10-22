import React, { useEffect, useCallback, useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  Text,
  FilterChip,
  FilterSection,
  Button,
  NoStudents,
  NoSearchResults,
  ScreenHeader,
  Card
} from '../../components/common';
import StudentCard from '../../components/teacher/StudentCard';
import { useStudentStore, useAuthStore, useToastStore } from '../../store';
import { useStudentFilters } from '../../hooks/useStudentFilters';
import TEACHER_COLORS from '../../styles/teacher_colors';
import { getPendingStudentRequests, approveStudentRequest, rejectStudentRequest } from '../../services/firestoreService';

export default function StudentListScreen({ navigation }) {
  // Zustand Store
  const { students, loading, error, fetchStudents } = useStudentStore();
  const { user } = useAuthStore();
  const toast = useToastStore();

  // Student Filters Hook
  const {
    filteredStudents,
    filters,
    setCategory,
    setLevel,
    setSearchQuery,
    showLevelFilter,
  } = useStudentFilters(students);

  // 등록 요청 관련 state
  const [studentRequests, setStudentRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [processingRequestId, setProcessingRequestId] = useState(null);

  // Fetch students on mount
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Fetch student requests when category is '등록 요청'
  useEffect(() => {
    if (filters.category === '등록 요청') {
      loadStudentRequests();
    }
  }, [filters.category]);

  const loadStudentRequests = async () => {
    if (!user?.academyId) return;

    setRequestsLoading(true);
    try {
      const result = await getPendingStudentRequests(user.academyId);
      if (result.success) {
        setStudentRequests(result.requests || []);
      } else {
        toast.error('등록 요청을 불러오는데 실패했습니다');
      }
    } catch (error) {
      console.error('등록 요청 로드 오류:', error);
      toast.error('등록 요청을 불러오는데 실패했습니다');
    } finally {
      setRequestsLoading(false);
    }
  };

  // 1차 카테고리
  const categories = ['전체', '초등', '고등', '성인', '미납', '등록 요청'];
  // 2차 레벨 필터
  const levelFilters = ['전체', '초급', '중급', '고급'];

  const handleStudentPress = useCallback((student) => {
    navigation.navigate('StudentDetail', { studentId: student.id });
  }, [navigation]);

  const handleAddStudent = useCallback(() => {
    navigation.navigate('StudentForm');
  }, [navigation]);

  // 등록 요청 승인
  const handleApproveRequest = async (request) => {
    Alert.alert(
      '등록 요청 승인',
      `${request.childName} 학생을 등록하시겠습니까?\n\n학부모: ${request.parentName}`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '승인',
          onPress: async () => {
            setProcessingRequestId(request.id);
            try {
              const result = await approveStudentRequest(request.id, {
                category: '초등', // 기본값, 나중에 수정 가능
                level: '초급',
              });

              if (result.success) {
                toast.success(`${request.childName} 학생이 등록되었습니다`);
                loadStudentRequests(); // 목록 새로고침
                fetchStudents(); // 학생 목록도 새로고침
              } else {
                toast.error(result.error || '등록 승인에 실패했습니다');
              }
            } catch (error) {
              console.error('등록 승인 오류:', error);
              toast.error('등록 승인 중 오류가 발생했습니다');
            } finally {
              setProcessingRequestId(null);
            }
          },
        },
      ]
    );
  };

  // 등록 요청 거절
  const handleRejectRequest = async (request) => {
    Alert.alert(
      '등록 요청 거절',
      `${request.childName} 학생의 등록 요청을 거절하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '거절',
          style: 'destructive',
          onPress: async () => {
            setProcessingRequestId(request.id);
            try {
              const result = await rejectStudentRequest(request.id);

              if (result.success) {
                toast.info('등록 요청이 거절되었습니다');
                loadStudentRequests(); // 목록 새로고침
              } else {
                toast.error(result.error || '요청 거절에 실패했습니다');
              }
            } catch (error) {
              console.error('요청 거절 오류:', error);
              toast.error('요청 거절 중 오류가 발생했습니다');
            } finally {
              setProcessingRequestId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* 헤더 */}
      <ScreenHeader
        title="학생 목록"
        rightButton={
          <TouchableOpacity onPress={handleAddStudent} activeOpacity={0.7}>
            <Ionicons name="add-circle" size={28} color={TEACHER_COLORS.primary.DEFAULT} />
          </TouchableOpacity>
        }
      />

      {/* 검색 영역 */}
      <View className="px-5 mt-4">
        <View className="bg-white rounded-2xl px-4 py-3 flex-row items-center border border-gray-200">
          <Ionicons name="search" size={20} color={TEACHER_COLORS.gray[400]} />
          <TextInput
            className="flex-1 ml-3 text-base"
            placeholder="학생 이름 검색"
            value={filters.search}
            onChangeText={setSearchQuery}
            style={{ fontFamily: 'MaruBuri-Regular' }}
          />
          {filters.search.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={TEACHER_COLORS.gray[400]} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 1차 카테고리 필터 */}
      <View className="px-5 mt-4">
        <FilterChip
          options={categories.map(cat => ({ value: cat, label: cat }))}
          value={filters.category}
          onChange={setCategory}
          variant="outlined"
        />
      </View>

      {/* 2차 레벨 필터 (초등, 고등, 성인일 때만 표시) */}
      {showLevelFilter && (
        <View className="px-5 mt-2">
          <FilterChip
            options={levelFilters.map(level => ({ value: level, label: level }))}
            value={filters.level}
            onChange={setLevel}
            size="small"
          />
        </View>
      )}

      {/* 학생 수 또는 요청 수 */}
      <View className="px-5 mt-4 mb-3">
        <Text className="text-sm text-gray-600">
          {filters.category === '등록 요청'
            ? `${studentRequests.length}개의 등록 요청`
            : `총 ${filteredStudents.length}명의 학생`}
        </Text>
      </View>

      {/* 학생 목록 또는 등록 요청 목록 */}
      <ScrollView className="flex-1 px-5">
        {filters.category === '등록 요청' ? (
          // 등록 요청 목록
          requestsLoading ? (
            <View className="flex-1 items-center justify-center py-20">
              <ActivityIndicator size="large" color={TEACHER_COLORS.primary.DEFAULT} />
            </View>
          ) : studentRequests.length === 0 ? (
            <View className="flex-1 items-center justify-center py-20">
              <Ionicons name="checkmark-circle-outline" size={64} color={TEACHER_COLORS.gray[300]} />
              <Text className="text-gray-500 mt-4">대기 중인 등록 요청이 없습니다</Text>
            </View>
          ) : (
            studentRequests.map((request) => (
              <Card key={request.id} className="mb-3">
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                      <Text className="text-lg font-bold text-gray-800">{request.childName}</Text>
                      <View className="ml-2 px-2 py-0.5 rounded-full bg-orange-100">
                        <Text className="text-xs font-bold text-orange-700">대기중</Text>
                      </View>
                    </View>
                    <Text className="text-sm text-gray-600">만 {request.childAge}세</Text>
                    {request.school && (
                      <Text className="text-sm text-gray-600">{request.school}</Text>
                    )}
                  </View>
                </View>

                {/* 학부모 정보 */}
                <View className="bg-gray-50 rounded-xl p-3 mb-3">
                  <Text className="text-xs font-bold text-gray-500 mb-2">학부모 정보</Text>
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="person" size={14} color={TEACHER_COLORS.gray[500]} />
                    <Text className="text-sm text-gray-700 ml-2">{request.parentName}</Text>
                  </View>
                  {request.parentPhone && (
                    <View className="flex-row items-center mb-1">
                      <Ionicons name="call" size={14} color={TEACHER_COLORS.gray[500]} />
                      <Text className="text-sm text-gray-700 ml-2">{request.parentPhone}</Text>
                    </View>
                  )}
                  {request.parentEmail && (
                    <View className="flex-row items-center">
                      <Ionicons name="mail" size={14} color={TEACHER_COLORS.gray[500]} />
                      <Text className="text-sm text-gray-700 ml-2">{request.parentEmail}</Text>
                    </View>
                  )}
                </View>

                {/* 추가 정보 */}
                {(request.childPhone || request.address) && (
                  <View className="mb-3">
                    {request.childPhone && (
                      <View className="flex-row items-center mb-1">
                        <Ionicons name="phone-portrait" size={14} color={TEACHER_COLORS.gray[500]} />
                        <Text className="text-sm text-gray-600 ml-2">{request.childPhone}</Text>
                      </View>
                    )}
                    {request.address && (
                      <View className="flex-row items-start">
                        <Ionicons name="location" size={14} color={TEACHER_COLORS.gray[500]} />
                        <Text className="text-sm text-gray-600 ml-2 flex-1">{request.address}</Text>
                      </View>
                    )}
                  </View>
                )}

                {/* 승인/거절 버튼 */}
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => handleRejectRequest(request)}
                    disabled={processingRequestId === request.id}
                    className="flex-1 rounded-xl py-3 border border-gray-300"
                    style={{ opacity: processingRequestId === request.id ? 0.5 : 1 }}
                  >
                    <Text className="text-center font-bold text-gray-700">거절</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleApproveRequest(request)}
                    disabled={processingRequestId === request.id}
                    className="flex-1 rounded-xl py-3"
                    style={{
                      backgroundColor: TEACHER_COLORS.primary.DEFAULT,
                      opacity: processingRequestId === request.id ? 0.5 : 1,
                    }}
                  >
                    {processingRequestId === request.id ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-center font-bold text-white">승인</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          )
        ) : (
          // 기존 학생 목록
          filteredStudents.length === 0 ? (
            filters.search.length > 0 ? (
              <NoSearchResults
                searchQuery={filters.search}
                onClear={() => setSearchQuery('')}
              />
            ) : students.length === 0 ? (
              <NoStudents onAddStudent={handleAddStudent} />
            ) : (
              <View className="flex-1 items-center justify-center py-20">
                <Ionicons name="people-outline" size={64} color={TEACHER_COLORS.gray[200]} />
                <Text className="text-gray-400 mt-4">해당하는 학생이 없습니다</Text>
              </View>
            )
          ) : (
            filteredStudents.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                onPress={() => handleStudentPress(student)}
              />
            ))
          )
        )}
      </ScrollView>

      {/* 학생 추가 버튼 (등록 요청 카테고리가 아닐 때만) */}
      {filters.category !== '등록 요청' && (
        <View className="px-5 pb-4">
          <Button
            title="새 학생 등록"
            icon="add-circle-outline"
            onPress={handleAddStudent}
            fullWidth
            style={{
              shadowColor: TEACHER_COLORS.primary[600],
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          />
        </View>
      )}
    </SafeAreaView>
  );
}
