const Game = require('../../src/models/Game');
const { THEMATIC_DECKS } = require('../../src/models/Card');

describe('Game Model', () => {
  let testGame;

  beforeEach(() => {
    testGame = new Game('test-room', 4, THEMATIC_DECKS.ANGELS);
  });

  describe('Constructor', () => {
    test('should create a game with basic properties', () => {
      expect(testGame.roomId).toBe('test-room');
      expect(testGame.maxPlayers).toBe(4);
      expect(testGame.deckType).toBe(THEMATIC_DECKS.ANGELS);
      expect(testGame.players).toEqual([]);
      expect(testGame.status).toBe('waiting');
      expect(testGame.currentPlayerIndex).toBe(0);
      expect(testGame.discardPile).toEqual([]);
      expect(testGame.lastPlayedCard).toBe(null);
      expect(testGame.nextPlayerCanPlayAnything).toBe(false);
      expect(testGame.skippedPlayer).toBe(null);
      expect(testGame.turnTimeout).toBe(null);
      expect(testGame.gameStartTime).toBe(null);
      expect(testGame.lastActivity).toBeInstanceOf(Date);
    });

    test('should set default values correctly', () => {
      const game = new Game('test-room');
      expect(game.maxPlayers).toBe(6);
      expect(game.deckType).toBe(THEMATIC_DECKS.ANGELS);
      expect(game.status).toBe('waiting');
    });
  });

  describe('addPlayer', () => {
    test('should add player to game', () => {
      const player = testGame.addPlayer('player1', 'Test Player');
      
      expect(testGame.players).toHaveLength(1);
      expect(testGame.players[0]).toBe(player);
      expect(player.id).toBe('player1');
      expect(player.name).toBe('Test Player');
    });

    test('should not add player if game is full', () => {
      // Add max players
      for (let i = 0; i < testGame.maxPlayers; i++) {
        testGame.addPlayer(`player${i}`, `Player ${i}`);
      }
      
      const result = testGame.addPlayer('extra-player', 'Extra Player');
      expect(result).toBe(null);
      expect(testGame.players).toHaveLength(testGame.maxPlayers);
    });

    test('should not add player if game has started', () => {
      testGame.status = 'playing';
      
      const result = testGame.addPlayer('player1', 'Test Player');
      expect(result).toBe(null);
      expect(testGame.players).toHaveLength(0);
    });

    test('should not add duplicate player id', () => {
      testGame.addPlayer('player1', 'Test Player');
      
      const result = testGame.addPlayer('player1', 'Another Player');
      expect(result).toBe(null);
      expect(testGame.players).toHaveLength(1);
    });
  });

  describe('removePlayer', () => {
    beforeEach(() => {
      testGame.addPlayer('player1', 'Player 1');
      testGame.addPlayer('player2', 'Player 2');
    });

    test('should remove player by id', () => {
      const removedPlayer = testGame.removePlayer('player1');
      
      expect(removedPlayer.id).toBe('player1');
      expect(testGame.players).toHaveLength(1);
      expect(testGame.players[0].id).toBe('player2');
    });

    test('should return null if player not found', () => {
      const result = testGame.removePlayer('nonexistent');
      expect(result).toBe(null);
      expect(testGame.players).toHaveLength(2);
    });

    test('should update current player index when removing current player', () => {
      testGame.currentPlayerIndex = 0;
      testGame.removePlayer('player1');
      
      expect(testGame.currentPlayerIndex).toBe(0);
    });

    test('should adjust current player index when removing player before current', () => {
      testGame.currentPlayerIndex = 1;
      testGame.removePlayer('player1');
      
      expect(testGame.currentPlayerIndex).toBe(0);
    });
  });

  describe('getPlayer', () => {
    beforeEach(() => {
      testGame.addPlayer('player1', 'Player 1');
    });

    test('should return player if found', () => {
      const player = testGame.getPlayer('player1');
      expect(player.id).toBe('player1');
      expect(player.name).toBe('Player 1');
    });

    test('should return null if player not found', () => {
      const player = testGame.getPlayer('nonexistent');
      expect(player).toBe(null);
    });
  });

  describe('startGame', () => {
    beforeEach(() => {
      testGame.addPlayer('player1', 'Player 1');
      testGame.addPlayer('player2', 'Player 2');
      testGame.addPlayer('player3', 'Player 3');
    });

    test('should start game with valid players', () => {
      const result = testGame.startGame();
      
      expect(result.success).toBe(true);
      expect(testGame.status).toBe('playing');
      expect(testGame.gameStartTime).toBeInstanceOf(Date);
      expect(testGame.currentPlayerIndex).toBe(0);
      expect(testGame.discardPile).toEqual([]);
      expect(testGame.lastPlayedCard).toBe(null);
    });

    test('should deal cards to all players', () => {
      testGame.startGame();
      
      testGame.players.forEach(player => {
        expect(player.hand).toHaveLength(13);
      });
    });

    test('should not start game with insufficient players', () => {
      testGame.removePlayer('player3');
      
      const result = testGame.startGame();
      expect(result.success).toBe(false);
      expect(result.error).toContain('insuficientes');
      expect(testGame.status).toBe('waiting');
    });

    test('should not start game if already started', () => {
      testGame.startGame();
      
      const result = testGame.startGame();
      expect(result.success).toBe(false);
      expect(result.error).toContain('ya ha comenzado');
    });
  });

  describe('playCard', () => {
    let player1, player2;

    beforeEach(() => {
      player1 = testGame.addPlayer('player1', 'Player 1');
      player2 = testGame.addPlayer('player2', 'Player 2');
      testGame.startGame();
    });

    test('should play valid card', () => {
      const card = player1.hand[0];
      const result = testGame.playCard('player1', card.id);
      
      expect(result.success).toBe(true);
      expect(testGame.discardPile).toHaveLength(1);
      expect(testGame.discardPile[0]).toBe(card);
      expect(player1.hand).toHaveLength(12);
      expect(testGame.lastPlayedCard).toBe(card);
    });

    test('should not play card if not player turn', () => {
      const card = player2.hand[0];
      const result = testGame.playCard('player2', card.id);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('no es tu turno');
    });

    test('should not play invalid card', () => {
      const result = testGame.playCard('player1', 999);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('no tienes esa carta');
    });

    test('should not play card that cannot be played', () => {
      // Play a high card first
      const highCard = player1.hand.find(card => card.value === 10);
      testGame.playCard('player1', highCard.id);
      
      // Try to play a low card
      const lowCard = player1.hand.find(card => card.value < 10);
      const result = testGame.playCard('player1', lowCard.id);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('no puede jugar esa carta');
    });

    test('should advance to next player after playing card', () => {
      const card = player1.hand[0];
      testGame.playCard('player1', card.id);
      
      expect(testGame.currentPlayerIndex).toBe(1);
    });

    test('should handle special card effects', () => {
      const specialCard = player1.hand.find(card => card.value === 2);
      const result = testGame.playCard('player1', specialCard.id);
      
      expect(result.success).toBe(true);
      expect(testGame.nextPlayerCanPlayAnything).toBe(true);
    });
  });

  describe('drawCard', () => {
    let player1;

    beforeEach(() => {
      player1 = testGame.addPlayer('player1', 'Player 1');
      testGame.addPlayer('player2', 'Player 2');
      testGame.startGame();
    });

    test('should draw card for current player', () => {
      const initialHandSize = player1.hand.length;
      const result = testGame.drawCard('player1');
      
      expect(result.success).toBe(true);
      expect(player1.hand).toHaveLength(initialHandSize + 1);
      expect(testGame.currentPlayerIndex).toBe(1);
    });

    test('should not draw card if not player turn', () => {
      const result = testGame.drawCard('player2');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('no es tu turno');
    });

    test('should handle deck exhaustion', () => {
      // Remove all cards from deck
      testGame.deck = [];
      
      const result = testGame.drawCard('player1');
      expect(result.success).toBe(false);
      expect(result.error).toContain('no hay más cartas');
    });
  });

  describe('checkGameEnd', () => {
    let player1, player2;

    beforeEach(() => {
      player1 = testGame.addPlayer('player1', 'Player 1');
      player2 = testGame.addPlayer('player2', 'Player 2');
      testGame.startGame();
    });

    test('should end game when player has no cards', () => {
      player1.hand = [];
      
      const result = testGame.checkGameEnd();
      expect(result.gameEnded).toBe(true);
      expect(result.winner.id).toBe('player1');
      expect(testGame.status).toBe('finished');
    });

    test('should not end game when players still have cards', () => {
      const result = testGame.checkGameEnd();
      expect(result.gameEnded).toBe(false);
      expect(testGame.status).toBe('playing');
    });

    test('should handle tie when multiple players have no cards', () => {
      player1.hand = [];
      player2.hand = [];
      
      const result = testGame.checkGameEnd();
      expect(result.gameEnded).toBe(true);
      expect(result.winner).toBe(null);
      expect(result.isTie).toBe(true);
    });
  });

  describe('getGameState', () => {
    let player1, player2;

    beforeEach(() => {
      player1 = testGame.addPlayer('player1', 'Player 1');
      player2 = testGame.addPlayer('player2', 'Player 2');
      testGame.startGame();
    });

    test('should return public game state', () => {
      const gameState = testGame.getGameState();
      
      expect(gameState.roomId).toBe(testGame.roomId);
      expect(gameState.status).toBe(testGame.status);
      expect(gameState.currentPlayerIndex).toBe(testGame.currentPlayerIndex);
      expect(gameState.players).toHaveLength(2);
      expect(gameState.discardPile).toEqual(testGame.discardPile);
      expect(gameState.lastPlayedCard).toBe(testGame.lastPlayedCard);
    });

    test('should include player hands for requesting player', () => {
      const gameState = testGame.getGameState('player1');
      
      const player1State = gameState.players.find(p => p.id === 'player1');
      const player2State = gameState.players.find(p => p.id === 'player2');
      
      expect(player1State.hand).toBeDefined();
      expect(player2State.hand).toBeUndefined();
    });
  });

  describe('isPlayerTurn', () => {
    let player1, player2;

    beforeEach(() => {
      player1 = testGame.addPlayer('player1', 'Player 1');
      player2 = testGame.addPlayer('player2', 'Player 2');
      testGame.startGame();
    });

    test('should return true for current player', () => {
      expect(testGame.isPlayerTurn('player1')).toBe(true);
      expect(testGame.isPlayerTurn('player2')).toBe(false);
    });

    test('should return false for non-existent player', () => {
      expect(testGame.isPlayerTurn('nonexistent')).toBe(false);
    });
  });

  describe('getCurrentPlayer', () => {
    let player1, player2;

    beforeEach(() => {
      player1 = testGame.addPlayer('player1', 'Player 1');
      player2 = testGame.addPlayer('player2', 'Player 2');
      testGame.startGame();
    });

    test('should return current player', () => {
      const currentPlayer = testGame.getCurrentPlayer();
      expect(currentPlayer).toBe(player1);
    });

    test('should return null if no current player', () => {
      testGame.players = [];
      const currentPlayer = testGame.getCurrentPlayer();
      expect(currentPlayer).toBe(null);
    });
  });

  describe('advanceTurn', () => {
    let player1, player2;

    beforeEach(() => {
      player1 = testGame.addPlayer('player1', 'Player 1');
      player2 = testGame.addPlayer('player2', 'Player 2');
      testGame.startGame();
    });

    test('should advance to next player', () => {
      testGame.advanceTurn();
      expect(testGame.currentPlayerIndex).toBe(1);
    });

    test('should wrap around to first player', () => {
      testGame.currentPlayerIndex = 1;
      testGame.advanceTurn();
      expect(testGame.currentPlayerIndex).toBe(0);
    });

    test('should skip skipped player', () => {
      testGame.skippedPlayer = 'player2';
      testGame.advanceTurn();
      expect(testGame.currentPlayerIndex).toBe(0);
      expect(testGame.skippedPlayer).toBe(null);
    });
  });

  describe('purifyPile', () => {
    test('should clear discard pile and reset game state', () => {
      testGame.discardPile = [
        { id: 1, name: 'Card 1' },
        { id: 2, name: 'Card 2' }
      ];
      testGame.lastPlayedCard = { id: 2, name: 'Card 2' };
      testGame.nextPlayerCanPlayAnything = true;
      
      testGame.purifyPile();
      
      expect(testGame.discardPile).toEqual([]);
      expect(testGame.lastPlayedCard).toBe(null);
      expect(testGame.nextPlayerCanPlayAnything).toBe(false);
    });
  });

  describe('getPlayerCount', () => {
    test('should return correct player count', () => {
      expect(testGame.getPlayerCount()).toBe(0);
      
      testGame.addPlayer('player1', 'Player 1');
      expect(testGame.getPlayerCount()).toBe(1);
      
      testGame.addPlayer('player2', 'Player 2');
      expect(testGame.getPlayerCount()).toBe(2);
    });
  });

  describe('isFull', () => {
    test('should return true when game is full', () => {
      for (let i = 0; i < testGame.maxPlayers; i++) {
        testGame.addPlayer(`player${i}`, `Player ${i}`);
      }
      
      expect(testGame.isFull()).toBe(true);
    });

    test('should return false when game has space', () => {
      testGame.addPlayer('player1', 'Player 1');
      expect(testGame.isFull()).toBe(false);
    });
  });

  describe('canStart', () => {
    test('should return true with sufficient players', () => {
      testGame.addPlayer('player1', 'Player 1');
      testGame.addPlayer('player2', 'Player 2');
      
      expect(testGame.canStart()).toBe(true);
    });

    test('should return false with insufficient players', () => {
      testGame.addPlayer('player1', 'Player 1');
      
      expect(testGame.canStart()).toBe(false);
    });

    test('should return false if game already started', () => {
      testGame.addPlayer('player1', 'Player 1');
      testGame.addPlayer('player2', 'Player 2');
      testGame.status = 'playing';
      
      expect(testGame.canStart()).toBe(false);
    });
  });
});
