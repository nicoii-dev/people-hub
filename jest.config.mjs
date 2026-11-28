/** @type {import('jest').Config} */
const config = {
  testEnvironment: "jsdom",
  roots: ["<rootDir>/src"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          target: "ES2020",
          module: "CommonJS",
          moduleResolution: "Node",
          esModuleInterop: true,
          isolatedModules: true,
          strict: true,
          skipLibCheck: true,
          types: ["jest", "node"],
        },
      },
    ],
  },
  testMatch: ["**/__tests__/**/*.test.ts", "**/*.test.ts"],
  clearMocks: true,
  restoreMocks: true,
};

export default config;
