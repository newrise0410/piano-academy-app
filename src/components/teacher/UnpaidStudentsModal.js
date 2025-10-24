import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../common';
import BottomSheet from '../common/BottomSheet';
import TEACHER_COLORS from '../../styles/teacher_colors';
import { SHADOWS, RADIUS, SPACING, TYPOGRAPHY, CARD_STYLES, BADGE_STYLES, ICON_CONTAINER } from '../../styles/commonStyles';
import { formatCurrency } from '../../utils';

/**
 * UnpaidStudentsModal - 미납 학생 상세 모달
 */
export default function UnpaidStudentsModal({ visible, onClose, students = [], onSendNotice, onViewAll }) {
  // 미납 기간별로 정렬 (오래된 순)
  const safeStudents = students || [];
  const sortedStudents = [...safeStudents].sort((a, b) => {
    const dateA = new Date(a.lastPaymentDate || '2000-01-01');
    const dateB = new Date(b.lastPaymentDate || '2000-01-01');
    return dateA - dateB;
  });

  // 총 미납 금액 계산
  const totalUnpaid = safeStudents.reduce((sum, student) => sum + (student.unpaidAmount || 0), 0);

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="미납 학생"
      subtitle={`총 ${safeStudents.length}명의 미납 학생`}
      height="large"
      onViewAll={onViewAll}
    >
      {safeStudents.length === 0 ? (
        <View style={{ paddingVertical: SPACING['5xl'], alignItems: 'center' }}>
          <View
            style={{
              ...ICON_CONTAINER.round(TEACHER_COLORS.success[100], 80),
              marginBottom: SPACING.lg,
            }}
          >
            <Ionicons name="checkmark-circle" size={40} color={TEACHER_COLORS.success[600]} />
          </View>
          <Text style={{ fontSize: TYPOGRAPHY.fontSize.base, color: TEACHER_COLORS.gray[500], textAlign: 'center' }}>
            미납 학생이 없습니다
          </Text>
        </View>
      ) : (
        <View>
          {/* 학생 리스트 */}
          {sortedStudents.map((student, idx) => (
            <View
              key={student.id}
              style={{
                ...CARD_STYLES.default,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: idx > 0 ? SPACING.sm : 0,
              }}
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
                  마지막 결제: {student.lastPaymentDate || '정보 없음'}
                </Text>

                {/* 미납 금액 */}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs, color: TEACHER_COLORS.gray[500] }}>미납 금액: </Text>
                  <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: TEACHER_COLORS.danger[600] }}>
                    {formatCurrency(student.unpaidAmount || 280000)}
                  </Text>
                </View>
              </View>

              {/* 알림 버튼 */}
              <TouchableOpacity
                onPress={() => onSendNotice?.(student)}
                style={{
                  borderRadius: RADIUS.lg,
                  paddingHorizontal: SPACING.lg,
                  paddingVertical: SPACING.sm + 2,
                  backgroundColor: TEACHER_COLORS.danger[500],
                }}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.white }}>
                  알림
                </Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* 요약 정보 */}
          <View
            style={{
              marginTop: SPACING['2xl'] + SPACING.sm,
              backgroundColor: TEACHER_COLORS.danger[50],
              borderRadius: RADIUS.xl,
              padding: SPACING.lg,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
              <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: TEACHER_COLORS.gray[700] }}>총 미납 학생</Text>
              <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.gray[800] }}>
                {safeStudents.length}명
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: TEACHER_COLORS.gray[700] }}>총 미납 금액</Text>
              <Text style={{ fontSize: TYPOGRAPHY.fontSize.base, fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.danger[600] }}>
                {formatCurrency(totalUnpaid)}
              </Text>
            </View>
          </View>

          {/* 안내 메시지 */}
          <View
            style={{
              marginTop: SPACING.lg,
              backgroundColor: TEACHER_COLORS.warning[50],
              borderWidth: 1,
              borderColor: TEACHER_COLORS.warning[200],
              borderRadius: RADIUS.xl,
              padding: SPACING.lg,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <Ionicons name="alert-circle" size={20} color={TEACHER_COLORS.warning[600]} />
              <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: TEACHER_COLORS.gray[700], lineHeight: 20 }}>
                  메시지 아이콘을 눌러 학부모님께 수강료 안내 알림장을 보내세요. 정기적인 안내가 중요합니다.
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </BottomSheet>
  );
}
