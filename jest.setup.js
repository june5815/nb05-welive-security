// Jest 전역 설정 파일 - 모든 테스트 실행 전에 로드됨

// Jest 테스트 타임아웃 설정
jest.setTimeout(10000);

// 전역 에러 핸들링
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});
