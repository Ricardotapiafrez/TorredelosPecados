module.exports = {
  // Configuración específica para tests de Socket.io
  testEnvironment: 'node',
  
  // Timeouts más largos para tests de integración
  testTimeout: 60000,
  
  // Configuración de memoria para tests de rendimiento
  maxWorkers: 1, // Ejecutar tests secuencialmente para evitar conflictos de puertos
  
  // Patrones de archivos a incluir
  testMatch: [
    '<rootDir>/tests/integration/socketIoBasic.test.js'
  ],
  
  // Directorios a ignorar
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/'
  ],
  
  // Configuración de coverage
  collectCoverage: true,
  collectCoverageFrom: [
    'src/services/GameService.js',
    'src/services/ChatService.js',
    'src/services/ValidationService.js',
    'src/services/DeckConfigurationService.js'
  ],
  
  // Configuración de reportes
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage/socketio',
  
  // Configuración de setup y teardown
  setupFilesAfterEnv: ['<rootDir>/tests/integration/setup/socketio.setup.js'],
  
  // Configuración de logging
  verbose: true,
  silent: false,
  
  // Configuración de puertos
  testEnvironmentOptions: {
    port: 0 // Usar puerto aleatorio para evitar conflictos
  },
  
  // Configuración de hooks
  globalSetup: '<rootDir>/tests/integration/setup/global.setup.js',
  globalTeardown: '<rootDir>/tests/integration/setup/global.teardown.js',
  
  // Configuración de transformaciones
  transform: {},
  
  // Configuración de módulos
  moduleFileExtensions: ['js', 'json'],
  
  // Configuración de paths
  moduleDirectories: ['node_modules', 'src'],
  
  // Configuración de cache
  cache: true,
  cacheDirectory: '.jest-cache',
  
  // Configuración de clearMocks
  clearMocks: true,
  
  // Configuración de restoreMocks
  restoreMocks: true,
  
  // Configuración para detectar handles abiertos
  detectOpenHandles: true,
  
  // Configuración de forceExit para forzar la salida
  forceExit: true
};
