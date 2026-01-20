import { uuidv7 } from "uuidv7";

/**
 * UUID v7 생성 유틸리티
 * 데이터베이스에 사용될 모든 ID를 일관되게 생성
 */
export const generateId = (): string => {
  return uuidv7();
};
