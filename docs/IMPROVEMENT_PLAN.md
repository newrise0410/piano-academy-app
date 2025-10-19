# Piano Academy App - 구조 개선 및 확장 방안

> 작성일: 2025-10-20
> 버전: 1.0.0
> 현재 기술 스택: React Native + Expo SDK 52 + NativeWind v4

---

## 목차

1. [현재 구조 분석](#1-현재-구조-분석)
2. [1단계: 즉시 개선 가능한 구조적 이슈](#2-1단계-즉시-개선-가능한-구조적-이슈)
3. [2단계: 기능 확장 아이디어](#3-2단계-기능-확장-아이디어)
4. [3단계: 아키텍처 고도화](#4-3단계-아키텍처-고도화)
5. [우선순위 로드맵](#5-우선순위-로드맵)
6. [결론 및 Next Step](#6-결론-및-next-step)

---

## 1. 현재 구조 분석

### 1.1 디렉토리 구조

```
piano-academy-app/
├── src/
│   ├── components/
│   │   ├── common/          ✅ 재사용 컴포넌트 (StatBox, Card, ProgressBar, ListItem)
│   │   └── teacher/         ✅ 선생님 전용 컴포넌트
│   ├── screens/
│   │   ├── auth/           ✅ 인증 화면
│   │   ├── parent/         ✅ 학부모 앱 (5개 탭)
│   │   └── teacher/        ✅ 선생님 앱 (5개 탭)
│   ├── navigation/         ✅ 네비게이터 분리
│   ├── data/              ✅ Mock 데이터 중앙화
│   ├── styles/            ✅ 색상 테마 관리
│   ├── context/           ✅ AuthContext
│   ├── hooks/             ⚠️ 일부만 구현
│   └── services/          ❌ api.js 거의 비어있음
└── package.json
```

### 1.2 잘 구성된 부분

#### ✅ 컴포넌트 재사용성
- `StatBox`, `Card`, `ProgressBar`, `ListItem` 등 공통 컴포넌트 추출
- Props를 통한 색상 커스터마이징 지원
- 선생님/학부모 앱 간 일관성 유지

#### ✅ 화면 구조 분리
- 역할별 화면 분리 (auth, parent, teacher)
- 탭 네비게이션 구조 명확

#### ✅ 스타일 중앙화
- `PARENT_COLORS`, `TEACHER_COLORS` 테마 관리
- NativeWind v4로 Tailwind CSS 활용

### 1.3 개선이 필요한 부분

#### ❌ 데이터 레이어 부재
**문제점:**
- Mock 데이터를 화면에서 직접 import
- API 연동 시 모든 화면 수정 필요
- 데이터 로직과 UI 로직 혼재

**영향:**
- 유지보수성 저하
- 테스트 어려움
- 확장성 제한

#### ❌ 상태 관리 미흡
**현재:**
- AuthContext만 존재
- 화면별 로컬 state만 사용

**문제:**
- 데이터 중복 fetch
- 화면 간 데이터 공유 어려움
- 캐싱 부재

#### ❌ 에러 처리 체계 없음
- 네트워크 에러 처리 부재
- 사용자 피드백 없음
- 앱 크래시 위험

#### ❌ 타입 안정성 부재
- JavaScript 사용 (TypeScript X)
- PropTypes 검증 없음
- 런타임 에러 가능성

#### ❌ 테스트 코드 없음
- 단위 테스트 없음
- E2E 테스트 없음
- 리팩토링 시 회귀 위험

---

## 2. 1단계: 즉시 개선 가능한 구조적 이슈

### 2.1 데이터 레이어 추상화 (Repository 패턴)

#### 목적
Mock 데이터 ↔ 실제 API 전환을 쉽게 하기 위한 추상화 계층

#### 제안 구조
```
src/
├── repositories/
│   ├── StudentRepository.js
│   ├── AttendanceRepository.js
│   ├── PaymentRepository.js
│   ├── NoticeRepository.js
│   └── ProgressRepository.js
├── services/
│   ├── api/
│   │   ├── client.js        ← axios 인스턴스
│   │   ├── endpoints.js     ← API URL 상수 관리
│   │   └── interceptors.js  ← 인증 토큰, 에러 처리
│   └── storage/
│       └── AsyncStorage.js  ← 로컬 저장소 (토큰, 캐시)
```

#### 구현 예시

**StudentRepository.js**
```javascript
import { getStudents as getMockStudents } from '../data/mockStudents';
import { apiClient } from '../services/api/client';

const USE_MOCK = true; // 개발 중 토글

export const StudentRepository = {
  async getAll() {
    if (USE_MOCK) {
      return getMockStudents();
    }
    const response = await apiClient.get('/students');
    return response.data;
  },

  async getById(id) {
    if (USE_MOCK) {
      return getMockStudents().find(s => s.id === id);
    }
    const response = await apiClient.get(`/students/${id}`);
    return response.data;
  },

  async create(studentData) {
    if (USE_MOCK) {
      return addStudent(studentData);
    }
    const response = await apiClient.post('/students', studentData);
    return response.data;
  },

  async update(id, studentData) {
    if (USE_MOCK) {
      return updateStudent(id, studentData);
    }
    const response = await apiClient.put(`/students/${id}`, studentData);
    return response.data;
  },

  async delete(id) {
    if (USE_MOCK) {
      return deleteStudent(id);
    }
    await apiClient.delete(`/students/${id}`);
    return { success: true };
  }
};
```

**api/client.js**
```javascript
import axios from 'axios';
import { getAuthToken } from '../storage/AsyncStorage';

export const apiClient = axios.create({
  baseURL: 'https://api.piano-academy.com/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// 요청 인터셉터 - 인증 토큰 자동 추가
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 - 에러 처리
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 인증 만료 처리
      // logout();
    }
    return Promise.reject(error);
  }
);
```

#### 효과
- ✅ Mock ↔ API 전환이 `USE_MOCK` 플래그 하나로 가능
- ✅ 화면 코드 수정 없이 데이터 소스 변경
- ✅ 테스트 용이성 향상

---

### 2.2 전역 상태 관리 도입

#### 문제
- AuthContext만 존재
- 학생 목록, 출석 데이터 등을 매번 fetch
- 화면 간 데이터 공유 어려움

#### 해결책: Zustand 도입

**왜 Zustand?**
- ✅ 경량 (1KB)
- ✅ React Native에 최적화
- ✅ 간단한 API
- ✅ Redux DevTools 지원

#### 제안 구조
```
src/
├── store/
│   ├── authStore.js
│   ├── studentStore.js
│   ├── attendanceStore.js
│   ├── paymentStore.js
│   └── noticeStore.js
```

#### 구현 예시

**설치**
```bash
npm install zustand
```

**studentStore.js**
```javascript
import { create } from 'zustand';
import { StudentRepository } from '../repositories/StudentRepository';

export const useStudentStore = create((set, get) => ({
  // State
  students: [],
  selectedStudent: null,
  loading: false,
  error: null,

  // Actions
  fetchStudents: async () => {
    set({ loading: true, error: null });
    try {
      const students = await StudentRepository.getAll();
      set({ students, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  selectStudent: (id) => {
    const student = get().students.find(s => s.id === id);
    set({ selectedStudent: student });
  },

  addStudent: async (studentData) => {
    set({ loading: true });
    try {
      const newStudent = await StudentRepository.create(studentData);
      set((state) => ({
        students: [...state.students, newStudent],
        loading: false
      }));
      return newStudent;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateStudent: async (id, studentData) => {
    set({ loading: true });
    try {
      const updated = await StudentRepository.update(id, studentData);
      set((state) => ({
        students: state.students.map(s => s.id === id ? updated : s),
        loading: false
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteStudent: async (id) => {
    set({ loading: true });
    try {
      await StudentRepository.delete(id);
      set((state) => ({
        students: state.students.filter(s => s.id !== id),
        loading: false
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  }
}));
```

**화면에서 사용**
```javascript
// screens/teacher/StudentListScreen.js
import { useStudentStore } from '../../store/studentStore';

export default function StudentListScreen() {
  const { students, loading, error, fetchStudents } = useStudentStore();

  useEffect(() => {
    fetchStudents();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <FlatList
      data={students}
      renderItem={({ item }) => <StudentCard student={item} />}
    />
  );
}
```

---

### 2.3 컴포넌트 구조 통일

#### 현재 문제
```
components/
├── common/
└── teacher/  ← parent/ 없음
```

#### 제안 구조
```
components/
├── common/              ← 양쪽 모두 사용
│   ├── Button.js
│   ├── Card.js
│   ├── StatBox.js
│   ├── ProgressBar.js
│   ├── ListItem.js
│   └── Text.js
├── teacher/             ← 선생님 전용
│   ├── StudentCard.js
│   ├── DashboardStats.js
│   └── AttendanceStatusBadge.js
├── parent/              ← 학부모 전용 (신규)
│   ├── ChildProfileCard.js
│   └── ScheduleCard.js
└── features/            ← 기능별 복합 컴포넌트 (신규)
    ├── attendance/
    │   ├── AttendanceCalendar.js
    │   ├── AttendanceStats.js
    │   └── AttendanceLegend.js
    ├── tuition/
    │   ├── TicketCard.js
    │   ├── PaymentHistoryList.js
    │   └── ProratedBadge.js
    ├── progress/
    │   ├── BookProgress.js
    │   ├── SongList.js
    │   └── WeeklyTasks.js
    └── notice/
        ├── NoticeCard.js
        └── NoticeList.js
```

**장점:**
- 기능별 컴포넌트 응집도 향상
- 재사용성 증가
- 유지보수 용이

---

### 2.4 유틸리티 함수 정리

#### 현재 문제
- 일할계산 로직이 TuitionScreen에 하드코딩
- 출석률 계산이 중복
- 날짜 포맷팅이 여러 곳에 분산

#### 제안 구조
```
src/
├── utils/
│   ├── dateUtils.js        ← 날짜 포맷팅, 계산
│   ├── attendanceUtils.js  ← 출석률 계산
│   ├── paymentUtils.js     ← 일할계산 로직
│   ├── formatters.js       ← 숫자, 통화 포맷
│   └── validators.js       ← 입력 검증
```

#### 구현 예시

**paymentUtils.js**
```javascript
/**
 * 일할계산: 월 중간 가입 시 금액 계산
 * @param {string} startDate - 시작일 (YYYY-MM-DD)
 * @param {string} endDate - 종료일 (YYYY-MM-DD)
 * @param {number} totalAmount - 월 총 금액
 * @returns {number} 일할계산된 금액
 */
export const calculateProration = (startDate, endDate, totalAmount) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysInMonth = 30;
  const actualDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  return Math.round((totalAmount * actualDays) / daysInMonth);
};

/**
 * 수강권 만료까지 남은 일수 계산
 */
export const getDaysRemaining = (endDate) => {
  const end = new Date(endDate);
  const today = new Date();
  const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
};

/**
 * 회차권 진행률 계산
 */
export const getTicketProgress = (used, total) => {
  if (!total || total === 0) return 0;
  return Math.round((used / total) * 100);
};
```

**attendanceUtils.js**
```javascript
/**
 * 출석률 계산
 */
export const calculateAttendanceRate = (records) => {
  const totalClasses = records.length;
  if (totalClasses === 0) return 0;

  const attendedClasses = records.filter(
    r => r.status === 'present' || r.status === 'makeup'
  ).length;

  return Math.round((attendedClasses / totalClasses) * 100);
};

/**
 * 이번 달 출석 통계
 */
export const getMonthlyStats = (records, year, month) => {
  const monthRecords = records.filter(r => {
    const date = new Date(r.date);
    return date.getFullYear() === year && date.getMonth() + 1 === month;
  });

  return {
    total: monthRecords.length,
    present: monthRecords.filter(r => r.status === 'present').length,
    absent: monthRecords.filter(r => r.status === 'absent').length,
    late: monthRecords.filter(r => r.status === 'late').length,
    makeup: monthRecords.filter(r => r.status === 'makeup').length,
    rate: calculateAttendanceRate(monthRecords)
  };
};
```

**dateUtils.js**
```javascript
/**
 * 날짜를 "YYYY.MM.DD" 형식으로 포맷
 */
export const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
};

/**
 * 상대 시간 표시 ("방금 전", "2시간 전", "어제")
 */
export const getRelativeTime = (date) => {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now - target;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays === 1) return '어제';
  if (diffDays < 7) return `${diffDays}일 전`;
  return formatDate(date);
};

/**
 * 요일 가져오기
 */
export const getDayOfWeek = (date) => {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return days[new Date(date).getDay()];
};
```

**formatters.js**
```javascript
/**
 * 통화 포맷 (예: 150000 → "150,000원")
 */
export const formatCurrency = (amount) => {
  return `${amount.toLocaleString('ko-KR')}원`;
};

/**
 * 퍼센트 포맷 (예: 0.95 → "95%")
 */
export const formatPercent = (value) => {
  return `${Math.round(value * 100)}%`;
};

/**
 * 전화번호 포맷 (예: 01012345678 → "010-1234-5678")
 */
export const formatPhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{4})(\d{4})$/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  return phone;
};
```

**validators.js**
```javascript
/**
 * 이름 유효성 검사 (2~10자, 한글만)
 */
export const validateName = (name) => {
  const regex = /^[가-힣]{2,10}$/;
  return regex.test(name);
};

/**
 * 전화번호 유효성 검사
 */
export const validatePhone = (phone) => {
  const regex = /^01[0-9]-?[0-9]{4}-?[0-9]{4}$/;
  return regex.test(phone);
};

/**
 * 금액 유효성 검사 (0보다 큰 정수)
 */
export const validateAmount = (amount) => {
  return Number.isInteger(amount) && amount > 0;
};
```

---

### 2.5 에러 처리 체계 구축

#### 현재 문제
- 네트워크 에러 시 앱 크래시 가능
- 사용자 피드백 없음
- 로딩 상태 불분명

#### 해결책

**1) Error Boundary 추가**

```javascript
// components/common/ErrorBoundary.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // 에러 로깅 서비스로 전송 (예: Sentry)
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center px-5">
          <Text className="text-xl font-bold mb-2">문제가 발생했습니다</Text>
          <Text className="text-gray-600 text-center mb-4">
            앱을 다시 시작해주세요
          </Text>
          <TouchableOpacity
            className="bg-purple-500 px-6 py-3 rounded-lg"
            onPress={() => this.setState({ hasError: false })}
          >
            <Text className="text-white font-bold">다시 시도</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

**App.js에 적용**
```javascript
import ErrorBoundary from './src/components/common/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </ErrorBoundary>
  );
}
```

**2) Toast 알림 컴포넌트**

```javascript
// components/common/Toast.js
import { create } from 'zustand';

export const useToast = create((set) => ({
  visible: false,
  message: '',
  type: 'info', // 'success', 'error', 'warning', 'info'

  show: (message, type = 'info') => {
    set({ visible: true, message, type });
    setTimeout(() => set({ visible: false }), 3000);
  },

  hide: () => set({ visible: false })
}));

// 사용법
import { useToast } from '../../components/common/Toast';

const toast = useToast();
toast.show('학생이 추가되었습니다', 'success');
toast.show('오류가 발생했습니다', 'error');
```

---

## 3. 2단계: 기능 확장 아이디어

### 3.1 실시간 채팅 / 메시지 기능

#### 목적
선생님 ↔ 학부모 실시간 소통 채널

#### 주요 기능
- 1:1 채팅
- 메시지 읽음 표시
- 푸시 알림 연동
- 이미지/파일 전송
- 빠른 답장 템플릿

#### 기술 스택 옵션

**Option 1: Firebase Cloud Messaging**
- ✅ 무료 (일정 한도까지)
- ✅ 실시간
- ✅ 푸시 알림 통합
- ❌ 벤더 종속성

**Option 2: Socket.io**
- ✅ 자체 서버 제어
- ✅ 유연성
- ❌ 서버 인프라 필요

#### 제안 구조
```
src/
├── screens/
│   ├── teacher/
│   │   ├── ChatListScreen.js      ← 대화 목록
│   │   └── ChatRoomScreen.js      ← 채팅방
│   └── parent/
│       └── ChatScreen.js          ← 선생님과 채팅
├── components/features/chat/
│   ├── ChatBubble.js              ← 말풍선
│   ├── MessageInput.js            ← 입력창
│   ├── ChatHeader.js              ← 채팅방 헤더
│   └── QuickReplyButtons.js       ← 빠른 답장
├── services/
│   └── chatService.js
└── store/
    └── chatStore.js
```

#### 데이터 구조
```javascript
{
  id: 'chat_1',
  participants: {
    teacherId: 'teacher_1',
    parentId: 'parent_1',
    studentId: 'student_1'
  },
  messages: [
    {
      id: 'msg_1',
      senderId: 'teacher_1',
      text: '오늘 수업 잘 마쳤습니다',
      timestamp: '2025-10-20T16:30:00Z',
      read: true,
      type: 'text' // 'text', 'image', 'file'
    }
  ],
  lastMessage: {
    text: '오늘 수업 잘 마쳤습니다',
    timestamp: '2025-10-20T16:30:00Z'
  },
  unreadCount: 0
}
```

#### UI/UX 고려사항
- 새 메시지 도착 시 Badge 표시
- 채팅방 진입 시 자동 스크롤
- 이미지 미리보기
- 전송 실패 시 재시도 버튼

---

### 3.2 영상 녹화 및 피드백

#### 목적
학생 연주 영상 업로드 → 선생님 피드백

#### 주요 기능
- 영상 녹화 (학부모 앱)
- 영상 업로드
- 선생님 시청 및 피드백 작성
- 타임스탬프 코멘트 (예: "0:45초 부분 리듬 개선 필요")
- 연주 평가 (별점, 코멘트)

#### 필요 라이브러리
```bash
npm install expo-av expo-camera expo-image-picker
```

#### 제안 구조
```
src/
├── screens/
│   ├── parent/
│   │   ├── VideoRecordScreen.js   ← 영상 녹화
│   │   └── VideoListScreen.js     ← 업로드한 영상 목록
│   └── teacher/
│       └── VideoReviewScreen.js   ← 영상 검토 및 피드백
├── components/features/video/
│   ├── VideoPlayer.js             ← 비디오 플레이어
│   ├── VideoThumbnail.js          ← 썸네일
│   ├── FeedbackForm.js            ← 피드백 입력
│   └── TimestampComment.js        ← 시간별 코멘트
├── services/
│   └── videoService.js
└── store/
    └── videoStore.js
```

#### 데이터 구조
```javascript
{
  id: 'video_1',
  studentId: 'student_1',
  studentName: '김민지',
  title: '바이엘 48번 연습',
  videoUrl: 'https://storage.example.com/videos/video_1.mp4',
  thumbnailUrl: 'https://storage.example.com/thumbnails/video_1.jpg',
  duration: 180, // 초
  uploadDate: '2025-10-20T18:00:00Z',
  status: 'reviewed', // 'pending', 'reviewed'
  feedback: {
    teacherId: 'teacher_1',
    teacherName: '김원장',
    rating: 4,
    comment: '리듬감이 많이 좋아졌어요! 손가락 힘을 더 키워보세요',
    timestampComments: [
      {
        time: 45,
        comment: '이 부분 리듬 개선 필요'
      },
      {
        time: 120,
        comment: '완벽해요!'
      }
    ],
    reviewDate: '2025-10-20T20:00:00Z'
  }
}
```

#### 클라우드 스토리지
- AWS S3
- Cloudinary (비디오 특화)
- Firebase Storage

---

### 3.3 연습 타이머 / 기록

#### 목적
학생의 집 연습 시간을 기록하여 학습 관리

#### 주요 기능
- 연습 시작/종료 타이머
- 곡별 연습 시간 기록
- 주간/월간 통계
- 목표 시간 설정 및 달성률
- 연습 기록 공유 (학부모 → 선생님)

#### 제안 구조
```
src/
├── screens/parent/
│   ├── PracticeTimerScreen.js     ← 타이머 화면
│   └── PracticeHistoryScreen.js   ← 연습 기록
├── components/features/practice/
│   ├── Timer.js                   ← 타이머 UI
│   ├── PracticeLog.js             ← 기록 항목
│   └── WeeklyStats.js             ← 주간 통계 차트
└── store/
    └── practiceStore.js
```

#### 데이터 구조
```javascript
{
  studentId: 'student_1',
  date: '2025-10-20',
  sessions: [
    {
      id: 'session_1',
      startTime: '16:00',
      endTime: '16:30',
      duration: 30, // 분
      song: '바이엘 48번',
      notes: '리듬 연습 집중'
    },
    {
      id: 'session_2',
      startTime: '18:30',
      endTime: '18:50',
      duration: 20,
      song: '스케일 C major',
      notes: null
    }
  ],
  totalMinutes: 50,
  goalMinutes: 60,
  achievementRate: 83 // %
}
```

#### UI 아이디어
- 큰 타이머 표시
- 시작/정지 버튼
- 곡 선택 드롭다운
- 일일 목표 진행바
- 주간 차트 (react-native-chart-kit)

---

### 3.4 발표회 / 이벤트 관리

#### 목적
학원 발표회, 워크샵 등 이벤트 관리

#### 선생님 기능
- 이벤트 생성 (제목, 날짜, 장소, 설명)
- 참가자 관리
- 연주 순서 편성
- 리허설 일정 관리

#### 학부모 기능
- 이벤트 목록 조회
- 참가 신청
- 일정 캘린더 추가

#### 제안 구조
```
src/
├── screens/
│   ├── teacher/
│   │   ├── EventListScreen.js
│   │   ├── EventCreateScreen.js
│   │   └── EventManageScreen.js
│   └── parent/
│       ├── EventListScreen.js
│       └── EventDetailScreen.js
├── components/features/event/
│   ├── EventCard.js
│   ├── ParticipantList.js
│   └── PerformanceOrder.js
```

#### 데이터 구조
```javascript
{
  id: 'event_1',
  type: 'recital', // 'recital', 'workshop', 'masterclass'
  title: '2025 가을 발표회',
  date: '2025-12-25',
  time: '14:00',
  location: '○○문화센터 대강당',
  description: '2025년 마지막 발표회입니다',
  capacity: 50,
  registered: 32,
  participants: [
    {
      studentId: 'student_1',
      studentName: '김민지',
      song: '바이엘 48번',
      order: 5,
      status: 'confirmed' // 'pending', 'confirmed', 'cancelled'
    }
  ],
  createdBy: 'teacher_1',
  status: 'open' // 'draft', 'open', 'closed', 'completed'
}
```

---

### 3.5 진도 교재 관리 시스템

#### 목적
체계적인 교재별 진도 관리

#### 주요 기능
- 교재 데이터베이스 (바이엘, 체르니, 하농 등)
- 학생별 교재 진도 추적
- 곡별 난이도 표시
- 완주 기록
- 다음 학습 추천

#### 데이터 구조
```javascript
// 교재 DB
{
  id: 'book_1',
  title: '바이엘',
  category: 'beginner',
  totalSongs: 100,
  publisher: '음악춘추사',
  songs: [
    {
      number: 1,
      page: 1,
      title: '바이엘 1번',
      difficulty: 1, // 1-5
      duration: 30, // 초
      techniques: ['리듬', '손가락 독립']
    },
    // ...
  ]
}

// 학생 진도
{
  studentId: 'student_1',
  bookId: 'book_1',
  completedSongs: [1, 2, 3, ..., 48],
  currentSong: 49,
  nextRecommended: [50, 51],
  startDate: '2025-01-01',
  completionRate: 48, // %
  lastUpdated: '2025-10-20'
}
```

---

### 3.6 알림(푸시 노티) 시스템

#### 목적
중요 이벤트 실시간 알림

#### 알림 종류

**학부모 앱**
- 수업 시작 1시간 전
- 수강권 만료 3일 전
- 선생님 메시지 도착
- 새 알림장 업로드
- 숙제 미완료 알림

**선생님 앱**
- 수업 시작 30분 전
- 미수금 발생
- 학부모 메시지 도착
- 이벤트 신청 도착

#### 기술 스택
```bash
npm install expo-notifications
```

#### 구현 예시
```javascript
// services/notificationService.js
import * as Notifications from 'expo-notifications';

export const scheduleClassReminder = async (classTime, studentName) => {
  const trigger = new Date(classTime);
  trigger.setHours(trigger.getHours() - 1);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '수업 알림',
      body: `1시간 후 ${studentName} 학생 수업이 있습니다`,
      data: { type: 'class_reminder' }
    },
    trigger
  });
};

export const scheduleTicketExpiry = async (expiryDate, studentName) => {
  const trigger = new Date(expiryDate);
  trigger.setDate(trigger.getDate() - 3);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '수강권 만료 임박',
      body: `${studentName} 학생의 수강권이 3일 후 만료됩니다`,
      data: { type: 'ticket_expiry' }
    },
    trigger
  });
};
```

---

### 3.7 통계 / 리포트 기능

#### 선생님용 대시보드 확장

**매출 통계**
- 월별 수입 그래프
- 수강권 타입별 매출 비율
- 신규/갱신 비율
- 미수금 현황

**학생 통계**
- 출석률 상위/하위 학생
- 진도 현황
- 신규/이탈 학생 추이
- 학생 수 증감 그래프

**수업 통계**
- 시간대별 수업 분포
- 요일별 수업 수
- 교재별 학생 분포

#### 학부모용 리포트

**자녀 성장 리포트**
- 월별 진도 그래프
- 출석률 추이
- 완주곡 목록 타임라인
- 선생님 피드백 요약

#### 차트 라이브러리
```bash
npm install react-native-chart-kit
# or
npm install victory-native
```

#### 구현 예시
```javascript
import { LineChart } from 'react-native-chart-kit';

<LineChart
  data={{
    labels: ['1월', '2월', '3월', '4월', '5월', '6월'],
    datasets: [{
      data: [20, 45, 28, 80, 99, 43]
    }]
  }}
  width={Dimensions.get('window').width - 40}
  height={220}
  chartConfig={{
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`
  }}
/>
```

---

### 3.8 다중 학생 관리 (학부모)

#### 현재 상황
학부모는 1명의 자녀만 관리

#### 개선 방안
여러 자녀 등록 및 전환 가능

#### 데이터 구조 변경
```javascript
// Before
{
  role: 'parent',
  userId: 'parent1',
  childId: 'student_1'
}

// After
{
  role: 'parent',
  userId: 'parent1',
  children: [
    { id: 'student_1', name: '김민지', ... },
    { id: 'student_2', name: '김민수', ... }
  ],
  selectedChildId: 'student_1'
}
```

#### UI 변경
```
HomeScreen 상단에 자녀 전환 드롭다운 추가

┌─────────────────────────────┐
│  [김민지 ▼]        🔔       │
│                             │
│  프로필 카드                │
│  ...                        │
└─────────────────────────────┘
```

#### Store 수정
```javascript
// store/parentStore.js
export const useParentStore = create((set) => ({
  children: [],
  selectedChildId: null,

  selectChild: (childId) => {
    set({ selectedChildId: childId });
    // 선택한 자녀 데이터 fetch
  },

  getCurrentChild: () => {
    const state = useParentStore.getState();
    return state.children.find(c => c.id === state.selectedChildId);
  }
}));
```

---

## 4. 3단계: 아키텍처 고도화

### 4.1 TypeScript 마이그레이션

#### 목적
- 타입 안정성 확보
- 개발 생산성 향상 (자동완성)
- 리팩토링 안정성
- 런타임 에러 사전 방지

#### 마이그레이션 전략

**1단계: 설정**
```bash
npm install --save-dev typescript @types/react @types/react-native
npx tsc --init
```

**tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "esnext",
    "lib": ["esnext"],
    "jsx": "react-native",
    "strict": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "exclude": ["node_modules"]
}
```

**2단계: 타입 정의 파일 생성**
```
src/
├── types/
│   ├── student.ts
│   ├── attendance.ts
│   ├── payment.ts
│   └── notice.ts
```

**예시: types/student.ts**
```typescript
export type TicketType = 'count' | 'period';

export type StudentLevel = '초급' | '중급' | '고급';

export type StudentCategory = '초등' | '중등' | '고등' | '성인';

export interface Student {
  id: string;
  name: string;
  category: StudentCategory;
  level: StudentLevel;
  schedule: string;
  book: string;
  attendance: string;
  ticketType: TicketType;
  ticketCount: number | null;
  ticketPeriod: {
    start: string;
    end: string;
  } | null;
  unpaid: boolean;
}

export interface StudentFormData {
  name: string;
  category: StudentCategory;
  level: StudentLevel;
  schedule: string;
  book?: string;
  ticketType: TicketType;
  ticketCount?: number;
  ticketPeriod?: {
    start: string;
    end: string;
  };
}
```

**3단계: 점진적 전환**
- `common/` 컴포넌트부터 `.tsx` 전환
- Repository 레이어 타입화
- Store 타입화
- 화면 컴포넌트 순차 전환

**예시: 컴포넌트 타입화**
```typescript
// components/common/StatBox.tsx
import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from './Text';

interface StatBoxProps {
  number: string | number;
  label: string;
  variant?: 'default' | 'primary' | 'success';
  icon?: keyof typeof Ionicons.glyphMap;
  backgroundColor?: string;
  textColor?: string;
  iconColor?: string;
}

export default function StatBox({
  number,
  label,
  variant = 'default',
  icon,
  backgroundColor,
  textColor,
  iconColor
}: StatBoxProps) {
  // ...
}
```

---

### 4.2 React Query (TanStack Query) 도입

#### 목적
서버 상태 관리 최적화

#### 장점
- ✅ 자동 캐싱
- ✅ 백그라운드 자동 재검증
- ✅ 로딩/에러 상태 통일
- ✅ Optimistic Updates
- ✅ Infinite Scroll
- ✅ Prefetching

#### 설치
```bash
npm install @tanstack/react-query
```

#### 설정
```javascript
// App.js
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5분
      cacheTime: 10 * 60 * 1000, // 10분
      retry: 1
    }
  }
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}
```

#### 사용 예시

**Custom Hook**
```javascript
// hooks/useStudents.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StudentRepository } from '../repositories/StudentRepository';

export const useStudents = () => {
  return useQuery({
    queryKey: ['students'],
    queryFn: StudentRepository.getAll,
    staleTime: 5 * 60 * 1000
  });
};

export const useStudent = (id) => {
  return useQuery({
    queryKey: ['students', id],
    queryFn: () => StudentRepository.getById(id),
    enabled: !!id
  });
};

export const useAddStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: StudentRepository.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    }
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => StudentRepository.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['students', variables.id] });
    }
  });
};
```

**화면에서 사용**
```javascript
// screens/teacher/StudentListScreen.js
import { useStudents, useAddStudent } from '../../hooks/useStudents';

export default function StudentListScreen() {
  const { data: students, isLoading, error } = useStudents();
  const addStudent = useAddStudent();

  const handleAddStudent = async (studentData) => {
    try {
      await addStudent.mutateAsync(studentData);
      toast.show('학생이 추가되었습니다', 'success');
    } catch (error) {
      toast.show('추가 중 오류가 발생했습니다', 'error');
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <FlatList
      data={students}
      renderItem={({ item }) => <StudentCard student={item} />}
    />
  );
}
```

---

### 4.3 Form 관리 라이브러리 (react-hook-form)

#### 목적
복잡한 폼 상태 관리 간소화

#### 장점
- ✅ 적은 리렌더링
- ✅ 유효성 검사 통합
- ✅ 에러 처리 간편
- ✅ React Native 지원

#### 설치
```bash
npm install react-hook-form
```

#### 사용 예시

**StudentFormScreen.js**
```javascript
import { useForm, Controller } from 'react-hook-form';
import { StudentRepository } from '../../repositories/StudentRepository';

export default function StudentFormScreen({ navigation, route }) {
  const isEdit = !!route.params?.student;
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: isEdit ? route.params.student : {
      name: '',
      category: '초등',
      level: '초급',
      schedule: '',
      ticketType: 'count',
      ticketCount: 4
    }
  });

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await StudentRepository.update(route.params.student.id, data);
        toast.show('학생 정보가 수정되었습니다', 'success');
      } else {
        await StudentRepository.create(data);
        toast.show('학생이 추가되었습니다', 'success');
      }
      navigation.goBack();
    } catch (error) {
      toast.show('오류가 발생했습니다', 'error');
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="px-5 py-4">
        {/* 이름 */}
        <View className="mb-4">
          <Text className="text-gray-700 font-semibold mb-2">이름 *</Text>
          <Controller
            control={control}
            name="name"
            rules={{
              required: '이름을 입력하세요',
              minLength: { value: 2, message: '최소 2자 이상 입력하세요' }
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-4 py-3"
                placeholder="학생 이름"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
          {errors.name && (
            <Text className="text-red-500 text-sm mt-1">
              {errors.name.message}
            </Text>
          )}
        </View>

        {/* 카테고리 */}
        <View className="mb-4">
          <Text className="text-gray-700 font-semibold mb-2">카테고리</Text>
          <Controller
            control={control}
            name="category"
            render={({ field: { onChange, value } }) => (
              <View className="flex-row">
                {['초등', '중등', '고등', '성인'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    className={`flex-1 py-3 rounded-lg mx-1 ${
                      value === cat ? 'bg-purple-500' : 'bg-white border border-gray-300'
                    }`}
                    onPress={() => onChange(cat)}
                  >
                    <Text className={`text-center font-semibold ${
                      value === cat ? 'text-white' : 'text-gray-700'
                    }`}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />
        </View>

        <Button
          title={isEdit ? '수정하기' : '추가하기'}
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          disabled={isSubmitting}
        />
      </View>
    </ScrollView>
  );
}
```

---

### 4.4 에러 로깅 서비스 (Sentry)

#### 목적
프로덕션 환경에서 발생하는 에러 추적

#### 설치
```bash
npm install @sentry/react-native
npx @sentry/wizard -i reactNative
```

#### 설정
```javascript
// App.js
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  enableAutoSessionTracking: true,
  sessionTrackingIntervalMillis: 10000,
  tracesSampleRate: 1.0
});

export default Sentry.wrap(App);
```

#### 사용
```javascript
try {
  await StudentRepository.create(data);
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      feature: 'student_management',
      action: 'create'
    },
    extra: {
      studentData: data
    }
  });
  toast.show('오류가 발생했습니다', 'error');
}
```

---

### 4.5 성능 모니터링

#### React Native Performance
```bash
npm install react-native-performance
```

#### 화면 렌더링 최적화
- `React.memo()` 활용
- `useMemo()`, `useCallback()` 적절히 사용
- FlatList `getItemLayout` 지정
- 이미지 최적화 (압축, lazy loading)

#### 번들 크기 최적화
- Hermes 엔진 활성화
- 불필요한 라이브러리 제거
- 코드 스플리팅

---

### 4.6 CI/CD 파이프라인

#### GitHub Actions 예시
```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run lint
      - run: npm test

  build-ios:
    runs-on: macos-latest
    needs: test
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx eas-cli build --platform ios --non-interactive

  build-android:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx eas-cli build --platform android --non-interactive
```

---

## 5. 우선순위 로드맵

### 🔴 Phase 1: 기반 강화 (1-2주)

**필수 작업**
1. ✅ Repository 패턴 도입
2. ✅ 유틸리티 함수 분리 (dateUtils, paymentUtils 등)
3. ✅ 에러 처리 체계 (ErrorBoundary, Toast)
4. ✅ 전역 상태 관리 (Zustand)

**목표**: API 연동 준비, 코드 품질 향상

**기대 효과**:
- Mock → API 전환 시 화면 코드 수정 불필요
- 중복 코드 제거
- 사용자 경험 개선 (에러 피드백)

---

### 🟡 Phase 2: 핵심 기능 추가 (2-3주)

**우선순위 높은 기능**
1. 🔔 푸시 알림 시스템
   - 수업 알림
   - 수강권 만료 알림
   - 메시지 알림

2. 💬 채팅 기능
   - 선생님 ↔ 학부모 1:1 채팅
   - 실시간 메시지
   - 읽음 표시

3. 📊 통계/리포트 기초
   - 월별 매출 그래프
   - 출석률 통계
   - 진도 현황

**목표**: 차별화된 사용자 경험 제공

**기대 효과**:
- 사용자 참여도 증가
- 선생님-학부모 소통 개선
- 데이터 기반 의사결정 지원

---

### 🟢 Phase 3: 고급 기능 (3-4주)

**부가 가치 기능**
1. 🎥 영상 피드백 시스템
2. ⏱️ 연습 타이머/기록
3. 🎪 발표회/이벤트 관리
4. 📚 진도 교재 DB
5. 👨‍👩‍👧 다중 학생 관리 (학부모)

**목표**: 프리미엄 서비스 제공

---

### 🔵 Phase 4: 아키텍처 고도화 (장기)

**장기 개선 과제**
1. TypeScript 마이그레이션
2. React Query 도입
3. 테스트 코드 작성 (Jest, Testing Library)
4. Sentry 연동
5. CI/CD 구축

**목표**: 유지보수성, 확장성, 안정성 확보

---

## 6. 결론 및 Next Step

### 6.1 현재 상태 평가

**강점**
- ✅ 화면 구조 잘 분리됨
- ✅ 재사용 컴포넌트 추출 완료
- ✅ Mock 데이터 중앙화

**약점**
- ❌ 데이터 레이어 부재 → API 연동 어려움
- ❌ 상태 관리 미흡 → 확장성 제한
- ❌ 에러 처리 없음 → 사용자 경험 저하
- ❌ 타입 안정성 부재 → 런타임 에러 위험

### 6.2 추천 작업 순서

#### 🚀 즉시 시작 (이번 주)
1. **Repository 패턴 구현**
   - StudentRepository
   - AttendanceRepository
   - PaymentRepository

2. **유틸리티 함수 정리**
   - `utils/paymentUtils.js` (일할계산)
   - `utils/attendanceUtils.js` (출석률)
   - `utils/dateUtils.js` (날짜 포맷)

3. **에러 처리 기초**
   - ErrorBoundary 추가
   - Toast 컴포넌트

#### 📅 다음 주
4. **Zustand 상태 관리**
   - studentStore
   - authStore

5. **푸시 알림 기초 구조**
   - Expo Notifications 설정
   - 기본 알림 서비스

#### 🎯 다음 스프린트
6. **채팅 기능 MVP**
7. **영상 피드백 시스템**
8. **통계 대시보드**

### 6.3 기술 스택 최종 권장사항

| 분류 | 현재 | 권장 추가 |
|------|------|-----------|
| 상태 관리 | Context API | **Zustand** |
| 서버 상태 | - | **React Query** (선택) |
| 폼 관리 | 수동 | **react-hook-form** |
| 타입 검사 | JavaScript | **TypeScript** (장기) |
| 에러 로깅 | - | **Sentry** |
| 알림 | - | **Expo Notifications** |
| 채팅 | - | **Firebase** or **Socket.io** |
| 차트 | - | **react-native-chart-kit** |
| 테스트 | - | **Jest** + **Testing Library** |

### 6.4 예상 개발 기간

- **Phase 1 (기반 강화)**: 1-2주
- **Phase 2 (핵심 기능)**: 2-3주
- **Phase 3 (고급 기능)**: 3-4주
- **Phase 4 (고도화)**: 지속적 개선

**총 MVP → 프로덕션 레디**: 약 **2-3개월**

### 6.5 성공 지표 (KPI)

**기술 지표**
- 앱 크래시율 < 1%
- API 응답 시간 < 500ms
- 화면 로딩 시간 < 2초
- 코드 커버리지 > 70%

**비즈니스 지표**
- 사용자 유지율 > 80%
- 일일 활성 사용자 (DAU)
- 평균 세션 시간
- 기능별 사용률

---

## 📚 참고 자료

### 공식 문서
- [React Native](https://reactnative.dev/)
- [Expo](https://docs.expo.dev/)
- [NativeWind](https://www.nativewind.dev/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [TanStack Query](https://tanstack.com/query/latest)
- [React Hook Form](https://react-hook-form.com/)

### 추천 라이브러리
- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Expo AV](https://docs.expo.dev/versions/latest/sdk/av/)
- [React Native Chart Kit](https://github.com/indiespirit/react-native-chart-kit)
- [Sentry React Native](https://docs.sentry.io/platforms/react-native/)

---

**작성**: Claude (Anthropic)
**날짜**: 2025-10-20
**버전**: 1.0.0
