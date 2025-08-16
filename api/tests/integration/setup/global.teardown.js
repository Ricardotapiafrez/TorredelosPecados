// Teardown global para tests de Socket.io

module.exports = async () => {
  console.log('🧹 Iniciando teardown global para tests de Socket.io...');
  
  // Limpiar todos los listeners
  process.removeAllListeners('unhandledRejection');
  process.removeAllListeners('uncaughtException');
  
  // Limpiar timers activos
  const activeHandles = process._getActiveHandles();
  for (const handle of activeHandles) {
    if (handle && typeof handle.unref === 'function') {
      handle.unref();
    }
    if (handle && typeof handle.destroy === 'function') {
      handle.destroy();
    }
    if (handle && typeof handle.close === 'function') {
      handle.close();
    }
  }
  
  // Forzar garbage collection si está disponible
  if (global.gc) {
    global.gc();
    console.log('🗑️ Garbage collection forzada');
  }
  
  // Esperar un poco para que se completen las operaciones pendientes
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Verificar que no hay conexiones pendientes
  const remainingHandles = process._getActiveHandles();
  const activeRequests = process._getActiveRequests();
  
  if (remainingHandles.length > 0) {
    console.log(`⚠️ Handles activos restantes: ${remainingHandles.length}`);
  }
  
  if (activeRequests.length > 0) {
    console.log(`⚠️ Requests activos restantes: ${activeRequests.length}`);
  }
  
  // Limpiar variables de entorno de test
  delete process.env.NODE_ENV;
  delete process.env.PORT;
  delete process.env.LOG_LEVEL;
  delete process.env.TEST_MODE;
  
  console.log('✅ Teardown global completado');
};
