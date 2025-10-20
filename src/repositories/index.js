// src/repositories/index.js
// Repository 중앙 Export

export { StudentRepository } from './StudentRepository';
export { NoticeRepository } from './NoticeRepository';
export { ActivityRepository } from './ActivityRepository';
export { ParentDataRepository } from './ParentDataRepository';

/**
 * 사용 예시:
 *
 * import { StudentRepository, NoticeRepository } from '../repositories';
 *
 * const students = await StudentRepository.getAll();
 * const notices = await NoticeRepository.getAll();
 */
