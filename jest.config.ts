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
};
