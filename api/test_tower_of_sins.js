const Game = require('./src/models/Game');
const TowerOfSins = require('./src/models/TowerOfSins');
const { THEMATIC_DECKS } = require('./src/models/Card');

console.log('🏰 Probando sistema de Torre de los Pecados...\n');

// Función para probar la clase TowerOfSins directamente
function testTowerOfSinsClass() {
  console.log('🧪 Probando clase TowerOfSins...\n');
  
  const tower = new TowerOfSins();
  
  // Crear algunas cartas de prueba
  const card1 = { name: 'Carta 5', value: 5, isSpecial: false, getPublicInfo: () => ({ name: 'Carta 5', value: 5 }) };
  const card2 = { name: 'Carta 7', value: 7, isSpecial: false, getPublicInfo: () => ({ name: 'Carta 7', value: 7 }) };
  const card3 = { name: 'Carta 10', value: 10, isSpecial: true, getPublicInfo: () => ({ name: 'Carta 10', value: 10 }) };
  const card4 = { name: 'Carta 2', value: 2, isSpecial: true, getPublicInfo: () => ({ name: 'Carta 2', value: 2 }) };
  
  console.log('📊 Estado inicial de la Torre:');
  console.log(`- Cartas: ${tower.cards.length}`);
  console.log(`- Última carta: ${tower.lastPlayedCard ? tower.lastPlayedCard.name : 'Ninguna'}`);
  console.log(`- Purificaciones: ${tower.purificationCount}`);
  
  // Probar agregar cartas
  console.log('\n📥 Agregando cartas a la Torre...');
  const result1 = tower.addCard(card1, 'player1');
  console.log(`✅ ${result1.message}`);
  
  const result2 = tower.addCard(card2, 'player2');
  console.log(`✅ ${result2.message}`);
  
  // Probar validación de cartas
  console.log('\n🎯 Probando validación de cartas...');
  const validation1 = tower.canPlayCard(card1);
  console.log(`Carta 5: ${validation1.canPlay} - ${validation1.reason}`);
  
  const validation2 = tower.canPlayCard(card3);
  console.log(`Carta 10: ${validation2.canPlay} - ${validation2.reason}`);
  
  const validation3 = tower.canPlayCard(card4);
  console.log(`Carta 2: ${validation3.canPlay} - ${validation3.reason}`);
  
  // Probar purificación
  console.log('\n🧹 Probando purificación...');
  const purifyCheck = tower.willPurify(card3);
  console.log(`¿Carta 10 purificará? ${purifyCheck.willPurify} - ${purifyCheck.reason}`);
  
  if (purifyCheck.willPurify) {
    const purifyResult = tower.purify('prueba de carta 10');
    console.log(`✅ ${purifyResult.message}`);
  }
  
  // Probar estadísticas
  console.log('\n📊 Estadísticas de la Torre:');
  const stats = tower.getStats();
  console.log(`- Total de cartas: ${stats.totalCards}`);
  console.log(`- Purificaciones: ${stats.purificationCount}`);
  console.log(`- Es peligrosa: ${stats.isDangerous}`);
  
  // Probar información pública
  console.log('\n📋 Información pública:');
  const publicInfo = tower.getPublicInfo();
  console.log(`- ID: ${publicInfo.id}`);
  console.log(`- Cartas: ${publicInfo.cardCount}`);
  console.log(`- Es peligrosa: ${publicInfo.isDangerous}`);
  console.log(`- Tendencia: ${tower.getTrend()}`);
}

// Función para probar la Torre en un juego completo
function testTowerInGame() {
  console.log('\n🎮 Probando Torre de los Pecados en un juego...\n');
  
  const game = new Game('test-room', 3, THEMATIC_DECKS.ANGELS);
  
  // Agregar jugadores
  const player1 = game.addPlayer('player1', 'Jugador 1', 'socket1');
  const player2 = game.addPlayer('player2', 'Jugador 2', 'socket2');
  const player3 = game.addPlayer('player3', 'Jugador 3', 'socket3');
  
  // Marcar como listos
  game.players.forEach(player => player.isReady = true);
  
  // Iniciar juego
  game.startGame();
  
  console.log('🎮 Juego iniciado');
  console.log(`📊 Torre inicial: ${game.towerOfSins.cards.length} cartas`);
  console.log(`🔄 Última carta: ${game.towerOfSins.lastPlayedCard ? game.towerOfSins.lastPlayedCard.name : 'Ninguna'}`);
  
  // Simular algunas jugadas
  console.log('\n🎯 Simulando jugadas...');
  
  const currentPlayer = game.players[game.currentPlayerIndex];
  const playableCards = currentPlayer.getPlayableCards();
  
  if (playableCards.length > 0) {
    console.log(`🎯 Jugador actual: ${currentPlayer.name}`);
    console.log(`📋 Cartas jugables: ${playableCards.length}`);
    
    // Jugar la primera carta
    try {
      const playedCard = game.playCard(currentPlayer.id, 0);
      console.log(`✅ ${currentPlayer.name} jugó: ${playedCard.name}`);
      console.log(`📊 Torre después de jugar: ${game.towerOfSins.cards.length} cartas`);
      console.log(`🔄 Última carta: ${game.towerOfSins.lastPlayedCard ? game.towerOfSins.lastPlayedCard.name : 'Ninguna'}`);
    } catch (error) {
      console.log(`❌ Error al jugar: ${error.message}`);
    }
  }
  
  // Probar validación de cartas jugables
  console.log('\n🎯 Probando validación de cartas jugables...');
  game.players.forEach(player => {
    const canPlay = game.canPlayerPlay(player.id);
    const playableCards = game.getPlayableCards(player.id);
    console.log(`👤 ${player.name}: puede jugar = ${canPlay}, cartas jugables = ${playableCards.length}`);
  });
  
  // Probar tomar la Torre
  console.log('\n📤 Probando tomar la Torre de los Pecados...');
  try {
    game.takeDiscardPile(currentPlayer.id);
    console.log(`✅ ${currentPlayer.name} tomó la Torre de los Pecados`);
    console.log(`📊 Torre después de tomar: ${game.towerOfSins.cards.length} cartas`);
    console.log(`✋ ${currentPlayer.name} ahora tiene ${currentPlayer.hand.length} cartas en mano`);
  } catch (error) {
    console.log(`❌ Error al tomar la Torre: ${error.message}`);
  }
  
  // Probar purificación
  console.log('\n🧹 Probando purificación...');
  try {
    game.purifyPile();
    console.log(`✅ Torre purificada`);
    console.log(`📊 Torre después de purificar: ${game.towerOfSins.cards.length} cartas`);
  } catch (error) {
    console.log(`❌ Error al purificar: ${error.message}`);
  }
}

// Función para probar casos especiales
function testSpecialCases() {
  console.log('\n🎯 Probando casos especiales...\n');
  
  const tower = new TowerOfSins();
  
  // Crear cartas para probar acumulación
  const card5 = { name: 'Carta 5', value: 5, isSpecial: false, getPublicInfo: () => ({ name: 'Carta 5', value: 5 }) };
  const card6 = { name: 'Carta 6', value: 6, isSpecial: false, getPublicInfo: () => ({ name: 'Carta 6', value: 6 }) };
  
  // Agregar 3 cartas del valor 5
  console.log('📥 Agregando 3 cartas del valor 5...');
  tower.addCard(card5, 'player1');
  tower.addCard(card6, 'player2');
  tower.addCard(card5, 'player3');
  tower.addCard(card5, 'player1');
  
  console.log(`📊 Torre tiene ${tower.cards.length} cartas`);
  
  // Verificar si la siguiente carta 5 purificará
  const purifyCheck = tower.willPurify(card5);
  console.log(`¿Próxima carta 5 purificará? ${purifyCheck.willPurify} - ${purifyCheck.reason}`);
  
  if (purifyCheck.willPurify) {
    console.log(`📋 Tipo: ${purifyCheck.type}, Conteo: ${purifyCheck.count}`);
  }
  
  // Probar cartas por valor
  console.log('\n🎯 Probando obtener cartas por valor...');
  const cardsValue5 = tower.getCardsByValue(5);
  console.log(`Cartas con valor 5: ${cardsValue5.length}`);
  
  // Probar cartas por jugador
  console.log('\n👤 Probando obtener cartas por jugador...');
  const cardsPlayer1 = tower.getCardsByPlayer('player1');
  console.log(`Cartas de player1: ${cardsPlayer1.length}`);
  
  // Probar información completa
  console.log('\n📋 Información completa de la Torre:');
  const fullInfo = tower.getFullInfo();
  console.log(`- ID: ${fullInfo.id}`);
  console.log(`- Cartas: ${fullInfo.cards.length}`);
  console.log(`- Purificaciones: ${fullInfo.purificationCount}`);
  console.log(`- Creada: ${fullInfo.createdAt}`);
  console.log(`- Modificada: ${fullInfo.lastModified}`);
}

// Función para probar reinicio
function testReset() {
  console.log('\n🔄 Probando reinicio de la Torre...\n');
  
  const tower = new TowerOfSins();
  
  // Agregar algunas cartas
  const card1 = { name: 'Carta 1', value: 1, isSpecial: false, getPublicInfo: () => ({ name: 'Carta 1', value: 1 }) };
  const card2 = { name: 'Carta 2', value: 2, isSpecial: true, getPublicInfo: () => ({ name: 'Carta 2', value: 2 }) };
  
  tower.addCard(card1, 'player1');
  tower.addCard(card2, 'player2');
  
  console.log(`📊 Torre antes del reinicio: ${tower.cards.length} cartas`);
  
  // Reiniciar
  const resetResult = tower.reset();
  console.log(`✅ ${resetResult.message}`);
  console.log(`📊 Torre después del reinicio: ${tower.cards.length} cartas`);
  console.log(`🔄 Purificaciones: ${tower.purificationCount}`);
}

// Ejecutar todas las pruebas
testTowerOfSinsClass();
testTowerInGame();
testSpecialCases();
testReset();

console.log('\n🎯 Resumen de pruebas de Torre de los Pecados:');
console.log('✅ Clase TowerOfSins probada');
console.log('✅ Integración con Game probada');
console.log('✅ Casos especiales probados');
console.log('✅ Reinicio probado');

console.log('\n✅ Pruebas de Torre de los Pecados completadas.');
