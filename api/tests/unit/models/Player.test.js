const Player = require('../../src/models/Player');

describe('Player Model', () => {
  let testPlayer;

  beforeEach(() => {
    testPlayer = new Player('player1', 'Test Player');
  });

  describe('Constructor', () => {
    test('should create a player with basic properties', () => {
      expect(testPlayer.id).toBe('player1');
      expect(testPlayer.name).toBe('Test Player');
      expect(testPlayer.hand).toEqual([]);
      expect(testPlayer.creatures).toEqual([]);
      expect(testPlayer.isConnected).toBe(true);
      expect(testPlayer.isReady).toBe(false);
      expect(testPlayer.score).toBe(0);
      expect(testPlayer.hasShield).toBe(false);
    });

    test('should set default values correctly', () => {
      const player = new Player('player2');
      expect(player.name).toBe('Player');
      expect(player.hand).toEqual([]);
      expect(player.creatures).toEqual([]);
      expect(player.isConnected).toBe(true);
      expect(player.isReady).toBe(false);
      expect(player.score).toBe(0);
      expect(player.hasShield).toBe(false);
    });
  });

  describe('addCardToHand', () => {
    test('should add card to hand', () => {
      const card = { id: 1, name: 'Test Card' };
      testPlayer.addCardToHand(card);
      
      expect(testPlayer.hand).toHaveLength(1);
      expect(testPlayer.hand[0]).toBe(card);
    });

    test('should add multiple cards to hand', () => {
      const card1 = { id: 1, name: 'Card 1' };
      const card2 = { id: 2, name: 'Card 2' };
      
      testPlayer.addCardToHand(card1);
      testPlayer.addCardToHand(card2);
      
      expect(testPlayer.hand).toHaveLength(2);
      expect(testPlayer.hand[0]).toBe(card1);
      expect(testPlayer.hand[1]).toBe(card2);
    });
  });

  describe('removeCardFromHand', () => {
    beforeEach(() => {
      testPlayer.hand = [
        { id: 1, name: 'Card 1' },
        { id: 2, name: 'Card 2' },
        { id: 3, name: 'Card 3' }
      ];
    });

    test('should remove card by id', () => {
      const removedCard = testPlayer.removeCardFromHand(2);
      
      expect(removedCard).toEqual({ id: 2, name: 'Card 2' });
      expect(testPlayer.hand).toHaveLength(2);
      expect(testPlayer.hand.find(card => card.id === 2)).toBeUndefined();
    });

    test('should return null if card not found', () => {
      const removedCard = testPlayer.removeCardFromHand(999);
      
      expect(removedCard).toBeNull();
      expect(testPlayer.hand).toHaveLength(3);
    });

    test('should remove first occurrence of card with same id', () => {
      testPlayer.hand.push({ id: 2, name: 'Card 2 Duplicate' });
      
      const removedCard = testPlayer.removeCardFromHand(2);
      
      expect(removedCard).toEqual({ id: 2, name: 'Card 2' });
      expect(testPlayer.hand).toHaveLength(3);
      expect(testPlayer.hand.find(card => card.id === 2)).toEqual({ id: 2, name: 'Card 2 Duplicate' });
    });
  });

  describe('addCreature', () => {
    test('should add creature to creatures array', () => {
      const creature = { id: 1, name: 'Test Creature', power: 5 };
      testPlayer.addCreature(creature);
      
      expect(testPlayer.creatures).toHaveLength(1);
      expect(testPlayer.creatures[0]).toBe(creature);
    });

    test('should add multiple creatures', () => {
      const creature1 = { id: 1, name: 'Creature 1', power: 3 };
      const creature2 = { id: 2, name: 'Creature 2', power: 7 };
      
      testPlayer.addCreature(creature1);
      testPlayer.addCreature(creature2);
      
      expect(testPlayer.creatures).toHaveLength(2);
      expect(testPlayer.creatures[0]).toBe(creature1);
      expect(testPlayer.creatures[1]).toBe(creature2);
    });
  });

  describe('removeCreature', () => {
    beforeEach(() => {
      testPlayer.creatures = [
        { id: 1, name: 'Creature 1', power: 3 },
        { id: 2, name: 'Creature 2', power: 7 },
        { id: 3, name: 'Creature 3', power: 5 }
      ];
    });

    test('should remove creature by id', () => {
      const removedCreature = testPlayer.removeCreature(2);
      
      expect(removedCreature).toEqual({ id: 2, name: 'Creature 2', power: 7 });
      expect(testPlayer.creatures).toHaveLength(2);
      expect(testPlayer.creatures.find(creature => creature.id === 2)).toBeUndefined();
    });

    test('should return null if creature not found', () => {
      const removedCreature = testPlayer.removeCreature(999);
      
      expect(removedCreature).toBeNull();
      expect(testPlayer.creatures).toHaveLength(3);
    });
  });

  describe('getTotalPower', () => {
    test('should return 0 when no creatures', () => {
      expect(testPlayer.getTotalPower()).toBe(0);
    });

    test('should return sum of all creature powers', () => {
      testPlayer.creatures = [
        { id: 1, name: 'Creature 1', power: 3 },
        { id: 2, name: 'Creature 2', power: 7 },
        { id: 3, name: 'Creature 3', power: 5 }
      ];
      
      expect(testPlayer.getTotalPower()).toBe(15);
    });

    test('should handle creatures without power property', () => {
      testPlayer.creatures = [
        { id: 1, name: 'Creature 1' },
        { id: 2, name: 'Creature 2', power: 7 },
        { id: 3, name: 'Creature 3', power: 5 }
      ];
      
      expect(testPlayer.getTotalPower()).toBe(12);
    });
  });

  describe('hasCard', () => {
    beforeEach(() => {
      testPlayer.hand = [
        { id: 1, name: 'Card 1' },
        { id: 2, name: 'Card 2' },
        { id: 3, name: 'Card 3' }
      ];
    });

    test('should return true if player has card with given id', () => {
      expect(testPlayer.hasCard(2)).toBe(true);
    });

    test('should return false if player does not have card with given id', () => {
      expect(testPlayer.hasCard(999)).toBe(false);
    });

    test('should return false when hand is empty', () => {
      testPlayer.hand = [];
      expect(testPlayer.hasCard(1)).toBe(false);
    });
  });

  describe('getCardById', () => {
    beforeEach(() => {
      testPlayer.hand = [
        { id: 1, name: 'Card 1' },
        { id: 2, name: 'Card 2' },
        { id: 3, name: 'Card 3' }
      ];
    });

    test('should return card if found', () => {
      const card = testPlayer.getCardById(2);
      expect(card).toEqual({ id: 2, name: 'Card 2' });
    });

    test('should return null if card not found', () => {
      const card = testPlayer.getCardById(999);
      expect(card).toBeNull();
    });

    test('should return first occurrence if multiple cards with same id', () => {
      testPlayer.hand.push({ id: 2, name: 'Card 2 Duplicate' });
      
      const card = testPlayer.getCardById(2);
      expect(card).toEqual({ id: 2, name: 'Card 2' });
    });
  });

  describe('setReady', () => {
    test('should set isReady to true', () => {
      testPlayer.setReady();
      expect(testPlayer.isReady).toBe(true);
    });

    test('should set isReady to false', () => {
      testPlayer.isReady = true;
      testPlayer.setReady(false);
      expect(testPlayer.isReady).toBe(false);
    });
  });

  describe('setConnected', () => {
    test('should set isConnected to true', () => {
      testPlayer.isConnected = false;
      testPlayer.setConnected();
      expect(testPlayer.isConnected).toBe(true);
    });

    test('should set isConnected to false', () => {
      testPlayer.setConnected(false);
      expect(testPlayer.isConnected).toBe(false);
    });
  });

  describe('addScore', () => {
    test('should add points to score', () => {
      testPlayer.addScore(10);
      expect(testPlayer.score).toBe(10);
    });

    test('should add multiple times', () => {
      testPlayer.addScore(5);
      testPlayer.addScore(3);
      expect(testPlayer.score).toBe(8);
    });

    test('should handle negative points', () => {
      testPlayer.score = 10;
      testPlayer.addScore(-3);
      expect(testPlayer.score).toBe(7);
    });
  });

  describe('setScore', () => {
    test('should set score to specific value', () => {
      testPlayer.setScore(25);
      expect(testPlayer.score).toBe(25);
    });

    test('should override previous score', () => {
      testPlayer.score = 10;
      testPlayer.setScore(0);
      expect(testPlayer.score).toBe(0);
    });
  });

  describe('getHandSize', () => {
    test('should return 0 for empty hand', () => {
      expect(testPlayer.getHandSize()).toBe(0);
    });

    test('should return correct hand size', () => {
      testPlayer.hand = [
        { id: 1, name: 'Card 1' },
        { id: 2, name: 'Card 2' },
        { id: 3, name: 'Card 3' }
      ];
      
      expect(testPlayer.getHandSize()).toBe(3);
    });
  });

  describe('getCreatureCount', () => {
    test('should return 0 for no creatures', () => {
      expect(testPlayer.getCreatureCount()).toBe(0);
    });

    test('should return correct creature count', () => {
      testPlayer.creatures = [
        { id: 1, name: 'Creature 1' },
        { id: 2, name: 'Creature 2' }
      ];
      
      expect(testPlayer.getCreatureCount()).toBe(2);
    });
  });

  describe('clearHand', () => {
    test('should clear hand array', () => {
      testPlayer.hand = [
        { id: 1, name: 'Card 1' },
        { id: 2, name: 'Card 2' }
      ];
      
      testPlayer.clearHand();
      expect(testPlayer.hand).toEqual([]);
    });
  });

  describe('clearCreatures', () => {
    test('should clear creatures array', () => {
      testPlayer.creatures = [
        { id: 1, name: 'Creature 1' },
        { id: 2, name: 'Creature 2' }
      ];
      
      testPlayer.clearCreatures();
      expect(testPlayer.creatures).toEqual([]);
    });
  });

  describe('getPublicInfo', () => {
    beforeEach(() => {
      testPlayer.hand = [
        { id: 1, name: 'Card 1' },
        { id: 2, name: 'Card 2' }
      ];
      testPlayer.creatures = [
        { id: 1, name: 'Creature 1', power: 5 }
      ];
      testPlayer.score = 25;
      testPlayer.isReady = true;
    });

    test('should return public information without private data', () => {
      const publicInfo = testPlayer.getPublicInfo();
      
      expect(publicInfo.id).toBe(testPlayer.id);
      expect(publicInfo.name).toBe(testPlayer.name);
      expect(publicInfo.isConnected).toBe(testPlayer.isConnected);
      expect(publicInfo.isReady).toBe(testPlayer.isReady);
      expect(publicInfo.score).toBe(testPlayer.score);
      expect(publicInfo.creatures).toEqual(testPlayer.creatures);
      expect(publicInfo.handSize).toBe(2);
      expect(publicInfo.totalPower).toBe(5);
      expect(publicInfo.hasShield).toBe(testPlayer.hasShield);
      
      // Should not include private data
      expect(publicInfo.hand).toBeUndefined();
    });

    test('should include hand for own player', () => {
      const publicInfo = testPlayer.getPublicInfo(true);
      
      expect(publicInfo.hand).toEqual(testPlayer.hand);
    });
  });

  describe('toJSON', () => {
    test('should return JSON representation', () => {
      const json = testPlayer.toJSON();
      
      expect(json).toEqual({
        id: testPlayer.id,
        name: testPlayer.name,
        hand: testPlayer.hand,
        creatures: testPlayer.creatures,
        isConnected: testPlayer.isConnected,
        isReady: testPlayer.isReady,
        score: testPlayer.score,
        hasShield: testPlayer.hasShield
      });
    });
  });

  describe('clone', () => {
    test('should create a deep copy of the player', () => {
      testPlayer.hand = [{ id: 1, name: 'Card 1' }];
      testPlayer.creatures = [{ id: 1, name: 'Creature 1', power: 5 }];
      testPlayer.score = 10;
      testPlayer.isReady = true;
      
      const clonedPlayer = testPlayer.clone();
      
      expect(clonedPlayer).not.toBe(testPlayer);
      expect(clonedPlayer.id).toBe(testPlayer.id);
      expect(clonedPlayer.name).toBe(testPlayer.name);
      expect(clonedPlayer.hand).toEqual(testPlayer.hand);
      expect(clonedPlayer.creatures).toEqual(testPlayer.creatures);
      expect(clonedPlayer.isConnected).toBe(testPlayer.isConnected);
      expect(clonedPlayer.isReady).toBe(testPlayer.isReady);
      expect(clonedPlayer.score).toBe(testPlayer.score);
      expect(clonedPlayer.hasShield).toBe(testPlayer.hasShield);
    });

    test('should not affect original when modifying clone', () => {
      testPlayer.hand = [{ id: 1, name: 'Card 1' }];
      
      const clonedPlayer = testPlayer.clone();
      clonedPlayer.hand.push({ id: 2, name: 'Card 2' });
      clonedPlayer.score = 999;
      
      expect(testPlayer.hand).toHaveLength(1);
      expect(testPlayer.score).toBe(0);
      expect(clonedPlayer.hand).toHaveLength(2);
      expect(clonedPlayer.score).toBe(999);
    });
  });
});
