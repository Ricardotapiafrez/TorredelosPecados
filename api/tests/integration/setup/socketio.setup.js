// Setup específico para tests de Socket.io

// Configurar timeouts globales
jest.setTimeout(60000);

// Configurar logging para tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  // Redirigir logs durante tests para evitar ruido
  if (process.env.NODE_ENV === 'test') {
    console.log = jest.fn();
    console.error = jest.fn();
  }
});

afterAll(() => {
  // Restaurar logs originales
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

// Configurar manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Configurar limpieza de recursos
afterEach(async () => {
  // Limpiar cualquier timer pendiente
  jest.clearAllTimers();
  
  // Limpiar timeouts activos
  const activeHandles = process._getActiveHandles();
  for (const handle of activeHandles) {
    if (handle && typeof handle.unref === 'function') {
      handle.unref();
    }
  }
  
  // Esperar un poco para que se completen las operaciones asíncronas
  await new Promise(resolve => setTimeout(resolve, 200));
});

// Configurar variables de entorno para tests
process.env.NODE_ENV = 'test';
process.env.PORT = '0'; // Puerto aleatorio
process.env.LOG_LEVEL = 'error'; // Reducir logging durante tests

// Configurar timeouts más cortos para tests
process.env.TEST_MODE = 'true';
