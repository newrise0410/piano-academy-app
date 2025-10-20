# Firebase 백엔드 설정 가이드

Piano Academy App의 Firebase 백엔드 구축이 완료되었습니다.

## 📋 목차

1. [구현 완료 사항](#구현-완료-사항)
2. [Firebase Console 설정](#firebase-console-설정)
3. [사용 방법](#사용-방법)
4. [테스트 방법](#테스트-방법)
5. [Firestore 데이터 구조](#firestore-데이터-구조)
6. [보안 규칙](#보안-규칙)
7. [문제 해결](#문제-해결)

---

## 구현 완료 사항

### 1. 설치된 패키지
```json
{
  "firebase": "^11.1.0",
  "@react-native-async-storage/async-storage": "^2.1.0"
}
```

### 2. 생성된 파일들

#### 설정 파일
- **`.env`** - Firebase 설정 정보 (API 키, 프로젝트 ID 등)
- **`.env.example`** - 환경변수 템플릿
- **`src/config/firebase.js`** - Firebase 초기화 및 설정

#### 서비스 파일
- **`src/services/authService.js`** - 인증 서비스 (로그인, 회원가입, 로그아웃)
- **`src/services/firestoreService.js`** - Firestore CRUD 서비스

#### 테스트 화면
- **`src/screens/FirebaseTestScreen.js`** - Firebase 연결 테스트 화면

### 3. 수정된 파일들
- **`src/config/dataConfig.js`** - Firebase 모드 추가
- **`src/repositories/studentRepository.js`** - Firebase 모드 지원
- **`src/navigation/TeacherNavigator.js`** - Firebase 테스트 화면 추가
- **`src/screens/teacher/DashboardScreen.js`** - Firebase 테스트 버튼 추가
- **`.gitignore`** - `.env` 파일 제외 추가

---

## Firebase Console 설정

### 1. Authentication 활성화

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 프로젝트 선택: **piano-academy-app-9050a**
3. **Authentication** 메뉴 클릭
4. **"시작하기"** 버튼 클릭
5. **로그인 제공업체** 탭에서 **"이메일/비밀번호"** 클릭
6. **"사용 설정"** 토글을 켜고 **"저장"**

### 2. Firestore Database 생성

1. **Firestore Database** 메뉴 클릭
2. **"데이터베이스 만들기"** 버튼 클릭
3. **"테스트 모드로 시작"** 선택 (개발용)
4. **위치 선택**: `asia-northeast3 (Seoul)`
5. **"사용 설정"** 클릭

### 3. Firestore 보안 규칙 설정

데이터베이스 생성 후 **"규칙"** 탭에서 다음 규칙을 설정하세요:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 사용자 문서 - 본인만 읽기/쓰기
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // 학생 문서 - 인증된 사용자(선생님)만 접근
    match /students/{studentId} {
      allow read, write: if request.auth != null;
      allow delete: if request.auth != null;
    }

    // 출석 기록
    match /attendance/{attendanceId} {
      allow read, write: if request.auth != null;
    }

    // 알림장
    match /notices/{noticeId} {
      allow read, write: if request.auth != null;
    }

    // 수강료
    match /tuition/{tuitionId} {
      allow read, write: if request.auth != null;
    }

    // 갤러리
    match /gallery/{galleryId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**"게시"** 버튼을 클릭하여 규칙을 저장하세요.

### 4. 테스트 계정 생성 (선택사항)

1. **Authentication** → **Users** 탭
2. **"사용자 추가"** 버튼 클릭
3. 이메일: `teacher@test.com`
4. 비밀번호: `test123456`
5. **"사용자 추가"** 클릭

---

## 사용 방법

### 데이터 모드 전환

프로젝트는 3가지 데이터 모드를 지원합니다:

1. **`mock`** - Mock 데이터 사용 (개발 중, 기본값)
2. **`api`** - REST API 사용 (외부 서버)
3. **`firebase`** - Firebase 백엔드 사용

### Firebase 모드로 전환

`.env` 파일을 수정하세요:

```bash
# .env 파일
EXPO_PUBLIC_DATA_MODE=firebase
```

### Mock 모드로 전환

```bash
# .env 파일
EXPO_PUBLIC_DATA_MODE=mock
```

### 환경변수 적용을 위한 서버 재시작

환경변수를 변경한 후에는 **반드시** Expo 서버를 재시작해야 합니다:

```bash
npx expo start --clear
```

---

## 테스트 방법

### 1. Firebase 테스트 화면 접속

1. 앱 실행
2. **대시보드** 화면으로 이동
3. **"🔥 Firebase 테스트"** 버튼 클릭

### 2. Firebase 설정 확인

테스트 화면에서 **"설정 확인"** 버튼을 클릭하여 Firebase가 올바르게 설정되었는지 확인합니다.

### 3. 회원가입 테스트

1. 이메일 입력 (예: `test@example.com`)
2. 비밀번호 입력 (최소 6자)
3. 이름 입력
4. **"회원가입"** 버튼 클릭
5. Firebase Console → Authentication에서 사용자가 생성되었는지 확인

### 4. 로그인 테스트

1. 위에서 생성한 이메일/비밀번호로 로그인
2. **"로그인"** 버튼 클릭
3. 로그인 성공 메시지 확인

### 5. Firestore CRUD 테스트

로그인 후:

1. **"학생 추가"** 버튼 클릭
2. Firebase Console → Firestore Database에서 `students` 컬렉션에 데이터가 추가되었는지 확인
3. **"학생 목록"** 버튼 클릭하여 추가된 학생이 표시되는지 확인
4. 학생 카드의 **"삭제"** 버튼을 클릭하여 삭제 기능 테스트

---

## Firestore 데이터 구조

### Collections (컬렉션)

#### 1. `users` - 사용자 정보
```javascript
{
  email: "teacher@example.com",
  name: "김선생님",
  role: "teacher", // 'teacher' or 'parent'
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### 2. `students` - 학생 정보
```javascript
{
  name: "김민수",
  age: 10,
  category: "초등",
  level: "초급",
  tuition: 100000,
  schedule: "월, 수 17:00",
  parentName: "김학부모",
  parentPhone: "010-1234-5678",
  teacherId: "user-uid", // 선생님 UID
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### 3. `attendance` - 출석 기록
```javascript
{
  studentId: "student-id",
  date: "2025-01-15",
  status: "present", // 'present', 'absent', 'late'
  teacherId: "user-uid",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### 4. `notices` - 알림장
```javascript
{
  title: "알림장 제목",
  content: "알림장 내용",
  studentIds: ["student-id-1", "student-id-2"],
  teacherId: "user-uid",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### 5. `tuition` - 수강료
```javascript
{
  studentId: "student-id",
  month: "2025-01",
  amount: 100000,
  isPaid: false,
  paidDate: null,
  teacherId: "user-uid",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### 6. `gallery` - 갤러리
```javascript
{
  type: "image", // 'image' or 'video'
  title: "발표회 사진",
  description: "설명",
  category: "event",
  album: "발표회",
  studentIds: ["student-id-1"],
  imageUrl: "https://...",
  likes: 5,
  comments: [
    {
      userId: "user-id",
      userName: "김학부모",
      text: "수고했어요!",
      createdAt: Timestamp
    }
  ],
  teacherId: "user-uid",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## 보안 규칙

현재 설정된 보안 규칙은 **개발용**입니다. 프로덕션 배포 전에 더 엄격한 규칙으로 변경해야 합니다.

### 프로덕션용 보안 규칙 예시

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 헬퍼 함수
    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    function isTeacher() {
      return isSignedIn() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher';
    }

    // 사용자 문서
    match /users/{userId} {
      allow read: if isSignedIn();
      allow write: if isOwner(userId);
    }

    // 학생 문서 - 선생님만 관리
    match /students/{studentId} {
      allow read: if isSignedIn();
      allow create, update, delete: if isTeacher();
    }

    // 출석 기록 - 선생님만 관리
    match /attendance/{attendanceId} {
      allow read: if isSignedIn();
      allow create, update: if isTeacher();
    }

    // 알림장 - 선생님만 작성, 모두 읽기
    match /notices/{noticeId} {
      allow read: if isSignedIn();
      allow create, update, delete: if isTeacher();
    }

    // 수강료 - 선생님만 관리
    match /tuition/{tuitionId} {
      allow read: if isSignedIn();
      allow create, update: if isTeacher();
    }

    // 갤러리 - 선생님만 업로드, 모두 읽기/좋아요/댓글
    match /gallery/{galleryId} {
      allow read: if isSignedIn();
      allow create, delete: if isTeacher();
      allow update: if isSignedIn(); // 좋아요, 댓글 허용
    }
  }
}
```

---

## 문제 해결

### 1. "Firebase가 설정되지 않았습니다" 에러

**원인**: `.env` 파일이 없거나 환경변수가 올바르지 않습니다.

**해결**:
1. `.env` 파일이 프로젝트 루트에 있는지 확인
2. 환경변수가 `EXPO_PUBLIC_` 접두사로 시작하는지 확인
3. Firebase Console에서 API 키를 다시 복사
4. Expo 서버 재시작: `npx expo start --clear`

### 2. "로그인이 필요합니다" 에러

**원인**: Firebase Authentication이 활성화되지 않았거나 사용자가 로그인하지 않았습니다.

**해결**:
1. Firebase Console → Authentication에서 이메일/비밀번호 로그인이 활성화되었는지 확인
2. 테스트 화면에서 회원가입 또는 로그인 수행
3. 로그인 상태 확인

### 3. "Permission denied" 에러

**원인**: Firestore 보안 규칙이 올바르게 설정되지 않았습니다.

**해결**:
1. Firebase Console → Firestore Database → 규칙 탭
2. 위의 보안 규칙을 복사하여 붙여넣기
3. **"게시"** 버튼 클릭
4. 몇 분 후 다시 시도

### 4. 환경변수가 적용되지 않음

**원인**: Expo는 빌드 시점에 환경변수를 읽습니다.

**해결**:
1. `.env` 파일 수정 후 **반드시** 서버 재시작
2. `npx expo start --clear` 명령어 사용
3. 앱 새로고침 (Expo Go에서 R 키 누르기)

### 5. "Network request failed" 에러

**원인**: 네트워크 연결 문제 또는 Firebase 서비스 접근 불가

**해결**:
1. 인터넷 연결 확인
2. Firebase Console에서 프로젝트가 정상 작동하는지 확인
3. API 키가 올바른지 확인
4. 방화벽 설정 확인

---

## 다음 단계

### 1. 다른 Repository에 Firebase 모드 추가

현재 `StudentRepository`만 Firebase 모드를 지원합니다. 다음 Repository들도 업데이트가 필요합니다:

- `attendanceRepository.js`
- `noticeRepository.js`
- `tuitionRepository.js`
- `galleryRepository.js` (미구현)

### 2. Firebase Storage 연동

갤러리 이미지 업로드를 위해 Firebase Storage를 연동해야 합니다:

```javascript
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// 이미지 업로드
const uploadImage = async (uri, path) => {
  const response = await fetch(uri);
  const blob = await response.blob();
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};
```

### 3. 실시간 리스너 적용

Zustand Store에 Firebase 실시간 리스너를 연결하여 데이터가 실시간으로 동기화되도록 합니다.

### 4. 오프라인 지원

Firestore의 오프라인 캐싱 기능을 활성화하여 네트워크 없이도 앱이 작동하도록 합니다.

### 5. 프로덕션 배포

- 보안 규칙 강화
- 환경변수를 EAS Secrets로 관리
- Firebase App Check 활성화
- Analytics 및 Crashlytics 설정

---

## 참고 자료

- [Firebase 공식 문서](https://firebase.google.com/docs)
- [Firestore 시작하기](https://firebase.google.com/docs/firestore/quickstart)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firestore 보안 규칙](https://firebase.google.com/docs/firestore/security/get-started)
- [Expo 환경변수](https://docs.expo.dev/guides/environment-variables/)

---

**작성일**: 2025-01-15
**버전**: 1.0.0
**작성자**: Claude Code
