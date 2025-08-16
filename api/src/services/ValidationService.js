class ValidationService {
  constructor() {
    this.validationRules = {
      // Reglas básicas de validación
      BASIC: this.validateBasicRules,
      // Reglas de turno
      TURN: this.validateTurn,
      // Reglas de cartas especiales
      SPECIAL_CARDS: this.validateSpecialCards,
      // Reglas de fase del juego
      PHASE: this.validatePhase,
      // Reglas de purificación
      PURIFICATION: this.validatePurification
    };
  }

  // Validar una jugada completa
  validatePlay(game, playerId, cardIndex, targetPlayerId = null) {
    const validationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      card: null,
      canPlay: false,
      playableCards: []
    };

    try {
      // Obtener el jugador
      const player = game.players.find(p => p.id === playerId);
      if (!player) {
        validationResult.errors.push('Jugador no encontrado');
        validationResult.isValid = false;
        return validationResult;
      }

      // Validar reglas básicas
      const basicValidation = this.validateBasicRules(game, player, cardIndex);
      if (!basicValidation.isValid) {
        validationResult.errors.push(...basicValidation.errors);
        validationResult.isValid = false;
        return validationResult;
      }

      // Obtener la carta
      const playableCards = player.getPlayableCards();
      const card = playableCards[cardIndex];
      validationResult.card = card;

      // Validar turno
      const turnValidation = this.validateTurn(game, playerId);
      if (!turnValidation.isValid) {
        validationResult.errors.push(...turnValidation.errors);
        validationResult.isValid = false;
        return validationResult;
      }

      // Validar si la carta puede ser jugada
      const cardValidation = this.validateCardPlayability(game, card, playerId);
      if (!cardValidation.isValid) {
        validationResult.errors.push(...cardValidation.errors);
        validationResult.isValid = false;
        return validationResult;
      }

      // Validar fase del juego
      const phaseValidation = this.validatePhase(game, player, cardIndex);
      if (!phaseValidation.isValid) {
        validationResult.errors.push(...phaseValidation.errors);
        validationResult.isValid = false;
        return validationResult;
      }

      // Validar purificación si aplica
      const purificationValidation = this.validatePurification(game, card);
      if (purificationValidation.willPurify) {
        validationResult.warnings.push('Esta carta purificará la Torre de los Pecados');
      }

      // Obtener todas las cartas jugables para el jugador
      validationResult.playableCards = this.getPlayableCardsForPlayer(game, playerId);
      validationResult.canPlay = true;

    } catch (error) {
      validationResult.errors.push(`Error de validación: ${error.message}`);
      validationResult.isValid = false;
    }

    return validationResult;
  }

  // Validar reglas básicas
  validateBasicRules(game, player, cardIndex) {
    const result = { isValid: true, errors: [] };

    // Verificar que el juego esté en estado de juego
    if (game.gameState !== 'playing') {
      result.errors.push('El juego no está en progreso');
      result.isValid = false;
    }

    // Verificar que el jugador no haya ganado
    if (player.hasWon()) {
      result.errors.push('El jugador ya ha ganado');
      result.isValid = false;
    }

    // Verificar que el jugador esté vivo
    if (!player.isAlive) {
      result.errors.push('El jugador no está vivo');
      result.isValid = false;
    }

    // Verificar índice de carta válido
    const playableCards = player.getPlayableCards();
    if (cardIndex < 0 || cardIndex >= playableCards.length) {
      result.errors.push('Índice de carta no válido');
      result.isValid = false;
    }

    return result;
  }

  // Validar turno del jugador
  validateTurn(game, playerId) {
    const result = { isValid: true, errors: [], warnings: [] };

    const currentPlayer = game.players[game.currentPlayerIndex];
    
    if (!currentPlayer) {
      result.errors.push('No hay jugador actual');
      result.isValid = false;
      return result;
    }
    
    if (playerId !== currentPlayer.id) {
      result.errors.push(`No es tu turno. Es el turno de ${currentPlayer.name}`);
      result.isValid = false;
      return result;
    }

    // Verificar si el jugador puede jugar
    const canPlay = this.canPlayerPlay(game, playerId);
    if (!canPlay) {
      result.warnings.push('No tienes cartas jugables. Debes tomar la Torre de los Pecados');
    }

    // Verificar tiempo restante del turno
    const timeRemaining = game.getTurnTimeRemaining();
    if (timeRemaining < 10) {
      result.warnings.push(`⚠️ Solo quedan ${timeRemaining} segundos en tu turno`);
    }

    return result;
  }

  // Validar si una carta puede ser jugada
  validateCardPlayability(game, card, playerId) {
    const result = { isValid: true, errors: [] };

    // Usar el método canBePlayed de la carta
    if (!card.canBePlayed(game, playerId)) {
      result.errors.push(`No puedes jugar ${card.name} en este momento`);
      result.isValid = false;
    }

    return result;
  }

  // Validar fase del juego
  validatePhase(game, player, cardIndex) {
    const result = { isValid: true, errors: [], warnings: [] };

    const playableCards = player.getPlayableCards();
    const card = playableCards[cardIndex];

    // Verificar que la carta esté disponible en la fase actual
    switch (player.currentPhase) {
      case 'hand':
        if (cardIndex >= player.hand.length) {
          result.errors.push('Carta no disponible en la mano');
          result.isValid = false;
        } else {
          result.warnings.push('Fase de la Mano: Robarás una carta del Pozo de Almas');
        }
        break;
      case 'faceUp':
        if (cardIndex >= player.faceUpCreatures.length) {
          result.errors.push('Carta no disponible en criaturas boca arriba');
          result.isValid = false;
        } else {
          result.warnings.push('Fase de Criaturas Boca Arriba: No puedes robar del Pozo de Almas');
        }
        break;
      case 'faceDown':
        if (cardIndex >= player.faceDownCreatures.length) {
          result.errors.push('Carta no disponible en criaturas boca abajo');
          result.isValid = false;
        } else {
          result.warnings.push('Fase de Criaturas Boca Abajo: Si la carta es inválida, tomarás la Torre de los Pecados');
          
          // Verificar si la carta podría ser inválida
          if (game.towerOfSins.lastPlayedCard && card && !card.isSpecial) {
            const towerValidation = game.towerOfSins.canPlayCard(card);
            if (!towerValidation.canPlay) {
              result.warnings.push(`⚠️ Esta carta (${card.value}) - ${towerValidation.reason} - tomarás la Torre de los Pecados`);
            }
          }
        }
        break;
      default:
        result.errors.push('Fase de juego no válida');
        result.isValid = false;
    }

    return result;
  }

  // Validar purificación
  validatePurification(game, card) {
    const result = { willPurify: false, message: '' };

    if (card.willPurifyPile(game)) {
      result.willPurify = true;
      result.message = 'Esta carta purificará la Torre de los Pecados';
    }

    return result;
  }

  // Obtener todas las cartas jugables para un jugador
  getPlayableCardsForPlayer(game, playerId) {
    const player = game.players.find(p => p.id === playerId);
    if (!player) return [];

    const playableCards = player.getPlayableCards();
    return playableCards.filter(card => card.canBePlayed(game, playerId));
  }

  // Verificar si un jugador puede jugar (tiene cartas jugables)
  canPlayerPlay(game, playerId) {
    const playableCards = this.getPlayableCardsForPlayer(game, playerId);
    return playableCards.length > 0;
  }

  // Obtener información de validación para el frontend
  getValidationInfo(game, playerId) {
    const player = game.players.find(p => p.id === playerId);
    if (!player) return null;

    const playableCards = this.getPlayableCardsForPlayer(game, playerId);
    const canPlay = playableCards.length > 0;
    const isCurrentTurn = game.players[game.currentPlayerIndex]?.id === playerId;

    return {
      canPlay,
      playableCards: playableCards.map(card => card.getPublicInfo()),
      currentPhase: player.currentPhase,
      handSize: player.hand.length,
      faceUpSize: player.faceUpCreatures.length,
      faceDownSize: player.faceDownCreatures.length,
      soulWellSize: player.soulWell.length,
      isCurrentTurn,
      turnInfo: game.getTurnInfo(),
      nextPlayerCanPlayAnything: game.nextPlayerCanPlayAnything,
      lastPlayedCard: game.towerOfSins.lastPlayedCard ? game.towerOfSins.lastPlayedCard.getPublicInfo() : null,
      discardPileSize: game.towerOfSins.cards.length,
      shouldTakeDiscardPile: this.shouldTakeDiscardPile(game, playerId),
      turnValidation: isCurrentTurn ? this.validateTurn(game, playerId) : null
    };
  }

  // Validar si un jugador debe tomar la Torre de los Pecados
  shouldTakeDiscardPile(game, playerId) {
    const player = game.players.find(p => p.id === playerId);
    if (!player) return false;

    // Si el jugador no tiene cartas jugables, debe tomar la Torre
    return !this.canPlayerPlay(game, playerId) && game.towerOfSins.cards.length > 0;
  }

  // Obtener estadísticas de validación
  getValidationStats(game) {
    const stats = {
      totalPlayers: game.players.length,
      playersWithPlayableCards: 0,
      playersWhoMustTakePile: 0,
      currentTurnPlayer: game.players[game.currentPlayerIndex]?.id || null,
      gamePhase: game.gameState,
      discardPileSize: game.discardPile.length,
      lastPlayedCard: game.lastPlayedCard ? game.lastPlayedCard.name : null,
      nextPlayerCanPlayAnything: game.nextPlayerCanPlayAnything,
      skippedPlayer: game.skippedPlayer
    };

    game.players.forEach(player => {
      if (this.canPlayerPlay(game, player.id)) {
        stats.playersWithPlayableCards++;
      }
      if (this.shouldTakeDiscardPile(game, player.id)) {
        stats.playersWhoMustTakePile++;
      }
    });

    return stats;
  }
}

module.exports = ValidationService;
