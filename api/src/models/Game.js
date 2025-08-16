const { v4: uuidv4 } = require('uuid');
const { getThematicDeck, shuffleDeck, THEMATIC_DECKS } = require('./Card');
const Player = require('./Player');
const TowerOfSins = require('./TowerOfSins');

class Game {
  constructor(roomId, maxPlayers = 6, deckType = THEMATIC_DECKS.ANGELS) {
    this.roomId = roomId;
    this.maxPlayers = maxPlayers;
    this.players = []; // Array de jugadores para mantener orden
    this.deck = [];
    this.deckType = deckType;
    
    // Estado del juego
    this.gameState = 'waiting'; // 'waiting', 'playing', 'finished'
    this.currentPlayerIndex = 0;
    this.turnTime = 30; // segundos por turno
    this.turnTimer = null;
    this.turnStartTime = null;
    this.turnNumber = 0;
    this.createdAt = new Date();
    
    // Torre de los Pecados (mazo de descarte)
    this.towerOfSins = new TowerOfSins();
    this.nextPlayerCanPlayAnything = false;
    this.skippedPlayer = null;
    
    // Ganador y perdedor
    this.winner = null;
    this.sinner = null; // El perdedor (pecador)
    
    this.initializeDeck();
  }

  // Inicializar mazo temático
  initializeDeck() {
    // Crear 4 copias del mazo temático (52 cartas total)
    this.deck = [];
    const baseDeck = getThematicDeck(this.deckType);
    
    for (let i = 0; i < 4; i++) {
      this.deck.push(...baseDeck.map(card => Object.assign(Object.create(Object.getPrototypeOf(card)), card)));
    }
    
    this.shuffleDeck();
  }

  // Mezclar mazo
  shuffleDeck() {
    this.deck = shuffleDeck(this.deck);
  }

  // Agregar jugador
  addPlayer(playerId, name, socketId, selectedDeck = null) {
    if (this.players.length >= this.maxPlayers) {
      throw new Error('Sala llena');
    }

    if (this.gameState !== 'waiting') {
      throw new Error('El juego ya comenzó');
    }

    // Si no se especifica mazo, usar el mazo por defecto del juego
    const deckType = selectedDeck || this.deckType;
    const player = new Player(playerId, name, socketId, deckType);
    this.players.push(player);
    
    return player;
  }

  // Remover jugador
  removePlayer(playerId) {
    const playerIndex = this.players.findIndex(p => p.id === playerId);
    if (playerIndex !== -1) {
      const player = this.players.splice(playerIndex, 1)[0];
      
      // Ajustar índice del jugador actual si es necesario
      if (this.currentPlayerIndex >= this.players.length) {
        this.currentPlayerIndex = 0;
      }
      
      // Si el juego está en progreso y quedan menos de 2 jugadores, terminar
      if (this.gameState === 'playing' && this.players.length < 2) {
        this.endGame();
      }
      
      return player;
    }
    return null;
  }

  // Obtener jugador por ID
  getPlayer(playerId) {
    return this.players.find(p => p.id === playerId) || null;
  }

  // Cambiar mazo de un jugador
  changePlayerDeck(playerId, deckType) {
    const player = this.getPlayer(playerId);
    if (!player) {
      throw new Error('Jugador no encontrado');
    }

    if (this.gameState !== 'waiting') {
      throw new Error('No se puede cambiar mazo durante el juego');
    }

    const success = player.setSelectedDeck(deckType);
    if (success) {
      console.log(`🎴 Mazo cambiado para ${player.name}: ${deckType}`);
    }
    
    return success;
  }

  // Obtener información de mazos de todos los jugadores
  getPlayersDeckInfo() {
    return this.players.map(player => ({
      id: player.id,
      name: player.name,
      selectedDeck: player.selectedDeck,
      deckInfo: player.getDeckInfo(),
      isBot: player.isBot
    }));
  }

  // Iniciar juego
  startGame() {
    if (this.players.length < 2) {
      throw new Error('Se necesitan al menos 2 jugadores');
    }

    if (this.gameState !== 'waiting') {
      throw new Error('El juego ya comenzó');
    }

    // Verificar que todos estén listos
    for (const player of this.players) {
      if (!player.isReady) {
        throw new Error('No todos los jugadores están listos');
      }
    }

    this.gameState = 'playing';
    this.dealInitialCards();
    this.startTurn();
  }

  // Repartir cartas iniciales según las reglas
  dealInitialCards() {
    console.log(`🎴 Repartiendo cartas iniciales...`);
    
    // Crear mazos individuales para cada jugador
    for (const player of this.players) {
      console.log(`🎴 Creando mazo para ${player.name}: ${player.selectedDeck}`);
      
      // Crear 12 cartas del mazo seleccionado por el jugador
      const playerDeck = [];
      const baseDeck = getThematicDeck(player.selectedDeck);
      
      // Crear 12 cartas (una copia de cada carta del mazo base)
      for (let i = 0; i < 12; i++) {
        const cardIndex = i % baseDeck.length;
        const card = Object.assign(Object.create(Object.getPrototypeOf(baseDeck[cardIndex])), baseDeck[cardIndex]);
        playerDeck.push(card);
      }
      
      // Mezclar el mazo del jugador
      playerDeck.sort(() => Math.random() - 0.5);
      
      // Repartir las 12 cartas al jugador
      for (const card of playerDeck) {
        player.addCardToHand(card);
      }
      
      console.log(`✅ ${player.name} recibió 12 cartas del mazo ${player.selectedDeck}`);
    }
    
    // Organizar las criaturas de cada jugador
    for (const player of this.players) {
      player.organizeCreatures();
    }
    
    console.log(`🎴 Reparto de cartas completado`);
  }

  // Iniciar turno
  startTurn() {
    if (this.gameState !== 'playing') return;

    const currentPlayer = this.players[this.currentPlayerIndex];
    
    if (!currentPlayer) {
      console.log(`⚠️ No hay jugador en el índice ${this.currentPlayerIndex}`);
      this.nextTurn();
      return;
    }

    if (currentPlayer.hasWon()) {
      console.log(`🏆 ${currentPlayer.name} ya ganó, saltando turno`);
      this.nextTurn();
      return;
    }

    // Verificar si el jugador puede jugar
    const canPlay = this.canPlayerPlay(currentPlayer.id);
    if (!canPlay) {
      console.log(`⚠️ ${currentPlayer.name} no puede jugar, debe tomar la Torre de los Pecados`);
      // El jugador debe tomar la Torre de los Pecados automáticamente
      this.forceTakeDiscardPile(currentPlayer.id);
    }

    // Incrementar número de turno
    this.turnNumber++;
    this.turnStartTime = new Date();

    console.log(`🎯 Turno ${this.turnNumber}: ${currentPlayer.name} (Fase: ${currentPlayer.currentPhase})`);

    // Iniciar timer del turno
    this.turnTimer = setTimeout(() => {
      console.log(`⏰ Timeout del turno para ${currentPlayer.name}`);
      this.endTurn();
    }, this.turnTime * 1000);
  }

  // Terminar turno
  endTurn() {
    if (this.turnTimer) {
      clearTimeout(this.turnTimer);
      this.turnTimer = null;
    }
    
    this.nextTurn();
  }

  // Siguiente turno
  nextTurn() {
    const previousPlayer = this.players[this.currentPlayerIndex];
    const previousIndex = this.currentPlayerIndex;
    
    // Avanzar al siguiente jugador
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    
    // Saltar jugador si es necesario (efecto del 8)
    if (this.skippedPlayer) {
      const skipIndex = this.players.findIndex(p => p.id === this.skippedPlayer);
      if (skipIndex !== -1 && skipIndex === this.currentPlayerIndex) {
        console.log(`⏭️ Saltando turno de ${this.players[skipIndex].name} (efecto del 8)`);
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
      }
      this.skippedPlayer = null;
    }
    
    const nextPlayer = this.players[this.currentPlayerIndex];
    
    if (previousPlayer && nextPlayer) {
      console.log(`🔄 Turno: ${previousPlayer.name} → ${nextPlayer.name}`);
    }
    
    this.startTurn();
  }

  // Jugar carta
  playCard(playerId, cardIndex, targetPlayerId = null) {
    const player = this.players.find(p => p.id === playerId);
    if (!player || player.hasWon()) {
      throw new Error('Jugador no válido');
    }

    const currentPlayer = this.players[this.currentPlayerIndex];
    
    if (playerId !== currentPlayer.id) {
      throw new Error('No es tu turno');
    }

    // Obtener cartas jugables según la fase actual
    const playableCards = player.getPlayableCards();
    if (cardIndex < 0 || cardIndex >= playableCards.length) {
      throw new Error('Índice de carta no válido');
    }

    const card = playableCards[cardIndex];
    
    // Verificar si la carta puede ser jugada
    if (!card.canBePlayed(this, playerId)) {
      throw new Error('No puedes jugar esa carta');
    }

    // Jugar la carta
    const playedCard = player.playCard(cardIndex);
    if (!playedCard) {
      throw new Error('Error al jugar la carta');
    }

    // Verificar si purifica el mazo
    const purificationCheck = this.towerOfSins.willPurify(playedCard);
    if (purificationCheck.willPurify) {
      console.log(`🎯 Carta ${playedCard.name} (valor: ${playedCard.value}) purificará la Torre de los Pecados`);
      console.log(`📋 Razón: ${purificationCheck.reason}`);
      this.purifyPile();
    } else {
      // Agregar a la Torre de los Pecados
      const addResult = this.towerOfSins.addCard(playedCard, playerId);
      console.log(`📊 ${addResult.message} (total: ${addResult.towerSize})`);
    }

    // Aplicar efectos especiales de la carta
    playedCard.applyEffect(this, playerId, targetPlayerId);

    // Verificar transición de fase
    player.checkPhaseTransition();

    // Verificar si el jugador ganó
    if (player.hasWon()) {
      console.log(`🏆 ¡${player.name} ha ganado la partida!`);
      this.checkGameEnd(); // Verificar si el juego debe terminar
      return playedCard;
    }

    // Verificar si la carta boca abajo es válida
    if (player.currentPhase === 'faceDown' && this.towerOfSins.lastPlayedCard) {
      const towerValidation = this.towerOfSins.canPlayCard(playedCard);
      if (!towerValidation.canPlay) {
        console.log(`❌ Carta boca abajo inválida: ${playedCard.name} (${playedCard.value}) - ${towerValidation.reason}`);
        console.log(`📥 ${player.name} debe tomar la Torre de los Pecados y regresar a fase de mano`);

        // El jugador debe tomar la Torre de los Pecados
        const takeResult = this.towerOfSins.takeAllCards(playerId);
        if (takeResult.success) {
          player.takeDiscardPile(takeResult.cardsTaken);
        }

        // No pasar al siguiente turno, el mismo jugador continúa
        return playedCard;
      }
    }

    // Pasar al siguiente turno
    this.endTurn();

    return playedCard;
  }

  // Tomar toda la Torre de los Pecados
  takeDiscardPile(playerId) {
    const player = this.players.find(p => p.id === playerId);
    if (!player) {
      throw new Error('Jugador no válido');
    }

    const takeResult = this.towerOfSins.takeAllCards(playerId);
    
    if (takeResult.success) {
      console.log(`📥 ${player.name} toma la Torre de los Pecados (${takeResult.cardCount} cartas)`);

      // El jugador toma todas las cartas del mazo de descarte
      player.takeDiscardPile(takeResult.cardsTaken);

      // Resetear efectos especiales
      this.nextPlayerCanPlayAnything = false;

      console.log(`✅ ${player.name} ahora tiene ${player.hand.length} cartas en mano`);
    } else {
      console.log(`⚠️ ${takeResult.message}`);
    }
  }

  // Forzar al jugador a tomar la Torre de los Pecados (automático)
  forceTakeDiscardPile(playerId) {
    const player = this.players.find(p => p.id === playerId);
    if (!player) {
      console.log(`❌ Jugador no encontrado: ${playerId}`);
      return;
    }

    const takeResult = this.towerOfSins.takeAllCards(playerId);
    
    if (takeResult.success) {
      console.log(`📥 ${player.name} toma automáticamente la Torre de los Pecados (${takeResult.cardCount} cartas)`);
      
      // El jugador toma todas las cartas del mazo de descarte
      player.takeDiscardPile(takeResult.cardsTaken);
      
      // Resetear efectos especiales
      this.nextPlayerCanPlayAnything = false;
      
      console.log(`✅ ${player.name} ahora tiene ${player.hand.length} cartas en mano`);
    } else {
      console.log(`⚠️ ${takeResult.message}`);
    }
  }

    // Purificar el mazo (cartas del mismo valor o carta 10)
  purifyPile() {
    const purifyResult = this.towerOfSins.purify('mismo valor o carta 10');
    
    // Resetear efectos especiales
    this.nextPlayerCanPlayAnything = false;
    this.skippedPlayer = null; // Resetear efecto de salto también
    
    // El mismo jugador comienza la nueva ronda
    // (no se cambia el turno)

    console.log(`✅ ${purifyResult.message}`);
  }

  // Verificar fin del juego
  checkGameEnd() {
    const winners = this.players.filter(p => p.hasWon());
    const activePlayers = this.players.filter(p => !p.hasWon());
    
    console.log(`🔍 Verificando fin del juego: ${winners.length} ganadores, ${activePlayers.length} jugadores activos`);
    
    // Si hay al menos un ganador y solo queda un jugador activo (o ninguno)
    if (winners.length > 0 && activePlayers.length <= 1) {
      const winner = winners[0]; // El primer ganador
      const sinner = activePlayers.length > 0 ? activePlayers[0] : null;
      
      console.log(`🎯 Fin del juego detectado:`);
      console.log(`  - Ganador: ${winner.name}`);
      console.log(`  - Pecador: ${sinner ? sinner.name : 'Ninguno (todos ganaron)'}`);
      
      this.endGame(winner, sinner);
      return true;
    }
    
    // Si todos los jugadores ganaron (caso especial)
    if (winners.length === this.players.length) {
      console.log(`🎉 ¡Todos los jugadores ganaron! (caso especial)`);
      this.endGame(winners[0], null); // No hay pecador
      return true;
    }
    
    return false;
  }

  // Terminar juego
  endGame(winner = null, sinner = null) {
    console.log(`🎮 Finalizando juego...`);
    
    this.gameState = 'finished';
    
    if (this.turnTimer) {
      clearTimeout(this.turnTimer);
      this.turnTimer = null;
    }

    // Determinar ganador y pecador
    if (winner) {
      this.winner = winner;
      winner.score += 100;
      console.log(`🏆 Ganador: ${winner.name} (Score: ${winner.score})`);
    }
    
    if (sinner) {
      this.sinner = sinner;
      sinner.markAsSinner();
      console.log(`😈 Pecador: ${sinner.name} - Debe cargar con la Torre de los Pecados`);
    } else {
      // Si no hay pecador explícito, el último jugador activo es el pecador
      const activePlayers = this.players.filter(p => !p.hasWon());
      if (activePlayers.length > 0) {
        this.sinner = activePlayers[0];
        this.sinner.markAsSinner();
        console.log(`😈 Pecador automático: ${this.sinner.name} - Último jugador con cartas`);
      }
    }
    
    // Mostrar resumen final
    this.showGameSummary();
  }

  // Obtener estado del juego para un jugador específico
  getGameState(playerId) {
    const currentPlayer = this.players[this.currentPlayerIndex];
    
    return {
      roomId: this.roomId,
      gameState: this.gameState,
      currentPlayerId: currentPlayer ? currentPlayer.id : null,
      currentPlayerName: currentPlayer ? currentPlayer.name : null,
      turnNumber: this.turnNumber,
      turnStartTime: this.turnStartTime,
      turnTimeRemaining: this.getTurnTimeRemaining(),
      players: this.players.map(p => {
        if (p.id === playerId) {
          return p.getFullInfo(); // Información completa para el jugador actual
        } else {
          return p.getPublicInfo(); // Información pública para otros jugadores
        }
      }),
      towerOfSins: this.towerOfSins.getPublicInfo(),
      nextPlayerCanPlayAnything: this.nextPlayerCanPlayAnything,
      skippedPlayer: this.skippedPlayer,
      winner: this.winner ? this.winner.getPublicInfo() : null,
      sinner: this.sinner ? this.sinner.getPublicInfo() : null,
      turnTime: this.turnTime,
      deckType: this.deckType
    };
  }

  // Obtener información pública del juego
  getPublicInfo() {
    return {
      roomId: this.roomId,
      maxPlayers: this.maxPlayers,
      currentPlayers: this.players.length,
      gameState: this.gameState,
      createdAt: this.createdAt,
      deckType: this.deckType
    };
  }

  // Obtener cartas jugables para un jugador
  getPlayableCards(playerId) {
    const player = this.players.find(p => p.id === playerId);
    if (!player) return [];

    const playableCards = player.getPlayableCards();
    return playableCards.filter(card => {
      // Verificar si la carta puede ser jugada según la Torre de los Pecados
      const towerValidation = this.towerOfSins.canPlayCard(card);
      return towerValidation.canPlay;
    });
  }

  // Verificar si un jugador puede jugar
  canPlayerPlay(playerId) {
    const player = this.players.find(p => p.id === playerId);
    if (!player) return false;

    const playableCards = player.getPlayableCards();
    
    // Verificar si alguna carta puede ser jugada según la Torre de los Pecados
    return playableCards.some(card => {
      const towerValidation = this.towerOfSins.canPlayCard(card);
      return towerValidation.canPlay;
    });
  }

  // Obtener tiempo restante del turno
  getTurnTimeRemaining() {
    if (!this.turnStartTime || this.gameState !== 'playing') {
      return this.turnTime;
    }
    
    const elapsed = Math.floor((Date.now() - this.turnStartTime.getTime()) / 1000);
    const remaining = Math.max(0, this.turnTime - elapsed);
    
    return remaining;
  }

  // Obtener información del turno actual
  getTurnInfo() {
    const currentPlayer = this.players[this.currentPlayerIndex];
    
    return {
      turnNumber: this.turnNumber,
      currentPlayer: currentPlayer ? {
        id: currentPlayer.id,
        name: currentPlayer.name,
        phase: currentPlayer.currentPhase
      } : null,
      turnStartTime: this.turnStartTime,
      turnTimeRemaining: this.getTurnTimeRemaining(),
      turnTime: this.turnTime,
      skippedPlayer: this.skippedPlayer
    };
  }

  // Mostrar resumen final del juego
  showGameSummary() {
    console.log(`\n📊 RESUMEN FINAL DEL JUEGO`);
    console.log(`========================`);
    console.log(`🎮 Estado: ${this.gameState}`);
    console.log(`🔄 Total de turnos: ${this.turnNumber}`);
    console.log(`📊 Torre de los Pecados final: ${this.towerOfSins.cards.length} cartas`);
    
    if (this.winner) {
      console.log(`🏆 GANADOR: ${this.winner.name} (Score: ${this.winner.score})`);
    }
    
    if (this.sinner) {
      console.log(`😈 PECADOR: ${this.sinner.name} - Debe cargar con la Torre de los Pecados`);
    }
    
    console.log(`\n👥 ESTADO DE LOS JUGADORES:`);
    this.players.forEach((player, index) => {
      const status = player.hasWon() ? '🏆 GANÓ' : 
                    player.isSinner ? '😈 PECADOR' : 
                    '⏳ EN JUEGO';
      console.log(`  ${index + 1}. ${player.name}: ${status} (${player.getTotalCardsRemaining()} cartas restantes)`);
    });
    
    console.log(`========================\n`);
  }
}

module.exports = Game;
