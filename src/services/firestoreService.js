// src/services/firestoreService.js
// Firestore 데이터베이스 CRUD 서비스 (Firebase v12.4.0 기준)

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
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
import { db } from '../config/firebase';

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
