// src/components/common/FilterSection.js
import React from 'react';
import { View } from 'react-native';
import Text from './Text';
import FilterChip from './FilterChip';

/**
 * 필터 섹션 컴포넌트
 *
 * 카테고리, 레벨 등의 필터를 표시하는 재사용 가능한 컴포넌트
 *
 * @param {Array} filters - 필터 목록 [{ label, options, value, onChange, visible }]
 * @param {string} title - 섹션 제목 (선택)
 * @param {Object} containerStyle - 컨테이너 스타일 (선택)
 */
const FilterSection = React.memo(({ filters, title, containerStyle }) => {
  return (
    <View
      className="bg-white rounded-2xl p-4 mb-4"
      style={containerStyle}
    >
      {title && (
        <Text className="text-base font-bold text-gray-800 mb-3">{title}</Text>
      )}

      {filters.map((filter, index) => {
        // visible이 false면 렌더링 안함
        if (filter.visible === false) return null;

        return (
          <View
            key={filter.label || index}
            className={index < filters.length - 1 ? 'mb-3' : ''}
          >
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              {filter.label}
            </Text>
            <FilterChip
              options={filter.options.map(opt =>
                typeof opt === 'string' ? { value: opt, label: opt } : opt
              )}
              value={filter.value}
              onChange={filter.onChange}
              layout={filter.layout || 'wrapped'}
            />
          </View>
        );
      })}
    </View>
  );
});

FilterSection.displayName = 'FilterSection';

export default FilterSection;
