const io = require('socket.io-client');

console.log('🤖 Probando modo bot...\n');

// Crear cliente de socket
const client = io('http://localhost:5001');

let roomId = null;
let playerId = null;

// Configurar eventos para cliente
client.on('connect', () => {
  console.log('✅ Cliente conectado');
  
  // Crear sala con modo bot
  client.emit('createRoom', { 
    playerName: 'Jugador Humano', 
    maxPlayers: 4, 
    deckType: 'angels',
    gameMode: 'bot',
    botCount: 2
  });
});

client.on('roomCreated', (data) => {
  console.log('🏠 Sala creada con modo bot');
  console.log(`  📋 Room ID: ${data.roomId}`);
  console.log(`  👤 Player ID: ${data.playerId}`);
  console.log(`  🎮 Estado: ${data.gameState.gameState}`);
  console.log(`  👥 Jugadores: ${data.gameState.players.length}`);
  
  roomId = data.roomId;
  playerId = data.playerId;
  
  // Mostrar información de los jugadores
  data.gameState.players.forEach((player, index) => {
    console.log(`  👤 ${index + 1}. ${player.name}${player.isBot ? ' (🤖 Bot)' : ' (👤 Humano)'} - ${player.isReady ? '✅ Listo' : '⏳ No listo'}`);
  });
  
  // Marcar como listo
  console.log('\n✅ Marcando como listo...');
  client.emit('setPlayerReady', { ready: true });
});

client.on('gameStateUpdate', (data) => {
  console.log('🔄 Estado del juego actualizado');
  console.log(`  🎮 Estado: ${data.gameState}`);
  console.log(`  👥 Jugadores: ${data.players.length}`);
  
  const player = data.players.find(p => p.id === playerId);
  if (player) {
    console.log(`  ✋ Cartas en mano: ${player.hand ? player.hand.length : 0}`);
    console.log(`  📋 Criaturas boca arriba: ${player.faceUpCreatures ? player.faceUpCreatures.length : 0}`);
    console.log(`  🃏 Criaturas boca abajo: ${player.faceDownCreatures ? player.faceDownCreatures.length : 0}`);
    console.log(`  💎 Pozo de almas: ${player.soulWell ? player.soulWell.length : 0}`);
  }
  
  // Mostrar estado de todos los jugadores
  data.players.forEach((player, index) => {
    console.log(`  👤 ${index + 1}. ${player.name}${player.isBot ? ' (🤖)' : ' (👤)'} - ${player.isReady ? '✅' : '⏳'}`);
  });
});

client.on('allPlayersReady', () => {
  console.log('✅ Todos los jugadores están listos');
  
  // Iniciar juego
  client.emit('startGame');
});

client.on('gameStarted', (data) => {
  console.log('🎮 Juego iniciado');
  console.log(`  🎯 Estado: ${data.gameState}`);
  console.log(`  👤 Jugador actual: ${data.currentPlayerId}`);
  
  const player = data.players.find(p => p.id === playerId);
  if (player) {
    console.log(`  ✋ Cartas en mano: ${player.hand ? player.hand.length : 0}`);
    console.log(`  📋 Criaturas boca arriba: ${player.faceUpCreatures ? player.faceUpCreatures.length : 0}`);
    console.log(`  🃏 Criaturas boca abajo: ${player.faceDownCreatures ? player.faceDownCreatures.length : 0}`);
    console.log(`  💎 Pozo de almas: ${player.soulWell ? player.soulWell.length : 0}`);
    
    if (player.hand && player.hand.length > 0) {
      console.log(`  📝 Cartas en mano: ${player.hand.map(c => c.name).join(', ')}`);
    }
  }
  
  // Mostrar información de todos los jugadores
  console.log('\n📊 Estado de todos los jugadores:');
  data.players.forEach((player, index) => {
    console.log(`  👤 ${index + 1}. ${player.name}${player.isBot ? ' (🤖 Bot)' : ' (👤 Humano)'}`);
    console.log(`     ✋ Mano: ${player.handSize || 0} cartas`);
    console.log(`     📋 Boca arriba: ${player.faceUpCreatures ? player.faceUpCreatures.length : 0} cartas`);
    console.log(`     🃏 Boca abajo: ${player.faceDownCreatures ? player.faceDownCreatures.length : 0} cartas`);
    console.log(`     💎 Pozo: ${player.soulWellSize || 0} cartas`);
  });
  
  // Terminar prueba
  setTimeout(() => {
    console.log('\n🧪 Prueba completada');
    process.exit(0);
  }, 2000);
});

client.on('error', (data) => {
  console.error('❌ Error:', data.message);
});

// Manejar desconexión
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando conexión...');
  client.disconnect();
  process.exit(0);
});

// Timeout de seguridad
setTimeout(() => {
  console.log('⏰ Timeout de seguridad alcanzado');
  process.exit(1);
}, 10000);
