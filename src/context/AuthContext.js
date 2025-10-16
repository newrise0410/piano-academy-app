// src/context/AuthContext.js
import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 임시로 로그인 상태 true, 역할 'teacher'
  // 나중에 실제 로그인 기능 추가
  const [user, setUser] = useState({
    id: '1',
    name: '김원장',
    role: 'teacher', // 'teacher' 또는 'parent'
  });

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  // 개발 중 역할 전환 (테스트용)
  const switchRole = (role) => {
    setUser({ ...user, role });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};