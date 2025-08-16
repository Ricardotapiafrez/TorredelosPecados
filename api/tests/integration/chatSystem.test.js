const SocketTestHelper = require('./helpers/socketTestHelper');

describe('Socket.io Chat System Integration', () => {
  let socketHelper;

  beforeEach(async () => {
    socketHelper = new SocketTestHelper();
    await socketHelper.startServer();
  });

  afterEach(async () => {
    await socketHelper.stopServer();
  });

  describe('Chat Room Management', () => {
    test('should create chat room successfully', async () => {
      const client = socketHelper.createClient();
      await socketHelper.waitForConnection(client);
      
      const createData = {
        roomId: 'test-chat-room',
        options: {
          name: 'Test Chat Room',
          type: 'lobby',
          maxUsers: 10,
          isPrivate: false
        }
      };
      
      const response = await socketHelper.emitAndWait(
        client,
        'createChatRoom',
        createData,
        'chatRoomCreated'
      );
      
      expect(response.chatRoom).toBeDefined();
      expect(response.chatRoom.id).toBe(createData.roomId);
      expect(response.chatRoom.name).toBe(createData.options.name);
      expect(response.chatRoom.type).toBe(createData.options.type);
      expect(response.chatRoom.maxUsers).toBe(createData.options.maxUsers);
    });

    test('should create chat room with default options', async () => {
      const client = socketHelper.createClient();
      await socketHelper.waitForConnection(client);
      
      const createData = {
        roomId: 'default-chat-room'
      };
      
      const response = await socketHelper.emitAndWait(
        client,
        'createChatRoom',
        createData,
        'chatRoomCreated'
      );
      
      expect(response.chatRoom).toBeDefined();
      expect(response.chatRoom.id).toBe(createData.roomId);
      expect(response.chatRoom.name).toBe(`Chat de ${createData.roomId}`);
      expect(response.chatRoom.type).toBe('lobby');
      expect(response.chatRoom.maxUsers).toBe(50);
    });

    test('should join chat room successfully', async () => {
      // Create chat room first
      const hostClient = socketHelper.createClient();
      await socketHelper.waitForConnection(hostClient);
      
      const createData = {
        roomId: 'join-chat-room',
        options: { name: 'Join Test Room' }
      };
      
      await socketHelper.emitAndWait(
        hostClient,
        'createChatRoom',
        createData,
        'chatRoomCreated'
      );
      
      // Join chat room
      const joinClient = socketHelper.createClient();
      await socketHelper.waitForConnection(joinClient);
      
      const joinData = {
        roomId: createData.roomId,
        userId: 'user1',
        userInfo: { name: 'Test User' }
      };
      
      const response = await socketHelper.emitAndWait(
        joinClient,
        'joinChatRoom',
        joinData,
        'chatRoomJoined'
      );
      
      expect(response.success).toBe(true);
      expect(response.roomId).toBe(createData.roomId);
      expect(response.userId).toBe(joinData.userId);
    });

    test('should notify other users when someone joins chat room', async () => {
      // Create chat room
      const hostClient = socketHelper.createClient();
      await socketHelper.waitForConnection(hostClient);
      
      const createData = {
        roomId: 'notify-chat-room',
        options: { name: 'Notify Test Room' }
      };
      
      await socketHelper.emitAndWait(
        hostClient,
        'createChatRoom',
        createData,
        'chatRoomCreated'
      );
      
      // Join as first user
      const firstClient = socketHelper.createClient();
      await socketHelper.waitForConnection(firstClient);
      
      await socketHelper.emitAndWait(
        firstClient,
        'joinChatRoom',
        {
          roomId: createData.roomId,
          userId: 'user1',
          userInfo: { name: 'First User' }
        },
        'chatRoomJoined'
      );
      
      // First user listens for new user joining
      const userJoinedPromise = socketHelper.waitForEvent(
        firstClient,
        'userJoinedChat',
        5000
      );
      
      // Join as second user
      const secondClient = socketHelper.createClient();
      await socketHelper.waitForConnection(secondClient);
      
      await socketHelper.emitAndWait(
        secondClient,
        'joinChatRoom',
        {
          roomId: createData.roomId,
          userId: 'user2',
          userInfo: { name: 'Second User' }
        },
        'chatRoomJoined'
      );
      
      // Check if first user received notification
      const notification = await userJoinedPromise;
      expect(notification.userId).toBe('user2');
      expect(notification.userInfo.name).toBe('Second User');
      expect(notification.timestamp).toBeDefined();
    });

    test('should leave chat room successfully', async () => {
      // Create and join chat room
      const hostClient = socketHelper.createClient();
      await socketHelper.waitForConnection(hostClient);
      
      const createData = {
        roomId: 'leave-chat-room',
        options: { name: 'Leave Test Room' }
      };
      
      await socketHelper.emitAndWait(
        hostClient,
        'createChatRoom',
        createData,
        'chatRoomCreated'
      );
      
      await socketHelper.emitAndWait(
        hostClient,
        'joinChatRoom',
        {
          roomId: createData.roomId,
          userId: 'user1',
          userInfo: { name: 'Test User' }
        },
        'chatRoomJoined'
      );
      
      // Leave chat room
      const leaveData = {
        roomId: createData.roomId,
        userId: 'user1'
      };
      
      const response = await socketHelper.emitAndWait(
        hostClient,
        'leaveChatRoom',
        leaveData,
        'chatRoomLeft'
      );
      
      expect(response.success).toBe(true);
      expect(response.roomId).toBe(createData.roomId);
      expect(response.userId).toBe(leaveData.userId);
    });

    test('should reject joining full chat room', async () => {
      // Create chat room with max 1 user
      const hostClient = socketHelper.createClient();
      await socketHelper.waitForConnection(hostClient);
      
      const createData = {
        roomId: 'full-chat-room',
        options: { name: 'Full Test Room', maxUsers: 1 }
      };
      
      await socketHelper.emitAndWait(
        hostClient,
        'createChatRoom',
        createData,
        'chatRoomCreated'
      );
      
      // Join as first user
      const firstClient = socketHelper.createClient();
      await socketHelper.waitForConnection(firstClient);
      
      await socketHelper.emitAndWait(
        firstClient,
        'joinChatRoom',
        {
          roomId: createData.roomId,
          userId: 'user1',
          userInfo: { name: 'First User' }
        },
        'chatRoomJoined'
      );
      
      // Try to join as second user
      const secondClient = socketHelper.createClient();
      await socketHelper.waitForConnection(secondClient);
      
      const response = await socketHelper.emitAndWait(
        secondClient,
        'joinChatRoom',
        {
          roomId: createData.roomId,
          userId: 'user2',
          userInfo: { name: 'Second User' }
        },
        'error'
      );
      
      expect(response.message).toContain('llena');
    });
  });

  describe('Chat Messages', () => {
    let hostClient, chatRoomId;

    beforeEach(async () => {
      // Setup chat room
      hostClient = socketHelper.createClient();
      await socketHelper.waitForConnection(hostClient);
      
      const createData = {
        roomId: 'message-chat-room',
        options: { name: 'Message Test Room' }
      };
      
      await socketHelper.emitAndWait(
        hostClient,
        'createChatRoom',
        createData,
        'chatRoomCreated'
      );
      
      chatRoomId = createData.roomId;
      
      await socketHelper.emitAndWait(
        hostClient,
        'joinChatRoom',
        {
          roomId: chatRoomId,
          userId: 'user1',
          userInfo: { name: 'Host User' }
        },
        'chatRoomJoined'
      );
    });

    test('should send text message successfully', async () => {
      const messageData = {
        roomId: chatRoomId,
        userId: 'user1',
        messageData: {
          content: 'Hello, world!',
          type: 'text'
        }
      };
      
      const response = await socketHelper.emitAndWait(
        hostClient,
        'sendChatMessage',
        messageData,
        'chatMessageSent'
      );
      
      expect(response.message).toBeDefined();
      expect(response.message.content).toBe('Hello, world!');
      expect(response.message.type).toBe('text');
      expect(response.message.userId).toBe('user1');
      expect(response.message.timestamp).toBeDefined();
    });

    test('should broadcast message to other users in room', async () => {
      // Join second user
      const secondClient = socketHelper.createClient();
      await socketHelper.waitForConnection(secondClient);
      
      await socketHelper.emitAndWait(
        secondClient,
        'joinChatRoom',
        {
          roomId: chatRoomId,
          userId: 'user2',
          userInfo: { name: 'Second User' }
        },
        'chatRoomJoined'
      );
      
      // Second user listens for messages
      const messageReceivedPromise = socketHelper.waitForEvent(
        secondClient,
        'chatMessageReceived',
        5000
      );
      
      // Send message from first user
      const messageData = {
        roomId: chatRoomId,
        userId: 'user1',
        messageData: {
          content: 'Broadcast test message',
          type: 'text'
        }
      };
      
      await socketHelper.emitAndWait(
        hostClient,
        'sendChatMessage',
        messageData,
        'chatMessageSent'
      );
      
      // Check if second user received the message
      const receivedMessage = await messageReceivedPromise;
      expect(receivedMessage.message.content).toBe('Broadcast test message');
      expect(receivedMessage.message.userId).toBe('user1');
    });

    test('should send emote message successfully', async () => {
      const messageData = {
        roomId: chatRoomId,
        userId: 'user1',
        messageData: {
          content: '/me waves hello',
          type: 'emote'
        }
      };
      
      const response = await socketHelper.emitAndWait(
        hostClient,
        'sendChatMessage',
        messageData,
        'chatMessageSent'
      );
      
      expect(response.message).toBeDefined();
      expect(response.message.content).toBe('/me waves hello');
      expect(response.message.type).toBe('emote');
    });

    test('should reject invalid emote format', async () => {
      const messageData = {
        roomId: chatRoomId,
        userId: 'user1',
        messageData: {
          content: 'This is not an emote',
          type: 'emote'
        }
      };
      
      const response = await socketHelper.emitAndWait(
        hostClient,
        'sendChatMessage',
        messageData,
        'error'
      );
      
      expect(response.message).toContain('emotes deben comenzar con /me ');
    });

    test('should reject empty message', async () => {
      const messageData = {
        roomId: chatRoomId,
        userId: 'user1',
        messageData: {
          content: '',
          type: 'text'
        }
      };
      
      const response = await socketHelper.emitAndWait(
        hostClient,
        'sendChatMessage',
        messageData,
        'error'
      );
      
      expect(response.message).toContain('no puede estar vacío');
    });

    test('should reject message too long', async () => {
      const longMessage = 'A'.repeat(501); // Exceeds 500 character limit
      
      const messageData = {
        roomId: chatRoomId,
        userId: 'user1',
        messageData: {
          content: longMessage,
          type: 'text'
        }
      };
      
      const response = await socketHelper.emitAndWait(
        hostClient,
        'sendChatMessage',
        messageData,
        'error'
      );
      
      expect(response.message).toContain('no puede exceder 500 caracteres');
    });

    test('should enforce slow mode', async () => {
      // Update room settings to enable slow mode
      const settingsData = {
        roomId: chatRoomId,
        settings: {
          slowMode: true,
          slowModeInterval: 1000
        },
        userId: 'user1'
      };
      
      await socketHelper.emitAndWait(
        hostClient,
        'updateChatRoomSettings',
        settingsData,
        'chatRoomSettingsUpdated'
      );
      
      // Send first message
      const firstMessageData = {
        roomId: chatRoomId,
        userId: 'user1',
        messageData: {
          content: 'First message',
          type: 'text'
        }
      };
      
      await socketHelper.emitAndWait(
        hostClient,
        'sendChatMessage',
        firstMessageData,
        'chatMessageSent'
      );
      
      // Try to send second message immediately
      const secondMessageData = {
        roomId: chatRoomId,
        userId: 'user1',
        messageData: {
          content: 'Second message',
          type: 'text'
        }
      };
      
      const response = await socketHelper.emitAndWait(
        hostClient,
        'sendChatMessage',
        secondMessageData,
        'error'
      );
      
      expect(response.message).toContain('Modo lento activado');
    });
  });

  describe('Message Management', () => {
    let hostClient, chatRoomId, messageId;

    beforeEach(async () => {
      // Setup chat room and send a message
      hostClient = socketHelper.createClient();
      await socketHelper.waitForConnection(hostClient);
      
      const createData = {
        roomId: 'manage-chat-room',
        options: { name: 'Manage Test Room' }
      };
      
      await socketHelper.emitAndWait(
        hostClient,
        'createChatRoom',
        createData,
        'chatRoomCreated'
      );
      
      chatRoomId = createData.roomId;
      
      await socketHelper.emitAndWait(
        hostClient,
        'joinChatRoom',
        {
          roomId: chatRoomId,
          userId: 'user1',
          userInfo: { name: 'Host User' }
        },
        'chatRoomJoined'
      );
      
      // Send a message to get messageId
      const messageData = {
        roomId: chatRoomId,
        userId: 'user1',
        messageData: {
          content: 'Test message for management',
          type: 'text'
        }
      };
      
      const response = await socketHelper.emitAndWait(
        hostClient,
        'sendChatMessage',
        messageData,
        'chatMessageSent'
      );
      
      messageId = response.message.id;
    });

    test('should get chat messages list', async () => {
      const getData = {
        roomId: chatRoomId,
        options: { limit: 10 }
      };
      
      const response = await socketHelper.emitAndWait(
        hostClient,
        'getChatMessages',
        getData,
        'chatMessagesList'
      );
      
      expect(response.roomId).toBe(chatRoomId);
      expect(response.messages).toBeDefined();
      expect(Array.isArray(response.messages)).toBe(true);
      expect(response.messages.length).toBeGreaterThan(0);
    });

    test('should edit own message successfully', async () => {
      const editData = {
        roomId: chatRoomId,
        messageId: messageId,
        userId: 'user1',
        newContent: 'Edited message content'
      };
      
      const response = await socketHelper.emitAndWait(
        hostClient,
        'editChatMessage',
        editData,
        'chatMessageEdited'
      );
      
      expect(response.message).toBeDefined();
      expect(response.message.content).toBe('Edited message content');
      expect(response.message.edited).toBe(true);
    });

    test('should reject editing other user message', async () => {
      // Join second user
      const secondClient = socketHelper.createClient();
      await socketHelper.waitForConnection(secondClient);
      
      await socketHelper.emitAndWait(
        secondClient,
        'joinChatRoom',
        {
          roomId: chatRoomId,
          userId: 'user2',
          userInfo: { name: 'Second User' }
        },
        'chatRoomJoined'
      );
      
      // Try to edit message as second user
      const editData = {
        roomId: chatRoomId,
        messageId: messageId,
        userId: 'user2',
        newContent: 'Unauthorized edit'
      };
      
      const response = await socketHelper.emitAndWait(
        secondClient,
        'editChatMessage',
        editData,
        'error'
      );
      
      expect(response.message).toContain('No puedes editar mensajes de otros usuarios');
    });

    test('should delete own message successfully', async () => {
      const deleteData = {
        roomId: chatRoomId,
        messageId: messageId,
        userId: 'user1'
      };
      
      const response = await socketHelper.emitAndWait(
        hostClient,
        'deleteChatMessage',
        deleteData,
        'chatMessageDeleted'
      );
      
      expect(response.messageId).toBe(messageId);
      expect(response.deletedBy).toBe('user1');
    });

    test('should allow moderator to delete any message', async () => {
      // Join second user as moderator
      const secondClient = socketHelper.createClient();
      await socketHelper.waitForConnection(secondClient);
      
      await socketHelper.emitAndWait(
        secondClient,
        'joinChatRoom',
        {
          roomId: chatRoomId,
          userId: 'user2',
          userInfo: { name: 'Moderator User' }
        },
        'chatRoomJoined'
      );
      
      // Delete message as moderator
      const deleteData = {
        roomId: chatRoomId,
        messageId: messageId,
        userId: 'user2',
        isModerator: true
      };
      
      const response = await socketHelper.emitAndWait(
        secondClient,
        'deleteChatMessage',
        deleteData,
        'chatMessageDeleted'
      );
      
      expect(response.messageId).toBe(messageId);
      expect(response.deletedBy).toBe('user2');
    });

    test('should reject deleting other user message', async () => {
      // Join second user
      const secondClient = socketHelper.createClient();
      await socketHelper.waitForConnection(secondClient);
      
      await socketHelper.emitAndWait(
        secondClient,
        'joinChatRoom',
        {
          roomId: chatRoomId,
          userId: 'user2',
          userInfo: { name: 'Second User' }
        },
        'chatRoomJoined'
      );
      
      // Try to delete message as second user
      const deleteData = {
        roomId: chatRoomId,
        messageId: messageId,
        userId: 'user2'
      };
      
      const response = await socketHelper.emitAndWait(
        secondClient,
        'deleteChatMessage',
        deleteData,
        'error'
      );
      
      expect(response.message).toContain('No puedes eliminar mensajes de otros usuarios');
    });
  });

  describe('Chat Room Users and Search', () => {
    let hostClient, chatRoomId;

    beforeEach(async () => {
      // Setup chat room
      hostClient = socketHelper.createClient();
      await socketHelper.waitForConnection(hostClient);
      
      const createData = {
        roomId: 'users-chat-room',
        options: { name: 'Users Test Room' }
      };
      
      await socketHelper.emitAndWait(
        hostClient,
        'createChatRoom',
        createData,
        'chatRoomCreated'
      );
      
      chatRoomId = createData.roomId;
      
      await socketHelper.emitAndWait(
        hostClient,
        'joinChatRoom',
        {
          roomId: chatRoomId,
          userId: 'user1',
          userInfo: { name: 'Host User' }
        },
        'chatRoomJoined'
      );
    });

    test('should get chat room users list', async () => {
      // Join second user
      const secondClient = socketHelper.createClient();
      await socketHelper.waitForConnection(secondClient);
      
      await socketHelper.emitAndWait(
        secondClient,
        'joinChatRoom',
        {
          roomId: chatRoomId,
          userId: 'user2',
          userInfo: { name: 'Second User' }
        },
        'chatRoomJoined'
      );
      
      // Get users list
      const getData = {
        roomId: chatRoomId
      };
      
      const response = await socketHelper.emitAndWait(
        hostClient,
        'getChatRoomUsers',
        getData,
        'chatRoomUsersList'
      );
      
      expect(response.roomId).toBe(chatRoomId);
      expect(response.users).toBeDefined();
      expect(Array.isArray(response.users)).toBe(true);
      expect(response.users.length).toBe(2);
    });

    test('should search chat messages', async () => {
      // Send some test messages
      const messages = [
        'Hello world',
        'This is a test message',
        'Another message with test content',
        'Final message'
      ];
      
      for (const content of messages) {
        const messageData = {
          roomId: chatRoomId,
          userId: 'user1',
          messageData: {
            content,
            type: 'text'
          }
        };
        
        await socketHelper.emitAndWait(
          hostClient,
          'sendChatMessage',
          messageData,
          'chatMessageSent'
        );
      }
      
      // Search for messages containing "test"
      const searchData = {
        roomId: chatRoomId,
        query: 'test',
        options: { limit: 10 }
      };
      
      const response = await socketHelper.emitAndWait(
        hostClient,
        'searchChatMessages',
        searchData,
        'chatMessagesSearchResult'
      );
      
      expect(response.roomId).toBe(chatRoomId);
      expect(response.query).toBe('test');
      expect(response.results).toBeDefined();
      expect(Array.isArray(response.results)).toBe(true);
      expect(response.results.length).toBeGreaterThan(0);
      
      // Check that results contain "test"
      response.results.forEach(result => {
        expect(result.content.toLowerCase()).toContain('test');
      });
    });

    test('should search messages case insensitive by default', async () => {
      // Send message with mixed case
      const messageData = {
        roomId: chatRoomId,
        userId: 'user1',
        messageData: {
          content: 'Hello WORLD test message',
          type: 'text'
        }
      };
      
      await socketHelper.emitAndWait(
        hostClient,
        'sendChatMessage',
        messageData,
        'chatMessageSent'
      );
      
      // Search with lowercase
      const searchData = {
        roomId: chatRoomId,
        query: 'world',
        options: { caseSensitive: false }
      };
      
      const response = await socketHelper.emitAndWait(
        hostClient,
        'searchChatMessages',
        searchData,
        'chatMessagesSearchResult'
      );
      
      expect(response.results.length).toBeGreaterThan(0);
    });
  });

  describe('Chat Room Settings', () => {
    let hostClient, chatRoomId;

    beforeEach(async () => {
      // Setup chat room
      hostClient = socketHelper.createClient();
      await socketHelper.waitForConnection(hostClient);
      
      const createData = {
        roomId: 'settings-chat-room',
        options: { 
          name: 'Settings Test Room',
          createdBy: 'user1'
        }
      };
      
      await socketHelper.emitAndWait(
        hostClient,
        'createChatRoom',
        createData,
        'chatRoomCreated'
      );
      
      chatRoomId = createData.roomId;
      
      await socketHelper.emitAndWait(
        hostClient,
        'joinChatRoom',
        {
          roomId: chatRoomId,
          userId: 'user1',
          userInfo: { name: 'Host User' }
        },
        'chatRoomJoined'
      );
    });

    test('should update chat room settings', async () => {
      const settingsData = {
        roomId: chatRoomId,
        settings: {
          slowMode: true,
          slowModeInterval: 5000,
          allowEmojis: false,
          allowLinks: true
        },
        userId: 'user1'
      };
      
      const response = await socketHelper.emitAndWait(
        hostClient,
        'updateChatRoomSettings',
        settingsData,
        'chatRoomSettingsUpdated'
      );
      
      expect(response.settings).toBeDefined();
      expect(response.settings.slowMode).toBe(true);
      expect(response.settings.slowModeInterval).toBe(5000);
      expect(response.settings.allowEmojis).toBe(false);
      expect(response.settings.allowLinks).toBe(true);
    });

    test('should reject updating settings by non-moderator', async () => {
      // Join second user
      const secondClient = socketHelper.createClient();
      await socketHelper.waitForConnection(secondClient);
      
      await socketHelper.emitAndWait(
        secondClient,
        'joinChatRoom',
        {
          roomId: chatRoomId,
          userId: 'user2',
          userInfo: { name: 'Second User' }
        },
        'chatRoomJoined'
      );
      
      // Try to update settings as non-moderator
      const settingsData = {
        roomId: chatRoomId,
        settings: { slowMode: true },
        userId: 'user2'
      };
      
      const response = await socketHelper.emitAndWait(
        secondClient,
        'updateChatRoomSettings',
        settingsData,
        'error'
      );
      
      expect(response.message).toContain('No tienes permisos');
    });

    test('should get chat statistics', async () => {
      const response = await socketHelper.emitAndWait(
        hostClient,
        'getChatStats',
        {},
        'chatStats'
      );
      
      expect(response.stats).toBeDefined();
      expect(response.stats.totalRooms).toBeGreaterThan(0);
      expect(response.stats.totalUsers).toBeGreaterThan(0);
      expect(response.stats.totalMessages).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Chat System Edge Cases', () => {
    test('should handle concurrent message sending', async () => {
      // Create chat room
      const hostClient = socketHelper.createClient();
      await socketHelper.waitForConnection(hostClient);
      
      const createData = {
        roomId: 'concurrent-chat-room',
        options: { name: 'Concurrent Test Room' }
      };
      
      await socketHelper.emitAndWait(
        hostClient,
        'createChatRoom',
        createData,
        'chatRoomCreated'
      );
      
      // Join multiple users
      const clients = await socketHelper.createMultipleClients(3);
      
      for (let i = 0; i < clients.length; i++) {
        await socketHelper.emitAndWait(
          clients[i],
          'joinChatRoom',
          {
            roomId: createData.roomId,
            userId: `user${i + 1}`,
            userInfo: { name: `User ${i + 1}` }
          },
          'chatRoomJoined'
        );
      }
      
      // Send messages simultaneously
      const messagePromises = clients.map((client, index) => 
        socketHelper.emitAndWait(
          client,
          'sendChatMessage',
          {
            roomId: createData.roomId,
            userId: `user${index + 1}`,
            messageData: {
              content: `Message from user ${index + 1}`,
              type: 'text'
            }
          },
          'chatMessageSent'
        )
      );
      
      const results = await Promise.all(messagePromises);
      
      expect(results).toHaveLength(3);
      results.forEach((result, index) => {
        expect(result.message.content).toBe(`Message from user ${index + 1}`);
        expect(result.message.userId).toBe(`user${index + 1}`);
      });
    });

    test('should handle message history limit', async () => {
      // Create chat room
      const hostClient = socketHelper.createClient();
      await socketHelper.waitForConnection(hostClient);
      
      const createData = {
        roomId: 'history-chat-room',
        options: { name: 'History Test Room' }
      };
      
      await socketHelper.emitAndWait(
        hostClient,
        'createChatRoom',
        createData,
        'chatRoomCreated'
      );
      
      await socketHelper.emitAndWait(
        hostClient,
        'joinChatRoom',
        {
          roomId: createData.roomId,
          userId: 'user1',
          userInfo: { name: 'Test User' }
        },
        'chatRoomJoined'
      );
      
      // Send more messages than the limit (100)
      const messagePromises = [];
      for (let i = 0; i < 110; i++) {
        messagePromises.push(
          socketHelper.emitAndWait(
            hostClient,
            'sendChatMessage',
            {
              roomId: createData.roomId,
              userId: 'user1',
              messageData: {
                content: `Message ${i}`,
                type: 'text'
              }
            },
            'chatMessageSent'
          )
        );
      }
      
      await Promise.all(messagePromises);
      
      // Get messages and check limit
      const getData = {
        roomId: createData.roomId,
        options: { limit: 200 }
      };
      
      const response = await socketHelper.emitAndWait(
        hostClient,
        'getChatMessages',
        getData,
        'chatMessagesList'
      );
      
      expect(response.messages.length).toBeLessThanOrEqual(100);
    });

    test('should handle user disconnection gracefully', async () => {
      // Create chat room
      const hostClient = socketHelper.createClient();
      await socketHelper.waitForConnection(hostClient);
      
      const createData = {
        roomId: 'disconnect-chat-room',
        options: { name: 'Disconnect Test Room' }
      };
      
      await socketHelper.emitAndWait(
        hostClient,
        'createChatRoom',
        createData,
        'chatRoomCreated'
      );
      
      await socketHelper.emitAndWait(
        hostClient,
        'joinChatRoom',
        {
          roomId: createData.roomId,
          userId: 'user1',
          userInfo: { name: 'Test User' }
        },
        'chatRoomJoined'
      );
      
      // Send a message
      await socketHelper.emitAndWait(
        hostClient,
        'sendChatMessage',
        {
          roomId: createData.roomId,
          userId: 'user1',
          messageData: {
            content: 'Test message before disconnect',
            type: 'text'
          }
        },
        'chatMessageSent'
      );
      
      // Disconnect client
      hostClient.disconnect();
      await socketHelper.wait(100);
      
      // Verify client is disconnected
      expect(socketHelper.isClientConnected(hostClient)).toBe(false);
    });
  });
});
