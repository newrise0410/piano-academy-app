import { View } from 'react-native';

/**
 * 공통 섹션 카드 컨테이너
 * 흰색 배경, rounded-3xl, 그림자 포함
 */
export default function SectionCard({ children, padding = 6, style }) {
  return (
    <View
      className={`rounded-3xl p-${padding}`}
      style={{
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 4,
        ...style,
      }}
    >
      {children}
    </View>
  );
}
