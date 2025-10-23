import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * 지출 카테고리
 */
export const EXPENSE_CATEGORIES = {
  INSTRUMENT: '악기 유지보수',
  TEXTBOOK: '교재비',
  FACILITY: '시설비',
  UTILITY: '공과금',
  MARKETING: '마케팅비',
  SALARY: '인건비',
  OTHER: '기타',
};

/**
 * 지출 추가
 */
export const addExpense = async (expenseData) => {
  try {
    const docRef = await addDoc(collection(db, 'expenses'), {
      ...expenseData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return {
      success: true,
      id: docRef.id,
    };
  } catch (error) {
    console.error('지출 추가 실패:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * 지출 수정
 */
export const updateExpense = async (expenseId, updateData) => {
  try {
    const expenseRef = doc(db, 'expenses', expenseId);
    await updateDoc(expenseRef, {
      ...updateData,
      updatedAt: Timestamp.now(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('지출 수정 실패:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * 지출 삭제
 */
export const deleteExpense = async (expenseId) => {
  try {
    await deleteDoc(doc(db, 'expenses', expenseId));
    return {
      success: true,
    };
  } catch (error) {
    console.error('지출 삭제 실패:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * 특정 선생님의 지출 내역 조회
 */
export const getExpensesByTeacher = async (teacherId) => {
  try {
    const q = query(
      collection(db, 'expenses'),
      where('teacherId', '==', teacherId),
      orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const expenses = [];

    querySnapshot.forEach((doc) => {
      expenses.push({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate?.() || new Date(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
      });
    });

    return {
      success: true,
      data: expenses,
    };
  } catch (error) {
    console.error('지출 조회 실패:', error);
    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
};

/**
 * 월별 지출 통계
 */
export const getMonthlyExpenseStats = async (teacherId, year, month) => {
  try {
    // 해당 월의 시작과 끝
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const q = query(
      collection(db, 'expenses'),
      where('teacherId', '==', teacherId),
      where('date', '>=', Timestamp.fromDate(startDate)),
      where('date', '<=', Timestamp.fromDate(endDate))
    );

    const querySnapshot = await getDocs(q);
    const expenses = [];
    let totalAmount = 0;
    const categoryStats = {};

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      expenses.push({
        id: doc.id,
        ...data,
        date: data.date?.toDate?.() || new Date(),
      });

      totalAmount += data.amount || 0;

      // 카테고리별 합계
      const category = data.category || 'OTHER';
      if (!categoryStats[category]) {
        categoryStats[category] = 0;
      }
      categoryStats[category] += data.amount || 0;
    });

    return {
      success: true,
      data: {
        expenses,
        totalAmount,
        count: expenses.length,
        categoryStats,
      },
    };
  } catch (error) {
    console.error('월별 지출 통계 조회 실패:', error);
    return {
      success: false,
      error: error.message,
      data: {
        expenses: [],
        totalAmount: 0,
        count: 0,
        categoryStats: {},
      },
    };
  }
};
