// src/config/sidebarConfig.js
import TEACHER_COLORS from '../styles/teacher_colors';

/**
 * 선생님용 사이드바 메뉴 설정
 * @param {Object} navigation - React Navigation 객체
 * @param {Function} closeS idebar - 사이드바 닫기 함수
 * @returns {Array} 메뉴 섹션 배열
 */
export const getTeacherMenuSections = (navigation, closeSidebar) => [
  {
    title: '사용자',
    items: [
      {
        icon: 'person-outline',
        label: '내 정보',
        onPress: () => {
          closeSidebar();
          navigation.navigate('ProfileScreen');
        },
      },
    ],
  },
  {
    title: '학원관리',
    items: [
      {
        icon: 'business-outline',
        label: '학원 정보',
        onPress: () => {
          closeSidebar();
          navigation.navigate('AcademyInfoScreen');
        },
      },
      {
        icon: 'book-outline',
        label: '교재 관리',
        onPress: () => {
          closeSidebar();
          navigation.navigate('MaterialManagementScreen');
        },
      },
    ],
  },
  {
    title: '시스템',
    items: [
      {
        icon: 'log-out-outline',
        label: '로그아웃',
        color: TEACHER_COLORS.red[500],
        isLogout: true,
      },
    ],
  },
];

/**
 * 학부모용 사이드바 메뉴 설정 (향후 구현)
 * @param {Object} navigation - React Navigation 객체
 * @param {Function} closeSidebar - 사이드바 닫기 함수
 * @returns {Array} 메뉴 섹션 배열
 */
export const getParentMenuSections = (navigation, closeSidebar) => [
  {
    title: '사용자',
    items: [
      {
        icon: 'person-outline',
        label: '내 정보',
        onPress: () => {
          closeSidebar();
          // navigation.navigate('ParentProfile');
        },
      },
    ],
  },
  {
    title: '시스템',
    items: [
      {
        icon: 'log-out-outline',
        label: '로그아웃',
        color: '#EF4444', // red-500
        isLogout: true,
      },
    ],
  },
];
