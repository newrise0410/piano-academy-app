// src/navigation/ParentNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/parent/HomeScreen';
import ProgressScreen from '../screens/parent/ProgressScreen';
import AttendanceScreen from '../screens/parent/AttendanceScreen';
import TuitionScreen from '../screens/parent/TuitionScreen';
import GalleryScreen from '../screens/parent/GalleryScreen';
import NoticeScreen from '../screens/parent/NoticeScreen';
import InquiryScreen from '../screens/parent/InquiryScreen';
import LessonNoteScreen from '../screens/parent/LessonNoteScreen';
import ChildInfoScreen from '../screens/parent/ChildInfoScreen';
import ChildRegistrationRequestScreen from '../screens/parent/ChildRegistrationRequestScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// 홈 Stack Navigator (사이드바 메뉴 접근을 위해)
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="ChildInfo" component={ChildInfoScreen} />
      <Stack.Screen name="ChildRegistrationRequest" component={ChildRegistrationRequestScreen} />
      <Stack.Screen name="Inquiry" component={InquiryScreen} />
      <Stack.Screen name="Gallery" component={GalleryScreen} />
    </Stack.Navigator>
  );
}

// 탭 네비게이터 (하단 메뉴)
function ParentTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'LessonNote') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Attendance') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Tuition') {
            iconName = focused ? 'card' : 'card-outline';
          } else if (route.name === 'Notice') {
            iconName = focused ? 'mail' : 'mail-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#EC4899', // 핑크
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarLabel: '홈',
        }}
      />
      <Tab.Screen
        name="LessonNote"
        component={LessonNoteScreen}
        options={{
          tabBarLabel: '수업일지',
        }}
      />
      <Tab.Screen
        name="Notice"
        component={NoticeScreen}
        options={{
          tabBarLabel: '알림장',
        }}
      />
      <Tab.Screen
        name="Attendance"
        component={AttendanceScreen}
        options={{
          tabBarLabel: '출석',
        }}
      />
      <Tab.Screen
        name="Tuition"
        component={TuitionScreen}
        options={{
          tabBarLabel: '수강료',
        }}
      />
    </Tab.Navigator>
  );
}

// 메인 네비게이터
export default function ParentNavigator() {
  return <ParentTabs />;
}
