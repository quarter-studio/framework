module.exports = {
  globals: {},
  watchPathIgnorePatterns: ['/node_modules/', '/dist/', '/.git/'],
  moduleFileExtensions: ['js', 'json'],
  moduleNameMapper: {
    '^@quarter/(.*?)$': '<rootDir>/packages/$1',
  },
  rootDir: __dirname,
  testMatch: ['<rootDir>/packages/**/__tests__/**/*spec.js'],
  testPathIgnorePatterns: ['/node_modules/'],
}
