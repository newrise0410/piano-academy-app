let mockStudents = [
  {
    id: '1',
    name: '김지우',
    age: '10',
    phone: '010-1111-1111',
    parentName: '김영희',
    parentPhone: '010-9999-1111',
    category: '초등',
    level: '초급',
    schedule: '월/수 16:00',
    book: '바이엘',
    progress: 45,
    progressPage: 45,
    totalPages: 100,
    attendance: '95%',
    ticketType: 'count',
    ticketCount: 8,
    ticketPeriod: null,
    unpaid: false,
  },
  {
    id: '2',
    name: '박서연',
    category: '초등',
    level: '중급',
    schedule: '화/목 17:00',
    book: '체르니 100',
    progress: 23,
    progressPage: 23,
    totalPages: 100,
    attendance: '88%',
    ticketType: 'count',
    ticketCount: 3,
    ticketPeriod: null,
    unpaid: true,
  },
  {
    id: '3',
    name: '이민준',
    category: '고등',
    level: '고급',
    schedule: '월/금 18:00',
    book: '소나타 Op.13',
    progress: 65,
    progressPage: 13,
    totalPages: 20,
    attendance: '100%',
    ticketType: 'period',
    ticketCount: null,
    ticketPeriod: { start: '2025.01', end: '2025.03' },
    unpaid: false,
  },
  {
    id: '4',
    name: '최예은',
    category: '초등',
    level: '초급',
    schedule: '수/금 15:00',
    book: '바이엘',
    progress: 32,
    progressPage: 32,
    totalPages: 100,
    attendance: '92%',
    ticketType: 'count',
    ticketCount: 5,
    ticketPeriod: null,
    unpaid: false,
  },
  {
    id: '5',
    name: '정하윤',
    category: '고등',
    level: '중급',
    schedule: '화/목 16:00',
    book: '체르니 100',
    progress: 45,
    progressPage: 45,
    totalPages: 100,
    attendance: '85%',
    ticketType: 'count',
    ticketCount: 2,
    ticketPeriod: null,
    unpaid: true,
  },
  {
    id: '6',
    name: '강도현',
    category: '성인',
    level: '고급',
    schedule: '월/수 19:00',
    book: '쇼팽 왈츠',
    progress: 80,
    progressPage: 8,
    totalPages: 10,
    attendance: '97%',
    ticketType: 'period',
    ticketCount: null,
    ticketPeriod: { start: '2024.12', end: '2025.06' },
    unpaid: false,
  },
  {
    id: '7',
    name: '윤서아',
    category: '초등',
    level: '초급',
    schedule: '화/목 15:30',
    book: '바이엘',
    progress: 28,
    progressPage: 28,
    totalPages: 100,
    attendance: '90%',
    ticketType: 'count',
    ticketCount: 6,
    ticketPeriod: null,
    unpaid: false,
  },
  {
    id: '8',
    name: '임준혁',
    category: '고등',
    level: '중급',
    schedule: '수/금 17:30',
    book: '체르니 100',
    progress: 38,
    progressPage: 38,
    totalPages: 100,
    attendance: '82%',
    ticketType: 'count',
    ticketCount: 1,
    ticketPeriod: null,
    unpaid: true,
  },
  {
    id: '9',
    name: '한지민',
    category: '초등',
    level: '초급',
    schedule: '월/수 14:00',
    book: '바이엘',
    progress: 52,
    progressPage: 52,
    totalPages: 100,
    attendance: '98%',
    ticketType: 'count',
    ticketCount: 9,
    ticketPeriod: null,
    unpaid: false,
  },
  {
    id: '10',
    name: '송민서',
    category: '성인',
    level: '중급',
    schedule: '화/금 18:00',
    book: '체르니 100',
    progress: 50,
    progressPage: 50,
    totalPages: 100,
    attendance: '93%',
    ticketType: 'period',
    ticketPeriod: { start: '2025.01', end: '2025.02' },
    ticketCount: null,
    unpaid: false,
  },
];

// 학생 목록 조회
export const getStudents = () => {
  return mockStudents;
};

// 학생 추가
export const addStudent = (studentData) => {
  const newId = String(Math.max(...mockStudents.map(s => parseInt(s.id))) + 1);
  const newStudent = {
    id: newId,
    name: studentData.name,
    age: studentData.age || '',
    phone: studentData.phone || '',
    parentName: studentData.parentName || '',
    parentPhone: studentData.parentPhone || '',
    category: studentData.category,
    level: studentData.level,
    schedule: studentData.schedule,
    book: studentData.book || '',
    progress: studentData.progress || 0,
    progressPage: studentData.progressPage || 0,
    totalPages: studentData.totalPages || 100,
    attendance: studentData.attendance || '0%',
    ticketType: studentData.ticketType || 'count',
    ticketCount: studentData.ticketType === 'count' ? (studentData.ticketCount || 0) : null,
    ticketPeriod: studentData.ticketType === 'period' ? studentData.ticketPeriod : null,
    unpaid: studentData.unpaid || false,
  };
  mockStudents.push(newStudent);
  return newStudent;
};

// 학생 수정
export const updateStudent = (id, studentData) => {
  const index = mockStudents.findIndex(s => s.id === id);
  if (index !== -1) {
    mockStudents[index] = {
      ...mockStudents[index],
      ...studentData,
    };
    return mockStudents[index];
  }
  return null;
};

// 학생 삭제
export const deleteStudent = (id) => {
  const index = mockStudents.findIndex(s => s.id === id);
  if (index !== -1) {
    const deleted = mockStudents.splice(index, 1);
    return deleted[0];
  }
  return null;
};

// ID로 학생 조회
export const getStudentById = (id) => {
  return mockStudents.find(s => s.id === id);
};

export { mockStudents };
