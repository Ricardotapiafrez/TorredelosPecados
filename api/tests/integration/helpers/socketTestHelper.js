const { io } = require('socket.io-client');
const http = require('http');
const socketIo = require('socket.io');

class SocketTestHelper {
  constructor() {
    this.server = null;
    this.io = null;
    this.clients = [];
    this.port = 0;
    this.serverListenCallback = null;
  }

  /**
   * Inicia un servidor de prueba
   */
  async startServer() {
    return new Promise((resolve) => {
      this.server = http.createServer();
      this.io = socketIo(this.server, {
        cors: {
          origin: "*",
          methods: ["GET", "POST"]
        }
      });

      // Importar y configurar el GameService
      const GameService = require('../../../src/services/GameService');
      this.gameService = new GameService(this.io);

      // Configurar eventos Socket.io
      this.setupSocketEvents();

      this.serverListenCallback = () => {
        this.port = this.server.address().port;
        resolve();
      };
      
      this.server.listen(0, this.serverListenCallback);
    });
  }

  /**
   * Configura los eventos Socket.io para testing
   */
  setupSocketEvents() {
    this.io.on('connection', (socket) => {
      // Evento básico de ping para testing
      socket.on('ping', (callback) => {
        if (typeof callback === 'function') {
          callback({ message: 'pong', timestamp: Date.now() });
        }
      });

      // Eventos básicos del juego
      socket.on('joinRoom', (data) => {
        this.gameService.joinRoom(socket, data);
      });

      socket.on('createRoom', (data) => {
        this.gameService.createRoom(socket, data);
      });

      socket.on('playCard', (data) => {
        this.gameService.playCard(socket, data);
      });

      socket.on('takeDiscardPile', () => {
        this.gameService.takeDiscardPile(socket);
      });

      socket.on('setPlayerReady', (data) => {
        this.gameService.setPlayerReady(socket, data);
      });

      socket.on('startGame', () => {
        this.gameService.startGame(socket);
      });

      socket.on('getPlayableCards', () => {
        this.gameService.getPlayableCards(socket);
      });

      // Eventos de salas públicas
      socket.on('getPublicRooms', () => {
        const rooms = this.gameService.getPublicRooms();
        socket.emit('publicRoomsList', { rooms });
      });

      socket.on('getRoomInfo', (data) => {
        const { roomId } = data;
        const roomInfo = this.gameService.getRoomInfo(roomId);
        if (roomInfo) {
          socket.emit('roomInfo', { roomInfo });
        } else {
          socket.emit('error', { message: 'Sala no encontrada' });
        }
      });

      socket.on('searchRooms', (data) => {
        const rooms = this.gameService.searchRooms(data.criteria);
        socket.emit('roomsSearchResult', { rooms, criteria: data.criteria });
      });

      // Eventos de invitaciones
      socket.on('generateInvitationCode', (data) => {
        try {
          const { roomId, playerId, options } = data;
          const code = this.gameService.generateInvitationCode(roomId, playerId, options);
          socket.emit('invitationCodeGenerated', { code, roomId });
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      socket.on('validateInvitationCode', (data) => {
        try {
          const { code } = data;
          const validation = this.gameService.validateInvitationCode(code);
          socket.emit('invitationCodeValidated', validation);
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      socket.on('useInvitationCode', (data) => {
        try {
          const { code, playerName } = data;
          const result = this.gameService.useInvitationCode(code, playerName, socket.id);
          
          if (result.success) {
            socket.join(result.roomId);
            socket.emit('invitationCodeUsed', {
              roomId: result.roomId,
              playerId: result.playerId,
              gameState: result.gameState,
              roomInfo: result.roomInfo
            });
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

      // Eventos de configuración de mazos
      socket.on('getDeckConfigurations', () => {
        try {
          const configurations = this.gameService.getEnabledDeckConfigurations();
          socket.emit('deckConfigurationsList', { configurations });
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      socket.on('getDeckConfiguration', (data) => {
        try {
          const { deckType } = data;
          const configuration = this.gameService.getDeckConfiguration(deckType);
          if (configuration) {
            socket.emit('deckConfiguration', { configuration });
          } else {
            socket.emit('error', { message: 'Configuración de mazo no encontrada' });
          }
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      // Eventos de chat
      socket.on('createChatRoom', (data) => {
        try {
          const { roomId, options } = data;
          const chatRoom = this.gameService.createChatRoom(roomId, options);
          socket.emit('chatRoomCreated', { chatRoom });
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      socket.on('joinChatRoom', (data) => {
        try {
          const { roomId, userId, userInfo } = data;
          const result = this.gameService.joinChatRoom(roomId, userId, userInfo);
          
          if (result.success) {
            socket.join(`chat_${roomId}`);
            socket.emit('chatRoomJoined', result);
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

      socket.on('sendChatMessage', (data) => {
        try {
          const { roomId, userId, messageData } = data;
          const result = this.gameService.sendChatMessage(roomId, userId, messageData);
          
          if (result.success) {
            socket.to(`chat_${roomId}`).emit('chatMessageReceived', {
              message: result.message
            });
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
          const messages = this.gameService.getChatMessages(roomId, options);
          socket.emit('chatMessagesList', { roomId, messages });
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      // Eventos de utilidad
      socket.on('ping', (callback) => {
        if (typeof callback === 'function') {
          callback();
        }
      });

      socket.on('cleanDisconnect', () => {
        // En modo test, limpiar sin configurar timeouts
        const playerInfo = this.gameService.playerSockets.get(socket.id);
        if (playerInfo) {
          const { playerId } = playerInfo;
          // Limpiar timeout si existe
          const timeoutId = this.gameService.playerTimeouts.get(playerId);
          if (timeoutId) {
            clearTimeout(timeoutId);
            this.gameService.playerTimeouts.delete(playerId);
          }
          this.gameService.playerSockets.delete(socket.id);
        }
      });

      socket.on('disconnect', () => {
        this.gameService.handleDisconnect(socket);
      });
    });
  }

  /**
   * Crea un cliente Socket.io para testing
   */
  createClient() {
    const client = io(`http://localhost:${this.port}`, {
      transports: ['websocket'],
      forceNew: true
    });

    this.clients.push(client);
    return client;
  }

  /**
   * Espera a que un cliente se conecte
   */
  async waitForConnection(client) {
    return new Promise((resolve) => {
      if (client.connected) {
        resolve();
      } else {
        client.on('connect', resolve);
      }
    });
  }

  /**
   * Espera a recibir un evento específico
   */
  async waitForEvent(client, eventName, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Timeout waiting for event: ${eventName}`));
      }, timeout);

      client.once(eventName, (data) => {
        clearTimeout(timer);
        resolve(data);
      });
    });
  }

  /**
   * Envía un evento y espera la respuesta
   */
  async emitAndWait(client, eventName, data, responseEvent, timeout = 5000) {
    const responsePromise = this.waitForEvent(client, responseEvent, timeout);
    client.emit(eventName, data);
    return responsePromise;
  }

  /**
   * Crea múltiples clientes conectados
   */
  async createMultipleClients(count) {
    const clients = [];
    for (let i = 0; i < count; i++) {
      const client = this.createClient();
      await this.waitForConnection(client);
      clients.push(client);
    }
    return clients;
  }

  /**
   * Limpia todos los clientes
   */
  async cleanupClients() {
    // Desconectar clientes de manera más limpia para evitar timeouts
    for (const client of this.clients) {
      if (client.connected) {
        // Emitir evento de desconexión limpia antes de desconectar
        client.emit('cleanDisconnect');
        
        // Remover todos los listeners del cliente
        client.removeAllListeners();
        
        // Desconectar el cliente
        client.disconnect();
      }
    }
    this.clients = [];
    
    // Esperar un poco para que se procesen las desconexiones
    await this.wait(200);
  }

  /**
   * Detiene el servidor
   */
  async stopServer() {
    // Limpiar clientes primero
    await this.cleanupClients();
    
    // Limpiar todos los timeouts de inactividad
    this.clearAllInactivityTimeouts();
    
    // Limpiar todos los timeouts de reconexión
    this.clearAllReconnectionTimeouts();
    
    // Limpiar todos los timeouts de turno
    this.clearAllTurnTimeouts();
    
    // Limpiar todos los recursos del GameService
    this.clearGameServiceResources();
    
    // Limpiar el callback del servidor
    this.clearServerCallback();
    
    // Limpiar todos los listeners de socket.io
    if (this.io) {
      this.io.removeAllListeners();
      this.io.sockets.removeAllListeners();
      
      // Desconectar todos los sockets conectados
      const connectedSockets = await this.io.fetchSockets();
      for (const socket of connectedSockets) {
        socket.disconnect(true);
      }
    }
    
    return new Promise((resolve) => {
      if (this.server) {
        // Configurar timeout para forzar el cierre si es necesario
        const closeTimeout = setTimeout(() => {
          console.warn('⚠️ Forzando cierre del servidor después de timeout');
          this.server.unref();
          this.server = null;
          this.io = null;
          this.gameService = null;
          this.serverListenCallback = null;
          resolve();
        }, 5000);
        
        this.server.close(() => {
          clearTimeout(closeTimeout);
          this.server = null;
          this.io = null;
          this.gameService = null;
          this.serverListenCallback = null;
          resolve();
        });
        
        // Forzar cierre si no se cierra en 3 segundos
        setTimeout(() => {
          if (this.server) {
            this.server.unref();
          }
        }, 3000);
      } else {
        resolve();
      }
    });
  }

  /**
   * Limpia todos los timeouts de inactividad
   */
  clearAllInactivityTimeouts() {
    if (this.gameService && this.gameService.playerTimeouts) {
      for (const [playerId, timeoutId] of this.gameService.playerTimeouts.entries()) {
        clearTimeout(timeoutId);
      }
      this.gameService.playerTimeouts.clear();
    }
  }

  /**
   * Limpia todos los timeouts de reconexión
   */
  clearAllReconnectionTimeouts() {
    if (this.gameService && this.gameService.playerReconnectionTokens) {
      // Los tokens de reconexión tienen sus propios timeouts que se limpian automáticamente
      // pero podemos limpiar los datos
      this.gameService.playerReconnectionTokens.clear();
    }
  }

  /**
   * Limpia todos los timeouts de turno
   */
  clearAllTurnTimeouts() {
    if (this.gameService && this.gameService.games) {
      for (const [roomId, game] of this.gameService.games.entries()) {
        if (game.turnTimeoutId) {
          clearTimeout(game.turnTimeoutId);
          game.turnTimeoutId = null;
        }
      }
    }
  }

  /**
   * Limpia todos los recursos del GameService
   */
  clearGameServiceResources() {
    if (this.gameService) {
      // Limpiar todos los juegos
      this.gameService.games.clear();
      
      // Limpiar todos los sockets de jugadores
      this.gameService.playerSockets.clear();
      
      // Limpiar todos los tokens de reconexión
      this.gameService.playerReconnectionTokens.clear();
      
      // Limpiar todos los jugadores desconectados
      this.gameService.disconnectedPlayers.clear();
      
      // Limpiar todos los timeouts
      this.clearAllInactivityTimeouts();
      
      // Limpiar códigos de invitación
      this.gameService.invitationCodes.clear();
      this.gameService.roomInvitations.clear();
    }
  }

  /**
   * Limpia el callback del servidor
   */
  clearServerCallback() {
    if (this.server && this.serverListenCallback) {
      // Remover el listener del servidor
      this.server.removeListener('listening', this.serverListenCallback);
      this.serverListenCallback = null;
    }
  }

  /**
   * Obtiene el estado del juego para una sala
   */
  getGameState(roomId) {
    return this.gameService.games.get(roomId);
  }

  /**
   * Obtiene estadísticas del juego
   */
  getGameStats() {
    return this.gameService.getGameStats();
  }

  /**
   * Limpia juegos antiguos
   */
  cleanupOldGames() {
    this.gameService.cleanupOldGames();
  }

  /**
   * Simula una desconexión y reconexión
   */
  async simulateReconnection(client, playerId) {
    client.disconnect();
    
    const newClient = this.createClient();
    await this.waitForConnection(newClient);
    
    // Simular reconexión
    newClient.emit('reconnect', { playerId });
    
    return newClient;
  }

  /**
   * Espera un tiempo específico
   */
  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Verifica que un cliente esté conectado
   */
  isClientConnected(client) {
    return client.connected;
  }

  /**
   * Obtiene el ID del socket de un cliente
   */
  getClientId(client) {
    return client.id;
  }

  /**
   * Espera a que se actualice el estado del juego
   */
  async waitForGameStateUpdate(client, roomId, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Timeout waiting for game state update in room: ${roomId}`));
      }, timeout);

      const checkState = () => {
        const game = this.getGameState(roomId);
        if (game) {
          clearTimeout(timer);
          resolve(game);
        } else {
          setTimeout(checkState, 100);
        }
      };

      checkState();
    });
  }

  /**
   * Espera a que un jugador esté listo
   */
  async waitForPlayerReady(client, timeout = 5000) {
    return this.waitForEvent(client, 'gameStateUpdated', timeout);
  }

  /**
   * Debug: Imprime información del estado del juego
   */
  debugGameState(roomId) {
    const game = this.getGameState(roomId);
    if (game) {
      console.log(`🎮 Game State for room ${roomId}:`);
      console.log(`  - Players: ${game.players.length}`);
      console.log(`  - Game State: ${game.gameState}`);
      game.players.forEach((player, index) => {
        console.log(`  - Player ${index + 1}: ${player.name} (${player.id}) - Ready: ${player.isReady}`);
      });
    } else {
      console.log(`❌ No game found for room ${roomId}`);
    }
  }

  /**
   * Debug: Imprime información de playerSockets
   */
  debugPlayerSockets() {
    console.log(`🔗 Player Sockets (${this.gameService.playerSockets.size}):`);
    for (const [socketId, info] of this.gameService.playerSockets.entries()) {
      console.log(`  - Socket ${socketId}: Player ${info.playerId} in Room ${info.roomId}`);
    }
  }
}

module.exports = SocketTestHelper;
