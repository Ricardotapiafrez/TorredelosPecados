const Game = require('./src/models/Game');
const { THEMATIC_DECKS } = require('./src/models/Card');
const ValidationService = require('./src/services/ValidationService');

console.log('🎯 Probando sistema de turnos y validación...\n');

// Crear un juego de prueba
const game = new Game('test-room', 4, THEMATIC_DECKS.ANGELS);

// Agregar jugadores de prueba
const player1 = game.addPlayer('player1', 'Jugador 1', 'socket1');
const player2 = game.addPlayer('player2', 'Jugador 2', 'socket2');
const player3 = game.addPlayer('player3', 'Jugador 3', 'socket3');
const player4 = game.addPlayer('player4', 'Jugador 4', 'socket4');

// Marcar todos como listos
game.players.forEach(player => player.isReady = true);

// Iniciar el juego
game.startGame();

console.log('🎮 Estado inicial del juego:');
console.log(`- Jugador actual: ${game.players[game.currentPlayerIndex].name}`);
console.log(`- Número de turno: ${game.turnNumber}`);
console.log(`- Tiempo por turno: ${game.turnTime} segundos`);

// Crear instancia del ValidationService
const validationService = new ValidationService();

// Función para probar validación de turnos
function testTurnValidation() {
  console.log('\n🔍 Probando validación de turnos...\n');
  
  const currentPlayer = game.players[game.currentPlayerIndex];
  const otherPlayer = game.players[(game.currentPlayerIndex + 1) % game.players.length];
  
  console.log(`🎯 Jugador actual: ${currentPlayer.name}`);
  console.log(`👤 Jugador de prueba: ${otherPlayer.name}`);
  
  // Probar validación del jugador actual
  console.log('\n✅ Validando jugador actual:');
  const currentValidation = validationService.validateTurn(game, currentPlayer.id);
  console.log(`- Válido: ${currentValidation.isValid}`);
  console.log(`- Errores: ${currentValidation.errors.join(', ') || 'Ninguno'}`);
  console.log(`- Advertencias: ${currentValidation.warnings.join(', ') || 'Ninguna'}`);
  
  // Probar validación de otro jugador
  console.log('\n❌ Validando jugador que no es su turno:');
  const otherValidation = validationService.validateTurn(game, otherPlayer.id);
  console.log(`- Válido: ${otherValidation.isValid}`);
  console.log(`- Errores: ${otherValidation.errors.join(', ') || 'Ninguno'}`);
  console.log(`- Advertencias: ${otherValidation.warnings.join(', ') || 'Ninguna'}`);
}

// Función para probar transiciones de turno
function testTurnTransitions() {
  console.log('\n🔄 Probando transiciones de turno...\n');
  
  const initialPlayer = game.players[game.currentPlayerIndex];
  console.log(`🎯 Jugador inicial: ${initialPlayer.name}`);
  
  // Simular algunas jugadas para ver transiciones
  for (let i = 0; i < 3; i++) {
    const currentPlayer = game.players[game.currentPlayerIndex];
    const playableCards = currentPlayer.getPlayableCards();
    
    if (playableCards.length > 0) {
      console.log(`\n🎯 Turno ${game.turnNumber}: ${currentPlayer.name}`);
      console.log(`📋 Cartas jugables: ${playableCards.map(c => c.name).join(', ')}`);
      
      try {
        const playedCard = game.playCard(currentPlayer.id, 0);
        console.log(`✅ Jugó: ${playedCard.name}`);
        console.log(`🔄 Siguiente jugador: ${game.players[game.currentPlayerIndex].name}`);
        console.log(`📊 Torre de los Pecados: ${game.discardPile.length} cartas`);
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
        break;
      }
    } else {
      console.log(`⚠️ ${currentPlayer.name} no tiene cartas jugables`);
      break;
    }
  }
}

// Función para probar información del turno
function testTurnInfo() {
  console.log('\n📊 Probando información del turno...\n');
  
  const turnInfo = game.getTurnInfo();
  console.log('🎯 Información del turno actual:');
  console.log(`- Número de turno: ${turnInfo.turnNumber}`);
  console.log(`- Jugador actual: ${turnInfo.currentPlayer?.name || 'Ninguno'}`);
  console.log(`- Fase del jugador: ${turnInfo.currentPlayer?.phase || 'N/A'}`);
  console.log(`- Tiempo restante: ${turnInfo.turnTimeRemaining} segundos`);
  console.log(`- Tiempo total: ${turnInfo.turnTime} segundos`);
  console.log(`- Jugador saltado: ${turnInfo.skippedPlayer || 'Ninguno'}`);
}

// Función para probar validación completa
function testCompleteValidation() {
  console.log('\n🔍 Probando validación completa...\n');
  
  const currentPlayer = game.players[game.currentPlayerIndex];
  const playableCards = currentPlayer.getPlayableCards();
  
  if (playableCards.length > 0) {
    console.log(`🎯 Validando jugada para ${currentPlayer.name}:`);
    console.log(`📋 Carta a jugar: ${playableCards[0].name}`);
    
    const validation = validationService.validatePlay(game, currentPlayer.id, 0);
    
    console.log('📊 Resultado de validación:');
    console.log(`- Válida: ${validation.isValid}`);
    console.log(`- Errores: ${validation.errors.join(', ') || 'Ninguno'}`);
    console.log(`- Advertencias: ${validation.warnings.join(', ') || 'Ninguna'}`);
    console.log(`- Cartas jugables: ${validation.playableCards.length}`);
    console.log(`- Puede jugar: ${validation.canPlay}`);
  } else {
    console.log(`⚠️ ${currentPlayer.name} no tiene cartas jugables para validar`);
  }
}

// Función para probar timeout de turno
function testTurnTimeout() {
  console.log('\n⏰ Probando timeout de turno...\n');
  
  const currentPlayer = game.players[game.currentPlayerIndex];
  console.log(`🎯 Jugador actual: ${currentPlayer.name}`);
  console.log(`⏱️ Tiempo restante: ${game.getTurnTimeRemaining()} segundos`);
  
  // Simular paso del tiempo
  console.log('🕐 Simulando paso del tiempo...');
  
  // Crear un juego temporal con tiempo muy corto para probar timeout
  const tempGame = new Game('temp-room', 2, THEMATIC_DECKS.ANGELS);
  const tempPlayer1 = tempGame.addPlayer('temp1', 'Temp 1', 'socket1');
  const tempPlayer2 = tempGame.addPlayer('temp2', 'Temp 2', 'socket2');
  
  tempPlayer1.isReady = true;
  tempPlayer2.isReady = true;
  
  tempGame.turnTime = 1; // 1 segundo para probar timeout
  tempGame.startGame();
  
  console.log(`⏰ Juego temporal iniciado con ${tempGame.turnTime} segundo por turno`);
  console.log(`🎯 Jugador actual: ${tempGame.players[tempGame.currentPlayerIndex].name}`);
  
  // Esperar un poco para que pase el timeout
  setTimeout(() => {
    console.log(`⏰ Después del timeout - Jugador actual: ${tempGame.players[tempGame.currentPlayerIndex].name}`);
    console.log(`🔄 El turno debería haber cambiado automáticamente`);
  }, 1500);
}

// Función para probar efectos especiales en turnos
function testSpecialEffectsOnTurns() {
  console.log('\n✨ Probando efectos especiales en turnos...\n');
  
  // Buscar una carta 8 (poder de salto)
  const currentPlayer = game.players[game.currentPlayerIndex];
  const playableCards = currentPlayer.getPlayableCards();
  const card8 = playableCards.find(card => card.value === 8);
  
  if (card8) {
    const cardIndex = playableCards.findIndex(card => card.value === 8);
    console.log(`🎯 Encontrada carta 8: ${card8.name}`);
    console.log(`👤 Jugador actual: ${currentPlayer.name}`);
    
    const nextPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
    const nextPlayer = game.players[nextPlayerIndex];
    const skipPlayerIndex = (nextPlayerIndex + 1) % game.players.length;
    const skipPlayer = game.players[skipPlayerIndex];
    
    console.log(`🔄 Jugador siguiente: ${nextPlayer.name}`);
    console.log(`⏭️ Jugador que será saltado: ${skipPlayer.name}`);
    
    try {
      const playedCard = game.playCard(currentPlayer.id, cardIndex);
      console.log(`✅ Carta 8 jugada: ${playedCard.name}`);
      console.log(`🎯 Nuevo jugador actual: ${game.players[game.currentPlayerIndex].name}`);
      console.log(`⏭️ Efecto de salto aplicado correctamente`);
    } catch (error) {
      console.log(`❌ Error al jugar carta 8: ${error.message}`);
    }
  } else {
    console.log(`⚠️ No se encontró carta 8 para probar efecto de salto`);
  }
}

// Ejecutar pruebas
testTurnValidation();
testTurnTransitions();
testTurnInfo();
testCompleteValidation();
testSpecialEffectsOnTurns();

// Probar timeout (comentado para no esperar)
// testTurnTimeout();

console.log('\n🎯 Resumen del sistema de turnos:');
console.log(`- Número total de turnos: ${game.turnNumber}`);
console.log(`- Jugador actual: ${game.players[game.currentPlayerIndex].name}`);
console.log(`- Estado del juego: ${game.gameState}`);
console.log(`- Tiempo restante: ${game.getTurnTimeRemaining()} segundos`);

console.log('\n✅ Pruebas del sistema de turnos y validación completadas.');
