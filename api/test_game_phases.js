const Game = require('./src/models/Game');
const { THEMATIC_DECKS } = require('./src/models/Card');

console.log('🎮 Probando las 3 fases del juego...\n');

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

console.log('🎯 Estado inicial de los jugadores:');
game.players.forEach((player, index) => {
  console.log(`\n👤 ${player.name}:`);
  console.log(`  - Fase: ${player.currentPhase}`);
  console.log(`  - Mano: ${player.hand.length} cartas`);
  console.log(`  - Boca arriba: ${player.faceUpCreatures.length} cartas`);
  console.log(`  - Boca abajo: ${player.faceDownCreatures.length} cartas`);
  console.log(`  - Pozo de Almas: ${player.soulWell.length} cartas`);
  console.log(`  - Total: ${player.getTotalCardsRemaining()} cartas`);
});

// Función para simular jugadas y transiciones de fase
function simulatePhaseTransitions() {
  console.log('\n🔄 Simulando transiciones de fase...\n');
  
  const currentPlayer = game.players[game.currentPlayerIndex];
  console.log(`🎯 Jugador actual: ${currentPlayer.name} (Fase: ${currentPlayer.currentPhase})`);
  
  // Simular jugadas hasta que el jugador cambie de fase
  let playsCount = 0;
  const maxPlays = 20; // Límite para evitar bucles infinitos
  
  while (playsCount < maxPlays) {
    const player = game.players[game.currentPlayerIndex];
    const playableCards = player.getPlayableCards();
    
    if (playableCards.length === 0) {
      console.log(`⚠️ ${player.name} no tiene cartas jugables`);
      break;
    }
    
    console.log(`\n🎯 Turno ${playsCount + 1}: ${player.name} (Fase: ${player.currentPhase})`);
    console.log(`📋 Cartas jugables: ${playableCards.map(c => c.name).join(', ')}`);
    
    // Jugar la primera carta disponible
    try {
      const playedCard = game.playCard(player.id, 0);
      console.log(`✅ Jugó: ${playedCard.name} (valor: ${playedCard.value})`);
      
      // Verificar si hubo transición de fase
      const newPhase = player.currentPhase;
      console.log(`🔄 Fase actual: ${newPhase}`);
      
      // Mostrar estado actual
      console.log(`📊 Estado: ${player.hand.length} mano, ${player.faceUpCreatures.length} boca arriba, ${player.faceDownCreatures.length} boca abajo, ${player.soulWell.length} pozo`);
      
      // Verificar si el jugador ganó
      if (player.hasWon()) {
        console.log(`🏆 ¡${player.name} ha ganado!`);
        break;
      }
      
      playsCount++;
      
      // Si el jugador cambió de fase, mostrar información detallada
      if (playsCount === 1 || player.currentPhase !== newPhase) {
        console.log(`\n📋 Información detallada de ${player.name}:`);
        console.log(`  - Fase: ${player.currentPhase}`);
        console.log(`  - Descripción: ${player.getPhaseInfo().description}`);
        console.log(`  - Puede robar: ${player.getPhaseInfo().canDraw}`);
        console.log(`  - Cartas visibles: ${player.getPhaseInfo().cardsVisible}`);
        console.log(`  - Próxima fase: ${player.getPhaseInfo().nextPhase || 'Victoria'}`);
      }
      
    } catch (error) {
      console.log(`❌ Error al jugar: ${error.message}`);
      break;
    }
  }
}

// Función para probar la fase boca abajo
function testFaceDownPhase() {
  console.log('\n🃏 Probando fase de criaturas boca abajo...\n');
  
  // Buscar un jugador que esté en fase boca abajo o pueda llegar ahí
  let testPlayer = null;
  
  for (const player of game.players) {
    if (player.currentPhase === 'faceDown' || 
        (player.currentPhase === 'faceUp' && player.faceUpCreatures.length <= 1)) {
      testPlayer = player;
      break;
    }
  }
  
  if (!testPlayer) {
    console.log('⚠️ No se encontró jugador adecuado para probar fase boca abajo');
    return;
  }
  
  console.log(`🎯 Probando con ${testPlayer.name} (Fase: ${testPlayer.currentPhase})`);
  
  // Si no está en fase boca abajo, simular hasta llegar ahí
  while (testPlayer.currentPhase !== 'faceDown' && testPlayer.faceUpCreatures.length > 0) {
    try {
      const playedCard = game.playCard(testPlayer.id, 0);
      console.log(`✅ Jugó: ${playedCard.name} para avanzar a fase boca abajo`);
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      return;
    }
  }
  
  if (testPlayer.currentPhase === 'faceDown') {
    console.log(`🃏 ${testPlayer.name} está en fase boca abajo`);
    console.log(`📋 Criaturas boca abajo: ${testPlayer.faceDownCreatures.length} cartas ocultas`);
    
    // Jugar una carta boca abajo
    if (testPlayer.faceDownCreatures.length > 0) {
      try {
        const playedCard = game.playCard(testPlayer.id, 0);
        console.log(`🃏 Carta jugada boca abajo: ${playedCard.name} (valor: ${playedCard.value})`);
        
        // Verificar si fue válida
        if (game.lastPlayedCard && playedCard.value < game.lastPlayedCard.value && !playedCard.isSpecial) {
          console.log(`❌ Carta inválida - ${testPlayer.name} debe tomar la Torre de los Pecados`);
          console.log(`🔄 Regresa a fase: ${testPlayer.currentPhase}`);
        } else {
          console.log(`✅ Carta válida - continúa en fase boca abajo`);
        }
      } catch (error) {
        console.log(`❌ Error al jugar carta boca abajo: ${error.message}`);
      }
    }
  }
}

// Función para probar el Pozo de Almas
function testSoulWell() {
  console.log('\n💎 Probando Pozo de Almas...\n');
  
  const currentPlayer = game.players[game.currentPlayerIndex];
  console.log(`🎯 Jugador: ${currentPlayer.name}`);
  console.log(`💎 Cartas en Pozo de Almas: ${currentPlayer.soulWell.length}`);
  
  if (currentPlayer.soulWell.length > 0) {
    console.log(`📋 Cartas en Pozo: ${currentPlayer.soulWell.map(c => c.name).join(', ')}`);
    
    // Simular robo de carta
    const drawnCard = currentPlayer.drawFromSoulWell();
    if (drawnCard) {
      console.log(`💎 Carta robada: ${drawnCard.name}`);
      console.log(`📊 Pozo restante: ${currentPlayer.soulWell.length} cartas`);
    }
  } else {
    console.log(`⚠️ Pozo de Almas vacío`);
  }
}

// Ejecutar pruebas
simulatePhaseTransitions();
testFaceDownPhase();
testSoulWell();

console.log('\n🎯 Resumen final del juego:');
game.players.forEach((player, index) => {
  console.log(`\n👤 ${player.name}:`);
  console.log(`  - Fase: ${player.currentPhase}`);
  console.log(`  - Mano: ${player.hand.length} cartas`);
  console.log(`  - Boca arriba: ${player.faceUpCreatures.length} cartas`);
  console.log(`  - Boca abajo: ${player.faceDownCreatures.length} cartas`);
  console.log(`  - Pozo de Almas: ${player.soulWell.length} cartas`);
  console.log(`  - Total: ${player.getTotalCardsRemaining()} cartas`);
  console.log(`  - Ganó: ${player.hasWon()}`);
});

console.log('\n✅ Pruebas de las 3 fases completadas.');
