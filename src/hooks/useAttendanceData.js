// src/hooks/useAttendanceData.js
import { useState, useMemo, useCallback } from 'react';
import { getDayOfWeek } from '../utils/dateHelpers';

/**
 * 출석 데이터 관리 커스텀 훅
 *
 * 선택된 날짜의 출석 데이터를 관리하고,
 * 출석 상태 변경 로직을 제공합니다.
 *
 * @param {Array} students - 전체 학생 목록
 * @param {Date} selectedDate - 선택된 날짜
 * @returns {Object} { attendanceData, setAttendanceData, handleStatusChange, stats }
 */
export const useAttendanceData = (students, selectedDate) => {
  const [attendanceData, setAttendanceData] = useState([]);

  // 선택된 날짜에 수업이 있는 학생들
  const todayStudents = useMemo(() => {
    const dayOfWeek = getDayOfWeek(selectedDate);

    return students
      .filter(student => {
        const schedule = student.schedule || '';
        const scheduleDays = schedule.split(' ')[0]?.split('/') || [];
        return scheduleDays.includes(dayOfWeek);
      })
      .map(student => ({
        id: student.id,
        name: student.name,
        level: student.level,
        time: student.schedule,
        status: null, // 'present', 'absent', 'late', null
      }));
  }, [students, selectedDate]);

  // 출석 상태 변경
  const handleStatusChange = useCallback((studentId, newStatus) => {
    setAttendanceData(prev =>
      prev.map(student =>
        student.id === studentId
          ? { ...student, status: newStatus }
          : student
      )
    );
  }, []);

  // 출석 통계
  const stats = useMemo(() => {
    const total = attendanceData.length;
    const present = attendanceData.filter(s => s.status === 'present').length;
    const absent = attendanceData.filter(s => s.status === 'absent').length;
    const late = attendanceData.filter(s => s.status === 'late').length;
    const unchecked = attendanceData.filter(s => s.status === null).length;

    return {
      total,
      present,
      absent,
      late,
      unchecked,
      checked: total - unchecked,
      percentage: total > 0 ? Math.round(((total - unchecked) / total) * 100) : 0,
    };
  }, [attendanceData]);

  // 날짜가 변경되면 출석 데이터 초기화
  useMemo(() => {
    setAttendanceData(todayStudents);
  }, [todayStudents]);

  return {
    attendanceData,
    setAttendanceData,
    handleStatusChange,
    stats,
    todayStudents,
  };
};
