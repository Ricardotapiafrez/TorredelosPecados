const ValidationService = require('../../src/services/ValidationService');
const { Card, THEMATIC_DECKS } = require('../../src/models/Card');

describe('ValidationService', () => {
  let validationService;
  let testGame;
  let player1, player2;

  beforeEach(() => {
    validationService = new ValidationService();
    testGame = {
      roomId: 'test-room',
      status: 'playing',
      currentPlayerIndex: 0,
      players: [],
      discardPile: [],
      lastPlayedCard: null,
      nextPlayerCanPlayAnything: false,
      skippedPlayer: null
    };
    
    player1 = {
      id: 'player1',
      name: 'Player 1',
      hand: [],
      creatures: [],
      isConnected: true,
      isReady: true,
      score: 0,
      hasShield: false
    };
    
    player2 = {
      id: 'player2',
      name: 'Player 2',
      hand: [],
      creatures: [],
      isConnected: true,
      isReady: true,
      score: 0,
      hasShield: false
    };
    
    testGame.players = [player1, player2];
  });

  describe('validatePlayCard', () => {
    let testCard;

    beforeEach(() => {
      testCard = new Card(1, 'Test Card', 'criatura', 5, null, 'A test card', null, THEMATIC_DECKS.ANGELS, 5);
      player1.hand = [testCard];
    });

    test('should validate successful card play', () => {
      const result = validationService.validatePlayCard(testGame, 'player1', testCard.id);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe(null);
    });

    test('should reject if game is not in playing status', () => {
      testGame.status = 'waiting';
      
      const result = validationService.validatePlayCard(testGame, 'player1', testCard.id);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('El juego no ha comenzado');
    });

    test('should reject if not player turn', () => {
      const result = validationService.validatePlayCard(testGame, 'player2', testCard.id);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('no es tu turno');
    });

    test('should reject if player not found', () => {
      const result = validationService.validatePlayCard(testGame, 'nonexistent', testCard.id);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Jugador no encontrado');
    });

    test('should reject if card not in hand', () => {
      const result = validationService.validatePlayCard(testGame, 'player1', 999);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('no tienes esa carta');
    });

    test('should reject if card cannot be played', () => {
      const highCard = new Card(10, 'High Card', 'criatura', 10, null, 'High card', null, THEMATIC_DECKS.ANGELS, 10);
      testGame.lastPlayedCard = highCard;
      
      const result = validationService.validatePlayCard(testGame, 'player1', testCard.id);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('no puede jugar esa carta');
    });

    test('should allow special cards to be played always', () => {
      const specialCard = new Card(2, 'Special Card', 'criatura', 2, null, 'Special card', null, THEMATIC_DECKS.ANGELS, 2);
      const highCard = new Card(10, 'High Card', 'criatura', 10, null, 'High card', null, THEMATIC_DECKS.ANGELS, 10);
      
      player1.hand = [specialCard];
      testGame.lastPlayedCard = highCard;
      
      const result = validationService.validatePlayCard(testGame, 'player1', specialCard.id);
      
      expect(result.isValid).toBe(true);
    });

    test('should allow any card when nextPlayerCanPlayAnything is true', () => {
      const lowCard = new Card(1, 'Low Card', 'criatura', 1, null, 'Low card', null, THEMATIC_DECKS.ANGELS, 1);
      const highCard = new Card(10, 'High Card', 'criatura', 10, null, 'High card', null, THEMATIC_DECKS.ANGELS, 10);
      
      player1.hand = [lowCard];
      testGame.lastPlayedCard = highCard;
      testGame.nextPlayerCanPlayAnything = true;
      
      const result = validationService.validatePlayCard(testGame, 'player1', lowCard.id);
      
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateDrawCard', () => {
    test('should validate successful card draw', () => {
      const result = validationService.validateDrawCard(testGame, 'player1');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe(null);
    });

    test('should reject if game is not in playing status', () => {
      testGame.status = 'waiting';
      
      const result = validationService.validateDrawCard(testGame, 'player1');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('El juego no ha comenzado');
    });

    test('should reject if not player turn', () => {
      const result = validationService.validateDrawCard(testGame, 'player2');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('no es tu turno');
    });

    test('should reject if player not found', () => {
      const result = validationService.validateDrawCard(testGame, 'nonexistent');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Jugador no encontrado');
    });

    test('should reject if deck is empty', () => {
      testGame.deck = [];
      
      const result = validationService.validateDrawCard(testGame, 'player1');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('no hay más cartas');
    });
  });

  describe('validateStartGame', () => {
    test('should validate successful game start', () => {
      testGame.players = [player1, player2, player3];
      
      const result = validationService.validateStartGame(testGame);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe(null);
    });

    test('should reject if game already started', () => {
      testGame.status = 'playing';
      
      const result = validationService.validateStartGame(testGame);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('El juego ya ha comenzado');
    });

    test('should reject if insufficient players', () => {
      const result = validationService.validateStartGame(testGame);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('insuficientes jugadores');
    });

    test('should reject if too many players', () => {
      // Add more than max players
      for (let i = 0; i < 10; i++) {
        testGame.players.push({
          id: `player${i}`,
          name: `Player ${i}`,
          hand: [],
          creatures: [],
          isConnected: true,
          isReady: true,
          score: 0,
          hasShield: false
        });
      }
      
      const result = validationService.validateStartGame(testGame);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('demasiados jugadores');
    });
  });

  describe('validateJoinGame', () => {
    test('should validate successful join', () => {
      const result = validationService.validateJoinGame(testGame, 'player3', 'Player 3');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe(null);
    });

    test('should reject if game is full', () => {
      testGame.maxPlayers = 2;
      
      const result = validationService.validateJoinGame(testGame, 'player3', 'Player 3');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('La sala está llena');
    });

    test('should reject if game has started', () => {
      testGame.status = 'playing';
      
      const result = validationService.validateJoinGame(testGame, 'player3', 'Player 3');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('El juego ya ha comenzado');
    });

    test('should reject if player already exists', () => {
      const result = validationService.validateJoinGame(testGame, 'player1', 'Player 1');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Ya existe un jugador con ese nombre');
    });

    test('should reject invalid player name', () => {
      const result = validationService.validateJoinGame(testGame, 'player3', '');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('El nombre del jugador es requerido');
    });
  });

  describe('validateLeaveGame', () => {
    test('should validate successful leave', () => {
      const result = validationService.validateLeaveGame(testGame, 'player1');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe(null);
    });

    test('should reject if player not found', () => {
      const result = validationService.validateLeaveGame(testGame, 'nonexistent');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Jugador no encontrado');
    });

    test('should reject if game has started and player is current player', () => {
      testGame.status = 'playing';
      testGame.currentPlayerIndex = 0;
      
      const result = validationService.validateLeaveGame(testGame, 'player1');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('No puedes abandonar durante tu turno');
    });
  });

  describe('validateReady', () => {
    test('should validate successful ready', () => {
      const result = validationService.validateReady(testGame, 'player1');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe(null);
    });

    test('should reject if player not found', () => {
      const result = validationService.validateReady(testGame, 'nonexistent');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Jugador no encontrado');
    });

    test('should reject if game has started', () => {
      testGame.status = 'playing';
      
      const result = validationService.validateReady(testGame, 'player1');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('El juego ya ha comenzado');
    });
  });

  describe('validateGameState', () => {
    test('should validate valid game state', () => {
      const result = validationService.validateGameState(testGame);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should detect invalid game state', () => {
      testGame.currentPlayerIndex = 999; // Invalid index
      
      const result = validationService.validateGameState(testGame);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should detect missing required properties', () => {
      delete testGame.roomId;
      
      const result = validationService.validateGameState(testGame);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('roomId'))).toBe(true);
    });
  });

  describe('validatePlayerState', () => {
    test('should validate valid player state', () => {
      const result = validationService.validatePlayerState(player1);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should detect invalid player state', () => {
      player1.score = -1; // Invalid score
      
      const result = validationService.validatePlayerState(player1);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should detect missing required properties', () => {
      delete player1.id;
      
      const result = validationService.validatePlayerState(player1);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('id'))).toBe(true);
    });
  });

  describe('validateCard', () => {
    test('should validate valid card', () => {
      const card = new Card(1, 'Test Card', 'criatura', 5, null, 'A test card', null, THEMATIC_DECKS.ANGELS, 5);
      const result = validationService.validateCard(card);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should detect invalid card', () => {
      const card = new Card(1, 'Test Card', 'criatura', 5, null, 'A test card', null, THEMATIC_DECKS.ANGELS, 5);
      card.value = 15; // Invalid value
      
      const result = validationService.validateCard(card);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should detect missing required properties', () => {
      const card = { id: 1 }; // Missing required properties
      
      const result = validationService.validateCard(card);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('getPlayableCards', () => {
    let card1, card2, card3;

    beforeEach(() => {
      card1 = new Card(1, 'Card 1', 'criatura', 3, null, 'Card 1', null, THEMATIC_DECKS.ANGELS, 3);
      card2 = new Card(2, 'Card 2', 'criatura', 7, null, 'Card 2', null, THEMATIC_DECKS.ANGELS, 7);
      card3 = new Card(3, 'Special Card', 'criatura', 2, null, 'Special card', null, THEMATIC_DECKS.ANGELS, 2);
      
      player1.hand = [card1, card2, card3];
    });

    test('should return all cards when no last played card', () => {
      const playableCards = validationService.getPlayableCards(testGame, 'player1');
      
      expect(playableCards).toHaveLength(3);
      expect(playableCards).toContain(card1);
      expect(playableCards).toContain(card2);
      expect(playableCards).toContain(card3);
    });

    test('should return cards with equal or higher value', () => {
      testGame.lastPlayedCard = new Card(5, 'Last Card', 'criatura', 5, null, 'Last card', null, THEMATIC_DECKS.ANGELS, 5);
      
      const playableCards = validationService.getPlayableCards(testGame, 'player1');
      
      expect(playableCards).toHaveLength(2);
      expect(playableCards).toContain(card2); // value 7
      expect(playableCards).toContain(card3); // special card
      expect(playableCards).not.toContain(card1); // value 3
    });

    test('should return all cards when nextPlayerCanPlayAnything is true', () => {
      testGame.lastPlayedCard = new Card(10, 'High Card', 'criatura', 10, null, 'High card', null, THEMATIC_DECKS.ANGELS, 10);
      testGame.nextPlayerCanPlayAnything = true;
      
      const playableCards = validationService.getPlayableCards(testGame, 'player1');
      
      expect(playableCards).toHaveLength(3);
    });

    test('should always return special cards', () => {
      testGame.lastPlayedCard = new Card(10, 'High Card', 'criatura', 10, null, 'High card', null, THEMATIC_DECKS.ANGELS, 10);
      
      const playableCards = validationService.getPlayableCards(testGame, 'player1');
      
      expect(playableCards).toContain(card3); // special card
    });
  });

  describe('isValidGameAction', () => {
    test('should validate valid game actions', () => {
      const validActions = ['playCard', 'drawCard', 'ready', 'leave'];
      
      validActions.forEach(action => {
        const result = validationService.isValidGameAction(action);
        expect(result).toBe(true);
      });
    });

    test('should reject invalid game actions', () => {
      const invalidActions = ['invalidAction', 'hack', 'cheat'];
      
      invalidActions.forEach(action => {
        const result = validationService.isValidGameAction(action);
        expect(result).toBe(false);
      });
    });
  });

  describe('sanitizePlayerName', () => {
    test('should sanitize player name', () => {
      const dirtyName = '<script>alert("xss")</script>Player Name';
      const sanitized = validationService.sanitizePlayerName(dirtyName);
      
      expect(sanitized).toBe('Player Name');
    });

    test('should remove HTML tags', () => {
      const dirtyName = '<b>Bold</b> <i>Italic</i> Player';
      const sanitized = validationService.sanitizePlayerName(dirtyName);
      
      expect(sanitized).toBe('Bold Italic Player');
    });

    test('should trim whitespace', () => {
      const dirtyName = '  Player Name  ';
      const sanitized = validationService.sanitizePlayerName(dirtyName);
      
      expect(sanitized).toBe('Player Name');
    });

    test('should limit length', () => {
      const longName = 'A'.repeat(100);
      const sanitized = validationService.sanitizePlayerName(longName);
      
      expect(sanitized.length).toBeLessThanOrEqual(50);
    });
  });
});
