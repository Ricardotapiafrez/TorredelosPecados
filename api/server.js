const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const gameRoutes = require('./src/routes/gameRoutes');
const GameService = require('./src/services/GameService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware de seguridad
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000"
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // máximo 100 requests por ventana
});
app.use(limiter);

app.use(express.json());

// Rutas
app.use('/api/game', gameRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Torre de los Pecados API funcionando' });
});

// Estadísticas del juego
app.get('/api/stats', (req, res) => {
  const stats = gameService.getGameStats();
  res.json(stats);
});

// Inicializar servicio de juego
const gameService = new GameService(io);

// Manejo de conexiones Socket.io
io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  // Unirse a una sala
  socket.on('joinRoom', (data) => {
    gameService.joinRoom(socket, data);
  });

  // Crear una nueva sala
  socket.on('createRoom', (data) => {
    gameService.createRoom(socket, data);
  });

  // Jugar una carta
  socket.on('playCard', (data) => {
    gameService.playCard(socket, data);
  });

  // Tomar Torre de los Pecados
  socket.on('takeDiscardPile', () => {
    gameService.takeDiscardPile(socket);
  });

  // Marcar jugador como listo
  socket.on('setPlayerReady', (data) => {
    gameService.setPlayerReady(socket, data);
  });

  // Iniciar juego
  socket.on('startGame', () => {
    gameService.startGame(socket);
  });

  // Obtener cartas jugables
  socket.on('getPlayableCards', () => {
    gameService.getPlayableCards(socket);
  });

  // Obtener lista de salas públicas
  socket.on('getPublicRooms', () => {
    const rooms = gameService.getPublicRooms();
    socket.emit('publicRoomsList', { rooms });
  });

  // Obtener información de una sala específica
  socket.on('getRoomInfo', (data) => {
    const { roomId } = data;
    const roomInfo = gameService.getRoomInfo(roomId);
    if (roomInfo) {
      socket.emit('roomInfo', { roomInfo });
    } else {
      socket.emit('error', { message: 'Sala no encontrada' });
    }
  });

  // Buscar salas por criterios
  socket.on('searchRooms', (data) => {
    const rooms = gameService.searchRooms(data.criteria);
    socket.emit('roomsSearchResult', { rooms, criteria: data.criteria });
  });

  // Sistema de invitaciones por código
  socket.on('generateInvitationCode', (data) => {
    try {
      const { roomId, playerId, options } = data;
      const code = gameService.generateInvitationCode(roomId, playerId, options);
      socket.emit('invitationCodeGenerated', { code, roomId });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('validateInvitationCode', (data) => {
    try {
      const { code } = data;
      const validation = gameService.validateInvitationCode(code);
      socket.emit('invitationCodeValidated', validation);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('useInvitationCode', (data) => {
    try {
      const { code, playerName } = data;
      const result = gameService.useInvitationCode(code, playerName, socket.id);
      
      if (result.success) {
        // Unir socket a la sala
        socket.join(result.roomId);
        
        // Notificar al jugador
        socket.emit('invitationCodeUsed', {
          roomId: result.roomId,
          playerId: result.playerId,
          gameState: result.gameState,
          roomInfo: result.roomInfo
        });

        // Notificar a otros jugadores
        socket.to(result.roomId).emit('playerJoined', {
          player: { name: playerName, id: result.playerId }
        });
      } else {
        socket.emit('invitationCodeError', { error: result.error });
      }
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('getRoomInvitations', (data) => {
    try {
      const { roomId } = data;
      const invitations = gameService.getRoomInvitations(roomId);
      socket.emit('roomInvitationsList', { roomId, invitations });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('deactivateInvitationCode', (data) => {
    try {
      const { code, playerId } = data;
      const result = gameService.deactivateInvitationCode(code, playerId);
      socket.emit('invitationCodeDeactivated', result);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Sistema de configuración de mazos temáticos
  socket.on('getDeckConfigurations', () => {
    try {
      const configurations = gameService.getEnabledDeckConfigurations();
      socket.emit('deckConfigurationsList', { configurations });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('getDeckConfiguration', (data) => {
    try {
      const { deckType } = data;
      const configuration = gameService.getDeckConfiguration(deckType);
      if (configuration) {
        socket.emit('deckConfiguration', { configuration });
      } else {
        socket.emit('error', { message: 'Configuración de mazo no encontrada' });
      }
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('createRoomDeckConfiguration', (data) => {
    try {
      const { roomId, deckType, customizations } = data;
      const configuration = gameService.createRoomDeckConfiguration(roomId, deckType, customizations);
      socket.emit('roomDeckConfigurationCreated', { configuration });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('getRoomDeckConfiguration', (data) => {
    try {
      const { roomId } = data;
      const configuration = gameService.getRoomDeckConfiguration(roomId);
      if (configuration) {
        socket.emit('roomDeckConfiguration', { configuration });
      } else {
        socket.emit('error', { message: 'Configuración de sala no encontrada' });
      }
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('updateRoomDeckConfiguration', (data) => {
    try {
      const { roomId, updates } = data;
      const configuration = gameService.updateRoomDeckConfiguration(roomId, updates);
      socket.emit('roomDeckConfigurationUpdated', { configuration });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('modifyDeckCard', (data) => {
    try {
      const { roomId, cardId, modifications } = data;
      const modifiedCard = gameService.modifyDeckCard(roomId, cardId, modifications);
      socket.emit('deckCardModified', { modifiedCard });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('addDeckCustomRule', (data) => {
    try {
      const { roomId, rule } = data;
      const customRule = gameService.addDeckCustomRule(roomId, rule);
      socket.emit('deckCustomRuleAdded', { customRule });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('removeDeckCustomRule', (data) => {
    try {
      const { roomId, ruleId } = data;
      const result = gameService.removeDeckCustomRule(roomId, ruleId);
      socket.emit('deckCustomRuleRemoved', { ruleId, result });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('validateDeckConfiguration', (data) => {
    try {
      const { configuration } = data;
      const validation = gameService.validateDeckConfiguration(configuration);
      socket.emit('deckConfigurationValidated', { validation });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('exportDeckConfiguration', (data) => {
    try {
      const { roomId } = data;
      const exportedConfig = gameService.exportDeckConfiguration(roomId);
      socket.emit('deckConfigurationExported', { exportedConfig });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('importDeckConfiguration', (data) => {
    try {
      const { roomId, importedConfig } = data;
      const configuration = gameService.importDeckConfiguration(roomId, importedConfig);
      socket.emit('deckConfigurationImported', { configuration });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Sistema de chat básico en lobby
  socket.on('createChatRoom', (data) => {
    try {
      const { roomId, options } = data;
      const chatRoom = gameService.createChatRoom(roomId, options);
      socket.emit('chatRoomCreated', { chatRoom });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('joinChatRoom', (data) => {
    try {
      const { roomId, userId, userInfo } = data;
      const result = gameService.joinChatRoom(roomId, userId, userInfo);
      
      if (result.success) {
        // Unir socket a la sala de chat
        socket.join(`chat_${roomId}`);
        
        // Notificar al usuario
        socket.emit('chatRoomJoined', result);
        
        // Notificar a otros usuarios en la sala
        socket.to(`chat_${roomId}`).emit('userJoinedChat', {
          userId,
          userInfo,
          timestamp: new Date()
        });
      }
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('leaveChatRoom', (data) => {
    try {
      const { roomId, userId } = data;
      const result = gameService.leaveChatRoom(roomId, userId);
      
      if (result.success) {
        // Salir de la sala de chat
        socket.leave(`chat_${roomId}`);
        
        // Notificar al usuario
        socket.emit('chatRoomLeft', result);
        
        // Notificar a otros usuarios en la sala
        socket.to(`chat_${roomId}`).emit('userLeftChat', {
          userId,
          timestamp: new Date()
        });
      }
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('sendChatMessage', (data) => {
    try {
      const { roomId, userId, messageData } = data;
      const result = gameService.sendChatMessage(roomId, userId, messageData);
      
      if (result.success) {
        // Enviar mensaje a todos en la sala
        socket.to(`chat_${roomId}`).emit('chatMessageReceived', {
          message: result.message
        });
        
        // Confirmar al remitente
        socket.emit('chatMessageSent', {
          message: result.message
        });
      }
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('getChatMessages', (data) => {
    try {
      const { roomId, options } = data;
      const messages = gameService.getChatMessages(roomId, options);
      socket.emit('chatMessagesList', { roomId, messages });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('editChatMessage', (data) => {
    try {
      const { roomId, messageId, userId, newContent } = data;
      const result = gameService.editChatMessage(roomId, messageId, userId, newContent);
      
      if (result.success) {
        // Notificar a todos en la sala
        socket.to(`chat_${roomId}`).emit('chatMessageEdited', {
          message: result.message
        });
        
        // Confirmar al editor
        socket.emit('chatMessageEdited', {
          message: result.message
        });
      }
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('deleteChatMessage', (data) => {
    try {
      const { roomId, messageId, userId, isModerator } = data;
      const result = gameService.deleteChatMessage(roomId, messageId, userId, isModerator);
      
      if (result.success) {
        // Notificar a todos en la sala
        socket.to(`chat_${roomId}`).emit('chatMessageDeleted', {
          messageId,
          deletedBy: userId
        });
        
        // Confirmar al eliminador
        socket.emit('chatMessageDeleted', {
          messageId,
          deletedBy: userId
        });
      }
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('getChatRoomUsers', (data) => {
    try {
      const { roomId } = data;
      const users = gameService.getChatRoomUsers(roomId);
      socket.emit('chatRoomUsersList', { roomId, users });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('searchChatMessages', (data) => {
    try {
      const { roomId, query, options } = data;
      const results = gameService.searchChatMessages(roomId, query, options);
      socket.emit('chatMessagesSearchResult', { roomId, query, results });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('updateChatRoomSettings', (data) => {
    try {
      const { roomId, settings, userId } = data;
      const result = gameService.updateChatRoomSettings(roomId, settings, userId);
      
      if (result.success) {
        // Notificar a todos en la sala
        socket.to(`chat_${roomId}`).emit('chatRoomSettingsUpdated', {
          settings: result.settings
        });
        
        // Confirmar al moderador
        socket.emit('chatRoomSettingsUpdated', {
          settings: result.settings
        });
      }
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('getChatStats', () => {
    try {
      const stats = gameService.getChatStats();
      socket.emit('chatStats', { stats });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Reconexión
  socket.on('reconnect', (data) => {
    gameService.handleReconnection(socket, data);
  });

  // Ping para medir latencia
  socket.on('ping', (callback) => {
    if (typeof callback === 'function') {
      callback();
    }
  });

  // Desconexión
  socket.on('disconnect', () => {
    gameService.handleDisconnect(socket);
    console.log('Usuario desconectado:', socket.id);
  });
});

// Limpiar juegos antiguos cada hora
setInterval(() => {
  gameService.cleanupOldGames();
}, 60 * 60 * 1000);

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📡 Socket.io disponible en ws://localhost:${PORT}`);
  console.log(`🎮 Torre de los Pecados - API lista para jugar`);
});
