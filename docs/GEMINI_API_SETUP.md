# Gemini API 설정 가이드

## 🔑 API 키 유효하지 않음 오류 해결

**오류 메시지:**
```
API key not valid. Please pass a valid API key.
```

---

## ✅ 해결 방법 (단계별)

### 1. Google Cloud Console에서 Generative Language API 활성화

**중요:** Google AI Studio에서 발급받은 키는 **Google Cloud Console에서 API를 활성화**해야 사용할 수 있습니다.

#### 단계:

1. **Google Cloud Console 접속**
   ```
   https://console.cloud.google.com/
   ```

2. **프로젝트 선택**
   - 상단에서 API 키와 연결된 프로젝트 선택
   - 모르겠다면 "All Projects" 확인

3. **API & Services 메뉴로 이동**
   - 왼쪽 메뉴에서 "APIs & Services" > "Library" 클릭

4. **Generative Language API 검색**
   - 검색창에 "Generative Language API" 입력
   - 또는 직접 링크: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com

5. **API 활성화**
   - "ENABLE" 버튼 클릭
   - 활성화 완료까지 1-2분 소요

---

### 2. API 키 제한 설정 확인

1. **Credentials 페이지로 이동**
   ```
   https://console.cloud.google.com/apis/credentials
   ```

2. **API 키 찾기**
   - API Keys 섹션에서 `AIzaSyDegfR6QuY0RkPYnEu-BXnzjKJl08UNHLc` 찾기

3. **편집 (연필 아이콘) 클릭**

4. **API restrictions 설정**
   - "Don't restrict key" 선택 (개발용)
   - 또는 "Restrict key" → "Generative Language API" 체크

5. **Save 버튼 클릭**

---

### 3. 앱 재시작

```bash
# Metro Bundler 중지 (Ctrl+C)

# 캐시 삭제 후 재시작
npx expo start -c
```

---

## 🆕 새 API 키 발급 (대안)

위 방법으로 해결되지 않으면 새 키를 발급받으세요:

### Google AI Studio에서 발급

1. **접속**
   ```
   https://aistudio.google.com/app/apikey
   ```

2. **"Create API key" 클릭**

3. **"Create API key in new project" 선택**
   - 새 프로젝트를 만들면 자동으로 API가 활성화됩니다

4. **API 키 복사**

5. **.env 파일에 붙여넣기**
   ```bash
   EXPO_PUBLIC_GEMINI_API_KEY=새로_발급받은_키
   ```

---

## 🧪 API 키 테스트

API 키가 올바르게 작동하는지 테스트하는 방법:

### curl로 테스트

```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDegfR6QuY0RkPYnEu-BXnzjKJl08UNHLc" \
-H 'Content-Type: application/json' \
-d '{
  "contents": [{
    "parts":[{"text": "안녕하세요"}]
  }]
}'
```

**성공 응답:**
```json
{
  "candidates": [
    {
      "content": {
        "parts": [{"text": "안녕하세요! 무엇을 도와드릴까요?"}]
      }
    }
  ]
}
```

**실패 응답:**
```json
{
  "error": {
    "code": 400,
    "message": "API key not valid. Please pass a valid API key."
  }
}
```

---

## 💰 비용 정보

**Gemini 1.5 Flash (우리가 사용하는 모델):**
- 무료 티어: 월 1,500회 요청
- 속도: 2-3초/응답
- 한국어 지원: 완벽

**학원 알림장 용도:**
- 월 50-100개 알림장 작성 → 무료
- 비용 걱정 없음 ✅

---

## 🔒 보안 주의사항

### ⚠️ API 키 노출 방지

1. **.env 파일은 Git에 커밋하지 마세요**
   ```bash
   # .gitignore에 이미 추가되어 있음
   .env
   ```

2. **프로덕션에서는 서버에서 호출**
   - 클라이언트에서 직접 호출 → API 키 노출 위험
   - 서버(Cloud Functions 등)에서 호출 → 안전

3. **API 키 제한 설정**
   - IP 주소 제한
   - Referrer 제한
   - API 제한

---

## 📱 앱에서 사용 방법

### 알림장 작성 화면에서

1. **템플릿 선택**
   - 🎹 발표회 안내
   - 🏠 휴강 안내
   - 💰 수강료 안내
   - ✏️ 직접 입력

2. **AI에게 요청**
   ```
   예: "12월 25일 오후 2시에 학원 연주홀에서 발표회를 합니다"
   ```

3. **"AI로 작성하기 ✨" 클릭**

4. **2-3초 후 자동 생성!**

5. **(선택) 더 친절하게 / 더 간결하게**

---

## 🛠️ 트러블슈팅

### 문제: "Gemini API 키가 설정되지 않았습니다"

**해결:**
```bash
# .env 파일 확인
cat .env | grep GEMINI

# 앱 재시작
npm start
```

### 문제: "API 생성 중 오류가 발생했습니다"

**해결:**
1. 네트워크 연결 확인
2. API 활성화 확인
3. API 키 유효성 확인
4. 콘솔 로그 확인

### 문제: 응답이 느림

**원인:** 네트워크 속도
**해결:** 정상입니다. Gemini API는 2-3초 소요됩니다.

---

## 📞 지원

문제가 계속되면:
1. Metro Bundler 로그 확인
2. Chrome DevTools 콘솔 확인
3. API 키 재발급

**Google AI Studio 문서:**
https://ai.google.dev/tutorials/get_started_web
