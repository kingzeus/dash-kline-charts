module.exports = {
  testEnvironment: 'jsdom',
    moduleFileExtensions: ['js', 'jsx'],
    transform: {
    '^.+\\.(js|jsx)$': ['babel-jest']
  },
  testMatch: [
      '<rootDir>/src/**/*.test.(js|jsx)',
      '<rootDir>/src/**/*.spec.(js|jsx)',
      '<rootDir>/tests/*.test.(js|jsx)',
      '<rootDir>/tests/*.spec.(js|jsx)'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
      'src/**/*.{js,jsx}',
      '!src/index.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
};