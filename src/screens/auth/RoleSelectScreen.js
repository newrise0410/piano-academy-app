// src/screens/auth/RoleSelectScreen.js
import React, { useContext } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Text from '../../components/common/Text';
import { AuthContext } from '../../context/AuthContext';
import COLORS from '../../styles/colors';

export default function RoleSelectScreen({ navigation }) {
  const { login } = useContext(AuthContext);

  const handleRoleSelect = (role) => {
    // 임시 사용자 정보로 로그인
    const userData = {
      id: '1',
      name: role === 'teacher' ? '김선생' : '학부모',
      role: role,
    };

    login(userData);
    // AuthContext가 변경되면 AppNavigator가 자동으로 적절한 화면으로 이동
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-6">
      {/* 헤더 */}
      <View className="mt-12 mb-12">
        <Text className="text-3xl font-bold text-gray-800">역할 선택</Text>
        <Text className="text-base text-gray-500 mt-2">
          어떤 역할로 사용하시겠어요?
        </Text>
      </View>

      {/* 역할 선택 카드 */}
      <View className="flex-1">
        {/* 선생님 */}
        <TouchableOpacity
          className="bg-primary rounded-2xl p-6 mb-4 items-center"
          onPress={() => handleRoleSelect('teacher')}
          activeOpacity={0.8}
        >
          <View className="w-24 h-24 bg-white rounded-full items-center justify-center mb-4">
            <Ionicons name="school" size={48} color={COLORS.primary[500]} />
          </View>
          <Text className="text-white text-2xl font-bold mb-2">선생님</Text>
          <Text className="text-white opacity-90 text-center">
            학생 관리, 알림장 작성, 출석 체크
          </Text>
        </TouchableOpacity>

        {/* 학부모 */}
        <TouchableOpacity
          className="bg-pink rounded-2xl p-6 items-center"
          onPress={() => handleRoleSelect('parent')}
          activeOpacity={0.8}
        >
          <View className="w-24 h-24 bg-white rounded-full items-center justify-center mb-4">
            <Ionicons name="people" size={48} color={COLORS.pink[500]} />
          </View>
          <Text className="text-white text-2xl font-bold mb-2">학부모</Text>
          <Text className="text-white opacity-90 text-center">
            우리 아이 정보 확인, 알림장 조회
          </Text>
        </TouchableOpacity>
      </View>

      {/* 뒤로 가기 */}
      <TouchableOpacity
        className="items-center py-4 mb-8"
        onPress={() => navigation.goBack()}
      >
        <Text className="text-gray-600">뒤로 가기</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
