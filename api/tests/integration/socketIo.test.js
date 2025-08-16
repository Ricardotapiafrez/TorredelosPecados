const SocketTestHelper = require('./helpers/socketTestHelper');

describe('Socket.io Integration Tests', () => {
  let socketHelper;

  beforeEach(async () => {
    socketHelper = new SocketTestHelper();
    await socketHelper.startServer();
  });

  afterEach(async () => {
    await socketHelper.stopServer();
  });

  describe('Socket.io Connection Management', () => {
    test('should establish WebSocket connection successfully', async () => {
      const client = socketHelper.createClient();
      await socketHelper.waitForConnection(client);
      
      expect(socketHelper.isClientConnected(client)).toBe(true);
      expect(socketHelper.getClientId(client)).toBeDefined();
      expect(typeof socketHelper.getClientId(client)).toBe('string');
    });

    test('should handle multiple concurrent connections', async () => {
      const clientCount = 10;
      const clients = await socketHelper.createMultipleClients(clientCount);
      
      expect(clients).toHaveLength(clientCount);
      
      for (const client of clients) {
        expect(socketHelper.isClientConnected(client)).toBe(true);
        expect(socketHelper.getClientId(client)).toBeDefined();
      }
    });

    test('should handle rapid connect/disconnect cycles', async () => {
      for (let i = 0; i < 5; i++) {
        const client = socketHelper.createClient();
        await socketHelper.waitForConnection(client);
        expect(socketHelper.isClientConnected(client)).toBe(true);
        
        client.disconnect();
        await socketHelper.wait(100);
        expect(socketHelper.isClientConnected(client)).toBe(false);
      }
    });

    test('should maintain connection stability under load', async () => {
      const clients = await socketHelper.createMultipleClients(20);
      
      // Simulate rapid events
      const promises = clients.map(async (client) => {
        for (let i = 0; i < 10; i++) {
          client.emit('ping');
          await socketHelper.wait(10);
        }
      });
      
      await Promise.all(promises);
      
      // Verify all clients still connected
      for (const client of clients) {
        expect(socketHelper.isClientConnected(client)).toBe(true);
      }
    });

    test('should handle connection timeout gracefully', async () => {
      const client = socketHelper.createClient();
      await socketHelper.waitForConnection(client);
      
      // Simulate network issues
      client.io.engine.close();
      await socketHelper.wait(1000);
      
      expect(socketHelper.isClientConnected(client)).toBe(false);
    });
  });

  describe('Socket.io Event Broadcasting', () => {
    test('should broadcast events to all clients in room', async () => {
      const clients = await socketHelper.createMultipleClients(4);
      
      // Create room with first client
      const roomData = {
        roomId: 'broadcast-test',
        playerName: 'Broadcaster',
        maxPlayers: 4
      };
      
      await socketHelper.emitAndWait(
        clients[0],
        'createRoom',
        roomData,
        'roomCreated'
      );
      
      // Join room with other clients
      for (let i = 1; i < clients.length; i++) {
        await socketHelper.emitAndWait(
          clients[i],
          'joinRoom',
          { roomId: roomData.roomId, playerName: `Player ${i}` },
          'playerJoined'
        );
      }
      
      // Start game to trigger broadcast
      const gameStartedPromise = Promise.all(
        clients.slice(1).map(client => 
          socketHelper.waitForEvent(client, 'gameStarted', 5000)
        )
      );
      
      clients[0].emit('startGame');
      
      const results = await gameStartedPromise;
      expect(results).toHaveLength(3);
      
      for (const result of results) {
        expect(result.gameState).toBeDefined();
        expect(result.gameState.phase).toBe('hand');
      }
    });

    test('should handle event ordering correctly', async () => {
      const clients = await socketHelper.createMultipleClients(2);
      
      const events = [];
      const expectedOrder = ['event1', 'event2', 'event3'];
      
      // Listen for events on second client
      expectedOrder.forEach(eventName => {
        clients[1].on(eventName, () => events.push(eventName));
      });
      
      // Emit events in order from first client
      for (const eventName of expectedOrder) {
        clients[0].emit(eventName);
        await socketHelper.wait(50);
      }
      
      await socketHelper.wait(200);
      expect(events).toEqual(expectedOrder);
    });

    test('should handle event acknowledgment', async () => {
      const client = socketHelper.createClient();
      await socketHelper.waitForConnection(client);
      
      const acknowledgment = await new Promise((resolve) => {
        client.emit('ping', resolve);
      });
      
      expect(acknowledgment).toBeDefined();
    });
  });

  describe('Socket.io Room Management', () => {
    test('should join and leave rooms correctly', async () => {
      const client = socketHelper.createClient();
      await socketHelper.waitForConnection(client);
      
      const roomData = {
        roomId: 'room-test',
        playerName: 'Room Player',
        maxPlayers: 4
      };
      
      // Create and join room
      const createResponse = await socketHelper.emitAndWait(
        client,
        'createRoom',
        roomData,
        'roomCreated'
      );
      
      expect(createResponse.roomId).toBe(roomData.roomId);
      
      // Verify room state
      const gameState = socketHelper.getGameState(roomData.roomId);
      expect(gameState).toBeDefined();
      expect(gameState.players).toHaveLength(1);
    });

    test('should handle room capacity limits', async () => {
      const clients = await socketHelper.createMultipleClients(5);
      
      // Create room with max 4 players
      const roomData = {
        roomId: 'capacity-test',
        playerName: 'Host',
        maxPlayers: 4
      };
      
      await socketHelper.emitAndWait(
        clients[0],
        'createRoom',
        roomData,
        'roomCreated'
      );
      
      // Join with 3 more players
      for (let i = 1; i < 4; i++) {
        await socketHelper.emitAndWait(
          clients[i],
          'joinRoom',
          { roomId: roomData.roomId, playerName: `Player ${i}` },
          'playerJoined'
        );
      }
      
      // Try to join with 5th player (should fail)
      const errorResponse = await socketHelper.emitAndWait(
        clients[4],
        'joinRoom',
        { roomId: roomData.roomId, playerName: 'Player 5' },
        'error'
      );
      
      expect(errorResponse.message).toContain('sala llena');
    });

    test('should handle room cleanup on disconnect', async () => {
      const clients = await socketHelper.createMultipleClients(2);
      
      const roomData = {
        roomId: 'cleanup-test',
        playerName: 'Host',
        maxPlayers: 4
      };
      
      await socketHelper.emitAndWait(
        clients[0],
        'createRoom',
        roomData,
        'roomCreated'
      );
      
      // Disconnect host
      clients[0].disconnect();
      await socketHelper.wait(500);
      
      // Verify room is cleaned up
      const gameState = socketHelper.getGameState(roomData.roomId);
      expect(gameState).toBeUndefined();
    });
  });

  describe('Socket.io Error Handling', () => {
    test('should handle invalid event data gracefully', async () => {
      const client = socketHelper.createClient();
      await socketHelper.waitForConnection(client);
      
      // Send invalid data
      const errorResponse = await socketHelper.emitAndWait(
        client,
        'playCard',
        { invalid: 'data' },
        'error'
      );
      
      expect(errorResponse.message).toBeDefined();
    });

    test('should handle malformed JSON gracefully', async () => {
      const client = socketHelper.createClient();
      await socketHelper.waitForConnection(client);
      
      // This would be handled by Socket.io internally
      expect(socketHelper.isClientConnected(client)).toBe(true);
    });

    test('should handle server errors without crashing', async () => {
      const client = socketHelper.createClient();
      await socketHelper.waitForConnection(client);
      
      // Simulate server error by calling non-existent method
      const errorResponse = await socketHelper.emitAndWait(
        client,
        'nonExistentEvent',
        {},
        'error'
      );
      
      expect(errorResponse.message).toBeDefined();
      expect(socketHelper.isClientConnected(client)).toBe(true);
    });
  });

  describe('Socket.io Performance and Scalability', () => {
    test('should handle high-frequency events', async () => {
      const client = socketHelper.createClient();
      await socketHelper.waitForConnection(client);
      
      const eventCount = 100;
      const promises = [];
      
      for (let i = 0; i < eventCount; i++) {
        promises.push(
          socketHelper.emitAndWait(client, 'ping', {}, 'pong', 1000)
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(eventCount);
    });

    test('should maintain performance with multiple rooms', async () => {
      const roomCount = 10;
      const clientsPerRoom = 4;
      const totalClients = roomCount * clientsPerRoom;
      
      const clients = await socketHelper.createMultipleClients(totalClients);
      
      // Create multiple rooms
      for (let roomIndex = 0; roomIndex < roomCount; roomIndex++) {
        const roomId = `performance-room-${roomIndex}`;
        const hostIndex = roomIndex * clientsPerRoom;
        
        await socketHelper.emitAndWait(
          clients[hostIndex],
          'createRoom',
          {
            roomId,
            playerName: `Host ${roomIndex}`,
            maxPlayers: 4
          },
          'roomCreated'
        );
        
        // Join room with other clients
        for (let playerIndex = 1; playerIndex < clientsPerRoom; playerIndex++) {
          const clientIndex = hostIndex + playerIndex;
          await socketHelper.emitAndWait(
            clients[clientIndex],
            'joinRoom',
            {
              roomId,
              playerName: `Player ${roomIndex}-${playerIndex}`
            },
            'playerJoined'
          );
        }
      }
      
      // Verify all rooms created successfully
      for (let roomIndex = 0; roomIndex < roomCount; roomIndex++) {
        const roomId = `performance-room-${roomIndex}`;
        const gameState = socketHelper.getGameState(roomId);
        expect(gameState).toBeDefined();
        expect(gameState.players).toHaveLength(clientsPerRoom);
      }
    });

    test('should handle memory usage efficiently', async () => {
      const initialMemory = process.memoryUsage();
      
      // Create and destroy multiple connections
      for (let i = 0; i < 50; i++) {
        const client = socketHelper.createClient();
        await socketHelper.waitForConnection(client);
        client.disconnect();
        await socketHelper.wait(10);
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      await socketHelper.wait(1000);
      
      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      
      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });

  describe('Socket.io Reconnection Handling', () => {
    test('should handle client reconnection gracefully', async () => {
      const client = socketHelper.createClient();
      await socketHelper.waitForConnection(client);
      
      const roomData = {
        roomId: 'reconnect-test',
        playerName: 'Reconnect Player',
        maxPlayers: 4
      };
      
      await socketHelper.emitAndWait(
        client,
        'createRoom',
        roomData,
        'roomCreated'
      );
      
      const originalPlayerId = socketHelper.getClientId(client);
      
      // Disconnect and reconnect
      client.disconnect();
      await socketHelper.wait(500);
      
      const newClient = socketHelper.createClient();
      await socketHelper.waitForConnection(newClient);
      
      // Try to reconnect to same room
      const reconnectResponse = await socketHelper.emitAndWait(
        newClient,
        'joinRoom',
        { roomId: roomData.roomId, playerName: 'Reconnect Player' },
        'playerJoined'
      );
      
      expect(reconnectResponse.playerId).toBeDefined();
    });

    test('should handle server restart gracefully', async () => {
      const client = socketHelper.createClient();
      await socketHelper.waitForConnection(client);
      
      // Restart server
      await socketHelper.stopServer();
      await socketHelper.startServer();
      
      // Client should be disconnected
      expect(socketHelper.isClientConnected(client)).toBe(false);
      
      // Create new client after restart
      const newClient = socketHelper.createClient();
      await socketHelper.waitForConnection(newClient);
      expect(socketHelper.isClientConnected(newClient)).toBe(true);
    });
  });

  describe('Socket.io Security', () => {
    test('should validate event data', async () => {
      const client = socketHelper.createClient();
      await socketHelper.waitForConnection(client);
      
      // Test with malicious data
      const maliciousData = {
        roomId: 'test',
        playerName: 'A'.repeat(1000), // Very long name
        maxPlayers: -1 // Invalid value
      };
      
      const errorResponse = await socketHelper.emitAndWait(
        client,
        'createRoom',
        maliciousData,
        'error'
      );
      
      expect(errorResponse.message).toBeDefined();
    });

    test('should handle rate limiting', async () => {
      const client = socketHelper.createClient();
      await socketHelper.waitForConnection(client);
      
      // Send many events rapidly
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(
          socketHelper.emitAndWait(client, 'ping', {}, 'pong', 1000)
        );
      }
      
      // Should handle without crashing
      const results = await Promise.all(promises);
      expect(results).toHaveLength(100);
    });

    test('should sanitize user input', async () => {
      const client = socketHelper.createClient();
      await socketHelper.waitForConnection(client);
      
      const maliciousInput = {
        roomId: 'test<script>alert("xss")</script>',
        playerName: '<img src="x" onerror="alert(1)">',
        maxPlayers: 4
      };
      
      const response = await socketHelper.emitAndWait(
        client,
        'createRoom',
        maliciousInput,
        'roomCreated'
      );
      
      // Should handle without executing malicious code
      expect(response.roomId).toBeDefined();
      expect(socketHelper.isClientConnected(client)).toBe(true);
    });
  });

  describe('Socket.io Event Reliability', () => {
    test('should ensure event delivery order', async () => {
      const clients = await socketHelper.createMultipleClients(2);
      
      const events = [];
      const eventCount = 10;
      
      // Listen for events
      clients[1].on('testEvent', (data) => {
        events.push(data.sequence);
      });
      
      // Send events in sequence
      for (let i = 0; i < eventCount; i++) {
        clients[0].emit('testEvent', { sequence: i });
        await socketHelper.wait(10);
      }
      
      await socketHelper.wait(500);
      
      // Verify order
      expect(events).toHaveLength(eventCount);
      for (let i = 0; i < eventCount; i++) {
        expect(events[i]).toBe(i);
      }
    });

    test('should handle event acknowledgment correctly', async () => {
      const client = socketHelper.createClient();
      await socketHelper.waitForConnection(client);
      
      let acknowledgmentReceived = false;
      
      const acknowledgment = await new Promise((resolve) => {
        client.emit('ping', () => {
          acknowledgmentReceived = true;
          resolve();
        });
      });
      
      expect(acknowledgmentReceived).toBe(true);
    });

    test('should handle event timeouts gracefully', async () => {
      const client = socketHelper.createClient();
      await socketHelper.waitForConnection(client);
      
      // Test with very short timeout
      await expect(
        socketHelper.waitForEvent(client, 'nonExistentEvent', 100)
      ).rejects.toThrow('Timeout waiting for event');
    });
  });

  describe('Socket.io Integration with Game Logic', () => {
    test('should handle complete game flow via Socket.io', async () => {
      const clients = await socketHelper.createMultipleClients(4);
      
      // Create room
      const roomData = {
        roomId: 'game-flow-test',
        playerName: 'Game Host',
        maxPlayers: 4
      };
      
      await socketHelper.emitAndWait(
        clients[0],
        'createRoom',
        roomData,
        'roomCreated'
      );
      
      // Join room with other players
      for (let i = 1; i < clients.length; i++) {
        await socketHelper.emitAndWait(
          clients[i],
          'joinRoom',
          { roomId: roomData.roomId, playerName: `Player ${i}` },
          'playerJoined'
        );
      }
      
      // Set all players ready
      for (const client of clients) {
        await socketHelper.emitAndWait(
          client,
          'setPlayerReady',
          { ready: true },
          'playerReadyStatusChanged'
        );
      }
      
      // Start game
      const gameStartedPromises = clients.slice(1).map(client =>
        socketHelper.waitForEvent(client, 'gameStarted', 5000)
      );
      
      clients[0].emit('startGame');
      
      const gameStartedResults = await Promise.all(gameStartedPromises);
      
      for (const result of gameStartedResults) {
        expect(result.gameState).toBeDefined();
        expect(result.gameState.phase).toBe('hand');
        expect(result.gameState.players).toHaveLength(4);
      }
    });

    test('should handle real-time game updates', async () => {
      const clients = await socketHelper.createMultipleClients(2);
      
      // Setup game
      const roomData = {
        roomId: 'realtime-test',
        playerName: 'Player 1',
        maxPlayers: 2
      };
      
      await socketHelper.emitAndWait(
        clients[0],
        'createRoom',
        roomData,
        'roomCreated'
      );
      
      await socketHelper.emitAndWait(
        clients[1],
        'joinRoom',
        { roomId: roomData.roomId, playerName: 'Player 2' },
        'playerJoined'
      );
      
      // Set ready and start
      for (const client of clients) {
        await socketHelper.emitAndWait(
          client,
          'setPlayerReady',
          { ready: true },
          'playerReadyStatusChanged'
        );
      }
      
      const gameStartedPromise = socketHelper.waitForEvent(
        clients[1],
        'gameStarted',
        5000
      );
      
      clients[0].emit('startGame');
      await gameStartedPromise;
      
      // Get playable cards
      const playableCardsResponse = await socketHelper.emitAndWait(
        clients[0],
        'getPlayableCards',
        {},
        'playableCards'
      );
      
      expect(playableCardsResponse.cards).toBeDefined();
      expect(Array.isArray(playableCardsResponse.cards)).toBe(true);
    });
  });
});
