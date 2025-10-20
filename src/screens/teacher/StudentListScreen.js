import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Animated, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  Text,
  FilterChip,
  Button,
  NoStudents,
  NoSearchResults
} from '../../components/common';
import StudentCard from '../../components/teacher/StudentCard';
import StudentDetailScreen from './StudentDetailScreen';
import { useStudentStore } from '../../store';
import TEACHER_COLORS from '../../styles/teacher_colors';

export default function StudentListScreen({ navigation }) {
  // Zustand Store
  const { students, loading, error, fetchStudents } = useStudentStore();

  // Local UI State
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedLevel, setSelectedLevel] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailScreen, setShowDetailScreen] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Fetch students on mount
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // 1차 카테고리
  const categories = ['전체', '초등', '고등', '성인', '미납'];
  // 2차 레벨 필터 (초등, 고등, 성인일 때만 표시)
  const levelFilters = ['전체', '초급', '중급', '고급'];

  // 카테고리 변경 시 레벨 초기화
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSelectedLevel('전체');
  };

  // 필터링된 학생 목록
  const filteredStudents = students.filter((student) => {
    // 검색어 필터
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase());

    // 1차 카테고리 필터
    let matchesCategory = true;
    if (selectedCategory === '미납') {
      matchesCategory = student.unpaid === true;
    } else if (selectedCategory !== '전체') {
      matchesCategory = student.category === selectedCategory;
    }

    // 2차 레벨 필터
    const matchesLevel = selectedLevel === '전체' || student.level === selectedLevel;

    return matchesSearch && matchesCategory && matchesLevel;
  });

  // 2차 필터를 보여줄지 결정
  const showLevelFilter = ['초등', '고등', '성인'].includes(selectedCategory);

  // 슬라이드 애니메이션
  useEffect(() => {
    if (showDetailScreen) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showDetailScreen]);

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -1000],
  });

  const detailScreenTranslateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1000, 0],
  });

  const handleStudentPress = (student) => {
    setSelectedStudent(student);
    setShowDetailScreen(true);
  };

  const handleAddStudent = () => {
    navigation.navigate('StudentForm');
  };

  return (
    <View style={{ flex: 1 }}>
      {/* 메인 화면 */}
      <Animated.View style={{ flex: 1, transform: [{ translateX }] }}>
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* 헤더 */}
      <View className="bg-primary px-5 py-4">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Ionicons name="book" size={24} color="white" />
            <Text className="text-white text-xl font-bold ml-2">피아노 학원 관리</Text>
          </View>
          <TouchableOpacity onPress={handleAddStudent} activeOpacity={0.7}>
            <Ionicons name="add-circle" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 검색 영역 */}
      <View className="px-5 mt-4">
        <View className="bg-white rounded-2xl px-4 py-3 flex-row items-center border border-gray-200">
          <Ionicons name="search" size={20} color={TEACHER_COLORS.gray[400]} />
          <TextInput
            className="flex-1 ml-3 text-base"
            placeholder="학생 이름 검색"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ fontFamily: 'MaruBuri-Regular' }}
          />
          {searchQuery.length > 0 && (
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
          value={selectedCategory}
          onChange={handleCategoryChange}
          variant="outlined"
        />
      </View>

      {/* 2차 레벨 필터 (초등, 고등, 성인일 때만 표시) */}
      {showLevelFilter && (
        <View className="px-5 mt-2">
          <FilterChip
            options={levelFilters.map(level => ({ value: level, label: level }))}
            value={selectedLevel}
            onChange={setSelectedLevel}
            size="small"
          />
        </View>
      )}

      {/* 학생 수 */}
      <View className="px-5 mt-4 mb-3">
        <Text className="text-sm text-gray-600">
          총 {filteredStudents.length}명의 학생
        </Text>
      </View>

      {/* 학생 목록 */}
      <ScrollView className="flex-1 px-5">
        {filteredStudents.length === 0 ? (
          searchQuery.length > 0 ? (
            <NoSearchResults
              searchQuery={searchQuery}
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
        )}
      </ScrollView>

      {/* 학생 추가 버튼 */}
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
    </SafeAreaView>
      </Animated.View>

      {/* 상세 화면 */}
      {showDetailScreen && selectedStudent && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            transform: [{ translateX: detailScreenTranslateX }],
          }}
        >
          <StudentDetailScreen
            route={{ params: { student: selectedStudent } }}
            navigation={{
              goBack: () => setShowDetailScreen(false),
              navigate: (screenName, params) => {
                setShowDetailScreen(false);
                navigation.navigate(screenName, params);
              },
            }}
          />
        </Animated.View>
      )}
    </View>
  );
}
