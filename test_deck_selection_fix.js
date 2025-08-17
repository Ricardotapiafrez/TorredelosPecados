const io = require('socket.io-client');

// Función para crear un cliente de socket
function createSocketClient(name) {
  return new Promise((resolve, reject) => {
    const socket = io('http://localhost:5001', {
      timeout: 5000
    });

    socket.on('connect', () => {
      console.log(`✅ ${name} conectado`);
      resolve(socket);
    });

    socket.on('connect_error', (error) => {
      console.error(`❌ Error de conexión para ${name}:`, error.message);
      reject(error);
    });

    // Timeout
    setTimeout(() => {
      reject(new Error(`Timeout de conexión para ${name}`));
    }, 5000);
  });
}

// Función para crear una sala
async function createRoom(socket, playerName, deckType = 'demons') {
  return new Promise((resolve, reject) => {
    socket.emit('createRoom', {
      playerName,
      maxPlayers: 4,
      deckType,
      gameMode: 'human'
    });
    
    socket.once('roomCreated', (data) => {
      console.log(`🏠 Sala creada: ${data.roomId} con mazo ${deckType}`);
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
async function joinRoom(socket, roomId, playerName, selectedDeck = 'dragons') {
  return new Promise((resolve, reject) => {
    socket.emit('joinRoom', {
      roomId,
      playerName,
      selectedDeck
    });
    
    socket.once('roomJoined', (data) => {
      console.log(`👤 ${playerName} se unió a la sala con mazo ${selectedDeck}`);
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
      console.log('📋 Información de mazos recibida:', data.players);
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

// Función para cambiar mazo de un jugador
async function changePlayerDeck(socket, playerId, deckType) {
  return new Promise((resolve, reject) => {
    socket.emit('changePlayerDeck', {
      playerId,
      deckType
    });
    
    socket.once('deckChanged', (data) => {
      console.log(`🎴 Mazo cambiado para ${data.playerId}: ${data.deckType}`);
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

// Función principal de prueba
async function testDeckSelection() {
  console.log('🧪 Iniciando prueba de selección de mazos...\n');
  
  try {
    // Crear cliente host
    const hostSocket = await createSocketClient('Host');
    
    // Crear sala con mazo de demonios
    const roomData = await createRoom(hostSocket, 'Host', 'demons');
    
    // Obtener información inicial de mazos
    console.log('\n📋 Obteniendo información inicial de mazos...');
    const initialDeckInfo = await getPlayersDeckInfo(hostSocket);
    
    // Verificar que el host tenga el mazo correcto
    const hostPlayer = initialDeckInfo.find(p => p.name === 'Host');
    if (hostPlayer && hostPlayer.selectedDeck === 'demons') {
      console.log('✅ Host tiene el mazo correcto: demons');
    } else {
      console.log('❌ Host no tiene el mazo correcto');
    }
    
    // Crear segundo jugador
    const player2Socket = await createSocketClient('Player2');
    
    // Unirse a la sala con mazo de dragones
    await joinRoom(player2Socket, roomData.roomId, 'Player2', 'dragons');
    
    // Obtener información actualizada de mazos
    console.log('\n📋 Obteniendo información actualizada de mazos...');
    const updatedDeckInfo = await getPlayersDeckInfo(hostSocket);
    
    // Verificar que ambos jugadores tengan mazos diferentes
    const player2 = updatedDeckInfo.find(p => p.name === 'Player2');
    if (player2 && player2.selectedDeck === 'dragons') {
      console.log('✅ Player2 tiene el mazo correcto: dragons');
    } else {
      console.log('❌ Player2 no tiene el mazo correcto');
    }
    
    // Cambiar mazo del host a ángeles
    console.log('\n🎴 Cambiando mazo del host a ángeles...');
    await changePlayerDeck(hostSocket, hostPlayer.id, 'angels');
    
    // Obtener información final de mazos
    console.log('\n📋 Obteniendo información final de mazos...');
    const finalDeckInfo = await getPlayersDeckInfo(hostSocket);
    
    // Verificar el cambio
    const updatedHost = finalDeckInfo.find(p => p.name === 'Host');
    if (updatedHost && updatedHost.selectedDeck === 'angels') {
      console.log('✅ Host cambió exitosamente a mazo de ángeles');
    } else {
      console.log('❌ Host no pudo cambiar a mazo de ángeles');
    }
    
    // Probar con mazos adicionales
    console.log('\n🎴 Probando con mazos adicionales...');
    
    // Cambiar a mazo de enanos
    await changePlayerDeck(hostSocket, hostPlayer.id, 'dwarves');
    console.log('✅ Cambio a mazo de enanos exitoso');
    
    // Cambiar a mazo de elfos
    await changePlayerDeck(hostSocket, hostPlayer.id, 'elves');
    console.log('✅ Cambio a mazo de elfos exitoso');
    
    // Cambiar a mazo de elfos oscuros
    await changePlayerDeck(hostSocket, hostPlayer.id, 'dark_elves');
    console.log('✅ Cambio a mazo de elfos oscuros exitoso');
    
    // Cambiar a mazo de orcos
    await changePlayerDeck(hostSocket, hostPlayer.id, 'orcs');
    console.log('✅ Cambio a mazo de orcos exitoso');
    
    console.log('\n🎉 ¡Todas las pruebas de selección de mazos pasaron exitosamente!');
    
    // Cerrar conexiones
    hostSocket.close();
    player2Socket.close();
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

// Ejecutar la prueba
testDeckSelection();
