module.exports = {
  // Directorio raíz de los tests
  testEnvironment: 'node',
  
  // Directorios donde buscar tests
  testMatch: [
    '**/tests/**/*.test.js',
    '**/__tests__/**/*.js'
  ],
  
  // Directorios a ignorar
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/'
  ],
  
  // Cobertura de código
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/index.js',
    '!src/**/main.js'
  ],
  
  // Directorio de reportes de cobertura
  coverageDirectory: 'coverage',
  
  // Tipos de reportes de cobertura
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json'
  ],
  
  // Umbrales de cobertura
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Configuración de mocks
  setupFilesAfterEnv: [],
  
  // Timeout para tests
  testTimeout: 10000,
  
  // Verbosidad
  verbose: true,
  
  // Configuración de transformaciones
  transform: {},
  
  // Configuración de módulos
  moduleFileExtensions: ['js', 'json'],
  
  // Configuración de paths
  moduleDirectories: ['node_modules', 'src'],
  
  // Configuración de alias
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  
  // Configuración de globals
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  },
  
  // Configuración de watch
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/'
  ],
  
  // Configuración de notificaciones
  notify: true,
  notifyMode: 'always',
  
  // Configuración de bail
  bail: false,
  
  // Configuración de maxWorkers
  maxWorkers: '50%',
  
  // Configuración de cache
  cache: true,
  cacheDirectory: '.jest-cache',
  
  // Configuración de clearMocks
  clearMocks: true,
  
  // Configuración de restoreMocks
  restoreMocks: true,
  
  // Configuración de resetMocks
  resetMocks: false,
  
  // Configuración de setupFiles
  setupFiles: [],
  
  // Configuración de testEnvironmentOptions
  testEnvironmentOptions: {},
  
  // Configuración de transformIgnorePatterns
  transformIgnorePatterns: [
    '/node_modules/'
  ],
  
  // Configuración de unmockedModulePathPatterns
  unmockedModulePathPatterns: [],
  
  // Configuración de watchPlugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ]
};
