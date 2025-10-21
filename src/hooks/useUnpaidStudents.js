// src/hooks/useUnpaidStudents.js
import { useMemo } from 'react';
import { useStudentStore, usePaymentStore } from '../store';

/**
 * 미납 학생 목록 및 상세 정보 반환
 *
 * DashboardScreen과 TuitionScreen에서 사용하는 미납 학생 로직을 통합
 * - payments 데이터 기반으로 실제 미납 상태 계산
 * - 마지막 결제일, 미납 금액 등 상세 정보 포함
 *
 * @returns {Array} 미납 학생 목록 with { ...student, unpaidAmount, lastPaymentDate }
 */
export const useUnpaidStudents = () => {
  const { students } = useStudentStore();
  const { payments } = usePaymentStore();

  return useMemo(() => {
    return students.filter(student => {
      // 학생의 최근 결제 정보 확인
      const studentPayments = payments.filter(p => p.studentId === student.id);

      if (studentPayments.length === 0) {
        // 결제 내역이 없으면 미납으로 간주
        return true;
      }

      // 미납 상태인 결제가 있는지 확인
      const hasUnpaid = studentPayments.some(p => p.status === 'unpaid');
      return hasUnpaid || student.unpaid === true;
    }).map(student => {
      // 학생의 미납 금액 및 마지막 결제일 계산
      const studentPayments = payments.filter(p => p.studentId === student.id);
      const unpaidPayments = studentPayments.filter(p => p.status === 'unpaid');
      const lastPayment = studentPayments
        .filter(p => p.status === 'paid')
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

      return {
        ...student,
        unpaidAmount: unpaidPayments.reduce((sum, p) => sum + (p.amount || 0), 0) || 280000,
        lastPaymentDate: lastPayment?.date || '미납',
      };
    });
  }, [students, payments]);
};
