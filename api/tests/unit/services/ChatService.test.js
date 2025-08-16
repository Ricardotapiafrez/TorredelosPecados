const ChatService = require('../../src/services/ChatService');

describe('ChatService', () => {
  let chatService;

  beforeEach(() => {
    chatService = new ChatService();
  });

  describe('Constructor', () => {
    test('should initialize with default values', () => {
      expect(chatService.chatRooms).toBeInstanceOf(Map);
      expect(chatService.userChats).toBeInstanceOf(Map);
      expect(chatService.messageHistory).toBeInstanceOf(Map);
      expect(chatService.maxMessagesPerRoom).toBe(100);
      expect(chatService.maxMessageLength).toBe(500);
    });
  });

  describe('createChatRoom', () => {
    test('should create a chat room with default options', () => {
      const chatRoom = chatService.createChatRoom('room1');
      
      expect(chatRoom.id).toBe('room1');
      expect(chatRoom.name).toBe('Chat de room1');
      expect(chatRoom.type).toBe('lobby');
      expect(chatRoom.maxUsers).toBe(50);
      expect(chatRoom.isPrivate).toBe(false);
      expect(chatRoom.users).toBeInstanceOf(Set);
      expect(chatRoom.moderators).toBeInstanceOf(Set);
      expect(chatRoom.createdAt).toBeInstanceOf(Date);
      expect(chatRoom.lastActivity).toBeInstanceOf(Date);
    });

    test('should create a chat room with custom options', () => {
      const options = {
        name: 'Custom Room',
        type: 'game',
        maxUsers: 10,
        isPrivate: true,
        createdBy: 'user1'
      };
      
      const chatRoom = chatService.createChatRoom('room1', options);
      
      expect(chatRoom.name).toBe('Custom Room');
      expect(chatRoom.type).toBe('game');
      expect(chatRoom.maxUsers).toBe(10);
      expect(chatRoom.isPrivate).toBe(true);
      expect(chatRoom.moderators.has('user1')).toBe(true);
    });

    test('should add creator as moderator if specified', () => {
      const chatRoom = chatService.createChatRoom('room1', { createdBy: 'user1' });
      
      expect(chatRoom.moderators.has('user1')).toBe(true);
    });
  });

  describe('joinChatRoom', () => {
    let chatRoom;

    beforeEach(() => {
      chatRoom = chatService.createChatRoom('room1');
    });

    test('should join user to chat room', () => {
      const result = chatService.joinChatRoom('room1', 'user1', { name: 'User 1' });
      
      expect(result.success).toBe(true);
      expect(chatRoom.users.has('user1')).toBe(true);
      expect(chatService.userChats.get('user1')).toContain('room1');
    });

    test('should reject if room not found', () => {
      expect(() => {
        chatService.joinChatRoom('nonexistent', 'user1');
      }).toThrow('Sala de chat no encontrada');
    });

    test('should reject if room is full', () => {
      chatRoom.maxUsers = 1;
      chatService.joinChatRoom('room1', 'user1');
      
      expect(() => {
        chatService.joinChatRoom('room1', 'user2');
      }).toThrow('La sala de chat está llena');
    });

    test('should update last activity', () => {
      const originalActivity = chatRoom.lastActivity;
      
      // Wait a bit to ensure time difference
      setTimeout(() => {
        chatService.joinChatRoom('room1', 'user1');
        expect(chatRoom.lastActivity.getTime()).toBeGreaterThan(originalActivity.getTime());
      }, 10);
    });
  });

  describe('leaveChatRoom', () => {
    let chatRoom;

    beforeEach(() => {
      chatRoom = chatService.createChatRoom('room1');
      chatService.joinChatRoom('room1', 'user1');
    });

    test('should remove user from chat room', () => {
      const result = chatService.leaveChatRoom('room1', 'user1');
      
      expect(result.success).toBe(true);
      expect(chatRoom.users.has('user1')).toBe(false);
      expect(chatService.userChats.has('user1')).toBe(false);
    });

    test('should reject if room not found', () => {
      expect(() => {
        chatService.leaveChatRoom('nonexistent', 'user1');
      }).toThrow('Sala de chat no encontrada');
    });

    test('should clean up user chats when empty', () => {
      chatService.joinChatRoom('room1', 'user1');
      chatService.leaveChatRoom('room1', 'user1');
      
      expect(chatService.userChats.has('user1')).toBe(false);
    });
  });

  describe('sendMessage', () => {
    let chatRoom;

    beforeEach(() => {
      chatRoom = chatService.createChatRoom('room1');
      chatService.joinChatRoom('room1', 'user1');
    });

    test('should send a valid message', () => {
      const messageData = {
        content: 'Hello, world!',
        type: 'text'
      };
      
      const result = chatService.sendMessage('room1', 'user1', messageData);
      
      expect(result.success).toBe(true);
      expect(result.message.content).toBe('Hello, world!');
      expect(result.message.type).toBe('text');
      expect(result.message.userId).toBe('user1');
      expect(result.message.timestamp).toBeInstanceOf(Date);
    });

    test('should reject if room not found', () => {
      expect(() => {
        chatService.sendMessage('nonexistent', 'user1', { content: 'test' });
      }).toThrow('Sala de chat no encontrada');
    });

    test('should reject if user not in room', () => {
      expect(() => {
        chatService.sendMessage('room1', 'user2', { content: 'test' });
      }).toThrow('No estás en esta sala de chat');
    });

    test('should reject empty message', () => {
      expect(() => {
        chatService.sendMessage('room1', 'user1', { content: '' });
      }).toThrow('El mensaje no puede estar vacío');
    });

    test('should reject message too long', () => {
      const longMessage = 'A'.repeat(chatService.maxMessageLength + 1);
      
      expect(() => {
        chatService.sendMessage('room1', 'user1', { content: longMessage });
      }).toThrow(`El mensaje no puede exceder ${chatService.maxMessageLength} caracteres`);
    });

    test('should validate emote format', () => {
      expect(() => {
        chatService.sendMessage('room1', 'user1', { 
          content: 'This is not an emote', 
          type: 'emote' 
        });
      }).toThrow('Los emotes deben comenzar con /me ');
    });

    test('should allow valid emote', () => {
      const result = chatService.sendMessage('room1', 'user1', {
        content: '/me waves hello',
        type: 'emote'
      });
      
      expect(result.success).toBe(true);
      expect(result.message.content).toBe('/me waves hello');
    });

    test('should enforce slow mode', () => {
      chatRoom.settings.slowMode = true;
      chatRoom.settings.slowModeInterval = 1000;
      
      // Send first message
      chatService.sendMessage('room1', 'user1', { content: 'First message' });
      
      // Try to send second message immediately
      expect(() => {
        chatService.sendMessage('room1', 'user1', { content: 'Second message' });
      }).toThrow('Modo lento activado');
    });

    test('should limit message history', () => {
      // Send more messages than the limit
      for (let i = 0; i < chatService.maxMessagesPerRoom + 10; i++) {
        chatService.sendMessage('room1', 'user1', { content: `Message ${i}` });
      }
      
      const messages = chatService.getMessages('room1');
      expect(messages).toHaveLength(chatService.maxMessagesPerRoom);
    });
  });

  describe('getMessages', () => {
    let chatRoom;

    beforeEach(() => {
      chatRoom = chatService.createChatRoom('room1');
      chatService.joinChatRoom('room1', 'user1');
      
      // Send some test messages
      for (let i = 0; i < 10; i++) {
        chatService.sendMessage('room1', 'user1', { content: `Message ${i}` });
      }
    });

    test('should return messages with default options', () => {
      const messages = chatService.getMessages('room1');
      
      expect(messages).toHaveLength(10);
      expect(messages[0].content).toBe('Message 0');
      expect(messages[9].content).toBe('Message 9');
    });

    test('should respect limit option', () => {
      const messages = chatService.getMessages('room1', { limit: 5 });
      
      expect(messages).toHaveLength(5);
    });

    test('should filter by before timestamp', () => {
      const middleMessage = chatService.getMessages('room1')[5];
      const messages = chatService.getMessages('room1', { before: middleMessage.timestamp });
      
      expect(messages.length).toBeLessThan(10);
    });

    test('should filter by after timestamp', () => {
      const middleMessage = chatService.getMessages('room1')[5];
      const messages = chatService.getMessages('room1', { after: middleMessage.timestamp });
      
      expect(messages.length).toBeLessThan(10);
    });

    test('should return empty array for non-existent room', () => {
      const messages = chatService.getMessages('nonexistent');
      expect(messages).toEqual([]);
    });
  });

  describe('editMessage', () => {
    let chatRoom, messageId;

    beforeEach(() => {
      chatRoom = chatService.createChatRoom('room1');
      chatService.joinChatRoom('room1', 'user1');
      
      const result = chatService.sendMessage('room1', 'user1', { content: 'Original message' });
      messageId = result.message.id;
    });

    test('should edit own message', () => {
      const result = chatService.editMessage('room1', messageId, 'user1', 'Edited message');
      
      expect(result.success).toBe(true);
      expect(result.message.content).toBe('Edited message');
      expect(result.message.edited).toBe(true);
    });

    test('should reject editing other user message', () => {
      chatService.joinChatRoom('room1', 'user2');
      
      expect(() => {
        chatService.editMessage('room1', messageId, 'user2', 'Edited message');
      }).toThrow('No puedes editar mensajes de otros usuarios');
    });

    test('should reject editing non-existent message', () => {
      expect(() => {
        chatService.editMessage('room1', 'nonexistent', 'user1', 'Edited message');
      }).toThrow('Mensaje no encontrado');
    });

    test('should validate new content', () => {
      expect(() => {
        chatService.editMessage('room1', messageId, 'user1', '');
      }).toThrow('El mensaje no puede estar vacío');
    });
  });

  describe('deleteMessage', () => {
    let chatRoom, messageId;

    beforeEach(() => {
      chatRoom = chatService.createChatRoom('room1');
      chatService.joinChatRoom('room1', 'user1');
      
      const result = chatService.sendMessage('room1', 'user1', { content: 'Test message' });
      messageId = result.message.id;
    });

    test('should delete own message', () => {
      const result = chatService.deleteMessage('room1', messageId, 'user1');
      
      expect(result.success).toBe(true);
      
      const messages = chatService.getMessages('room1');
      const deletedMessage = messages.find(m => m.id === messageId);
      expect(deletedMessage.deleted).toBe(true);
      expect(deletedMessage.content).toBe('[Mensaje eliminado]');
    });

    test('should allow moderator to delete any message', () => {
      chatRoom.moderators.add('moderator');
      chatService.joinChatRoom('room1', 'moderator');
      
      const result = chatService.deleteMessage('room1', messageId, 'moderator', true);
      
      expect(result.success).toBe(true);
    });

    test('should reject deleting other user message', () => {
      chatService.joinChatRoom('room1', 'user2');
      
      expect(() => {
        chatService.deleteMessage('room1', messageId, 'user2');
      }).toThrow('No puedes eliminar mensajes de otros usuarios');
    });
  });

  describe('getRoomUsers', () => {
    let chatRoom;

    beforeEach(() => {
      chatRoom = chatService.createChatRoom('room1');
      chatService.joinChatRoom('room1', 'user1');
      chatService.joinChatRoom('room1', 'user2');
      chatRoom.moderators.add('user1');
    });

    test('should return all users in room', () => {
      const users = chatService.getRoomUsers('room1');
      
      expect(users).toHaveLength(2);
      expect(users.find(u => u.userId === 'user1').isModerator).toBe(true);
      expect(users.find(u => u.userId === 'user2').isModerator).toBe(false);
    });

    test('should return empty array for non-existent room', () => {
      const users = chatService.getRoomUsers('nonexistent');
      expect(users).toEqual([]);
    });
  });

  describe('searchMessages', () => {
    let chatRoom;

    beforeEach(() => {
      chatRoom = chatService.createChatRoom('room1');
      chatService.joinChatRoom('room1', 'user1');
      
      chatService.sendMessage('room1', 'user1', { content: 'Hello world' });
      chatService.sendMessage('room1', 'user1', { content: 'Goodbye world' });
      chatService.sendMessage('room1', 'user1', { content: 'Another message' });
    });

    test('should search messages case insensitive by default', () => {
      const results = chatService.searchMessages('room1', 'world');
      
      expect(results).toHaveLength(2);
      expect(results.some(m => m.content.includes('Hello world'))).toBe(true);
      expect(results.some(m => m.content.includes('Goodbye world'))).toBe(true);
    });

    test('should respect case sensitive option', () => {
      const results = chatService.searchMessages('room1', 'World', { caseSensitive: true });
      
      expect(results).toHaveLength(0);
    });

    test('should respect limit option', () => {
      const results = chatService.searchMessages('room1', 'world', { limit: 1 });
      
      expect(results).toHaveLength(1);
    });

    test('should return empty array for non-existent room', () => {
      const results = chatService.searchMessages('nonexistent', 'test');
      expect(results).toEqual([]);
    });
  });

  describe('updateRoomSettings', () => {
    let chatRoom;

    beforeEach(() => {
      chatRoom = chatService.createChatRoom('room1', { createdBy: 'moderator' });
    });

    test('should update room settings', () => {
      const newSettings = {
        slowMode: true,
        slowModeInterval: 5000,
        allowEmojis: false
      };
      
      const result = chatService.updateRoomSettings('room1', newSettings, 'moderator');
      
      expect(result.success).toBe(true);
      expect(chatRoom.settings.slowMode).toBe(true);
      expect(chatRoom.settings.slowModeInterval).toBe(5000);
      expect(chatRoom.settings.allowEmojis).toBe(false);
    });

    test('should reject if user is not moderator', () => {
      expect(() => {
        chatService.updateRoomSettings('room1', { slowMode: true }, 'user1');
      }).toThrow('No tienes permisos para modificar la configuración');
    });

    test('should reject if room not found', () => {
      expect(() => {
        chatService.updateRoomSettings('nonexistent', { slowMode: true }, 'moderator');
      }).toThrow('Sala de chat no encontrada');
    });
  });

  describe('getChatStats', () => {
    beforeEach(() => {
      // Create multiple rooms and send messages
      chatService.createChatRoom('room1', { type: 'lobby' });
      chatService.createChatRoom('room2', { type: 'game' });
      chatService.createChatRoom('room3', { type: 'lobby' });
      
      chatService.joinChatRoom('room1', 'user1');
      chatService.joinChatRoom('room2', 'user2');
      chatService.joinChatRoom('room3', 'user3');
      
      chatService.sendMessage('room1', 'user1', { content: 'Message 1' });
      chatService.sendMessage('room1', 'user1', { content: 'Message 2' });
      chatService.sendMessage('room2', 'user2', { content: 'Message 3' });
    });

    test('should return correct statistics', () => {
      const stats = chatService.getChatStats();
      
      expect(stats.totalRooms).toBe(3);
      expect(stats.totalUsers).toBe(3);
      expect(stats.totalMessages).toBe(3);
      expect(stats.roomsByType.lobby).toBe(2);
      expect(stats.roomsByType.game).toBe(1);
      expect(stats.averageMessagesPerRoom).toBe(1);
    });
  });

  describe('cleanupInactiveRooms', () => {
    test('should remove inactive rooms', () => {
      const chatRoom = chatService.createChatRoom('room1');
      chatRoom.lastActivity = new Date(Date.now() - 25 * 60 * 60 * 1000); // 25 hours ago
      
      const removedCount = chatService.cleanupInactiveRooms(24 * 60 * 60 * 1000); // 24 hours
      
      expect(removedCount).toBe(1);
      expect(chatService.chatRooms.has('room1')).toBe(false);
    });

    test('should not remove active rooms', () => {
      const chatRoom = chatService.createChatRoom('room1');
      chatRoom.lastActivity = new Date(); // Now
      
      const removedCount = chatService.cleanupInactiveRooms(24 * 60 * 60 * 1000);
      
      expect(removedCount).toBe(0);
      expect(chatService.chatRooms.has('room1')).toBe(true);
    });

    test('should not remove rooms with users', () => {
      const chatRoom = chatService.createChatRoom('room1');
      chatRoom.lastActivity = new Date(Date.now() - 25 * 60 * 60 * 1000);
      chatRoom.users.add('user1');
      
      const removedCount = chatService.cleanupInactiveRooms(24 * 60 * 60 * 1000);
      
      expect(removedCount).toBe(0);
      expect(chatService.chatRooms.has('room1')).toBe(true);
    });
  });

  describe('Utility Methods', () => {
    test('should sanitize content', () => {
      const dirtyContent = '<script>alert("xss")</script>Hello <iframe src="evil.com"></iframe>';
      const sanitized = chatService.sanitizeContent(dirtyContent);
      
      expect(sanitized).toBe('Hello ');
    });

    test('should generate unique message IDs', () => {
      const id1 = chatService.generateMessageId();
      const id2 = chatService.generateMessageId();
      
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^msg_\d+_[a-z0-9]+$/);
    });

    test('should validate message correctly', () => {
      const validResult = chatService.validateMessage('Valid message', 'text');
      expect(validResult.isValid).toBe(true);
      
      const invalidResult = chatService.validateMessage('', 'text');
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.error).toContain('no puede estar vacío');
    });
  });
});
