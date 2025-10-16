// src/components/common/Text.js
import React from 'react';
import { Text as RNText, StyleSheet } from 'react-native';

export default function Text({ className = '', style, children, ...props }) {
  // className에서 font-weight 관련 클래스 추출
  const fontWeightClass = className.match(/font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)/)?.[0];

  // font-weight에 따라 적절한 폰트 패밀리 매핑
  const getFontFamily = () => {
    if (!fontWeightClass) return 'MaruBuri-Regular';

    const weightMap = {
      'font-thin': 'MaruBuri-ExtraLight',
      'font-extralight': 'MaruBuri-ExtraLight',
      'font-light': 'MaruBuri-Light',
      'font-normal': 'MaruBuri-Regular',
      'font-medium': 'MaruBuri-Regular',
      'font-semibold': 'MaruBuri-SemiBold',
      'font-bold': 'MaruBuri-Bold',
      'font-extrabold': 'MaruBuri-Bold',
      'font-black': 'MaruBuri-Bold',
    };

    return weightMap[fontWeightClass] || 'MaruBuri-Regular';
  };

  // className에서 font-weight 클래스 제거 (충돌 방지)
  const cleanedClassName = className.replace(/font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)\s?/g, '');

  return (
    <RNText
      className={cleanedClassName}
      style={[{ fontFamily: getFontFamily() }, style]}
      {...props}
    >
      {children}
    </RNText>
  );
}
