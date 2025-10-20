// src/navigation/TeacherNavigator.js
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

// 화면 import
import DashboardScreen from "../screens/teacher/DashboardScreen";
import NoticeListScreen from "../screens/teacher/NoticeListScreen";
import StudentListScreen from "../screens/teacher/StudentListScreen";
import StudentFormScreen from "../screens/teacher/StudentFormScreen";
import StudentDetailScreen from "../screens/teacher/StudentDetailScreen";
import AttendanceScreen from "../screens/teacher/AttendanceScreen";
import TuitionScreen from "../screens/teacher/TuitionScreen";
import TodayClassesScreen from "../screens/teacher/TodayClassesScreen";
import UnpaidStudentsScreen from "../screens/teacher/UnpaidStudentsScreen";
import MakeupClassesScreen from "../screens/teacher/MakeupClassesScreen";
import StatisticsScreen from "../screens/teacher/StatisticsScreen";
import GalleryScreen from "../screens/teacher/GalleryScreen";
import FirebaseTestScreen from "../screens/FirebaseTestScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// 대시보드 Stack Navigator
function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardMain" component={DashboardScreen} />
      <Stack.Screen name="StatisticsScreen" component={StatisticsScreen} />
      <Stack.Screen name="GalleryScreen" component={GalleryScreen} />
      <Stack.Screen name="FirebaseTestScreen" component={FirebaseTestScreen} />
      <Stack.Screen name="TodayClassesScreen" component={TodayClassesScreen} />
      <Stack.Screen name="UnpaidStudentsScreen" component={UnpaidStudentsScreen} />
      <Stack.Screen name="MakeupClassesScreen" component={MakeupClassesScreen} />
      <Stack.Screen name="StudentDetail" component={StudentDetailScreen} />
    </Stack.Navigator>
  );
}

// 학생 관리 Stack Navigator
function StudentStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StudentList" component={StudentListScreen} />
      <Stack.Screen name="StudentForm" component={StudentFormScreen} />
      <Stack.Screen name="StudentDetail" component={StudentDetailScreen} />
    </Stack.Navigator>
  );
}

// 메인 탭 네비게이터
export default function TeacherNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // 탭 아이콘 설정
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Dashboard") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "NoticeTab") {
            iconName = focused ? "notifications" : "notifications-outline";
          } else if (route.name === "StudentTab") {
            iconName = focused ? "people" : "people-outline";
          } else if (route.name === "Attendance") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else if (route.name === "Tuition") {
            iconName = focused ? "card" : "card-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        // 탭바 스타일
        tabBarActiveTintColor: "#8B5CF6", // 선택된 탭 색상
        tabBarInactiveTintColor: "gray", // 비활성 탭 색상
        headerShown: false, // 상단 헤더 숨기기
        tabBarLabelPosition: "below-icon", // 아이콘 아래 레이블
        tabBarStyle: {
          paddingHorizontal: 0,
          paddingBottom: 5,
          height: 60,
        },
        tabBarItemStyle: {
          paddingHorizontal: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStack}
        options={{ tabBarLabel: "대시보드" }}
      />
      <Tab.Screen
        name="NoticeTab"
        component={NoticeListScreen}
        options={{ tabBarLabel: "알림장" }}
      />
      <Tab.Screen
        name="StudentTab"
        component={StudentStack}
        options={{ tabBarLabel: "학생" }}
      />
      <Tab.Screen
        name="Attendance"
        component={AttendanceScreen}
        options={{ tabBarLabel: "출석" }}
      />
      <Tab.Screen
        name="Tuition"
        component={TuitionScreen}
        options={{ tabBarLabel: "수강료" }}
      />
    </Tab.Navigator>
  );
}
