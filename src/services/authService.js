// src/services/authService.js
// Firebase Authentication 서비스 (Firebase v12.4.0 기준)

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

/**
 * 이메일/비밀번호로 로그인
 * @param {string} email - 이메일
 * @param {string} password - 비밀번호
 * @returns {Promise<Object>} 로그인 결과
 */
export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Firestore에서 사용자 정보 가져오기
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.exists() ? userDoc.data() : null;

    // 마지막 로그인 시간 업데이트
    if (userDoc.exists()) {
      await updateDoc(userDocRef, {
        lastLoginAt: serverTimestamp(),
      });
    }

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        ...userData,
      },
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: getErrorMessage(error.code),
      errorCode: error.code,
    };
  }
};

/**
 * 새 계정 생성
 * @param {string} email - 이메일
 * @param {string} password - 비밀번호
 * @param {Object} userData - 사용자 정보
 * @returns {Promise<Object>} 회원가입 결과
 */
export const registerWithEmail = async (email, password, userData) => {
  try {
    // Firebase Auth에 사용자 생성
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 사용자 프로필 업데이트
    await updateProfile(user, {
      displayName: userData.name,
      photoURL: userData.photoURL || null,
    });

    // Firestore에 사용자 정보 저장
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
      email: user.email,
      name: userData.name,
      role: userData.role || 'parent', // 'teacher' or 'parent'
      photoURL: userData.photoURL || null,
      phone: userData.phone || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      ...userData,
    });

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: userData.name,
        role: userData.role,
      },
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: getErrorMessage(error.code),
      errorCode: error.code,
    };
  }
};

/**
 * 로그아웃
 * @returns {Promise<Object>} 로그아웃 결과
 */
export const logout = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      error: getErrorMessage(error.code),
      errorCode: error.code,
    };
  }
};

/**
 * 비밀번호 재설정 이메일 전송
 * @param {string} email - 이메일
 * @returns {Promise<Object>} 결과
 */
export const sendPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return {
      success: true,
      message: '비밀번호 재설정 이메일을 전송했습니다.',
    };
  } catch (error) {
    console.error('Password reset error:', error);
    return {
      success: false,
      error: getErrorMessage(error.code),
      errorCode: error.code,
    };
  }
};

/**
 * 비밀번호 변경
 * @param {string} currentPassword - 현재 비밀번호
 * @param {string} newPassword - 새 비밀번호
 * @returns {Promise<Object>} 결과
 */
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error('로그인이 필요합니다');
    }

    // 재인증 필요
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // 비밀번호 업데이트
    await updatePassword(user, newPassword);

    return {
      success: true,
      message: '비밀번호가 성공적으로 변경되었습니다.',
    };
  } catch (error) {
    console.error('Change password error:', error);
    return {
      success: false,
      error: getErrorMessage(error.code),
      errorCode: error.code,
    };
  }
};

/**
 * 프로필 업데이트
 * @param {string} userId - 사용자 ID (선택)
 * @param {Object} profileData - 업데이트할 프로필 정보
 * @returns {Promise<Object>} 결과
 */
export const updateUserProfile = async (userId, profileData) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('로그인이 필요합니다');
    }

    // Firebase Auth 프로필 업데이트
    if (profileData.displayName || profileData.photoURL) {
      await updateProfile(user, {
        displayName: profileData.displayName || user.displayName,
        photoURL: profileData.photoURL || user.photoURL,
      });
    }

    // Firestore 사용자 정보 업데이트 (문서가 없으면 생성)
    const uid = userId || user.uid;
    const userDocRef = doc(db, 'users', uid);

    // merge: true 옵션으로 문서가 없으면 생성, 있으면 업데이트
    await setDoc(userDocRef, {
      ...profileData,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    return {
      success: true,
      message: '프로필이 업데이트되었습니다.',
    };
  } catch (error) {
    console.error('Update profile error:', error);
    return {
      success: false,
      error: getErrorMessage(error.code) || error.message,
      errorCode: error.code,
    };
  }
};

/**
 * 현재 로그인한 사용자 정보 가져오기
 * @returns {Object|null} 현재 사용자
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Firestore에서 사용자 상세 정보 가져오기
 * @param {string} uid - 사용자 UID (선택사항, 없으면 현재 사용자)
 * @returns {Promise<Object>} 사용자 정보
 */
export const getUserData = async (uid = null) => {
  try {
    const userId = uid || auth.currentUser?.uid;
    if (!userId) {
      throw new Error('사용자 ID가 없습니다');
    }

    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      return {
        success: true,
        data: {
          uid: userId,
          ...userDoc.data(),
        },
      };
    } else {
      return {
        success: false,
        error: '사용자를 찾을 수 없습니다',
      };
    }
  } catch (error) {
    console.error('Get user data error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * 인증 상태 변경 리스너
 * @param {Function} callback - 상태 변경 시 호출될 콜백
 * @returns {Function} unsubscribe 함수
 */
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // 사용자가 로그인한 경우, Firestore에서 추가 정보 가져오기
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.exists() ? userDoc.data() : {};

      callback({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        ...userData,
      });
    } else {
      // 로그아웃 상태
      callback(null);
    }
  });
};

/**
 * Firebase 에러 코드를 한글 메시지로 변환
 * @param {string} errorCode - Firebase 에러 코드
 * @returns {string} 한글 에러 메시지
 */
const getErrorMessage = (errorCode) => {
  const errorMessages = {
    // Auth 에러
    'auth/invalid-email': '잘못된 이메일 주소입니다.',
    'auth/user-disabled': '비활성화된 계정입니다.',
    'auth/user-not-found': '존재하지 않는 계정입니다.',
    'auth/wrong-password': '비밀번호가 올바르지 않습니다.',
    'auth/email-already-in-use': '이미 사용 중인 이메일입니다.',
    'auth/weak-password': '비밀번호는 최소 6자 이상이어야 합니다.',
    'auth/too-many-requests': '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
    'auth/network-request-failed': '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.',
    'auth/invalid-credential': '잘못된 인증 정보입니다.',
    'auth/operation-not-allowed': '이 작업은 허용되지 않습니다.',
    'auth/requires-recent-login': '보안을 위해 다시 로그인해주세요.',
    'auth/credential-already-in-use': '이미 다른 계정에서 사용 중인 인증 정보입니다.',
  };

  return errorMessages[errorCode] || '오류가 발생했습니다. 다시 시도해주세요.';
};
