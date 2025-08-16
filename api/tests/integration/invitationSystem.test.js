const SocketTestHelper = require('./helpers/socketTestHelper');

describe('Socket.io Invitation System Integration', () => {
  let socketHelper;

  beforeEach(async () => {
    socketHelper = new SocketTestHelper();
    await socketHelper.startServer();
  });

  afterEach(async () => {
    await socketHelper.stopServer();
  });

  describe('Invitation Code Generation', () => {
    test('should generate invitation code successfully', async () => {
      // Create room first
      const hostClient = socketHelper.createClient();
      await socketHelper.waitForConnection(hostClient);
      
      const roomData = {
        roomId: 'invite-room',
        playerName: 'Host Player',
        maxPlayers: 4
      };
      
      const createResponse = await socketHelper.emitAndWait(
        hostClient,
        'createRoom',
        roomData,
        'roomCreated'
      );
      
      // Generate invitation code
      const generateData = {
        roomId: roomData.roomId,
        playerId: createResponse.playerId,
        options: {
          maxUses: 5,
          expiresIn: 3600000 // 1 hour
        }
      };
      
      const response = await socketHelper.emitAndWait(
        hostClient,
        'generateInvitationCode',
        generateData,
        'invitationCodeGenerated'
      );
      
      expect(response.code).toBeDefined();
      expect(response.roomId).toBe(roomData.roomId);
      expect(response.code).toMatch(/^[A-Z0-9]{6}$/); // 6 character alphanumeric code
    });

    test('should generate invitation code with default options', async () => {
      // Create room first
      const hostClient = socketHelper.createClient();
      await socketHelper.waitForConnection(hostClient);
      
      const roomData = {
        roomId: 'default-invite-room',
        playerName: 'Host Player',
        maxPlayers: 4
      };
      
      const createResponse = await socketHelper.emitAndWait(
        hostClient,
        'createRoom',
        roomData,
        'roomCreated'
      );
      
      // Generate invitation code without options
      const generateData = {
        roomId: roomData.roomId,
        playerId: createResponse.playerId
      };
      
      const response = await socketHelper.emitAndWait(
        hostClient,
        'generateInvitationCode',
        generateData,
        'invitationCodeGenerated'
      );
      
      expect(response.code).toBeDefined();
      expect(response.roomId).toBe(roomData.roomId);
    });

    test('should reject generating code for non-existent room', async () => {
      const client = socketHelper.createClient();
      await socketHelper.waitForConnection(client);
      
      const generateData = {
        roomId: 'non-existent-room',
        playerId: 'some-player-id'
      };
      
      const response = await socketHelper.emitAndWait(
        client,
        'generateInvitationCode',
        generateData,
        'error'
      );
      
      expect(response.message).toContain('Sala no encontrada');
    });

    test('should reject generating code for non-host player', async () => {
      // Create room
      const hostClient = socketHelper.createClient();
      await socketHelper.waitForConnection(hostClient);
      
      const roomData = {
        roomId: 'host-only-room',
        playerName: 'Host Player',
        maxPlayers: 4
      };
      
      const createResponse = await socketHelper.emitAndWait(
        hostClient,
        'createRoom',
        roomData,
        'roomCreated'
      );
      
      // Join with second player
      const joinClient = socketHelper.createClient();
      await socketHelper.waitForConnection(joinClient);
      
      const joinResponse = await socketHelper.emitAndWait(
        joinClient,
        'joinRoom',
        { roomId: roomData.roomId, playerName: 'Join Player' },
        'roomJoined'
      );
      
      // Try to generate code as non-host
      const generateData = {
        roomId: roomData.roomId,
        playerId: joinResponse.playerId
      };
      
      const response = await socketHelper.emitAndWait(
        joinClient,
        'generateInvitationCode',
        generateData,
        'error'
      );
      
      expect(response.message).toContain('No tienes permisos');
    });
  });

  describe('Invitation Code Validation', () => {
    let hostClient, roomId, invitationCode;

    beforeEach(async () => {
      // Setup room and generate invitation code
      hostClient = socketHelper.createClient();
      await socketHelper.waitForConnection(hostClient);
      
      const roomData = {
        roomId: 'validation-room',
        playerName: 'Host Player',
        maxPlayers: 4
      };
      
      const createResponse = await socketHelper.emitAndWait(
        hostClient,
        'createRoom',
        roomData,
        'roomCreated'
      );
      
      roomId = roomData.roomId;
      
      const generateData = {
        roomId,
        playerId: createResponse.playerId,
        options: {
          maxUses: 3,
          expiresIn: 3600000
        }
      };
      
      const generateResponse = await socketHelper.emitAndWait(
        hostClient,
        'generateInvitationCode',
        generateData,
        'invitationCodeGenerated'
      );
      
      invitationCode = generateResponse.code;
    });

    test('should validate valid invitation code', async () => {
      const client = socketHelper.createClient();
      await socketHelper.waitForConnection(client);
      
      const validateData = {
        code: invitationCode
      };
      
      const response = await socketHelper.emitAndWait(
        client,
        'validateInvitationCode',
        validateData,
        'invitationCodeValidated'
      );
      
      expect(response.isValid).toBe(true);
      expect(response.roomInfo).toBeDefined();
      expect(response.roomInfo.roomId).toBe(roomId);
      expect(response.remainingUses).toBeGreaterThan(0);
      expect(response.expiresAt).toBeDefined();
    });

    test('should reject invalid invitation code', async () => {
      const client = socketHelper.createClient();
      await socketHelper.waitForConnection(client);
      
      const validateData = {
        code: 'INVALID'
      };
      
      const response = await socketHelper.emitAndWait(
        client,
        'validateInvitationCode',
        validateData,
        'error'
      );
      
      expect(response.message).toContain('Código de invitación no válido');
    });

    test('should reject expired invitation code', async () => {
      // Create room with short expiration
      const shortExpireClient = socketHelper.createClient();
      await socketHelper.waitForConnection(shortExpireClient);
      
      const roomData = {
        roomId: 'expire-room',
        playerName: 'Host Player',
        maxPlayers: 4
      };
      
      const createResponse = await socketHelper.emitAndWait(
        shortExpireClient,
        'createRoom',
        roomData,
        'roomCreated'
      );
      
      const generateData = {
        roomId: roomData.roomId,
        playerId: createResponse.playerId,
        options: {
          maxUses: 1,
          expiresIn: 100 // 100ms expiration
        }
      };
      
      const generateResponse = await socketHelper.emitAndWait(
        shortExpireClient,
        'generateInvitationCode',
        generateData,
        'invitationCodeGenerated'
      );
      
      // Wait for expiration
      await socketHelper.wait(200);
      
      // Try to validate expired code
      const client = socketHelper.createClient();
      await socketHelper.waitForConnection(client);
      
      const validateData = {
        code: generateResponse.code
      };
      
      const response = await socketHelper.emitAndWait(
        client,
        'validateInvitationCode',
        validateData,
        'error'
      );
      
      expect(response.message).toContain('expirado');
    });

    test('should reject invitation code with max uses reached', async () => {
      // Create room with max 1 use
      const maxUseClient = socketHelper.createClient();
      await socketHelper.waitForConnection(maxUseClient);
      
      const roomData = {
        roomId: 'max-use-room',
        playerName: 'Host Player',
        maxPlayers: 4
      };
      
      const createResponse = await socketHelper.emitAndWait(
        maxUseClient,
        'createRoom',
        roomData,
        'roomCreated'
      );
      
      const generateData = {
        roomId: roomData.roomId,
        playerId: createResponse.playerId,
        options: {
          maxUses: 1,
          expiresIn: 3600000
        }
      };
      
      const generateResponse = await socketHelper.emitAndWait(
        maxUseClient,
        'generateInvitationCode',
        generateData,
        'invitationCodeGenerated'
      );
      
      // Use the code once
      const firstClient = socketHelper.createClient();
      await socketHelper.waitForConnection(firstClient);
      
      await socketHelper.emitAndWait(
        firstClient,
        'useInvitationCode',
        { code: generateResponse.code, playerName: 'First Player' },
        'invitationCodeUsed'
      );
      
      // Try to use the code again
      const secondClient = socketHelper.createClient();
      await socketHelper.waitForConnection(secondClient);
      
      const response = await socketHelper.emitAndWait(
        secondClient,
        'useInvitationCode',
        { code: generateResponse.code, playerName: 'Second Player' },
        'invitationCodeError'
      );
      
      expect(response.error).toContain('máximo de usos');
    });
  });

  describe('Invitation Code Usage', () => {
    test('should use invitation code successfully', async () => {
      // Create room and generate code
      const hostClient = socketHelper.createClient();
      await socketHelper.waitForConnection(hostClient);
      
      const roomData = {
        roomId: 'usage-room',
        playerName: 'Host Player',
        maxPlayers: 4
      };
      
      const createResponse = await socketHelper.emitAndWait(
        hostClient,
        'createRoom',
        roomData,
        'roomCreated'
      );
      
      const generateData = {
        roomId: roomData.roomId,
        playerId: createResponse.playerId
      };
      
      const generateResponse = await socketHelper.emitAndWait(
        hostClient,
        'generateInvitationCode',
        generateData,
        'invitationCodeGenerated'
      );
      
      // Use the invitation code
      const joinClient = socketHelper.createClient();
      await socketHelper.waitForConnection(joinClient);
      
      const useData = {
        code: generateResponse.code,
        playerName: 'Invited Player'
      };
      
      const response = await socketHelper.emitAndWait(
        joinClient,
        'useInvitationCode',
        useData,
        'invitationCodeUsed'
      );
      
      expect(response.roomId).toBe(roomData.roomId);
      expect(response.playerId).toBeDefined();
      expect(response.gameState).toBeDefined();
      expect(response.roomInfo).toBeDefined();
    });

    test('should notify other players when someone joins via invitation', async () => {
      // Create room and generate code
      const hostClient = socketHelper.createClient();
      await socketHelper.waitForConnection(hostClient);
      
      const roomData = {
        roomId: 'notify-room',
        playerName: 'Host Player',
        maxPlayers: 4
      };
      
      const createResponse = await socketHelper.emitAndWait(
        hostClient,
        'createRoom',
        roomData,
        'roomCreated'
      );
      
      const generateData = {
        roomId: roomData.roomId,
        playerId: createResponse.playerId
      };
      
      const generateResponse = await socketHelper.emitAndWait(
        hostClient,
        'generateInvitationCode',
        generateData,
        'invitationCodeGenerated'
      );
      
      // Host listens for player joined event
      const playerJoinedPromise = socketHelper.waitForEvent(
        hostClient,
        'playerJoined',
        5000
      );
      
      // Use the invitation code
      const joinClient = socketHelper.createClient();
      await socketHelper.waitForConnection(joinClient);
      
      const useData = {
        code: generateResponse.code,
        playerName: 'Invited Player'
      };
      
      await socketHelper.emitAndWait(
        joinClient,
        'useInvitationCode',
        useData,
        'invitationCodeUsed'
      );
      
      // Check if host received notification
      const notification = await playerJoinedPromise;
      expect(notification.player.name).toBe('Invited Player');
      expect(notification.player.id).toBeDefined();
    });

    test('should reject using invitation code for full room', async () => {
      // Create room with max 2 players
      const hostClient = socketHelper.createClient();
      await socketHelper.waitForConnection(hostClient);
      
      const roomData = {
        roomId: 'full-room',
        playerName: 'Host Player',
        maxPlayers: 2
      };
      
      const createResponse = await socketHelper.emitAndWait(
        hostClient,
        'createRoom',
        roomData,
        'roomCreated'
      );
      
      const generateData = {
        roomId: roomData.roomId,
        playerId: createResponse.playerId
      };
      
      const generateResponse = await socketHelper.emitAndWait(
        hostClient,
        'generateInvitationCode',
        generateData,
        'invitationCodeGenerated'
      );
      
      // Join with second player
      const secondClient = socketHelper.createClient();
      await socketHelper.waitForConnection(secondClient);
      
      await socketHelper.emitAndWait(
        secondClient,
        'useInvitationCode',
        { code: generateResponse.code, playerName: 'Second Player' },
        'invitationCodeUsed'
      );
      
      // Try to join with third player
      const thirdClient = socketHelper.createClient();
      await socketHelper.waitForConnection(thirdClient);
      
      const response = await socketHelper.emitAndWait(
        thirdClient,
        'useInvitationCode',
        { code: generateResponse.code, playerName: 'Third Player' },
        'invitationCodeError'
      );
      
      expect(response.error).toContain('llena');
    });
  });

  describe('Invitation Management', () => {
    test('should get room invitations list', async () => {
      // Create room and generate multiple codes
      const hostClient = socketHelper.createClient();
      await socketHelper.waitForConnection(hostClient);
      
      const roomData = {
        roomId: 'manage-room',
        playerName: 'Host Player',
        maxPlayers: 4
      };
      
      const createResponse = await socketHelper.emitAndWait(
        hostClient,
        'createRoom',
        roomData,
        'roomCreated'
      );
      
      // Generate multiple codes
      const generateData1 = {
        roomId: roomData.roomId,
        playerId: createResponse.playerId,
        options: { maxUses: 3 }
      };
      
      const generateData2 = {
        roomId: roomData.roomId,
        playerId: createResponse.playerId,
        options: { maxUses: 5 }
      };
      
      await socketHelper.emitAndWait(
        hostClient,
        'generateInvitationCode',
        generateData1,
        'invitationCodeGenerated'
      );
      
      await socketHelper.emitAndWait(
        hostClient,
        'generateInvitationCode',
        generateData2,
        'invitationCodeGenerated'
      );
      
      // Get invitations list
      const response = await socketHelper.emitAndWait(
        hostClient,
        'getRoomInvitations',
        { roomId: roomData.roomId },
        'roomInvitationsList'
      );
      
      expect(response.roomId).toBe(roomData.roomId);
      expect(response.invitations).toBeDefined();
      expect(Array.isArray(response.invitations)).toBe(true);
      expect(response.invitations.length).toBe(2);
    });

    test('should deactivate invitation code', async () => {
      // Create room and generate code
      const hostClient = socketHelper.createClient();
      await socketHelper.waitForConnection(hostClient);
      
      const roomData = {
        roomId: 'deactivate-room',
        playerName: 'Host Player',
        maxPlayers: 4
      };
      
      const createResponse = await socketHelper.emitAndWait(
        hostClient,
        'createRoom',
        roomData,
        'roomCreated'
      );
      
      const generateData = {
        roomId: roomData.roomId,
        playerId: createResponse.playerId
      };
      
      const generateResponse = await socketHelper.emitAndWait(
        hostClient,
        'generateInvitationCode',
        generateData,
        'invitationCodeGenerated'
      );
      
      // Deactivate the code
      const deactivateData = {
        code: generateResponse.code,
        playerId: createResponse.playerId
      };
      
      const response = await socketHelper.emitAndWait(
        hostClient,
        'deactivateInvitationCode',
        deactivateData,
        'invitationCodeDeactivated'
      );
      
      expect(response.success).toBe(true);
      expect(response.code).toBe(generateResponse.code);
      
      // Try to use deactivated code
      const joinClient = socketHelper.createClient();
      await socketHelper.waitForConnection(joinClient);
      
      const useResponse = await socketHelper.emitAndWait(
        joinClient,
        'useInvitationCode',
        { code: generateResponse.code, playerName: 'Test Player' },
        'invitationCodeError'
      );
      
      expect(useResponse.error).toContain('no válido');
    });

    test('should reject deactivating code by non-host', async () => {
      // Create room and generate code
      const hostClient = socketHelper.createClient();
      await socketHelper.waitForConnection(hostClient);
      
      const roomData = {
        roomId: 'unauthorized-room',
        playerName: 'Host Player',
        maxPlayers: 4
      };
      
      const createResponse = await socketHelper.emitAndWait(
        hostClient,
        'createRoom',
        roomData,
        'roomCreated'
      );
      
      const generateData = {
        roomId: roomData.roomId,
        playerId: createResponse.playerId
      };
      
      const generateResponse = await socketHelper.emitAndWait(
        hostClient,
        'generateInvitationCode',
        generateData,
        'invitationCodeGenerated'
      );
      
      // Join with second player
      const joinClient = socketHelper.createClient();
      await socketHelper.waitForConnection(joinClient);
      
      const joinResponse = await socketHelper.emitAndWait(
        joinClient,
        'useInvitationCode',
        { code: generateResponse.code, playerName: 'Join Player' },
        'invitationCodeUsed'
      );
      
      // Try to deactivate as non-host
      const deactivateData = {
        code: generateResponse.code,
        playerId: joinResponse.playerId
      };
      
      const response = await socketHelper.emitAndWait(
        joinClient,
        'deactivateInvitationCode',
        deactivateData,
        'error'
      );
      
      expect(response.message).toContain('No tienes permisos');
    });
  });

  describe('Invitation System Edge Cases', () => {
    test('should handle concurrent invitation code usage', async () => {
      // Create room and generate code
      const hostClient = socketHelper.createClient();
      await socketHelper.waitForConnection(hostClient);
      
      const roomData = {
        roomId: 'concurrent-room',
        playerName: 'Host Player',
        maxPlayers: 6
      };
      
      const createResponse = await socketHelper.emitAndWait(
        hostClient,
        'createRoom',
        roomData,
        'roomCreated'
      );
      
      const generateData = {
        roomId: roomData.roomId,
        playerId: createResponse.playerId,
        options: { maxUses: 5 }
      };
      
      const generateResponse = await socketHelper.emitAndWait(
        hostClient,
        'generateInvitationCode',
        generateData,
        'invitationCodeGenerated'
      );
      
      // Use code simultaneously with multiple clients
      const clients = await socketHelper.createMultipleClients(3);
      
      const usePromises = clients.map((client, index) => 
        socketHelper.emitAndWait(
          client,
          'useInvitationCode',
          { code: generateResponse.code, playerName: `Player ${index + 1}` },
          'invitationCodeUsed'
        )
      );
      
      const results = await Promise.all(usePromises);
      
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.roomId).toBe(roomData.roomId);
        expect(result.playerId).toBeDefined();
      });
    });

    test('should handle invitation code for started game', async () => {
      // Create room and start game
      const hostClient = socketHelper.createClient();
      await socketHelper.waitForConnection(hostClient);
      
      const roomData = {
        roomId: 'started-game-room',
        playerName: 'Host Player',
        maxPlayers: 4
      };
      
      const createResponse = await socketHelper.emitAndWait(
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
        { roomId: roomData.roomId, playerName: 'Second Player' },
        'roomJoined'
      );
      
      // Set both ready and start game
      await socketHelper.emitAndWait(
        hostClient,
        'setPlayerReady',
        { roomId: roomData.roomId, playerId: 'host-id', isReady: true },
        'playerReadyUpdated'
      );
      
      await socketHelper.emitAndWait(
        secondClient,
        'setPlayerReady',
        { roomId: roomData.roomId, playerId: 'player-id', isReady: true },
        'playerReadyUpdated'
      );
      
      await socketHelper.emitAndWait(
        hostClient,
        'startGame',
        {},
        'gameStarted'
      );
      
      // Generate invitation code after game started
      const generateData = {
        roomId: roomData.roomId,
        playerId: createResponse.playerId
      };
      
      const generateResponse = await socketHelper.emitAndWait(
        hostClient,
        'generateInvitationCode',
        generateData,
        'invitationCodeGenerated'
      );
      
      // Try to use invitation code for started game
      const joinClient = socketHelper.createClient();
      await socketHelper.waitForConnection(joinClient);
      
      const response = await socketHelper.emitAndWait(
        joinClient,
        'useInvitationCode',
        { code: generateResponse.code, playerName: 'Late Player' },
        'invitationCodeError'
      );
      
      expect(response.error).toContain('ya ha comenzado');
    });
  });
});
