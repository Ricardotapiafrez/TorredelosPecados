// Setup global para tests de Socket.io

module.exports = async () => {
  console.log('🚀 Iniciando setup global para tests de Socket.io...');
  
  // Configurar variables de entorno
  process.env.NODE_ENV = 'test';
  process.env.PORT = '0';
  process.env.LOG_LEVEL = 'error';
  process.env.TEST_MODE = 'true';
  
  // Configurar manejo de errores no capturados
  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  });
  
  process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
  });
  
  // Verificar que las dependencias estén disponibles
  try {
    require('socket.io');
    require('socket.io-client');
    console.log('✅ Dependencias de Socket.io verificadas');
  } catch (error) {
    console.error('❌ Error al verificar dependencias:', error.message);
    throw error;
  }
  
  // Limpiar cualquier proceso pendiente
  const cleanup = () => {
    // Limpiar listeners
    process.removeAllListeners('unhandledRejection');
    process.removeAllListeners('uncaughtException');
  };
  
  // Registrar cleanup para ejecutarse al final
  process.on('exit', cleanup);
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  
  console.log('✅ Setup global completado');
};
