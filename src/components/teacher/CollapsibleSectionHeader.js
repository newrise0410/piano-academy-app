import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SectionCard from './SectionCard';
import GradientIconBadge from './GradientIconBadge';

/**
 * 접을 수 있는 섹션 헤더
 * 아이콘 + 제목 + 부제목 + 펼치기/접기 버튼
 */
export default function CollapsibleSectionHeader({
  iconName,
  gradientColors,
  backgroundColor,
  title,
  subtitle,
  isExpanded,
  onToggle,
}) {
  return (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.7}>
      <SectionCard>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1 mr-4">
            <View className="mr-4">
              <GradientIconBadge
                iconName={iconName}
                gradientColors={gradientColors}
                backgroundColor={backgroundColor}
                iconSize={26}
              />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-black text-xl mb-1">{title}</Text>
              <Text className="text-gray-500 text-base">{subtitle}</Text>
            </View>
          </View>
          <View className="rounded-2xl p-2" style={{ backgroundColor: '#F3F4F6' }}>
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#6B7280"
            />
          </View>
        </View>
      </SectionCard>
    </TouchableOpacity>
  );
}
