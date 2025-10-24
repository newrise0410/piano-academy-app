// src/screens/parent/ChildInfoScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, ScreenHeader } from '../../components/common';
import PARENT_COLORS from '../../styles/parent_colors';
import { SHADOWS, RADIUS, SPACING, TYPOGRAPHY, CARD_STYLES, BADGE_STYLES, ICON_CONTAINER } from '../../styles/commonStyles';
import { useAuthStore } from '../../store';
import { getStudentById } from '../../services/firestoreService';

export default function ChildInfoScreen({ navigation }) {
  const { user } = useAuthStore();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // TODO: 실제로는 부모의 모든 자녀 목록을 가져와야 함
      // 현재는 user.studentId만 사용
      if (user?.studentId) {
        const result = await getStudentById(user.studentId);
        if (result.success) {
          setChildren([result.data]);
        }
      }
    } catch (error) {
      console.error('학생 정보 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: PARENT_COLORS.gray[50] }}>
        <ScreenHeader title="우리 아이 정보" colorScheme="parent" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={PARENT_COLORS.primary.DEFAULT} />
        </View>
      </SafeAreaView>
    );
  }

  if (children.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: PARENT_COLORS.gray[50] }}>
        <ScreenHeader title="우리 아이 정보" colorScheme="parent" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.xl }}>
          <View
            style={{
              ...ICON_CONTAINER.round(PARENT_COLORS.gray[100], 96),
              marginBottom: SPACING.lg,
            }}
          >
            <Ionicons name="person-outline" size={64} color={PARENT_COLORS.gray[400]} />
          </View>
          <Text style={{ color: PARENT_COLORS.gray[800], fontWeight: TYPOGRAPHY.fontWeight.bold, fontSize: TYPOGRAPHY.fontSize.xl, textAlign: 'center', marginBottom: SPACING.sm }}>
            등록된 자녀 정보가 없습니다
          </Text>
          <Text style={{ color: PARENT_COLORS.gray[500], textAlign: 'center', marginBottom: SPACING['2xl'], fontSize: TYPOGRAPHY.fontSize.base }}>
            자녀 정보를 등록하면{'\n'}학습 정보를 확인할 수 있어요
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('ChildRegistrationRequest')}
            style={{
              borderRadius: RADIUS['2xl'],
              paddingVertical: SPACING.md,
              paddingHorizontal: SPACING['2xl'],
              backgroundColor: PARENT_COLORS.primary.DEFAULT,
              ...SHADOWS.md,
            }}
          >
            <Text style={{ color: PARENT_COLORS.white, fontWeight: TYPOGRAPHY.fontWeight.bold, fontSize: TYPOGRAPHY.fontSize.base }}>
              자녀 등록 요청하기
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: PARENT_COLORS.gray[50] }}>
      <ScreenHeader title="우리 아이 정보" colorScheme="parent" />

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={{ paddingHorizontal: SPACING.xl, paddingVertical: SPACING['2xl'] }}>
          {/* 자녀 카드 목록 */}
          {children.map((child, index) => (
            <TouchableOpacity
              key={child.id || index}
              onPress={() => navigation.navigate('ChildDetail', { studentId: child.id })}
              style={{
                ...CARD_STYLES.elevated,
                marginBottom: SPACING.lg,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {/* 프로필 아이콘 */}
                <View
                  style={{
                    ...ICON_CONTAINER.round(PARENT_COLORS.primary[100], 64),
                    marginRight: SPACING.lg,
                  }}
                >
                  <Text style={{ fontSize: 32 }}>🎹</Text>
                </View>

                {/* 자녀 정보 */}
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
                    <Text style={{ color: PARENT_COLORS.gray[800], fontSize: TYPOGRAPHY.fontSize.xl, fontWeight: TYPOGRAPHY.fontWeight.bold, marginRight: SPACING.sm }}>
                      {child.name}
                    </Text>
                    <View
                      style={{
                        ...BADGE_STYLES.default(PARENT_COLORS.primary[100]),
                      }}
                    >
                      <Text
                        style={{
                          fontSize: TYPOGRAPHY.fontSize.xs,
                          fontWeight: TYPOGRAPHY.fontWeight.bold,
                          color: PARENT_COLORS.primary[600],
                        }}
                      >
                        {child.level}
                      </Text>
                    </View>
                  </View>

                  {/* 통계 요약 */}
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: SPACING.lg }}>
                      <Ionicons
                        name="calendar-outline"
                        size={14}
                        color={PARENT_COLORS.gray[500]}
                      />
                      <Text style={{ color: PARENT_COLORS.gray[600], fontSize: TYPOGRAPHY.fontSize.xs, marginLeft: SPACING.xs }}>
                        출석 {child.attendanceRate || 0}%
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: SPACING.lg }}>
                      <Ionicons
                        name="musical-notes-outline"
                        size={14}
                        color={PARENT_COLORS.gray[500]}
                      />
                      <Text style={{ color: PARENT_COLORS.gray[600], fontSize: TYPOGRAPHY.fontSize.xs, marginLeft: SPACING.xs }}>
                        수업 {child.completedLessons || 0}회
                      </Text>
                    </View>
                    {child.ticketType === 'count' && (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons
                          name="ticket-outline"
                          size={14}
                          color={PARENT_COLORS.gray[500]}
                        />
                        <Text style={{ color: PARENT_COLORS.gray[600], fontSize: TYPOGRAPHY.fontSize.xs, marginLeft: SPACING.xs }}>
                          남은 {child.ticketCount || 0}회
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* 화살표 아이콘 */}
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color={PARENT_COLORS.gray[400]}
                />
              </View>
            </TouchableOpacity>
          ))}

          {/* 자녀 등록 요청 버튼 */}
          <TouchableOpacity
            onPress={() => navigation.navigate('ChildRegistrationRequest')}
            style={{
              backgroundColor: PARENT_COLORS.white,
              borderRadius: RADIUS['3xl'],
              padding: SPACING.xl,
              borderWidth: 2,
              borderStyle: 'dashed',
              borderColor: PARENT_COLORS.gray[300],
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons
                name="add-circle-outline"
                size={24}
                color={PARENT_COLORS.primary.DEFAULT}
              />
              <Text
                style={{
                  fontSize: TYPOGRAPHY.fontSize.base,
                  fontWeight: TYPOGRAPHY.fontWeight.bold,
                  marginLeft: SPACING.sm,
                  color: PARENT_COLORS.primary.DEFAULT,
                }}
              >
                자녀 등록 요청하기
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
