const { Card, THEMATIC_DECKS, ANGELS_DECK, DEMONS_DECK, DRAGONS_DECK, MAGES_DECK } = require('../../src/models/Card');

describe('Card Model', () => {
  let testCard;

  beforeEach(() => {
    testCard = new Card(1, 'Test Card', 'criatura', 5, null, 'A test card', '/test.png', THEMATIC_DECKS.ANGELS, 5);
  });

  describe('Constructor', () => {
    test('should create a card with all properties', () => {
      expect(testCard.id).toBe(1);
      expect(testCard.name).toBe('Test Card');
      expect(testCard.type).toBe('criatura');
      expect(testCard.power).toBe(5);
      expect(testCard.value).toBe(5);
      expect(testCard.description).toBe('A test card');
      expect(testCard.image).toBe('/test.png');
      expect(testCard.deck).toBe(THEMATIC_DECKS.ANGELS);
      expect(testCard.isSpecial).toBe(false);
    });

    test('should set default values correctly', () => {
      const card = new Card(1, 'Test Card', 'criatura');
      expect(card.power).toBe(0);
      expect(card.value).toBe(0);
      expect(card.effect).toBe(null);
      expect(card.image).toBe(null);
      expect(card.deck).toBe(null);
    });

    test('should identify special cards correctly', () => {
      const specialCard2 = new Card(2, 'Special 2', 'criatura', 2, null, 'Special card', null, null, 2);
      const specialCard8 = new Card(8, 'Special 8', 'criatura', 8, null, 'Special card', null, null, 8);
      const specialCard10 = new Card(10, 'Special 10', 'criatura', 10, null, 'Special card', null, null, 10);
      const normalCard = new Card(5, 'Normal Card', 'criatura', 5, null, 'Normal card', null, null, 5);

      expect(specialCard2.isSpecial).toBe(true);
      expect(specialCard8.isSpecial).toBe(true);
      expect(specialCard10.isSpecial).toBe(true);
      expect(normalCard.isSpecial).toBe(false);
    });
  });

  describe('canBePlayed', () => {
    let gameState;

    beforeEach(() => {
      gameState = {
        lastPlayedCard: null,
        nextPlayerCanPlayAnything: false,
        players: [
          { id: 'player1' },
          { id: 'player2' }
        ]
      };
    });

    test('should allow playing when no last card', () => {
      expect(testCard.canBePlayed(gameState, 'player1')).toBe(true);
    });

    test('should allow playing when nextPlayerCanPlayAnything is true', () => {
      gameState.nextPlayerCanPlayAnything = true;
      gameState.lastPlayedCard = new Card(10, 'High Card', 'criatura', 10, null, 'High card', null, null, 10);
      
      expect(testCard.canBePlayed(gameState, 'player1')).toBe(true);
    });

    test('should allow special cards to be played always', () => {
      const specialCard = new Card(2, 'Special Card', 'criatura', 2, null, 'Special card', null, null, 2);
      gameState.lastPlayedCard = new Card(10, 'High Card', 'criatura', 10, null, 'High card', null, null, 10);
      
      expect(specialCard.canBePlayed(gameState, 'player1')).toBe(true);
    });

    test('should allow playing cards with equal or higher value', () => {
      gameState.lastPlayedCard = new Card(3, 'Low Card', 'criatura', 3, null, 'Low card', null, null, 3);
      
      expect(testCard.canBePlayed(gameState, 'player1')).toBe(true);
    });

    test('should not allow playing cards with lower value', () => {
      gameState.lastPlayedCard = new Card(8, 'High Card', 'criatura', 8, null, 'High card', null, null, 8);
      
      expect(testCard.canBePlayed(gameState, 'player1')).toBe(false);
    });
  });

  describe('willPurifyPile', () => {
    let gameState;

    beforeEach(() => {
      gameState = {
        lastPlayedCard: null,
        discardPile: []
      };
    });

    test('should purify when card value is 10', () => {
      const card10 = new Card(10, 'Card 10', 'criatura', 10, null, 'Card 10', null, null, 10);
      expect(card10.willPurifyPile(gameState)).toBe(true);
    });

    test('should purify when card has same value as last played card', () => {
      gameState.lastPlayedCard = new Card(5, 'Last Card', 'criatura', 5, null, 'Last card', null, null, 5);
      expect(testCard.willPurifyPile(gameState)).toBe(true);
    });

    test('should purify when there are 4 cards of same value in pile', () => {
      gameState.discardPile = [
        new Card(5, 'Card 5a', 'criatura', 5, null, 'Card 5a', null, null, 5),
        new Card(5, 'Card 5b', 'criatura', 5, null, 'Card 5b', null, null, 5),
        new Card(5, 'Card 5c', 'criatura', 5, null, 'Card 5c', null, null, 5)
      ];
      expect(testCard.willPurifyPile(gameState)).toBe(true);
    });

    test('should not purify when conditions are not met', () => {
      gameState.lastPlayedCard = new Card(3, 'Last Card', 'criatura', 3, null, 'Last card', null, null, 3);
      gameState.discardPile = [
        new Card(5, 'Card 5a', 'criatura', 5, null, 'Card 5a', null, null, 5),
        new Card(5, 'Card 5b', 'criatura', 5, null, 'Card 5b', null, null, 5)
      ];
      expect(testCard.willPurifyPile(gameState)).toBe(false);
    });
  });

  describe('applyEffect', () => {
    let gameState;

    beforeEach(() => {
      gameState = {
        lastPlayedCard: null,
        nextPlayerCanPlayAnything: false,
        currentPlayerIndex: 0,
        players: [
          { id: 'player1' },
          { id: 'player2' },
          { id: 'player3' }
        ],
        discardPile: []
      };
    });

    test('should apply universal power effect (value 2)', () => {
      const card2 = new Card(2, 'Universal Power', 'criatura', 2, null, 'Universal power', null, null, 2);
      const result = card2.applyEffect(gameState, 'player1');
      
      expect(result.lastPlayedCard).toBe(card2);
      expect(result.nextPlayerCanPlayAnything).toBe(true);
    });

    test('should apply skip power effect (value 8)', () => {
      const card8 = new Card(8, 'Skip Power', 'criatura', 8, null, 'Skip power', null, null, 8);
      const result = card8.applyEffect(gameState, 'player1');
      
      expect(result.skippedPlayer).toBe('player3');
      expect(result.currentPlayerIndex).toBe(2);
    });

    test('should apply purification power effect (value 10)', () => {
      gameState.discardPile = [testCard];
      gameState.lastPlayedCard = testCard;
      gameState.nextPlayerCanPlayAnything = true;
      
      const card10 = new Card(10, 'Purification Power', 'criatura', 10, null, 'Purification power', null, null, 10);
      const result = card10.applyEffect(gameState, 'player1');
      
      expect(result.discardPile).toEqual([]);
      expect(result.lastPlayedCard).toBe(null);
      expect(result.nextPlayerCanPlayAnything).toBe(false);
    });

    test('should apply custom effect function', () => {
      const customEffect = jest.fn((gameState, playerId, targetId) => {
        gameState.customApplied = true;
        gameState.playerId = playerId;
        gameState.targetId = targetId;
        return gameState;
      });

      const customCard = new Card(1, 'Custom Card', 'criatura', 1, customEffect, 'Custom card');
      const result = customCard.applyEffect(gameState, 'player1', 'target1');
      
      expect(customEffect).toHaveBeenCalledWith(gameState, 'player1', 'target1');
      expect(result.customApplied).toBe(true);
      expect(result.playerId).toBe('player1');
      expect(result.targetId).toBe('target1');
    });
  });

  describe('getPublicInfo', () => {
    test('should return public information without revealing effects', () => {
      const publicInfo = testCard.getPublicInfo();
      
      expect(publicInfo.id).toBe(testCard.id);
      expect(publicInfo.name).toBe(testCard.name);
      expect(publicInfo.type).toBe(testCard.type);
      expect(publicInfo.power).toBe(testCard.power);
      expect(publicInfo.value).toBe(testCard.value);
      expect(publicInfo.description).toBe(testCard.description);
      expect(publicInfo.image).toBe(testCard.image);
      expect(publicInfo.deck).toBe(testCard.deck);
      expect(publicInfo.isSpecial).toBe(testCard.isSpecial);
      expect(publicInfo.effect).toBeUndefined();
    });
  });

  describe('Thematic Decks', () => {
    test('should have all thematic decks defined', () => {
      expect(THEMATIC_DECKS.ANGELS).toBe('angels');
      expect(THEMATIC_DECKS.DEMONS).toBe('demons');
      expect(THEMATIC_DECKS.DRAGONS).toBe('dragons');
      expect(THEMATIC_DECKS.MAGES).toBe('mages');
    });

    test('should have complete deck arrays', () => {
      expect(ANGELS_DECK).toHaveLength(13);
      expect(DEMONS_DECK).toHaveLength(13);
      expect(DRAGONS_DECK).toHaveLength(13);
      expect(MAGES_DECK).toHaveLength(13);
    });

    test('should have cards with correct properties', () => {
      const firstAngelCard = ANGELS_DECK[0];
      expect(firstAngelCard.id).toBe(1);
      expect(firstAngelCard.name).toBe('El Querubín de la Esperanza');
      expect(firstAngelCard.deck).toBe(THEMATIC_DECKS.ANGELS);
      expect(firstAngelCard.value).toBe(1);
    });

    test('should have special cards in each deck', () => {
      const checkSpecialCards = (deck) => {
        const values = deck.map(card => card.value);
        expect(values).toContain(2);
        expect(values).toContain(8);
        expect(values).toContain(10);
      };

      checkSpecialCards(ANGELS_DECK);
      checkSpecialCards(DEMONS_DECK);
      checkSpecialCards(DRAGONS_DECK);
      checkSpecialCards(MAGES_DECK);
    });
  });

  describe('getThematicDeck', () => {
    test('should return angels deck for angels type', () => {
      const deck = require('../../src/models/Card').getThematicDeck(THEMATIC_DECKS.ANGELS);
      expect(deck).toBe(ANGELS_DECK);
    });

    test('should return demons deck for demons type', () => {
      const deck = require('../../src/models/Card').getThematicDeck(THEMATIC_DECKS.DEMONS);
      expect(deck).toBe(DEMONS_DECK);
    });

    test('should return dragons deck for dragons type', () => {
      const deck = require('../../src/models/Card').getThematicDeck(THEMATIC_DECKS.DRAGONS);
      expect(deck).toBe(DRAGONS_DECK);
    });

    test('should return mages deck for mages type', () => {
      const deck = require('../../src/models/Card').getThematicDeck(THEMATIC_DECKS.MAGES);
      expect(deck).toBe(MAGES_DECK);
    });

    test('should return angels deck as default for unknown type', () => {
      const deck = require('../../src/models/Card').getThematicDeck('unknown');
      expect(deck).toBe(ANGELS_DECK);
    });
  });

  describe('shuffleDeck', () => {
    test('should return array with same length', () => {
      const originalDeck = [...ANGELS_DECK];
      const shuffledDeck = require('../../src/models/Card').shuffleDeck(originalDeck);
      
      expect(shuffledDeck).toHaveLength(originalDeck.length);
    });

    test('should contain same cards (but potentially in different order)', () => {
      const originalDeck = [...ANGELS_DECK];
      const shuffledDeck = require('../../src/models/Card').shuffleDeck(originalDeck);
      
      const originalIds = originalDeck.map(card => card.id).sort();
      const shuffledIds = shuffledDeck.map(card => card.id).sort();
      
      expect(shuffledIds).toEqual(originalIds);
    });

    test('should not modify original deck', () => {
      const originalDeck = [...ANGELS_DECK];
      const originalIds = originalDeck.map(card => card.id);
      
      require('../../src/models/Card').shuffleDeck(originalDeck);
      
      const afterShuffleIds = originalDeck.map(card => card.id);
      expect(afterShuffleIds).toEqual(originalIds);
    });
  });
});
