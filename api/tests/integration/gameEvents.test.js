const SocketTestHelper = require('./helpers/socketTestHelper');

describe('Socket.io Game Events Integration', () => {
  let socketHelper;

  beforeEach(async () => {
    socketHelper = new SocketTestHelper();
    await socketHelper.startServer();
  });

  afterEach(async () => {
    await socketHelper.stopServer();
  });

  describe('Connection and Basic Events', () => {
    test('should connect client successfully', async () => {
      const client = socketHelper.createClient();
      await socketHelper.waitForConnection(client);
      
      expect(socketHelper.isClientConnected(client)).toBe(true);
      expect(socketHelper.getClientId(client)).toBeDefined();
    });

    test('should handle multiple client connections', async () => {
      const clients = await socketHelper.createMultipleClients(3);
      
      for (const client of clients) {
        expect(socketHelper.isClientConnected(client)).toBe(true);
      }
      
      expect(clients).toHaveLength(3);
    });

    test('should handle client disconnection', async () => {
      const client = socketHelper.createClient();
      await socketHelper.waitForConnection(client);
      
      expect(socketHelper.isClientConnected(client)).toBe(true);
      
      client.disconnect();
      await socketHelper.wait(100); // Wait for disconnect to process
      
      expect(socketHelper.isClientConnected(client)).toBe(false);
    });

    test('should respond to ping event', async () => {
      const client = socketHelper.createClient();
      await socketHelper.waitForConnection(client);
      
      const pingResponse = await new Promise((resolve) => {
        client.emit('ping', resolve);
      });
      
      expect(pingResponse).toBeDefined();
    });
  });

  describe('Room Management Events', () => {
    test('should create room successfully', async () => {
      const client = socketHelper.createClient();
      await socketHelper.waitForConnection(client);
      
      const roomData = {
        roomId: 'test-room',
        playerName: 'Test Player',
        maxPlayers: 4
      };
      
      const response = await socketHelper.emitAndWait(
        client,
        'createRoom',
        roomData,
        'roomCreated'
      );
      
      expect(response.roomId).toBe(roomData.roomId);
      expect(response.playerId).toBeDefined();
      expect(response.gameState).toBeDefined();
    });

    test('should join existing room successfully', async () => {
      // Create room first
      const hostClient = socketHelper.createClient();
      await socketHelper.waitForConnection(hostClient);
      
      const roomData = {
        roomId: 'test-room',
        playerName: 'Host Player',
        maxPlayers: 4
      };
      
      await socketHelper.emitAndWait(
        hostClient,
        'createRoom',
        roomData,
        'roomCreated'
      );
      
      // Join room with second player
      const joinClient = socketHelper.createClient();
      await socketHelper.waitForConnection(joinClient);
      
      const joinData = {
        roomId: 'test-room',
        playerName: 'Join Player'
      };
      
      const response = await socketHelper.emitAndWait(
        joinClient,
        'joinRoom',
        joinData,
        'roomJoined'
      );
      
      expect(response.roomId).toBe(roomData.roomId);
      expect(response.playerId).toBeDefined();
      expect(response.gameState).toBeDefined();
    });

    test('should reject joining non-existent room', async () => {
      const client = socketHelper.createClient();
      await socketHelper.waitForConnection(client);
      
      const joinData = {
        roomId: 'non-existent-room',
        playerName: 'Test Player'
      };
      
      const response = await socketHelper.emitAndWait(
        client,
        'joinRoom',
        joinData,
        'error'
      );
      
      expect(response.message).toContain('Sala no encontrada');
    });

    test('should reject joining full room', async () => {
      // Create room with max 2 players
      const hostClient = socketHelper.createClient();
      await socketHelper.waitForConnection(hostClient);
      
      const roomData = {
        roomId: 'test-room',
        playerName: 'Host Player',
        maxPlayers: 2
      };
      
      await socketHelper.emitAndWait(
        hostClient,
        'createRoom',
        roomData,
        'roomCreated'
      );
      
      // Join with second player
      const secondClient = socketHelper.createClient();
      await socketHelper.waitForConnection(secondClient);
      
      await socketHelper.emitAndWait(
        secondClient,
        'joinRoom',
        { roomId: 'test-room', playerName: 'Second Player' },
        'roomJoined'
      );
      
      // Try to join with third player
      const thirdClient = socketHelper.createClient();
      await socketHelper.waitForConnection(thirdClient);
      
      const response = await socketHelper.emitAndWait(
        thirdClient,
        'joinRoom',
        { roomId: 'test-room', playerName: 'Third Player' },
        'error'
      );
      
      expect(response.message).toContain('llena');
    });
  });

  describe('Game Flow Events', () => {
    let hostClient, playerClient, roomId;

    beforeEach(async () => {
      // Setup game with two players
      hostClient = socketHelper.createClient();
      await socketHelper.waitForConnection(hostClient);
      
      const roomData = {
        roomId: 'test-game',
        playerName: 'Host Player',
        maxPlayers: 4
      };
      
      const createResponse = await socketHelper.emitAndWait(
        hostClient,
        'createRoom',
        roomData,
        'roomCreated'
      );
      
      roomId = createResponse.roomId;
      
      playerClient = socketHelper.createClient();
      await socketHelper.waitForConnection(playerClient);
      
      await socketHelper.emitAndWait(
        playerClient,
        'joinRoom',
        { roomId, playerName: 'Second Player' },
        'roomJoined'
      );
    });

    test('should set player ready status', async () => {
      const readyData = {
        roomId,
        playerId: 'host-player-id', // This would come from the game state
        isReady: true
      };
      
      const response = await socketHelper.emitAndWait(
        hostClient,
        'setPlayerReady',
        readyData,
        'playerReadyUpdated'
      );
      
      expect(response.success).toBe(true);
    });

    test('should start game when all players are ready', async () => {
      // Set both players ready
      const hostReadyData = { roomId, playerId: 'host-id', isReady: true };
      const playerReadyData = { roomId, playerId: 'player-id', isReady: true };
      
      await socketHelper.emitAndWait(
        hostClient,
        'setPlayerReady',
        hostReadyData,
        'playerReadyUpdated'
      );
      
      await socketHelper.emitAndWait(
        playerClient,
        'setPlayerReady',
        playerReadyData,
        'playerReadyUpdated'
      );
      
      // Start game
      const response = await socketHelper.emitAndWait(
        hostClient,
        'startGame',
        {},
        'gameStarted'
      );
      
      expect(response.success).toBe(true);
      expect(response.gameState.status).toBe('playing');
    });

    test('should get playable cards for current player', async () => {
      // Start game first
      const hostReadyData = { roomId, playerId: 'host-id', isReady: true };
      const playerReadyData = { roomId, playerId: 'player-id', isReady: true };
      
      await socketHelper.emitAndWait(
        hostClient,
        'setPlayerReady',
        hostReadyData,
        'playerReadyUpdated'
      );
      
      await socketHelper.emitAndWait(
        playerClient,
        'setPlayerReady',
        playerReadyData,
        'playerReadyUpdated'
      );
      
      await socketHelper.emitAndWait(
        hostClient,
        'startGame',
        {},
        'gameStarted'
      );
      
      // Get playable cards
      const response = await socketHelper.emitAndWait(
        hostClient,
        'getPlayableCards',
        {},
        'playableCards'
      );
      
      expect(response.cards).toBeDefined();
      expect(Array.isArray(response.cards)).toBe(true);
    });

    test('should play card successfully', async () => {
      // Start game and get playable cards
      const hostReadyData = { roomId, playerId: 'host-id', isReady: true };
      const playerReadyData = { roomId, playerId: 'player-id', isReady: true };
      
      await socketHelper.emitAndWait(
        hostClient,
        'setPlayerReady',
        hostReadyData,
        'playerReadyUpdated'
      );
      
      await socketHelper.emitAndWait(
        playerClient,
        'setPlayerReady',
        playerReadyData,
        'playerReadyUpdated'
      );
      
      await socketHelper.emitAndWait(
        hostClient,
        'startGame',
        {},
        'gameStarted'
      );
      
      const cardsResponse = await socketHelper.emitAndWait(
        hostClient,
        'getPlayableCards',
        {},
        'playableCards'
      );
      
      if (cardsResponse.cards.length > 0) {
        const cardToPlay = cardsResponse.cards[0];
        
        const playData = {
          roomId,
          playerId: 'host-id',
          cardId: cardToPlay.id
        };
        
        const response = await socketHelper.emitAndWait(
          hostClient,
          'playCard',
          playData,
          'cardPlayed'
        );
        
        expect(response.success).toBe(true);
        expect(response.gameState).toBeDefined();
      }
    });

    test('should take discard pile when no playable cards', async () => {
      // Start game
      const hostReadyData = { roomId, playerId: 'host-id', isReady: true };
      const playerReadyData = { roomId, playerId: 'player-id', isReady: true };
      
      await socketHelper.emitAndWait(
        hostClient,
        'setPlayerReady',
        hostReadyData,
        'playerReadyUpdated'
      );
      
      await socketHelper.emitAndWait(
        playerClient,
        'setPlayerReady',
        playerReadyData,
        'playerReadyUpdated'
      );
      
      await socketHelper.emitAndWait(
        hostClient,
        'startGame',
        {},
        'gameStarted'
      );
      
      // Take discard pile
      const takeData = {
        roomId,
        playerId: 'host-id'
      };
      
      const response = await socketHelper.emitAndWait(
        hostClient,
        'takeDiscardPile',
        takeData,
        'discardPileTaken'
      );
      
      expect(response.success).toBe(true);
      expect(response.gameState).toBeDefined();
    });
  });

  describe('Public Rooms Events', () => {
    test('should get public rooms list', async () => {
      const client = socketHelper.createClient();
      await socketHelper.waitForConnection(client);
      
      // Create a public room first
      const hostClient = socketHelper.createClient();
      await socketHelper.waitForConnection(hostClient);
      
      await socketHelper.emitAndWait(
        hostClient,
        'createRoom',
        { roomId: 'public-room', playerName: 'Host', maxPlayers: 4 },
        'roomCreated'
      );
      
      // Get public rooms
      const response = await socketHelper.emitAndWait(
        client,
        'getPublicRooms',
        {},
        'publicRoomsList'
      );
      
      expect(response.rooms).toBeDefined();
      expect(Array.isArray(response.rooms)).toBe(true);
      expect(response.rooms.length).toBeGreaterThan(0);
    });

    test('should get room info for specific room', async () => {
      const client = socketHelper.createClient();
      await socketHelper.waitForConnection(client);
      
      // Create a room first
      const hostClient = socketHelper.createClient();
      await socketHelper.waitForConnection(hostClient);
      
      const roomId = 'info-test-room';
      await socketHelper.emitAndWait(
        hostClient,
        'createRoom',
        { roomId, playerName: 'Host', maxPlayers: 4 },
        'roomCreated'
      );
      
      // Get room info
      const response = await socketHelper.emitAndWait(
        client,
        'getRoomInfo',
        { roomId },
        'roomInfo'
      );
      
      expect(response.roomInfo).toBeDefined();
      expect(response.roomInfo.roomId).toBe(roomId);
    });

    test('should search rooms by criteria', async () => {
      const client = socketHelper.createClient();
      await socketHelper.waitForConnection(client);
      
      // Create rooms with different configurations
      const hostClient = socketHelper.createClient();
      await socketHelper.waitForConnection(hostClient);
      
      await socketHelper.emitAndWait(
        hostClient,
        'createRoom',
        { roomId: 'search-room-1', playerName: 'Host', maxPlayers: 4 },
        'roomCreated'
      );
      
      // Search rooms
      const searchCriteria = {
        maxPlayers: 4,
        status: 'waiting'
      };
      
      const response = await socketHelper.emitAndWait(
        client,
        'searchRooms',
        { criteria: searchCriteria },
        'roomsSearchResult'
      );
      
      expect(response.rooms).toBeDefined();
      expect(response.criteria).toEqual(searchCriteria);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid room data', async () => {
      const client = socketHelper.createClient();
      await socketHelper.waitForConnection(client);
      
      const invalidData = {
        roomId: '',
        playerName: ''
      };
      
      const response = await socketHelper.emitAndWait(
        client,
        'createRoom',
        invalidData,
        'error'
      );
      
      expect(response.message).toBeDefined();
    });

    test('should handle invalid game actions', async () => {
      const client = socketHelper.createClient();
      await socketHelper.waitForConnection(client);
      
      const invalidPlayData = {
        roomId: 'non-existent',
        playerId: 'invalid-player',
        cardId: 999
      };
      
      const response = await socketHelper.emitAndWait(
        client,
        'playCard',
        invalidPlayData,
        'error'
      );
      
      expect(response.message).toBeDefined();
    });

    test('should handle server errors gracefully', async () => {
      const client = socketHelper.createClient();
      await socketHelper.waitForConnection(client);
      
      // Try to get info for non-existent room
      const response = await socketHelper.emitAndWait(
        client,
        'getRoomInfo',
        { roomId: 'non-existent-room' },
        'error'
      );
      
      expect(response.message).toBe('Sala no encontrada');
    });
  });

  describe('Concurrent Operations', () => {
    test('should handle multiple players joining simultaneously', async () => {
      const hostClient = socketHelper.createClient();
      await socketHelper.waitForConnection(hostClient);
      
      const roomId = 'concurrent-room';
      await socketHelper.emitAndWait(
        hostClient,
        'createRoom',
        { roomId, playerName: 'Host', maxPlayers: 6 },
        'roomCreated'
      );
      
      // Create multiple clients
      const joinClients = await socketHelper.createMultipleClients(4);
      
      // Join simultaneously
      const joinPromises = joinClients.map((client, index) => 
        socketHelper.emitAndWait(
          client,
          'joinRoom',
          { roomId, playerName: `Player ${index + 1}` },
          'roomJoined'
        )
      );
      
      const results = await Promise.all(joinPromises);
      
      expect(results).toHaveLength(4);
      results.forEach(result => {
        expect(result.roomId).toBe(roomId);
        expect(result.playerId).toBeDefined();
      });
    });

    test('should handle rapid game actions', async () => {
      // Setup game
      const hostClient = socketHelper.createClient();
      await socketHelper.waitForConnection(hostClient);
      
      const roomId = 'rapid-game';
      await socketHelper.emitAndWait(
        hostClient,
        'createRoom',
        { roomId, playerName: 'Host', maxPlayers: 2 },
        'roomCreated'
      );
      
      const playerClient = socketHelper.createClient();
      await socketHelper.waitForConnection(playerClient);
      
      await socketHelper.emitAndWait(
        playerClient,
        'joinRoom',
        { roomId, playerName: 'Player' },
        'roomJoined'
      );
      
      // Set both ready and start game rapidly
      const readyPromises = [
        socketHelper.emitAndWait(
          hostClient,
          'setPlayerReady',
          { roomId, playerId: 'host-id', isReady: true },
          'playerReadyUpdated'
        ),
        socketHelper.emitAndWait(
          playerClient,
          'setPlayerReady',
          { roomId, playerId: 'player-id', isReady: true },
          'playerReadyUpdated'
        )
      ];
      
      await Promise.all(readyPromises);
      
      const startResponse = await socketHelper.emitAndWait(
        hostClient,
        'startGame',
        {},
        'gameStarted'
      );
      
      expect(startResponse.success).toBe(true);
    });
  });
});
