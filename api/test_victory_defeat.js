const Game = require('./src/models/Game');
const { THEMATIC_DECKS } = require('./src/models/Card');

console.log('🏆 Probando lógica de victoria/derrota...\n');

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
console.log(`- Jugadores: ${game.players.length}`);
console.log(`- Estado: ${game.gameState}`);
console.log(`- Ganador: ${game.winner ? game.winner.name : 'Ninguno'}`);
console.log(`- Pecador: ${game.sinner ? game.sinner.name : 'Ninguno'}`);

// Función para simular victoria de un jugador
function simulatePlayerVictory() {
  console.log('\n🏆 Simulando victoria de un jugador...\n');
  
  const currentPlayer = game.players[game.currentPlayerIndex];
  console.log(`🎯 Jugador actual: ${currentPlayer.name}`);
  console.log(`📊 Cartas restantes: ${currentPlayer.getTotalCardsRemaining()}`);
  
  // Vaciar todas las cartas del jugador para simular victoria
  currentPlayer.hand = [];
  currentPlayer.faceUpCreatures = [];
  currentPlayer.faceDownCreatures = [];
  currentPlayer.soulWell = [];
  
  console.log(`✅ ${currentPlayer.name} ahora tiene 0 cartas`);
  console.log(`🏆 ¿Ha ganado? ${currentPlayer.hasWon()}`);
  
  // Verificar fin del juego
  const gameEnded = game.checkGameEnd();
  console.log(`🎮 ¿El juego terminó? ${gameEnded}`);
  
  if (game.gameState === 'finished') {
    console.log(`🏆 Ganador final: ${game.winner ? game.winner.name : 'Ninguno'}`);
    console.log(`😈 Pecador final: ${game.sinner ? game.sinner.name : 'Ninguno'}`);
  }
}

// Función para probar múltiples ganadores
function testMultipleWinners() {
  console.log('\n🏆🏆 Probando múltiples ganadores...\n');
  
  // Crear un juego temporal para probar múltiples ganadores
  const tempGame = new Game('temp-room', 3, THEMATIC_DECKS.ANGELS);
  const tempPlayer1 = tempGame.addPlayer('temp1', 'Temp 1', 'socket1');
  const tempPlayer2 = tempGame.addPlayer('temp2', 'Temp 2', 'socket2');
  const tempPlayer3 = tempGame.addPlayer('temp3', 'Temp 3', 'socket3');
  
  tempPlayer1.isReady = true;
  tempPlayer2.isReady = true;
  tempPlayer3.isReady = true;
  
  tempGame.startGame();
  
  console.log(`🎮 Juego temporal iniciado con 3 jugadores`);
  
  // Hacer que los primeros dos jugadores ganen
  tempPlayer1.hand = [];
  tempPlayer1.faceUpCreatures = [];
  tempPlayer1.faceDownCreatures = [];
  tempPlayer1.soulWell = [];
  
  tempPlayer2.hand = [];
  tempPlayer2.faceUpCreatures = [];
  tempPlayer2.faceDownCreatures = [];
  tempPlayer2.soulWell = [];
  
  console.log(`🏆 ${tempPlayer1.name} ha ganado: ${tempPlayer1.hasWon()}`);
  console.log(`🏆 ${tempPlayer2.name} ha ganado: ${tempPlayer2.hasWon()}`);
  console.log(`⏳ ${tempPlayer3.name} sigue jugando: ${tempPlayer3.getTotalCardsRemaining()} cartas`);
  
  // Verificar fin del juego
  const gameEnded = tempGame.checkGameEnd();
  console.log(`🎮 ¿El juego terminó? ${gameEnded}`);
  
  if (tempGame.gameState === 'finished') {
    console.log(`🏆 Ganador: ${tempGame.winner ? tempGame.winner.name : 'Ninguno'}`);
    console.log(`😈 Pecador: ${tempGame.sinner ? tempGame.sinner.name : 'Ninguno'}`);
  }
}

// Función para probar victoria simultánea
function testSimultaneousVictory() {
  console.log('\n🎉 Probando victoria simultánea (todos ganan)...\n');
  
  // Crear un juego temporal para probar victoria simultánea
  const tempGame = new Game('temp-room', 2, THEMATIC_DECKS.ANGELS);
  const tempPlayer1 = tempGame.addPlayer('temp1', 'Temp 1', 'socket1');
  const tempPlayer2 = tempGame.addPlayer('temp2', 'Temp 2', 'socket2');
  
  tempPlayer1.isReady = true;
  tempPlayer2.isReady = true;
  
  tempGame.startGame();
  
  console.log(`🎮 Juego temporal iniciado con 2 jugadores`);
  
  // Hacer que ambos jugadores ganen
  tempPlayer1.hand = [];
  tempPlayer1.faceUpCreatures = [];
  tempPlayer1.faceDownCreatures = [];
  tempPlayer1.soulWell = [];
  
  tempPlayer2.hand = [];
  tempPlayer2.faceUpCreatures = [];
  tempPlayer2.faceDownCreatures = [];
  tempPlayer2.soulWell = [];
  
  console.log(`🏆 ${tempPlayer1.name} ha ganado: ${tempPlayer1.hasWon()}`);
  console.log(`🏆 ${tempPlayer2.name} ha ganado: ${tempPlayer2.hasWon()}`);
  
  // Verificar fin del juego
  const gameEnded = tempGame.checkGameEnd();
  console.log(`🎮 ¿El juego terminó? ${gameEnded}`);
  
  if (tempGame.gameState === 'finished') {
    console.log(`🏆 Ganador: ${tempGame.winner ? tempGame.winner.name : 'Ninguno'}`);
    console.log(`😈 Pecador: ${tempGame.sinner ? tempGame.sinner.name : 'Ninguno'}`);
    console.log(`🎉 Caso especial: Todos ganaron, no hay pecador`);
  }
}

// Función para probar juego normal hasta victoria
function testNormalGameToVictory() {
  console.log('\n🎮 Probando juego normal hasta victoria...\n');
  
  const currentPlayer = game.players[game.currentPlayerIndex];
  console.log(`🎯 Jugador actual: ${currentPlayer.name}`);
  console.log(`📊 Cartas restantes: ${currentPlayer.getTotalCardsRemaining()}`);
  
  // Simular algunas jugadas para acercar al jugador a la victoria
  let playsCount = 0;
  const maxPlays = 10;
  
  while (playsCount < maxPlays && game.gameState === 'playing') {
    const player = game.players[game.currentPlayerIndex];
    const playableCards = player.getPlayableCards();
    
    if (playableCards.length === 0) {
      console.log(`⚠️ ${player.name} no tiene cartas jugables`);
      break;
    }
    
    console.log(`\n🎯 Turno ${game.turnNumber}: ${player.name}`);
    console.log(`📋 Cartas jugables: ${playableCards.length}`);
    console.log(`📊 Cartas restantes: ${player.getTotalCardsRemaining()}`);
    
    try {
      const playedCard = game.playCard(player.id, 0);
      console.log(`✅ Jugó: ${playedCard.name}`);
      
      // Verificar si ganó
      if (player.hasWon()) {
        console.log(`🏆 ¡${player.name} ha ganado!`);
        break;
      }
      
      playsCount++;
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      break;
    }
  }
  
  console.log(`\n🎮 Estado final del juego:`);
  console.log(`- Estado: ${game.gameState}`);
  console.log(`- Ganador: ${game.winner ? game.winner.name : 'Ninguno'}`);
  console.log(`- Pecador: ${game.sinner ? game.sinner.name : 'Ninguno'}`);
}

// Función para probar información de victoria/derrota
function testVictoryDefeatInfo() {
  console.log('\n📊 Probando información de victoria/derrota...\n');
  
  // Simular que un jugador ha ganado
  const testPlayer = game.players[0];
  testPlayer.hand = [];
  testPlayer.faceUpCreatures = [];
  testPlayer.faceDownCreatures = [];
  testPlayer.soulWell = [];
  
  console.log(`🏆 ${testPlayer.name} ha ganado: ${testPlayer.hasWon()}`);
  
  // Verificar información del jugador
  const publicInfo = testPlayer.getPublicInfo();
  const fullInfo = testPlayer.getFullInfo();
  
  console.log(`📋 Información pública:`);
  console.log(`  - Nombre: ${publicInfo.name}`);
  console.log(`  - Es pecador: ${publicInfo.isSinner}`);
  console.log(`  - Cartas restantes: ${publicInfo.totalCardsRemaining}`);
  console.log(`  - Score: ${publicInfo.score}`);
  
  console.log(`📋 Información completa:`);
  console.log(`  - Mano: ${fullInfo.hand.length} cartas`);
  console.log(`  - Boca arriba: ${fullInfo.faceUpCreatures.length} cartas`);
  console.log(`  - Boca abajo: ${fullInfo.faceDownCreatures.length} cartas`);
  console.log(`  - Pozo de almas: ${fullInfo.soulWell.length} cartas`);
}

// Ejecutar pruebas
simulatePlayerVictory();
testMultipleWinners();
testSimultaneousVictory();
testVictoryDefeatInfo();

// Probar juego normal (comentado para no hacer demasiadas jugadas)
// testNormalGameToVictory();

console.log('\n🎯 Resumen de pruebas de victoria/derrota:');
console.log(`- Estado del juego: ${game.gameState}`);
console.log(`- Ganador: ${game.winner ? game.winner.name : 'Ninguno'}`);
console.log(`- Pecador: ${game.sinner ? game.sinner.name : 'Ninguno'}`);

console.log('\n✅ Pruebas de victoria/derrota completadas.');
