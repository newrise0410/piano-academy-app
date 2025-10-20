// src/screens/FirebaseTestScreen.js
// Firebase 연결 테스트 화면

import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Alert } from 'react-native';
import { Button } from '../components/common';
import { isFirebaseConfigured } from '../config/firebase';
import { loginWithEmail, registerWithEmail, logout } from '../services/authService';
import { addStudent, getAllStudents, deleteStudent } from '../services/firestoreService';
import { getCurrentUser } from '../services/authService';

export default function FirebaseTestScreen() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('test123456');
  const [name, setName] = useState('테스트 선생님');
  const [currentUser, setCurrentUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Firebase 설정 확인
  const checkConfig = () => {
    const configured = isFirebaseConfigured();
    Alert.alert(
      'Firebase 설정 상태',
      configured ? '✅ Firebase가 올바르게 설정되었습니다!' : '❌ Firebase 설정이 필요합니다.',
      [{ text: '확인' }]
    );
  };

  // 회원가입
  const handleRegister = async () => {
    setLoading(true);
    try {
      const result = await registerWithEmail(email, password, {
        name,
        role: 'teacher',
      });

      if (result.success) {
        Alert.alert('성공', '회원가입이 완료되었습니다!');
        setCurrentUser(result.user);
      } else {
        Alert.alert('오류', result.error);
      }
    } catch (error) {
      Alert.alert('오류', error.message);
    } finally {
      setLoading(false);
    }
  };

  // 로그인
  const handleLogin = async () => {
    setLoading(true);
    try {
      const result = await loginWithEmail(email, password);

      if (result.success) {
        Alert.alert('성공', '로그인되었습니다!');
        setCurrentUser(result.user);
      } else {
        Alert.alert('오류', result.error);
      }
    } catch (error) {
      Alert.alert('오류', error.message);
    } finally {
      setLoading(false);
    }
  };

  // 로그아웃
  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      Alert.alert('성공', '로그아웃되었습니다!');
      setCurrentUser(null);
      setStudents([]);
    } catch (error) {
      Alert.alert('오류', error.message);
    } finally {
      setLoading(false);
    }
  };

  // 테스트 학생 추가
  const handleAddStudent = async () => {
    setLoading(true);
    try {
      const user = getCurrentUser();
      if (!user) {
        Alert.alert('오류', '먼저 로그인해주세요');
        return;
      }

      const studentData = {
        name: '김테스트',
        age: 10,
        category: '초등',
        level: '초급',
        tuition: 100000,
        schedule: '월, 수 17:00',
        parentName: '김학부모',
        parentPhone: '010-1234-5678',
      };

      const result = await addStudent(studentData, user.uid);

      if (result.success) {
        Alert.alert('성공', '학생이 추가되었습니다!');
        await loadStudents();
      } else {
        Alert.alert('오류', result.error);
      }
    } catch (error) {
      Alert.alert('오류', error.message);
    } finally {
      setLoading(false);
    }
  };

  // 학생 목록 불러오기
  const loadStudents = async () => {
    setLoading(true);
    try {
      const user = getCurrentUser();
      if (!user) {
        Alert.alert('오류', '먼저 로그인해주세요');
        return;
      }

      const result = await getAllStudents(user.uid);

      if (result.success) {
        setStudents(result.data);
        Alert.alert('성공', `${result.data.length}명의 학생을 불러왔습니다!`);
      } else {
        Alert.alert('오류', result.error);
      }
    } catch (error) {
      Alert.alert('오류', error.message);
    } finally {
      setLoading(false);
    }
  };

  // 학생 삭제
  const handleDeleteStudent = async (studentId) => {
    setLoading(true);
    try {
      const result = await deleteStudent(studentId);

      if (result.success) {
        Alert.alert('성공', '학생이 삭제되었습니다!');
        await loadStudents();
      } else {
        Alert.alert('오류', result.error);
      }
    } catch (error) {
      Alert.alert('오류', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <Text className="text-2xl font-bold mb-4">Firebase 연결 테스트</Text>

      {/* Firebase 설정 확인 */}
      <View className="bg-white p-4 rounded-lg mb-4">
        <Text className="text-lg font-semibold mb-2">1. Firebase 설정 확인</Text>
        <Button title="설정 확인" onPress={checkConfig} />
      </View>

      {/* 인증 테스트 */}
      <View className="bg-white p-4 rounded-lg mb-4">
        <Text className="text-lg font-semibold mb-2">2. 인증 테스트</Text>

        <TextInput
          className="border border-gray-300 rounded p-2 mb-2"
          placeholder="이메일"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          className="border border-gray-300 rounded p-2 mb-2"
          placeholder="비밀번호 (최소 6자)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TextInput
          className="border border-gray-300 rounded p-2 mb-3"
          placeholder="이름"
          value={name}
          onChangeText={setName}
        />

        <View className="flex-row gap-2 mb-2">
          <View className="flex-1">
            <Button title="회원가입" onPress={handleRegister} disabled={loading} />
          </View>
          <View className="flex-1">
            <Button title="로그인" onPress={handleLogin} disabled={loading} />
          </View>
        </View>

        <Button
          title="로그아웃"
          onPress={handleLogout}
          disabled={loading || !currentUser}
          variant="outline"
        />

        {currentUser && (
          <View className="mt-3 p-3 bg-green-50 rounded">
            <Text className="text-green-800">✅ 로그인됨: {currentUser.email}</Text>
          </View>
        )}
      </View>

      {/* Firestore 테스트 */}
      <View className="bg-white p-4 rounded-lg mb-4">
        <Text className="text-lg font-semibold mb-2">3. Firestore 테스트</Text>

        <View className="flex-row gap-2 mb-2">
          <View className="flex-1">
            <Button
              title="학생 추가"
              onPress={handleAddStudent}
              disabled={loading || !currentUser}
            />
          </View>
          <View className="flex-1">
            <Button
              title="학생 목록"
              onPress={loadStudents}
              disabled={loading || !currentUser}
              variant="outline"
            />
          </View>
        </View>

        <Text className="text-sm text-gray-600 mt-2">학생 수: {students.length}명</Text>

        {students.length > 0 && (
          <View className="mt-3">
            {students.map((student, index) => (
              <View key={student.id} className="p-3 bg-gray-50 rounded mb-2">
                <Text className="font-semibold">
                  {index + 1}. {student.name}
                </Text>
                <Text className="text-sm text-gray-600">
                  {student.category} | {student.level}
                </Text>
                <Button
                  title="삭제"
                  onPress={() => handleDeleteStudent(student.id)}
                  variant="outline"
                  className="mt-2"
                  disabled={loading}
                />
              </View>
            ))}
          </View>
        )}
      </View>

      {loading && (
        <View className="bg-blue-50 p-3 rounded">
          <Text className="text-blue-800 text-center">처리 중...</Text>
        </View>
      )}
    </ScrollView>
  );
}
