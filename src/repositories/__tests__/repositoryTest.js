// src/repositories/__tests__/repositoryTest.js
// Repository 테스트 스크립트

import { StudentRepository, NoticeRepository, ActivityRepository } from '../index';

/**
 * Repository 기능 테스트
 * 이 파일을 실행하여 Repository가 제대로 작동하는지 확인할 수 있습니다.
 */

async function testStudentRepository() {
  console.log('\n========== StudentRepository 테스트 ==========\n');

  try {
    // 1. 전체 학생 조회
    console.log('1. 전체 학생 조회');
    const students = await StudentRepository.getAll();
    console.log(`✅ 학생 ${students.length}명 조회 성공`);

    // 2. 특정 학생 조회
    console.log('\n2. 특정 학생 조회 (ID: 1)');
    const student = await StudentRepository.getById('1');
    console.log(`✅ ${student.name} 학생 조회 성공`);

    // 3. 학생 검색
    console.log('\n3. 학생 검색 (검색어: 김)');
    const searchResults = await StudentRepository.search('김');
    console.log(`✅ ${searchResults.length}명 검색 성공`);

    // 4. 카테고리별 조회
    console.log('\n4. 카테고리별 조회 (초등)');
    const elementary = await StudentRepository.getByCategory('초등');
    console.log(`✅ 초등 학생 ${elementary.length}명 조회 성공`);

    // 5. 미납 학생 조회
    console.log('\n5. 미납 학생 조회');
    const unpaid = await StudentRepository.getUnpaidStudents();
    console.log(`✅ 미납 학생 ${unpaid.length}명 조회 성공`);

    console.log('\n✅ StudentRepository 테스트 완료!\n');
  } catch (error) {
    console.error('❌ StudentRepository 테스트 실패:', error.message);
  }
}

async function testNoticeRepository() {
  console.log('\n========== NoticeRepository 테스트 ==========\n');

  try {
    // 1. 전체 알림장 조회
    console.log('1. 전체 알림장 조회');
    const notices = await NoticeRepository.getAll();
    console.log(`✅ 알림장 ${notices.length}개 조회 성공`);

    // 2. 특정 알림장 조회
    console.log('\n2. 특정 알림장 조회 (ID: 1)');
    const notice = await NoticeRepository.getById('1');
    console.log(`✅ "${notice.title}" 조회 성공`);

    // 3. 최근 알림장 조회
    console.log('\n3. 최근 알림장 2개 조회');
    const recent = await NoticeRepository.getRecent(2);
    console.log(`✅ 최근 알림장 ${recent.length}개 조회 성공`);

    console.log('\n✅ NoticeRepository 테스트 완료!\n');
  } catch (error) {
    console.error('❌ NoticeRepository 테스트 실패:', error.message);
  }
}

async function testActivityRepository() {
  console.log('\n========== ActivityRepository 테스트 ==========\n');

  try {
    // 1. 전체 활동 조회
    console.log('1. 전체 활동 조회');
    const activities = await ActivityRepository.getAll();
    console.log(`✅ 활동 ${activities.length}개 조회 성공`);

    // 2. 최근 활동 조회
    console.log('\n2. 최근 활동 3개 조회');
    const recent = await ActivityRepository.getRecent(3);
    console.log(`✅ 최근 활동 ${recent.length}개 조회 성공`);

    // 3. 타입별 활동 조회
    console.log('\n3. 타입별 활동 조회 (출석)');
    const attendance = await ActivityRepository.getByType('attendance');
    console.log(`✅ 출석 활동 ${attendance.length}개 조회 성공`);

    console.log('\n✅ ActivityRepository 테스트 완료!\n');
  } catch (error) {
    console.error('❌ ActivityRepository 테스트 실패:', error.message);
  }
}

async function runAllTests() {
  console.log('\n🚀 Repository 테스트 시작...\n');
  console.log('📍 현재 모드: Mock 데이터 모드\n');

  await testStudentRepository();
  await testNoticeRepository();
  await testActivityRepository();

  console.log('\n🎉 모든 테스트 완료!\n');
}

// 테스트 실행
// runAllTests();

export { testStudentRepository, testNoticeRepository, testActivityRepository, runAllTests };
