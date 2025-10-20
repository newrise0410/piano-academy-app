# Piano Academy App - 구조 개선 및 확장 방안

> 최종 업데이트: 2025-10-20
> 버전: 2.0.0
> 현재 기술 스택: React Native + Expo SDK 52 + NativeWind v4 + Zustand
> 프로젝트 진행률: **약 75% 완료**

---

## 📋 목차

1. [현재 구현 현황](#1-현재-구현-현황)
2. [완료된 작업 (Phase 1 ✅)](#2-완료된-작업-phase-1-)
3. [다음 우선순위 작업](#3-다음-우선순위-작업)
4. [장기 로드맵](#4-장기-로드맵)
5. [기술 부채 및 개선사항](#5-기술-부채-및-개선사항)

---

## 1. 현재 구현 현황

### 🎯 전체 개요

Piano Academy App은 **React Native (Expo) 기반**의 피아노 학원 관리 앱으로,
**선생님용**과 **학부모용** 두 가지 역할의 앱을 하나의 코드베이스로 관리합니다.

**현재 상태**:
- ✅ 모든 핵심 UI 구현 완료
- ✅ Repository 패턴 적용 (Mock/API 전환 가능)
- ✅ Zustand 전역 상태 관리 구축
- ✅ 차트/통계 기능 추가
- ✅ 갤러리 기능 기본 구현
- ⚠️ API 서버 연동 대기 중 (Mock 데이터로 개발 중)

---

### 📊 구현 현황 통계

#### 화면 구현 (21개 화면)
| 구분 | 화면 수 | 완성도 |
|------|---------|--------|
| 선생님 앱 | 14개 | 100% |
| 학부모 앱 | 7개 | 100% |
| **합계** | **21개** | **100%** |

#### 컴포넌트 (36개)
| 구분 | 개수 | 완성도 |
|------|------|--------|
| Common 컴포넌트 | 30개 | 100% |
| Teacher 전용 | 6개 | 100% |
| **합계** | **36개** | **100%** |

#### 데이터 레이어 (완료 ✅)
| 구분 | 개수 | 완성도 |
|------|------|--------|
| Zustand Stores | 7개 | 100% |
| Repositories | 6개 | 100% |
| Utility Modules | 5개 | 100% |
| Mock Data Files | 6개 | 100% |

---

### 🏗️ 디렉토리 구조 (최신)

```
piano-academy-app/
├── src/
│   ├── components/
│   │   ├── common/          ✅ 30개 컴포넌트 (Button, Card, Chart, Gallery 등)
│   │   └── teacher/         ✅ 6개 선생님 전용 컴포넌트
│   ├── screens/
│   │   ├── auth/           ✅ 로그인/회원가입
│   │   ├── teacher/        ✅ 14개 화면 (Dashboard, Statistics, Gallery 등)
│   │   └── parent/         ✅ 7개 화면 (Home, Progress, Gallery 등)
│   ├── store/              ✅ 7개 Zustand stores
│   ├── repositories/       ✅ 6개 Repository (Mock/API 이중화)
│   ├── data/               ✅ 6개 Mock 데이터
│   ├── utils/              ✅ 5개 유틸리티 모듈
│   ├── services/           ✅ API client, endpoints 정의
│   ├── hooks/              ✅ useDashboard, useActivities
│   ├── styles/             ✅ TEACHER_COLORS, PARENT_COLORS
│   ├── config/             ✅ dataConfig (Mock/API 모드 전환)
│   ├── navigation/         ✅ 4개 Navigator
│   ├── context/            ✅ AuthContext
│   └── models/             ✅ 데이터 모델 정의
└── docs/
    └── IMPROVEMENT_PLAN.md ✅ 이 문서
```

---

## 2. 완료된 작업 (Phase 1 ✅)

### ✅ 2.1 Repository 패턴 (완료)

**구현 완료:**
- `StudentRepository.js` - 학생 CRUD + 검색/필터링
- `AttendanceRepository.js` - 출석 기록 관리
- `NoticeRepository.js` - 알림장 관리
- `PaymentRepository.js` - 수강료 관리
- `ActivityRepository.js` - 활동 로그
- `ParentDataRepository.js` - 학부모 데이터

**특징:**
- `isMockMode()` / `isApiMode()` 체크로 Mock ↔ API 자동 전환
- 네트워크 지연 시뮬레이션 (500ms)
- 모든 CRUD 작업 구현
- 콘솔 로깅으로 디버깅 지원

**설정 파일:**
```javascript
// src/config/dataConfig.js
export const DATA_SOURCE_MODE = 'mock'; // 'mock' or 'api'
export const isMockMode = () => DATA_SOURCE_MODE === 'mock';
export const isApiMode = () => DATA_SOURCE_MODE === 'api';
```

---

### ✅ 2.2 Zustand 전역 상태 관리 (완료)

**구현 완료 (7개 Store):**

1. **authStore.js** - 인증 상태 관리
   - `user`, `isAuthenticated`
   - `login()`, `logout()`, `switchRole()`
   - `isTeacher()`, `isParent()` 헬퍼

2. **studentStore.js** - 학생 관리
   - 전체 CRUD 작업
   - 검색: `searchStudents()`, `filterByCategory()`, `filterByLevel()`
   - 특수 쿼리: `getUnpaidStudents()`, `getLowTicketStudents()`
   - 5분 캐싱

3. **attendanceStore.js** - 출석 관리
   - 출석 기록 CRUD
   - `calculateStats()` - 자동 통계 계산
   - `getMonthlyStats()` - 월별 통계
   - 3분 캐싱

4. **paymentStore.js** - 수강료 관리
   - 결제 내역 관리
   - 통계: `getTotalRevenue()`, `getUnpaidCount()`
   - 티켓 관리: `updateTicket()`, `decrementTicketCount()`

5. **noticeStore.js** - 알림장 관리
   - 알림장 CRUD
   - 읽음 상태: `markAsRead()`, `getUnreadCount()`
   - 필터링: 템플릿 타입별, 날짜별
   - 3분 캐싱

6. **toastStore.js** - Toast 알림
   - `success()`, `error()`, `warning()`, `info()`
   - 자동 사라짐 (3초)
   - 최대 3개 Toast 표시

7. **notificationStore.js** - 알림 센터
   - 알림 목록 관리
   - `markAsRead()`, `markAllAsRead()`
   - `getUnreadCount()`
   - 타입별 알림 (payment, notice, makeup, attendance)

---

### ✅ 2.3 유틸리티 함수 모듈화 (완료)

**구현 완료 (5개 모듈):**

1. **dateUtils.js**
   - `formatDate()` - YYYY.MM.DD 포맷
   - `getRelativeTime()` - "방금 전", "2시간 전"
   - `getDayOfWeek()` - 요일 반환

2. **formatters.js**
   - `formatCurrency()` - 통화 포맷 (150,000원)
   - `formatPercent()` - 퍼센트 포맷
   - `formatPhoneNumber()` - 전화번호 포맷

3. **paymentUtils.js**
   - `getTicketStatus()` - 티켓 상태 계산
   - `getDaysUntilExpiry()` - 만료까지 남은 일수
   - 수강권 관련 계산

4. **attendanceUtils.js**
   - `calculateAttendanceRate()` - 출석률 계산
   - `getMonthlyStats()` - 월별 통계
   - 출석 관련 계산

5. **validators.js**
   - 입력 값 검증 함수들
   - 이메일, 전화번호, 학생 데이터 검증

---

### ✅ 2.4 에러 처리 체계 (완료)

**구현 완료:**
- `ErrorBoundary.js` - React 에러 경계
- `Toast.js` / `ToastContainer.js` - Toast 알림 시스템
- Zustand `toastStore` - 전역 Toast 상태 관리

**사용 예시:**
```javascript
import { useToastStore } from '../../store';

const toast = useToastStore();
toast.success('학생이 추가되었습니다');
toast.error('오류가 발생했습니다');
```

---

### ✅ 2.5 차트/통계 기능 (완료)

**구현 완료 (4개 차트 컴포넌트):**

1. **MonthlyRevenueChart** - 월별 매출 라인 차트
2. **AttendanceRateChart** - 출석률 바 차트
3. **StudentGrowthChart** - 학생 수 증가 라인 차트
4. **PieChartComponent** - 레벨/수강권 분포 파이 차트

**신규 화면:**
- **StatisticsScreen** (선생님) - 통계 전체보기
  - 기간 선택 (6개월/3개월/1년)
  - 6개 차트 표시
  - 요약 통계

**통합 화면:**
- **DashboardScreen** - 차트 미리보기 추가
- **ProgressScreen** (학부모) - 진도/출석률 차트 추가

**Mock 데이터:**
- `mockChartData.js` - 차트용 샘플 데이터

**기술 스택:**
- `react-native-chart-kit` (^6.12.0)
- `react-native-svg` (15.8.0)

---

### ✅ 2.6 갤러리 기능 (기본 완료)

**구현 완료:**

**신규 화면:**
- **GalleryScreen** (선생님) - 사진/영상 관리
- **GalleryScreen** (학부모) - 사진/영상 보기

**컴포넌트 (5개):**
1. **ImageGrid** - 3단 그리드 레이아웃
2. **ImageViewerModal** - 간단한 이미지 뷰어
3. **ImageUploadButton** - 카메라/갤러리 선택
4. **GalleryUploadModal** - 업로드 폼 (제목, 설명, 카테고리, 학생 태깅)
5. **GalleryDetailModal** - 상세보기 (좋아요, 댓글, 다운로드, 삭제)

**기능:**
- ✅ 카테고리 필터 (수업/연습/이벤트/성취)
- ✅ 앨범별 분류
- ✅ 좋아요 기능
- ✅ 댓글 시스템
- ✅ 학생 태깅
- ✅ 통계 (사진/영상/좋아요 개수)
- ⚠️ 다운로드 (개발 빌드 필요 - 현재 알림만)
- ⚠️ 실제 이미지 업로드 (Expo Go 제한으로 Mock)

**Mock 데이터:**
- `mockGalleryData.js` - 6개 샘플 갤러리 아이템 + 앨범 정보

**제한사항:**
- `expo-file-system`, `expo-media-library`는 Expo Go에서 미지원
- 실제 이미지 저장/다운로드는 개발 빌드 필요
- 현재는 emoji placeholder 사용

---

### ✅ 2.7 알림 시스템 (완료)

**구현 완료:**

**컴포넌트:**
1. **NotificationBadge** - 읽지 않은 알림 뱃지
2. **NotificationModal** - 알림 센터 모달

**기능:**
- 알림 타입별 아이콘/색상 (payment, notice, makeup, attendance)
- 타임스탬프 상대 시간 표시 ("10분 전", "2시간 전")
- 읽음/안읽음 표시
- 개별/전체 읽음 처리
- 개별 알림 삭제

**통합:**
- DashboardScreen (선생님) - 헤더에 알림 뱃지
- HomeScreen (학부모) - 헤더에 알림 뱃지

**Store:**
- `notificationStore.js` - 알림 상태 관리
- 4개 Mock 알림 데이터

---

### ✅ 2.8 화면 헤더 통일 (완료)

**구현 완료:**
- **ScreenHeader** 컴포넌트 - iOS 스타일 통일 헤더
  - 반투명 배경 (rgba(255,255,255,0.95))
  - Soft 그림자
  - 원형 뒤로가기 버튼 (chevron-back 아이콘)
  - 제목/서브타이틀
  - 우측 커스텀 버튼

**적용 화면 (16개):**
- 선생님 앱: 10개 화면 (NoticeList, StudentList, Attendance, Tuition, StudentDetail, StudentForm, NoticeCreate, TodayClasses, UnpaidStudents, MakeupClasses)
- 학부모 앱: 6개 화면 (Notice, Progress, Attendance, Tuition, Gallery, ChildInfo)

---

## 3. 다음 우선순위 작업

### 🟡 Phase 2: 핵심 기능 추가 (추천 다음 작업)

#### 3.1 백엔드 API 연동 ⭐⭐⭐⭐⭐

**우선순위**: 최상

**현재 상태:**
- ✅ Repository 패턴 구현 완료
- ✅ API endpoints 정의 완료 (`src/services/api/endpoints.js`)
- ✅ axios client 설정 완료
- ⚠️ 실제 API 서버 없음

**필요 작업:**
1. 백엔드 API 서버 구축 또는 선택
   - Option 1: Firebase (빠른 시작, 무료 플랜)
   - Option 2: Supabase (PostgreSQL, 무료 플랜)
   - Option 3: 자체 서버 (Node.js + Express + MongoDB/PostgreSQL)

2. 인증 시스템 구현
   - JWT 토큰 기반 인증
   - AsyncStorage에 토큰 저장
   - API 요청 시 자동 헤더 추가
   - 토큰 만료 처리

3. 데이터 모드 전환
   ```javascript
   // src/config/dataConfig.js
   export const DATA_SOURCE_MODE = 'api'; // 'mock' → 'api'로 변경
   ```

4. 실제 데이터 마이그레이션
   - Mock 데이터를 DB에 시드
   - 이미지/영상 스토리지 설정 (AWS S3, Cloudinary, Firebase Storage)

**예상 기간**: 1-2주

---

#### 3.2 실시간 채팅 기능 ⭐⭐⭐⭐

**우선순위**: 높음

**목적**: 선생님 ↔ 학부모 실시간 소통

**주요 기능:**
- 1:1 채팅
- 메시지 읽음 표시
- 푸시 알림 연동
- 이미지/파일 전송
- 빠른 답장 템플릿

**기술 스택 옵션:**

**Option 1: Firebase Cloud Messaging** (추천)
- ✅ 무료 (일정 한도까지)
- ✅ 실시간
- ✅ 푸시 알림 통합
- ✅ 빠른 구축
- ❌ 벤더 종속성

**Option 2: Socket.io**
- ✅ 자체 서버 제어
- ✅ 유연성
- ❌ 서버 인프라 필요
- ❌ 푸시 알림 별도 구현

**필요 화면:**
- `ChatListScreen` (선생님) - 대화 목록
- `ChatRoomScreen` (선생님/학부모) - 채팅방

**필요 컴포넌트:**
- `ChatBubble` - 말풍선
- `MessageInput` - 입력창
- `ChatHeader` - 채팅방 헤더
- `QuickReplyButtons` - 빠른 답장

**필요 Store:**
- `chatStore.js` - 채팅 상태 관리

**예상 기간**: 1-2주

---

#### 3.3 푸시 알림 시스템 ⭐⭐⭐⭐

**우선순위**: 높음

**목적**: 중요 이벤트 실시간 알림

**알림 종류:**

**학부모 앱:**
- 수업 시작 1시간 전
- 수강권 만료 3일 전
- 선생님 메시지 도착
- 새 알림장 업로드
- 숙제 미완료 알림

**선생님 앱:**
- 수업 시작 30분 전
- 미수금 발생
- 학부모 메시지 도착
- 이벤트 신청 도착

**기술 스택:**
```bash
npm install expo-notifications
```

**구현 예시:**
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
```

**예상 기간**: 3-5일

---

#### 3.4 영상 피드백 시스템 ⭐⭐⭐

**우선순위**: 중간

**목적**: 학생 연주 영상 업로드 → 선생님 피드백

**주요 기능:**
- 영상 녹화 (학부모 앱)
- 영상 업로드 (클라우드 스토리지)
- 선생님 시청 및 피드백 작성
- 타임스탬프 코멘트 ("0:45초 부분 리듬 개선 필요")
- 연주 평가 (별점, 코멘트)

**필요 라이브러리:**
```bash
npm install expo-av expo-camera
# 이미 설치됨: expo-image-picker
```

**필요 화면:**
- `VideoRecordScreen` (학부모) - 영상 녹화
- `VideoListScreen` (학부모) - 업로드한 영상 목록
- `VideoReviewScreen` (선생님) - 영상 검토 및 피드백

**필요 컴포넌트:**
- `VideoPlayer` - 비디오 플레이어
- `VideoThumbnail` - 썸네일
- `FeedbackForm` - 피드백 입력
- `TimestampComment` - 시간별 코멘트

**클라우드 스토리지:**
- AWS S3 (추천)
- Cloudinary (비디오 특화)
- Firebase Storage

**예상 기간**: 1주

---

#### 3.5 발표회/이벤트 관리 ⭐⭐⭐

**우선순위**: 중간

**목적**: 학원 발표회, 워크샵 등 이벤트 관리

**선생님 기능:**
- 이벤트 생성 (제목, 날짜, 장소, 설명)
- 참가자 관리
- 연주 순서 편성
- 리허설 일정 관리

**학부모 기능:**
- 이벤트 목록 조회
- 참가 신청
- 일정 캘린더 추가

**필요 화면:**
- `EventListScreen` (선생님/학부모)
- `EventCreateScreen` (선생님)
- `EventManageScreen` (선생님)
- `EventDetailScreen` (학부모)

**필요 컴포넌트:**
- `EventCard`
- `ParticipantList`
- `PerformanceOrder`

**필요 Store:**
- `eventStore.js`

**예상 기간**: 1주

---

### 🟢 Phase 3: 부가 기능 (낮은 우선순위)

#### 3.6 연습 타이머/기록 ⭐⭐

**목적**: 학생의 집 연습 시간 기록

**주요 기능:**
- 연습 시작/종료 타이머
- 곡별 연습 시간 기록
- 주간/월간 통계
- 목표 시간 설정 및 달성률
- 연습 기록 공유 (학부모 → 선생님)

**필요 화면:**
- `PracticeTimerScreen` (학부모)
- `PracticeHistoryScreen` (학부모)

**필요 컴포넌트:**
- `Timer` - 타이머 UI
- `PracticeLog` - 기록 항목
- `WeeklyStats` - 주간 통계 차트

**필요 Store:**
- `practiceStore.js`

**예상 기간**: 3-5일

---

#### 3.7 진도 교재 관리 시스템 ⭐⭐

**목적**: 체계적인 교재별 진도 관리

**주요 기능:**
- 교재 데이터베이스 (바이엘, 체르니, 하농 등)
- 학생별 교재 진도 추적
- 곡별 난이도 표시
- 완주 기록
- 다음 학습 추천

**데이터 구조:**
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

**예상 기간**: 1주

---

#### 3.8 다중 학생 관리 (학부모) ⭐

**현재 상황**: 학부모는 1명의 자녀만 관리

**개선 방안**: 여러 자녀 등록 및 전환 가능

**UI 변경:**
```
HomeScreen 상단에 자녀 전환 드롭다운 추가

┌─────────────────────────────┐
│  [김민지 ▼]        🔔       │
│                             │
│  프로필 카드                │
│  ...                        │
└─────────────────────────────┘
```

**Store 수정:**
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

**예상 기간**: 2-3일

---

## 4. 장기 로드맵

### 🔵 Phase 4: 아키텍처 고도화

#### 4.1 TypeScript 마이그레이션 ⭐⭐⭐

**목적:**
- 타입 안정성 확보
- 개발 생산성 향상 (자동완성)
- 리팩토링 안정성
- 런타임 에러 사전 방지

**마이그레이션 전략:**

1. **설정**
```bash
npm install --save-dev typescript @types/react @types/react-native
npx tsc --init
```

2. **점진적 전환**
- `common/` 컴포넌트부터 `.tsx` 전환
- Repository 레이어 타입화
- Store 타입화
- 화면 컴포넌트 순차 전환

**예상 기간**: 2-3주

---

#### 4.2 React Query 도입 ⭐⭐

**목적**: 서버 상태 관리 최적화

**장점:**
- ✅ 자동 캐싱
- ✅ 백그라운드 자동 재검증
- ✅ 로딩/에러 상태 통일
- ✅ Optimistic Updates
- ✅ Prefetching

**설치:**
```bash
npm install @tanstack/react-query
```

**사용 예시:**
```javascript
// hooks/useStudents.js
import { useQuery } from '@tanstack/react-query';
import { StudentRepository } from '../repositories/StudentRepository';

export const useStudents = () => {
  return useQuery({
    queryKey: ['students'],
    queryFn: StudentRepository.getAll,
    staleTime: 5 * 60 * 1000
  });
};
```

**예상 기간**: 1주

---

#### 4.3 테스트 코드 작성 ⭐⭐

**현재 상태**: 테스트 코드 없음

**추천 스택:**
- Jest - 단위 테스트
- React Native Testing Library - 컴포넌트 테스트
- Detox - E2E 테스트

**설치:**
```bash
npm install --save-dev jest @testing-library/react-native
```

**테스트 우선순위:**
1. Utility 함수 테스트
2. Repository 테스트
3. Store 테스트
4. 컴포넌트 테스트
5. E2E 테스트

**예상 기간**: 2-3주

---

#### 4.4 에러 로깅 서비스 (Sentry) ⭐

**목적**: 프로덕션 환경 에러 추적

**설치:**
```bash
npm install @sentry/react-native
npx @sentry/wizard -i reactNative
```

**설정:**
```javascript
// App.js
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  enableAutoSessionTracking: true,
  tracesSampleRate: 1.0
});

export default Sentry.wrap(App);
```

**예상 기간**: 1일

---

#### 4.5 CI/CD 파이프라인 ⭐

**추천 도구:**
- GitHub Actions
- EAS Build (Expo)

**예시:**
```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm test

  build:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npx eas-cli build --platform all --non-interactive
```

**예상 기간**: 2-3일

---

## 5. 기술 부채 및 개선사항

### ⚠️ 5.1 현재 제한사항

1. **네이티브 모듈 제한 (Expo Go)**
   - `expo-file-system`, `expo-media-library`는 개발 빌드 필요
   - 갤러리 다운로드 기능 현재 비활성화
   - 해결: EAS Build로 개발 빌드 생성

2. **Mock 데이터 의존**
   - 모든 데이터가 Mock
   - 실제 API 서버 필요
   - 이미지/영상 실제 스토리지 필요

3. **상태 지속성 부족**
   - 앱 재시작 시 데이터 초기화
   - AsyncStorage 활용 필요
   - 오프라인 지원 부재

4. **성능 최적화 미흡**
   - 이미지 캐싱 부재
   - 무한 스크롤 미구현
   - 메모이제이션 일부만 적용

---

### 🔧 5.2 추천 개선사항

#### 우선순위 1: API 연동
- 가장 시급한 작업
- Firebase 또는 Supabase 사용 추천
- 1-2주 내 완료 목표

#### 우선순위 2: 실시간 기능
- 채팅 + 푸시 알림
- 사용자 경험 크게 향상
- 1-2주 내 완료 목표

#### 우선순위 3: 영상 피드백
- 차별화 기능
- 클라우드 스토리지 필요
- 1주 내 완료 목표

#### 우선순위 4: 테스트 코드
- 안정성 확보
- 리팩토링 안전망
- 점진적으로 추가

#### 우선순위 5: TypeScript
- 장기 유지보수성
- 새 기능 추가 시 점진적 적용

---

### 📈 5.3 성능 최적화 체크리스트

- [ ] 이미지 캐싱 (expo-image)
- [ ] FlatList 최적화 (getItemLayout, windowSize)
- [ ] React.memo() 적용 (리스트 아이템)
- [ ] useMemo() / useCallback() 적절히 사용
- [ ] 번들 크기 분석 (react-native-bundle-visualizer)
- [ ] Hermes 엔진 활성화
- [ ] 코드 스플리팅

---

### 🔒 5.4 보안 체크리스트

- [ ] API 키 환경 변수로 분리
- [ ] JWT 토큰 안전한 저장 (SecureStore)
- [ ] HTTPS 통신 강제
- [ ] 입력 값 검증 (XSS, SQL Injection 방지)
- [ ] 파일 업로드 제한 (크기, 타입)
- [ ] 비밀번호 암호화
- [ ] 권한 체크 (역할 기반 접근 제어)

---

## 📋 결론 및 권장 작업 순서

### 🚀 추천 다음 3개월 로드맵

#### 1개월차: 백엔드 연동
- **Week 1-2**: Firebase/Supabase 선택 및 설정
- **Week 3**: 인증 시스템 구현
- **Week 4**: 데이터 API 연동 (학생, 출석, 결제)

#### 2개월차: 실시간 기능
- **Week 5-6**: 채팅 기능 구현 (Firebase)
- **Week 7**: 푸시 알림 시스템
- **Week 8**: 영상 피드백 시스템

#### 3개월차: 추가 기능 + 안정화
- **Week 9**: 발표회/이벤트 관리
- **Week 10**: 테스트 코드 작성
- **Week 11**: 성능 최적화
- **Week 12**: 배포 준비 (EAS Build, 스토어 등록)

---

### 🎯 최종 목표

**3개월 후:**
- ✅ 완전한 API 연동
- ✅ 실시간 채팅
- ✅ 푸시 알림
- ✅ 영상 피드백
- ✅ 이벤트 관리
- ✅ 테스트 커버리지 50% 이상
- ✅ App Store / Play Store 배포 준비 완료

**6개월 후:**
- ✅ TypeScript 전환 완료
- ✅ 테스트 커버리지 70% 이상
- ✅ CI/CD 파이프라인 구축
- ✅ Sentry 에러 로깅
- ✅ 실제 사용자 피드백 반영
- ✅ 프리미엄 기능 추가

---

**작성**: Claude AI (Anthropic)
**최종 업데이트**: 2025-10-20
**버전**: 2.0.0
**프로젝트 진행률**: ~75% 완료


// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAxB3l2xl9vEXb2yNEQLCK34205hrstJQI",
  authDomain: "piano-academy-app-9050a.firebaseapp.com",
  projectId: "piano-academy-app-9050a",
  storageBucket: "piano-academy-app-9050a.firebasestorage.app",
  messagingSenderId: "618021355093",
  appId: "1:618021355093:web:78e58cbdb4c746c0911edc",
  measurementId: "G-N2PEGSLSPC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);