class ChatService {
  constructor() {
    this.chatRooms = new Map(); // Map<roomId, ChatRoom>
    this.userChats = new Map(); // Map<userId, Set<roomId>>
    this.messageHistory = new Map(); // Map<roomId, Message[]>
    this.maxMessagesPerRoom = 100; // Límite de mensajes por sala
    this.maxMessageLength = 500; // Límite de caracteres por mensaje
  }

  // Crear una sala de chat
  createChatRoom(roomId, options = {}) {
    const {
      name = `Chat de ${roomId}`,
      type = 'lobby', // 'lobby', 'game', 'private'
      maxUsers = 50,
      isPrivate = false,
      createdBy = null
    } = options;

    const chatRoom = {
      id: roomId,
      name,
      type,
      maxUsers,
      isPrivate,
      createdBy,
      users: new Set(),
      moderators: new Set(),
      createdAt: new Date(),
      lastActivity: new Date(),
      settings: {
        allowEmojis: true,
        allowLinks: true,
        allowImages: false,
        requireModeration: false,
        slowMode: false,
        slowModeInterval: 3000 // 3 segundos
      }
    };

    this.chatRooms.set(roomId, chatRoom);
    this.messageHistory.set(roomId, []);

    // Agregar moderador si se especifica
    if (createdBy) {
      chatRoom.moderators.add(createdBy);
    }

    return chatRoom;
  }

  // Unirse a una sala de chat
  joinChatRoom(roomId, userId, userInfo = {}) {
    const chatRoom = this.chatRooms.get(roomId);
    if (!chatRoom) {
      throw new Error('Sala de chat no encontrada');
    }

    if (chatRoom.users.size >= chatRoom.maxUsers) {
      throw new Error('La sala de chat está llena');
    }

    // Agregar usuario a la sala
    chatRoom.users.add(userId);
    chatRoom.lastActivity = new Date();

    // Agregar sala al usuario
    if (!this.userChats.has(userId)) {
      this.userChats.set(userId, new Set());
    }
    this.userChats.get(userId).add(roomId);

    return {
      success: true,
      room: this.getPublicRoomInfo(chatRoom),
      message: 'Te has unido al chat'
    };
  }

  // Salir de una sala de chat
  leaveChatRoom(roomId, userId) {
    const chatRoom = this.chatRooms.get(roomId);
    if (!chatRoom) {
      throw new Error('Sala de chat no encontrada');
    }

    // Remover usuario de la sala
    chatRoom.users.delete(userId);
    chatRoom.lastActivity = new Date();

    // Remover sala del usuario
    const userRooms = this.userChats.get(userId);
    if (userRooms) {
      userRooms.delete(roomId);
      if (userRooms.size === 0) {
        this.userChats.delete(userId);
      }
    }

    return {
      success: true,
      message: 'Has salido del chat'
    };
  }

  // Enviar mensaje
  sendMessage(roomId, userId, messageData) {
    const chatRoom = this.chatRooms.get(roomId);
    if (!chatRoom) {
      throw new Error('Sala de chat no encontrada');
    }

    if (!chatRoom.users.has(userId)) {
      throw new Error('No estás en esta sala de chat');
    }

    const {
      content,
      type = 'text', // 'text', 'system', 'emote', 'image'
      replyTo = null,
      metadata = {}
    } = messageData;

    // Validar mensaje
    const validation = this.validateMessage(content, type, chatRoom);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Verificar modo lento
    if (chatRoom.settings.slowMode) {
      const lastMessage = this.getLastMessageFromUser(roomId, userId);
      if (lastMessage && Date.now() - lastMessage.timestamp < chatRoom.settings.slowModeInterval) {
        throw new Error('Modo lento activado. Espera antes de enviar otro mensaje');
      }
    }

    // Crear mensaje
    const message = {
      id: this.generateMessageId(),
      roomId,
      userId,
      content: this.sanitizeContent(content),
      type,
      replyTo,
      metadata,
      timestamp: new Date(),
      edited: false,
      deleted: false
    };

    // Agregar mensaje al historial
    const messages = this.messageHistory.get(roomId) || [];
    messages.push(message);

    // Limpiar mensajes antiguos si excede el límite
    if (messages.length > this.maxMessagesPerRoom) {
      messages.splice(0, messages.length - this.maxMessagesPerRoom);
    }

    this.messageHistory.set(roomId, messages);
    chatRoom.lastActivity = new Date();

    return {
      success: true,
      message: this.getPublicMessageInfo(message)
    };
  }

  // Obtener mensajes de una sala
  getMessages(roomId, options = {}) {
    const {
      limit = 50,
      before = null,
      after = null
    } = options;

    const messages = this.messageHistory.get(roomId) || [];
    let filteredMessages = [...messages];

    // Filtrar por timestamp si se especifica
    if (before) {
      filteredMessages = filteredMessages.filter(msg => msg.timestamp < new Date(before));
    }

    if (after) {
      filteredMessages = filteredMessages.filter(msg => msg.timestamp > new Date(after));
    }

    // Limitar cantidad de mensajes
    if (limit) {
      filteredMessages = filteredMessages.slice(-limit);
    }

    return filteredMessages.map(msg => this.getPublicMessageInfo(msg));
  }

  // Editar mensaje
  editMessage(roomId, messageId, userId, newContent) {
    const messages = this.messageHistory.get(roomId) || [];
    const message = messages.find(msg => msg.id === messageId);

    if (!message) {
      throw new Error('Mensaje no encontrado');
    }

    if (message.userId !== userId) {
      throw new Error('No puedes editar mensajes de otros usuarios');
    }

    // Validar nuevo contenido
    const validation = this.validateMessage(newContent, message.type);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Actualizar mensaje
    message.content = this.sanitizeContent(newContent);
    message.edited = true;
    message.editedAt = new Date();

    return {
      success: true,
      message: this.getPublicMessageInfo(message)
    };
  }

  // Eliminar mensaje
  deleteMessage(roomId, messageId, userId, isModerator = false) {
    const messages = this.messageHistory.get(roomId) || [];
    const message = messages.find(msg => msg.id === messageId);

    if (!message) {
      throw new Error('Mensaje no encontrado');
    }

    if (message.userId !== userId && !isModerator) {
      throw new Error('No puedes eliminar mensajes de otros usuarios');
    }

    // Marcar como eliminado
    message.deleted = true;
    message.deletedAt = new Date();
    message.deletedBy = userId;

    return {
      success: true,
      message: 'Mensaje eliminado'
    };
  }

  // Obtener información de usuarios en una sala
  getRoomUsers(roomId) {
    const chatRoom = this.chatRooms.get(roomId);
    if (!chatRoom) {
      return [];
    }

    return Array.from(chatRoom.users).map(userId => ({
      userId,
      isModerator: chatRoom.moderators.has(userId),
      joinedAt: chatRoom.lastActivity // Simplificado, en producción sería más preciso
    }));
  }

  // Obtener salas de chat del usuario
  getUserChatRooms(userId) {
    const userRooms = this.userChats.get(userId) || new Set();
    return Array.from(userRooms).map(roomId => {
      const chatRoom = this.chatRooms.get(roomId);
      return chatRoom ? this.getPublicRoomInfo(chatRoom) : null;
    }).filter(Boolean);
  }

  // Buscar mensajes
  searchMessages(roomId, query, options = {}) {
    const {
      limit = 20,
      caseSensitive = false
    } = options;

    const messages = this.messageHistory.get(roomId) || [];
    const searchQuery = caseSensitive ? query : query.toLowerCase();

    const results = messages
      .filter(msg => !msg.deleted)
      .filter(msg => {
        const content = caseSensitive ? msg.content : msg.content.toLowerCase();
        return content.includes(searchQuery);
      })
      .slice(-limit)
      .map(msg => this.getPublicMessageInfo(msg));

    return results;
  }

  // Configurar sala de chat
  updateRoomSettings(roomId, settings, userId) {
    const chatRoom = this.chatRooms.get(roomId);
    if (!chatRoom) {
      throw new Error('Sala de chat no encontrada');
    }

    if (!chatRoom.moderators.has(userId)) {
      throw new Error('No tienes permisos para modificar la configuración');
    }

    chatRoom.settings = {
      ...chatRoom.settings,
      ...settings
    };

    return {
      success: true,
      settings: chatRoom.settings
    };
  }

  // Agregar moderador
  addModerator(roomId, userId, addedBy) {
    const chatRoom = this.chatRooms.get(roomId);
    if (!chatRoom) {
      throw new Error('Sala de chat no encontrada');
    }

    if (!chatRoom.moderators.has(addedBy)) {
      throw new Error('No tienes permisos para agregar moderadores');
    }

    chatRoom.moderators.add(userId);

    return {
      success: true,
      message: 'Moderador agregado'
    };
  }

  // Remover moderador
  removeModerator(roomId, userId, removedBy) {
    const chatRoom = this.chatRooms.get(roomId);
    if (!chatRoom) {
      throw new Error('Sala de chat no encontrada');
    }

    if (!chatRoom.moderators.has(removedBy)) {
      throw new Error('No tienes permisos para remover moderadores');
    }

    chatRoom.moderators.delete(userId);

    return {
      success: true,
      message: 'Moderador removido'
    };
  }

  // Limpiar salas inactivas
  cleanupInactiveRooms(maxInactiveTime = 24 * 60 * 60 * 1000) { // 24 horas por defecto
    const now = new Date();
    const inactiveRooms = [];

    for (const [roomId, chatRoom] of this.chatRooms) {
      const inactiveTime = now.getTime() - chatRoom.lastActivity.getTime();
      if (inactiveTime > maxInactiveTime && chatRoom.users.size === 0) {
        inactiveRooms.push(roomId);
      }
    }

    inactiveRooms.forEach(roomId => {
      this.chatRooms.delete(roomId);
      this.messageHistory.delete(roomId);
    });

    return inactiveRooms.length;
  }

  // Utilidades privadas
  validateMessage(content, type, chatRoom = null) {
    if (!content || typeof content !== 'string') {
      return { isValid: false, error: 'El contenido del mensaje es requerido' };
    }

    if (content.length > this.maxMessageLength) {
      return { isValid: false, error: `El mensaje no puede exceder ${this.maxMessageLength} caracteres` };
    }

    if (content.trim().length === 0) {
      return { isValid: false, error: 'El mensaje no puede estar vacío' };
    }

    // Validaciones específicas por tipo
    switch (type) {
      case 'text':
        // Validaciones básicas para texto
        break;
      case 'emote':
        // Validaciones para emotes
        if (!content.startsWith('/me ')) {
          return { isValid: false, error: 'Los emotes deben comenzar con /me ' };
        }
        break;
      case 'system':
        // Solo moderadores pueden enviar mensajes del sistema
        if (chatRoom && !chatRoom.moderators.has(userId)) {
          return { isValid: false, error: 'Solo moderadores pueden enviar mensajes del sistema' };
        }
        break;
      default:
        return { isValid: false, error: 'Tipo de mensaje no válido' };
    }

    return { isValid: true };
  }

  sanitizeContent(content) {
    // Sanitización básica del contenido
    return content
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  }

  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getLastMessageFromUser(roomId, userId) {
    const messages = this.messageHistory.get(roomId) || [];
    return messages
      .filter(msg => msg.userId === userId && !msg.deleted)
      .pop();
  }

  getPublicMessageInfo(message) {
    return {
      id: message.id,
      userId: message.userId,
      content: message.deleted ? '[Mensaje eliminado]' : message.content,
      type: message.type,
      replyTo: message.replyTo,
      timestamp: message.timestamp,
      edited: message.edited,
      deleted: message.deleted,
      metadata: message.metadata
    };
  }

  getPublicRoomInfo(chatRoom) {
    return {
      id: chatRoom.id,
      name: chatRoom.name,
      type: chatRoom.type,
      userCount: chatRoom.users.size,
      maxUsers: chatRoom.maxUsers,
      isPrivate: chatRoom.isPrivate,
      lastActivity: chatRoom.lastActivity,
      settings: chatRoom.settings
    };
  }

  // Obtener estadísticas del chat
  getChatStats() {
    const stats = {
      totalRooms: this.chatRooms.size,
      totalUsers: this.userChats.size,
      totalMessages: 0,
      roomsByType: {},
      averageMessagesPerRoom: 0
    };

    for (const [roomId, messages] of this.messageHistory) {
      stats.totalMessages += messages.length;
    }

    for (const [roomId, chatRoom] of this.chatRooms) {
      const type = chatRoom.type;
      stats.roomsByType[type] = (stats.roomsByType[type] || 0) + 1;
    }

    stats.averageMessagesPerRoom = stats.totalRooms > 0 
      ? Math.round(stats.totalMessages / stats.totalRooms) 
      : 0;

    return stats;
  }
}

module.exports = ChatService;
