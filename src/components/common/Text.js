// src/components/common/Text.js
import React from 'react';
import { Text as RNText, StyleSheet } from 'react-native';

export default function Text({ className = '', style, children, ...props }) {
  // className에서 font-weight 관련 클래스 추출
  const fontWeightClass = className.match(/font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)/)?.[0];

  // style에서 fontWeight 추출
  const styleArray = Array.isArray(style) ? style : [style];
  const fontWeight = styleArray.reduce((acc, s) => s?.fontWeight || acc, null);

  // font-weight에 따라 적절한 폰트 패밀리 매핑 (Pretendard)
  const getFontFamily = () => {
    // style의 fontWeight가 우선
    if (fontWeight) {
      const numericWeightMap = {
        '100': 'Pretendard-Thin',
        '200': 'Pretendard-ExtraLight',
        '300': 'Pretendard-Light',
        '400': 'Pretendard-Regular',
        'normal': 'Pretendard-Regular',
        '500': 'Pretendard-Medium',
        '600': 'Pretendard-SemiBold',
        'semibold': 'Pretendard-SemiBold',
        '700': 'Pretendard-Bold',
        'bold': 'Pretendard-Bold',
        '800': 'Pretendard-ExtraBold',
        '900': 'Pretendard-Black',
      };
      return numericWeightMap[fontWeight] || 'Pretendard-Regular';
    }

    // className의 font-weight 처리
    if (fontWeightClass) {
      const classWeightMap = {
        'font-thin': 'Pretendard-Thin',
        'font-extralight': 'Pretendard-ExtraLight',
        'font-light': 'Pretendard-Light',
        'font-normal': 'Pretendard-Regular',
        'font-medium': 'Pretendard-Medium',
        'font-semibold': 'Pretendard-SemiBold',
        'font-bold': 'Pretendard-Bold',
        'font-extrabold': 'Pretendard-ExtraBold',
        'font-black': 'Pretendard-Black',
      };
      return classWeightMap[fontWeightClass] || 'Pretendard-Regular';
    }

    return 'Pretendard-Regular';
  };

  // className에서 font-weight 클래스 제거 (충돌 방지)
  const cleanedClassName = className.replace(/font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)\s?/g, '');

  // style에서 fontWeight 제거하고 fontFamily 설정
  const cleanedStyle = styleArray.map(s => {
    if (!s) return s;
    const { fontWeight: _, ...rest } = s;
    return rest;
  });

  return (
    <RNText
      className={cleanedClassName}
      style={[{ fontFamily: getFontFamily() }, ...cleanedStyle]}
      {...props}
    >
      {children}
    </RNText>
  );
}
