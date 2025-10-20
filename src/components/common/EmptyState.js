import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from './Text';
import Button from './Button';

/**
 * EmptyState - 데이터 없음 상태 표시 컴포넌트
 *
 * @param {string} iconName - Ionicons 아이콘 이름
 * @param {string} title - 제목 텍스트
 * @param {string} description - 설명 텍스트
 * @param {string} ctaText - CTA 버튼 텍스트
 * @param {function} onCtaPress - CTA 버튼 클릭 핸들러
 * @param {string} iconColor - 아이콘 색상
 * @param {number} iconSize - 아이콘 크기
 * @param {string} variant - 스타일 변형 (default, compact, illustration)
 * @param {object} style - 추가 스타일
 */
export default function EmptyState({
  iconName = 'alert-circle-outline',
  title,
  description,
  ctaText,
  onCtaPress,
  iconColor = '#D1D5DB',
  iconSize = 64,
  variant = 'default',
  style,
  children,
}) {
  // 변형별 스타일
  const variantStyles = {
    default: {
      container: 'flex-1 items-center justify-center px-8 py-12',
      icon: 64,
      titleClass: 'text-base font-bold text-gray-700 mt-4',
      descClass: 'text-sm text-gray-500 mt-2 text-center',
    },
    compact: {
      container: 'items-center justify-center px-6 py-8',
      icon: 48,
      titleClass: 'text-sm font-semibold text-gray-600 mt-3',
      descClass: 'text-xs text-gray-400 mt-1 text-center',
    },
    illustration: {
      container: 'flex-1 items-center justify-center px-8 py-16',
      icon: 80,
      titleClass: 'text-lg font-bold text-gray-800 mt-6',
      descClass: 'text-base text-gray-600 mt-3 text-center leading-6',
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.default;

  return (
    <View className={currentVariant.container} style={style}>
      {/* 아이콘 */}
      <View
        className="items-center justify-center rounded-full"
        style={{
          width: currentVariant.icon + 32,
          height: currentVariant.icon + 32,
          backgroundColor: `${iconColor}20`,
        }}
      >
        <Ionicons
          name={iconName}
          size={iconSize || currentVariant.icon}
          color={iconColor}
        />
      </View>

      {/* 제목 */}
      {title && (
        <Text className={currentVariant.titleClass}>
          {title}
        </Text>
      )}

      {/* 설명 */}
      {description && (
        <Text className={currentVariant.descClass}>
          {description}
        </Text>
      )}

      {/* 커스텀 콘텐츠 */}
      {children}

      {/* CTA 버튼 */}
      {ctaText && onCtaPress && (
        <View className="mt-6">
          <Button
            title={ctaText}
            onPress={onCtaPress}
            variant="primary"
          />
        </View>
      )}
    </View>
  );
}

/**
 * 사전 정의된 EmptyState 변형들
 */

// 검색 결과 없음
export function NoSearchResults({ searchQuery, onClear, style }) {
  return (
    <EmptyState
      iconName="search-outline"
      title="검색 결과가 없습니다"
      description={searchQuery ? `"${searchQuery}"에 대한 검색 결과가 없습니다` : '다른 검색어를 입력해보세요'}
      ctaText={onClear ? "검색 초기화" : null}
      onCtaPress={onClear}
      iconColor="#9CA3AF"
      variant="compact"
      style={style}
    />
  );
}

// 리스트 없음
export function NoDataList({ title, description, onRefresh, style }) {
  return (
    <EmptyState
      iconName="list-outline"
      title={title || "데이터가 없습니다"}
      description={description || "아직 등록된 항목이 없습니다"}
      ctaText={onRefresh ? "새로고침" : null}
      onCtaPress={onRefresh}
      iconColor="#D1D5DB"
      variant="default"
      style={style}
    />
  );
}

// 학생 없음
export function NoStudents({ onAddStudent, style }) {
  return (
    <EmptyState
      iconName="people-outline"
      title="등록된 학생이 없습니다"
      description="새 학생을 등록하여 관리를 시작하세요"
      ctaText="학생 등록"
      onCtaPress={onAddStudent}
      iconColor="#8B5CF6"
      iconSize={72}
      variant="illustration"
      style={style}
    />
  );
}

// 공지사항 없음
export function NoNotices({ onCreateNotice, style }) {
  return (
    <EmptyState
      iconName="megaphone-outline"
      title="공지사항이 없습니다"
      description="새 공지사항을 작성하여 학부모님께 전달하세요"
      ctaText="공지 작성"
      onCtaPress={onCreateNotice}
      iconColor="#8B5CF6"
      iconSize={72}
      variant="illustration"
      style={style}
    />
  );
}

// 출석 기록 없음
export function NoAttendanceRecords({ style }) {
  return (
    <EmptyState
      iconName="calendar-outline"
      title="출석 기록이 없습니다"
      description="아직 출석 체크를 하지 않았습니다"
      iconColor="#9CA3AF"
      variant="default"
      style={style}
    />
  );
}

// 결제 내역 없음
export function NoPaymentRecords({ style }) {
  return (
    <EmptyState
      iconName="card-outline"
      title="결제 내역이 없습니다"
      description="아직 결제 기록이 없습니다"
      iconColor="#9CA3AF"
      variant="default"
      style={style}
    />
  );
}

// 네트워크 에러
export function NetworkError({ onRetry, style }) {
  return (
    <EmptyState
      iconName="cloud-offline-outline"
      title="네트워크 연결 실패"
      description="인터넷 연결을 확인하고 다시 시도해주세요"
      ctaText="재시도"
      onCtaPress={onRetry}
      iconColor="#EF4444"
      variant="default"
      style={style}
    />
  );
}

// 권한 없음
export function NoPermission({ description, style }) {
  return (
    <EmptyState
      iconName="lock-closed-outline"
      title="접근 권한이 없습니다"
      description={description || "이 기능에 접근할 수 없습니다"}
      iconColor="#F59E0B"
      variant="default"
      style={style}
    />
  );
}
