export default {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"],
  testPathIgnorePatterns: ["/node_modules/", "\\.skip\\.ts$", "\\.bak\\.ts$"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.test.ts",
    "!src/**/*.skip.ts",
    "!src/**/*.bak.ts",
  ],
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
  testTimeout: 10000,
  bail: false,
  maxWorkers: 1,
  // SSE 및 비동기 작업 정리를 위한 설정
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};
