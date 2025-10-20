옵션 1: Firebase 백엔드 완전 연동 (추천) ⭐
목표: 전체 앱을 Firebase 백엔드로 전환
필요한 작업:
나머지 Repository에 Firebase 모드 추가
attendanceRepository.js - 출석 관리
noticeRepository.js - 알림장 관리
tuitionRepository.js - 수강료 관리
scheduleRepository.js - 스케줄 관리
activityRepository.js - 활동 로그
인증 시스템 통합
로그인 화면 추가
AuthStore와 Firebase Authentication 연동
자동 로그인 (토큰 persistence)
로그아웃 기능
Firestore 인덱스 추가 생성
각 컬렉션에 필요한 복합 인덱스 생성
쿼리 최적화
실시간 데이터 동기화
Zustand Store에 Firebase 실시간 리스너 연결
자동 새로고침 구현
Firebase Storage 연동 (선택)
갤러리 이미지 업로드
프로필 사진 업로드
예상 소요 시간: 2-3시간 난이도: 중급
옵션 2: 채팅 기능 구현 (인기 기능)
목표: 선생님-학부모 1:1 채팅 기능 추가
필요한 작업:
Firestore 채팅 컬렉션 설계
chats - 채팅방 목록
messages - 메시지
채팅 UI 구현
채팅 목록 화면
채팅방 화면
실시간 메시지 전송/수신
푸시 알림 연동 (선택)
Firebase Cloud Messaging
새 메시지 알림
예상 소요 시간: 3-4시간 난이도: 중급-고급
옵션 3: 동영상 피드백 기능 구현
목표: 선생님이 학생 연주 영상에 피드백 제공
필요한 작업:
Firebase Storage 연동
동영상 업로드
썸네일 생성
피드백 시스템
동영상 재생
타임스탬프별 코멘트
음성/텍스트 피드백
UI 구현
동영상 목록
플레이어 화면
피드백 작성 UI
예상 소요 시간: 4-5시간 난이도: 고급
옵션 4: 프로덕션 배포 준비
목표: 앱을 실제로 배포할 수 있도록 준비
필요한 작업:
보안 강화
Firestore 보안 규칙 강화
Firebase App Check 활성화
환경변수 암호화 (EAS Secrets)
성능 최적화
번들 크기 최적화
이미지 최적화
캐싱 전략
에러 처리
Sentry 연동
Crashlytics 설정
사용자 친화적 에러 메시지
앱 스토어 준비
아이콘, 스플래시 스크린
앱 설명, 스크린샷
EAS Build 설정
예상 소요 시간: 5-6시간 난이도: 중급-고급
옵션 5: 추가 기능 구현
목표: IMPROVEMENT_PLAN.md의 Phase 2 기능들
가능한 기능들:
연습 타이머 - 학생 연습 시간 추적
커리큘럼 관리 - 교재 진도 관리
보강 일정 관리 - 보강 스케줄링
통계 대시보드 확장 - 더 많은 차트와 인사이트
알림 시스템 - 푸시 알림, 이메일 알림
예상 소요 시간: 기능별로 1-3시간 난이도: 초급-중급