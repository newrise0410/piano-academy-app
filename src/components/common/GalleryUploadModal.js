// src/components/common/GalleryUploadModal.js
import React, { useState } from 'react';
import { View, Modal, ScrollView, TouchableOpacity, Image, TextInput, Alert, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from './Text';
import Button from './Button';
import FormInput from './FormInput';
import FilterChip from './FilterChip';
import ImageUploadButton from './ImageUploadButton';

export default function GalleryUploadModal({ visible, onClose, onUpload, students = [], albums = [] }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('lesson');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [albumName, setAlbumName] = useState('');

  const categories = [
    { value: 'lesson', label: '수업' },
    { value: 'practice', label: '연습' },
    { value: 'event', label: '이벤트' },
    { value: 'achievement', label: '성취' },
  ];

  const handleImageSelected = (image) => {
    setSelectedImage(image);
  };

  const toggleStudent = (studentId) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSubmit = () => {
    if (!selectedImage) {
      Alert.alert('알림', '사진 또는 영상을 선택해주세요.');
      return;
    }
    if (!title.trim()) {
      Alert.alert('알림', '제목을 입력해주세요.');
      return;
    }

    const uploadData = {
      image: selectedImage,
      title: title.trim(),
      description: description.trim(),
      category,
      studentIds: selectedStudents,
      album: albumName.trim() || '기본 앨범',
    };

    onUpload && onUpload(uploadData);
    handleClose();
  };

  const handleClose = () => {
    setSelectedImage(null);
    setTitle('');
    setDescription('');
    setCategory('lesson');
    setSelectedStudents([]);
    setAlbumName('');
    onClose && onClose();
  };

  const statusBarHeight = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-gray-50" style={{ paddingTop: statusBarHeight }}>
        {/* 헤더 */}
        <View className="px-5 py-3 bg-white flex-row items-center justify-between border-b border-gray-200">
          <TouchableOpacity onPress={handleClose}>
            <Text className="text-base font-semibold text-gray-600">취소</Text>
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-800">사진/영상 업로드</Text>
          <TouchableOpacity onPress={handleSubmit}>
            <Text className="text-base font-semibold text-purple-600">완료</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-5 py-4">
            {/* 이미지 선택 */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">사진/영상</Text>
              {selectedImage ? (
                <View className="relative">
                  <Image
                    source={{ uri: selectedImage.uri }}
                    className="w-full h-64 rounded-xl"
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    onPress={() => setSelectedImage(null)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 items-center justify-center"
                  >
                    <Ionicons name="close" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="w-full h-48 rounded-xl bg-gray-100 items-center justify-center border-2 border-dashed border-gray-300">
                  <ImageUploadButton
                    onImageSelected={handleImageSelected}
                    iconSize={48}
                    iconColor="#9CA3AF"
                  />
                  <Text className="text-gray-500 mt-3">사진 또는 영상 추가</Text>
                </View>
              )}
            </View>

            {/* 제목 */}
            <FormInput
              label="제목"
              value={title}
              onChangeText={setTitle}
              placeholder="제목을 입력하세요"
              required
            />

            {/* 설명 */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">설명</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="설명을 입력하세요 (선택사항)"
                multiline
                numberOfLines={4}
                className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-800"
                style={{ textAlignVertical: 'top' }}
              />
            </View>

            {/* 카테고리 */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">카테고리</Text>
              <View className="flex-row flex-wrap -mx-1">
                {categories.map((cat) => (
                  <View key={cat.value} className="px-1 mb-2">
                    <FilterChip
                      label={cat.label}
                      selected={category === cat.value}
                      onPress={() => setCategory(cat.value)}
                    />
                  </View>
                ))}
              </View>
            </View>

            {/* 앨범 */}
            <FormInput
              label="앨범"
              value={albumName}
              onChangeText={setAlbumName}
              placeholder="앨범 이름 (선택사항)"
            />

            {/* 학생 선택 */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                관련 학생 선택 (선택사항)
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="-mx-5 px-5"
              >
                <View className="flex-row">
                  {students.map((student) => (
                    <TouchableOpacity
                      key={student.id}
                      onPress={() => toggleStudent(student.id)}
                      className={`mr-2 px-4 py-2 rounded-full border ${
                        selectedStudents.includes(student.id)
                          ? 'bg-purple-600 border-purple-600'
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      <Text
                        className={`text-sm font-semibold ${
                          selectedStudents.includes(student.id)
                            ? 'text-white'
                            : 'text-gray-700'
                        }`}
                      >
                        {student.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
