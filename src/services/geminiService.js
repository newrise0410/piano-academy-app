// src/services/geminiService.js
// Google Gemini AI 서비스

import { GoogleGenerativeAI } from '@google/generative-ai';
import { STUDENT_MEMO_PRESETS, AI_TONE_PRESETS } from '../constants/aiPresets';

/**
 * Gemini API 초기화
 */
const initGeminiAI = () => {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('⚠️ Gemini API 키가 설정되지 않았습니다. .env 파일을 확인해주세요.');
    return null;
  }

  // 디버깅 로그 (키의 앞 10자만 표시)
  console.log('🔑 Gemini API Key:', apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4));

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    console.log('✅ Gemini AI initialized successfully');
    return genAI;
  } catch (error) {
    console.error('❌ Gemini AI initialization error:', error);
    return null;
  }
};

/**
 * 알림장 자동 생성
 * @param {string} prompt - 사용자 요청 (예: "12월 25일 발표회를 합니다")
 * @param {string} templateType - 템플릿 종류 ('concert', 'closure', 'tuition', 'custom')
 * @returns {Promise<Object>} { title: string, content: string }
 */
export const generateNoticeContent = async (prompt, templateType = 'custom') => {
  try {
    const genAI = initGeminiAI();

    if (!genAI) {
      throw new Error('Gemini API가 초기화되지 않았습니다');
    }

    // Gemini 2.5 Flash 모델 사용 (최신 버전, 빠르고 효율적)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // 시스템 프롬프트 구성
    const systemPrompt = `당신은 피아노 학원 선생님의 알림장 작성을 도와주는 AI 비서입니다.

역할:
- 학부모님들께 보낼 알림장을 친절하고 정중하게 작성합니다
- 이모지를 적절히 사용하여 친근한 느낌을 줍니다
- 간결하면서도 필요한 정보를 모두 담습니다
- 항상 존댓말을 사용합니다

작성 규칙:
1. 제목: [대괄호]로 감싸고 간결하게 (예: [발표회 안내], [휴강 안내])
2. 인사: "안녕하세요, 학부모님 😊"로 시작
3. 본문: 사용자가 요청한 내용을 자연스럽게 풀어서 작성
4. 마무리: "감사합니다." 또는 적절한 인사로 마무리
5. 길이: 3-5문장 정도로 간결하게

출력 형식:
반드시 아래 JSON 형식으로만 답변해주세요:
{
  "title": "제목",
  "content": "본문 내용"
}`;

    // 사용자 요청
    const userPrompt = `다음 내용으로 알림장을 작성해주세요:\n\n${prompt}`;

    // Gemini API 호출
    const result = await model.generateContent([
      systemPrompt,
      userPrompt
    ]);

    const response = await result.response;
    const text = response.text();

    // JSON 파싱 시도
    try {
      // JSON 형식 추출 (```json ... ``` 제거)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          success: true,
          title: parsed.title || '[알림장]',
          content: parsed.content || text,
        };
      }
    } catch (parseError) {
      // JSON 파싱 실패시 텍스트 그대로 사용
      console.log('JSON 파싱 실패, 텍스트 그대로 사용:', parseError);
    }

    // 파싱 실패시 텍스트를 직접 파싱
    const lines = text.split('\n').filter(line => line.trim());
    const title = lines[0]?.replace(/["\[\]]/g, '').trim() || '[알림장]';
    const content = lines.slice(1).join('\n').trim() || text;

    return {
      success: true,
      title: title.startsWith('[') ? title : `[${title}]`,
      content,
    };

  } catch (error) {
    console.error('Gemini API 호출 오류:', error);

    // 에러 발생시 기본 템플릿 반환
    return {
      success: false,
      error: error.message,
      title: '[알림장]',
      content: getFallbackContent(prompt, templateType),
    };
  }
};

/**
 * AI 호출 실패시 폴백 컨텐츠
 */
const getFallbackContent = (prompt, templateType) => {
  const greeting = '안녕하세요, 학부모님 😊\n\n';
  const closing = '\n\n감사합니다.';

  return greeting + prompt + closing;
};

/**
 * 알림장 내용 개선 (더 친절하게 / 더 간결하게)
 * @param {string} originalContent - 원본 내용
 * @param {string} direction - 'friendly' 또는 'concise'
 * @returns {Promise<Object>} { content: string }
 */
export const improveNoticeContent = async (originalContent, direction = 'friendly') => {
  try {
    const genAI = initGeminiAI();

    if (!genAI) {
      throw new Error('Gemini API가 초기화되지 않았습니다');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const directionPrompts = {
      friendly: '더 친절하고 부드러운 표현으로 바꿔주세요. 이모지를 더 추가하고 학부모님의 마음을 편안하게 해주는 표현을 사용해주세요.',
      concise: '더 간결하고 핵심적인 표현으로 바꿔주세요. 불필요한 수식어를 제거하되 필요한 정보는 모두 유지해주세요.'
    };

    const systemPrompt = `당신은 피아노 학원 알림장 작성 전문가입니다.
아래 알림장 내용을 ${direction === 'friendly' ? '더 친절하게' : '더 간결하게'} 다시 작성해주세요.

${directionPrompts[direction]}

출력 형식: 개선된 내용만 반환해주세요. (JSON이 아닌 텍스트로)`;

    const result = await model.generateContent([
      systemPrompt,
      `원본 내용:\n${originalContent}`
    ]);

    const response = await result.response;
    const improvedContent = response.text().trim();

    return {
      success: true,
      content: improvedContent,
    };

  } catch (error) {
    console.error('Gemini API 호출 오류:', error);
    return {
      success: false,
      error: error.message,
      content: originalContent, // 실패시 원본 반환
    };
  }
};

/**
 * 학부모 연락용 메시지 자동 생성
 * @param {string} type - 'payment', 'attendance', 'lessonExpiry', 'noticeUnconfirmed'
 * @param {Object} context - { studentName, parentName, daysOverdue, absenceCount, remainingSessions, etc }
 * @returns {Promise<Object>} { success, message }
 */
export const generateParentContactMessage = async (type, context) => {
  try {
    const genAI = initGeminiAI();

    if (!genAI) {
      throw new Error('Gemini API가 초기화되지 않았습니다');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // 타입별 시스템 프롬프트
    const systemPrompts = {
      payment: `당신은 피아노 학원 선생님의 수강료 안내 메시지를 작성하는 AI 비서입니다.

핵심 원칙:
- 절대 직접적으로 "돈을 내세요"라고 말하지 않습니다
- "혹시 바쁘셔서 깜빡하신 건 아닐까" 하는 배려 어린 톤을 사용합니다
- 부담스럽지 않게, 친근하게 안내합니다
- 은근히 알려주는 느낌으로 작성합니다
- 존댓말을 사용하고 이모지를 적절히 사용합니다

메시지 구조:
1. 친근한 인사
2. "혹시 바쁘셔서..." 식의 부드러운 서론
3. 수강료 안내 (직접적이지 않게)
4. 편한 시간에 연락 달라는 마무리`,

      attendance: `당신은 피아노 학원 선생님의 결석 확인 메시지를 작성하는 AI 비서입니다.

핵심 원칙:
- "왜 안 오세요?"가 아니라 "건강이 괜찮으신지 걱정되어서" 톤을 사용합니다
- 학생의 건강과 안부를 먼저 걱정하는 느낌
- 진도 걱정보다는 학생 걱정이 우선
- 따뜻하고 배려 넘치는 표현 사용
- 존댓말을 사용하고 이모지를 적절히 사용합니다

메시지 구조:
1. 친근한 인사
2. 학생 건강/안부 걱정
3. 필요한 경우 수업 조율 가능하다는 안내
4. 부담 없이 연락 달라는 마무리`,

      lessonExpiry: `당신은 피아노 학원 선생님의 수강권 갱신 안내 메시지를 작성하는 AI 비서입니다.

핵심 원칙:
- "수강권이 곧 만료됩니다" 대신 "미리 안내드립니다" 톤 사용
- 학생의 꾸준한 연습을 칭찬하며 자연스럽게 안내
- 갱신에 대한 부담을 최소화
- 필요한 경우 상담 가능하다는 열린 자세
- 존댓말을 사용하고 이모지를 적절히 사용합니다

메시지 구조:
1. 친근한 인사와 학생 칭찬
2. 잔여 횟수 안내 (자연스럽게)
3. 수강권 갱신 옵션 간단히 소개
4. 편한 시간에 상담 가능하다는 마무리`,

      noticeUnconfirmed: `당신은 피아노 학원 선생님의 알림장 확인 요청 메시지를 작성하는 AI 비서입니다.

핵심 원칙:
- "왜 안 보세요?"가 아니라 "혹시 못 보셨을까봐" 톤 사용
- 중요한 내용일 수 있다는 것을 부드럽게 안내
- 바쁠 수 있다는 것을 이해하는 표현
- 간단히 확인만 부탁하는 느낌
- 존댓말을 사용하고 이모지를 적절히 사용합니다

메시지 구조:
1. 친근한 인사
2. 알림장 발송 사실 언급
3. 혹시 못 보셨을까 걱정되어서 연락드린다는 표현
4. 시간 날 때 확인 부탁하는 마무리`
    };

    // 사용자 프롬프트 구성
    let userPrompt = '';
    const studentName = context.studentName || '학생';

    switch (type) {
      case 'payment':
        userPrompt = `학생 이름: ${studentName}
미납 기간: ${context.daysOverdue || 0}일

위 정보를 바탕으로 수강료 안내 메시지를 작성해주세요.`;
        break;

      case 'attendance':
        userPrompt = `학생 이름: ${studentName}
연속 결석 횟수: ${context.absenceCount || 0}회

위 정보를 바탕으로 결석 확인 메시지를 작성해주세요.`;
        break;

      case 'lessonExpiry':
        userPrompt = `학생 이름: ${studentName}
잔여 수강 횟수: ${context.remainingSessions || 0}회

위 정보를 바탕으로 수강권 갱신 안내 메시지를 작성해주세요.`;
        break;

      case 'noticeUnconfirmed':
        userPrompt = `학생 이름: ${studentName}
알림장 제목: ${context.noticeTitle || '알림장'}

위 정보를 바탕으로 알림장 확인 요청 메시지를 작성해주세요.`;
        break;

      default:
        throw new Error(`Unknown message type: ${type}`);
    }

    // Gemini API 호출
    const result = await model.generateContent([
      systemPrompts[type],
      userPrompt
    ]);

    const response = await result.response;
    const message = response.text().trim();

    return {
      success: true,
      message,
    };

  } catch (error) {
    console.error('Gemini API 호출 오류:', error);

    // 실패시 기본 메시지 반환
    return {
      success: false,
      error: error.message,
      message: getDefaultContactMessage(type, context),
    };
  }
};

/**
 * AI 호출 실패시 기본 메시지
 */
const getDefaultContactMessage = (type, context) => {
  const studentName = context.studentName || '학생';

  const defaultMessages = {
    payment: `안녕하세요, 학부모님 😊

혹시 바쁘셔서 깜빡하신 건 아닐까 해서 조심스럽게 연락드립니다.
${studentName} 학생 수강료 확인 부탁드립니다.

편하신 시간에 연락주시면 감사하겠습니다.`,

    attendance: `안녕하세요, 학부모님 😊

${studentName} 학생이 최근 수업에 나오지 못해서 혹시 건강이 괜찮으신지 걱정되어 연락드립니다.
필요하시면 수업 일정 조율도 가능하니 편하게 말씀해주세요.

시간 되실 때 연락 부탁드립니다.`,

    lessonExpiry: `안녕하세요, 학부모님 😊

${studentName} 학생이 열심히 연습하고 있는데, 수강권 잔여 횟수가 얼마 남지 않아 미리 안내드립니다.
수강권 갱신이나 수업 계획에 대해 편하신 시간에 상담 가능합니다.

연락 주시면 감사하겠습니다.`,

    noticeUnconfirmed: `안녕하세요, 학부모님 😊

며칠 전 알림장을 보내드렸는데 혹시 못 보셨을까봐 연락드립니다.
시간 날 때 확인해주시면 감사하겠습니다.

좋은 하루 보내세요!`
  };

  return defaultMessages[type] || '안녕하세요, 학부모님 😊\n\n연락드릴 일이 있어 메시지 남깁니다.\n편하신 시간에 연락 부탁드립니다.';
};

/**
 * 학생 진도 피드백 메모 개선 (AI)
 * @param {string} currentMemo - 현재 작성된 메모
 * @param {Object} studentInfo - { name, level, book, recentProgress }
 * @param {string} presetId - 프리셋 ID (기본값: 'progress')
 * @param {string} toneId - 톤 ID (기본값: null)
 * @returns {Promise<Object>} { success, improvedMemo }
 */
export const improveStudentMemo = async (currentMemo, studentInfo, presetId = 'progress', toneId = null) => {
  try {
    const genAI = initGeminiAI();

    if (!genAI) {
      throw new Error('Gemini API가 초기화되지 않았습니다');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // 프리셋 선택
    const preset = STUDENT_MEMO_PRESETS[presetId.toUpperCase()] || STUDENT_MEMO_PRESETS.PROGRESS;
    let systemPrompt = preset.systemPrompt;

    // 톤 수정자 추가
    if (toneId) {
      const tone = AI_TONE_PRESETS[toneId.toUpperCase()];
      if (tone) {
        systemPrompt += `\n\n톤 스타일:\n${tone.modifier}`;
      }
    }

    // 공통 주의사항 추가
    systemPrompt += `\n\n주의사항:
- 너무 길지 않게 (3-5줄 정도)
- 학부모님이 이해하기 쉬운 용어 사용
- 구체적인 곡명이나 기술 언급
- 존댓말을 사용하지 않고 관찰 기록 형태로 작성`;

    const userPrompt = `학생 정보:
- 이름: ${studentInfo.name || '학생'}
- 레벨: ${studentInfo.level || '초급'}
- 교재: ${studentInfo.book || '바이엘'}
${studentInfo.recentProgress ? `- 최근 진도: ${studentInfo.recentProgress}` : ''}

선생님이 작성한 메모:
${currentMemo}

위 메모를 개선해주세요.`;

    const result = await model.generateContent([systemPrompt, userPrompt]);
    const response = await result.response;
    const improvedMemo = response.text().trim();

    return {
      success: true,
      improvedMemo,
    };

  } catch (error) {
    console.error('Gemini API 호출 오류:', error);

    return {
      success: false,
      error: error.message,
      improvedMemo: currentMemo, // 실패시 원본 반환
    };
  }
};

/**
 * 학생 맞춤 연습 과제 생성 (AI)
 * @param {Object} studentInfo - { name, level, book, weakPoints, strengths }
 * @returns {Promise<Object>} { success, homework }
 */
export const generateStudentHomework = async (studentInfo) => {
  try {
    const genAI = initGeminiAI();

    if (!genAI) {
      throw new Error('Gemini API가 초기화되지 않았습니다');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const systemPrompt = `당신은 피아노 학원 선생님의 연습 과제 작성을 도와주는 AI 비서입니다.

역할:
- 학생의 레벨과 약점을 고려한 맞춤 연습 과제를 제시합니다
- 실천 가능한 구체적인 연습 방법을 알려줍니다
- 하루 연습량을 적절히 배분합니다
- 동기부여가 되는 긍정적인 표현을 사용합니다

과제 구조:
1. 이번 주 연습 곡 (2-3곡)
2. 집중 연습 포인트 (손모양, 리듬감, 표현력 등)
3. 하루 권장 연습량
4. 격려 메시지

주의사항:
- 학생이 부담스럽지 않은 양
- 학부모님도 이해할 수 있는 용어
- 구체적이고 실천 가능한 내용`;

    const userPrompt = `학생 정보:
- 이름: ${studentInfo.name || '학생'}
- 레벨: ${studentInfo.level || '초급'}
- 교재: ${studentInfo.book || '바이엘'}
${studentInfo.weakPoints ? `- 약점: ${studentInfo.weakPoints}` : ''}
${studentInfo.strengths ? `- 강점: ${studentInfo.strengths}` : ''}

이 학생에게 적합한 이번 주 연습 과제를 작성해주세요.`;

    const result = await model.generateContent([systemPrompt, userPrompt]);
    const response = await result.response;
    const homework = response.text().trim();

    return {
      success: true,
      homework,
    };

  } catch (error) {
    console.error('Gemini API 호출 오류:', error);

    return {
      success: false,
      error: error.message,
      homework: '이번 주는 현재 교재의 복습을 진행해주세요.',
    };
  }
};

/**
 * Gemini API 사용 가능 여부 확인
 */
export const isGeminiAvailable = () => {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  return apiKey && apiKey !== 'your_gemini_api_key_here' && apiKey.startsWith('AIzaSy');
};

export default {
  generateNoticeContent,
  improveNoticeContent,
  generateParentContactMessage,
  improveStudentMemo,
  generateStudentHomework,
  isGeminiAvailable,
};
