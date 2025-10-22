// src/hooks/useStudentFilters.js
import { useState, useMemo } from 'react';

/**
 * 학생 필터링 커스텀 훅
 *
 * 카테고리, 레벨, 검색어 기반으로 학생 목록을 필터링하고
 * 필터 상태를 관리합니다.
 *
 * @param {Array} students - 전체 학생 목록
 * @returns {Object} { filteredStudents, filters, setters }
 */
export const useStudentFilters = (students) => {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedLevel, setSelectedLevel] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');

  // 필터링된 학생 목록
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      // 검색어 필터
      const matchesSearch = (student.name || '').toLowerCase().includes(searchQuery.toLowerCase());

      // 카테고리 필터
      let matchesCategory = true;
      if (selectedCategory === '미납') {
        matchesCategory = student.unpaid === true;
      } else if (selectedCategory !== '전체') {
        matchesCategory = student.category === selectedCategory;
      }

      // 레벨 필터
      const matchesLevel = selectedLevel === '전체' || student.level === selectedLevel;

      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [students, selectedCategory, selectedLevel, searchQuery]);

  // 카테고리 변경 시 레벨 초기화
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSelectedLevel('전체');
  };

  // 필터 초기화
  const resetFilters = () => {
    setSelectedCategory('전체');
    setSelectedLevel('전체');
    setSearchQuery('');
  };

  return {
    // 필터링된 결과
    filteredStudents,

    // 현재 필터 상태
    filters: {
      category: selectedCategory,
      level: selectedLevel,
      search: searchQuery,
    },

    // Setters
    setCategory: handleCategoryChange,
    setLevel: setSelectedLevel,
    setSearchQuery,
    resetFilters,

    // 유틸리티
    hasActiveFilters: selectedCategory !== '전체' || selectedLevel !== '전체' || searchQuery !== '',
    showLevelFilter: ['초등', '고등', '성인'].includes(selectedCategory),
  };
};
