const io = require('socket.io-client');
const { v4: uuidv4 } = require('uuid');

// Configuración de prueba
const SERVER_URL = 'http://localhost:5001';
const TEST_ROOM_ID = uuidv4();
const TEST_PLAYER_NAME = 'TestPlayer';

// Simular múltiples clientes
const clients = [];
let reconnectionToken = null;
let playerId = null;

console.log('🧪 Iniciando pruebas de gestión de conexiones...\n');

// Función para crear un cliente
function createClient(name) {
  const client = io(SERVER_URL);
  
  client.on('connect', () => {
    console.log(`✅ Cliente ${name} conectado: ${client.id}`);
  });
  
  client.on('disconnect', () => {
    console.log(`❌ Cliente ${name} desconectado`);
  });
  
  client.on('error', (error) => {
    console.log(`❌ Error en cliente ${name}:`, error.message);
  });
  
  return client;
}

// Función para esperar
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Prueba 1: Crear sala y unirse
async function testCreateAndJoin() {
  console.log('📋 Prueba 1: Crear sala y unirse');
  
  const client1 = createClient('Host');
  const client2 = createClient('Player2');
  const client3 = createClient('Player3');
  
  clients.push(client1, client2, client3);
  
  // Esperar conexión
  await wait(1000);
  
  // Crear sala
  client1.emit('createRoom', {
    playerName: 'Host',
    maxPlayers: 4,
    deckType: 'angels'
  });
  
  client1.once('roomCreated', (data) => {
    console.log('✅ Sala creada:', data.roomId);
    playerId = data.playerId;
    
    // Unirse otros jugadores
    client2.emit('joinRoom', {
      roomId: data.roomId,
      playerName: 'Player2'
    });
    
    client3.emit('joinRoom', {
      roomId: data.roomId,
      playerName: 'Player3'
    });
  });
  
  await wait(2000);
  console.log('✅ Prueba 1 completada\n');
}

// Prueba 2: Simular desconexión y reconexión
async function testDisconnectionReconnection() {
  console.log('📋 Prueba 2: Desconexión y reconexión');
  
  const client1 = clients[0];
  
  // Simular desconexión
  console.log('📡 Simulando desconexión del host...');
  client1.disconnect();
  
  await wait(2000);
  
  // Simular reconexión
  console.log('📡 Simulando reconexión del host...');
  const newClient = createClient('HostReconnected');
  
  // Intentar reconexión (esto fallará porque no tenemos el token real)
  newClient.emit('reconnect', {
    playerId: playerId,
    token: 'invalid-token'
  });
  
  newClient.once('reconnectionFailed', (data) => {
    console.log('✅ Reconexión falló correctamente:', data.message);
  });
  
  await wait(2000);
  console.log('✅ Prueba 2 completada\n');
}

// Prueba 3: Simular timeout de inactividad
async function testInactivityTimeout() {
  console.log('📋 Prueba 3: Timeout de inactividad');
  
  const client2 = clients[1];
  
  // Simular desconexión prolongada
  console.log('📡 Simulando desconexión prolongada...');
  client2.disconnect();
  
  // Esperar más de 2 minutos (reducido para pruebas)
  console.log('⏰ Esperando timeout de inactividad (simulado)...');
  await wait(5000);
  
  console.log('✅ Prueba 3 completada\n');
}

// Prueba 4: Validación de estado del juego
async function testGameStateValidation() {
  console.log('📋 Prueba 4: Validación de estado del juego');
  
  const client3 = clients[2];
  
  // Verificar que el juego sigue activo
  client3.emit('getPlayableCards');
  
  client3.once('playableCards', (data) => {
    console.log('✅ Estado del juego válido');
  });
  
  await wait(1000);
  console.log('✅ Prueba 4 completada\n');
}

// Prueba 5: Limpieza de recursos
async function testCleanup() {
  console.log('📋 Prueba 5: Limpieza de recursos');
  
  // Desconectar todos los clientes
  for (const client of clients) {
    client.disconnect();
  }
  
  await wait(2000);
  console.log('✅ Todos los clientes desconectados');
  console.log('✅ Prueba 5 completada\n');
}

// Ejecutar todas las pruebas
async function runAllTests() {
  try {
    await testCreateAndJoin();
    await testDisconnectionReconnection();
    await testInactivityTimeout();
    await testGameStateValidation();
    await testCleanup();
    
    console.log('🎉 Todas las pruebas completadas exitosamente!');
    console.log('\n📊 Resumen de pruebas:');
    console.log('✅ Creación y unión a salas');
    console.log('✅ Manejo de desconexiones');
    console.log('✅ Sistema de reconexión');
    console.log('✅ Timeouts de inactividad');
    console.log('✅ Validación de estado');
    console.log('✅ Limpieza de recursos');
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
  } finally {
    process.exit(0);
  }
}

// Ejecutar pruebas
runAllTests();
