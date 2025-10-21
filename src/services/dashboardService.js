// src/services/dashboardService.js
import COLORS from '../styles/colors';
import { ActivityRepository } from '../repositories/ActivityRepository';
import { StudentRepository } from '../repositories/StudentRepository';
import { PaymentRepository } from '../repositories/PaymentRepository';
import { AttendanceRepository } from '../repositories/AttendanceRepository';
import { NoticeRepository } from '../repositories/NoticeRepository';

// 시간 포맷 헬퍼
const formatActivityTime = (timestamp) => {
  const now = new Date();

  // Firestore Timestamp 객체 처리
  let activityTime;
  if (timestamp && typeof timestamp.toDate === 'function') {
    activityTime = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    activityTime = timestamp;
  } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
    activityTime = new Date(timestamp);
  } else {
    return '알 수 없음';
  }

  const diffMs = now - activityTime;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;

  return activityTime.toLocaleDateString('ko-KR', {
    month: 'numeric',
    day: 'numeric'
  });
};

// 대시보드 통계 (Firebase 데이터 기반)
export const getDashboardStats = async () => {
  try {
    const students = await StudentRepository.getAll();

    // 오늘 요일 확인
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const today = days[new Date().getDay()];

    const todayStudents = students.filter(student => {
      const schedule = student.schedule || '';
      const scheduleDays = schedule.split(' ')[0]?.split('/') || [];
      return scheduleDays.includes(today);
    });

    const unpaidCount = students.filter(s => s.unpaid).length;
    const makeupClassesCount = students.filter(s =>
      s.ticketType === 'count' && (s.ticketCount === 1 || s.ticketCount === 2)
    ).length;

    return {
      todayClasses: todayStudents.length,
      unpaidStudents: unpaidCount,
      makeupClasses: makeupClassesCount,
    };
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return {
      todayClasses: 0,
      unpaidStudents: 0,
      makeupClasses: 0,
    };
  }
};

// 최근 활동 (Firebase 데이터 기반)
export const getRecentActivities = async () => {
  try {
    const activities = [];

    // 학생 데이터 가져오기
    const students = await StudentRepository.getAll();

    // 미납 학생이 있으면 알림 추가 (최우선)
    const unpaidStudents = students.filter(s => s.unpaid);
    if (unpaidStudents.length > 0) {
      activities.push({
        id: 'unpaid-alert',
        title: '수강료 미납 알림',
        description: `${unpaidStudents.length}명 미납 · 확인 필요`,
        icon: 'alert-circle',
        color: COLORS.danger.DEFAULT,
      });
    }

    // 잔여 회차 적은 학생 알림
    const lowSessionStudents = students.filter(s =>
      s.ticketType === 'count' && (s.ticketCount === 1 || s.ticketCount === 2)
    );
    if (lowSessionStudents.length > 0) {
      activities.push({
        id: 'low-session-alert',
        title: '수강권 갱신 필요',
        description: `${lowSessionStudents.length}명 수강권 부족 · ${lowSessionStudents[0]?.name} 외`,
        icon: 'time',
        color: COLORS.warning.DEFAULT,
      });
    }

    // Firebase에서 최근 활동 데이터 가져오기
    const recentActivityData = await ActivityRepository.getRecent(5);

    recentActivityData.forEach((activity) => {
      let title = activity.action || '활동';
      if (activity.studentName) {
        title = `${activity.studentName} ${activity.action}`;
      }

      activities.push({
        id: activity.id,
        title: title,
        description: `${activity.details || ''} · ${formatActivityTime(activity.timestamp)}`,
        icon: activity.icon || 'information-circle',
        color: activity.color || COLORS.primary.DEFAULT,
      });
    });

    return activities.slice(0, 5); // 최대 5개 표시
  } catch (error) {
    console.error('Recent activities error:', error);
    return [];
  }
};

/**
 * 연락 필요한 학부모 자동 감지
 * @returns {Promise<Array>} [{ urgency, student, reason, type, daysOverdue }]
 */
export const getParentContactNeeds = async () => {
  try {
    const contactNeeds = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. 모든 학생 데이터 가져오기
    const students = await StudentRepository.getAll();

    // 2. 각 학생별로 체크
    for (const student of students) {
      // 2-1. 수강료 미납 체크
      if (student.unpaid) {
        const payments = await PaymentRepository.getByStudentId(student.id);
        const lastPayment = payments[0]; // 최근 납부일

        let daysOverdue = 0;
        if (lastPayment && lastPayment.date) {
          const paymentDate = new Date(lastPayment.date);
          const diffTime = today - paymentDate;
          daysOverdue = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        } else {
          daysOverdue = 30; // 납부 기록 없으면 30일로 간주
        }

        let urgency = 'normal';
        if (daysOverdue >= 15) urgency = 'urgent';
        else if (daysOverdue >= 7) urgency = 'important';

        contactNeeds.push({
          urgency,
          student,
          reason: `수강료 ${daysOverdue}일 미납`,
          type: 'payment',
          daysOverdue,
        });
      }

      // 2-2. 수강권 만료 임박 체크
      if (student.ticketType === 'count' && student.ticketCount !== null) {
        let urgency = null;
        let reason = '';

        if (student.ticketCount === 0) {
          urgency = 'urgent';
          reason = '수강권 만료 (잔여 0회)';
        } else if (student.ticketCount === 1) {
          urgency = 'important';
          reason = '수강권 갱신 필요 (잔여 1회)';
        } else if (student.ticketCount === 2) {
          urgency = 'normal';
          reason = '수강권 갱신 안내 (잔여 2회)';
        }

        if (urgency) {
          contactNeeds.push({
            urgency,
            student,
            reason,
            type: 'lessonExpiry',
            remainingSessions: student.ticketCount,
          });
        }
      }

      // 2-3. 연속 결석 체크
      const attendances = await AttendanceRepository.getByStudentId(student.id);
      if (attendances && attendances.length > 0) {
        // 최근 3개 출석 기록 확인
        const recentAttendances = attendances.slice(0, 3);
        const consecutiveAbsences = recentAttendances.filter(a => a.status === 'absent').length;

        if (consecutiveAbsences >= 3) {
          contactNeeds.push({
            urgency: 'urgent',
            student,
            reason: `연속 ${consecutiveAbsences}회 결석`,
            type: 'attendance',
            absenceCount: consecutiveAbsences,
          });
        } else if (consecutiveAbsences === 2) {
          contactNeeds.push({
            urgency: 'important',
            student,
            reason: '연속 2회 결석',
            type: 'attendance',
            absenceCount: 2,
          });
        }
      }
    }

    // 3. 미확인 알림장 체크
    const notices = await NoticeRepository.getAll();
    const unconfirmedNotices = notices.filter(notice => {
      if (!notice.confirmed || !notice.total) return false;
      if (notice.confirmed >= notice.total) return false; // 모두 확인함

      // 발송일로부터 3일 이상 지났는지 확인
      const noticeDate = new Date(notice.createdAt);
      const diffTime = today - noticeDate;
      const daysSinceNotice = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      return daysSinceNotice >= 3;
    });

    // 미확인 알림장이 있는 학생들 추가
    for (const notice of unconfirmedNotices) {
      if (notice.recipients && notice.recipients.length > 0) {
        for (const studentId of notice.recipients) {
          const student = students.find(s => s.id === studentId);
          if (student) {
            contactNeeds.push({
              urgency: 'important',
              student,
              reason: `알림장 미확인 (${notice.title})`,
              type: 'noticeUnconfirmed',
              noticeId: notice.id,
              noticeTitle: notice.title,
            });
          }
        }
      }
    }

    // 4. 우선순위 정렬 (긴급 > 중요 > 일반)
    const urgencyOrder = { urgent: 1, important: 2, normal: 3 };
    contactNeeds.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

    return contactNeeds;
  } catch (error) {
    console.error('Parent contact needs detection error:', error);
    return [];
  }
};