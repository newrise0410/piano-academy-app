// src/services/academyService.js
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * 사용자의 학원 정보 가져오기
 * @param {string} userId - 사용자 ID
 * @returns {Promise<Object>} 학원 정보 또는 null
 */
export const getAcademyByOwner = async (userId) => {
  try {
    if (!userId) {
      throw new Error('사용자 ID가 필요합니다');
    }

    const academiesRef = collection(db, 'academies');
    const q = query(academiesRef, where('ownerId', '==', userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return {
        success: true,
        data: null,
        message: '등록된 학원이 없습니다',
      };
    }

    // 첫 번째 학원 정보 반환 (한 사용자당 하나의 학원)
    const academyDoc = querySnapshot.docs[0];
    return {
      success: true,
      data: {
        id: academyDoc.id,
        ...academyDoc.data(),
      },
    };
  } catch (error) {
    console.error('Get academy error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * 학원 ID로 학원 정보 가져오기
 * @param {string} academyId - 학원 ID
 * @returns {Promise<Object>} 학원 정보
 */
export const getAcademyById = async (academyId) => {
  try {
    if (!academyId) {
      throw new Error('학원 ID가 필요합니다');
    }

    const academyDocRef = doc(db, 'academies', academyId);
    const academyDoc = await getDoc(academyDocRef);

    if (!academyDoc.exists()) {
      return {
        success: false,
        error: '학원을 찾을 수 없습니다',
      };
    }

    return {
      success: true,
      data: {
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
 * 새 학원 등록
 * @param {Object} academyData - 학원 정보
 * @returns {Promise<Object>} 생성된 학원 정보
 */
export const createAcademy = async (academyData) => {
  try {
    const { ownerId, name, address, phone, businessNumber, description } = academyData;

    if (!ownerId || !name) {
      throw new Error('필수 정보를 입력해주세요 (소유자, 학원명)');
    }

    // 이미 등록된 학원이 있는지 확인
    const existingAcademy = await getAcademyByOwner(ownerId);
    if (existingAcademy.success && existingAcademy.data) {
      throw new Error('이미 등록된 학원이 있습니다');
    }

    // 새 학원 문서 생성
    const academyRef = doc(collection(db, 'academies'));
    const newAcademy = {
      ownerId,
      name,
      address: address || '',
      phone: phone || '',
      businessNumber: businessNumber || '',
      description: description || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(academyRef, newAcademy);

    return {
      success: true,
      data: {
        id: academyRef.id,
        ...newAcademy,
      },
      message: '학원이 등록되었습니다',
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
 * 학원 정보 수정
 * @param {string} academyId - 학원 ID
 * @param {Object} updates - 수정할 정보
 * @returns {Promise<Object>} 수정 결과
 */
export const updateAcademy = async (academyId, updates) => {
  try {
    if (!academyId) {
      throw new Error('학원 ID가 필요합니다');
    }

    const academyDocRef = doc(db, 'academies', academyId);
    const academyDoc = await getDoc(academyDocRef);

    if (!academyDoc.exists()) {
      throw new Error('학원을 찾을 수 없습니다');
    }

    // ownerId와 createdAt은 수정 불가
    const { ownerId, createdAt, ...allowedUpdates } = updates;

    const updateData = {
      ...allowedUpdates,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(academyDocRef, updateData);

    return {
      success: true,
      message: '학원 정보가 수정되었습니다',
    };
  } catch (error) {
    console.error('Update academy error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * 학원 삭제
 * @param {string} academyId - 학원 ID
 * @returns {Promise<Object>} 삭제 결과
 */
export const deleteAcademy = async (academyId) => {
  try {
    if (!academyId) {
      throw new Error('학원 ID가 필요합니다');
    }

    const academyDocRef = doc(db, 'academies', academyId);
    const academyDoc = await getDoc(academyDocRef);

    if (!academyDoc.exists()) {
      throw new Error('학원을 찾을 수 없습니다');
    }

    await deleteDoc(academyDocRef);

    return {
      success: true,
      message: '학원이 삭제되었습니다',
    };
  } catch (error) {
    console.error('Delete academy error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * 학원 통계 조회 (향후 구현)
 * @param {string} academyId - 학원 ID
 * @returns {Promise<Object>} 학원 통계
 */
export const getAcademyStatistics = async (academyId) => {
  try {
    if (!academyId) {
      throw new Error('학원 ID가 필요합니다');
    }

    // TODO: 학생 수, 교재 수, 수업 수 등 통계 조회
    // 현재는 기본 구조만 제공

    return {
      success: true,
      data: {
        totalStudents: 0,
        totalMaterials: 0,
        totalClasses: 0,
      },
    };
  } catch (error) {
    console.error('Get academy statistics error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};
