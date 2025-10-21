// src/hooks/useMakeupClasses.js
import { useMemo } from 'react';
import { useStudentStore, useAttendanceStore } from '../store';

/**
 * 보강 필요한 수업 목록 반환
 *
 * 결석한 학생 중 보강이 필요한 학생들의 정보를 반환
 * - 결석 기록 기반
 * - 학생 정보와 매칭
 * - 최근 날짜순 정렬
 *
 * @returns {Array} 보강 수업 목록 with { id, studentName, level, reason, originalDate, scheduledDate, scheduledTime }
 */
export const useMakeupClasses = () => {
  const { students } = useStudentStore();
  const { records } = useAttendanceStore();

  return useMemo(() => {
    if (!records || records.length === 0) return [];

    // 결석(absent) 기록만 필터링하고 학생 정보와 매칭
    const absentRecords = records
      .filter(record => record.status === 'absent')
      .map(record => {
        // 학생 정보 찾기
        const student = students.find(s => s.id === record.studentId);
        if (!student) return null;

        return {
          id: record.id,
          studentName: student.name,
          level: student.level || '초급',
          reason: record.note || '미기재',
          originalDate: record.date, // 결석일
          scheduledDate: record.makeupDate || null, // 보강 예정일
          scheduledTime: record.makeupTime || null, // 보강 예정 시간
        };
      })
      .filter(item => item !== null);

    // 최근 날짜순으로 정렬
    return absentRecords.sort((a, b) =>
      new Date(b.originalDate) - new Date(a.originalDate)
    );
  }, [records, students]);
};
