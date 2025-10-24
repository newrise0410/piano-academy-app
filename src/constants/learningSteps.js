// src/constants/learningSteps.js
// 피아노 곡 학습 단계 정의

/**
 * 학습 단계 상수
 * 각 단계는 세부 항목을 포함하며, 선생님이 클릭으로 빠르게 진도를 기록할 수 있습니다.
 */
export const LEARNING_STEPS = [
  {
    id: 'analysis',
    name: '악보분석',
    icon: '📖',
    color: '#8B5CF6', // purple-600
    description: '악보 읽기와 구조 파악',
    subItems: [
      '조성, 박자, 음표 읽기',
      '손가락 번호 확인',
      '어려운 부분 파악'
    ]
  },
  {
    id: 'separate',
    name: '분리연습',
    icon: '✋',
    color: '#3B82F6', // blue-600
    description: '손을 나누어 연습',
    subItems: [
      '오른손만 연습',
      '왼손만 연습',
      '부분별로 끊어서 연습'
    ]
  },
  {
    id: 'together',
    name: '합주연습',
    icon: '🤝',
    color: '#10B981', // green-600
    description: '양손을 합쳐서 연습',
    subItems: [
      '양손 천천히 합치기',
      '부분별로 붙이기',
      '전체 통으로 연습'
    ]
  },
  {
    id: 'mastery',
    name: '숙련',
    icon: '⚡',
    color: '#F59E0B', // amber-600
    description: '완성도를 높이는 단계',
    subItems: [
      '템포 올리기',
      '표현력 추가 (강약, 페달)',
      '암보 연습'
    ]
  },
  {
    id: 'complete',
    name: '완성',
    icon: '🎯',
    color: '#EF4444', // red-600
    description: '완벽하게 마무리',
    subItems: [
      '완벽한 연주',
      '실수 없이 처음부터 끝까지',
      '다음 곡으로 이동 준비'
    ]
  }
];

/**
 * ID로 학습 단계 찾기
 * @param {string} stepId - 단계 ID
 * @returns {Object|null} - 학습 단계 객체
 */
export const getLearningStepById = (stepId) => {
  return LEARNING_STEPS.find(step => step.id === stepId) || null;
};

/**
 * 학습 단계 인덱스 찾기
 * @param {string} stepId - 단계 ID
 * @returns {number} - 인덱스 (0-4), 없으면 -1
 */
export const getLearningStepIndex = (stepId) => {
  return LEARNING_STEPS.findIndex(step => step.id === stepId);
};

/**
 * 현재 단계가 완료된 단계인지 확인
 * @param {string} stepId - 현재 단계 ID
 * @param {Array<string>} completedSteps - 완료된 단계 ID 배열
 * @returns {boolean}
 */
export const isStepCompleted = (stepId, completedSteps = []) => {
  return completedSteps.includes(stepId);
};

/**
 * 다음 학습 단계 가져오기
 * @param {string} currentStepId - 현재 단계 ID
 * @returns {Object|null} - 다음 단계 객체, 없으면 null
 */
export const getNextStep = (currentStepId) => {
  const currentIndex = getLearningStepIndex(currentStepId);
  if (currentIndex === -1 || currentIndex >= LEARNING_STEPS.length - 1) {
    return null;
  }
  return LEARNING_STEPS[currentIndex + 1];
};

/**
 * 학습 단계 정보를 텍스트로 변환
 * @param {Object} learningStep - { currentStep, completedSteps, subItems }
 * @returns {string} - 텍스트 설명
 */
export const learningStepToText = (learningStep) => {
  if (!learningStep || !learningStep.currentStep) {
    return '';
  }

  const step = getLearningStepById(learningStep.currentStep);
  if (!step) return '';

  const completedSubItems = learningStep.subItems?.[learningStep.currentStep] || [];

  if (completedSubItems.length === 0) {
    return `${step.name} 단계`;
  }

  return `${step.name} - ${completedSubItems.join(', ')}`;
};

export default LEARNING_STEPS;
