/** @type {import('ts-jest').JestConfigWithTsJest} */
const { resolve } = require('path');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  testRegex: [resolve(__dirname, '/src/__TESTS__/*/.*\\.test\\.ts$')],
  setupFiles: ['<rootDir>/src/__TESTS__/config/jest.setup.js'],
  coveragePathIgnorePatterns: [
    'node_modules',
    '<rootDir>/src/__TESTS__',
    '.mock.ts',
    '<rootDir>/src/logger.ts',
    '<rootDir>/src/arweave',
    '<rootDir>/src/bundlr',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/lib/', '/playground-browser/'],
  verbose: true,
};
