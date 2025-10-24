// src/repositories/ProgressRepository.js
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
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

const COLLECTION_NAME = 'progress';

/**
 * ProgressRepository - 학생 진도 관리
 */
export const ProgressRepository = {
  /**
   * 학생의 모든 진도 조회
   */
  async getByStudentId(studentId) {
    try {
      console.log('[ProgressRepository.getByStudentId]', studentId);
      const q = query(
        collection(db, COLLECTION_NAME),
        where('studentId', '==', studentId),
        orderBy('updatedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);

      const progressList = [];
      querySnapshot.forEach((doc) => {
        progressList.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return progressList;
    } catch (error) {
      console.error('Error getting progress by student:', error);
      throw error;
    }
  },

  /**
   * 특정 교재의 진도 조회
   */
  async getByStudentAndBook(studentId, bookName) {
    try {
      console.log('[ProgressRepository.getByStudentAndBook]', studentId, bookName);
      const q = query(
        collection(db, COLLECTION_NAME),
        where('studentId', '==', studentId),
        where('book.name', '==', bookName)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      };
    } catch (error) {
      console.error('Error getting progress by book:', error);
      throw error;
    }
  },

  /**
   * 진도 생성
   */
  async create(progressData) {
    try {
      console.log('[ProgressRepository.create]', progressData);

      const now = Timestamp.now();
      const data = {
        ...progressData,
        stats: progressData.stats || {
          totalSongs: progressData.book?.totalSongs || 0,
          completedSongs: 0,
          inProgressSongs: 0,
          completionRate: 0,
          averageTimePerSong: 0,
        },
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), data);

      return {
        id: docRef.id,
        ...data,
      };
    } catch (error) {
      console.error('Error creating progress:', error);
      throw error;
    }
  },

  /**
   * 진도 업데이트
   */
  async update(id, updates) {
    try {
      console.log('[ProgressRepository.update]', id, updates);

      const docRef = doc(db, COLLECTION_NAME, id);
      const data = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(docRef, data);

      return {
        id,
        ...data,
      };
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  },

  /**
   * 곡 추가 또는 업데이트
   */
  async updateSong(progressId, songData) {
    try {
      console.log('[ProgressRepository.updateSong]', progressId, songData);

      const docRef = doc(db, COLLECTION_NAME, progressId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Progress not found');
      }

      const progress = docSnap.data();
      const songs = progress.songs || [];

      // 기존 곡 찾기
      const existingIndex = songs.findIndex(
        (s) => s.number === songData.number || s.title === songData.title
      );

      let updatedSongs;
      if (existingIndex >= 0) {
        // 기존 곡 업데이트
        updatedSongs = [...songs];
        updatedSongs[existingIndex] = {
          ...updatedSongs[existingIndex],
          ...songData,
        };
      } else {
        // 새 곡 추가
        updatedSongs = [
          ...songs,
          {
            ...songData,
            startDate: songData.startDate || new Date().toISOString().split('T')[0],
          },
        ];
      }

      // 통계 재계산
      const stats = this.calculateStats(updatedSongs, progress.book?.totalSongs || 0);

      await updateDoc(docRef, {
        songs: updatedSongs,
        stats,
        lastUpdatedBy: songData.updatedBy || 'manual',
        updatedAt: Timestamp.now(),
      });

      return {
        id: progressId,
        ...progress,
        songs: updatedSongs,
        stats,
      };
    } catch (error) {
      console.error('Error updating song:', error);
      throw error;
    }
  },

  /**
   * 통계 계산
   */
  calculateStats(songs, totalSongs) {
    const completedSongs = songs.filter((s) => s.status === 'completed').length;
    const inProgressSongs = songs.filter((s) => s.status === 'in_progress').length;
    const completionRate = totalSongs > 0 ? (completedSongs / totalSongs) * 100 : 0;

    // 평균 소요 시간 계산 (완료된 곡들의 평균)
    const completedWithDates = songs.filter(
      (s) => s.status === 'completed' && s.startDate && s.completedDate
    );

    let averageTimePerSong = 0;
    if (completedWithDates.length > 0) {
      const totalDays = completedWithDates.reduce((sum, song) => {
        const start = new Date(song.startDate);
        const end = new Date(song.completedDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0);

      averageTimePerSong = Math.round(totalDays / completedWithDates.length);
    }

    return {
      totalSongs,
      completedSongs,
      inProgressSongs,
      completionRate: Math.round(completionRate * 10) / 10,
      averageTimePerSong,
    };
  },

  /**
   * 진도 삭제
   */
  async delete(id) {
    try {
      console.log('[ProgressRepository.delete]', id);
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error('Error deleting progress:', error);
      throw error;
    }
  },

  /**
   * 모든 진도 조회 (관리자용)
   */
  async getAll() {
    try {
      console.log('[ProgressRepository.getAll]');
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy('updatedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);

      const progressList = [];
      querySnapshot.forEach((doc) => {
        progressList.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return progressList;
    } catch (error) {
      console.error('Error getting all progress:', error);
      throw error;
    }
  },
};