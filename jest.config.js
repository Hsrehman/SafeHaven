import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  
  dir: './',
});


const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    
    '^@/(.*)$': '<rootDir>/$1',
  },
  
  testMatch: [
    '<rootDir>/__tests__/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/app/**/*.test.{js,jsx,ts,tsx}'
  ],
  
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    
    './app/utils/shelterMatching.js': {
      branches: 80,
      functions: 90,
      lines: 85,
      statements: 80
    }
  },
  
  watchPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/coverage/'
  ],
  
  testTimeout: 10000,
  
  transform: {
    '^.+\\.(js|jsx|ts|tsx|mjs)$': ['babel-jest', { presets: ['next/babel'] }]
  }
};

export default createJestConfig(customJestConfig); 