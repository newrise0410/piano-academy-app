// src/data/mockChartData.js
// 차트 데이터 Mock

export const teacherMonthlyRevenue = {
  labels: ['7월', '8월', '9월', '10월', '11월', '12월'],
  values: [2200000, 2400000, 2100000, 2800000, 3100000, 3500000],
};

export const teacherWeeklyAttendance = {
  labels: ['1주', '2주', '3주', '4주'],
  values: [95, 88, 92, 97],
};

export const studentLevelDistribution = [
  {
    name: '초급',
    population: 12,
    color: '#8B5CF6',
    legendFontColor: '#374151',
    legendFontSize: 13,
  },
  {
    name: '중급',
    population: 8,
    color: '#EC4899',
    legendFontColor: '#374151',
    legendFontSize: 13,
  },
  {
    name: '고급',
    population: 5,
    color: '#22C55E',
    legendFontColor: '#374151',
    legendFontSize: 13,
  },
];

export const ticketTypeDistribution = [
  {
    name: '회차권',
    population: 18,
    color: '#8B5CF6',
    legendFontColor: '#374151',
    legendFontSize: 13,
  },
  {
    name: '기간권',
    population: 7,
    color: '#3B82F6',
    legendFontColor: '#374151',
    legendFontSize: 13,
  },
];

export const studentGrowthData = {
  labels: ['7월', '8월', '9월', '10월', '11월', '12월'],
  values: [8, 12, 15, 19, 24, 28],
};

export const parentStudentProgress = {
  labels: ['1월', '2월', '3월', '4월', '5월', '6월'],
  values: [5, 8, 12, 15, 19, 23],
};

export const parentAttendanceRate = {
  labels: ['1월', '2월', '3월', '4월', '5월', '6월'],
  values: [100, 95, 88, 92, 97, 100],
};
