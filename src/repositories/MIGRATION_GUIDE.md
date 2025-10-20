# Repository 마이그레이션 가이드

## 기존 화면을 Repository 패턴으로 변경하기

이 가이드는 기존 화면 코드를 Repository 패턴으로 마이그레이션하는 방법을 설명합니다.

---

## 예시 1: StudentListScreen

### Before (기존 코드)

```javascript
import React, { useState } from 'react';
import { mockStudents } from '../../data/mockStudents';

export default function StudentListScreen() {
  const [students, setStudents] = useState(mockStudents);

  // 학생 추가
  const handleAddStudent = (studentData) => {
    const newStudent = {
      id: String(Date.now()),
      ...studentData,
    };
    setStudents([...students, newStudent]);
  };

  // 학생 삭제
  const handleDeleteStudent = (id) => {
    setStudents(students.filter(s => s.id !== id));
  };

  return (
    // UI 코드...
  );
}
```

### After (Repository 사용)

```javascript
import React, { useState, useEffect } from 'react';
import { StudentRepository } from '../../repositories';

export default function StudentListScreen() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 초기 데이터 로드
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
      console.error('학생 목록 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  // 학생 추가
  const handleAddStudent = async (studentData) => {
    try {
      const newStudent = await StudentRepository.create(studentData);
      setStudents([...students, newStudent]);
      // Toast 메시지 표시
      alert('학생이 추가되었습니다');
    } catch (err) {
      alert('학생 추가에 실패했습니다');
      console.error('학생 추가 실패:', err);
    }
  };

  // 학생 삭제
  const handleDeleteStudent = async (id) => {
    try {
      await StudentRepository.delete(id);
      setStudents(students.filter(s => s.id !== id));
      alert('학생이 삭제되었습니다');
    } catch (err) {
      alert('학생 삭제에 실패했습니다');
      console.error('학생 삭제 실패:', err);
    }
  };

  // 로딩 상태 처리
  if (loading) {
    return <LoadingSpinner />;
  }

  // 에러 상태 처리
  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={loadStudents}
      />
    );
  }

  return (
    // UI 코드... (동일)
  );
}
```

---

## 예시 2: NoticeListScreen

### Before

```javascript
import { getNotices, deleteNotice } from '../../data/mockNotices';

export default function NoticeListScreen() {
  const [notices, setNotices] = useState(getNotices());

  const handleDelete = (id) => {
    deleteNotice(id);
    setNotices(getNotices());
  };

  return (
    // UI 코드...
  );
}
```

### After

```javascript
import { NoticeRepository } from '../../repositories';

export default function NoticeListScreen() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    setLoading(true);
    try {
      const data = await NoticeRepository.getAll();
      setNotices(data);
    } catch (error) {
      console.error('알림장 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await NoticeRepository.delete(id);
      setNotices(notices.filter(n => n.id !== id));
      alert('알림장이 삭제되었습니다');
    } catch (error) {
      alert('삭제에 실패했습니다');
      console.error('알림장 삭제 실패:', error);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    // UI 코드... (동일)
  );
}
```

---

## 예시 3: DashboardScreen (활동 기록)

### Before

```javascript
import recentActivities from '../../data/mockActivities';

export default function DashboardScreen() {
  const [activities] = useState(recentActivities.slice(0, 5));

  return (
    // UI 코드...
  );
}
```

### After

```javascript
import { ActivityRepository } from '../../repositories';

export default function DashboardScreen() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRecentActivities();
  }, []);

  const loadRecentActivities = async () => {
    setLoading(true);
    try {
      const data = await ActivityRepository.getRecent(5);
      setActivities(data);
    } catch (error) {
      console.error('활동 기록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    // UI 코드... (동일)
  );
}
```

---

## 마이그레이션 체크리스트

각 화면을 마이그레이션할 때 다음 사항을 확인하세요:

### 1. Import 변경
- [ ] Mock 데이터 import 제거
- [ ] Repository import 추가

### 2. State 추가
- [ ] `loading` state 추가
- [ ] `error` state 추가 (선택사항)

### 3. useEffect 추가
- [ ] 컴포넌트 마운트 시 데이터 로드

### 4. 함수 비동기로 변경
- [ ] CRUD 함수를 `async/await`로 변경
- [ ] Repository 메서드 호출
- [ ] try/catch로 에러 처리

### 5. 로딩/에러 UI 추가
- [ ] 로딩 중 표시
- [ ] 에러 발생 시 표시

---

## 공통 패턴

### 데이터 로드 패턴

```javascript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  loadData();
}, []);

const loadData = async () => {
  setLoading(true);
  setError(null);
  try {
    const result = await Repository.getAll();
    setData(result);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

### 생성 패턴

```javascript
const handleCreate = async (newData) => {
  try {
    const created = await Repository.create(newData);
    setData([...data, created]);
    // 성공 메시지
  } catch (error) {
    // 에러 메시지
  }
};
```

### 수정 패턴

```javascript
const handleUpdate = async (id, updatedData) => {
  try {
    const updated = await Repository.update(id, updatedData);
    setData(data.map(item => item.id === id ? updated : item));
    // 성공 메시지
  } catch (error) {
    // 에러 메시지
  }
};
```

### 삭제 패턴

```javascript
const handleDelete = async (id) => {
  try {
    await Repository.delete(id);
    setData(data.filter(item => item.id !== id));
    // 성공 메시지
  } catch (error) {
    // 에러 메시지
  }
};
```

---

## 마이그레이션 우선순위

다음 순서로 화면을 마이그레이션하는 것을 권장합니다:

### Phase 1: 선생님 앱 핵심 화면
1. ✅ `StudentListScreen` - 학생 목록
2. ✅ `StudentDetailScreen` - 학생 상세
3. ✅ `StudentFormScreen` - 학생 추가/수정
4. ✅ `DashboardScreen` - 대시보드
5. ✅ `NoticeListScreen` - 알림장 목록
6. ✅ `NoticeCreateScreen` - 알림장 작성

### Phase 2: 학부모 앱 핵심 화면
7. ✅ `HomeScreen` - 홈 화면
8. ✅ `ProgressScreen` - 진도 현황
9. ✅ `AttendanceScreen` - 출석 현황
10. ✅ `TuitionScreen` - 수강료
11. ✅ `NoticeScreen` - 알림장

### Phase 3: 나머지 화면
12. 기타 화면들

---

## 주의사항

### 1. 즉시 실행하지 말 것
Repository를 사용하도록 변경한 후 바로 테스트하세요. Mock 모드에서 잘 작동하는지 확인한 후 API 모드로 전환하세요.

### 2. 에러 처리 필수
모든 Repository 호출은 try/catch로 감싸야 합니다.

### 3. 로딩 상태 표시
사용자 경험을 위해 로딩 중임을 표시하세요.

### 4. 낙관적 업데이트 (Optimistic Updates)
필요한 경우, UI를 먼저 업데이트한 후 API 호출이 실패하면 되돌릴 수 있습니다.

```javascript
const handleDelete = async (id) => {
  // 1. 즉시 UI 업데이트 (낙관적)
  const originalData = data;
  setData(data.filter(item => item.id !== id));

  try {
    // 2. API 호출
    await Repository.delete(id);
  } catch (error) {
    // 3. 실패 시 원래대로 복구
    setData(originalData);
    alert('삭제에 실패했습니다');
  }
};
```

---

## 다음 단계

마이그레이션이 완료되면:

1. **Zustand 도입** - 전역 상태 관리
2. **React Query 도입** - 서버 상태 관리 및 캐싱
3. **TypeScript 마이그레이션** - 타입 안정성

자세한 내용은 [IMPROVEMENT_PLAN.md](../../docs/IMPROVEMENT_PLAN.md)를 참고하세요.
