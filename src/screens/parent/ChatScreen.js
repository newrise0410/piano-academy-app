// src/screens/parent/ChatScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../components/common';
import PARENT_COLORS from '../../styles/parent_colors';
import { useToastStore } from '../../store';

export default function ChatScreen({ navigation }) {
  const toast = useToastStore();
  const scrollViewRef = useRef();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: '안녕하세요! 이번 주 수업 관련해서 문의드립니다.',
      sender: 'parent',
      timestamp: '2024-10-23 14:30',
      isRead: true,
    },
    {
      id: 2,
      text: '네, 말씀하세요!',
      sender: 'teacher',
      timestamp: '2024-10-23 14:31',
      isRead: true,
    },
    {
      id: 3,
      text: '다음 주 수업 시간을 변경할 수 있을까요?',
      sender: 'parent',
      timestamp: '2024-10-23 14:32',
      isRead: true,
    },
    {
      id: 4,
      text: '네, 가능합니다. 언제가 좋으실까요?',
      sender: 'teacher',
      timestamp: '2024-10-23 14:33',
      isRead: true,
    },
  ]);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSend = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: message,
        sender: 'parent',
        timestamp: new Date().toLocaleString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
        isRead: false,
      };
      setMessages([...messages, newMessage]);
      setMessage('');
      Keyboard.dismiss();
      toast.info('메시지 전송 기능은 준비중입니다');
    }
  };

  const formatTime = (timestamp) => {
    const time = new Date(timestamp);
    return time.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* 헤더 */}
      <View
        className="bg-white px-5 py-4 flex-row items-center"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
          <Ionicons name="chevron-back" size={24} color={PARENT_COLORS.gray[800]} />
        </TouchableOpacity>
        <View
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: PARENT_COLORS.primary[100] }}
        >
          <Ionicons name="person" size={20} color={PARENT_COLORS.primary[600]} />
        </View>
        <View className="flex-1">
          <Text className="text-gray-900 font-bold text-lg">선생님</Text>
          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-green-500 mr-1" />
            <Text className="text-gray-500 text-sm">온라인</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => toast.info('통화 기능은 준비중입니다')}>
          <View
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: PARENT_COLORS.primary[50] }}
          >
            <Ionicons name="call" size={20} color={PARENT_COLORS.primary.DEFAULT} />
          </View>
        </TouchableOpacity>
      </View>

      {/* 메시지 목록 */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-5 py-4"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg) => {
            const isParent = msg.sender === 'parent';
            return (
              <View
                key={msg.id}
                className={`mb-3 flex-row ${isParent ? 'justify-end' : 'justify-start'}`}
              >
                <View
                  className={`max-w-[75%] ${isParent ? 'items-end' : 'items-start'}`}
                >
                  <View
                    className={`rounded-2xl px-4 py-3 ${
                      isParent ? 'rounded-tr-sm' : 'rounded-tl-sm'
                    }`}
                    style={{
                      backgroundColor: isParent
                        ? PARENT_COLORS.primary.DEFAULT
                        : 'white',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 3,
                      elevation: 2,
                    }}
                  >
                    <Text
                      className={`text-sm ${
                        isParent ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {msg.text}
                    </Text>
                  </View>
                  <View className="flex-row items-center mt-1 px-1">
                    <Text className="text-gray-400 text-xs">{formatTime(msg.timestamp)}</Text>
                    {isParent && (
                      <Text className="text-gray-400 text-xs ml-1">
                        {msg.isRead ? '읽음' : '안읽음'}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* 메시지 입력 */}
        <View
          className="bg-white px-5 py-3 flex-row items-center"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <TouchableOpacity
            onPress={() => toast.info('파일 첨부 기능은 준비중입니다')}
            className="mr-3"
          >
            <Ionicons name="add-circle-outline" size={28} color={PARENT_COLORS.gray[400]} />
          </TouchableOpacity>

          <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 py-2">
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="메시지를 입력하세요..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 text-gray-900 text-sm"
              multiline
              maxLength={500}
            />
          </View>

          <TouchableOpacity
            onPress={handleSend}
            className="ml-3"
            disabled={!message.trim()}
          >
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{
                backgroundColor: message.trim()
                  ? PARENT_COLORS.primary.DEFAULT
                  : PARENT_COLORS.gray[300],
              }}
            >
              <Ionicons name="send" size={18} color="white" />
            </View>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
