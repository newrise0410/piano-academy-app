// src/services/scheduleService.js
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * 특정 날짜의 모든 수업 일정 가져오기
 * @param {string} teacherId - 선생님 ID
 * @param {Date} date - 조회할 날짜
 * @returns {Promise<{success: boolean, schedules: Array, error?: string}>}
 */
export const getSchedulesByDate = async (teacherId, date) => {
  try {
    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];

    // 해당 선생님의 모든 학생 가져오기
    const studentsRef = collection(db, 'students');
    const q = query(studentsRef, where('teacherId', '==', teacherId));
    const snapshot = await getDocs(q);

    const schedules = [];
    snapshot.forEach((doc) => {
      const student = { id: doc.id, ...doc.data() };

      // schedule 형식: "월/수 14:00" 또는 "월 14:00"
      if (student.schedule) {
        const [days, time] = student.schedule.split(' ');
        const scheduleDays = days.split('/');

        // 해당 요일에 수업이 있는 학생만 추가
        if (scheduleDays.includes(dayOfWeek)) {
          schedules.push({
            studentId: student.id,
            studentName: student.name,
            time: time || '시간 미정',
            day: dayOfWeek,
            level: student.level,
            book: student.book,
            fullSchedule: student.schedule,
          });
        }
      }
    });

    // 시간순 정렬
    schedules.sort((a, b) => {
      if (a.time === '시간 미정') return 1;
      if (b.time === '시간 미정') return -1;
      return a.time.localeCompare(b.time);
    });

    return { success: true, schedules };
  } catch (error) {
    console.error('일정 조회 오류:', error);
    return { success: false, schedules: [], error: error.message };
  }
};

/**
 * 학생의 수업 일정 업데이트
 * @param {string} studentId - 학생 ID
 * @param {string} newSchedule - 새로운 일정 (예: "월/수 14:00")
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const updateStudentSchedule = async (studentId, newSchedule) => {
  try {
    const studentRef = doc(db, 'students', studentId);
    await updateDoc(studentRef, {
      schedule: newSchedule,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('일정 업데이트 오류:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 시간 변경 요청 생성
 * @param {Object} requestData - 요청 데이터
 * @returns {Promise<{success: boolean, requestId?: string, error?: string}>}
 */
export const createScheduleChangeRequest = async (requestData) => {
  try {
    const {
      studentId,
      studentName,
      parentId,
      parentName,
      teacherId,
      currentSchedule,
      requestedSchedule,
      reason,
    } = requestData;

    const requestsRef = collection(db, 'scheduleChangeRequests');
    const docRef = await addDoc(requestsRef, {
      studentId,
      studentName,
      parentId,
      parentName,
      teacherId,
      currentSchedule,
      requestedSchedule,
      reason: reason || '',
      status: 'pending', // pending, approved, rejected
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { success: true, requestId: docRef.id };
  } catch (error) {
    console.error('시간 변경 요청 생성 오류:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 시간 변경 요청 목록 가져오기
 * @param {string} userId - 사용자 ID (선생님 또는 학부모)
 * @param {string} userType - 사용자 타입 ('teacher' | 'parent')
 * @returns {Promise<{success: boolean, requests: Array, error?: string}>}
 */
export const getScheduleChangeRequests = async (userId, userType) => {
  try {
    const requestsRef = collection(db, 'scheduleChangeRequests');
    const field = userType === 'teacher' ? 'teacherId' : 'parentId';

    const q = query(
      requestsRef,
      where(field, '==', userId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const requests = [];

    snapshot.forEach((doc) => {
      requests.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, requests };
  } catch (error) {
    console.error('시간 변경 요청 조회 오류:', error);
    return { success: false, requests: [], error: error.message };
  }
};

/**
 * 시간 변경 요청 승인
 * @param {string} requestId - 요청 ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const approveScheduleChangeRequest = async (requestId) => {
  try {
    // 요청 정보 가져오기
    const requestRef = doc(db, 'scheduleChangeRequests', requestId);
    const requestDoc = await getDoc(requestRef);

    if (!requestDoc.exists()) {
      return { success: false, error: '요청을 찾을 수 없습니다.' };
    }

    const requestData = requestDoc.data();

    // 학생 일정 업데이트
    const updateResult = await updateStudentSchedule(
      requestData.studentId,
      requestData.requestedSchedule
    );

    if (!updateResult.success) {
      return { success: false, error: '일정 업데이트 실패' };
    }

    // 요청 상태 업데이트
    await updateDoc(requestRef, {
      status: 'approved',
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('요청 승인 오류:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 시간 변경 요청 거절
 * @param {string} requestId - 요청 ID
 * @param {string} rejectionReason - 거절 사유
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const rejectScheduleChangeRequest = async (requestId, rejectionReason = '') => {
  try {
    const requestRef = doc(db, 'scheduleChangeRequests', requestId);
    await updateDoc(requestRef, {
      status: 'rejected',
      rejectionReason,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('요청 거절 오류:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 주간 일정 가져오기 (7일치)
 * @param {string} teacherId - 선생님 ID
 * @param {Date} startDate - 시작 날짜 (보통 월요일)
 * @returns {Promise<{success: boolean, weeklySchedules: Object, error?: string}>}
 */
export const getWeeklySchedules = async (teacherId, startDate) => {
  try {
    const weeklySchedules = {};

    // 7일치 일정 가져오기
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      const result = await getSchedulesByDate(teacherId, date);

      if (result.success) {
        weeklySchedules[dateKey] = result.schedules;
      }
    }

    return { success: true, weeklySchedules };
  } catch (error) {
    console.error('주간 일정 조회 오류:', error);
    return { success: false, weeklySchedules: {}, error: error.message };
  }
};

/**
 * 학생의 일정 가져오기
 * @param {string} studentId - 학생 ID
 * @returns {Promise<{success: boolean, schedule: string, error?: string}>}
 */
export const getStudentSchedule = async (studentId) => {
  try {
    const studentRef = doc(db, 'students', studentId);
    const studentDoc = await getDoc(studentRef);

    if (!studentDoc.exists()) {
      return { success: false, error: '학생을 찾을 수 없습니다.' };
    }

    const schedule = studentDoc.data().schedule || '일정 미정';

    return { success: true, schedule };
  } catch (error) {
    console.error('학생 일정 조회 오류:', error);
    return { success: false, error: error.message };
  }
};
