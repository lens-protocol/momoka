/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  setupFiles: ['<rootDir>/jest.setup.js'],
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
  testRegex: 'mirror.e2e.test.ts$',
};
