# 에러 처리 체계 (Error Handling System)

피아노 학원 앱의 에러 처리 및 사용자 피드백 시스템 가이드입니다.

## 📋 목차

- [개요](#개요)
- [ErrorBoundary](#errorboundary)
- [Toast 알림 시스템](#toast-알림-시스템)
- [사용 예시](#사용-예시)
- [베스트 프랙티스](#베스트-프랙티스)

---

## 개요

앱의 에러 처리는 두 가지 주요 컴포넌트로 구성됩니다:

1. **ErrorBoundary**: React 컴포넌트 에러를 포착하여 앱 충돌을 방지
2. **Toast 알림**: 사용자에게 성공/실패/경고 메시지를 표시

### 시스템 구조

```
src/
├── components/
│   └── common/
│       ├── ErrorBoundary.js      # React Error Boundary
│       ├── Toast.js               # Toast 컴포넌트
│       └── ToastContainer.js      # Toast 컨테이너
└── store/
    └── toastStore.js              # Toast 상태 관리
```

---

## ErrorBoundary

### 개요

`ErrorBoundary`는 React 컴포넌트 트리에서 발생하는 에러를 포착하여 앱이 충돌하는 것을 방지합니다.

### 통합 방법

`App.js`에 이미 통합되어 있습니다:

```javascript
import ErrorBoundary from './src/components/common/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      {/* 앱 전체 */}
    </ErrorBoundary>
  );
}
```

### 에러 발생 시 동작

1. **개발 환경 (`__DEV__`)**:
   - 콘솔에 에러 스택 트레이스 출력
   - 에러 화면 표시 (재시도 버튼 포함)

2. **프로덕션 환경**:
   - 사용자에게 친절한 에러 화면 표시
   - TODO: Sentry 등 에러 추적 서비스로 전송

### 에러 화면 커스터마이징

에러 화면을 변경하려면 [ErrorBoundary.js:75-110](src/components/common/ErrorBoundary.js#L75-L110)의 `ErrorScreen` 컴포넌트를 수정하세요.

---

## Toast 알림 시스템

### 개요

Toast는 사용자에게 간단한 피드백 메시지를 표시하는 시스템입니다.

- **Zustand 기반**: 전역 상태 관리
- **애니메이션**: 부드러운 슬라이드-인/아웃 효과
- **자동 제거**: 지정된 시간 후 자동으로 사라짐
- **최대 개수 제한**: 동시에 최대 3개까지 표시

### Toast 타입

| 타입 | 색상 | 아이콘 | 기본 duration |
|------|------|--------|---------------|
| `success` | 초록색 (#10B981) | checkmark-circle | 3초 |
| `error` | 빨간색 (#EF4444) | close-circle | 4초 |
| `warning` | 주황색 (#F59E0B) | warning | 3초 |
| `info` | 파란색 (#3B82F6) | information-circle | 3초 |

### 기본 사용법

#### 방법 1: Store Hook 사용 (컴포넌트 내부)

```javascript
import { useToastStore } from '../../store';

function MyComponent() {
  const { success, error, warning, info } = useToastStore();

  const handleSave = async () => {
    try {
      await saveData();
      success('저장되었습니다');
    } catch (err) {
      error('저장에 실패했습니다');
    }
  };

  return <Button onPress={handleSave} />;
}
```

#### 방법 2: 편의 함수 사용 (컴포넌트 외부 가능)

```javascript
import { toast } from '../../store';

// API 호출 등 컴포넌트 외부에서도 사용 가능
async function apiCall() {
  try {
    const result = await fetch('/api/data');
    toast.success('데이터를 불러왔습니다');
    return result;
  } catch (err) {
    toast.error('데이터 로딩 실패');
    throw err;
  }
}
```

### Duration 커스터마이징

```javascript
// 기본값 (3초)
toast.success('저장 완료');

// 5초 동안 표시
toast.success('저장 완료', 5000);

// 자동으로 사라지지 않음 (0 또는 음수)
toast.error('중요한 에러 메시지', 0);
```

### 고급 기능

#### 모든 Toast 제거

```javascript
const { clearAll } = useToastStore();

clearAll(); // 현재 표시 중인 모든 Toast 제거
```

#### 최대 Toast 개수 설정

```javascript
const { setMaxToasts } = useToastStore();

setMaxToasts(5); // 기본값: 3
```

#### 특정 Toast 제거

```javascript
const { success, removeToast } = useToastStore();

const toastId = success('작업 진행 중...');

// 나중에 특정 Toast만 제거
setTimeout(() => {
  removeToast(toastId);
}, 2000);
```

---

## 사용 예시

### 1. 데이터 저장/수정

```javascript
import { useToastStore } from '../../store';
import { useStudentStore } from '../../store';

function StudentFormScreen() {
  const { addStudent, updateStudent, loading } = useStudentStore();
  const { success, error } = useToastStore();

  const handleSave = async () => {
    try {
      if (isEdit) {
        await updateStudent(student.id, formData);
        success('학생 정보가 수정되었습니다');
      } else {
        await addStudent(formData);
        success('학생이 등록되었습니다');
      }
      navigation.goBack();
    } catch (err) {
      error('저장에 실패했습니다');
      console.error(err);
    }
  };

  return (
    <Button
      onPress={handleSave}
      disabled={loading}
      title={loading ? '저장 중...' : '저장'}
    />
  );
}
```

### 2. 데이터 삭제 (확인 후)

```javascript
import { Alert } from 'react-native';
import { useToastStore } from '../../store';
import { useStudentStore } from '../../store';

function StudentDetailScreen({ route }) {
  const { deleteStudent } = useStudentStore();
  const { success, error } = useToastStore();
  const { id } = route.params;

  const handleDelete = () => {
    Alert.alert(
      '학생 삭제',
      '정말로 이 학생을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteStudent(id);
              success('학생이 삭제되었습니다');
              navigation.goBack();
            } catch (err) {
              error('삭제에 실패했습니다');
            }
          }
        }
      ]
    );
  };

  return <Button onPress={handleDelete} title="삭제" />;
}
```

### 3. 데이터 로딩 에러

```javascript
import { useEffect } from 'react';
import { useToastStore } from '../../store';
import { useStudentStore } from '../../store';

function StudentListScreen() {
  const { students, loading, error, fetchStudents } = useStudentStore();
  const toast = useToastStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await fetchStudents();
    } catch (err) {
      toast.error('학생 목록을 불러오지 못했습니다');
    }
  };

  const handleRefresh = async () => {
    try {
      await fetchStudents(true); // forceRefresh
      toast.info('새로고침 완료');
    } catch (err) {
      toast.error('새로고침 실패');
    }
  };

  if (loading && students.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <FlatList
      data={students}
      onRefresh={handleRefresh}
      refreshing={loading}
    />
  );
}
```

### 4. 유효성 검증

```javascript
import { useToastStore } from '../../store';
import { validatePhoneNumber, validateEmail } from '../../utils/validators';

function ContactFormScreen() {
  const { warning } = useToastStore();

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      warning('이름을 입력해주세요');
      return;
    }

    if (!validatePhoneNumber(formData.phone)) {
      warning('올바른 전화번호를 입력해주세요');
      return;
    }

    if (formData.email && !validateEmail(formData.email)) {
      warning('올바른 이메일 주소를 입력해주세요');
      return;
    }

    // 유효성 검증 통과 후 저장
    handleSave();
  };

  return <Button onPress={handleSubmit} title="저장" />;
}
```

### 5. Repository/API 호출

```javascript
// src/repositories/StudentRepository.js
import { toast } from '../store';

export const StudentRepository = {
  async create(studentData) {
    try {
      if (isMockMode()) {
        await simulateNetworkDelay();
        const newStudent = { id: Date.now().toString(), ...studentData };
        mockStudents.push(newStudent);
        return newStudent;
      }

      const response = await apiClient.post(ENDPOINTS.STUDENTS.CREATE, studentData);
      return response.data;
    } catch (error) {
      // Repository에서는 에러만 throw, Toast는 화면에서 처리
      console.error('Failed to create student:', error);
      throw error;
    }
  }
};
```

---

## 베스트 프랙티스

### ✅ DO (권장)

1. **사용자 액션에는 항상 피드백 제공**
   ```javascript
   const handleSave = async () => {
     try {
       await saveData();
       toast.success('저장 완료'); // ✅ 성공 메시지
     } catch (err) {
       toast.error('저장 실패'); // ✅ 에러 메시지
     }
   };
   ```

2. **명확하고 간결한 메시지**
   ```javascript
   toast.success('학생이 등록되었습니다'); // ✅ 구체적
   toast.error('저장에 실패했습니다'); // ✅ 명확
   ```

3. **적절한 Toast 타입 사용**
   ```javascript
   toast.success('저장 완료');           // ✅ 성공
   toast.error('네트워크 오류');         // ✅ 에러
   toast.warning('이름을 입력하세요');   // ✅ 경고/검증
   toast.info('캐시 데이터 사용 중');   // ✅ 정보
   ```

4. **컴포넌트에서 에러 처리**
   ```javascript
   // Repository는 에러만 throw
   async create(data) {
     const result = await api.post('/students', data);
     return result.data;
   }

   // 화면에서 Toast 표시
   const handleSave = async () => {
     try {
       await StudentRepository.create(data);
       toast.success('저장 완료'); // ✅
     } catch (err) {
       toast.error('저장 실패'); // ✅
     }
   };
   ```

5. **긴 작업에는 적절한 duration 설정**
   ```javascript
   toast.info('파일 업로드 중...', 5000); // ✅ 5초
   ```

### ❌ DON'T (비권장)

1. **너무 긴 메시지**
   ```javascript
   toast.error('학생 정보를 저장하는 중 오류가 발생했습니다. 네트워크 연결을 확인하고 다시 시도해주세요.'); // ❌ 너무 김
   toast.error('저장 실패'); // ✅ 간결
   ```

2. **연속으로 여러 Toast 표시**
   ```javascript
   toast.success('저장 완료');
   toast.info('목록으로 이동'); // ❌ 불필요
   toast.success('작업 완료'); // ❌ 중복
   ```

3. **Repository에서 Toast 직접 호출**
   ```javascript
   // ❌ Repository에서 Toast 사용
   async create(data) {
     try {
       const result = await api.post('/students', data);
       toast.success('저장 완료'); // ❌
       return result.data;
     } catch (err) {
       toast.error('저장 실패'); // ❌
       throw err;
     }
   }
   ```

4. **부적절한 Toast 타입**
   ```javascript
   toast.info('저장에 실패했습니다'); // ❌ error 타입 사용해야 함
   toast.error('저장 완료'); // ❌ success 타입 사용해야 함
   ```

5. **모든 에러에 Toast 사용**
   ```javascript
   // 중요하지 않은 에러는 조용히 처리
   try {
     const cached = await getCachedData();
   } catch (err) {
     // ❌ 캐시 실패는 사용자에게 알릴 필요 없음
     // toast.error('캐시 로딩 실패');
     console.log('Using fresh data instead of cache');
   }
   ```

---

## 테스트 예제

Toast 시스템을 테스트하려면 아무 화면에서 다음과 같이 버튼을 추가하세요:

```javascript
import { useToastStore } from '../../store';

function TestScreen() {
  const { success, error, warning, info } = useToastStore();

  return (
    <View style={{ padding: 20, gap: 10 }}>
      <Button
        title="Success Toast"
        onPress={() => success('작업이 완료되었습니다')}
      />
      <Button
        title="Error Toast"
        onPress={() => error('오류가 발생했습니다')}
      />
      <Button
        title="Warning Toast"
        onPress={() => warning('입력값을 확인해주세요')}
      />
      <Button
        title="Info Toast"
        onPress={() => info('캐시 데이터를 사용합니다')}
      />
      <Button
        title="Multiple Toasts"
        onPress={() => {
          success('첫 번째 메시지');
          setTimeout(() => error('두 번째 메시지'), 500);
          setTimeout(() => warning('세 번째 메시지'), 1000);
        }}
      />
    </View>
  );
}
```

---

## 향후 개선 사항

- [ ] Sentry 연동 (프로덕션 에러 추적)
- [ ] Toast 위치 커스터마이징 (top/bottom)
- [ ] Toast 애니메이션 옵션 추가
- [ ] 오프라인 에러 자동 감지 및 Toast 표시
- [ ] Toast 히스토리 기능
- [ ] 사운드/햅틱 피드백 옵션

---

## 참고 자료

- [ErrorBoundary.js](../src/components/common/ErrorBoundary.js)
- [Toast.js](../src/components/common/Toast.js)
- [ToastContainer.js](../src/components/common/ToastContainer.js)
- [toastStore.js](../src/store/toastStore.js)
- [Zustand 상태 관리 가이드](./ZUSTAND_STATE_MANAGEMENT.md)

---

**작성일**: 2025-10-20
**버전**: 1.0.0
