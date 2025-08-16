const Game = require('./src/models/Game');
const { THEMATIC_DECKS } = require('./src/models/Card');

console.log('🧪 Probando lógica de purificación de mazos...\n');

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
console.log(`- Torre de los Pecados: ${game.discardPile.length} cartas`);
console.log(`- Última carta jugada: ${game.lastPlayedCard ? game.lastPlayedCard.name : 'Ninguna'}`);
console.log(`- Jugador actual: ${game.players[game.currentPlayerIndex].name}\n`);

// Simular jugadas para probar purificación
function testPurification() {
  console.log('🔄 Probando purificación con cartas del mismo valor...\n');
  
  // Obtener cartas del jugador actual
  const currentPlayer = game.players[game.currentPlayerIndex];
  const playableCards = currentPlayer.getPlayableCards();
  
  console.log(`📋 Cartas jugables de ${currentPlayer.name}:`);
  playableCards.forEach((card, index) => {
    console.log(`  ${index}: ${card.name} (valor: ${card.value})`);
  });
  
  // Jugar la primera carta
  if (playableCards.length > 0) {
    const firstCard = playableCards[0];
    console.log(`\n🎯 Jugando: ${firstCard.name} (valor: ${firstCard.value})`);
    
    try {
      const playedCard = game.playCard(currentPlayer.id, 0);
      console.log(`✅ Carta jugada exitosamente: ${playedCard.name}`);
      console.log(`📊 Torre de los Pecados: ${game.discardPile.length} cartas`);
      console.log(`🔄 Última carta: ${game.lastPlayedCard ? game.lastPlayedCard.name : 'Ninguna'}\n`);
    } catch (error) {
      console.log(`❌ Error al jugar carta: ${error.message}\n`);
    }
  }
  
  // Buscar otra carta del mismo valor para probar purificación
  const currentPlayer2 = game.players[game.currentPlayerIndex];
  const playableCards2 = currentPlayer2.getPlayableCards();
  
  console.log(`📋 Cartas jugables de ${currentPlayer2.name}:`);
  playableCards2.forEach((card, index) => {
    console.log(`  ${index}: ${card.name} (valor: ${card.value})`);
  });
  
  // Buscar una carta del mismo valor que la última jugada
  if (game.lastPlayedCard && playableCards2.length > 0) {
    const sameValueCard = playableCards2.find(card => card.value === game.lastPlayedCard.value);
    
    if (sameValueCard) {
      const cardIndex = playableCards2.findIndex(card => card.value === game.lastPlayedCard.value);
      console.log(`\n🎯 Encontrada carta del mismo valor: ${sameValueCard.name} (valor: ${sameValueCard.value})`);
      console.log(`🧪 Probando purificación...`);
      
      try {
        const playedCard = game.playCard(currentPlayer2.id, cardIndex);
        console.log(`✅ Carta jugada exitosamente: ${playedCard.name}`);
        console.log(`📊 Torre de los Pecados: ${game.discardPile.length} cartas`);
        console.log(`🔄 Última carta: ${game.lastPlayedCard ? game.lastPlayedCard.name : 'Ninguna'}`);
        
        if (game.discardPile.length === 0) {
          console.log(`🎉 ¡Purificación exitosa! La Torre de los Pecados ha sido limpiada.`);
        } else {
          console.log(`⚠️ La Torre de los Pecados no fue purificada.`);
        }
      } catch (error) {
        console.log(`❌ Error al jugar carta: ${error.message}`);
      }
    } else {
      console.log(`\n⚠️ No se encontró carta del mismo valor para probar purificación.`);
    }
  }
}

// Probar purificación con carta 10
function testPurificationWithCard10() {
  console.log('\n🔄 Probando purificación con carta 10 (poder especial)...\n');
  
  // Buscar un jugador con carta 10
  for (let i = 0; i < game.players.length; i++) {
    const player = game.players[i];
    const playableCards = player.getPlayableCards();
    const card10 = playableCards.find(card => card.value === 10);
    
    if (card10) {
      const cardIndex = playableCards.findIndex(card => card.value === 10);
      console.log(`🎯 Jugador ${player.name} tiene carta 10: ${card10.name}`);
      
      // Cambiar al turno de este jugador
      game.currentPlayerIndex = i;
      
      // Agregar algunas cartas a la Torre de los Pecados para probar
      if (game.discardPile.length === 0) {
        const testCard = playableCards[0];
        game.discardPile.push(testCard);
        game.lastPlayedCard = testCard;
        console.log(`📊 Agregada carta de prueba a la Torre: ${testCard.name}`);
      }
      
      console.log(`📊 Torre de los Pecados antes: ${game.discardPile.length} cartas`);
      
      try {
        const playedCard = game.playCard(player.id, cardIndex);
        console.log(`✅ Carta 10 jugada exitosamente: ${playedCard.name}`);
        console.log(`📊 Torre de los Pecados después: ${game.discardPile.length} cartas`);
        console.log(`🔄 Última carta: ${game.lastPlayedCard ? game.lastPlayedCard.name : 'Ninguna'}`);
        
        if (game.discardPile.length === 0) {
          console.log(`🎉 ¡Purificación exitosa con carta 10!`);
        } else {
          console.log(`⚠️ La purificación con carta 10 no funcionó como esperado.`);
        }
      } catch (error) {
        console.log(`❌ Error al jugar carta 10: ${error.message}`);
      }
      break;
    }
  }
}

// Probar acumulación de cartas del mismo valor
function testAccumulationPurification() {
  console.log('\n🔄 Probando purificación por acumulación (4 cartas del mismo valor)...\n');
  
  // Simular acumulación de cartas del mismo valor
  const testValue = 5;
  const testCards = game.players[0].hand.filter(card => card.value === testValue);
  
  if (testCards.length >= 3) {
    console.log(`📊 Agregando 3 cartas de valor ${testValue} a la Torre de los Pecados...`);
    
    for (let i = 0; i < 3; i++) {
      game.discardPile.push(testCards[i]);
    }
    game.lastPlayedCard = testCards[2];
    
    console.log(`📊 Torre de los Pecados: ${game.discardPile.length} cartas`);
    console.log(`🔄 Última carta: ${game.lastPlayedCard.name} (valor: ${game.lastPlayedCard.value})`);
    
    // Buscar una cuarta carta del mismo valor
    const currentPlayer = game.players[game.currentPlayerIndex];
    const playableCards = currentPlayer.getPlayableCards();
    const fourthCard = playableCards.find(card => card.value === testValue);
    
    if (fourthCard) {
      const cardIndex = playableCards.findIndex(card => card.value === testValue);
      console.log(`🎯 Jugando cuarta carta del mismo valor: ${fourthCard.name}`);
      
      try {
        const playedCard = game.playCard(currentPlayer.id, cardIndex);
        console.log(`✅ Carta jugada exitosamente: ${playedCard.name}`);
        console.log(`📊 Torre de los Pecados después: ${game.discardPile.length} cartas`);
        
        if (game.discardPile.length === 0) {
          console.log(`🎉 ¡Purificación por acumulación exitosa!`);
        } else {
          console.log(`⚠️ La purificación por acumulación no funcionó como esperado.`);
        }
      } catch (error) {
        console.log(`❌ Error al jugar carta: ${error.message}`);
      }
    } else {
      console.log(`⚠️ No se encontró cuarta carta del mismo valor.`);
    }
  } else {
    console.log(`⚠️ No hay suficientes cartas del mismo valor para probar acumulación.`);
  }
}

// Ejecutar pruebas
testPurification();
testPurificationWithCard10();
testAccumulationPurification();

console.log('\n🎯 Resumen de pruebas de purificación:');
console.log(`- Torre de los Pecados final: ${game.discardPile.length} cartas`);
console.log(`- Última carta jugada: ${game.lastPlayedCard ? game.lastPlayedCard.name : 'Ninguna'}`);
console.log(`- Estado del juego: ${game.gameState}`);
console.log(`- Jugador actual: ${game.players[game.currentPlayerIndex].name}`);

console.log('\n✅ Pruebas de purificación completadas.');
