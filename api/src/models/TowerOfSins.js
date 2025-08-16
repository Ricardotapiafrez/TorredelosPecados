const { v4: uuidv4 } = require('uuid');

/**
 * 🏰 Torre de los Pecados - Sistema de Gestión del Mazo de Descarte
 * 
 * Esta clase maneja toda la lógica relacionada con la "Torre de los Pecados",
 * el mazo de descarte central del juego que acumula las cartas jugadas
 * y puede ser purificada bajo ciertas condiciones.
 */
class TowerOfSins {
  constructor() {
    this.id = uuidv4();
    this.cards = []; // Array de cartas en la Torre
    this.lastPlayedCard = null; // Última carta jugada
    this.purificationCount = 0; // Contador de purificaciones
    this.maxCardsBeforeWarning = 20; // Advertencia cuando hay muchas cartas
    this.createdAt = new Date();
    this.lastModified = new Date();
    
    console.log(`🏰 Torre de los Pecados creada (ID: ${this.id})`);
  }

  /**
   * 📥 Agregar carta a la Torre de los Pecados
   * @param {Card} card - Carta a agregar
   * @param {string} playerId - ID del jugador que jugó la carta
   * @returns {Object} Información sobre la acción realizada
   */
  addCard(card, playerId) {
    if (!card) {
      throw new Error('No se puede agregar una carta nula a la Torre de los Pecados');
    }

    console.log(`📥 Agregando ${card.name} (valor: ${card.value}) a la Torre de los Pecados`);
    
    // Agregar la carta a la Torre
    this.cards.push({
      card: card,
      playerId: playerId,
      timestamp: new Date(),
      cardId: uuidv4()
    });
    
    // Actualizar última carta jugada
    this.lastPlayedCard = card;
    this.lastModified = new Date();
    
    // Verificar si hay demasiadas cartas
    if (this.cards.length >= this.maxCardsBeforeWarning) {
      console.log(`⚠️ ¡Advertencia! La Torre de los Pecados tiene ${this.cards.length} cartas`);
    }
    
    return {
      success: true,
      cardAdded: card.getPublicInfo(),
      towerSize: this.cards.length,
      wasPurified: false,
      message: `Carta ${card.name} agregada a la Torre de los Pecados`
    };
  }

  /**
   * 🧹 Purificar la Torre de los Pecados
   * @param {string} reason - Razón de la purificación
   * @returns {Object} Información sobre la purificación
   */
  purify(reason = 'purificación') {
    const cardsRemoved = this.cards.length;
    
    console.log(`🧹 Purificando Torre de los Pecados (${cardsRemoved} cartas eliminadas) - Razón: ${reason}`);
    
    // Limpiar la Torre
    this.cards = [];
    this.lastPlayedCard = null;
    this.purificationCount++;
    this.lastModified = new Date();
    
    console.log(`✅ Torre de los Pecados purificada. Nueva ronda iniciada.`);
    
    return {
      success: true,
      cardsRemoved: cardsRemoved,
      purificationCount: this.purificationCount,
      message: `La Torre de los Pecados ha sido purificada (${cardsRemoved} cartas eliminadas)`,
      reason: reason
    };
  }

  /**
   * 📤 Tomar toda la Torre de los Pecados
   * @param {string} playerId - ID del jugador que toma la Torre
   * @returns {Object} Información sobre las cartas tomadas
   */
  takeAllCards(playerId) {
    if (this.cards.length === 0) {
      return {
        success: false,
        message: 'La Torre de los Pecados está vacía',
        cardsTaken: []
      };
    }

    const cardsTaken = [...this.cards];
    const cardCount = cardsTaken.length;
    
    console.log(`📤 Jugador ${playerId} toma toda la Torre de los Pecados (${cardCount} cartas)`);
    
    // Limpiar la Torre
    this.cards = [];
    this.lastPlayedCard = null;
    this.lastModified = new Date();
    
    return {
      success: true,
      cardsTaken: cardsTaken.map(entry => entry.card),
      cardCount: cardCount,
      message: `Se tomaron ${cardCount} cartas de la Torre de los Pecados`,
      playerId: playerId
    };
  }

  /**
   * 🎯 Verificar si una carta puede ser jugada
   * @param {Card} card - Carta a verificar
   * @returns {Object} Resultado de la validación
   */
  canPlayCard(card) {
    if (!card) {
      return {
        canPlay: false,
        reason: 'Carta nula'
      };
    }

    // Si no hay última carta jugada, cualquier carta es válida
    if (!this.lastPlayedCard) {
      return {
        canPlay: true,
        reason: 'Primera carta del juego'
      };
    }

    // Cartas especiales siempre se pueden jugar
    if (card.isSpecial) {
      return {
        canPlay: true,
        reason: 'Carta especial'
      };
    }

    // Verificar si el valor es igual o mayor
    if (card.value >= this.lastPlayedCard.value) {
      return {
        canPlay: true,
        reason: `Valor válido (${card.value} >= ${this.lastPlayedCard.value})`
      };
    }

    return {
      canPlay: false,
      reason: `Valor insuficiente (${card.value} < ${this.lastPlayedCard.value})`
    };
  }

  /**
   * 🔍 Verificar si una carta purificará la Torre
   * @param {Card} card - Carta a verificar
   * @returns {Object} Información sobre la purificación
   */
  willPurify(card) {
    if (!card) {
      return {
        willPurify: false,
        reason: 'Carta nula'
      };
    }

    // Carta 10 siempre purifica
    if (card.value === 10) {
      return {
        willPurify: true,
        reason: 'Carta 10 - Purificación automática',
        type: 'card_10'
      };
    }

    // Si no hay última carta, no puede purificar
    if (!this.lastPlayedCard) {
      return {
        willPurify: false,
        reason: 'No hay carta anterior para comparar'
      };
    }

    // Mismo valor que la última carta jugada
    if (card.value === this.lastPlayedCard.value) {
      return {
        willPurify: true,
        reason: `Mismo valor que la última carta (${card.value})`,
        type: 'same_value'
      };
    }

    // Verificar acumulación de 4 cartas del mismo valor
    const sameValueCards = this.cards.filter(entry => entry.card.value === card.value);
    if (sameValueCards.length >= 3) { // + la carta actual = 4
      return {
        willPurify: true,
        reason: `Acumulación de 4 cartas del valor ${card.value}`,
        type: 'accumulation',
        count: sameValueCards.length + 1
      };
    }

    return {
      willPurify: false,
      reason: 'No cumple condiciones de purificación'
    };
  }

  /**
   * 📊 Obtener estadísticas de la Torre
   * @returns {Object} Estadísticas detalladas
   */
  getStats() {
    const valueCounts = {};
    const playerCounts = {};
    
    this.cards.forEach(entry => {
      // Contar por valor
      const value = entry.card.value;
      valueCounts[value] = (valueCounts[value] || 0) + 1;
      
      // Contar por jugador
      const playerId = entry.playerId;
      playerCounts[playerId] = (playerCounts[playerId] || 0) + 1;
    });

    return {
      totalCards: this.cards.length,
      lastPlayedCard: this.lastPlayedCard ? this.lastPlayedCard.getPublicInfo() : null,
      purificationCount: this.purificationCount,
      valueDistribution: valueCounts,
      playerDistribution: playerCounts,
      createdAt: this.createdAt,
      lastModified: this.lastModified,
      isDangerous: this.cards.length >= this.maxCardsBeforeWarning
    };
  }

  /**
   * 📋 Obtener información pública de la Torre
   * @returns {Object} Información pública
   */
  getPublicInfo() {
    return {
      id: this.id,
      cardCount: this.cards.length,
      lastPlayedCard: this.lastPlayedCard ? this.lastPlayedCard.getPublicInfo() : null,
      purificationCount: this.purificationCount,
      isDangerous: this.cards.length >= this.maxCardsBeforeWarning,
      lastModified: this.lastModified
    };
  }

  /**
   * 📋 Obtener información completa de la Torre (para debugging)
   * @returns {Object} Información completa
   */
  getFullInfo() {
    return {
      id: this.id,
      cards: this.cards.map(entry => ({
        card: entry.card.getPublicInfo(),
        playerId: entry.playerId,
        timestamp: entry.timestamp,
        cardId: entry.cardId
      })),
      lastPlayedCard: this.lastPlayedCard ? this.lastPlayedCard.getPublicInfo() : null,
      purificationCount: this.purificationCount,
      maxCardsBeforeWarning: this.maxCardsBeforeWarning,
      createdAt: this.createdAt,
      lastModified: this.lastModified,
      stats: this.getStats()
    };
  }

  /**
   * 🔄 Reiniciar la Torre
   * @returns {Object} Información sobre el reinicio
   */
  reset() {
    const previousCardCount = this.cards.length;
    
    console.log(`🔄 Reiniciando Torre de los Pecados (${previousCardCount} cartas eliminadas)`);
    
    this.cards = [];
    this.lastPlayedCard = null;
    this.purificationCount = 0;
    this.lastModified = new Date();
    
    return {
      success: true,
      previousCardCount: previousCardCount,
      message: `Torre de los Pecados reiniciada (${previousCardCount} cartas eliminadas)`
    };
  }

  /**
   * 🎯 Obtener cartas por valor
   * @param {number} value - Valor a buscar
   * @returns {Array} Cartas con ese valor
   */
  getCardsByValue(value) {
    return this.cards
      .filter(entry => entry.card.value === value)
      .map(entry => entry.card);
  }

  /**
   * 👤 Obtener cartas por jugador
   * @param {string} playerId - ID del jugador
   * @returns {Array} Cartas jugadas por ese jugador
   */
  getCardsByPlayer(playerId) {
    return this.cards
      .filter(entry => entry.playerId === playerId)
      .map(entry => entry.card);
  }

  /**
   * ⏰ Verificar si la Torre está "peligrosa" (muchas cartas)
   * @returns {boolean} True si hay demasiadas cartas
   */
  isDangerous() {
    return this.cards.length >= this.maxCardsBeforeWarning;
  }

  /**
   * 📈 Obtener tendencia de la Torre
   * @returns {string} Tendencia actual
   */
  getTrend() {
    if (this.cards.length === 0) return 'vacía';
    if (this.cards.length < 5) return 'pequeña';
    if (this.cards.length < 10) return 'mediana';
    if (this.cards.length < 15) return 'grande';
    return 'peligrosa';
  }
}

module.exports = TowerOfSins;
