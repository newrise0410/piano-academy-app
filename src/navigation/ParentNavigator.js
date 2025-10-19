// src/navigation/ParentNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/parent/HomeScreen';
import ProgressScreen from '../screens/parent/ProgressScreen';
import AttendanceScreen from '../screens/parent/AttendanceScreen';
import TuitionScreen from '../screens/parent/TuitionScreen';
import GalleryScreen from '../screens/parent/GalleryScreen';

const Tab = createBottomTabNavigator();

export default function ParentNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Progress') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Attendance') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Tuition') {
            iconName = focused ? 'card' : 'card-outline';
          } else if (route.name === 'Gallery') {
            iconName = focused ? 'trophy' : 'trophy-outline';
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
        component={HomeScreen}
        options={{
          tabBarLabel: '홈',
        }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{
          tabBarLabel: '진도',
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
      <Tab.Screen
        name="Gallery"
        component={GalleryScreen}
        options={{
          tabBarLabel: '앨범',
        }}
      />
    </Tab.Navigator>
  );
}