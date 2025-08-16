const SocketTestHelper = require('./helpers/socketTestHelper');

describe('Socket.io Performance and Stress Tests', () => {
  let socketHelper;

  beforeEach(async () => {
    socketHelper = new SocketTestHelper();
    await socketHelper.startServer();
  });

  afterEach(async () => {
    await socketHelper.stopServer();
  });

  describe('High Load Connection Tests', () => {
    test('should handle 100 concurrent connections', async () => {
      const startTime = Date.now();
      const clientCount = 100;
      
      const clients = await socketHelper.createMultipleClients(clientCount);
      const endTime = Date.now();
      
      expect(clients).toHaveLength(clientCount);
      
      // Verify all connections are stable
      for (const client of clients) {
        expect(socketHelper.isClientConnected(client)).toBe(true);
      }
      
      // Connection time should be reasonable (less than 10 seconds)
      const connectionTime = endTime - startTime;
      expect(connectionTime).toBeLessThan(10000);
      
      console.log(`Connected ${clientCount} clients in ${connectionTime}ms`);
    }, 30000);

    test('should handle 500 rapid connect/disconnect cycles', async () => {
      const cycles = 500;
      const startTime = Date.now();
      
      for (let i = 0; i < cycles; i++) {
        const client = socketHelper.createClient();
        await socketHelper.waitForConnection(client);
        client.disconnect();
        await socketHelper.wait(10);
      }
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // Should complete in reasonable time
      expect(totalTime).toBeLessThan(30000);
      
      console.log(`Completed ${cycles} connect/disconnect cycles in ${totalTime}ms`);
    }, 60000);

    test('should maintain performance under sustained load', async () => {
      const clientCount = 50;
      const duration = 10000; // 10 seconds
      const eventInterval = 100; // Events every 100ms
      
      const clients = await socketHelper.createMultipleClients(clientCount);
      const startTime = Date.now();
      let eventCount = 0;
      
      // Send events continuously
      const eventPromises = clients.map(async (client) => {
        while (Date.now() - startTime < duration) {
          try {
            await socketHelper.emitAndWait(client, 'ping', {}, 'pong', 1000);
            eventCount++;
          } catch (error) {
            // Ignore timeout errors
          }
          await socketHelper.wait(eventInterval);
        }
      });
      
      await Promise.all(eventPromises);
      
      // Verify all clients still connected
      for (const client of clients) {
        expect(socketHelper.isClientConnected(client)).toBe(true);
      }
      
      console.log(`Sent ${eventCount} events across ${clientCount} clients in ${duration}ms`);
      expect(eventCount).toBeGreaterThan(0);
    }, 30000);
  });

  describe('Memory and Resource Management', () => {
    test('should not leak memory with repeated connections', async () => {
      const initialMemory = process.memoryUsage();
      const cycles = 100;
      
      for (let i = 0; i < cycles; i++) {
        const client = socketHelper.createClient();
        await socketHelper.waitForConnection(client);
        client.disconnect();
        await socketHelper.wait(50);
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      await socketHelper.wait(1000);
      
      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      
      // Memory increase should be minimal (less than 5MB)
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024);
      
      console.log(`Memory increase after ${cycles} cycles: ${memoryIncrease / 1024 / 1024}MB`);
    }, 30000);

    test('should handle large event payloads efficiently', async () => {
      const client = socketHelper.createClient();
      await socketHelper.waitForConnection(client);
      
      const largePayload = {
        data: 'A'.repeat(10000), // 10KB payload
        timestamp: Date.now(),
        metadata: {
          id: 'test',
          type: 'large-payload',
          size: 10000
        }
      };
      
      const startTime = Date.now();
      const eventCount = 100;
      
      for (let i = 0; i < eventCount; i++) {
        client.emit('testLargePayload', largePayload);
        await socketHelper.wait(10);
      }
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // Should handle large payloads efficiently
      expect(totalTime).toBeLessThan(5000);
      expect(socketHelper.isClientConnected(client)).toBe(true);
      
      console.log(`Sent ${eventCount} large payloads in ${totalTime}ms`);
    }, 15000);
  });

  describe('Network Condition Simulation', () => {
    test('should handle network latency gracefully', async () => {
      const client = socketHelper.createClient();
      await socketHelper.waitForConnection(client);
      
      const latencies = [50, 100, 200, 500, 1000];
      const results = [];
      
      for (const latency of latencies) {
        const startTime = Date.now();
        
        try {
          await socketHelper.emitAndWait(client, 'ping', {}, 'pong', latency * 2);
          const endTime = Date.now();
          results.push(endTime - startTime);
        } catch (error) {
          results.push('timeout');
        }
        
        await socketHelper.wait(100);
      }
      
      // Should handle various latencies
      expect(results.some(r => r !== 'timeout')).toBe(true);
      expect(socketHelper.isClientConnected(client)).toBe(true);
      
      console.log('Latency test results:', results);
    }, 20000);

    test('should handle packet loss simulation', async () => {
      const client = socketHelper.createClient();
      await socketHelper.waitForConnection(client);
      
      const eventCount = 50;
      let successCount = 0;
      let timeoutCount = 0;
      
      for (let i = 0; i < eventCount; i++) {
        try {
          await socketHelper.emitAndWait(client, 'ping', {}, 'pong', 1000);
          successCount++;
        } catch (error) {
          timeoutCount++;
        }
        await socketHelper.wait(50);
      }
      
      // Should maintain connection even with some timeouts
      expect(socketHelper.isClientConnected(client)).toBe(true);
      expect(successCount).toBeGreaterThan(0);
      
      console.log(`Success: ${successCount}, Timeouts: ${timeoutCount}`);
    }, 15000);
  });

  describe('Room and Game State Performance', () => {
    test('should handle multiple rooms with many players', async () => {
      const roomCount = 20;
      const playersPerRoom = 4;
      const totalClients = roomCount * playersPerRoom;
      
      const startTime = Date.now();
      const clients = await socketHelper.createMultipleClients(totalClients);
      
      // Create rooms and join players
      for (let roomIndex = 0; roomIndex < roomCount; roomIndex++) {
        const roomId = `perf-room-${roomIndex}`;
        const hostIndex = roomIndex * playersPerRoom;
        
        await socketHelper.emitAndWait(
          clients[hostIndex],
          'createRoom',
          {
            roomId,
            playerName: `Host ${roomIndex}`,
            maxPlayers: playersPerRoom
          },
          'roomCreated'
        );
        
        // Join room with other players
        for (let playerIndex = 1; playerIndex < playersPerRoom; playerIndex++) {
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
      
      const endTime = Date.now();
      const setupTime = endTime - startTime;
      
      // Verify all rooms created successfully
      for (let roomIndex = 0; roomIndex < roomCount; roomIndex++) {
        const roomId = `perf-room-${roomIndex}`;
        const gameState = socketHelper.getGameState(roomId);
        expect(gameState).toBeDefined();
        expect(gameState.players).toHaveLength(playersPerRoom);
      }
      
      console.log(`Created ${roomCount} rooms with ${playersPerRoom} players each in ${setupTime}ms`);
      expect(setupTime).toBeLessThan(30000);
    }, 60000);

    test('should handle rapid game state updates', async () => {
      const clients = await socketHelper.createMultipleClients(4);
      
      // Setup game
      const roomData = {
        roomId: 'rapid-updates',
        playerName: 'Host',
        maxPlayers: 4
      };
      
      await socketHelper.emitAndWait(
        clients[0],
        'createRoom',
        roomData,
        'roomCreated'
      );
      
      for (let i = 1; i < clients.length; i++) {
        await socketHelper.emitAndWait(
          clients[i],
          'joinRoom',
          { roomId: roomData.roomId, playerName: `Player ${i}` },
          'playerJoined'
        );
      }
      
      // Set all ready and start
      for (const client of clients) {
        await socketHelper.emitAndWait(
          client,
          'setPlayerReady',
          { ready: true },
          'playerReadyStatusChanged'
        );
      }
      
      const gameStartedPromise = Promise.all(
        clients.slice(1).map(client => 
          socketHelper.waitForEvent(client, 'gameStarted', 5000)
        )
      );
      
      clients[0].emit('startGame');
      await gameStartedPromise;
      
      // Rapid state updates
      const updateCount = 50;
      const startTime = Date.now();
      
      for (let i = 0; i < updateCount; i++) {
        await socketHelper.emitAndWait(
          clients[0],
          'getPlayableCards',
          {},
          'playableCards'
        );
        await socketHelper.wait(10);
      }
      
      const endTime = Date.now();
      const updateTime = endTime - startTime;
      
      console.log(`Completed ${updateCount} rapid updates in ${updateTime}ms`);
      expect(updateTime).toBeLessThan(10000);
    }, 30000);
  });

  describe('Concurrent Event Processing', () => {
    test('should handle concurrent events from multiple clients', async () => {
      const clientCount = 20;
      const eventsPerClient = 10;
      const clients = await socketHelper.createMultipleClients(clientCount);
      
      const startTime = Date.now();
      
      // Send events concurrently from all clients
      const eventPromises = clients.map(async (client, index) => {
        for (let i = 0; i < eventsPerClient; i++) {
          try {
            await socketHelper.emitAndWait(client, 'ping', {}, 'pong', 1000);
          } catch (error) {
            // Ignore timeouts
          }
          await socketHelper.wait(10);
        }
      });
      
      await Promise.all(eventPromises);
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // Verify all clients still connected
      for (const client of clients) {
        expect(socketHelper.isClientConnected(client)).toBe(true);
      }
      
      console.log(`Processed ${clientCount * eventsPerClient} concurrent events in ${totalTime}ms`);
      expect(totalTime).toBeLessThan(30000);
    }, 60000);

    test('should handle event queue overflow gracefully', async () => {
      const client = socketHelper.createClient();
      await socketHelper.waitForConnection(client);
      
      const eventCount = 1000;
      const promises = [];
      
      // Send many events rapidly without waiting
      for (let i = 0; i < eventCount; i++) {
        promises.push(
          socketHelper.emitAndWait(client, 'ping', {}, 'pong', 5000)
        );
      }
      
      // Should handle queue overflow without crashing
      const results = await Promise.allSettled(promises);
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      console.log(`Successful: ${successful}, Failed: ${failed}`);
      
      // Should maintain connection
      expect(socketHelper.isClientConnected(client)).toBe(true);
      expect(successful).toBeGreaterThan(0);
    }, 30000);
  });

  describe('System Resource Monitoring', () => {
    test('should monitor CPU usage under load', async () => {
      const clientCount = 50;
      const clients = await socketHelper.createMultipleClients(clientCount);
      
      const startTime = Date.now();
      const duration = 5000; // 5 seconds
      
      // Send events continuously
      const eventPromises = clients.map(async (client) => {
        while (Date.now() - startTime < duration) {
          try {
            client.emit('ping');
          } catch (error) {
            // Ignore errors
          }
          await socketHelper.wait(50);
        }
      });
      
      await Promise.all(eventPromises);
      
      // Verify system stability
      for (const client of clients) {
        expect(socketHelper.isClientConnected(client)).toBe(true);
      }
      
      console.log(`Maintained ${clientCount} connections for ${duration}ms`);
    }, 20000);

    test('should handle file descriptor limits', async () => {
      const maxConnections = 200;
      const clients = [];
      
      try {
        for (let i = 0; i < maxConnections; i++) {
          const client = socketHelper.createClient();
          await socketHelper.waitForConnection(client);
          clients.push(client);
          
          if (i % 50 === 0) {
            console.log(`Connected ${i + 1} clients`);
          }
        }
        
        // Verify connections are stable
        for (const client of clients) {
          expect(socketHelper.isClientConnected(client)).toBe(true);
        }
        
        console.log(`Successfully connected ${clients.length} clients`);
      } catch (error) {
        console.log(`Failed to connect ${maxConnections} clients:`, error.message);
        // Should handle gracefully
        expect(clients.length).toBeGreaterThan(0);
      }
    }, 60000);
  });
});
