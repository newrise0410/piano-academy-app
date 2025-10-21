// src/constants/noticeTemplates.js
import { TEACHER_TEMPLATE_COLORS } from '../styles/teacher_colors';

/**
 * 알림장 템플릿 목록
 *
 * 각 템플릿은 다음 속성을 포함:
 * - id: 고유 식별자
 * - title: 템플릿 제목
 * - emoji: 대표 이모지
 * - color: 테마 색상
 * - prompt: AI 생성용 프롬프트
 * - generatedTitle: 미리 생성된 제목
 * - generatedContent: 미리 생성된 내용
 */
export const NOTICE_TEMPLATES = [
  {
    id: '1',
    title: '발표회 안내',
    emoji: '🎹',
    color: TEACHER_TEMPLATE_COLORS.concert,
    prompt: '12월 25일 오후 2시에 학원 연주홀에서 발표회를 개최합니다.',
    generatedTitle: '[발표회 안내]',
    generatedContent: '안녕하세요, 학부모님 😊\n\n12월 25일(수) 오후 2시, 학원 연주홀에서 정기 발표회를 개최합니다.\n\n그동안 열심히 연습한 곡들을 보여드릴 수 있는 소중한 시간이니 많은 참석 부탁드립니다.',
  },
  {
    id: '2',
    title: '휴강 안내',
    emoji: '🏠',
    color: TEACHER_TEMPLATE_COLORS.closure,
    prompt: '10월 18일(금)은 원장님 개인 사정으로 휴강합니다.',
    generatedTitle: '[휴강 안내]',
    generatedContent: '안녕하세요, 학부모님 😊\n\n10월 18일(금)은 원장님 개인 사정으로 휴강하게 되었습니다.\n\n보강 일정은 추후 개별적으로 안내드리겠습니다. 양해 부탁드립니다.',
  },
  {
    id: '3',
    title: '수강료 안내',
    emoji: '💰',
    color: TEACHER_TEMPLATE_COLORS.tuition,
    prompt: '10월 수강료는 10월 5일까지 납부해주세요.',
    generatedTitle: '[수강료 납부 안내]',
    generatedContent: '안녕하세요, 학부모님 😊\n\n10월 수강료 납부 안내드립니다.\n\n납부 기한: 10월 5일(목)까지\n입금 계좌: 국민은행 123-456-789012\n\n기한 내 납부 부탁드립니다.',
  },
  {
    id: '4',
    title: '직접 입력',
    emoji: '✏️',
    color: TEACHER_TEMPLATE_COLORS.custom,
    prompt: '',
    generatedTitle: '',
    generatedContent: '',
  },
];

/**
 * 학생 카테고리 필터 옵션
 */
export const STUDENT_CATEGORIES = ['전체', '초등', '중등', '고등', '성인'];

/**
 * 요일 필터 옵션
 */
export const DAY_FILTERS = ['전체', '월', '화', '수', '목', '금', '토', '일'];
