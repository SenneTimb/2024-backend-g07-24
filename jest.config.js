/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

/** @type {import('jest').Config} */
const config = {
  coverageProvider: 'v8',
  testMatch: [
    '**/__tests__/**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  verbose: true,
  collectCoverageFrom: [
    './src/repository/**/*.js',
    './src/service/**/*.js',
    './src/routes/**/*.js',
  ],
  coverageDirectory: '__tests__/coverage',
  globalSetup: './__tests__/global.setup.js',
  globalTeardown: './__tests__/global.teardown.js',
};

module.exports = config;
