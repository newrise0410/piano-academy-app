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
        icon: 'calendar-outline',
        label: '수업 일정',
        onPress: () => {
          closeSidebar();
          navigation.navigate('ScheduleScreen');
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
      {
        icon: 'stats-chart-outline',
        label: '재정 관리',
        onPress: () => {
          closeSidebar();
          navigation.navigate('Tuition', {
            screen: 'FinanceManagement',
          });
        },
      },
    ],
  },
  {
    title: '소통',
    items: [
      {
        icon: 'chatbubble-ellipses-outline',
        label: '학부모 채팅',
        onPress: () => {
          closeSidebar();
          navigation.navigate('ChatList');
        },
      },
      {
        icon: 'chatbubbles-outline',
        label: '문의 관리',
        onPress: () => {
          closeSidebar();
          navigation.navigate('InquiryManagementScreen');
        },
      },
    ],
  },
  {
    title: '이벤트',
    items: [
      {
        icon: 'musical-notes-outline',
        label: '발표회 관리',
        onPress: () => {
          closeSidebar();
          navigation.navigate('RecitalManagement');
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
 * 학부모용 사이드바 메뉴 설정
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
          navigation.navigate('Profile');
        },
      },
    ],
  },
  {
    title: '자녀',
    items: [
      {
        icon: 'person-circle-outline',
        label: '우리 아이 정보',
        onPress: () => {
          closeSidebar();
          navigation.navigate('ChildInfo');
        },
      },
    ],
  },
  {
    title: '학습',
    items: [
      {
        icon: 'calendar-outline',
        label: '수업 일정',
        onPress: () => {
          closeSidebar();
          navigation.navigate('Schedule');
        },
      },
      {
        icon: 'trending-up-outline',
        label: '학습 진도',
        onPress: () => {
          closeSidebar();
          navigation.navigate('LearningProgress');
        },
      },
      {
        icon: 'musical-note-outline',
        label: '완료한 곡',
        onPress: () => {
          closeSidebar();
          navigation.navigate('CompletedSongs');
        },
      },
      {
        icon: 'checkbox-outline',
        label: '주간 과제',
        onPress: () => {
          closeSidebar();
          navigation.navigate('WeeklyHomework');
        },
      },
      {
        icon: 'videocam-outline',
        label: '수업 영상',
        onPress: () => {
          closeSidebar();
          navigation.navigate('LessonVideos');
        },
      },
    ],
  },
  {
    title: '소통',
    items: [
      {
        icon: 'chatbubble-ellipses-outline',
        label: '선생님 채팅',
        onPress: () => {
          closeSidebar();
          navigation.navigate('Chat');
        },
      },
      {
        icon: 'chatbubbles-outline',
        label: '문의하기',
        onPress: () => {
          closeSidebar();
          navigation.navigate('Inquiry');
        },
      },
      {
        icon: 'calendar-number-outline',
        label: '보강 예약',
        onPress: () => {
          closeSidebar();
          navigation.navigate('MakeupBooking');
        },
      },
    ],
  },
  {
    title: '이벤트',
    items: [
      {
        icon: 'musical-notes-outline',
        label: '발표회',
        onPress: () => {
          closeSidebar();
          navigation.navigate('Recital');
        },
      },
      {
        icon: 'trophy-outline',
        label: '갤러리',
        onPress: () => {
          closeSidebar();
          navigation.navigate('Gallery');
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
