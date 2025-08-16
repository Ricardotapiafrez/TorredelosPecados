const { getThematicDeck } = require('../models/Card');

class AIService {
  constructor() {
    this.difficultyLevels = {
      beginner: {
        name: 'Principiante',
        description: 'Decisiones aleatorias, ideal para práctica',
        randomFactor: 0.8,
        strategyWeight: 0.2
      },
      intermediate: {
        name: 'Intermedio',
        description: 'Estrategia básica con algunas decisiones inteligentes',
        randomFactor: 0.4,
        strategyWeight: 0.6
      },
      advanced: {
        name: 'Avanzado',
        description: 'Estrategia compleja con análisis de probabilidades',
        randomFactor: 0.2,
        strategyWeight: 0.8
      },
      expert: {
        name: 'Experto',
        description: 'Análisis profundo y estrategia óptima',
        randomFactor: 0.1,
        strategyWeight: 0.9
      }
    };

    // Estrategias por mazo temático
    this.deckStrategies = {
      angels: {
        name: 'Estrategia Celestial',
        description: 'Enfoque en protección y curación',
        priorities: ['defense', 'healing', 'control', 'attack'],
        preferredCards: [2, 8, 10], // Cartas especiales
        riskTolerance: 0.3
      },
      demons: {
        name: 'Estrategia Infernal',
        description: 'Enfoque agresivo y destructivo',
        priorities: ['attack', 'control', 'defense', 'healing'],
        preferredCards: [2, 8, 10],
        riskTolerance: 0.7
      },
      dragons: {
        name: 'Estrategia Draconiana',
        description: 'Enfoque en poder y dominación',
        priorities: ['attack', 'defense', 'control', 'healing'],
        preferredCards: [2, 8, 10],
        riskTolerance: 0.5
      },
      mages: {
        name: 'Estrategia Arcana',
        description: 'Enfoque en control y manipulación',
        priorities: ['control', 'attack', 'defense', 'healing'],
        preferredCards: [2, 8, 10],
        riskTolerance: 0.4
      }
    };
  }

  // Algoritmo principal de decisión
  decideCard(gameState, playerId, difficulty = 'intermediate') {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player || !player.hand || player.hand.length === 0) {
      return null;
    }

    const difficultyConfig = this.difficultyLevels[difficulty];
    const deckStrategy = this.deckStrategies[gameState.deckType] || this.deckStrategies.angels;

    // Obtener cartas jugables
    const playableCards = this.getPlayableCards(gameState, player.hand);
    
    if (playableCards.length === 0) {
      return null; // No hay cartas jugables
    }

    // Aplicar factor aleatorio según dificultad
    if (Math.random() < difficultyConfig.randomFactor) {
      return this.randomDecision(playableCards);
    }

    // Aplicar estrategia según dificultad
    return this.strategicDecision(gameState, player, playableCards, deckStrategy, difficulty);
  }

  // Obtener cartas jugables según las reglas del juego
  getPlayableCards(gameState, hand) {
    const playableCards = [];
    
    for (let i = 0; i < hand.length; i++) {
      const card = hand[i];
      
      // Si es una carta especial (2, 8, 10) siempre se puede jugar
      if (card.isSpecial) {
        playableCards.push({ index: i, card, score: this.evaluateCard(card, gameState) });
        continue;
      }

      // Si no hay carta anterior, se puede jugar cualquier cosa
      if (!gameState.lastPlayedCard) {
        playableCards.push({ index: i, card, score: this.evaluateCard(card, gameState) });
        continue;
      }

      // Si el siguiente jugador puede jugar cualquier cosa (por efecto del 2)
      if (gameState.nextPlayerCanPlayAnything) {
        playableCards.push({ index: i, card, score: this.evaluateCard(card, gameState) });
        continue;
      }

      // Regla normal: debe ser igual o mayor valor
      if (card.value >= gameState.lastPlayedCard.value) {
        playableCards.push({ index: i, card, score: this.evaluateCard(card, gameState) });
      }
    }

    return playableCards;
  }

  // Evaluar el valor de una carta según el contexto del juego
  evaluateCard(card, gameState) {
    let score = 0;

    // Valor base de la carta
    score += card.value * 10;

    // Bonus por cartas especiales
    if (card.isSpecial) {
      score += this.evaluateSpecialCard(card, gameState);
    }

    // Bonus por purificación potencial
    if (this.willPurifyPile(card, gameState)) {
      score += 50; // Alto valor por purificar
    }

    // Penalización por cartas de alto valor (más difíciles de jugar después)
    if (card.value >= 10) {
      score -= 20;
    }

    // Bonus por cartas de bajo valor (más flexibles)
    if (card.value <= 5) {
      score += 15;
    }

    // Considerar el estado del juego
    score += this.evaluateGameState(card, gameState);

    return score;
  }

  // Evaluar cartas especiales
  evaluateSpecialCard(card, gameState) {
    switch (card.value) {
      case 2: // Poder Universal
        return this.evaluateUniversalPower(gameState);
      case 8: // Poder de Salto
        return this.evaluateSkipPower(gameState);
      case 10: // Poder de Purificación
        return this.evaluatePurificationPower(gameState);
      default:
        return 0;
    }
  }

  // Evaluar el Poder Universal (2)
  evaluateUniversalPower(gameState) {
    let score = 30; // Valor base

    // Si hay muchos jugadores, es más valioso
    if (gameState.players.length > 4) {
      score += 20;
    }

    // Si el siguiente jugador tiene muchas cartas, es más valioso
    const currentIndex = gameState.currentPlayerIndex;
    const nextIndex = (currentIndex + 1) % gameState.players.length;
    const nextPlayer = gameState.players[nextIndex];
    
    if (nextPlayer.hand.length > 5) {
      score += 15;
    }

    return score;
  }

  // Evaluar el Poder de Salto (8)
  evaluateSkipPower(gameState) {
    let score = 25; // Valor base

    // Si hay muchos jugadores, es más valioso
    if (gameState.players.length > 3) {
      score += 15;
    }

    // Si el siguiente jugador está cerca de ganar, es muy valioso
    const currentIndex = gameState.currentPlayerIndex;
    const nextIndex = (currentIndex + 1) % gameState.players.length;
    const nextPlayer = gameState.players[nextIndex];
    
    if (nextPlayer.hand.length <= 2) {
      score += 30;
    }

    return score;
  }

  // Evaluar el Poder de Purificación (10)
  evaluatePurificationPower(gameState) {
    let score = 40; // Valor base alto

    // Si hay muchas cartas en el mazo de descarte, es muy valioso
    if (gameState.discardPile.length > 10) {
      score += 30;
    }

    // Si otros jugadores tienen pocas cartas, es más valioso
    const playersWithFewCards = gameState.players.filter(p => p.hand.length <= 3).length;
    if (playersWithFewCards > 0) {
      score += playersWithFewCards * 10;
    }

    return score;
  }

  // Verificar si una carta purificará el mazo
  willPurifyPile(card, gameState) {
    const lastCard = gameState.lastPlayedCard;
    
    // Si es una carta 10, siempre purifica
    if (card.value === 10) return true;
    
    if (!lastCard) return false;
    
    // Si es el mismo valor que la última carta jugada, purifica
    if (card.value === lastCard.value) return true;
    
    // Si hay 4 cartas del mismo valor en el mazo (incluyendo la actual)
    const sameValueCards = gameState.discardPile.filter(c => c.value === card.value);
    return sameValueCards.length >= 3; // + la carta actual = 4
  }

  // Evaluar el estado del juego para tomar decisiones
  evaluateGameState(card, gameState) {
    let score = 0;

    // Si el jugador tiene pocas cartas, priorizar cartas de bajo valor
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.hand.length <= 3) {
      if (card.value <= 5) {
        score += 20;
      } else {
        score -= 10;
      }
    }

    // Si otros jugadores tienen pocas cartas, ser más agresivo
    const playersWithFewCards = gameState.players.filter(p => p.hand.length <= 2).length;
    if (playersWithFewCards > 0) {
      score += playersWithFewCards * 5;
    }

    // Si hay muchas cartas en el mazo de descarte, considerar purificación
    if (gameState.discardPile.length > 15) {
      if (this.willPurifyPile(card, gameState)) {
        score += 25;
      }
    }

    return score;
  }

  // Decisión aleatoria (para dificultad principiante)
  randomDecision(playableCards) {
    const randomIndex = Math.floor(Math.random() * playableCards.length);
    return playableCards[randomIndex];
  }

  // Decisión estratégica
  strategicDecision(gameState, player, playableCards, deckStrategy, difficulty) {
    // Ordenar cartas por puntuación
    playableCards.sort((a, b) => b.score - a.score);

    // Aplicar estrategia del mazo
    const strategyCards = this.applyDeckStrategy(playableCards, deckStrategy);

    // Aplicar nivel de dificultad
    return this.applyDifficultyLevel(strategyCards, difficulty);
  }

  // Aplicar estrategia específica del mazo
  applyDeckStrategy(playableCards, deckStrategy) {
    return playableCards.map(cardInfo => {
      let adjustedScore = cardInfo.score;

      // Ajustar según las prioridades del mazo
      if (deckStrategy.preferredCards.includes(cardInfo.card.value)) {
        adjustedScore += 20;
      }

      // Ajustar según la tolerancia al riesgo
      if (cardInfo.card.value >= 10 && deckStrategy.riskTolerance < 0.5) {
        adjustedScore -= 15;
      }

      return { ...cardInfo, score: adjustedScore };
    }).sort((a, b) => b.score - a.score);
  }

  // Aplicar nivel de dificultad
  applyDifficultyLevel(strategyCards, difficulty) {
    switch (difficulty) {
      case 'beginner':
        // 80% de probabilidad de elegir la mejor carta, 20% de elegir aleatoriamente
        return Math.random() < 0.8 ? strategyCards[0] : this.randomDecision(strategyCards);
      
      case 'intermediate':
        // 60% de probabilidad de elegir la mejor carta, 40% de elegir entre las 3 mejores
        if (Math.random() < 0.6) {
          return strategyCards[0];
        } else {
          const topCards = strategyCards.slice(0, Math.min(3, strategyCards.length));
          return topCards[Math.floor(Math.random() * topCards.length)];
        }
      
      case 'advanced':
        // 80% de probabilidad de elegir la mejor carta, 20% de elegir entre las 2 mejores
        if (Math.random() < 0.8) {
          return strategyCards[0];
        } else {
          const topCards = strategyCards.slice(0, Math.min(2, strategyCards.length));
          return topCards[Math.floor(Math.random() * topCards.length)];
        }
      
      case 'expert':
        // Siempre elegir la mejor carta
        return strategyCards[0];
      
      default:
        return strategyCards[0];
    }
  }

  // Obtener información de dificultad
  getDifficultyInfo(difficulty) {
    return this.difficultyLevels[difficulty] || this.difficultyLevels.intermediate;
  }

  // Obtener información de estrategia del mazo
  getDeckStrategyInfo(deckType) {
    return this.deckStrategies[deckType] || this.deckStrategies.angels;
  }

  // Obtener todas las dificultades disponibles
  getAvailableDifficulties() {
    return Object.keys(this.difficultyLevels);
  }

  // Obtener todas las estrategias de mazo disponibles
  getAvailableDeckStrategies() {
    return Object.keys(this.deckStrategies);
  }

  // Analizar la mano del jugador y sugerir la mejor jugada
  analyzeHand(gameState, playerId, difficulty = 'intermediate') {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player || !player.hand) {
      return { bestMove: null, analysis: 'No hay cartas disponibles' };
    }

    const playableCards = this.getPlayableCards(gameState, player.hand);
    
    if (playableCards.length === 0) {
      return { 
        bestMove: null, 
        analysis: 'No hay cartas jugables. Debes tomar el mazo de descarte.',
        recommendation: 'takeDiscardPile'
      };
    }

    const bestMove = this.decideCard(gameState, playerId, difficulty);
    
    const analysis = {
      totalCards: player.hand.length,
      playableCards: playableCards.length,
      bestCard: bestMove ? bestMove.card.name : null,
      bestScore: bestMove ? bestMove.score : 0,
      reasoning: this.explainDecision(bestMove, gameState, difficulty),
      alternatives: playableCards.slice(1, 4).map(c => ({
        card: c.card.name,
        score: c.score,
        reason: this.explainCardChoice(c, gameState)
      }))
    };

    return {
      bestMove,
      analysis,
      recommendation: 'playCard'
    };
  }

  // Explicar la decisión tomada
  explainDecision(bestMove, gameState, difficulty) {
    if (!bestMove) return 'No hay cartas jugables';

    const reasons = [];

    if (bestMove.card.isSpecial) {
      reasons.push(`Carta especial (${bestMove.card.value}) con efectos poderosos`);
    }

    if (this.willPurifyPile(bestMove.card, gameState)) {
      reasons.push('Puede purificar el mazo de descarte');
    }

    if (bestMove.card.value <= 5) {
      reasons.push('Carta de bajo valor, flexible para futuras jugadas');
    }

    if (bestMove.card.value >= 10) {
      reasons.push('Carta de alto valor, puede ser difícil de jugar después');
    }

    const difficultyInfo = this.getDifficultyInfo(difficulty);
    reasons.push(`Nivel de dificultad: ${difficultyInfo.name}`);

    return reasons.join('. ');
  }

  // Explicar por qué se eligió una carta específica
  explainCardChoice(cardInfo, gameState) {
    const reasons = [];

    if (cardInfo.card.isSpecial) {
      reasons.push('Carta especial');
    }

    if (this.willPurifyPile(cardInfo.card, gameState)) {
      reasons.push('Purifica mazo');
    }

    reasons.push(`Puntuación: ${cardInfo.score}`);

    return reasons.join(', ');
  }
}

module.exports = AIService;
