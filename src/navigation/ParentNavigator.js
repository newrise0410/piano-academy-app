// src/navigation/ParentNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/parent/HomeScreen';
import NoticeScreen from '../screens/parent/NoticeScreen';
import ChildInfoScreen from '../screens/parent/ChildInfoScreen';

const Tab = createBottomTabNavigator();

export default function ParentNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Notices') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'ChildInfo') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#EC4899', // 핑크
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ 
          tabBarLabel: '홈',
          title: '우리 아이'
        }}
      />
      <Tab.Screen 
        name="Notices" 
        component={NoticeScreen}
        options={{ 
          tabBarLabel: '알림장',
          title: '알림장'
        }}
      />
      <Tab.Screen 
        name="ChildInfo" 
        component={ChildInfoScreen}
        options={{ 
          tabBarLabel: '우리 아이',
          title: '상세 정보'
        }}
      />
    </Tab.Navigator>
  );
}