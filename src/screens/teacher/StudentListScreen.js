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
import TEACHER_COLORS, { TEACHER_SEMANTIC_COLORS } from '../../styles/teacher_colors';
import { SHADOWS, RADIUS, SPACING, TYPOGRAPHY, CARD_STYLES, INPUT_STYLES, BADGE_STYLES } from '../../styles/commonStyles';
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
    <SafeAreaView style={{ flex: 1, backgroundColor: TEACHER_COLORS.gray[50] }}>
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
      <View style={{ paddingHorizontal: SPACING.xl, marginTop: SPACING.lg }}>
        <View
          style={{
            ...INPUT_STYLES.default,
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: SPACING.md,
            ...SHADOWS.sm,
          }}
        >
          <Ionicons name="search" size={20} color={TEACHER_COLORS.gray[400]} />
          <TextInput
            style={{
              flex: 1,
              marginLeft: SPACING.md,
              fontSize: TYPOGRAPHY.fontSize.base,
              fontFamily: 'MaruBuri-Regular',
              color: TEACHER_COLORS.gray[900],
            }}
            placeholder="학생 이름 검색"
            placeholderTextColor={TEACHER_COLORS.gray[400]}
            value={filters.search}
            onChangeText={setSearchQuery}
          />
          {filters.search.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={TEACHER_COLORS.gray[400]} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 1차 카테고리 필터 */}
      <View style={{ paddingHorizontal: SPACING.xl, marginTop: SPACING.lg }}>
        <FilterChip
          options={categories.map(cat => ({ value: cat, label: cat }))}
          value={filters.category}
          onChange={setCategory}
          variant="outlined"
        />
      </View>

      {/* 2차 레벨 필터 (초등, 고등, 성인일 때만 표시) */}
      {showLevelFilter && (
        <View style={{ paddingHorizontal: SPACING.xl, marginTop: SPACING.sm }}>
          <FilterChip
            options={levelFilters.map(level => ({ value: level, label: level }))}
            value={filters.level}
            onChange={setLevel}
            size="small"
          />
        </View>
      )}

      {/* 학생 수 또는 요청 수 */}
      <View style={{ paddingHorizontal: SPACING.xl, marginTop: SPACING.lg, marginBottom: SPACING.md }}>
        <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: TEACHER_COLORS.gray[600] }}>
          {filters.category === '등록 요청'
            ? `${studentRequests.length}개의 등록 요청`
            : `총 ${filteredStudents.length}명의 학생`}
        </Text>
      </View>

      {/* 학생 목록 또는 등록 요청 목록 */}
      <ScrollView style={{ flex: 1, paddingHorizontal: SPACING.xl }}>
        {filters.category === '등록 요청' ? (
          // 등록 요청 목록
          requestsLoading ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING['5xl'] }}>
              <ActivityIndicator size="large" color={TEACHER_COLORS.primary.DEFAULT} />
            </View>
          ) : studentRequests.length === 0 ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING['5xl'] }}>
              <Ionicons name="checkmark-circle-outline" size={64} color={TEACHER_COLORS.gray[300]} />
              <Text style={{ color: TEACHER_COLORS.gray[500], marginTop: SPACING.lg, fontSize: TYPOGRAPHY.fontSize.base }}>
                대기 중인 등록 요청이 없습니다
              </Text>
            </View>
          ) : (
            studentRequests.map((request) => (
              <Card key={request.id} style={{ marginBottom: SPACING.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: SPACING.md }}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
                      <Text style={{ fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.gray[800] }}>
                        {request.childName}
                      </Text>
                      <View
                        style={{
                          ...BADGE_STYLES.default(TEACHER_COLORS.warning[100]),
                          marginLeft: SPACING.sm,
                        }}
                      >
                        <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs, fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.warning[700] }}>
                          대기중
                        </Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: TEACHER_COLORS.gray[600] }}>
                      만 {request.childAge}세
                    </Text>
                    {request.school && (
                      <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: TEACHER_COLORS.gray[600] }}>{request.school}</Text>
                    )}
                  </View>
                </View>

                {/* 학부모 정보 */}
                <View
                  style={{
                    backgroundColor: TEACHER_COLORS.gray[50],
                    borderRadius: RADIUS.xl,
                    padding: SPACING.md,
                    marginBottom: SPACING.md,
                  }}
                >
                  <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs, fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.gray[500], marginBottom: SPACING.sm }}>
                    학부모 정보
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
                    <Ionicons name="person" size={14} color={TEACHER_COLORS.gray[500]} />
                    <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: TEACHER_COLORS.gray[700], marginLeft: SPACING.sm }}>
                      {request.parentName}
                    </Text>
                  </View>
                  {request.parentPhone && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
                      <Ionicons name="call" size={14} color={TEACHER_COLORS.gray[500]} />
                      <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: TEACHER_COLORS.gray[700], marginLeft: SPACING.sm }}>
                        {request.parentPhone}
                      </Text>
                    </View>
                  )}
                  {request.parentEmail && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="mail" size={14} color={TEACHER_COLORS.gray[500]} />
                      <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: TEACHER_COLORS.gray[700], marginLeft: SPACING.sm }}>
                        {request.parentEmail}
                      </Text>
                    </View>
                  )}
                </View>

                {/* 추가 정보 */}
                {(request.childPhone || request.address) && (
                  <View style={{ marginBottom: SPACING.md }}>
                    {request.childPhone && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
                        <Ionicons name="phone-portrait" size={14} color={TEACHER_COLORS.gray[500]} />
                        <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: TEACHER_COLORS.gray[600], marginLeft: SPACING.sm }}>
                          {request.childPhone}
                        </Text>
                      </View>
                    )}
                    {request.address && (
                      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                        <Ionicons name="location" size={14} color={TEACHER_COLORS.gray[500]} />
                        <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: TEACHER_COLORS.gray[600], marginLeft: SPACING.sm, flex: 1 }}>
                          {request.address}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* 승인/거절 버튼 */}
                <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
                  <TouchableOpacity
                    onPress={() => handleRejectRequest(request)}
                    disabled={processingRequestId === request.id}
                    style={{
                      flex: 1,
                      borderRadius: RADIUS.xl,
                      paddingVertical: SPACING.md,
                      borderWidth: 1,
                      borderColor: TEACHER_COLORS.gray[300],
                      opacity: processingRequestId === request.id ? 0.5 : 1,
                    }}
                  >
                    <Text style={{ textAlign: 'center', fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.gray[700] }}>
                      거절
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleApproveRequest(request)}
                    disabled={processingRequestId === request.id}
                    style={{
                      flex: 1,
                      borderRadius: RADIUS.xl,
                      paddingVertical: SPACING.md,
                      backgroundColor: TEACHER_COLORS.primary.DEFAULT,
                      opacity: processingRequestId === request.id ? 0.5 : 1,
                      ...SHADOWS.md,
                    }}
                  >
                    {processingRequestId === request.id ? (
                      <ActivityIndicator color={TEACHER_COLORS.white} />
                    ) : (
                      <Text style={{ textAlign: 'center', fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.white }}>
                        승인
                      </Text>
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
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING['5xl'] }}>
                <Ionicons name="people-outline" size={64} color={TEACHER_COLORS.gray[200]} />
                <Text style={{ color: TEACHER_COLORS.gray[400], marginTop: SPACING.lg, fontSize: TYPOGRAPHY.fontSize.base }}>
                  해당하는 학생이 없습니다
                </Text>
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
        <View style={{ paddingHorizontal: SPACING.xl, paddingBottom: SPACING.lg }}>
          <Button
            title="새 학생 등록"
            icon="add-circle-outline"
            onPress={handleAddStudent}
            fullWidth
            style={{
              ...SHADOWS.colored(TEACHER_COLORS.primary[600], 0.3),
            }}
          />
        </View>
      )}
    </SafeAreaView>
  );
}
