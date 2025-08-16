const AIService = require('../../../src/services/AIService');

describe('AIService', () => {
  let aiService;

  beforeEach(() => {
    aiService = new AIService();
  });

  describe('Constructor', () => {
    test('should initialize with difficulty levels', () => {
      expect(aiService.difficultyLevels).toBeDefined();
      expect(aiService.difficultyLevels.beginner).toBeDefined();
      expect(aiService.difficultyLevels.expert).toBeDefined();
    });

    test('should initialize with deck strategies', () => {
      expect(aiService.deckStrategies).toBeDefined();
      expect(aiService.deckStrategies.angels).toBeDefined();
      expect(aiService.deckStrategies.demons).toBeDefined();
    });
  });

  describe('getAvailableDifficulties', () => {
    test('should return all difficulty levels', () => {
      const difficulties = aiService.getAvailableDifficulties();
      expect(difficulties).toContain('beginner');
      expect(difficulties).toContain('intermediate');
      expect(difficulties).toContain('advanced');
      expect(difficulties).toContain('expert');
    });
  });

  describe('getAvailableDeckStrategies', () => {
    test('should return all deck strategies', () => {
      const strategies = aiService.getAvailableDeckStrategies();
      expect(strategies).toContain('angels');
      expect(strategies).toContain('demons');
      expect(strategies).toContain('dragons');
      expect(strategies).toContain('mages');
    });
  });

  describe('getDifficultyInfo', () => {
    test('should return difficulty info for valid difficulty', () => {
      const info = aiService.getDifficultyInfo('intermediate');
      expect(info.name).toBe('Intermedio');
      expect(info.description).toBeDefined();
      expect(info.randomFactor).toBeDefined();
      expect(info.strategyWeight).toBeDefined();
    });

    test('should return default difficulty for invalid difficulty', () => {
      const info = aiService.getDifficultyInfo('invalid');
      expect(info.name).toBe('Intermedio');
    });
  });

  describe('getDeckStrategyInfo', () => {
    test('should return strategy info for valid deck type', () => {
      const info = aiService.getDeckStrategyInfo('angels');
      expect(info.name).toBe('Estrategia Celestial');
      expect(info.description).toBeDefined();
      expect(info.priorities).toBeDefined();
      expect(info.preferredCards).toBeDefined();
    });

    test('should return default strategy for invalid deck type', () => {
      const info = aiService.getDeckStrategyInfo('invalid');
      expect(info.name).toBe('Estrategia Celestial');
    });
  });

  describe('getPlayableCards', () => {
    test('should return all cards when no last played card', () => {
      const gameState = {
        lastPlayedCard: null,
        nextPlayerCanPlayAnything: false
      };
      const hand = [
        { id: 1, name: 'Carta 1', value: 5, isSpecial: false },
        { id: 2, name: 'Carta 2', value: 10, isSpecial: true },
        { id: 3, name: 'Carta 3', value: 7, isSpecial: false }
      ];

      const playableCards = aiService.getPlayableCards(gameState, hand);
      expect(playableCards).toHaveLength(3);
    });

    test('should return special cards even when not playable by value', () => {
      const gameState = {
        lastPlayedCard: { value: 10 },
        nextPlayerCanPlayAnything: false
      };
      const hand = [
        { id: 1, name: 'Carta 1', value: 5, isSpecial: false },
        { id: 2, name: 'Carta 2', value: 2, isSpecial: true },
        { id: 3, name: 'Carta 3', value: 7, isSpecial: false }
      ];

      const playableCards = aiService.getPlayableCards(gameState, hand);
      expect(playableCards).toHaveLength(1);
      expect(playableCards[0].card.value).toBe(2);
    });

    test('should return cards with equal or higher value', () => {
      const gameState = {
        lastPlayedCard: { value: 7 },
        nextPlayerCanPlayAnything: false
      };
      const hand = [
        { id: 1, name: 'Carta 1', value: 5, isSpecial: false },
        { id: 2, name: 'Carta 2', value: 7, isSpecial: false },
        { id: 3, name: 'Carta 3', value: 10, isSpecial: false }
      ];

      const playableCards = aiService.getPlayableCards(gameState, hand);
      expect(playableCards).toHaveLength(2);
      expect(playableCards[0].card.value).toBe(7);
      expect(playableCards[1].card.value).toBe(10);
    });
  });

  describe('evaluateCard', () => {
    test('should evaluate basic card value', () => {
      const gameState = {
        players: [],
        discardPile: []
      };
      const card = { value: 5, isSpecial: false };

      const score = aiService.evaluateCard(card, gameState);
      expect(score).toBeGreaterThan(0);
    });

    test('should give bonus to special cards', () => {
      const gameState = {
        players: [],
        discardPile: []
      };
      const specialCard = { value: 2, isSpecial: true };
      const normalCard = { value: 2, isSpecial: false };

      const specialScore = aiService.evaluateCard(specialCard, gameState);
      const normalScore = aiService.evaluateCard(normalCard, gameState);
      
      expect(specialScore).toBeGreaterThan(normalScore);
    });

    test('should give bonus for purification potential', () => {
      const gameState = {
        lastPlayedCard: { value: 5 },
        discardPile: [],
        players: []
      };
      const card = { value: 5, isSpecial: false };

      const score = aiService.evaluateCard(card, gameState);
      expect(score).toBeGreaterThan(50); // Should have purification bonus
    });
  });

  describe('willPurifyPile', () => {
    test('should return true for card 10', () => {
      const gameState = { lastPlayedCard: { value: 7 } };
      const card = { value: 10 };

      const willPurify = aiService.willPurifyPile(card, gameState);
      expect(willPurify).toBe(true);
    });

    test('should return true for same value as last card', () => {
      const gameState = { lastPlayedCard: { value: 7 } };
      const card = { value: 7 };

      const willPurify = aiService.willPurifyPile(card, gameState);
      expect(willPurify).toBe(true);
    });

    test('should return false for different value', () => {
      const gameState = { lastPlayedCard: { value: 7 } };
      const card = { value: 8 };

      const willPurify = aiService.willPurifyPile(card, gameState);
      expect(willPurify).toBe(false);
    });
  });

  describe('decideCard', () => {
    test('should return null for empty hand', () => {
      const gameState = {
        players: [{ id: 'player1', hand: [] }],
        deckType: 'angels'
      };

      const decision = aiService.decideCard(gameState, 'player1', 'intermediate');
      expect(decision).toBeNull();
    });

    test('should return a decision for valid hand', () => {
      const gameState = {
        players: [{
          id: 'player1',
          hand: [
            { id: 1, name: 'Carta 1', value: 5, isSpecial: false },
            { id: 2, name: 'Carta 2', value: 2, isSpecial: true }
          ]
        }],
        lastPlayedCard: null,
        deckType: 'angels'
      };

      const decision = aiService.decideCard(gameState, 'player1', 'intermediate');
      expect(decision).toBeDefined();
      expect(decision.card).toBeDefined();
      expect(decision.index).toBeDefined();
    });
  });

  describe('analyzeHand', () => {
    test('should analyze hand and provide recommendation', () => {
      const gameState = {
        players: [{
          id: 'player1',
          hand: [
            { id: 1, name: 'Carta 1', value: 5, isSpecial: false },
            { id: 2, name: 'Carta 2', value: 2, isSpecial: true }
          ]
        }],
        lastPlayedCard: null,
        deckType: 'angels'
      };

      const analysis = aiService.analyzeHand(gameState, 'player1', 'intermediate');
      expect(analysis.bestMove).toBeDefined();
      expect(analysis.analysis).toBeDefined();
      expect(analysis.recommendation).toBeDefined();
    });

    test('should recommend takeDiscardPile when no playable cards', () => {
      const gameState = {
        players: [{
          id: 'player1',
          hand: [
            { id: 1, name: 'Carta 1', value: 5, isSpecial: false }
          ]
        }],
        lastPlayedCard: { value: 10 },
        deckType: 'angels'
      };

      const analysis = aiService.analyzeHand(gameState, 'player1', 'intermediate');
      expect(analysis.recommendation).toBe('takeDiscardPile');
    });
  });

  describe('explainDecision', () => {
    test('should explain decision for valid move', () => {
      const gameState = {
        players: [],
        deckType: 'angels'
      };
      const bestMove = {
        card: { name: 'Carta 2', value: 2, isSpecial: true }
      };

      const explanation = aiService.explainDecision(bestMove, gameState, 'intermediate');
      expect(explanation).toContain('Carta especial');
      expect(explanation).toContain('Intermedio');
    });

    test('should handle null bestMove', () => {
      const gameState = { players: [], deckType: 'angels' };
      const explanation = aiService.explainDecision(null, gameState, 'intermediate');
      expect(explanation).toBe('No hay cartas jugables');
    });
  });

  describe('Difficulty levels', () => {
    test('beginner should have high random factor', () => {
      const info = aiService.getDifficultyInfo('beginner');
      expect(info.randomFactor).toBeGreaterThan(0.5);
    });

    test('expert should have low random factor', () => {
      const info = aiService.getDifficultyInfo('expert');
      expect(info.randomFactor).toBeLessThan(0.2);
    });

    test('intermediate should have balanced factors', () => {
      const info = aiService.getDifficultyInfo('intermediate');
      expect(info.randomFactor).toBe(0.4);
      expect(info.strategyWeight).toBe(0.6);
    });
  });

  describe('Deck strategies', () => {
    test('angels should have defensive priorities', () => {
      const strategy = aiService.getDeckStrategyInfo('angels');
      expect(strategy.priorities[0]).toBe('defense');
      expect(strategy.riskTolerance).toBeLessThan(0.5);
    });

    test('demons should have aggressive priorities', () => {
      const strategy = aiService.getDeckStrategyInfo('demons');
      expect(strategy.priorities[0]).toBe('attack');
      expect(strategy.riskTolerance).toBeGreaterThan(0.5);
    });

    test('all strategies should have preferred cards', () => {
      const strategies = ['angels', 'demons', 'dragons', 'mages'];
      strategies.forEach(deckType => {
        const strategy = aiService.getDeckStrategyInfo(deckType);
        expect(strategy.preferredCards).toContain(2);
        expect(strategy.preferredCards).toContain(8);
        expect(strategy.preferredCards).toContain(10);
      });
    });
  });
});
