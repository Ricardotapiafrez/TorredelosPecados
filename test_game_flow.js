const io = require('socket.io-client');

// Configuración
const SERVER_URL = 'http://localhost:5001';
const PLAYER_NAME = 'TestPlayer';

// Función para crear una sala y jugar una carta
async function testGameFlow() {
  console.log('🎮 Iniciando prueba del flujo del juego...');
  
  const socket = io(SERVER_URL);
  
  socket.on('connect', () => {
    console.log('✅ Conectado al servidor');
    
    // Crear una sala con bots
    const roomData = {
      playerName: PLAYER_NAME,
      gameMode: 'bot',
      botCount: 3
    };
    
    console.log('📋 Creando sala con bots...');
    socket.emit('createRoom', roomData);
  });
  
  socket.on('roomCreated', (data) => {
    console.log('✅ Sala creada:', data.roomId);
    console.log('📋 Estado del juego:', data.gameState.gameState);
    console.log('📋 Jugadores:', data.gameState.players.map(p => `${p.name} (${p.isReady ? 'Listo' : 'No listo'})`));
    
    // Marcar como listo
    socket.emit('setPlayerReady', { ready: true });
  });
  
  socket.on('gameStateUpdate', (gameState) => {
    console.log('📋 Estado del juego actualizado');
    console.log('📋 Jugadores listos:', gameState.players.filter(p => p.isReady).length, '/', gameState.players.length);
    
    // Verificar si todos están listos para iniciar
    if (gameState.players.every(p => p.isReady) && gameState.players.length >= 2) {
      console.log('🎯 Todos los jugadores están listos, iniciando juego...');
      socket.emit('startGame');
    }
  });
  
  socket.on('allPlayersReady', () => {
    console.log('🎉 Todos los jugadores están listos!');
    socket.emit('startGame');
  });
  
  socket.on('gameStarted', (gameState) => {
    console.log('🎯 Juego iniciado!');
    console.log('📋 Estado:', gameState.gameState);
    console.log('📋 Jugador actual:', gameState.currentPlayerId);
    console.log('📋 Jugadores:', gameState.players.map(p => `${p.name} (${p.id})`));
    
    // Si es nuestro turno, intentar jugar una carta
    if (gameState.currentPlayerId === socket.id) {
      console.log('🎯 Es nuestro turno! Intentando jugar carta...');
      
      // Obtener cartas jugables
      socket.emit('getPlayableCards');
    }
  });
  
  socket.on('playableCards', (data) => {
    console.log('📋 Cartas jugables recibidas:', data);
    console.log('📋 Puede jugar:', data.canPlay);
    console.log('📋 Cartas disponibles:', data.cards.length);
    
    if (data.canPlay && data.cards.length > 0) {
      console.log('🎯 Jugando primera carta disponible...');
      socket.emit('playCard', { cardIndex: 0 });
    }
  });
  
  socket.on('cardPlayed', (data) => {
    console.log('✅ Carta jugada exitosamente!');
    console.log('📋 Carta:', data.card.name);
    console.log('📋 Jugador:', data.playerId);
    console.log('📋 Purificada:', data.wasPurified);
  });
  
  socket.on('gameStateUpdated', (gameState) => {
    console.log('📋 Estado del juego actualizado');
    console.log('📋 Última carta jugada:', gameState.lastPlayedCard ? gameState.lastPlayedCard.name : 'Ninguna');
    console.log('📋 Torre de pecados:', gameState.discardPile.length, 'cartas');
  });
  
  socket.on('error', (error) => {
    console.error('❌ Error:', error.message);
  });
  
  socket.on('validationError', (error) => {
    console.error('❌ Error de validación:', error);
  });
  
  // Manejar desconexión
  socket.on('disconnect', () => {
    console.log('🔌 Desconectado del servidor');
  });
  
  // Timeout para terminar la prueba
  setTimeout(() => {
    console.log('⏰ Terminando prueba...');
    socket.disconnect();
    process.exit(0);
  }, 15000);
}

// Ejecutar la prueba
testGameFlow().catch(console.error);
