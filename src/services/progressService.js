// src/services/progressService.js
import { ProgressRepository } from '../repositories/ProgressRepository';
import { getMaterials } from './firestoreService';

const GEMINI_API_KEY = 'AIzaSyDegfR6QuY0RkPYnEu-BXnzjKJl08UNHLc';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

/**
 * AI로 수업일지에서 진도 정보 추출
 */
export async function extractProgressFromLessonNote(lessonNoteContent) {
  try {
    console.log('[extractProgressFromLessonNote] 수업일지 분석 시작');

    const prompt = `
당신은 피아노 학원 진도 관리 전문가입니다.
수업일지 내용을 분석하여 학생이 배운 교재와 곡 정보를 추출해주세요.

<분석 규칙>
1. 교재명 인식: 바이엘, 체르니, 하농, 부르그뮐러, 소나타, 쇼팽, 리스트 등
2. 곡 번호/제목 추출: "바이엘 45번", "체르니 30-5번", "하농 1번" 등
3. 학습 상태 판단:
   - "completed": 완료했다, 끝냈다, 통과했다, 마스터했다 등
   - "started": 시작했다, 새로 배웠다, 도입했다 등
   - "in_progress": 연습 중, 계속 진행 중, 보완 중 등
4. 특이사항/메모 추출: 어려운 부분, 보완 필요 사항 등

<수업일지 내용>
${lessonNoteContent}

<응답 형식>
아래 JSON 형식으로만 응답해주세요. 다른 설명은 하지 마세요.
{
  "progressItems": [
    {
      "book": "교재명",
      "songNumber": "곡 번호",
      "songTitle": "전체 제목 (예: 바이엘 45번)",
      "status": "completed | started | in_progress",
      "notes": "특이사항 (선택사항)",
      "difficulty": "beginner | intermediate | advanced (선택사항)"
    }
  ]
}

진도 정보가 없으면 빈 배열을 반환하세요.
`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 20,
          topP: 0.8,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    console.log('[extractProgressFromLessonNote] AI 응답:', text);

    // JSON 추출 (마크다운 코드 블록 제거)
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    const result = JSON.parse(jsonText);

    console.log('[extractProgressFromLessonNote] 추출 결과:', result);

    return result.progressItems || [];
  } catch (error) {
    console.error('[extractProgressFromLessonNote] Error:', error);
    // AI 실패 시 빈 배열 반환 (앱이 멈추지 않도록)
    return [];
  }
}

/**
 * 교재 DB에서 교재 찾기 (fuzzy matching)
 * @param {string} bookName - AI가 추출한 교재명
 * @param {string} academyId - 학원 ID
 * @returns {Promise<Object|null>} 매칭된 교재 또는 null
 */
export async function findTextbookInDB(bookName, academyId) {
  try {
    const result = await getMaterials(academyId);
    if (!result.success || !result.data) {
      return null;
    }

    const materials = result.data;
    const normalizedBookName = bookName.toLowerCase().trim();

    // 1. 정확한 매칭
    let match = materials.find((m) => m.title.toLowerCase().trim() === normalizedBookName);
    if (match) return match;

    // 2. 부분 매칭 (교재명이 DB 타이틀에 포함되거나, DB 타이틀이 교재명에 포함)
    match = materials.find(
      (m) =>
        m.title.toLowerCase().includes(normalizedBookName) ||
        normalizedBookName.includes(m.title.toLowerCase())
    );
    if (match) return match;

    // 3. 키워드 매칭 (바이엘, 체르니, 하농 등)
    const keywords = ['바이엘', 'beyer', '체르니', 'czerny', '하농', 'hanon', '부르그뮐러', 'burgmuller', '소나타', 'sonata'];
    for (const keyword of keywords) {
      if (normalizedBookName.includes(keyword)) {
        match = materials.find((m) => m.title.toLowerCase().includes(keyword));
        if (match) return match;
      }
    }

    return null;
  } catch (error) {
    console.error('[findTextbookInDB] Error:', error);
    return null;
  }
}

/**
 * 수업일지 저장 시 자동으로 진도 업데이트
 * @returns {Object} { updatedItems, unknownTextbooks }
 */
export async function updateProgressFromLessonNote(studentId, studentName, lessonNoteId, lessonNoteContent, academyId) {
  try {
    console.log('[updateProgressFromLessonNote] 진도 자동 업데이트 시작');

    // AI로 진도 추출
    const progressItems = await extractProgressFromLessonNote(lessonNoteContent);

    if (progressItems.length === 0) {
      console.log('[updateProgressFromLessonNote] 추출된 진도 정보 없음');
      return { updatedItems: [], unknownTextbooks: [] };
    }

    const today = new Date().toISOString().split('T')[0];
    const updatedItems = [];
    const unknownTextbooks = [];

    // 각 진도 항목 처리
    for (const item of progressItems) {
      // 교재 DB에서 교재 찾기
      const materialInDB = await findTextbookInDB(item.book, academyId);

      if (!materialInDB) {
        // DB에 없는 교재면 unknownTextbooks에 추가
        if (!unknownTextbooks.find((t) => t.name === item.book)) {
          unknownTextbooks.push({
            name: item.book,
            suggestedCategory: getCategoryFromBookName(item.book),
            suggestedTotalSongs: getDefaultTotalSongs(item.book),
          });
        }
        // 이 교재는 건너뛰기 (사용자가 추가한 후 처리)
        continue;
      }

      // DB에 있는 교재인 경우 진도 업데이트
      // 해당 교재의 진도 조회
      let progress = await ProgressRepository.getByStudentAndBook(studentId, materialInDB.title);

      // 진도가 없으면 새로 생성
      if (!progress) {
        progress = await ProgressRepository.create({
          studentId,
          studentName,
          book: {
            name: materialInDB.title,
            category: materialInDB.category,
            totalSongs: materialInDB.totalSongs || getDefaultTotalSongs(materialInDB.title), // DB의 totalSongs 우선 사용
            materialId: materialInDB.id,
            publisher: materialInDB.publisher,
            level: materialInDB.level,
          },
          status: 'in_progress',
          startDate: today,
          songs: [],
        });
        console.log(`[updateProgressFromLessonNote] 새 진도 생성 완료: ${materialInDB.title}`);
      }

      // 곡 상태 매핑
      const songStatus = item.status === 'started' ? 'in_progress' : item.status;

      // 곡 정보 준비
      const songData = {
        number: item.songNumber,
        title: item.songTitle || `${materialInDB.title} ${item.songNumber}`,
        status: songStatus,
        difficulty: item.difficulty || 'intermediate',
        notes: item.notes || '',
        lessonNoteIds: [lessonNoteId],
      };

      // 완료 상태면 완료 날짜 추가
      if (songStatus === 'completed') {
        songData.completedDate = today;
      }

      // 시작/진행 상태면 시작 날짜 설정
      if (songStatus === 'in_progress' && !songData.startDate) {
        songData.startDate = today;
      }

      songData.updatedBy = 'ai';

      // 곡 업데이트
      await ProgressRepository.updateSong(progress.id, songData);

      updatedItems.push(item);
      console.log(`[updateProgressFromLessonNote] 진도 업데이트 완료: ${materialInDB.title} ${item.songNumber}`);
    }

    console.log('[updateProgressFromLessonNote] 모든 진도 업데이트 완료');
    return { updatedItems, unknownTextbooks };
  } catch (error) {
    console.error('[updateProgressFromLessonNote] Error:', error);
    throw error;
  }
}

/**
 * 교재명으로 카테고리 추론
 */
function getCategoryFromBookName(bookName) {
  const name = bookName.toLowerCase();

  if (name.includes('바이엘') || name.includes('beyer')) {
    return 'technique';
  }
  if (name.includes('체르니') || name.includes('czerny')) {
    return 'etude';
  }
  if (name.includes('하농') || name.includes('hanon')) {
    return 'technique';
  }
  if (name.includes('부르그뮐러') || name.includes('burgmuller')) {
    return 'piece';
  }
  if (name.includes('소나타') || name.includes('sonata')) {
    return 'piece';
  }
  if (name.includes('쇼팽') || name.includes('chopin')) {
    return 'piece';
  }

  return 'other';
}

/**
 * 교재명으로 기본 총 곡 수 추론
 */
function getDefaultTotalSongs(bookName) {
  const name = bookName.toLowerCase();

  if (name.includes('바이엘')) return 106;
  if (name.includes('체르니 30')) return 30;
  if (name.includes('체르니 40')) return 40;
  if (name.includes('체르니 50')) return 50;
  if (name.includes('체르니 100')) return 100;
  if (name.includes('하농')) return 60;
  if (name.includes('부르그뮐러')) return 25;

  // 기본값
  return 50;
}

/**
 * 학생의 전체 진도 조회
 */
export async function getStudentProgress(studentId) {
  try {
    return await ProgressRepository.getByStudentId(studentId);
  } catch (error) {
    console.error('[getStudentProgress] Error:', error);
    throw error;
  }
}

/**
 * 학생의 진도 통계 계산
 */
export function calculateProgressStats(progressList) {
  if (!progressList || progressList.length === 0) {
    return {
      totalBooks: 0,
      completedBooks: 0,
      inProgressBooks: 0,
      totalSongs: 0,
      completedSongs: 0,
      averageCompletionRate: 0,
    };
  }

  const totalBooks = progressList.length;
  const completedBooks = progressList.filter((p) => p.status === 'completed').length;
  const inProgressBooks = progressList.filter((p) => p.status === 'in_progress').length;

  const totalSongs = progressList.reduce((sum, p) => sum + (p.stats?.totalSongs || 0), 0);
  const completedSongs = progressList.reduce((sum, p) => sum + (p.stats?.completedSongs || 0), 0);

  const averageCompletionRate =
    progressList.reduce((sum, p) => sum + (p.stats?.completionRate || 0), 0) / totalBooks;

  return {
    totalBooks,
    completedBooks,
    inProgressBooks,
    totalSongs,
    completedSongs,
    averageCompletionRate: Math.round(averageCompletionRate * 10) / 10,
  };
}

/**
 * 월별 진도 데이터 집계 (차트용)
 * @param {Array} progressList - 진도 목록
 * @param {number} months - 조회할 개월 수 (기본 6개월)
 * @returns {Object} { labels: string[], data: number[] }
 */
export function getMonthlyProgressData(progressList, months = 6) {
  if (!progressList || progressList.length === 0) {
    return { labels: [], data: [] };
  }

  // 최근 N개월 생성
  const monthlyData = [];
  const today = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = `${date.getMonth() + 1}월`;

    monthlyData.push({
      key: monthKey,
      label: monthLabel,
      count: 0,
    });
  }

  // 모든 진도의 곡들을 순회하며 완료일 기준으로 집계
  progressList.forEach((progress) => {
    if (!progress.songs || progress.songs.length === 0) return;

    progress.songs.forEach((song) => {
      // 완료된 곡만 집계
      if (song.status === 'completed' && song.completedDate) {
        const completedDate = new Date(song.completedDate);
        const songMonthKey = `${completedDate.getFullYear()}-${String(completedDate.getMonth() + 1).padStart(2, '0')}`;

        // 해당 월 찾기
        const monthIndex = monthlyData.findIndex((m) => m.key === songMonthKey);
        if (monthIndex !== -1) {
          monthlyData[monthIndex].count += 1;
        }
      }
    });
  });

  return {
    labels: monthlyData.map((m) => m.label),
    data: monthlyData.map((m) => m.count),
  };
}
