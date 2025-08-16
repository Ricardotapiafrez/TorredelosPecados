const io = require('socket.io-client');

console.log('🧪 Probando flujo completo del juego...\n');

// Crear dos clientes de socket
const client1 = io('http://localhost:5001');
const client2 = io('http://localhost:5001');

let roomId = null;
let player1Id = null;
let player2Id = null;

// Configurar eventos para cliente 1
client1.on('connect', () => {
  console.log('✅ Cliente 1 conectado');
  
  // Crear sala
  client1.emit('createRoom', { 
    playerName: 'Jugador 1', 
    maxPlayers: 4, 
    deckType: 'angels' 
  });
});

client1.on('roomCreated', (data) => {
  console.log('🏠 Sala creada por cliente 1');
  console.log(`  📋 Room ID: ${data.roomId}`);
  console.log(`  👤 Player ID: ${data.playerId}`);
  console.log(`  🎮 Estado: ${data.gameState.gameState}`);
  console.log(`  👥 Jugadores: ${data.gameState.players.length}`);
  
  roomId = data.roomId;
  player1Id = data.playerId;
  
  // Marcar cliente 1 como listo
  console.log('✅ Cliente 1 marcando como listo...');
  console.log('📤 Enviando setPlayerReady desde cliente 1...');
  client1.emit('setPlayerReady', { ready: true });
  
  // Cliente 2 se une
  client2.emit('joinRoom', { 
    roomId: roomId, 
    playerName: 'Jugador 2' 
  });
});

client1.on('playerJoined', (data) => {
  console.log('👥 Jugador se unió a la sala');
  console.log(`  👤 Nombre: ${data.player.name}`);
  console.log(`  🎮 Estado: ${data.player.isReady ? 'Listo' : 'No listo'}`);
});

client1.on('gameStateUpdate', (data) => {
  console.log('🔄 Estado del juego actualizado (cliente 1)');
  console.log(`  🎮 Estado: ${data.gameState}`);
  console.log(`  👥 Jugadores: ${data.players.length}`);
  
  const player = data.players.find(p => p.id === player1Id);
  if (player) {
    console.log(`  ✋ Cartas en mano: ${player.hand ? player.hand.length : 0}`);
    console.log(`  📋 Criaturas boca arriba: ${player.faceUpCreatures ? player.faceUpCreatures.length : 0}`);
    console.log(`  🃏 Criaturas boca abajo: ${player.faceDownCreatures ? player.faceDownCreatures.length : 0}`);
    console.log(`  💎 Pozo de almas: ${player.soulWell ? player.soulWell.length : 0}`);
  }
});

client1.on('allPlayersReady', () => {
  console.log('✅ Todos los jugadores están listos');
  
  // Iniciar juego
  client1.emit('startGame');
});

client1.on('gameStarted', (data) => {
  console.log('🎮 Juego iniciado (cliente 1)');
  console.log(`  🎯 Estado: ${data.gameState}`);
  console.log(`  👤 Jugador actual: ${data.currentPlayerId}`);
  
  const player = data.players.find(p => p.id === player1Id);
  if (player) {
    console.log(`  ✋ Cartas en mano: ${player.hand ? player.hand.length : 0}`);
    console.log(`  📋 Criaturas boca arriba: ${player.faceUpCreatures ? player.faceUpCreatures.length : 0}`);
    console.log(`  🃏 Criaturas boca abajo: ${player.faceDownCreatures ? player.faceDownCreatures.length : 0}`);
    console.log(`  💎 Pozo de almas: ${player.soulWell ? player.soulWell.length : 0}`);
    
    if (player.hand && player.hand.length > 0) {
      console.log(`  📝 Cartas en mano: ${player.hand.map(c => c.name).join(', ')}`);
    }
  }
  
  // Terminar prueba
  setTimeout(() => {
    console.log('\n🧪 Prueba completada');
    process.exit(0);
  }, 2000);
});

client1.on('error', (data) => {
  console.error('❌ Error en cliente 1:', data.message);
});

// Configurar eventos para cliente 2
client2.on('connect', () => {
  console.log('✅ Cliente 2 conectado');
});

client2.on('roomJoined', (data) => {
  console.log('🏠 Cliente 2 se unió a la sala');
  console.log(`  📋 Room ID: ${data.roomId}`);
  console.log(`  👤 Player ID: ${data.playerId}`);
  
  player2Id = data.playerId;
  
  // Marcar como listo después de un breve delay
  setTimeout(() => {
    console.log('✅ Cliente 2 marcando como listo...');
    console.log('📤 Enviando setPlayerReady desde cliente 2...');
    client2.emit('setPlayerReady', { ready: true });
  }, 500);
});

client2.on('gameStateUpdate', (data) => {
  console.log('🔄 Estado del juego actualizado (cliente 2)');
  console.log(`  🎮 Estado: ${data.gameState}`);
  
  const player = data.players.find(p => p.id === player2Id);
  if (player) {
    console.log(`  ✋ Cartas en mano: ${player.hand ? player.hand.length : 0}`);
    console.log(`  📋 Criaturas boca arriba: ${player.faceUpCreatures ? player.faceUpCreatures.length : 0}`);
    console.log(`  🃏 Criaturas boca abajo: ${player.faceDownCreatures ? player.faceDownCreatures.length : 0}`);
    console.log(`  💎 Pozo de almas: ${player.soulWell ? player.soulWell.length : 0}`);
  }
});

client2.on('allPlayersReady', () => {
  console.log('✅ Todos los jugadores están listos (cliente 2)');
});

client2.on('error', (data) => {
  console.error('❌ Error en cliente 2:', data.message);
});

// Manejar desconexión
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando conexiones...');
  client1.disconnect();
  client2.disconnect();
  process.exit(0);
});

// Timeout de seguridad
setTimeout(() => {
  console.log('⏰ Timeout de seguridad alcanzado');
  process.exit(1);
}, 10000);
