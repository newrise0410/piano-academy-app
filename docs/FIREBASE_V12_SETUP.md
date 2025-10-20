# Firebase v12.4.0 백엔드 설정 가이드

Piano Academy App의 **최신 Firebase v12.4.0** 백엔드 구축 완료!

## 📦 설치된 패키지

```json
{
  "firebase": "^12.4.0",
  "@react-native-async-storage/async-storage": "^2.1.0"
}
```

## ✨ Firebase v12.4.0의 주요 개선사항

### 1. **최신 Modular SDK**
- Tree-shaking 지원으로 번들 크기 최적화
- 필요한 기능만 import하여 사용

### 2. **향상된 TypeScript 지원**
- 더 나은 타입 추론
- 자동완성 개선

### 3. **성능 개선**
- 더 빠른 초기화
- 최적화된 네트워크 요청
- 향상된 오프라인 캐싱

### 4. **새로운 API**
- `increment()` - 원자적 카운터 증가/감소
- `arrayUnion()` / `arrayRemove()` - 배열 요소 추가/제거
- `writeBatch()` - 배치 작업 (최대 500개)
- `serverTimestamp()` - 서버 타임스탬프

## 📁 생성/수정된 파일

### 설정 파일
| 파일 | 설명 | 버전 |
|------|------|------|
| [src/config/firebase.js](../src/config/firebase.js) | Firebase 초기화 | v12.4.0 |
| [.env](.env) | Firebase 환경변수 | - |
| [.env.example](.env.example) | 환경변수 템플릿 | - |

### 서비스 파일
| 파일 | 설명 | 주요 기능 |
|------|------|----------|
| [src/services/authService.js](../src/services/authService.js) | 인증 서비스 | 로그인, 회원가입, 비밀번호 변경 |
| [src/services/firestoreService.js](../src/services/firestoreService.js) | Firestore CRUD | 학생, 출석, 알림장, 수강료, 갤러리 |

### 테스트
| 파일 | 설명 |
|------|------|
| [src/screens/FirebaseTestScreen.js](../src/screens/FirebaseTestScreen.js) | Firebase 테스트 화면 |

## 🔥 Firebase v12 주요 변경사항

### 1. Auth 초기화 - Hot Reload 처리

```javascript
// ✅ v12.4.0 - Hot Reload 에러 처리
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  // 이미 초기화된 경우 (Hot Reload 시)
  if (error.code === 'auth/already-initialized') {
    auth = getAuth(app);
  } else {
    throw error;
  }
}
```

### 2. Firestore - Timestamp 처리

```javascript
// ✅ v12.4.0 - Timestamp를 ISO 문자열로 변환
createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt
```

### 3. 새로운 Firestore 기능 활용

#### increment() - 원자적 카운터
```javascript
// 좋아요 수 증가
await updateDoc(docRef, {
  likes: increment(1),  // ✅ v12.4.0 새 기능
  updatedAt: serverTimestamp(),
});
```

#### arrayUnion() - 배열 요소 추가
```javascript
// 댓글 추가
await updateDoc(docRef, {
  comments: arrayUnion({  // ✅ v12.4.0 새 기능
    userId: 'user-id',
    text: '좋아요!',
    createdAt: Timestamp.now(),
  }),
});
```

#### writeBatch() - 배치 작업
```javascript
// 여러 문서 한 번에 업데이트 (최대 500개)
const batch = writeBatch(db);
batch.update(docRef1, { field: 'value1' });
batch.update(docRef2, { field: 'value2' });
await batch.commit();
```

### 4. 실시간 리스너 에러 처리

```javascript
// ✅ v12.4.0 - 에러 핸들링 추가
return onSnapshot(q, (snapshot) => {
  // 성공 콜백
  callback(data);
}, (error) => {
  // 에러 핸들링
  console.error('Subscription error:', error);
});
```

## 🚀 시작하기

### 1. Firebase Console 설정

#### 1-1. Authentication 활성화
1. [Firebase Console](https://console.firebase.google.com/) → **piano-academy-app-9050a**
2. **Authentication** → **시작하기**
3. **이메일/비밀번호** 활성화 → **저장**

#### 1-2. Firestore Database 생성
1. **Firestore Database** → **데이터베이스 만들기**
2. **테스트 모드로 시작** 선택
3. 위치: **asia-northeast3 (Seoul)**
4. **사용 설정** 클릭

#### 1-3. Firestore 보안 규칙 설정

**규칙** 탭에서 다음 규칙을 붙여넣고 **게시**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 인증된 사용자만 읽기/쓰기
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 2. 앱 실행

```bash
# Expo 서버 시작 (환경변수 적용)
npx expo start --clear
```

### 3. Firebase 테스트

1. 앱 실행 → **대시보드** 화면
2. **"🔥 Firebase 테스트"** 버튼 클릭
3. 테스트 순서:
   - ✅ **설정 확인** - Firebase 설정 검증
   - ✅ **회원가입** - 테스트 계정 생성
   - ✅ **로그인** - 인증 테스트
   - ✅ **학생 추가** - Firestore 쓰기 테스트
   - ✅ **학생 목록** - Firestore 읽기 테스트
   - ✅ **학생 삭제** - Firestore 삭제 테스트

## 🎯 Firebase v12 사용 예시

### 인증 (Authentication)

```javascript
import { loginWithEmail, registerWithEmail, logout } from '@/services/authService';

// 로그인
const result = await loginWithEmail('test@example.com', 'password123');
if (result.success) {
  console.log('로그인 성공:', result.user);
}

// 회원가입
const result = await registerWithEmail('new@example.com', 'password123', {
  name: '김선생님',
  role: 'teacher',
});

// 로그아웃
await logout();
```

### Firestore CRUD

```javascript
import {
  getAllStudents,
  addStudent,
  updateStudent,
  deleteStudent,
} from '@/services/firestoreService';

// 학생 목록 조회
const result = await getAllStudents(teacherId);
const students = result.data;

// 학생 추가
await addStudent({
  name: '김민수',
  age: 10,
  level: '초급',
}, teacherId);

// 학생 수정
await updateStudent(studentId, {
  level: '중급',
});

// 학생 삭제
await deleteStudent(studentId);
```

### 실시간 리스너

```javascript
import { subscribeToStudents } from '@/services/firestoreService';

// 학생 목록 실시간 구독
const unsubscribe = subscribeToStudents(teacherId, (students) => {
  console.log('학생 목록 업데이트:', students);
  setStudents(students);
});

// 구독 해제
unsubscribe();
```

### 좋아요 & 댓글 (v12 신기능)

```javascript
import {
  addLikeToGalleryItem,
  addCommentToGalleryItem,
} from '@/services/firestoreService';

// 좋아요 추가 (increment 사용)
await addLikeToGalleryItem(itemId);

// 댓글 추가 (arrayUnion 사용)
await addCommentToGalleryItem(itemId, {
  userId: currentUser.uid,
  userName: currentUser.displayName,
  text: '멋져요!',
});
```

## 📊 Firestore 데이터 구조

### users - 사용자 정보
```javascript
{
  email: "teacher@example.com",
  name: "김선생님",
  role: "teacher", // 'teacher' or 'parent'
  photoURL: null,
  phone: "010-1234-5678",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  lastLoginAt: Timestamp
}
```

### students - 학생 정보
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
  teacherId: "teacher-uid",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### gallery - 갤러리 (v12 신기능 활용)
```javascript
{
  type: "image",
  title: "발표회 사진",
  imageUrl: "https://...",
  likes: 5,  // ✅ increment() 사용
  comments: [  // ✅ arrayUnion() 사용
    {
      userId: "user-id",
      userName: "김학부모",
      text: "수고했어요!",
      createdAt: Timestamp
    }
  ],
  teacherId: "teacher-uid",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## 🔧 환경변수 설정

### .env 파일
```bash
# Firebase Configuration (v12.4.0)
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyAxB3l2xl9vEXb2yNEQLCK34205hrstJQI
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=piano-academy-app-9050a.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=piano-academy-app-9050a
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=piano-academy-app-9050a.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=618021355093
EXPO_PUBLIC_FIREBASE_APP_ID=1:618021355093:web:78e58cbdb4c746c0911edc

# Data Mode
EXPO_PUBLIC_DATA_MODE=mock  # 'mock' or 'firebase'
```

### Firebase 모드 전환

```bash
# Firebase 모드 사용
EXPO_PUBLIC_DATA_MODE=firebase

# Mock 모드로 돌아가기
EXPO_PUBLIC_DATA_MODE=mock
```

**⚠️ 중요**: 환경변수 변경 후 **반드시** Expo 서버 재시작!
```bash
npx expo start --clear
```

## 🐛 문제 해결

### "auth/already-initialized" 에러
✅ **해결됨** - v12 설정 파일에서 Hot Reload 처리 추가

```javascript
try {
  auth = initializeAuth(app, { persistence: ... });
} catch (error) {
  if (error.code === 'auth/already-initialized') {
    auth = getAuth(app);
  }
}
```

### Timestamp 변환 에러
✅ **해결됨** - Optional chaining으로 안전하게 변환

```javascript
createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt
```

### "Permission denied" 에러
Firebase Console → Firestore Database → 규칙 탭에서 보안 규칙 확인

### 환경변수가 적용되지 않음
```bash
npx expo start --clear  # --clear 옵션으로 캐시 삭제
```

## 🎓 학습 리소스

### Firebase v12 공식 문서
- [Firebase v12 Release Notes](https://firebase.google.com/support/release-notes/js)
- [Modular SDK 마이그레이션 가이드](https://firebase.google.com/docs/web/modular-upgrade)
- [Firestore 데이터 모델링](https://firebase.google.com/docs/firestore/data-model)
- [보안 규칙 작성](https://firebase.google.com/docs/firestore/security/get-started)

### React Native + Firebase
- [React Native Firebase 가이드](https://rnfirebase.io/)
- [Expo + Firebase 설정](https://docs.expo.dev/guides/using-firebase/)

## 📈 다음 단계

### 1. Firebase Storage 연동
```javascript
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// 이미지 업로드
const uploadImage = async (uri, path) => {
  const response = await fetch(uri);
  const blob = await response.blob();
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob);
  return await getDownloadURL(storageRef);
};
```

### 2. 실시간 리스너를 Zustand Store와 연동
```javascript
// useStudentStore.js
useEffect(() => {
  const unsubscribe = subscribeToStudents(teacherId, (students) => {
    setStudents(students);
  });
  return unsubscribe;
}, [teacherId]);
```

### 3. 오프라인 지원 활성화
```javascript
import { enableIndexedDbPersistence } from 'firebase/firestore';

// 웹에서만 사용 가능
if (Platform.OS === 'web') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.log('여러 탭에서 열려 있음');
    } else if (err.code === 'unimplemented') {
      console.log('브라우저가 지원하지 않음');
    }
  });
}
```

### 4. 프로덕션 배포
- ✅ Firebase App Check 활성화 (봇 공격 방지)
- ✅ 보안 규칙 강화
- ✅ EAS Secrets로 환경변수 관리
- ✅ Analytics & Crashlytics 설정

---

**Firebase 버전**: v12.4.0
**작성일**: 2025-10-20
**작성자**: Claude Code

🎉 **최신 Firebase v12.4.0으로 안전하고 빠른 백엔드를 사용하세요!**
