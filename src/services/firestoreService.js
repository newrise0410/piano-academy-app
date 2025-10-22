// src/services/firestoreService.js
// Firestore 데이터베이스 CRUD 서비스 (Firebase v12.4.0 기준)

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch,
  increment,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db, storage } from '../config/firebase';
import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

/**
 * ==========================================
 * 학생 관리 (Students Collection)
 * ==========================================
 */

/**
 * 모든 학생 목록 가져오기
 * @param {string} teacherId - 선생님 ID
 * @param {Object} options - 쿼리 옵션 (limit, orderByField 등)
 * @returns {Promise<Object>} 학생 목록
 */
export const getAllStudents = async (teacherId, options = {}) => {
  try {
    const studentsRef = collection(db, 'students');
    let q = query(
      studentsRef,
      where('teacherId', '==', teacherId),
      orderBy(options.orderByField || 'createdAt', options.orderDirection || 'desc')
    );

    if (options.limit) {
      q = query(q, limit(options.limit));
    }

    const querySnapshot = await getDocs(q);
    const students = [];
    querySnapshot.forEach((doc) => {
      students.push({
        id: doc.id,
        ...doc.data(),
        // Timestamp를 문자열로 변환
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
      });
    });

    return { success: true, data: students };
  } catch (error) {
    console.error('Get students error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 학생 상세 정보 가져오기
 * @param {string} studentId - 학생 ID
 * @returns {Promise<Object>} 학생 정보
 */
export const getStudentById = async (studentId) => {
  try {
    const docRef = doc(db, 'students', studentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        success: true,
        data: {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate?.()?.toISOString() || docSnap.data().createdAt,
          updatedAt: docSnap.data().updatedAt?.toDate?.()?.toISOString() || docSnap.data().updatedAt,
        }
      };
    } else {
      return { success: false, error: '학생을 찾을 수 없습니다.' };
    }
  } catch (error) {
    console.error('Get student error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 새 학생 추가
 * @param {Object} studentData - 학생 정보
 * @param {string} teacherId - 선생님 ID
 * @returns {Promise<Object>} 추가 결과
 */
export const addStudent = async (studentData, teacherId) => {
  try {
    const studentsRef = collection(db, 'students');
    const docRef = await addDoc(studentsRef, {
      ...studentData,
      teacherId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Add student error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 학생 정보 수정
 * @param {string} studentId - 학생 ID
 * @param {Object} studentData - 수정할 학생 정보
 * @returns {Promise<Object>} 수정 결과
 */
export const updateStudent = async (studentId, studentData) => {
  try {
    const docRef = doc(db, 'students', studentId);
    await updateDoc(docRef, {
      ...studentData,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Update student error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 학생 삭제
 * @param {string} studentId - 학생 ID
 * @returns {Promise<Object>} 삭제 결과
 */
export const deleteStudent = async (studentId) => {
  try {
    const docRef = doc(db, 'students', studentId);
    await deleteDoc(docRef);

    return { success: true };
  } catch (error) {
    console.error('Delete student error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * ==========================================
 * 출석 관리 (Attendance Collection)
 * ==========================================
 */

/**
 * 특정 날짜 출석 기록 가져오기
 * @param {string} teacherId - 선생님 ID
 * @param {string} date - 날짜 (YYYY-MM-DD)
 * @returns {Promise<Object>} 출석 목록
 */
export const getAttendanceByDate = async (teacherId, date) => {
  try {
    const attendanceRef = collection(db, 'attendance');
    const q = query(
      attendanceRef,
      where('teacherId', '==', teacherId),
      where('date', '==', date)
    );

    const querySnapshot = await getDocs(q);
    const attendance = [];
    querySnapshot.forEach((doc) => {
      attendance.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: attendance };
  } catch (error) {
    console.error('Get attendance error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 출석 기록 저장
 * @param {Object} attendanceData - 출석 정보
 * @param {string} teacherId - 선생님 ID
 * @returns {Promise<Object>} 저장 결과
 */
export const saveAttendance = async (attendanceData, teacherId) => {
  try {
    const attendanceRef = collection(db, 'attendance');
    const docRef = await addDoc(attendanceRef, {
      ...attendanceData,
      teacherId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Save attendance error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 출석 기록 수정
 * @param {string} attendanceId - 출석 ID
 * @param {Object} attendanceData - 수정할 출석 정보
 * @returns {Promise<Object>} 수정 결과
 */
export const updateAttendance = async (attendanceId, attendanceData) => {
  try {
    const docRef = doc(db, 'attendance', attendanceId);
    await updateDoc(docRef, {
      ...attendanceData,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Update attendance error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 학생별 출석 기록 조회
 * @param {string} studentId - 학생 ID
 * @returns {Promise<Object>} 출석 기록 목록
 */
export const getAttendanceByStudentId = async (studentId) => {
  try {
    const attendanceRef = collection(db, 'attendance');
    const q = query(
      attendanceRef,
      where('studentId', '==', studentId),
      orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const attendance = [];
    querySnapshot.forEach((doc) => {
      attendance.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: attendance };
  } catch (error) {
    console.error('Get attendance by student error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * ==========================================
 * 보강 수업 관리 (MakeupLessons Collection)
 * ==========================================
 */

/**
 * 보강 수업 목록 가져오기
 * @param {string} teacherId - 선생님 ID
 * @param {Object} options - 쿼리 옵션
 * @returns {Promise<Object>} 보강 수업 목록
 */
export const getMakeupLessons = async (teacherId, options = {}) => {
  try {
    const makeupRef = collection(db, 'makeupLessons');
    let q = query(
      makeupRef,
      where('teacherId', '==', teacherId),
      orderBy('date', 'asc')
    );

    if (options.limit) {
      q = query(q, limit(options.limit));
    }

    // 날짜 필터링 (특정 주/월)
    if (options.startDate && options.endDate) {
      q = query(
        makeupRef,
        where('teacherId', '==', teacherId),
        where('date', '>=', options.startDate),
        where('date', '<=', options.endDate),
        orderBy('date', 'asc')
      );
    }

    const querySnapshot = await getDocs(q);
    const makeupLessons = [];
    querySnapshot.forEach((doc) => {
      makeupLessons.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
      });
    });

    return { success: true, data: makeupLessons };
  } catch (error) {
    console.error('Get makeup lessons error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 보강 수업 추가
 * @param {Object} makeupData - 보강 수업 정보 { studentId, studentName, date, time, reason }
 * @param {string} teacherId - 선생님 ID
 * @returns {Promise<Object>} 저장 결과
 */
export const saveMakeupLesson = async (makeupData, teacherId) => {
  try {
    const makeupRef = collection(db, 'makeupLessons');
    const docRef = await addDoc(makeupRef, {
      ...makeupData,
      teacherId,
      status: 'pending', // pending, completed, cancelled
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Save makeup lesson error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 보강 수업 수정
 * @param {string} makeupId - 보강 수업 ID
 * @param {Object} makeupData - 수정할 보강 수업 정보
 * @returns {Promise<Object>} 수정 결과
 */
export const updateMakeupLesson = async (makeupId, makeupData) => {
  try {
    const docRef = doc(db, 'makeupLessons', makeupId);
    await updateDoc(docRef, {
      ...makeupData,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Update makeup lesson error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 보강 수업 삭제
 * @param {string} makeupId - 보강 수업 ID
 * @returns {Promise<Object>} 삭제 결과
 */
export const deleteMakeupLesson = async (makeupId) => {
  try {
    const docRef = doc(db, 'makeupLessons', makeupId);
    await deleteDoc(docRef);

    return { success: true };
  } catch (error) {
    console.error('Delete makeup lesson error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * ==========================================
 * 수업 일지 관리 (LessonNotes Collection)
 * ==========================================
 */

/**
 * 수업 일지 목록 가져오기
 * @param {string} teacherId - 선생님 ID
 * @param {Object} options - 쿼리 옵션 { studentId, startDate, endDate, limit }
 * @returns {Promise<Object>} 수업 일지 목록
 */
export const getLessonNotes = async (teacherId, options = {}) => {
  try {
    const lessonNotesRef = collection(db, 'lessonNotes');
    let q = query(
      lessonNotesRef,
      where('teacherId', '==', teacherId),
      orderBy('date', 'desc')
    );

    // 특정 학생 필터링
    if (options.studentId) {
      q = query(
        lessonNotesRef,
        where('teacherId', '==', teacherId),
        where('studentId', '==', options.studentId),
        orderBy('date', 'desc')
      );
    }

    // 날짜 범위 필터링
    if (options.startDate && options.endDate) {
      q = query(
        lessonNotesRef,
        where('teacherId', '==', teacherId),
        where('date', '>=', options.startDate),
        where('date', '<=', options.endDate),
        orderBy('date', 'desc')
      );
    }

    if (options.limit) {
      q = query(q, limit(options.limit));
    }

    const querySnapshot = await getDocs(q);
    const lessonNotes = [];
    querySnapshot.forEach((doc) => {
      lessonNotes.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
      });
    });

    return { success: true, data: lessonNotes };
  } catch (error) {
    console.error('Get lesson notes error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 학부모용 수업 일지 가져오기
 * @param {string} studentId - 학생 ID
 * @param {Object} options - 쿼리 옵션
 * @returns {Promise<Object>} 수업 일지 목록
 */
export const getLessonNotesByStudent = async (studentId, options = {}) => {
  try {
    const lessonNotesRef = collection(db, 'lessonNotes');
    let q = query(
      lessonNotesRef,
      where('studentId', '==', studentId),
      where('isPublic', '==', true),
      orderBy('date', 'desc')
    );

    if (options.limit) {
      q = query(q, limit(options.limit));
    }

    const querySnapshot = await getDocs(q);
    const lessonNotes = [];
    querySnapshot.forEach((doc) => {
      lessonNotes.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
      });
    });

    return { success: true, data: lessonNotes };
  } catch (error) {
    console.error('Get lesson notes by student error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 수업 일지 저장
 * @param {Object} lessonNoteData - { studentId, studentName, date, progress, homework, memo, strengths, improvements, practicePoints, isPublic }
 * @param {string} teacherId - 선생님 ID
 * @returns {Promise<Object>} 저장 결과
 */
export const saveLessonNote = async (lessonNoteData, teacherId) => {
  try {
    const lessonNotesRef = collection(db, 'lessonNotes');
    const docRef = await addDoc(lessonNotesRef, {
      ...lessonNoteData,
      teacherId,
      isPublic: lessonNoteData.isPublic !== undefined ? lessonNoteData.isPublic : true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Save lesson note error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 수업 일지 수정
 * @param {string} lessonNoteId - 수업 일지 ID
 * @param {Object} lessonNoteData - 수정할 수업 일지 정보
 * @returns {Promise<Object>} 수정 결과
 */
export const updateLessonNote = async (lessonNoteId, lessonNoteData) => {
  try {
    const docRef = doc(db, 'lessonNotes', lessonNoteId);
    await updateDoc(docRef, {
      ...lessonNoteData,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Update lesson note error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 수업 일지 삭제
 * @param {string} lessonNoteId - 수업 일지 ID
 * @returns {Promise<Object>} 삭제 결과
 */
export const deleteLessonNote = async (lessonNoteId) => {
  try {
    const docRef = doc(db, 'lessonNotes', lessonNoteId);
    await deleteDoc(docRef);

    return { success: true };
  } catch (error) {
    console.error('Delete lesson note error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * ==========================================
 * 알림장 관리 (Notices Collection)
 * ==========================================
 */

/**
 * 알림장 목록 가져오기
 * @param {string} teacherId - 선생님 ID
 * @param {Object} options - 쿼리 옵션
 * @returns {Promise<Object>} 알림장 목록
 */
export const getAllNotices = async (teacherId, options = {}) => {
  try {
    const noticesRef = collection(db, 'notices');
    let q = query(
      noticesRef,
      where('teacherId', '==', teacherId),
      orderBy('createdAt', 'desc')
    );

    if (options.limit) {
      q = query(q, limit(options.limit));
    }

    const querySnapshot = await getDocs(q);
    const notices = [];
    querySnapshot.forEach((doc) => {
      notices.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
      });
    });

    return { success: true, data: notices };
  } catch (error) {
    console.error('Get notices error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 알림장 생성
 * @param {Object} noticeData - 알림장 정보
 * @param {string} teacherId - 선생님 ID
 * @returns {Promise<Object>} 생성 결과
 */
export const createNotice = async (noticeData, teacherId) => {
  try {
    const noticesRef = collection(db, 'notices');
    const docRef = await addDoc(noticesRef, {
      ...noticeData,
      teacherId,
      readBy: [], // 읽음 확인 배열 초기화 [{studentId, readAt}]
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Create notice error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 알림장 수정
 * @param {string} noticeId - 알림장 ID
 * @param {Object} noticeData - 수정할 알림장 정보
 * @returns {Promise<Object>} 수정 결과
 */
export const updateNotice = async (noticeId, noticeData) => {
  try {
    const docRef = doc(db, 'notices', noticeId);
    await updateDoc(docRef, {
      ...noticeData,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Update notice error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 알림장 상세 정보 가져오기
 * @param {string} noticeId - 알림장 ID
 * @returns {Promise<Object>} 알림장 정보
 */
export const getNoticeById = async (noticeId) => {
  try {
    const docRef = doc(db, 'notices', noticeId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        success: true,
        data: {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate?.()?.toISOString() || docSnap.data().createdAt,
          updatedAt: docSnap.data().updatedAt?.toDate?.()?.toISOString() || docSnap.data().updatedAt,
        }
      };
    } else {
      return { success: false, error: '알림장을 찾을 수 없습니다.' };
    }
  } catch (error) {
    console.error('Get notice error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 알림장 삭제
 * @param {string} noticeId - 알림장 ID
 * @returns {Promise<Object>} 삭제 결과
 */
export const deleteNotice = async (noticeId) => {
  try {
    const docRef = doc(db, 'notices', noticeId);
    await deleteDoc(docRef);

    return { success: true };
  } catch (error) {
    console.error('Delete notice error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 알림장 읽음 처리
 * @param {string} noticeId - 알림장 ID
 * @param {string} studentId - 학생 ID
 * @returns {Promise<Object>} 처리 결과
 */
export const markNoticeAsRead = async (noticeId, studentId) => {
  try {
    const docRef = doc(db, 'notices', noticeId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: false, error: '알림장을 찾을 수 없습니다' };
    }

    const noticeData = docSnap.data();
    const readBy = noticeData.readBy || [];

    // 이미 읽었는지 확인
    const alreadyRead = readBy.some(item => item.studentId === studentId);
    if (alreadyRead) {
      return { success: true, message: '이미 읽음 처리되었습니다' };
    }

    // 읽음 정보 추가
    await updateDoc(docRef, {
      readBy: [...readBy, {
        studentId,
        readAt: serverTimestamp(),
      }],
      confirmed: (noticeData.confirmed || 0) + 1,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Mark notice as read error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 학생의 안 읽은 알림장 목록 가져오기
 * @param {string} studentId - 학생 ID
 * @param {string} teacherId - 선생님 ID (optional)
 * @returns {Promise<Object>} 안 읽은 알림장 목록
 */
export const getUnreadNotices = async (studentId, teacherId = null) => {
  try {
    const noticesRef = collection(db, 'notices');
    let q = query(
      noticesRef,
      orderBy('createdAt', 'desc')
    );

    if (teacherId) {
      q = query(
        noticesRef,
        where('teacherId', '==', teacherId),
        orderBy('createdAt', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    const unreadNotices = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const recipients = data.recipients || [];
      const readBy = data.readBy || [];

      // 이 학생이 수신자이고, 아직 읽지 않은 경우
      if (recipients.includes(studentId) &&
          !readBy.some(item => item.studentId === studentId)) {
        unreadNotices.push({
          id: doc.id,
          ...data,
        });
      }
    });

    return { success: true, data: unreadNotices };
  } catch (error) {
    console.error('Get unread notices error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 학생의 모든 알림장 목록 가져오기 (읽음/안읽음 포함)
 * @param {string} studentId - 학생 ID
 * @param {string} teacherId - 선생님 ID (optional)
 * @returns {Promise<Object>} 알림장 목록
 */
export const getNoticesForStudent = async (studentId, teacherId = null) => {
  try {
    const noticesRef = collection(db, 'notices');
    let q = query(
      noticesRef,
      orderBy('createdAt', 'desc')
    );

    if (teacherId) {
      q = query(
        noticesRef,
        where('teacherId', '==', teacherId),
        orderBy('createdAt', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    const notices = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const recipients = data.recipients || [];
      const readBy = data.readBy || [];

      // 이 학생이 수신자인 경우만
      if (recipients.includes(studentId)) {
        const isRead = readBy.some(item => item.studentId === studentId);
        const readInfo = readBy.find(item => item.studentId === studentId);

        notices.push({
          id: doc.id,
          ...data,
          isRead,
          readAt: readInfo?.readAt || null,
        });
      }
    });

    return { success: true, data: notices };
  } catch (error) {
    console.error('Get notices for student error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * ==========================================
 * 수강료 관리 (Tuition Collection)
 * ==========================================
 */

/**
 * 수강료 기록 가져오기
 * @param {string} teacherId - 선생님 ID
 * @param {string} month - 월 (YYYY-MM)
 * @returns {Promise<Object>} 수강료 목록
 */
export const getTuitionRecords = async (teacherId, month) => {
  try {
    const tuitionRef = collection(db, 'tuition');
    const q = query(
      tuitionRef,
      where('teacherId', '==', teacherId),
      where('month', '==', month)
    );

    const querySnapshot = await getDocs(q);
    const tuition = [];
    querySnapshot.forEach((doc) => {
      tuition.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: tuition };
  } catch (error) {
    console.error('Get tuition error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 수강료 기록 저장
 * @param {Object} tuitionData - 수강료 정보
 * @param {string} teacherId - 선생님 ID
 * @returns {Promise<Object>} 저장 결과
 */
export const saveTuitionRecord = async (tuitionData, teacherId) => {
  try {
    const tuitionRef = collection(db, 'tuition');
    const docRef = await addDoc(tuitionRef, {
      ...tuitionData,
      teacherId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Save tuition error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 학생별 수강료 기록 조회
 * @param {string} studentId - 학생 ID
 * @returns {Promise<Object>} 수강료 기록 목록
 */
export const getTuitionByStudentId = async (studentId) => {
  try {
    const tuitionRef = collection(db, 'tuition');
    const q = query(
      tuitionRef,
      where('studentId', '==', studentId),
      orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const tuition = [];
    querySnapshot.forEach((doc) => {
      tuition.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: tuition };
  } catch (error) {
    console.error('Get tuition by student error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 수강료 납부 상태 업데이트
 * @param {string} tuitionId - 수강료 ID
 * @param {boolean} isPaid - 납부 여부
 * @param {string} paidDate - 납부 날짜
 * @returns {Promise<Object>} 업데이트 결과
 */
export const updateTuitionStatus = async (tuitionId, isPaid, paidDate = null) => {
  try {
    const docRef = doc(db, 'tuition', tuitionId);
    await updateDoc(docRef, {
      isPaid,
      paidDate,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Update tuition status error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 수강료 기록 삭제
 * @param {string} tuitionId - 수강료 ID
 * @returns {Promise<Object>} 삭제 결과
 */
export const deleteTuitionRecord = async (tuitionId) => {
  try {
    const docRef = doc(db, 'tuition', tuitionId);
    await deleteDoc(docRef);

    return { success: true };
  } catch (error) {
    console.error('Delete tuition error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * ==========================================
 * 갤러리 관리 (Gallery Collection)
 * ==========================================
 */

/**
 * 갤러리 아이템 목록 가져오기
 * @param {string} teacherId - 선생님 ID
 * @param {Object} filters - 필터 옵션
 * @returns {Promise<Object>} 갤러리 목록
 */
export const getGalleryItems = async (teacherId, filters = {}) => {
  try {
    const galleryRef = collection(db, 'gallery');
    let q = query(
      galleryRef,
      where('teacherId', '==', teacherId),
      orderBy('createdAt', 'desc')
    );

    if (filters.category && filters.category !== 'all') {
      q = query(q, where('category', '==', filters.category));
    }

    if (filters.album && filters.album !== 'all') {
      q = query(q, where('album', '==', filters.album));
    }

    const querySnapshot = await getDocs(q);
    const items = [];
    querySnapshot.forEach((doc) => {
      items.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
      });
    });

    return { success: true, data: items };
  } catch (error) {
    console.error('Get gallery items error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 갤러리 아이템 업로드
 * @param {Object} itemData - 갤러리 아이템 정보
 * @param {string} teacherId - 선생님 ID
 * @returns {Promise<Object>} 업로드 결과
 */
export const uploadGalleryItem = async (itemData, teacherId) => {
  try {
    const galleryRef = collection(db, 'gallery');
    const docRef = await addDoc(galleryRef, {
      ...itemData,
      teacherId,
      likes: 0,
      comments: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Upload gallery item error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 갤러리 아이템 삭제
 * @param {string} itemId - 갤러리 아이템 ID
 * @returns {Promise<Object>} 삭제 결과
 */
export const deleteGalleryItem = async (itemId) => {
  try {
    const docRef = doc(db, 'gallery', itemId);
    await deleteDoc(docRef);

    return { success: true };
  } catch (error) {
    console.error('Delete gallery item error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 갤러리 아이템에 좋아요 추가 (increment 사용)
 * @param {string} itemId - 갤러리 아이템 ID
 * @returns {Promise<Object>} 결과
 */
export const addLikeToGalleryItem = async (itemId) => {
  try {
    const docRef = doc(db, 'gallery', itemId);
    await updateDoc(docRef, {
      likes: increment(1),
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Add like error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 갤러리 아이템에 댓글 추가 (arrayUnion 사용)
 * @param {string} itemId - 갤러리 아이템 ID
 * @param {Object} comment - 댓글 객체
 * @returns {Promise<Object>} 결과
 */
export const addCommentToGalleryItem = async (itemId, comment) => {
  try {
    const docRef = doc(db, 'gallery', itemId);
    await updateDoc(docRef, {
      comments: arrayUnion({
        ...comment,
        createdAt: Timestamp.now(),
      }),
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Add comment error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * ==========================================
 * 활동 로그 관리 (Activities Collection)
 * ==========================================
 */

/**
 * 활동 로그 목록 가져오기
 * @param {string} teacherId - 선생님 ID
 * @param {Object} options - 쿼리 옵션 (limit, type, studentId)
 * @returns {Promise<Object>} 활동 목록
 */
export const getActivities = async (teacherId, options = {}) => {
  try {
    const activitiesRef = collection(db, 'activities');
    let q = query(
      activitiesRef,
      where('teacherId', '==', teacherId),
      orderBy('timestamp', 'desc')
    );

    if (options.type) {
      q = query(q, where('type', '==', options.type));
    }

    if (options.studentId) {
      q = query(q, where('studentId', '==', options.studentId));
    }

    if (options.limit) {
      q = query(q, limit(options.limit));
    }

    const querySnapshot = await getDocs(q);
    const activities = [];
    querySnapshot.forEach((doc) => {
      activities.push({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || doc.data().timestamp,
      });
    });

    return { success: true, data: activities };
  } catch (error) {
    console.error('Get activities error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 활동 로그 추가
 * @param {Object} activityData - 활동 정보
 * @param {string} teacherId - 선생님 ID
 * @returns {Promise<Object>} 추가 결과
 */
export const addActivity = async (activityData, teacherId) => {
  try {
    const activitiesRef = collection(db, 'activities');
    const docRef = await addDoc(activitiesRef, {
      ...activityData,
      teacherId,
      timestamp: serverTimestamp(),
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Add activity error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 날짜 범위로 활동 조회
 * @param {string} teacherId - 선생님 ID
 * @param {string} startDate - 시작 날짜 (ISO string)
 * @param {string} endDate - 종료 날짜 (ISO string)
 * @returns {Promise<Object>} 활동 목록
 */
export const getActivitiesByDateRange = async (teacherId, startDate, endDate) => {
  try {
    const activitiesRef = collection(db, 'activities');
    const startTimestamp = Timestamp.fromDate(new Date(startDate));
    const endTimestamp = Timestamp.fromDate(new Date(endDate));

    const q = query(
      activitiesRef,
      where('teacherId', '==', teacherId),
      where('timestamp', '>=', startTimestamp),
      where('timestamp', '<=', endTimestamp),
      orderBy('timestamp', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const activities = [];
    querySnapshot.forEach((doc) => {
      activities.push({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || doc.data().timestamp,
      });
    });

    return { success: true, data: activities };
  } catch (error) {
    console.error('Get activities by date range error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * ==========================================
 * 알림 관리 (Notifications Collection)
 * ==========================================
 */

/**
 * 알림 목록 가져오기
 * @param {string} teacherId - 선생님 ID
 * @param {Object} options - 쿼리 옵션 (limit, isRead)
 * @returns {Promise<Object>} 알림 목록
 */
export const getNotifications = async (teacherId, options = {}) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    let q = query(
      notificationsRef,
      where('teacherId', '==', teacherId),
      orderBy('timestamp', 'desc')
    );

    if (options.isRead !== undefined) {
      q = query(q, where('isRead', '==', options.isRead));
    }

    if (options.limit) {
      q = query(q, limit(options.limit));
    }

    const querySnapshot = await getDocs(q);
    const notifications = [];
    querySnapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || doc.data().timestamp,
      });
    });

    return { success: true, data: notifications };
  } catch (error) {
    console.error('Get notifications error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 알림 추가
 * @param {Object} notificationData - 알림 정보
 * @param {string} teacherId - 선생님 ID
 * @returns {Promise<Object>} 추가 결과
 */
export const addNotification = async (notificationData, teacherId) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const docRef = await addDoc(notificationsRef, {
      ...notificationData,
      teacherId,
      isRead: false,
      timestamp: serverTimestamp(),
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Add notification error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 알림 읽음 처리
 * @param {string} notificationId - 알림 ID
 * @returns {Promise<Object>} 결과
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const docRef = doc(db, 'notifications', notificationId);
    await updateDoc(docRef, {
      isRead: true,
      readAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Mark notification as read error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 모든 알림 읽음 처리
 * @param {string} teacherId - 선생님 ID
 * @returns {Promise<Object>} 결과
 */
export const markAllNotificationsAsRead = async (teacherId) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('teacherId', '==', teacherId),
      where('isRead', '==', false)
    );

    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);

    querySnapshot.forEach((docSnapshot) => {
      batch.update(docSnapshot.ref, {
        isRead: true,
        readAt: serverTimestamp(),
      });
    });

    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 알림 삭제
 * @param {string} notificationId - 알림 ID
 * @returns {Promise<Object>} 결과
 */
export const deleteNotification = async (notificationId) => {
  try {
    const docRef = doc(db, 'notifications', notificationId);
    await deleteDoc(docRef);

    return { success: true };
  } catch (error) {
    console.error('Delete notification error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 알림 실시간 리스너
 * @param {string} teacherId - 선생님 ID
 * @param {Function} callback - 데이터 변경 시 호출될 콜백
 * @returns {Function} unsubscribe 함수
 */
export const subscribeToNotifications = (teacherId, callback) => {
  const notificationsRef = collection(db, 'notifications');
  const q = query(
    notificationsRef,
    where('teacherId', '==', teacherId),
    orderBy('timestamp', 'desc'),
    limit(50) // 최근 50개만
  );

  return onSnapshot(q, (snapshot) => {
    const notifications = [];
    snapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || doc.data().timestamp,
      });
    });
    callback(notifications);
  }, (error) => {
    console.error('Notification subscription error:', error);
  });
};

/**
 * ==========================================
 * 실시간 리스너
 * ==========================================
 */

/**
 * 학생 목록 실시간 리스너
 * @param {string} teacherId - 선생님 ID
 * @param {Function} callback - 데이터 변경 시 호출될 콜백
 * @returns {Function} unsubscribe 함수
 */
export const subscribeToStudents = (teacherId, callback) => {
  const studentsRef = collection(db, 'students');
  const q = query(
    studentsRef,
    where('teacherId', '==', teacherId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const students = [];
    snapshot.forEach((doc) => {
      students.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
      });
    });
    callback(students);
  }, (error) => {
    console.error('Student subscription error:', error);
  });
};

/**
 * 알림장 목록 실시간 리스너
 * @param {string} teacherId - 선생님 ID
 * @param {Function} callback - 데이터 변경 시 호출될 콜백
 * @returns {Function} unsubscribe 함수
 */
export const subscribeToNotices = (teacherId, callback) => {
  const noticesRef = collection(db, 'notices');
  const q = query(
    noticesRef,
    where('teacherId', '==', teacherId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const notices = [];
    snapshot.forEach((doc) => {
      notices.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
      });
    });
    callback(notices);
  }, (error) => {
    console.error('Notice subscription error:', error);
  });
};

/**
 * ==========================================
 * 댓글 관리 (Comments Collection)
 * ==========================================
 */

/**
 * 댓글 작성
 * @param {string} noticeId - 알림장 ID
 * @param {Object} commentData - 댓글 데이터
 * @returns {Promise<Object>} 결과
 */
export const createComment = async (noticeId, commentData) => {
  try {
    const commentsRef = collection(db, 'comments');
    const docRef = await addDoc(commentsRef, {
      noticeId,
      ...commentData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      commentId: docRef.id,
    };
  } catch (error) {
    console.error('Create comment error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 알림장의 댓글 목록 가져오기
 * @param {string} noticeId - 알림장 ID
 * @returns {Promise<Object>} 댓글 목록
 */
export const getCommentsByNotice = async (noticeId) => {
  try {
    const commentsRef = collection(db, 'comments');
    const q = query(
      commentsRef,
      where('noticeId', '==', noticeId),
      orderBy('createdAt', 'asc')
    );

    const snapshot = await getDocs(q);
    const comments = [];

    snapshot.forEach((doc) => {
      comments.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
      });
    });

    return { success: true, data: comments };
  } catch (error) {
    console.error('Get comments error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 댓글 삭제
 * @param {string} commentId - 댓글 ID
 * @returns {Promise<Object>} 결과
 */
export const deleteComment = async (commentId) => {
  try {
    const docRef = doc(db, 'comments', commentId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    console.error('Delete comment error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 댓글 실시간 구독
 * @param {string} noticeId - 알림장 ID
 * @param {Function} callback - 데이터 변경 시 호출될 콜백
 * @returns {Function} unsubscribe 함수
 */
export const subscribeToComments = (noticeId, callback) => {
  const commentsRef = collection(db, 'comments');
  const q = query(
    commentsRef,
    where('noticeId', '==', noticeId),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const comments = [];
    snapshot.forEach((doc) => {
      comments.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
      });
    });
    callback(comments);
  }, (error) => {
    console.error('Comment subscription error:', error);
  });
};

/**
 * ==========================================
 * Firebase Storage - 미디어 업로드
 * ==========================================
 */

/**
 * 이미지/비디오 파일 업로드
 * @param {string} uri - 로컬 파일 URI
 * @param {string} folder - Storage 폴더 경로 (예: 'notices', 'profiles')
 * @param {string} fileName - 파일 이름
 * @param {Function} onProgress - 업로드 진행률 콜백 (0-100)
 * @returns {Promise<Object>} { success, downloadURL, error }
 */
export const uploadMedia = async (uri, folder, fileName, onProgress = null) => {
  try {
    // Fetch the file as a blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // Create a reference to the file location in Firebase Storage
    const storageRef = ref(storage, `${folder}/${fileName}`);

    // Upload with progress tracking if callback provided
    if (onProgress) {
      const uploadTask = uploadBytesResumable(storageRef, blob);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(progress);
          },
          (error) => {
            console.error('Upload error:', error);
            reject({ success: false, error: error.message });
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({ success: true, downloadURL });
          }
        );
      });
    } else {
      // Simple upload without progress tracking
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      return { success: true, downloadURL };
    }
  } catch (error) {
    console.error('Media upload error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 여러 미디어 파일 일괄 업로드
 * @param {Array} mediaItems - [{ uri, type: 'image'|'video' }]
 * @param {string} folder - Storage 폴더 경로
 * @param {Function} onProgress - 전체 진행률 콜백
 * @returns {Promise<Object>} { success, uploadedMedia: [{ url, type }], error }
 */
export const uploadMultipleMedia = async (mediaItems, folder, onProgress = null) => {
  try {
    const uploadedMedia = [];
    const totalItems = mediaItems.length;

    for (let i = 0; i < mediaItems.length; i++) {
      const item = mediaItems[i];
      const timestamp = Date.now();
      const fileName = `${timestamp}_${i}.${item.type === 'video' ? 'mp4' : 'jpg'}`;

      const result = await uploadMedia(
        item.uri,
        folder,
        fileName,
        (itemProgress) => {
          if (onProgress) {
            const totalProgress = ((i + itemProgress / 100) / totalItems) * 100;
            onProgress(totalProgress);
          }
        }
      );

      if (result.success) {
        uploadedMedia.push({
          url: result.downloadURL,
          type: item.type,
        });
      } else {
        throw new Error(result.error);
      }
    }

    return { success: true, uploadedMedia };
  } catch (error) {
    console.error('Multiple media upload error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Storage에서 파일 삭제
 * @param {string} downloadURL - Firebase Storage URL
 * @returns {Promise<Object>} { success, error }
 */
export const deleteMedia = async (downloadURL) => {
  try {
    const storageRef = ref(storage, downloadURL);
    await deleteObject(storageRef);
    return { success: true };
  } catch (error) {
    console.error('Media delete error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * ==========================================
 * 배치 작업 (Batch Operations)
 * ==========================================
 */

/**
 * 여러 문서를 한 번에 업데이트 (최대 500개)
 * @param {Array} updates - 업데이트할 문서들 [{ collection, id, data }]
 * @returns {Promise<Object>} 결과
 */
export const batchUpdate = async (updates) => {
  try {
    const batch = writeBatch(db);

    updates.forEach(({ collection: collectionName, id, data }) => {
      const docRef = doc(db, collectionName, id);
      batch.update(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error('Batch update error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * ==========================================
 * 학원 관리 (Academy Management)
 * ==========================================
 */

/**
 * 새 학원 생성
 * @param {Object} academyData - 학원 정보
 * @returns {Promise<Object>} { success, academyId, code, error }
 */
export const createAcademy = async (academyData) => {
  try {
    const { generateAcademyCode } = await import('../utils/academyUtils');

    // 고유한 학원 코드 생성 (중복 체크)
    let code = generateAcademyCode();
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      const q = query(collection(db, 'academies'), where('code', '==', code));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        isUnique = true;
      } else {
        code = generateAcademyCode();
        attempts++;
      }
    }

    if (!isUnique) {
      throw new Error('학원 코드 생성에 실패했습니다. 다시 시도해주세요.');
    }

    // 학원 문서 생성
    const academyRef = doc(collection(db, 'academies'));
    await setDoc(academyRef, {
      code,
      name: academyData.name,
      businessNumber: academyData.businessNumber,
      ownerId: academyData.ownerId,
      ownerName: academyData.ownerName,
      ownerPhone: academyData.ownerPhone || null,
      ownerEmail: academyData.ownerEmail || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      academyId: academyRef.id,
      code,
    };
  } catch (error) {
    console.error('Create academy error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * 학원 코드로 학원 정보 조회
 * @param {string} code - 학원 코드
 * @returns {Promise<Object>} { success, academy, error }
 */
export const getAcademyByCode = async (code) => {
  try {
    console.log('🔍 Searching for academy with code:', code.toUpperCase());
    console.log('📁 Firebase Project ID:', db.app.options.projectId);

    const q = query(collection(db, 'academies'), where('code', '==', code.toUpperCase()));
    const snapshot = await getDocs(q);

    console.log('✅ Query successful. Found documents:', snapshot.size);

    if (snapshot.empty) {
      return {
        success: false,
        error: '존재하지 않는 학원 코드입니다',
      };
    }

    const academyDoc = snapshot.docs[0];
    return {
      success: true,
      academy: {
        id: academyDoc.id,
        ...academyDoc.data(),
      },
    };
  } catch (error) {
    console.error('❌ Get academy by code error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * 학원 ID로 학원 정보 조회
 * @param {string} academyId - 학원 ID
 * @returns {Promise<Object>} { success, academy, error }
 */
export const getAcademyById = async (academyId) => {
  try {
    const academyRef = doc(db, 'academies', academyId);
    const academyDoc = await getDoc(academyRef);

    if (!academyDoc.exists()) {
      return {
        success: false,
        error: '학원을 찾을 수 없습니다',
      };
    }

    return {
      success: true,
      academy: {
        id: academyDoc.id,
        ...academyDoc.data(),
      },
    };
  } catch (error) {
    console.error('Get academy by ID error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * 학원 정보 업데이트
 * @param {string} academyId - 학원 ID
 * @param {Object} data - 업데이트할 데이터
 * @returns {Promise<Object>} { success, error }
 */
export const updateAcademy = async (academyId, data) => {
  try {
    const academyRef = doc(db, 'academies', academyId);
    await updateDoc(academyRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Update academy error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * ==========================================
 * 학생 등록 요청 관리 (Student Requests)
 * ==========================================
 */

/**
 * 학생 등록 요청 생성 (학부모가 자녀 등록 요청)
 * @param {Object} requestData - 요청 데이터
 * @returns {Promise<Object>} { success, requestId, error }
 */
export const createStudentRequest = async (requestData) => {
  try {
    const requestsRef = collection(db, 'studentRequests');
    const docRef = await addDoc(requestsRef, {
      ...requestData,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // 학원 정보 가져오기 (선생님 ID 필요)
    const academyResult = await getAcademyById(requestData.academyId);
    if (academyResult.success && academyResult.academy.ownerId) {
      const teacherId = academyResult.academy.ownerId;

      // 활동 기록 추가
      await addActivity({
        type: 'student_request',
        title: '새로운 학생 등록 요청',
        description: `${requestData.parentName}님이 ${requestData.childName} 학생의 등록을 요청했습니다`,
        icon: 'person-add',
        color: '#F59E0B', // 오렌지색
        relatedId: docRef.id,
      }, teacherId);

      // 선생님에게 알림 전송
      const notificationsRef = collection(db, 'notifications');
      await addDoc(notificationsRef, {
        userId: teacherId,
        type: 'student_request',
        title: '새로운 학생 등록 요청',
        message: `${requestData.parentName}님이 ${requestData.childName} 학생의 등록을 요청했습니다`,
        read: false,
        createdAt: serverTimestamp(),
        data: {
          requestId: docRef.id,
          childName: requestData.childName,
          parentName: requestData.parentName,
        },
      });
    }

    return { success: true, requestId: docRef.id };
  } catch (error) {
    console.error('Create student request error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 학원의 대기 중인 학생 등록 요청 조회
 * @param {string} academyId - 학원 ID
 * @returns {Promise<Object>} { success, requests, error }
 */
export const getPendingStudentRequests = async (academyId) => {
  try {
    const q = query(
      collection(db, 'studentRequests'),
      where('academyId', '==', academyId),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const requests = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, requests };
  } catch (error) {
    console.error('Get pending student requests error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 학생 등록 요청 승인 (선생님이 실제 학생으로 등록)
 * @param {string} requestId - 요청 ID
 * @param {Object} additionalData - 추가 학생 정보 (category, level, schedule, book 등)
 * @returns {Promise<Object>} { success, studentId, error }
 */
export const approveStudentRequest = async (requestId, additionalData = {}) => {
  try {
    // 1. 요청 정보 가져오기
    const requestRef = doc(db, 'studentRequests', requestId);
    const requestDoc = await getDoc(requestRef);

    if (!requestDoc.exists()) {
      return { success: false, error: '요청을 찾을 수 없습니다' };
    }

    const requestData = requestDoc.data();

    // 2. 학생 레코드 생성
    const studentData = {
      name: requestData.childName,
      age: requestData.childAge,
      school: requestData.school || '',
      phone: requestData.childPhone || '',
      address: requestData.address || '',
      parentName: requestData.parentName,
      parentPhone: requestData.parentPhone,
      parentId: requestData.parentId,
      academyId: requestData.academyId,
      category: additionalData.category || '초등',
      level: additionalData.level || '초급',
      schedule: additionalData.schedule || '',
      book: additionalData.book || '',
      ticketType: additionalData.ticketType || 'count',
      ticketCount: additionalData.ticketCount || 0,
      ticketPeriod: additionalData.ticketPeriod || null,
      unpaid: false,
    };

    // academy owner ID 찾기
    const academyResult = await getAcademyById(requestData.academyId);
    if (!academyResult.success) {
      return { success: false, error: '학원 정보를 찾을 수 없습니다' };
    }

    const result = await addStudent(studentData, academyResult.academy.ownerId);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    // 3. 학부모 user profile에 studentId 추가 (Firestore 직접 업데이트)
    const parentUserRef = doc(db, 'users', requestData.parentId);
    await updateDoc(parentUserRef, {
      studentId: result.id,
      updatedAt: serverTimestamp(),
    });

    // 4. 요청 상태 업데이트
    await updateDoc(requestRef, {
      status: 'approved',
      studentId: result.id,
      approvedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { success: true, studentId: result.id };
  } catch (error) {
    console.error('Approve student request error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 학생 등록 요청 거절
 * @param {string} requestId - 요청 ID
 * @param {string} reason - 거절 사유
 * @returns {Promise<Object>} { success, error }
 */
export const rejectStudentRequest = async (requestId, reason = '') => {
  try {
    const requestRef = doc(db, 'studentRequests', requestId);
    await updateDoc(requestRef, {
      status: 'rejected',
      rejectionReason: reason,
      rejectedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Reject student request error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * ==========================================
 * 문의하기 관리 (Inquiries Collection)
 * ==========================================
 */

/**
 * 학부모별 문의 목록 조회
 * @param {string} parentId - 학부모 ID
 * @returns {Promise<Object>} { success, data, error }
 */
export const getInquiriesByParent = async (parentId) => {
  try {
    const inquiriesRef = collection(db, 'inquiries');
    const q = query(
      inquiriesRef,
      where('parentId', '==', parentId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const inquiries = [];
    querySnapshot.forEach((doc) => {
      inquiries.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: inquiries };
  } catch (error) {
    console.error('Get inquiries by parent error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 선생님별 문의 목록 조회
 * @param {string} teacherId - 선생님 ID
 * @returns {Promise<Object>} { success, data, error }
 */
export const getInquiriesByTeacher = async (teacherId) => {
  try {
    const inquiriesRef = collection(db, 'inquiries');
    const q = query(
      inquiriesRef,
      where('teacherId', '==', teacherId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const inquiries = [];
    querySnapshot.forEach((doc) => {
      inquiries.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: inquiries };
  } catch (error) {
    console.error('Get inquiries by teacher error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 문의 생성
 * @param {Object} inquiryData - 문의 정보
 * @returns {Promise<Object>} { success, id, error }
 */
export const createInquiry = async (inquiryData) => {
  try {
    // studentId로 teacherId 찾기
    let teacherId = null;
    if (inquiryData.studentId) {
      const studentResult = await getStudentById(inquiryData.studentId);
      if (studentResult.success && studentResult.data) {
        teacherId = studentResult.data.teacherId;
      }
    }

    const inquiriesRef = collection(db, 'inquiries');
    const docRef = await addDoc(inquiriesRef, {
      ...inquiryData,
      teacherId,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Create inquiry error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 문의 답변 작성
 * @param {string} inquiryId - 문의 ID
 * @param {string} answer - 답변 내용
 * @returns {Promise<Object>} { success, error }
 */
export const answerInquiry = async (inquiryId, answer) => {
  try {
    const inquiryRef = doc(db, 'inquiries', inquiryId);
    await updateDoc(inquiryRef, {
      answer,
      status: 'answered',
      answeredAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Answer inquiry error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 문의 삭제
 * @param {string} inquiryId - 문의 ID
 * @returns {Promise<Object>} { success, error }
 */
export const deleteInquiry = async (inquiryId) => {
  try {
    await deleteDoc(doc(db, 'inquiries', inquiryId));
    return { success: true };
  } catch (error) {
    console.error('Delete inquiry error:', error);
    return { success: false, error: error.message };
  }
};
