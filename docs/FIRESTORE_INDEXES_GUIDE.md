# Firestore 인덱스 생성 가이드

Firebase Firestore에서 복합 쿼리를 사용하려면 **복합 인덱스(Composite Indexes)**를 생성해야 합니다.

## 목차
- [필요한 인덱스 목록](#필요한-인덱스-목록)
- [자동 생성 방법 (추천)](#자동-생성-방법-추천)
- [수동 생성 방법](#수동-생성-방법)
- [인덱스 생성 확인](#인덱스-생성-확인)
- [문제 해결](#문제-해결)

---

## 필요한 인덱스 목록

Piano Academy App에서 필요한 Firestore 인덱스는 총 **13개**입니다.

### 1. Students 컬렉션 (1개)

| 필드 | 정렬 방향 | 상태 |
|------|----------|------|
| `teacherId` | Ascending | ✅ 이미 생성됨 |
| `createdAt` | Descending | |

**사용 위치**: `firestoreService.js:42-46`, `firestoreService.js:680-684`

---

### 2. Attendance 컬렉션 (1개)

| 필드 | 정렬 방향 |
|------|----------|
| `teacherId` | Ascending |
| `date` | Ascending |

**사용 위치**: `firestoreService.js:176-180`

**쿼리 예시**:
```javascript
query(
  attendanceRef,
  where('teacherId', '==', teacherId),
  where('date', '==', date)
)
```

---

### 3. Notices 컬렉션 (1개)

| 필드 | 정렬 방향 |
|------|----------|
| `teacherId` | Ascending |
| `createdAt` | Descending |

**사용 위치**: `firestoreService.js:254-258`, `firestoreService.js:710-714`

**쿼리 예시**:
```javascript
query(
  noticesRef,
  where('teacherId', '==', teacherId),
  orderBy('createdAt', 'desc')
)
```

---

### 4. Tuition 컬렉션 (1개)

| 필드 | 정렬 방향 |
|------|----------|
| `teacherId` | Ascending |
| `month` | Ascending |

**사용 위치**: `firestoreService.js:358-362`

**쿼리 예시**:
```javascript
query(
  tuitionRef,
  where('teacherId', '==', teacherId),
  where('month', '==', month)
)
```

---

### 5. Gallery 컬렉션 (3개)

#### 5-1. 기본 인덱스

| 필드 | 정렬 방향 |
|------|----------|
| `teacherId` | Ascending |
| `createdAt` | Descending |

**사용 위치**: `firestoreService.js:438-442`

#### 5-2. Category 필터 인덱스

| 필드 | 정렬 방향 |
|------|----------|
| `teacherId` | Ascending |
| `category` | Ascending |
| `createdAt` | Descending |

**사용 위치**: `firestoreService.js:444-446`

#### 5-3. Album 필터 인덱스

| 필드 | 정렬 방향 |
|------|----------|
| `teacherId` | Ascending |
| `album` | Ascending |
| `createdAt` | Descending |

**사용 위치**: `firestoreService.js:448-450`

---

### 6. Notifications 컬렉션 (2개)

#### 6-1. 기본 인덱스

| 필드 | 정렬 방향 |
|------|----------|
| `teacherId` | Ascending |
| `timestamp` | Descending |

**사용 위치**: `firestoreService.js:680-685`

**쿼리 예시**:
```javascript
query(
  notificationsRef,
  where('teacherId', '==', teacherId),
  orderBy('timestamp', 'desc')
)
```

#### 6-2. isRead 필터 인덱스

| 필드 | 정렬 방향 |
|------|----------|
| `teacherId` | Ascending |
| `isRead` | Ascending |
| `timestamp` | Descending |

**사용 위치**: `firestoreService.js:687-688`

**쿼리 예시**:
```javascript
query(
  notificationsRef,
  where('teacherId', '==', teacherId),
  where('isRead', '==', false),
  orderBy('timestamp', 'desc')
)
```

---

### 7. Activities 컬렉션 (4개)

#### 7-1. 기본 인덱스

| 필드 | 정렬 방향 |
|------|----------|
| `teacherId` | Ascending |
| `timestamp` | Descending |

**사용 위치**: `firestoreService.js:571-575`

#### 7-2. Type 필터 인덱스

| 필드 | 정렬 방향 |
|------|----------|
| `teacherId` | Ascending |
| `type` | Ascending |
| `timestamp` | Descending |

**사용 위치**: `firestoreService.js:577-578`

**쿼리 예시**:
```javascript
query(
  activitiesRef,
  where('teacherId', '==', teacherId),
  where('type', '==', 'attendance'),
  orderBy('timestamp', 'desc')
)
```

#### 7-3. StudentId 필터 인덱스

| 필드 | 정렬 방향 |
|------|----------|
| `teacherId` | Ascending |
| `studentId` | Ascending |
| `timestamp` | Descending |

**사용 위치**: `firestoreService.js:581-582`

#### 7-4. 날짜 범위 인덱스

| 필드 | 정렬 방향 |
|------|----------|
| `teacherId` | Ascending |
| `timestamp` | Ascending |

**사용 위치**: `firestoreService.js:641-646`

**쿼리 예시**:
```javascript
query(
  activitiesRef,
  where('teacherId', '==', teacherId),
  where('timestamp', '>=', startTimestamp),
  where('timestamp', '<=', endTimestamp),
  orderBy('timestamp', 'desc')
)
```

---

## 자동 생성 방법 (추천)

가장 쉬운 방법은 앱을 실행하고 Firebase가 제공하는 링크를 클릭하는 것입니다.

### 1단계: 앱 실행

```bash
npm start
# 또는
npx expo start
```

### 2단계: 앱에서 기능 사용

앱에서 다음 기능들을 사용해보세요:
- ✅ 로그인
- ✅ 학생 목록 조회
- ✅ 출석 체크
- ✅ 알림장 작성/조회
- ✅ 수강료 조회
- ✅ 갤러리 조회
- ✅ 최근 활동 조회

### 3단계: 에러 확인

터미널/콘솔에서 다음과 같은 에러 메시지를 확인하세요:

```
[FirebaseError: The query requires an index. You can create it here:
https://console.firebase.google.com/v1/r/project/piano-academy-app-9050a/firestore/indexes?create_composite=...]
```

### 4단계: 링크 클릭

1. 에러 메시지의 **전체 URL**을 복사합니다
2. 브라우저에서 URL을 엽니다
3. Firebase Console로 자동 이동됩니다

### 5단계: 인덱스 생성

1. Firebase Console에서 인덱스 구성이 **자동으로 채워져 있습니다**
2. **"Create Index"** 버튼을 클릭합니다
3. 인덱스 빌드 시작 (상태: Building...)

### 6단계: 대기

- 인덱스 빌드는 보통 **1-2분** 소요됩니다
- 상태가 **"Enabled"**로 변경되면 완료입니다

### 7단계: 반복

- 앱으로 돌아가서 다시 기능을 사용합니다
- 다른 인덱스가 필요하면 2-6단계를 반복합니다
- 모든 기능이 에러 없이 작동할 때까지 반복합니다

---

## 수동 생성 방법

자동 링크를 사용할 수 없는 경우, Firebase Console에서 직접 생성할 수 있습니다.

### 1단계: Firebase Console 접속

1. https://console.firebase.google.com/ 접속
2. 프로젝트 선택: **piano-academy-app-9050a**
3. 왼쪽 메뉴에서 **Firestore Database** 클릭
4. 상단 탭에서 **Indexes** 클릭

### 2단계: 복합 인덱스 생성

1. **"Create Index"** 버튼 클릭
2. 아래 정보를 입력합니다:

#### 예시: Notices 컬렉션 인덱스

```
Collection ID: notices

Fields:
  - Field: teacherId
    Order: Ascending

  - Field: createdAt
    Order: Descending

Query scope: Collection
```

3. **"Create"** 버튼 클릭
4. 1-2분 대기 (Building → Enabled)

### 3단계: 모든 인덱스 생성

위 "[필요한 인덱스 목록](#필요한-인덱스-목록)" 섹션의 표를 참고하여 모든 인덱스를 생성합니다.

---

## 인덱스 생성 확인

### Firebase Console에서 확인

1. Firebase Console → Firestore Database → Indexes 탭
2. 생성된 인덱스 목록 확인
3. 상태가 **"Enabled"**인지 확인

### 앱에서 확인

1. 앱을 다시 실행합니다
2. 모든 기능을 테스트합니다
3. 에러 없이 데이터가 정상적으로 로드되는지 확인합니다

---

## 문제 해결

### Q1. 인덱스 생성 링크가 보이지 않아요

**A**: 콘솔 출력을 확인하세요. React Native는 에러를 다음 위치에 출력합니다:
- Metro Bundler 터미널
- Expo DevTools (웹 브라우저)
- React Native Debugger (사용 중인 경우)

### Q2. 인덱스를 생성했는데도 에러가 발생해요

**A**:
1. 인덱스 상태가 **"Enabled"**인지 확인하세요
2. 앱을 완전히 종료하고 다시 시작하세요
3. 필드명과 정렬 방향이 정확한지 확인하세요

### Q3. 인덱스 빌드가 너무 오래 걸려요

**A**:
- 보통 1-2분이지만, 데이터가 많으면 5-10분 걸릴 수 있습니다
- 10분 이상 걸리면 Firebase Support에 문의하세요

### Q4. 특정 쿼리만 에러가 발생해요

**A**:
1. 에러 메시지의 전체 URL을 확인하세요
2. URL에 정확한 인덱스 구성이 포함되어 있습니다
3. 그 구성대로 인덱스를 생성하세요

### Q5. 인덱스를 잘못 생성했어요

**A**:
1. Firebase Console → Indexes 탭
2. 잘못된 인덱스 우측의 **...** 메뉴 클릭
3. **"Delete"** 선택
4. 올바른 인덱스를 다시 생성하세요

---

## 인덱스 생성 체크리스트

앱의 모든 기능이 정상 작동하려면 다음 인덱스가 필요합니다:

- [ ] Students: `teacherId` + `createdAt` ✅ (이미 생성됨)
- [ ] Attendance: `teacherId` + `date`
- [ ] Notices: `teacherId` + `createdAt`
- [ ] Tuition: `teacherId` + `month`
- [ ] Gallery: `teacherId` + `createdAt`
- [ ] Gallery: `teacherId` + `category` + `createdAt`
- [ ] Gallery: `teacherId` + `album` + `createdAt`
- [ ] Notifications: `teacherId` + `timestamp` ⚠️ 새로 추가됨
- [ ] Notifications: `teacherId` + `isRead` + `timestamp` ⚠️ 새로 추가됨
- [ ] Activities: `teacherId` + `timestamp`
- [ ] Activities: `teacherId` + `type` + `timestamp`
- [ ] Activities: `teacherId` + `studentId` + `timestamp`
- [ ] Activities: `teacherId` + `timestamp` (범위 쿼리용)

---

## 추가 참고 자료

- [Firebase Firestore Indexes 공식 문서](https://firebase.google.com/docs/firestore/query-data/indexing)
- [복합 인덱스 이해하기](https://firebase.google.com/docs/firestore/query-data/index-overview#composite_indexes)
- [인덱스 제한사항](https://firebase.google.com/docs/firestore/quotas#indexes)

---

## 도움이 필요하신가요?

인덱스 생성 중 문제가 발생하면:
1. 에러 메시지 전체를 복사하세요
2. Firebase Console에서 현재 인덱스 목록을 확인하세요
3. 개발팀에 문의하세요

**Firebase Project**: piano-academy-app-9050a
**Firebase Console**: https://console.firebase.google.com/project/piano-academy-app-9050a/firestore
