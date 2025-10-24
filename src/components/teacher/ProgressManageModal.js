// src/components/teacher/ProgressManageModal.js
import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../common';
import BottomSheet from '../common/BottomSheet';
import ProgressStepSelector from './ProgressStepSelector';
import TEACHER_COLORS from '../../styles/teacher_colors';
import { SHADOWS, RADIUS, SPACING, TYPOGRAPHY, INPUT_STYLES, CARD_STYLES } from '../../styles/commonStyles';
import { ProgressRepository } from '../../repositories/ProgressRepository';
import { useToastStore, useAuthStore } from '../../store';
import { getMaterials, createMaterial } from '../../services/firestoreService';
import { improveLearningStepMemo } from '../../services/geminiService';

/**
 * ProgressManageModal - 진도 직접 추가/수정 모달
 * 교재 추가, 곡 추가/수정/삭제 기능
 */
export default function ProgressManageModal({
  visible,
  onClose,
  studentId,
  studentName,
  existingProgress = null, // 기존 진도 (수정 모드)
  onSaved,
  navigation, // 교재 관리로 이동하기 위한 navigation prop
}) {
  const toast = useToastStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('book'); // 'book' or 'song' or 'addMaterial'

  // 교재 DB 목록
  const [materials, setMaterials] = useState([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  // 새 교재 추가 폼
  const [newMaterialData, setNewMaterialData] = useState({
    title: '',
    publisher: '',
    level: '초급',
    category: '피아노',
    description: '',
    totalSongs: '',
  });

  const levels = ['초급', '중급', '고급'];
  const materialCategories = ['피아노', '이론', '악보', '테크닉', '기타'];

  // 교재 폼 데이터
  const [bookData, setBookData] = useState({
    name: '',
    category: 'technique',
    totalSongs: 50,
  });

  // 곡 폼 데이터
  const [songData, setSongData] = useState({
    number: '',
    title: '',
    status: 'not_started',
    difficulty: 'intermediate',
    notes: '',
    learningStep: null, // { currentStep, completedSteps, subItems }
  });

  // 교재 DB에서 교재 목록 로드
  const loadMaterials = async () => {
    if (!user?.academyId) return;

    setMaterialsLoading(true);
    try {
      const result = await getMaterials(user.academyId);
      if (result.success) {
        setMaterials(result.data);
      } else {
        toast.error('교재 목록을 불러오는데 실패했습니다');
      }
    } catch (error) {
      console.error('교재 로드 오류:', error);
      toast.error('교재 목록을 불러오는데 실패했습니다');
    } finally {
      setMaterialsLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      if (existingProgress) {
        // 수정 모드: 기존 진도 데이터 로드
        setBookData({
          name: existingProgress.book.name,
          category: existingProgress.book.category,
          totalSongs: existingProgress.book.totalSongs,
        });
        setMode('song'); // 곡 추가 모드로
      } else {
        // 새로 추가 모드: 초기화 및 교재 목록 로드
        resetForm();
        loadMaterials();
      }
    }
  }, [visible, existingProgress]);

  const resetForm = () => {
    setBookData({
      name: '',
      category: 'technique',
      totalSongs: 50,
    });
    setSongData({
      number: '',
      title: '',
      status: 'not_started',
      difficulty: 'intermediate',
      notes: '',
      learningStep: null,
    });
    setSelectedMaterial(null);
    setNewMaterialData({
      title: '',
      publisher: '',
      level: '초급',
      category: '피아노',
      description: '',
      totalSongs: '',
    });
    setMode('book');
  };

  // 새 교재 추가
  const handleAddNewMaterial = async () => {
    if (!newMaterialData.title.trim()) {
      toast.warning('교재명을 입력해주세요');
      return;
    }

    setLoading(true);
    try {
      const materialData = {
        ...newMaterialData,
        totalSongs: newMaterialData.totalSongs ? parseInt(newMaterialData.totalSongs) : null,
        teacherId: user.uid,
        academyId: user.academyId,
      };

      const result = await createMaterial(materialData);

      if (result.success) {
        toast.success(`"${newMaterialData.title}" 교재가 추가되었습니다`);

        // 교재 목록 새로고침
        await loadMaterials();

        // 방금 추가한 교재 선택
        const addedMaterial = {
          id: result.id,
          ...materialData,
        };
        setSelectedMaterial(addedMaterial);
        setBookData({
          name: addedMaterial.title,
          category: addedMaterial.category,
          totalSongs: addedMaterial.totalSongs || 50,
        });

        // 다시 선택 모드로
        setMode('book');

        // 폼 초기화
        setNewMaterialData({
          title: '',
          publisher: '',
          level: '초급',
          category: '피아노',
          description: '',
          totalSongs: '',
        });
      } else {
        toast.error(result.error || '교재 추가에 실패했습니다');
      }
    } catch (error) {
      console.error('교재 추가 오류:', error);
      toast.error('교재 추가에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  // 교재 DB에서 교재 선택
  const handleSelectMaterial = (material) => {
    setSelectedMaterial(material);
    setBookData({
      name: material.title,
      category: material.category,
      totalSongs: material.totalSongs || 50, // materials DB의 totalSongs 사용, 없으면 기본값 50
    });
  };

  // 선택한 교재로 진도 추가
  const handleCreateBook = async () => {
    if (!selectedMaterial) {
      toast.warning('교재를 선택해주세요.');
      return;
    }

    setLoading(true);
    try {
      const newProgress = await ProgressRepository.create({
        studentId,
        studentName,
        book: {
          name: selectedMaterial.title,
          category: selectedMaterial.category,
          totalSongs: parseInt(bookData.totalSongs) || 50,
          materialId: selectedMaterial.id, // materials DB와 연결
          publisher: selectedMaterial.publisher,
          level: selectedMaterial.level,
        },
        status: 'in_progress',
        startDate: new Date().toISOString().split('T')[0],
        songs: [],
      });

      toast.success(`${selectedMaterial.title} 교재가 추가되었습니다!`);
      onSaved && onSaved(newProgress);
      resetForm();
      onClose();
    } catch (error) {
      console.error('교재 추가 실패:', error);
      toast.error('교재 추가에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 곡 추가
  const handleAddSong = async () => {
    if (!existingProgress) {
      toast.warning('교재를 먼저 선택해주세요.');
      return;
    }

    if (!songData.number.trim()) {
      toast.warning('곡 번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      const song = {
        number: songData.number.trim(),
        title: songData.title.trim() || `${existingProgress.book.name} ${songData.number.trim()}`,
        status: songData.status,
        difficulty: songData.difficulty,
        notes: songData.notes.trim(),
        learningStep: songData.learningStep, // 학습 단계 추가
        startDate: songData.status === 'in_progress' ? today : undefined,
        completedDate: songData.status === 'completed' ? today : undefined,
        updatedBy: 'manual',
      };

      await ProgressRepository.updateSong(existingProgress.id, song);

      toast.success('곡이 추가되었습니다!');
      onSaved && onSaved();

      // 폼 초기화 (곡만)
      setSongData({
        number: '',
        title: '',
        status: 'not_started',
        difficulty: 'intermediate',
        notes: '',
        learningStep: null,
      });
    } catch (error) {
      console.error('곡 추가 실패:', error);
      toast.error('곡 추가에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={existingProgress ? `${existingProgress.book.name} 곡 추가` : '새 교재 추가'}
      height="large"
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {!existingProgress ? (
          /* 교재 선택 모드 */
          <View style={{ padding: SPACING.xl }}>
            {materialsLoading ? (
              /* 로딩 중 */
              <View style={{ padding: SPACING['4xl'], alignItems: 'center' }}>
                <ActivityIndicator size="large" color={TEACHER_COLORS.primary.DEFAULT} />
                <Text style={{ marginTop: SPACING.md, fontSize: TYPOGRAPHY.fontSize.sm, color: TEACHER_COLORS.gray[500] }}>
                  교재 목록 불러오는 중...
                </Text>
              </View>
            ) : materials.length === 0 ? (
              /* 교재 DB가 비어있을 때 */
              <View style={{ padding: SPACING.xl, alignItems: 'center' }}>
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: TEACHER_COLORS.warning[50],
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: SPACING.lg,
                  }}
                >
                  <Ionicons name="book-outline" size={40} color={TEACHER_COLORS.warning[600]} />
                </View>
                <Text style={{ fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.gray[800], marginBottom: SPACING.sm, textAlign: 'center' }}>
                  등록된 교재가 없습니다
                </Text>
                <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: TEACHER_COLORS.gray[500], textAlign: 'center', lineHeight: 20, marginBottom: SPACING.xl }}>
                  여기에서 바로 교재를 추가하거나{'\n'}사이드바의 "교재 관리"에서 등록하세요
                </Text>
                <View style={{ flexDirection: 'row', gap: SPACING.md }}>
                  <TouchableOpacity
                    onPress={() => setMode('addMaterial')}
                    style={{
                      paddingHorizontal: SPACING.xl,
                      paddingVertical: SPACING.md,
                      borderRadius: RADIUS.xl,
                      backgroundColor: TEACHER_COLORS.primary.DEFAULT,
                    }}
                  >
                    <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: TEACHER_COLORS.white }}>
                      교재 추가하기
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      onClose();
                      if (navigation) {
                        navigation.navigate('MaterialManagementScreen');
                      }
                    }}
                    style={{
                      paddingHorizontal: SPACING.xl,
                      paddingVertical: SPACING.md,
                      borderRadius: RADIUS.xl,
                      backgroundColor: TEACHER_COLORS.white,
                      borderWidth: 2,
                      borderColor: TEACHER_COLORS.primary.DEFAULT,
                    }}
                  >
                    <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: TEACHER_COLORS.primary.DEFAULT }}>
                      교재 관리로 이동
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : mode === 'addMaterial' ? (
              /* 새 교재 추가 폼 */
              <>
                <TouchableOpacity
                  onPress={() => setMode('book')}
                  style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg }}
                >
                  <Ionicons name="arrow-back" size={24} color={TEACHER_COLORS.gray[700]} />
                  <Text style={{ marginLeft: SPACING.sm, fontSize: TYPOGRAPHY.fontSize.base, color: TEACHER_COLORS.gray[700] }}>
                    교재 선택으로 돌아가기
                  </Text>
                </TouchableOpacity>

                {/* 교재명 */}
                <View style={{ marginBottom: SPACING.lg }}>
                  <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: TEACHER_COLORS.gray[700], marginBottom: SPACING.sm }}>
                    교재명 *
                  </Text>
                  <TextInput
                    style={{
                      ...INPUT_STYLES.default,
                      padding: SPACING.md,
                      fontSize: TYPOGRAPHY.fontSize.base,
                    }}
                    placeholder="예: 바이엘 교본"
                    value={newMaterialData.title}
                    onChangeText={(text) => setNewMaterialData({ ...newMaterialData, title: text })}
                    placeholderTextColor={TEACHER_COLORS.gray[400]}
                  />
                </View>

                {/* 출판사 */}
                <View style={{ marginBottom: SPACING.lg }}>
                  <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: TEACHER_COLORS.gray[700], marginBottom: SPACING.sm }}>
                    출판사
                  </Text>
                  <TextInput
                    style={{
                      ...INPUT_STYLES.default,
                      padding: SPACING.md,
                      fontSize: TYPOGRAPHY.fontSize.base,
                    }}
                    placeholder="예: 세광음악출판사"
                    value={newMaterialData.publisher}
                    onChangeText={(text) => setNewMaterialData({ ...newMaterialData, publisher: text })}
                    placeholderTextColor={TEACHER_COLORS.gray[400]}
                  />
                </View>

                {/* 레벨 */}
                <View style={{ marginBottom: SPACING.lg }}>
                  <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: TEACHER_COLORS.gray[700], marginBottom: SPACING.sm }}>
                    레벨 *
                  </Text>
                  <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
                    {levels.map((level) => (
                      <TouchableOpacity
                        key={level}
                        onPress={() => setNewMaterialData({ ...newMaterialData, level })}
                        style={{
                          flex: 1,
                          paddingVertical: SPACING.md,
                          borderRadius: RADIUS.lg,
                          borderWidth: 2,
                          borderColor: newMaterialData.level === level ? TEACHER_COLORS.primary.DEFAULT : TEACHER_COLORS.gray[200],
                          backgroundColor: newMaterialData.level === level ? TEACHER_COLORS.primary[50] : TEACHER_COLORS.white,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: TYPOGRAPHY.fontSize.sm,
                            fontWeight: TYPOGRAPHY.fontWeight.semibold,
                            color: newMaterialData.level === level ? TEACHER_COLORS.primary.DEFAULT : TEACHER_COLORS.gray[500],
                            textAlign: 'center',
                          }}
                        >
                          {level}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* 카테고리 */}
                <View style={{ marginBottom: SPACING.lg }}>
                  <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: TEACHER_COLORS.gray[700], marginBottom: SPACING.sm }}>
                    카테고리 *
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }}>
                    {materialCategories.map((category) => (
                      <TouchableOpacity
                        key={category}
                        onPress={() => setNewMaterialData({ ...newMaterialData, category })}
                        style={{
                          paddingHorizontal: SPACING.lg,
                          paddingVertical: SPACING.md,
                          borderRadius: RADIUS.lg,
                          borderWidth: 2,
                          borderColor: newMaterialData.category === category ? TEACHER_COLORS.primary.DEFAULT : TEACHER_COLORS.gray[200],
                          backgroundColor: newMaterialData.category === category ? TEACHER_COLORS.primary[50] : TEACHER_COLORS.white,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: TYPOGRAPHY.fontSize.sm,
                            fontWeight: TYPOGRAPHY.fontWeight.semibold,
                            color: newMaterialData.category === category ? TEACHER_COLORS.primary.DEFAULT : TEACHER_COLORS.gray[500],
                          }}
                        >
                          {category}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* 총 곡 수 */}
                <View style={{ marginBottom: SPACING.lg }}>
                  <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: TEACHER_COLORS.gray[700], marginBottom: SPACING.sm }}>
                    총 곡 수 (선택)
                  </Text>
                  <TextInput
                    style={{
                      ...INPUT_STYLES.default,
                      padding: SPACING.md,
                      fontSize: TYPOGRAPHY.fontSize.base,
                    }}
                    placeholder="예: 30 (체르니 30번까지), 106 (바이엘 106번까지)"
                    value={newMaterialData.totalSongs}
                    onChangeText={(text) => setNewMaterialData({ ...newMaterialData, totalSongs: text })}
                    keyboardType="number-pad"
                    placeholderTextColor={TEACHER_COLORS.gray[400]}
                  />
                  <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs, color: TEACHER_COLORS.gray[500], marginTop: SPACING.xs }}>
                    교재의 총 곡 수 또는 페이지 수를 입력하세요 (진도율 계산에 사용됩니다)
                  </Text>
                </View>

                {/* 설명 */}
                <View style={{ marginBottom: SPACING.xl }}>
                  <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: TEACHER_COLORS.gray[700], marginBottom: SPACING.sm }}>
                    설명
                  </Text>
                  <TextInput
                    style={{
                      ...INPUT_STYLES.default,
                      padding: SPACING.md,
                      fontSize: TYPOGRAPHY.fontSize.base,
                      minHeight: 100,
                      textAlignVertical: 'top',
                    }}
                    placeholder="교재에 대한 간단한 설명을 입력하세요"
                    value={newMaterialData.description}
                    onChangeText={(text) => setNewMaterialData({ ...newMaterialData, description: text })}
                    multiline
                    numberOfLines={4}
                    placeholderTextColor={TEACHER_COLORS.gray[400]}
                  />
                </View>

                {/* 저장 버튼 */}
                <TouchableOpacity
                  onPress={handleAddNewMaterial}
                  disabled={loading}
                  style={{
                    paddingVertical: SPACING.lg,
                    borderRadius: RADIUS.xl,
                    backgroundColor: TEACHER_COLORS.primary.DEFAULT,
                    ...SHADOWS.md,
                  }}
                >
                  <Text style={{ fontSize: TYPOGRAPHY.fontSize.base, fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.white, textAlign: 'center' }}>
                    {loading ? '추가 중...' : '교재 추가하기'}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              /* 교재 목록 표시 */
              <>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
                  <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: TEACHER_COLORS.gray[700] }}>
                    교재 선택
                  </Text>
                  <TouchableOpacity
                    onPress={() => setMode('addMaterial')}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: SPACING.md,
                      paddingVertical: SPACING.sm,
                      borderRadius: RADIUS.lg,
                      backgroundColor: TEACHER_COLORS.primary[50],
                    }}
                  >
                    <Ionicons name="add-circle" size={18} color={TEACHER_COLORS.primary.DEFAULT} />
                    <Text style={{ marginLeft: 4, fontSize: TYPOGRAPHY.fontSize.xs, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: TEACHER_COLORS.primary.DEFAULT }}>
                      새 교재 추가
                    </Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={{ maxHeight: 300, marginBottom: SPACING.lg }}>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }}>
                    {materials.map((material) => (
                      <TouchableOpacity
                        key={material.id}
                        onPress={() => handleSelectMaterial(material)}
                        style={{
                          paddingHorizontal: SPACING.lg,
                          paddingVertical: SPACING.md,
                          borderRadius: RADIUS.xl,
                          borderWidth: 2,
                          borderColor: selectedMaterial?.id === material.id ? TEACHER_COLORS.primary.DEFAULT : TEACHER_COLORS.gray[200],
                          backgroundColor: selectedMaterial?.id === material.id ? TEACHER_COLORS.primary[50] : TEACHER_COLORS.white,
                          marginBottom: SPACING.sm,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: TYPOGRAPHY.fontSize.sm,
                            fontWeight: TYPOGRAPHY.fontWeight.semibold,
                            color: selectedMaterial?.id === material.id ? TEACHER_COLORS.primary.DEFAULT : TEACHER_COLORS.gray[700],
                          }}
                        >
                          {material.title}
                        </Text>
                        {material.publisher && (
                          <Text
                            style={{
                              fontSize: TYPOGRAPHY.fontSize.xs,
                              color: selectedMaterial?.id === material.id ? TEACHER_COLORS.primary[600] : TEACHER_COLORS.gray[500],
                              marginTop: 2,
                            }}
                          >
                            {material.publisher}
                          </Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                {/* 선택된 교재 정보 */}
                {selectedMaterial && (
                  <View
                    style={{
                      padding: SPACING.lg,
                      borderRadius: RADIUS.xl,
                      backgroundColor: TEACHER_COLORS.primary[50],
                      marginBottom: SPACING.lg,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
                      <Ionicons name="checkmark-circle" size={20} color={TEACHER_COLORS.primary.DEFAULT} />
                      <Text style={{ marginLeft: SPACING.sm, fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.primary.DEFAULT }}>
                        선택된 교재
                      </Text>
                    </View>
                    <Text style={{ fontSize: TYPOGRAPHY.fontSize.base, fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.gray[800], marginBottom: SPACING.xs }}>
                      {selectedMaterial.title}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap' }}>
                      {selectedMaterial.publisher && (
                        <View style={{ paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.md, backgroundColor: TEACHER_COLORS.white }}>
                          <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs, color: TEACHER_COLORS.gray[600] }}>
                            {selectedMaterial.publisher}
                          </Text>
                        </View>
                      )}
                      {selectedMaterial.level && (
                        <View style={{ paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.md, backgroundColor: TEACHER_COLORS.white }}>
                          <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs, color: TEACHER_COLORS.gray[600] }}>
                            {selectedMaterial.level}
                          </Text>
                        </View>
                      )}
                      {selectedMaterial.category && (
                        <View style={{ paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.md, backgroundColor: TEACHER_COLORS.white }}>
                          <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs, color: TEACHER_COLORS.gray[600] }}>
                            {selectedMaterial.category}
                          </Text>
                        </View>
                      )}
                      {selectedMaterial.totalSongs && (
                        <View style={{ paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.md, backgroundColor: TEACHER_COLORS.white }}>
                          <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs, color: TEACHER_COLORS.gray[600] }}>
                            총 {selectedMaterial.totalSongs}곡
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {/* 총 곡 수 */}
                <View style={{ marginBottom: SPACING.xl }}>
                  <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: TEACHER_COLORS.gray[700], marginBottom: SPACING.sm }}>
                    총 곡 수
                  </Text>
                  <TextInput
                    style={{
                      ...INPUT_STYLES.default,
                      padding: SPACING.md,
                      fontSize: TYPOGRAPHY.fontSize.base,
                    }}
                    placeholder="50"
                    value={bookData.totalSongs.toString()}
                    onChangeText={(text) => setBookData({ ...bookData, totalSongs: text })}
                    keyboardType="number-pad"
                    placeholderTextColor={TEACHER_COLORS.gray[400]}
                  />
                  {selectedMaterial?.totalSongs && (
                    <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs, color: TEACHER_COLORS.success[600], marginTop: SPACING.xs }}>
                      ✓ 교재 DB에서 자동으로 가져온 값입니다
                    </Text>
                  )}
                </View>

                {/* 저장 버튼 */}
                <TouchableOpacity
                  onPress={handleCreateBook}
                  disabled={loading || !selectedMaterial}
                  style={{
                    paddingVertical: SPACING.lg,
                    borderRadius: RADIUS.xl,
                    backgroundColor: !selectedMaterial ? TEACHER_COLORS.gray[300] : TEACHER_COLORS.primary.DEFAULT,
                    ...SHADOWS.md,
                  }}
                >
                  <Text style={{ fontSize: TYPOGRAPHY.fontSize.base, fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.white, textAlign: 'center' }}>
                    {loading ? '저장 중...' : selectedMaterial ? '교재 추가' : '교재를 선택해주세요'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        ) : (
          /* 곡 추가 모드 */
          <View style={{ padding: SPACING.xl }}>
            {/* 곡 번호 */}
            <View style={{ marginBottom: SPACING.lg }}>
              <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: TEACHER_COLORS.gray[700], marginBottom: SPACING.sm }}>
                곡 번호 *
              </Text>
              <TextInput
                style={{
                  ...INPUT_STYLES.default,
                  padding: SPACING.md,
                  fontSize: TYPOGRAPHY.fontSize.base,
                }}
                placeholder="예: 45, 30-5"
                value={songData.number}
                onChangeText={(text) => setSongData({ ...songData, number: text })}
                placeholderTextColor={TEACHER_COLORS.gray[400]}
              />
            </View>

            {/* 곡 제목 (선택) */}
            <View style={{ marginBottom: SPACING.lg }}>
              <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: TEACHER_COLORS.gray[700], marginBottom: SPACING.sm }}>
                곡 제목 (선택)
              </Text>
              <TextInput
                style={{
                  ...INPUT_STYLES.default,
                  padding: SPACING.md,
                  fontSize: TYPOGRAPHY.fontSize.base,
                }}
                placeholder="비워두면 자동으로 생성됩니다"
                value={songData.title}
                onChangeText={(text) => setSongData({ ...songData, title: text })}
                placeholderTextColor={TEACHER_COLORS.gray[400]}
              />
            </View>

            {/* 상태 */}
            <View style={{ marginBottom: SPACING.lg }}>
              <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: TEACHER_COLORS.gray[700], marginBottom: SPACING.sm }}>
                학습 상태
              </Text>
              <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
                {[
                  { value: 'not_started', label: '대기', color: TEACHER_COLORS.gray },
                  { value: 'in_progress', label: '진행중', color: TEACHER_COLORS.warning },
                  { value: 'completed', label: '완료', color: TEACHER_COLORS.success },
                ].map((status) => (
                  <TouchableOpacity
                    key={status.value}
                    onPress={() => setSongData({ ...songData, status: status.value })}
                    style={{
                      flex: 1,
                      paddingVertical: SPACING.md,
                      borderRadius: RADIUS.lg,
                      borderWidth: 2,
                      borderColor: songData.status === status.value ? status.color[500] : TEACHER_COLORS.gray[200],
                      backgroundColor: songData.status === status.value ? status.color[50] : TEACHER_COLORS.white,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: TYPOGRAPHY.fontSize.sm,
                        fontWeight: TYPOGRAPHY.fontWeight.medium,
                        color: songData.status === status.value ? status.color[600] : TEACHER_COLORS.gray[600],
                        textAlign: 'center',
                      }}
                    >
                      {status.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 난이도 */}
            <View style={{ marginBottom: SPACING.lg }}>
              <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: TEACHER_COLORS.gray[700], marginBottom: SPACING.sm }}>
                난이도
              </Text>
              <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
                {[
                  { value: 'beginner', label: '초급' },
                  { value: 'intermediate', label: '중급' },
                  { value: 'advanced', label: '고급' },
                ].map((diff) => (
                  <TouchableOpacity
                    key={diff.value}
                    onPress={() => setSongData({ ...songData, difficulty: diff.value })}
                    style={{
                      flex: 1,
                      paddingVertical: SPACING.md,
                      borderRadius: RADIUS.lg,
                      borderWidth: 2,
                      borderColor: songData.difficulty === diff.value ? TEACHER_COLORS.primary.DEFAULT : TEACHER_COLORS.gray[200],
                      backgroundColor: songData.difficulty === diff.value ? TEACHER_COLORS.primary[50] : TEACHER_COLORS.white,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: TYPOGRAPHY.fontSize.sm,
                        fontWeight: TYPOGRAPHY.fontWeight.medium,
                        color: songData.difficulty === diff.value ? TEACHER_COLORS.primary.DEFAULT : TEACHER_COLORS.gray[600],
                        textAlign: 'center',
                      }}
                    >
                      {diff.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 학습 단계 */}
            <ProgressStepSelector
              value={songData.learningStep}
              songNumber={songData.number}
              songTitle={songData.title || (existingProgress ? `${existingProgress.book.name} ${songData.number}번` : '')}
              onChange={(learningStep) => setSongData({ ...songData, learningStep })}
              onGenerateMemo={(memoText) => {
                // 메모 필드에 반영
                setSongData({ ...songData, notes: memoText });
              }}
              existingNotes={songData.notes}
              onAiImprove={async (learningStepData) => {
                const result = await improveLearningStepMemo(
                  learningStepData,
                  learningStepData.existingNotes
                );
                if (result.success) {
                  setSongData({ ...songData, notes: result.improvedMemo });
                  toast.success('AI가 메모를 개선했습니다!');
                } else {
                  toast.error('AI 개선에 실패했습니다');
                }
              }}
            />

            {/* 메모 */}
            <View style={{ marginBottom: SPACING.xl }}>
              <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: TEACHER_COLORS.gray[700], marginBottom: SPACING.sm }}>
                메모 (선택)
              </Text>
              <TextInput
                style={{
                  ...INPUT_STYLES.default,
                  padding: SPACING.md,
                  fontSize: TYPOGRAPHY.fontSize.base,
                  minHeight: 80,
                  textAlignVertical: 'top',
                }}
                placeholder="특이사항이나 연습 포인트를 입력하세요"
                value={songData.notes}
                onChangeText={(text) => setSongData({ ...songData, notes: text })}
                multiline
                numberOfLines={4}
                placeholderTextColor={TEACHER_COLORS.gray[400]}
              />
            </View>

            {/* 저장 버튼 */}
            <TouchableOpacity
              onPress={handleAddSong}
              disabled={loading}
              style={{
                paddingVertical: SPACING.lg,
                borderRadius: RADIUS.xl,
                backgroundColor: TEACHER_COLORS.primary.DEFAULT,
                ...SHADOWS.md,
              }}
            >
              <Text style={{ fontSize: TYPOGRAPHY.fontSize.base, fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.white, textAlign: 'center' }}>
                {loading ? '저장 중...' : '곡 추가'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </BottomSheet>
  );
}
