/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: 'tsconfig.json',
      },
    ],
  },
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^\.\./src/db/client\.js$': '<rootDir>/tests/__mocks__/dbClientMock.ts',
    '^\.\./src/modules/auth/auth\\.routes\\.js$': '<rootDir>/tests/__mocks__/emptyAuth.ts',
    '^\.\./src/modules/users/users\\.routes\\.js$': '<rootDir>/tests/__mocks__/emptyUsers.ts',
    '^\.\./src/modules/cart/cart\\.routes\\.js$': '<rootDir>/tests/__mocks__/emptyCart.ts',
    '^\.\./src/modules/orders/orders\\.routes\\.js$': '<rootDir>/tests/__mocks__/emptyOrders.ts',
  },
  setupFiles: ['<rootDir>/tests/test.setup.ts'],
  verbose: true,
};
