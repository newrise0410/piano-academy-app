// src/screens/teacher/LessonNoteScreen.js
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, ScreenHeader } from '../../components/common';
import LessonNoteCard from '../../components/common/LessonNoteCard';
import LessonNoteModal from '../../components/teacher/LessonNoteModal';
import TEACHER_COLORS from '../../styles/teacher_colors';
import { useLessonNoteStore, useStudentStore, useToastStore } from '../../store';

export default function LessonNoteScreen({ navigation }) {
  const { lessonNotes, fetchLessonNotes, deleteLessonNote, loading } = useLessonNoteStore();
  const { students, fetchStudents } = useStudentStore();
  const toast = useToastStore();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null); // 필터링용
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [studentForNewNote, setStudentForNewNote] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        fetchStudents(),
        fetchLessonNotes({}, true),
      ]);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // 필터링된 수업 일지
  const filteredNotes = selectedStudent
    ? lessonNotes.filter(note => note.studentId === selectedStudent.id)
    : lessonNotes;

  // 학생별 그룹핑
  const groupedNotes = filteredNotes.reduce((acc, note) => {
    const studentName = note.studentName;
    if (!acc[studentName]) {
      acc[studentName] = [];
    }
    acc[studentName].push(note);
    return acc;
  }, {});

  const handleEdit = (note) => {
    const student = students.find(s => s.id === note.studentId);
    if (student) {
      setStudentForNewNote(student);
      setEditingNote(note);
      setShowNoteModal(true);
    }
  };

  const handleDelete = (note) => {
    Alert.alert(
      '수업 일지 삭제',
      '정말 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLessonNote(note.id);
              toast.success('삭제되었습니다.');
            } catch (error) {
              toast.error('삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  const handleAddNote = () => {
    if (students.length === 0) {
      toast.warning('먼저 학생을 등록해주세요.');
      navigation.navigate('StudentTab');
      return;
    }
    // 첫 번째 학생을 기본으로 선택
    setStudentForNewNote(students[0]);
    setEditingNote(null);
    setShowNoteModal(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScreenHeader title="수업 일지" />

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 통계 카드 */}
        <View className="px-5 mt-4 mb-4">
          <View className="bg-primary rounded-2xl p-4">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-white text-sm opacity-80">전체 수업 일지</Text>
                <Text className="text-white text-3xl font-bold mt-1">
                  {lessonNotes.length}
                </Text>
              </View>
              <View className="bg-white rounded-full p-3" style={{ opacity: 0.2 }}>
                <Ionicons name="document-text" size={32} color="white" />
              </View>
            </View>
          </View>
        </View>

        {/* 학생 필터 */}
        <View className="px-5 mb-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              className={`rounded-full px-4 py-2 mr-2 ${
                !selectedStudent ? 'bg-primary' : 'bg-white border border-gray-200'
              }`}
              onPress={() => setSelectedStudent(null)}
              activeOpacity={0.7}
            >
              <Text
                className={`text-sm font-semibold ${
                  !selectedStudent ? 'text-white' : 'text-gray-700'
                }`}
              >
                전체
              </Text>
            </TouchableOpacity>
            {students.map((student) => (
              <TouchableOpacity
                key={student.id}
                className={`rounded-full px-4 py-2 mr-2 ${
                  selectedStudent?.id === student.id
                    ? 'bg-primary'
                    : 'bg-white border border-gray-200'
                }`}
                onPress={() => setSelectedStudent(student)}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-sm font-semibold ${
                    selectedStudent?.id === student.id ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {student.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 수업 일지 목록 */}
        <View className="px-5 pb-20">
          {filteredNotes.length === 0 ? (
            <View className="py-20 items-center">
              <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                <Ionicons name="document-text-outline" size={40} color={TEACHER_COLORS.gray[400]} />
              </View>
              <Text className="text-gray-500 text-center mb-2">
                작성된 수업 일지가 없습니다
              </Text>
              <TouchableOpacity
                className="mt-4 bg-primary rounded-xl px-6 py-3"
                onPress={handleAddNote}
                activeOpacity={0.7}
              >
                <Text className="text-white font-semibold">첫 수업 일지 작성하기</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredNotes.map((note) => (
              <LessonNoteCard
                key={note.id}
                note={note}
                onPress={() => handleEdit(note)}
                onEdit={handleEdit}
                onDelete={handleDelete}
                showActions={true}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* 플로팅 추가 버튼 */}
      {students.length > 0 && (
        <TouchableOpacity
          className="absolute bottom-6 right-6 w-16 h-16 rounded-full items-center justify-center"
          style={{
            backgroundColor: TEACHER_COLORS.primary.DEFAULT,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 8,
          }}
          onPress={handleAddNote}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={32} color="white" />
        </TouchableOpacity>
      )}

      {/* 수업 일지 작성/수정 모달 */}
      {studentForNewNote && (
        <LessonNoteModal
          visible={showNoteModal}
          onClose={() => {
            setShowNoteModal(false);
            setStudentForNewNote(null);
            setEditingNote(null);
          }}
          student={studentForNewNote}
          date={(() => {
            const date = editingNote ? new Date(editingNote.date) : new Date();
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          })()}
          existingNote={editingNote}
        />
      )}
    </SafeAreaView>
  );
}
