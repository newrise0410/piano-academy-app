// src/screens/teacher/AcademyInfoScreen.js
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card, ScreenHeader, Button } from '../../components/common';
import { useAuthStore } from '../../store';
import { getAcademyByOwner, getAcademyStatistics } from '../../services/academyService';
import TEACHER_COLORS from '../../styles/teacher_colors';

export default function AcademyInfoScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [academy, setAcademy] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    loadAcademyData();
  }, []);

  // 화면 포커스시 데이터 새로고침
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadAcademyData();
    });

    return unsubscribe;
  }, [navigation]);

  const loadAcademyData = async () => {
    try {
      setLoading(true);
      if (user?.uid) {
        const result = await getAcademyByOwner(user.uid);
        if (result.success) {
          setAcademy(result.data);

          // 학원이 있으면 통계 정보도 가져오기
          if (result.data) {
            const statsResult = await getAcademyStatistics(result.data.id);
            if (statsResult.success) {
              setStatistics(statsResult.data);
            }
          }
        } else {
          console.error('학원 정보 로드 실패:', result.error);
        }
      }
    } catch (error) {
      console.error('학원 정보 로드 오류:', error);
      Alert.alert('오류', '학원 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    navigation.navigate('AcademyEditScreen', { mode: 'create' });
  };

  const handleEdit = () => {
    navigation.navigate('AcademyEditScreen', {
      mode: 'edit',
      academyId: academy.id,
      academyData: academy,
    });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScreenHeader title="학원 정보" navigation={navigation} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={TEACHER_COLORS.primary.DEFAULT} />
        </View>
      </SafeAreaView>
    );
  }

  // 등록된 학원이 없는 경우
  if (!academy) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScreenHeader title="학원 정보" navigation={navigation} />

        <View className="flex-1 items-center justify-center p-5">
          <View
            className="w-32 h-32 rounded-full items-center justify-center mb-6"
            style={{ backgroundColor: TEACHER_COLORS.primary[100] }}
          >
            <Ionicons name="business-outline" size={64} color={TEACHER_COLORS.primary.DEFAULT} />
          </View>

          <Text className="text-xl font-bold text-gray-800 mb-2 text-center">
            등록된 학원이 없습니다
          </Text>
          <Text className="text-sm text-gray-500 mb-8 text-center">
            학원을 등록하여 학생과 수업을 관리해보세요
          </Text>

          <Button
            title="학원 등록하기"
            onPress={handleRegister}
            style={{ minWidth: 200 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  // 등록된 학원이 있는 경우
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScreenHeader title="학원 정보" navigation={navigation} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-5">
          {/* 학원 헤더 */}
          <Card className="mb-4">
            <View className="items-center py-6">
              <View
                className="w-24 h-24 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: TEACHER_COLORS.primary[100] }}
              >
                <Ionicons name="business" size={48} color={TEACHER_COLORS.primary.DEFAULT} />
              </View>
              <Text className="text-2xl font-bold text-gray-800 mb-1">
                {academy.name}
              </Text>
              {academy.description && (
                <Text className="text-sm text-gray-500 text-center mt-2 px-4">
                  {academy.description}
                </Text>
              )}
            </View>
          </Card>

          {/* 통계 정보 */}
          {statistics && (
            <View className="flex-row mb-4">
              <StatCard
                icon="people"
                label="등록 학생"
                value={statistics.totalStudents}
                color={TEACHER_COLORS.blue[500]}
              />
              <View className="w-2" />
              <StatCard
                icon="book"
                label="보유 교재"
                value={statistics.totalMaterials}
                color={TEACHER_COLORS.green[500]}
              />
              <View className="w-2" />
              <StatCard
                icon="calendar"
                label="진행 수업"
                value={statistics.totalClasses}
                color={TEACHER_COLORS.purple[500]}
              />
            </View>
          )}

          {/* 기본 정보 */}
          <Card className="mb-4">
            <Text className="text-lg font-bold text-gray-800 mb-4">기본 정보</Text>

            <View className="space-y-4">
              <InfoRow
                icon="business-outline"
                label="학원명"
                value={academy.name}
              />
              <InfoRow
                icon="location-outline"
                label="주소"
                value={academy.address || '-'}
              />
              <InfoRow
                icon="call-outline"
                label="전화번호"
                value={academy.phone || '-'}
              />
              <InfoRow
                icon="document-text-outline"
                label="사업자번호"
                value={academy.businessNumber || '-'}
              />
            </View>
          </Card>

          {/* 관리 메뉴 */}
          <Card className="mb-4">
            <Text className="text-lg font-bold text-gray-800 mb-4">관리</Text>

            <MenuButton
              icon="create-outline"
              label="학원 정보 수정"
              onPress={handleEdit}
            />
            <MenuButton
              icon="people-outline"
              label="학생 관리"
              onPress={() => Alert.alert('준비중', '학생 관리 기능은 준비 중입니다.')}
            />
            <MenuButton
              icon="book-outline"
              label="교재 관리"
              onPress={() => navigation.navigate('MaterialManagementScreen')}
              showDivider={false}
            />
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// 통계 카드 컴포넌트
function StatCard({ icon, label, value, color }) {
  return (
    <Card className="flex-1 items-center py-4">
      <Ionicons name={icon} size={24} color={color} />
      <Text className="text-2xl font-bold text-gray-800 mt-2">{value}</Text>
      <Text className="text-xs text-gray-500 mt-1">{label}</Text>
    </Card>
  );
}

// 정보 행 컴포넌트
function InfoRow({ icon, label, value }) {
  return (
    <View className="flex-row items-center py-3 border-b border-gray-100">
      <View
        className="w-10 h-10 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: TEACHER_COLORS.gray[100] }}
      >
        <Ionicons name={icon} size={20} color={TEACHER_COLORS.gray[600]} />
      </View>
      <View className="flex-1">
        <Text className="text-sm text-gray-500 mb-1">{label}</Text>
        <Text className="text-base font-medium text-gray-800">{value}</Text>
      </View>
    </View>
  );
}

// 메뉴 버튼 컴포넌트
function MenuButton({ icon, label, onPress, showDivider = true }) {
  return (
    <>
      <TouchableOpacity
        onPress={onPress}
        className="flex-row items-center justify-between py-4"
        activeOpacity={0.7}
      >
        <View className="flex-row items-center flex-1">
          <Ionicons name={icon} size={24} color={TEACHER_COLORS.gray[600]} />
          <Text className="text-base font-medium text-gray-800 ml-3">
            {label}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={TEACHER_COLORS.gray[400]} />
      </TouchableOpacity>
      {showDivider && <View className="h-px bg-gray-100" />}
    </>
  );
}
