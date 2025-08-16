const SocketTestHelper = require('./helpers/socketTestHelper');

describe('Socket.io Basic Integration Tests', () => {
  let socketHelper;

  beforeEach(async () => {
    socketHelper = new SocketTestHelper();
    await socketHelper.startServer();
  });

  afterEach(async () => {
    await socketHelper.stopServer();
  });

  describe('Basic Connection Tests', () => {
    test('should connect client successfully', async () => {
      const client = socketHelper.createClient();
      await socketHelper.waitForConnection(client);
      
      expect(socketHelper.isClientConnected(client)).toBe(true);
      expect(socketHelper.getClientId(client)).toBeDefined();
      expect(typeof socketHelper.getClientId(client)).toBe('string');
    });

    test('should handle multiple client connections', async () => {
      const clientCount = 5;
      const clients = await socketHelper.createMultipleClients(clientCount);
      
      expect(clients).toHaveLength(clientCount);
      
      for (const client of clients) {
        expect(socketHelper.isClientConnected(client)).toBe(true);
        expect(socketHelper.getClientId(client)).toBeDefined();
      }
    });

    test('should handle client disconnection', async () => {
      const client = socketHelper.createClient();
      await socketHelper.waitForConnection(client);
      
      expect(socketHelper.isClientConnected(client)).toBe(true);
      
      client.disconnect();
      await socketHelper.wait(100);
      
      expect(socketHelper.isClientConnected(client)).toBe(false);
    });
  });

  describe('Basic Event Tests', () => {
    test('should respond to ping event', async () => {
      const client = socketHelper.createClient();
      await socketHelper.waitForConnection(client);
      
      const pingResponse = await new Promise((resolve) => {
        client.emit('ping', resolve);
      });
      
      expect(pingResponse).toBeDefined();
    });

    test('should handle room creation', async () => {
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
      
      expect(response.roomId).toBeDefined();
      expect(response.playerId).toBeDefined();
      expect(response.gameState).toBeDefined();
    });

    test('should handle room joining', async () => {
      // Create room first
      const hostClient = socketHelper.createClient();
      await socketHelper.waitForConnection(hostClient);
      
      const roomData = {
        roomId: 'join-test',
        playerName: 'Host Player',
        maxPlayers: 4
      };
      
      const createResponse = await socketHelper.emitAndWait(
        hostClient,
        'createRoom',
        roomData,
        'roomCreated'
      );
      
      // Join room with second player
      const joinClient = socketHelper.createClient();
      await socketHelper.waitForConnection(joinClient);
      
      const joinResponse = await socketHelper.emitAndWait(
        joinClient,
        'joinRoom',
        { roomId: createResponse.roomId, playerName: 'Second Player' },
        'roomJoined'
      );
      
      expect(joinResponse.playerId).toBeDefined();
      expect(joinResponse.gameState).toBeDefined();
    });
  });

  describe('Error Handling Tests', () => {
    test('should handle invalid event data', async () => {
      const client = socketHelper.createClient();
      await socketHelper.waitForConnection(client);
      
      // Send invalid data for playCard
      const errorResponse = await socketHelper.emitAndWait(
        client,
        'playCard',
        { invalid: 'data' },
        'error'
      );
      
      expect(errorResponse.message).toBeDefined();
    });

    test('should handle non-existent events gracefully', async () => {
      const client = socketHelper.createClient();
      await socketHelper.waitForConnection(client);
      
      // Try to emit non-existent event
      client.emit('nonExistentEvent', {});
      
      // Should not crash and maintain connection
      expect(socketHelper.isClientConnected(client)).toBe(true);
    });
  });

  describe('Game State Tests', () => {
    test('should maintain game state after room creation', async () => {
      const client = socketHelper.createClient();
      await socketHelper.waitForConnection(client);
      
      const roomData = {
        roomId: 'state-test',
        playerName: 'State Player',
        maxPlayers: 4
      };
      
      const response = await socketHelper.emitAndWait(
        client,
        'createRoom',
        roomData,
        'roomCreated'
      );
      
      // Wait for game state to be available
      await socketHelper.wait(100);
      
      // Verify game state exists
      const gameState = socketHelper.getGameState(response.roomId);
      expect(gameState).toBeDefined();
      expect(gameState.players).toBeDefined();
      expect(Array.isArray(gameState.players)).toBe(true);
    });

    test('should handle player ready status', async () => {
      const client = socketHelper.createClient();
      await socketHelper.waitForConnection(client);
      
      const roomData = {
        roomId: 'ready-test',
        playerName: 'Ready Player',
        maxPlayers: 4
      };
      
      const createResponse = await socketHelper.emitAndWait(
        client,
        'createRoom',
        roomData,
        'roomCreated'
      );
      
      // Wait for game state to be available
      await socketHelper.wait(100);
      
      // Set player ready and wait for state update
      const readyPromise = socketHelper.waitForPlayerReady(client);
      client.emit('setPlayerReady', { isReady: true });
      
      // Wait for the state update
      await readyPromise;
      
      // Wait a bit more for the state to be fully updated
      await socketHelper.wait(100);
      
      // Verify the game state was updated
      const gameState = socketHelper.getGameState(createResponse.roomId);
      expect(gameState).toBeDefined();
      expect(gameState.players).toBeDefined();
      expect(gameState.players.length).toBe(1);
      
      // Check if the player is ready
      const player = gameState.players.find(p => p.id === createResponse.playerId);
      expect(player).toBeDefined();
      expect(player.isReady).toBe(true);
    });
  });
});
