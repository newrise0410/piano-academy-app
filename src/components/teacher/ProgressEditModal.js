// src/components/teacher/ProgressEditModal.js
import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../common';
import BottomSheet from '../common/BottomSheet';
import TEACHER_COLORS from '../../styles/teacher_colors';
import { SHADOWS, RADIUS, SPACING, TYPOGRAPHY, INPUT_STYLES, CARD_STYLES } from '../../styles/commonStyles';
import { ProgressRepository } from '../../repositories/ProgressRepository';
import { useToastStore, useAuthStore } from '../../store';
import { getMaterials } from '../../services/firestoreService';

/**
 * ProgressEditModal - 진도 정보 수정 모달
 * 교재 재선택 및 기본 정보 수정
 */
export default function ProgressEditModal({
  visible,
  onClose,
  progress,
  onSaved,
  navigation,
}) {
  const toast = useToastStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  const [formData, setFormData] = useState({
    totalSongs: 50,
    completedUpTo: 0, // 몇 곡까지 완료했는지
  });

  // 교재 DB에서 교재 목록 로드
  const loadMaterials = async () => {
    if (!user?.academyId) return;

    setMaterialsLoading(true);
    try {
      const result = await getMaterials(user.academyId);
      if (result.success) {
        setMaterials(result.data);

        // 현재 교재의 materialId로 기존 교재 찾기
        if (progress?.book?.materialId) {
          const currentMaterial = result.data.find(m => m.id === progress.book.materialId);
          if (currentMaterial) {
            setSelectedMaterial(currentMaterial);
          }
        }
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
    if (visible && progress) {
      // 현재 완료된 곡 개수 계산
      const completedSongs = progress.songs?.filter(s => s.status === 'completed') || [];
      const maxCompleted = completedSongs.length > 0
        ? Math.max(...completedSongs.map(s => parseInt(s.number) || 0))
        : 0;

      setFormData({
        totalSongs: progress.book.totalSongs || 50,
        completedUpTo: maxCompleted,
      });
      loadMaterials();
    }
  }, [visible, progress]);

  const handleSelectMaterial = (material) => {
    setSelectedMaterial(material);
    setFormData({
      ...formData,
      totalSongs: material.totalSongs || 50,
    });
  };

  // 곡들을 completed 상태로 업데이트
  const updateCompletedSongs = async (progressId, completedUpTo) => {
    if (completedUpTo <= 0) return;

    const today = new Date().toISOString().split('T')[0];

    // 1부터 completedUpTo까지 곡들을 completed로 업데이트
    for (let i = 1; i <= completedUpTo; i++) {
      const songData = {
        number: i.toString(),
        title: `${selectedMaterial?.title || progress.book.name} ${i}번`,
        status: 'completed',
        completedDate: today,
        updatedBy: 'manual',
      };

      await ProgressRepository.updateSong(progressId, songData);
    }
  };

  const handleUpdate = async () => {
    if (!selectedMaterial) {
      toast.warning('교재를 선택해주세요');
      return;
    }

    setLoading(true);
    try {
      // 1. 교재 정보 업데이트
      const updates = {
        book: {
          name: selectedMaterial.title,
          category: selectedMaterial.category,
          totalSongs: parseInt(formData.totalSongs) || 50,
          materialId: selectedMaterial.id,
          publisher: selectedMaterial.publisher,
          level: selectedMaterial.level,
        },
      };

      await ProgressRepository.update(progress.id, updates);

      // 2. 완료된 곡들 업데이트
      const completedUpTo = parseInt(formData.completedUpTo) || 0;
      if (completedUpTo > 0) {
        await updateCompletedSongs(progress.id, completedUpTo);
        toast.success(`교재 정보 및 ${completedUpTo}곡까지 완료 처리되었습니다`);
      } else {
        toast.success('교재 정보가 업데이트되었습니다');
      }

      onSaved && onSaved();
      onClose();
    } catch (error) {
      console.error('진도 업데이트 실패:', error);
      toast.error('업데이트에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  if (!progress) return null;

  // 변경사항 확인
  const currentCompletedCount = progress.songs?.filter(s => s.status === 'completed').length || 0;
  const hasChanges = selectedMaterial && (
    selectedMaterial.id !== progress.book.materialId ||
    parseInt(formData.totalSongs) !== progress.book.totalSongs ||
    parseInt(formData.completedUpTo) !== currentCompletedCount
  );

  const isCurrentMaterial = selectedMaterial?.id === progress.book.materialId;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="교재 정보 수정"
      subtitle={progress.book.name}
      height="large"
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ padding: SPACING.xl }}>
          {/* 현재 교재 정보 - 간결하게 */}
          <View style={{ marginBottom: SPACING.lg }}>
            <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs, color: TEACHER_COLORS.gray[500], marginBottom: SPACING.xs }}>
              현재 사용 중인 교재
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: SPACING.xs }}>
              <Text style={{ fontSize: TYPOGRAPHY.fontSize.base, fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.gray[800] }}>
                {progress.book.name}
              </Text>
              {progress.book.publisher && (
                <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: TEACHER_COLORS.gray[500] }}>
                  · {progress.book.publisher}
                </Text>
              )}
              {progress.book.level && (
                <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: TEACHER_COLORS.gray[500] }}>
                  · {progress.book.level}
                </Text>
              )}
              {progress.book.totalSongs && (
                <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: TEACHER_COLORS.gray[500] }}>
                  · {progress.book.totalSongs}곡
                </Text>
              )}
            </View>
          </View>

          {materialsLoading ? (
            <View style={{ padding: SPACING['4xl'], alignItems: 'center' }}>
              <ActivityIndicator size="large" color={TEACHER_COLORS.primary.DEFAULT} />
              <Text style={{ marginTop: SPACING.md, fontSize: TYPOGRAPHY.fontSize.sm, color: TEACHER_COLORS.gray[500] }}>
                교재 목록 불러오는 중...
              </Text>
            </View>
          ) : materials.length === 0 ? (
            <View style={{ padding: SPACING.xl, alignItems: 'center' }}>
              <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: TEACHER_COLORS.gray[500], marginBottom: SPACING.lg }}>
                등록된 교재가 없습니다
              </Text>
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
                  backgroundColor: TEACHER_COLORS.primary.DEFAULT,
                }}
              >
                <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: TEACHER_COLORS.white }}>
                  교재 관리로 이동
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* 교재 선택 */}
              <View style={{ marginBottom: SPACING.lg }}>
                <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: TEACHER_COLORS.gray[700], marginBottom: SPACING.md }}>
                  {isCurrentMaterial ? '동일한 교재를 선택하거나 다른 교재로 변경하세요' : '다른 교재를 선택하세요'}
                </Text>

                <ScrollView style={{ maxHeight: 250 }} showsVerticalScrollIndicator={false}>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }}>
                    {materials.map((material) => {
                      const isSelected = selectedMaterial?.id === material.id;
                      const isCurrent = material.id === progress.book.materialId;

                      return (
                        <TouchableOpacity
                          key={material.id}
                          onPress={() => handleSelectMaterial(material)}
                          style={{
                            paddingHorizontal: SPACING.lg,
                            paddingVertical: SPACING.md,
                            borderRadius: RADIUS.lg,
                            borderWidth: 2,
                            borderColor: isSelected
                              ? TEACHER_COLORS.primary.DEFAULT
                              : isCurrent
                              ? TEACHER_COLORS.gray[300]
                              : TEACHER_COLORS.gray[200],
                            backgroundColor: isSelected
                              ? TEACHER_COLORS.primary[50]
                              : TEACHER_COLORS.white,
                            position: 'relative',
                          }}
                        >
                          {isCurrent && !isSelected && (
                            <View style={{ position: 'absolute', top: 4, right: 4 }}>
                              <Ionicons name="checkmark-circle" size={16} color={TEACHER_COLORS.gray[400]} />
                            </View>
                          )}
                          <Text
                            style={{
                              fontSize: TYPOGRAPHY.fontSize.sm,
                              fontWeight: TYPOGRAPHY.fontWeight.semibold,
                              color: isSelected ? TEACHER_COLORS.primary.DEFAULT : TEACHER_COLORS.gray[700],
                            }}
                          >
                            {material.title}
                          </Text>
                          {material.publisher && (
                            <Text
                              style={{
                                fontSize: TYPOGRAPHY.fontSize.xs,
                                color: isSelected ? TEACHER_COLORS.primary[600] : TEACHER_COLORS.gray[500],
                                marginTop: 2,
                              }}
                            >
                              {material.publisher}
                            </Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>

              {/* 변경 사항 요약 */}
              {selectedMaterial && (
                <View
                  style={{
                    padding: SPACING.lg,
                    borderRadius: RADIUS.xl,
                    backgroundColor: isCurrentMaterial
                      ? TEACHER_COLORS.gray[50]
                      : TEACHER_COLORS.primary[50],
                    marginBottom: SPACING.lg,
                    borderWidth: 1,
                    borderColor: isCurrentMaterial
                      ? TEACHER_COLORS.gray[200]
                      : TEACHER_COLORS.primary[200],
                  }}
                >
                  {isCurrentMaterial ? (
                    <>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
                        <Ionicons name="information-circle-outline" size={20} color={TEACHER_COLORS.gray[600]} />
                        <Text style={{ marginLeft: SPACING.sm, fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.gray[700] }}>
                          현재와 동일한 교재
                        </Text>
                      </View>
                      <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: TEACHER_COLORS.gray[600], lineHeight: 20, marginBottom: SPACING.sm }}>
                        총 곡 수 또는 진도를 수정하거나, 다른 교재를 선택하세요
                      </Text>
                      {(parseInt(formData.totalSongs) !== progress.book.totalSongs || parseInt(formData.completedUpTo) !== currentCompletedCount) && (
                        <View style={{ marginTop: SPACING.sm, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: TEACHER_COLORS.gray[200] }}>
                          <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs, color: TEACHER_COLORS.gray[500] }}>
                            현재: {currentCompletedCount}/{progress.book.totalSongs}곡 ({Math.round((currentCompletedCount / progress.book.totalSongs) * 100)}%)
                          </Text>
                          <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs, fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.primary[700] }}>
                            변경: {formData.completedUpTo}/{formData.totalSongs}곡 ({Math.round((formData.completedUpTo / parseInt(formData.totalSongs)) * 100)}%)
                          </Text>
                        </View>
                      )}
                    </>
                  ) : (
                    <>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
                        <Ionicons name="swap-horizontal" size={20} color={TEACHER_COLORS.primary[600]} />
                        <Text style={{ marginLeft: SPACING.sm, fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.primary[700] }}>
                          변경 내용
                        </Text>
                      </View>

                      {/* Before */}
                      <View style={{ marginBottom: SPACING.sm }}>
                        <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs, color: TEACHER_COLORS.gray[500], marginBottom: 4 }}>
                          변경 전
                        </Text>
                        <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: TEACHER_COLORS.gray[600] }}>
                          {progress.book.name} · {progress.book.publisher || '출판사 미지정'}
                        </Text>
                        <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: TEACHER_COLORS.gray[600] }}>
                          총 {progress.book.totalSongs}곡 / {currentCompletedCount}곡 완료 ({Math.round((currentCompletedCount / progress.book.totalSongs) * 100)}%)
                        </Text>
                      </View>

                      {/* Arrow */}
                      <View style={{ alignItems: 'center', marginVertical: SPACING.xs }}>
                        <Ionicons name="arrow-down" size={16} color={TEACHER_COLORS.primary[500]} />
                      </View>

                      {/* After */}
                      <View>
                        <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs, color: TEACHER_COLORS.gray[500], marginBottom: 4 }}>
                          변경 후
                        </Text>
                        <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.primary[700] }}>
                          {selectedMaterial.title} · {selectedMaterial.publisher || '출판사 미지정'}
                        </Text>
                        <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.primary[700] }}>
                          총 {formData.totalSongs}곡 / {formData.completedUpTo}곡 완료 ({Math.round((formData.completedUpTo / parseInt(formData.totalSongs)) * 100)}%)
                        </Text>
                      </View>
                    </>
                  )}
                </View>
              )}

              {/* 총 곡 수 및 현재 진도 */}
              {selectedMaterial && (
                <>
                  <View style={{ marginBottom: SPACING.lg }}>
                    <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: TEACHER_COLORS.gray[700], marginBottom: SPACING.sm }}>
                      총 곡 수 {selectedMaterial?.totalSongs ? '(자동 입력됨)' : ''}
                    </Text>
                    <TextInput
                      style={{
                        ...INPUT_STYLES.default,
                        padding: SPACING.md,
                        fontSize: TYPOGRAPHY.fontSize.base,
                      }}
                      placeholder="50"
                      value={formData.totalSongs.toString()}
                      onChangeText={(text) => setFormData({ ...formData, totalSongs: text })}
                      keyboardType="number-pad"
                      placeholderTextColor={TEACHER_COLORS.gray[400]}
                    />
                    {selectedMaterial?.totalSongs && (
                      <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs, color: TEACHER_COLORS.gray[500], marginTop: SPACING.xs }}>
                        교재 DB 정보를 자동으로 가져왔습니다. 필요시 수정 가능합니다.
                      </Text>
                    )}
                  </View>

                  <View style={{ marginBottom: SPACING.xl }}>
                    <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: TEACHER_COLORS.gray[700], marginBottom: SPACING.sm }}>
                      현재까지 완료한 곡 번호
                    </Text>
                    <TextInput
                      style={{
                        ...INPUT_STYLES.default,
                        padding: SPACING.md,
                        fontSize: TYPOGRAPHY.fontSize.base,
                      }}
                      placeholder="예: 15 (1~15번 완료)"
                      value={formData.completedUpTo.toString()}
                      onChangeText={(text) => setFormData({ ...formData, completedUpTo: text })}
                      keyboardType="number-pad"
                      placeholderTextColor={TEACHER_COLORS.gray[400]}
                    />
                    <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs, color: TEACHER_COLORS.gray[500], marginTop: SPACING.xs }}>
                      {formData.completedUpTo > 0
                        ? `1번부터 ${formData.completedUpTo}번까지 완료 처리됩니다 (${Math.round((formData.completedUpTo / parseInt(formData.totalSongs)) * 100)}%)`
                        : '완료한 곡이 없으면 0으로 입력하세요'}
                    </Text>
                  </View>
                </>
              )}

              {/* 저장 버튼 */}
              <TouchableOpacity
                onPress={handleUpdate}
                disabled={loading || !selectedMaterial || !hasChanges}
                style={{
                  paddingVertical: SPACING.lg,
                  borderRadius: RADIUS.xl,
                  backgroundColor: !selectedMaterial || !hasChanges
                    ? TEACHER_COLORS.gray[300]
                    : TEACHER_COLORS.primary.DEFAULT,
                  ...SHADOWS.md,
                }}
              >
                <Text style={{ fontSize: TYPOGRAPHY.fontSize.base, fontWeight: TYPOGRAPHY.fontWeight.bold, color: TEACHER_COLORS.white, textAlign: 'center' }}>
                  {loading
                    ? '업데이트 중...'
                    : !selectedMaterial
                    ? '교재를 선택해주세요'
                    : !hasChanges
                    ? '변경사항 없음'
                    : '교재 정보 업데이트'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </BottomSheet>
  );
}
