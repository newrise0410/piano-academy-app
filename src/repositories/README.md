# Repository Layer

## 개요

Repository 패턴을 사용하여 데이터 소스(Mock 또는 API)를 추상화합니다.
이를 통해 화면 코드 수정 없이 Mock 데이터에서 실제 API로 쉽게 전환할 수 있습니다.

## 디렉토리 구조

```
src/
├── repositories/
│   ├── StudentRepository.js        - 학생 데이터 관리
│   ├── NoticeRepository.js         - 알림장 데이터 관리
│   ├── ActivityRepository.js       - 활동 기록 관리
│   ├── ParentDataRepository.js     - 학부모 앱 데이터 관리
│   └── index.js                    - 중앙 Export
├── services/
│   ├── api/
│   │   ├── client.js              - Axios 클라이언트
│   │   └── endpoints.js           - API 엔드포인트 상수
│   └── storage/
│       └── AsyncStorage.js        - 로컬 저장소 관리
└── config/
    └── dataConfig.js              - Mock/API 모드 설정
```

## Mock/API 모드 전환

### 현재 모드 확인

```javascript
// src/config/dataConfig.js
export const DATA_SOURCE_MODE = 'mock'; // 'mock' or 'api'
```

### 모드 변경 방법

**개발 중 (Mock 데이터 사용):**
```javascript
export const DATA_SOURCE_MODE = 'mock';
```

**프로덕션 (실제 API 사용):**
```javascript
export const DATA_SOURCE_MODE = 'api';
```

**이게 전부입니다!** 화면 코드는 전혀 수정할 필요가 없습니다.

## 사용 방법

### 1. Repository Import

```javascript
import { StudentRepository, NoticeRepository } from '../repositories';
```

### 2. Repository 메서드 호출

```javascript
// 학생 목록 조회
const students = await StudentRepository.getAll();

// 특정 학생 조회
const student = await StudentRepository.getById('1');

// 학생 추가
const newStudent = await StudentRepository.create({
  name: '김민지',
  category: '초등',
  level: '초급',
  schedule: '월/수 16:00',
  ticketType: 'count',
  ticketCount: 8,
});

// 학생 수정
const updated = await StudentRepository.update('1', {
  schedule: '화/목 17:00',
});

// 학생 삭제
await StudentRepository.delete('1');
```

### 3. 에러 처리

```javascript
try {
  const students = await StudentRepository.getAll();
  console.log('학생 목록:', students);
} catch (error) {
  console.error('에러 발생:', error.message);
  // 사용자에게 에러 메시지 표시
}
```

## Repository 목록

### StudentRepository

학생 데이터 관리

**메서드:**
- `getAll()` - 전체 학생 목록 조회
- `getById(id)` - 특정 학생 조회
- `create(studentData)` - 학생 추가
- `update(id, studentData)` - 학생 수정
- `delete(id)` - 학생 삭제
- `getByCategory(category)` - 카테고리별 학생 조회
- `getUnpaidStudents()` - 미납 학생 조회
- `search(query)` - 학생 검색

### NoticeRepository

알림장 데이터 관리

**메서드:**
- `getAll()` - 전체 알림장 목록 조회
- `getById(id)` - 특정 알림장 조회
- `create(noticeData)` - 알림장 작성
- `update(id, noticeData)` - 알림장 수정
- `delete(id)` - 알림장 삭제
- `confirm(id, parentId)` - 알림장 확인
- `getRecent(limit)` - 최근 알림장 조회

### ActivityRepository

활동 기록 관리

**메서드:**
- `getAll()` - 전체 활동 목록 조회
- `getRecent(limit)` - 최근 활동 조회
- `getByStudent(studentId)` - 특정 학생의 활동 조회
- `getByType(type)` - 특정 타입의 활동 조회
- `create(activityData)` - 새 활동 추가
- `getByDateRange(startDate, endDate)` - 날짜 범위로 조회

### ParentDataRepository

학부모 앱 데이터 관리

**메서드:**
- `getChildData(childId)` - 자녀 정보 조회
- `getRecentActivities(childId)` - 최근 활동 조회
- `getTodaySchedule(childId)` - 오늘의 일정 조회
- `getCompletedSongs(childId)` - 완료한 곡 목록 조회
- `getWeeklyTasks(childId)` - 이번 주 연습 과제 조회
- `getAttendanceRecords(childId, year, month)` - 출석 기록 조회
- `getPaymentHistory(childId)` - 결제 내역 조회
- `getGalleryItems(childId)` - 갤러리 아이템 조회
- `getTimeline(childId)` - 성장 타임라인 조회
- `getAchievements(childId)` - 성취 배지 조회

## 화면에서 사용 예시

### Before (직접 Mock 데이터 import)

```javascript
// ❌ 나쁜 예: 화면에서 직접 Mock 데이터 import
import { mockStudents } from '../../data/mockStudents';

export default function StudentListScreen() {
  const [students, setStudents] = useState(mockStudents);
  // ...
}
```

### After (Repository 사용)

```javascript
// ✅ 좋은 예: Repository 사용
import { StudentRepository } from '../../repositories';

export default function StudentListScreen() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await StudentRepository.getAll();
      setStudents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

## 장점

### 1. Mock ↔ API 전환이 쉬움
설정 파일 하나만 수정하면 모든 화면이 자동으로 API를 사용합니다.

### 2. 화면 코드 수정 불필요
Repository만 바꾸면 되므로 화면 코드는 그대로 유지됩니다.

### 3. 테스트 용이
Mock 모드로 빠르게 개발하고 테스트할 수 있습니다.

### 4. 에러 처리 일관성
모든 에러가 Repository에서 일관되게 처리됩니다.

### 5. 로깅 및 디버깅
개발 모드에서 자동으로 API 호출을 로깅합니다.

## 개발 팁

### 네트워크 딜레이 시뮬레이션

Mock 모드에서도 실제 API처럼 딜레이를 시뮬레이션할 수 있습니다:

```javascript
// src/config/dataConfig.js
export const DEV_CONFIG = {
  mockNetworkDelay: 500, // 500ms 딜레이
};
```

### 로깅 활성화/비활성화

```javascript
// src/config/dataConfig.js
export const DEV_CONFIG = {
  logRepositoryCalls: true,  // Repository 호출 로그
  logApiErrors: true,        // API 에러 로그
};
```

## 다음 단계

1. **상태 관리 라이브러리 도입** (Zustand)
   - Repository를 Store에서 호출
   - 전역 상태로 데이터 관리

2. **React Query 도입** (선택사항)
   - 자동 캐싱
   - 백그라운드 재검증
   - Optimistic Updates

3. **TypeScript 마이그레이션**
   - 타입 안정성 확보
   - 자동완성 지원

## 참고

- Mock 데이터: `src/data/`
- API 클라이언트: `src/services/api/client.js`
- 엔드포인트: `src/services/api/endpoints.js`
- 설정: `src/config/dataConfig.js`
