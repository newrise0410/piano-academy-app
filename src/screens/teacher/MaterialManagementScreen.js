// src/screens/teacher/MaterialManagementScreen.js
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card, Button } from '../../components/common';
import { useAuthStore, useToastStore } from '../../store';
import TEACHER_COLORS from '../../styles/teacher_colors';
import { getMaterials, createMaterial, updateMaterial, deleteMaterial } from '../../services/firestoreService';

export default function MaterialManagementScreen({ navigation }) {
  const { user } = useAuthStore();
  const toast = useToastStore();

  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    publisher: '',
    level: '초급',
    category: '피아노',
    description: '',
  });

  const levels = ['초급', '중급', '고급'];
  const categories = ['피아노', '이론', '악보', '테크닉', '기타'];

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    if (!user?.academyId) {
      setLoading(false);
      return;
    }

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
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMaterials();
  };

  const handleOpenModal = (material = null) => {
    if (material) {
      setEditingMaterial(material);
      setFormData({
        title: material.title,
        publisher: material.publisher || '',
        level: material.level || '초급',
        category: material.category || '피아노',
        description: material.description || '',
      });
    } else {
      setEditingMaterial(null);
      setFormData({
        title: '',
        publisher: '',
        level: '초급',
        category: '피아노',
        description: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMaterial(null);
    setFormData({
      title: '',
      publisher: '',
      level: '초급',
      category: '피아노',
      description: '',
    });
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.warning('교재명을 입력해주세요');
      return;
    }

    setSubmitting(true);
    try {
      const materialData = {
        ...formData,
        teacherId: user.uid,
        academyId: user.academyId,
      };

      let result;
      if (editingMaterial) {
        result = await updateMaterial(editingMaterial.id, formData);
        if (result.success) {
          toast.success('교재가 수정되었습니다');
        }
      } else {
        result = await createMaterial(materialData);
        if (result.success) {
          toast.success('교재가 추가되었습니다');
        }
      }

      if (result.success) {
        handleCloseModal();
        loadMaterials();
      } else {
        toast.error(result.error || '작업에 실패했습니다');
      }
    } catch (error) {
      console.error('교재 저장 오류:', error);
      toast.error('교재 저장에 실패했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (material) => {
    Alert.alert(
      '교재 삭제',
      `"${material.title}" 교재를 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deleteMaterial(material.id);
              if (result.success) {
                toast.success('교재가 삭제되었습니다');
                loadMaterials();
              } else {
                toast.error(result.error || '삭제에 실패했습니다');
              }
            } catch (error) {
              console.error('교재 삭제 오류:', error);
              toast.error('교재 삭제에 실패했습니다');
            }
          },
        },
      ]
    );
  };

  const getLevelColor = (level) => {
    switch (level) {
      case '초급':
        return { bg: TEACHER_COLORS.green[50], text: TEACHER_COLORS.green[700] };
      case '중급':
        return { bg: TEACHER_COLORS.blue[50], text: TEACHER_COLORS.blue[700] };
      case '고급':
        return { bg: TEACHER_COLORS.purple[50], text: TEACHER_COLORS.purple[700] };
      default:
        return { bg: TEACHER_COLORS.gray[100], text: TEACHER_COLORS.gray[700] };
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case '피아노':
        return 'musical-notes';
      case '이론':
        return 'book';
      case '악보':
        return 'document-text';
      case '테크닉':
        return 'hand-left';
      default:
        return 'folder';
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={TEACHER_COLORS.primary.DEFAULT} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* 헤더 */}
      <View className="px-5 py-4 bg-white border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
              <Ionicons name="arrow-back" size={24} color={TEACHER_COLORS.gray[700]} />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-gray-800">교재 관리</Text>
          </View>
          <TouchableOpacity onPress={() => handleOpenModal()} activeOpacity={0.7}>
            <Ionicons name="add-circle" size={28} color={TEACHER_COLORS.primary.DEFAULT} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 통계 */}
      <View className="px-5 py-4">
        <View className="bg-white rounded-2xl p-4 flex-row justify-around" style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 3,
        }}>
          <View className="items-center">
            <Text className="text-3xl font-bold" style={{ color: TEACHER_COLORS.primary.DEFAULT }}>
              {materials.length}
            </Text>
            <Text className="text-sm text-gray-500 mt-1">전체 교재</Text>
          </View>
          <View className="w-px bg-gray-200" />
          <View className="items-center">
            <Text className="text-3xl font-bold" style={{ color: TEACHER_COLORS.green[600] }}>
              {materials.filter(m => m.level === '초급').length}
            </Text>
            <Text className="text-sm text-gray-500 mt-1">초급</Text>
          </View>
          <View className="w-px bg-gray-200" />
          <View className="items-center">
            <Text className="text-3xl font-bold" style={{ color: TEACHER_COLORS.blue[600] }}>
              {materials.filter(m => m.level === '중급').length}
            </Text>
            <Text className="text-sm text-gray-500 mt-1">중급</Text>
          </View>
          <View className="w-px bg-gray-200" />
          <View className="items-center">
            <Text className="text-3xl font-bold" style={{ color: TEACHER_COLORS.purple[600] }}>
              {materials.filter(m => m.level === '고급').length}
            </Text>
            <Text className="text-sm text-gray-500 mt-1">고급</Text>
          </View>
        </View>
      </View>

      {/* 교재 목록 */}
      <ScrollView
        className="flex-1 px-5"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {materials.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <View className="bg-gray-100 rounded-full p-8 mb-4">
              <Ionicons name="book-outline" size={64} color={TEACHER_COLORS.gray[400]} />
            </View>
            <Text className="text-gray-500 text-lg font-semibold mb-2">등록된 교재가 없습니다</Text>
            <Text className="text-gray-400 text-sm mb-6">교재를 추가해보세요</Text>
            <TouchableOpacity
              onPress={() => handleOpenModal()}
              className="rounded-xl px-6 py-3"
              style={{ backgroundColor: TEACHER_COLORS.primary.DEFAULT }}
            >
              <View className="flex-row items-center">
                <Ionicons name="add" size={20} color="white" />
                <Text className="text-white font-bold ml-2">교재 추가</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          materials.map((material) => {
            const levelColor = getLevelColor(material.level);
            return (
              <Card key={material.id} className="mb-3">
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-2">
                      <View className="rounded-full p-2 mr-3" style={{ backgroundColor: TEACHER_COLORS.primary[50] }}>
                        <Ionicons
                          name={getCategoryIcon(material.category)}
                          size={20}
                          color={TEACHER_COLORS.primary[600]}
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-lg font-bold text-gray-800" numberOfLines={1}>
                          {material.title}
                        </Text>
                        {material.publisher && (
                          <Text className="text-sm text-gray-500">{material.publisher}</Text>
                        )}
                      </View>
                    </View>

                    <View className="flex-row items-center flex-wrap gap-2 mb-2">
                      <View className="px-3 py-1 rounded-full" style={{ backgroundColor: levelColor.bg }}>
                        <Text className="text-xs font-bold" style={{ color: levelColor.text }}>
                          {material.level}
                        </Text>
                      </View>
                      <View className="px-3 py-1 rounded-full" style={{ backgroundColor: TEACHER_COLORS.gray[100] }}>
                        <Text className="text-xs font-bold text-gray-600">{material.category}</Text>
                      </View>
                    </View>

                    {material.description && (
                      <Text className="text-sm text-gray-600" numberOfLines={2}>
                        {material.description}
                      </Text>
                    )}
                  </View>

                  <View className="flex-row ml-3">
                    <TouchableOpacity
                      onPress={() => handleOpenModal(material)}
                      className="p-2"
                      activeOpacity={0.7}
                    >
                      <Ionicons name="create-outline" size={22} color={TEACHER_COLORS.blue[600]} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(material)}
                      className="p-2 ml-1"
                      activeOpacity={0.7}
                    >
                      <Ionicons name="trash-outline" size={22} color={TEACHER_COLORS.red[600]} />
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            );
          })
        )}

        <View className="h-20" />
      </ScrollView>

      {/* 교재 추가/수정 모달 */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <View className="bg-white rounded-t-3xl" style={{ maxHeight: '90%' }}>
            {/* 모달 헤더 */}
            <View className="px-5 py-4 border-b border-gray-200">
              <View className="flex-row items-center justify-between">
                <Text className="text-xl font-bold text-gray-800">
                  {editingMaterial ? '교재 수정' : '교재 추가'}
                </Text>
                <TouchableOpacity onPress={handleCloseModal}>
                  <Ionicons name="close" size={28} color={TEACHER_COLORS.gray[500]} />
                </TouchableOpacity>
              </View>
            </View>

            {/* 모달 내용 */}
            <ScrollView className="px-5 py-4">
              {/* 교재명 */}
              <View className="mb-4">
                <Text className="text-sm font-bold text-gray-700 mb-2">교재명 *</Text>
                <TextInput
                  className="bg-gray-50 rounded-xl px-4 py-3 text-base"
                  placeholder="예: 바이엘 교본"
                  value={formData.title}
                  onChangeText={(text) => setFormData({ ...formData, title: text })}
                  style={{ fontFamily: 'MaruBuri-Regular' }}
                />
              </View>

              {/* 출판사 */}
              <View className="mb-4">
                <Text className="text-sm font-bold text-gray-700 mb-2">출판사</Text>
                <TextInput
                  className="bg-gray-50 rounded-xl px-4 py-3 text-base"
                  placeholder="예: 세광음악출판사"
                  value={formData.publisher}
                  onChangeText={(text) => setFormData({ ...formData, publisher: text })}
                  style={{ fontFamily: 'MaruBuri-Regular' }}
                />
              </View>

              {/* 레벨 */}
              <View className="mb-4">
                <Text className="text-sm font-bold text-gray-700 mb-2">레벨 *</Text>
                <View className="flex-row gap-2">
                  {levels.map((level) => (
                    <TouchableOpacity
                      key={level}
                      onPress={() => setFormData({ ...formData, level })}
                      className="flex-1 rounded-xl py-3 border-2"
                      style={{
                        backgroundColor: formData.level === level ? TEACHER_COLORS.primary[50] : 'white',
                        borderColor: formData.level === level ? TEACHER_COLORS.primary.DEFAULT : TEACHER_COLORS.gray[200],
                      }}
                    >
                      <Text
                        className="text-center font-bold"
                        style={{
                          color: formData.level === level ? TEACHER_COLORS.primary.DEFAULT : TEACHER_COLORS.gray[500],
                        }}
                      >
                        {level}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* 카테고리 */}
              <View className="mb-4">
                <Text className="text-sm font-bold text-gray-700 mb-2">카테고리 *</Text>
                <View className="flex-row flex-wrap gap-2">
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      onPress={() => setFormData({ ...formData, category })}
                      className="rounded-xl px-4 py-2 border-2"
                      style={{
                        backgroundColor: formData.category === category ? TEACHER_COLORS.primary[50] : 'white',
                        borderColor: formData.category === category ? TEACHER_COLORS.primary.DEFAULT : TEACHER_COLORS.gray[200],
                      }}
                    >
                      <Text
                        className="font-bold"
                        style={{
                          color: formData.category === category ? TEACHER_COLORS.primary.DEFAULT : TEACHER_COLORS.gray[500],
                        }}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* 설명 */}
              <View className="mb-4">
                <Text className="text-sm font-bold text-gray-700 mb-2">설명</Text>
                <TextInput
                  className="bg-gray-50 rounded-xl px-4 py-3 text-base"
                  placeholder="교재에 대한 간단한 설명을 입력하세요"
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  style={{ fontFamily: 'MaruBuri-Regular', minHeight: 100 }}
                />
              </View>
            </ScrollView>

            {/* 모달 버튼 */}
            <View className="px-5 py-4 border-t border-gray-200">
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={submitting}
                className="rounded-xl py-4"
                style={{
                  backgroundColor: TEACHER_COLORS.primary.DEFAULT,
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-center text-lg">
                    {editingMaterial ? '수정하기' : '추가하기'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
