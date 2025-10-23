import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

/**
 * 2중 원형 그라디언트 아이콘 배지
 * 외부: 연한 배경 원, 내부: 그라디언트 원 + 아이콘
 */
export default function GradientIconBadge({
  iconName,
  iconSize = 24,
  gradientColors,
  backgroundColor,
  size = 64,
  innerSize = 48,
}) {
  return (
    <View
      className="rounded-3xl"
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: backgroundColor,
      }}
    >
      <LinearGradient
        colors={gradientColors}
        style={{
          width: innerSize,
          height: innerSize,
          borderRadius: 14,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={iconName} size={iconSize} color="white" />
      </LinearGradient>
    </View>
  );
}
