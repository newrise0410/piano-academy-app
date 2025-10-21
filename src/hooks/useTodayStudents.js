// src/hooks/useTodayStudents.js
import { useMemo } from 'react';
import { useStudentStore } from '../store';

/**
 * 오늘 수업이 있는 학생 목록 반환
 *
 * 요일 기반으로 오늘 수업이 예정된 학생들을 필터링
 *
 * @returns {Array} 오늘 수업 학생 목록
 */
export const useTodayStudents = () => {
  const { students } = useStudentStore();

  return useMemo(() => {
    const today = new Date().getDay(); // 0: 일, 1: 월, ..., 6: 토
    const dayMap = ['일', '월', '화', '수', '목', '금', '토'];
    const todayKorean = dayMap[today];

    return students.filter(student => {
      const schedule = student.schedule || '';
      return schedule.includes(todayKorean);
    });
  }, [students]);
};
