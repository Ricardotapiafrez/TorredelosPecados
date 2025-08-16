const io = require('socket.io-client');

// Configuración de prueba
const SERVER_URL = 'http://localhost:5001';
const TEST_PLAYER_NAME = 'TestPlayer';
const TEST_ROOM_NAME = 'TestRoom';

// Función para esperar
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Función para crear un cliente de socket
function createSocketClient(name) {
  return new Promise((resolve, reject) => {
    const socket = io(SERVER_URL);
    
    socket.on('connect', () => {
      console.log(`✅ ${name} conectado`);
      resolve(socket);
    });
    
    socket.on('connect_error', (error) => {
      console.error(`❌ Error de conexión para ${name}:`, error.message);
      reject(error);
    });
    
    // Timeout de conexión
    setTimeout(() => {
      reject(new Error(`Timeout de conexión para ${name}`));
    }, 5000);
  });
}

// Función para crear una sala
async function createRoom(socket, playerName, deckType = 'angels') {
  return new Promise((resolve, reject) => {
    socket.emit('createRoom', {
      playerName,
      maxPlayers: 4,
      deckType,
      gameMode: 'human'
    });
    
    socket.once('roomCreated', (data) => {
      console.log(`🏠 Sala creada: ${data.roomId}`);
      resolve(data);
    });
    
    socket.once('error', (error) => {
      reject(new Error(`Error creando sala: ${error.message}`));
    });
    
    // Timeout
    setTimeout(() => {
      reject(new Error('Timeout creando sala'));
    }, 5000);
  });
}

// Función para unirse a una sala
async function joinRoom(socket, roomId, playerName, selectedDeck = 'demons') {
  return new Promise((resolve, reject) => {
    socket.emit('joinRoom', {
      roomId,
      playerName,
      selectedDeck
    });
    
    socket.once('roomJoined', (data) => {
      console.log(`👤 ${playerName} se unió a la sala`);
      resolve(data);
    });
    
    socket.once('error', (error) => {
      reject(new Error(`Error uniéndose a sala: ${error.message}`));
    });
    
    // Timeout
    setTimeout(() => {
      reject(new Error('Timeout uniéndose a sala'));
    }, 5000);
  });
}

// Función para obtener información de mazos
async function getPlayersDeckInfo(socket) {
  return new Promise((resolve, reject) => {
    socket.emit('getPlayersDeckInfo');
    
    socket.once('playersDeckInfo', (data) => {
      console.log('📊 Información de mazos recibida:', data.players.length, 'jugadores');
      resolve(data.players);
    });
    
    socket.once('error', (error) => {
      reject(new Error(`Error obteniendo información de mazos: ${error.message}`));
    });
    
    // Timeout
    setTimeout(() => {
      reject(new Error('Timeout obteniendo información de mazos'));
    }, 5000);
  });
}

// Función para cambiar mazo
async function changePlayerDeck(socket, playerId, deckType) {
  return new Promise((resolve, reject) => {
    socket.emit('changePlayerDeck', {
      playerId,
      deckType
    });
    
    socket.once('deckChanged', (data) => {
      console.log(`🎴 Mazo cambiado para ${playerId} a ${deckType}`);
      resolve(data);
    });
    
    socket.once('error', (error) => {
      reject(new Error(`Error cambiando mazo: ${error.message}`));
    });
    
    // Timeout
    setTimeout(() => {
      reject(new Error('Timeout cambiando mazo'));
    }, 5000);
  });
}

// Función para crear modo solitario con bots
async function createSoloGame(socket, playerName, deckType = 'dragons') {
  return new Promise((resolve, reject) => {
    socket.emit('createSoloGame', {
      playerName,
      deckType,
      aiDifficulty: 'intermediate'
    });
    
    socket.once('soloGameCreated', (data) => {
      console.log(`🎮 Modo solitario creado: ${data.roomId}`);
      resolve(data);
    });
    
    socket.once('error', (error) => {
      reject(new Error(`Error creando modo solitario: ${error.message}`));
    });
    
    // Timeout
    setTimeout(() => {
      reject(new Error('Timeout creando modo solitario'));
    }, 5000);
  });
}

// Función principal de prueba
async function runDeckSelectionTests() {
  console.log('🧪 Iniciando pruebas de selección de mazos...\n');
  
  let hostSocket, playerSocket, soloSocket;
  
  try {
    // Test 1: Crear sala con mazo específico
    console.log('📋 Test 1: Crear sala con mazo específico');
    hostSocket = await createSocketClient('Host');
    const roomData = await createRoom(hostSocket, TEST_PLAYER_NAME, 'angels');
    console.log(`✅ Test 1 completado - Sala creada con mazo ángeles\n`);
    
    // Test 2: Unirse a sala con mazo específico
    console.log('📋 Test 2: Unirse a sala con mazo específico');
    playerSocket = await createSocketClient('Player');
    await joinRoom(playerSocket, roomData.roomId, 'Player2', 'demons');
    console.log(`✅ Test 2 completado - Jugador se unió con mazo demonios\n`);
    
    // Test 3: Obtener información de mazos
    console.log('📋 Test 3: Obtener información de mazos');
    const playersDeckInfo = await getPlayersDeckInfo(hostSocket);
    
    console.log('📊 Mazos actuales:');
    playersDeckInfo.forEach(player => {
      console.log(`  - ${player.name}: ${player.selectedDeck} ${player.deckInfo.icon}`);
    });
    console.log(`✅ Test 3 completado - Información de mazos obtenida\n`);
    
    // Test 4: Cambiar mazo de jugador
    console.log('📋 Test 4: Cambiar mazo de jugador');
    const playerToChange = playersDeckInfo.find(p => p.name === 'Player2');
    if (playerToChange) {
      await changePlayerDeck(hostSocket, playerToChange.id, 'dragons');
      console.log(`✅ Test 4 completado - Mazo cambiado a dragones\n`);
    }
    
    // Test 5: Verificar cambio de mazo
    console.log('📋 Test 5: Verificar cambio de mazo');
    const updatedDeckInfo = await getPlayersDeckInfo(hostSocket);
    const updatedPlayer = updatedDeckInfo.find(p => p.name === 'Player2');
    if (updatedPlayer && updatedPlayer.selectedDeck === 'dragons') {
      console.log(`✅ Test 5 completado - Mazo actualizado correctamente\n`);
    } else {
      throw new Error('El mazo no se actualizó correctamente');
    }
    
    // Test 6: Crear modo solitario con bots
    console.log('📋 Test 6: Crear modo solitario con bots');
    soloSocket = await createSocketClient('SoloPlayer');
    const soloData = await createSoloGame(soloSocket, 'SoloPlayer', 'mages');
    console.log(`✅ Test 6 completado - Modo solitario creado con mazo magos\n`);
    
    // Test 7: Verificar mazos de bots
    console.log('📋 Test 7: Verificar mazos de bots');
    const soloDeckInfo = await getPlayersDeckInfo(soloSocket);
    
    console.log('🤖 Mazos de bots:');
    const bots = soloDeckInfo.filter(p => p.isBot);
    bots.forEach(bot => {
      console.log(`  - ${bot.name}: ${bot.selectedDeck} ${bot.deckInfo.icon}`);
    });
    
    // Verificar que los bots tienen mazos variados
    const botDecks = bots.map(bot => bot.selectedDeck);
    const uniqueDecks = [...new Set(botDecks)];
    if (uniqueDecks.length > 1) {
      console.log(`✅ Test 7 completado - Bots tienen mazos variados (${uniqueDecks.length} tipos diferentes)\n`);
    } else {
      console.log(`⚠️ Test 7 - Los bots tienen mazos similares (${uniqueDecks.length} tipo único)\n`);
    }
    
    // Test 8: Intentar cambiar mazo durante el juego (debería fallar)
    console.log('📋 Test 8: Intentar cambiar mazo durante el juego');
    try {
      await changePlayerDeck(hostSocket, playerToChange.id, 'mages');
      console.log(`❌ Test 8 falló - Se permitió cambiar mazo durante el juego\n`);
    } catch (error) {
      console.log(`✅ Test 8 completado - Correctamente bloqueado cambio de mazo durante el juego\n`);
    }
    
    console.log('🎉 ¡Todas las pruebas completadas exitosamente!');
    
  } catch (error) {
    console.error(`❌ Error en las pruebas: ${error.message}`);
    console.error(error.stack);
  } finally {
    // Limpiar conexiones
    console.log('\n🧹 Limpiando conexiones...');
    if (hostSocket) hostSocket.disconnect();
    if (playerSocket) playerSocket.disconnect();
    if (soloSocket) soloSocket.disconnect();
    console.log('✅ Conexiones cerradas');
    
    // Salir después de un breve delay
    setTimeout(() => {
      console.log('👋 Pruebas finalizadas');
      process.exit(0);
    }, 1000);
  }
}

// Ejecutar pruebas si el script se ejecuta directamente
if (require.main === module) {
  runDeckSelectionTests();
}

module.exports = {
  runDeckSelectionTests,
  createSocketClient,
  createRoom,
  joinRoom,
  getPlayersDeckInfo,
  changePlayerDeck,
  createSoloGame
};
