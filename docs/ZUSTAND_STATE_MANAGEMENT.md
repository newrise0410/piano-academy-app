# Zustand 상태 관리 가이드

> 작성일: 2025-10-20
> Piano Academy App - 전역 상태 관리 문서

---

## 📋 목차

1. [개요](#개요)
2. [설치 및 설정](#설치-및-설정)
3. [Store 구조](#store-구조)
4. [사용법](#사용법)
5. [Best Practices](#best-practices)
6. [마이그레이션 가이드](#마이그레이션-가이드)

---

## 개요

### 왜 Zustand를 선택했나?

Piano Academy App은 **Context API**에서 **Zustand**로 전환했습니다.

**Context API의 문제점:**
- ❌ Provider 중첩 지옥
- ❌ 불필요한 리렌더링
- ❌ 복잡한 설정
- ❌ 보일러플레이트 코드 많음

**Zustand의 장점:**
- ✅ 경량 (1KB)
- ✅ 간단한 API
- ✅ Provider 불필요
- ✅ 선택적 구독으로 성능 최적화
- ✅ React DevTools 지원
- ✅ TypeScript 친화적

---

## 설치 및 설정

### 설치

```bash
npm install zustand
```

### 프로젝트 구조

```
src/
├── store/
│   ├── index.js              # 모든 store export
│   ├── authStore.js          # 인증 상태
│   ├── studentStore.js       # 학생 데이터
│   ├── attendanceStore.js    # 출석 데이터
│   ├── paymentStore.js       # 결제/수강권
│   └── noticeStore.js        # 알림장
```

---

## Store 구조

### 1. authStore.js

**기능:** 인증 상태 관리

```javascript
import { useAuthStore } from '../../store';

// 컴포넌트에서 사용
const { user, login, logout, isAuthenticated } = useAuthStore();
```

**State:**
- `user`: 사용자 정보 `{ id, email, name, role }`
- `isAuthenticated`: 로그인 여부
- `loading`: 로딩 상태
- `error`: 에러 메시지

**Actions:**
- `login(userData)`: 로그인
- `logout()`: 로그아웃
- `switchRole(role)`: 역할 전환 (개발용)
- `updateUser(updates)`: 사용자 정보 수정
- `isTeacher()`: 선생님 여부
- `isParent()`: 학부모 여부

---

### 2. studentStore.js

**기능:** 학생 데이터 CRUD 및 캐싱

```javascript
import { useStudentStore } from '../../store';

// 컴포넌트에서 사용
const {
  students,
  loading,
  error,
  fetchStudents,
  addStudent,
  updateStudent,
  deleteStudent
} = useStudentStore();
```

**State:**
- `students`: 학생 목록 배열
- `selectedStudent`: 선택된 학생
- `loading`: 로딩 상태
- `error`: 에러 메시지
- `lastFetched`: 마지막 fetch 시간 (캐싱용)

**Actions:**
- `fetchStudents(forceRefresh)`: 학생 목록 조회 (5분 캐시)
- `fetchStudentById(id)`: 특정 학생 조회
- `selectStudent(id)`: 학생 선택 (로컬만)
- `addStudent(studentData)`: 학생 추가
- `updateStudent(id, data)`: 학생 수정
- `deleteStudent(id)`: 학생 삭제
- `searchStudents(query)`: 학생 검색
- `filterByCategory(category)`: 카테고리별 필터
- `getUnpaidStudents()`: 미납 학생 조회
- `getLowTicketStudents()`: 수강권 1회 남은 학생 조회

**캐싱:**
- 5분 이내에 다시 fetch하면 캐시된 데이터 반환
- `forceRefresh=true`로 강제 새로고침 가능

---

### 3. attendanceStore.js

**기능:** 출석 기록 및 통계

```javascript
import { useAttendanceStore } from '../../store';

const {
  records,
  fetchStudentRecords,
  addRecord,
  calculateStats,
  getMonthlyStats
} = useAttendanceStore();
```

**State:**
- `records`: 전체 출석 기록
- `studentRecords`: 학생별 출석 기록 `{ studentId: [records] }`
- `stats`: 학생별 통계 캐시
- `loading`, `error`

**Actions:**
- `fetchAllRecords()`: 전체 출석 기록 조회
- `fetchStudentRecords(studentId)`: 학생별 출석 조회
- `addRecord(recordData)`: 출석 기록 추가
- `updateRecord(id, updates)`: 출석 수정
- `deleteRecord(id)`: 출석 삭제
- `calculateStats(studentId)`: 통계 계산
- `getMonthlyStats(studentId, year, month)`: 월별 통계
- `getStats(studentId)`: 특정 학생 통계 조회

---

### 4. paymentStore.js

**기능:** 결제 내역 및 수강권 관리

```javascript
import { usePaymentStore } from '../../store';

const {
  payments,
  tickets,
  stats,
  addPayment,
  updateTicket
} = usePaymentStore();
```

**State:**
- `payments`: 전체 결제 내역
- `studentPayments`: 학생별 결제 내역
- `tickets`: 학생별 현재 수강권
- `stats`: 통계 `{ total, unpaidCount, lowTicketCount, expiringCount }`

**Actions:**
- `fetchAllPayments()`: 전체 결제 내역 조회
- `fetchStudentPayments(studentId)`: 학생별 결제 조회
- `addPayment(paymentData)`: 결제 추가
- `updatePayment(id, updates)`: 결제 수정
- `updateTicket(studentId, ticketInfo)`: 수강권 업데이트
- `decrementTicketCount(studentId)`: 수강권 회차 차감
- `getUnpaidPayments()`: 미납 목록 조회

---

### 5. noticeStore.js

**기능:** 알림장 관리

```javascript
import { useNoticeStore } from '../../store';

const {
  notices,
  createNotice,
  markAsRead,
  getUnreadCount
} = useNoticeStore();
```

**State:**
- `notices`: 알림장 목록
- `selectedNotice`: 선택된 알림장
- `loading`, `error`

**Actions:**
- `fetchNotices()`: 알림장 목록 조회
- `fetchNoticeById(id)`: 특정 알림장 조회
- `createNotice(noticeData)`: 알림장 생성
- `updateNotice(id, updates)`: 알림장 수정
- `deleteNotice(id)`: 알림장 삭제
- `markAsRead(id)`: 읽음 처리
- `filterByTemplate(template)`: 템플릿별 필터
- `getUnreadNotices()`: 읽지 않은 알림장
- `searchNotices(query)`: 알림장 검색

---

## 사용법

### 기본 사용법

```javascript
import { useStudentStore } from '../../store';

export default function StudentListScreen() {
  // Store에서 필요한 것만 구독
  const { students, loading, error, fetchStudents } = useStudentStore();

  // 컴포넌트 마운트 시 데이터 fetch
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

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

### 선택적 구독 (성능 최적화)

```javascript
// ❌ 나쁜 예 - 모든 state 구독
const store = useStudentStore();

// ✅ 좋은 예 - 필요한 것만 구독
const students = useStudentStore((state) => state.students);
const fetchStudents = useStudentStore((state) => state.fetchStudents);

// ✅ 더 좋은 예 - 여러 개 동시 구독
const { students, loading } = useStudentStore((state) => ({
  students: state.students,
  loading: state.loading
}));
```

### 액션 호출

```javascript
// 학생 추가
const handleAddStudent = async () => {
  const { addStudent } = useStudentStore.getState();

  try {
    const newStudent = await addStudent({
      name: '김지우',
      category: '초등',
      level: '초급',
      // ...
    });

    Alert.alert('성공', '학생이 추가되었습니다.');
  } catch (error) {
    Alert.alert('오류', error.message);
  }
};
```

### Store 외부에서 사용

```javascript
// 컴포넌트 밖에서 store 접근
import { useStudentStore } from './store';

// getState()로 현재 state 조회
const currentStudents = useStudentStore.getState().students;

// setState()로 직접 수정 (권장하지 않음)
useStudentStore.setState({ loading: true });

// 액션 호출
useStudentStore.getState().fetchStudents();
```

---

## Best Practices

### 1. 필요한 state만 구독

```javascript
// ❌ 모든 state 변경에 리렌더링
const store = useStudentStore();

// ✅ students만 변경될 때 리렌더링
const students = useStudentStore((state) => state.students);
```

### 2. 액션과 state 분리

```javascript
// ✅ 액션은 변하지 않으므로 최적화됨
const { fetchStudents, addStudent } = useStudentStore();

// 따로 구독
const students = useStudentStore((state) => state.students);
```

### 3. 로딩/에러 상태 활용

```javascript
const { students, loading, error } = useStudentStore();

if (loading) return <ActivityIndicator />;
if (error) return <Text>{error}</Text>;

return <StudentList students={students} />;
```

### 4. 캐싱 활용

```javascript
// 5분 이내면 캐시 사용
await fetchStudents(); // 캐시에서 가져옴

// 강제 새로고침
await fetchStudents(true); // API 호출
```

### 5. 에러 처리

```javascript
try {
  await addStudent(studentData);
  toast.show('학생이 추가되었습니다', 'success');
} catch (error) {
  toast.show(error.message, 'error');
  // Store의 error state도 자동 설정됨
}
```

---

## 마이그레이션 가이드

### Context API → Zustand

**Before (Context API):**
```javascript
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';

// App.js
<AuthProvider>
  <App />
</AuthProvider>

// Component
const { user, login } = useContext(AuthContext);
```

**After (Zustand):**
```javascript
import { useAuthStore } from './store';

// App.js
<App /> // Provider 불필요!

// Component
const { user, login } = useAuthStore();
```

### useState → Zustand

**Before:**
```javascript
const [students, setStudents] = useState([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await StudentRepository.getAll();
      setStudents(data);
    } finally {
      setLoading(false);
    }
  };
  loadStudents();
}, []);
```

**After:**
```javascript
const { students, loading, fetchStudents } = useStudentStore();

useEffect(() => {
  fetchStudents();
}, [fetchStudents]);
```

---

## 고급 기능 (향후 확장)

### 1. Persist (로컬 저장소)

```javascript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      login: (user) => set({ user }),
    }),
    {
      name: 'auth-storage', // AsyncStorage key
    }
  )
);
```

### 2. DevTools

```javascript
import { devtools } from 'zustand/middleware';

export const useStudentStore = create(
  devtools(
    (set) => ({
      students: [],
      addStudent: (student) => set((state) => ({
        students: [...state.students, student]
      }))
    }),
    { name: 'StudentStore' }
  )
);
```

### 3. Immer (불변성 쉽게)

```javascript
import { immer } from 'zustand/middleware/immer';

export const useStudentStore = create(
  immer((set) => ({
    students: [],
    addStudent: (student) => set((state) => {
      state.students.push(student); // 직접 변경 가능!
    })
  }))
);
```

---

## 문제 해결

### Q: "Cannot read property 'students' of undefined"

```javascript
// ❌ 잘못된 사용
const students = useStudentStore.students;

// ✅ 올바른 사용
const students = useStudentStore((state) => state.students);
// 또는
const { students } = useStudentStore();
```

### Q: 컴포넌트가 업데이트되지 않음

```javascript
// ❌ getState()는 구독하지 않음
const students = useStudentStore.getState().students;

// ✅ 훅 사용으로 구독
const students = useStudentStore((state) => state.students);
```

### Q: 너무 많은 리렌더링

```javascript
// ❌ 매번 새로운 객체 생성
const { students } = useStudentStore((state) => ({
  students: state.students
}));

// ✅ shallow 비교 사용
import shallow from 'zustand/shallow';

const { students, loading } = useStudentStore(
  (state) => ({ students: state.students, loading: state.loading }),
  shallow
);
```

---

## 참고 자료

- [Zustand 공식 문서](https://zustand-demo.pmnd.rs/)
- [Zustand GitHub](https://github.com/pmndrs/zustand)
- [React Native와 Zustand](https://docs.pmnd.rs/zustand/integrations/persisting-store-data#usage-with-react-native)

---

**작성**: Piano Academy Development Team
**최종 수정**: 2025-10-20
