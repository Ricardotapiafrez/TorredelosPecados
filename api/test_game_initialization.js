const Game = require('./src/models/Game');
const Player = require('./src/models/Player');
const { THEMATIC_DECKS } = require('./src/models/Card');

console.log('🧪 Probando inicialización del juego...\n');

// Crear un juego de prueba
const game = new Game('test-room', 4, THEMATIC_DECKS.ANGELS);

// Agregar jugadores
const player1 = game.addPlayer('player1', 'Jugador 1', 'socket1');
const player2 = game.addPlayer('player2', 'Jugador 2', 'socket2');

console.log(`📋 Juego creado con ${game.players.length} jugadores`);
console.log(`🎴 Mazo inicial: ${game.deck.length} cartas`);
console.log(`🎯 Estado del juego: ${game.gameState}\n`);

// Marcar jugadores como listos
player1.isReady = true;
player2.isReady = true;

console.log('✅ Jugadores marcados como listos');

// Iniciar el juego
try {
  game.startGame();
  console.log('🎮 Juego iniciado exitosamente!');
  console.log(`🎯 Estado del juego: ${game.gameState}`);
  console.log(`👤 Jugador actual: ${game.players[game.currentPlayerIndex].name}\n`);

  // Verificar cartas de cada jugador
  game.players.forEach((player, index) => {
    console.log(`👤 ${player.name}:`);
    console.log(`  ✋ Mano: ${player.hand.length} cartas`);
    console.log(`  📋 Criaturas boca arriba: ${player.faceUpCreatures.length} cartas`);
    console.log(`  🃏 Criaturas boca abajo: ${player.faceDownCreatures.length} cartas`);
    console.log(`  💎 Pozo de Almas: ${player.soulWell.length} cartas`);
    console.log(`  🎯 Fase actual: ${player.currentPhase}`);
    
    if (player.hand.length > 0) {
      console.log(`  📝 Cartas en mano: ${player.hand.map(c => c.name).join(', ')}`);
    }
    console.log('');
  });

  // Verificar estado del juego
  const gameState = game.getGameState('player1');
  console.log('📊 Estado del juego para player1:');
  console.log(`  🎯 Turno actual: ${gameState.currentPlayerId}`);
  console.log(`  🎴 Cartas en mano del jugador: ${gameState.players.find(p => p.id === 'player1').hand.length}`);
  console.log(`  🏗️ Torre de los Pecados: ${gameState.towerOfSins.cards.length} cartas`);

} catch (error) {
  console.error('❌ Error al iniciar el juego:', error.message);
}

console.log('\n🧪 Prueba completada');
