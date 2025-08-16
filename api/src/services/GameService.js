const { v4: uuidv4 } = require('uuid');
const Game = require('../models/Game');
const { THEMATIC_DECKS } = require('../models/Card');
const ValidationService = require('./ValidationService');
const DeckConfigurationService = require('./DeckConfigurationService');
const ChatService = require('./ChatService');

class GameService {
  constructor(io) {
    this.io = io;
    this.games = new Map(); // Map<roomId, Game>
    this.playerSockets = new Map(); // Map<socketId, {playerId, roomId}>
    this.playerReconnectionTokens = new Map(); // Map<playerId, {token, expiresAt, roomId}>
    this.disconnectedPlayers = new Map(); // Map<playerId, {roomId, disconnectedAt, gameState}>
    this.playerTimeouts = new Map(); // Map<playerId, timeoutId>
    this.validationService = new ValidationService();
    this.deckConfigurationService = new DeckConfigurationService();
    this.chatService = new ChatService();
    
    // Sistema de invitaciones
    this.invitationCodes = new Map(); // Map<code, {roomId, createdBy, createdAt, expiresAt, maxUses, currentUses}>
    this.roomInvitations = new Map(); // Map<roomId, Set<code>>
    
    // Configuración de timeouts (más cortos en modo test)
    const isTestMode = process.env.TEST_MODE === 'true';
    this.TURN_TIMEOUT = isTestMode ? 5000 : 30000; // 5 segundos en test, 30 segundos en producción
    this.RECONNECTION_TIMEOUT = isTestMode ? 10000 : 60000; // 10 segundos en test, 1 minuto en producción
    this.INACTIVE_TIMEOUT = isTestMode ? 15000 : 120000; // 15 segundos en test, 2 minutos en producción
    this.INVITATION_EXPIRY = 24 * 60 * 60 * 1000; // 24 horas para invitaciones
  }

  // Crear token de reconexión
  createReconnectionToken(playerId, roomId) {
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + this.RECONNECTION_TIMEOUT);
    
    this.playerReconnectionTokens.set(playerId, {
      token,
      expiresAt,
      roomId
    });
    
    // Limpiar token expirado
    setTimeout(() => {
      this.playerReconnectionTokens.delete(playerId);
    }, this.RECONNECTION_TIMEOUT);
    
    return token;
  }

  // Validar token de reconexión
  validateReconnectionToken(playerId, token) {
    const tokenData = this.playerReconnectionTokens.get(playerId);
    
    if (!tokenData || tokenData.token !== token) {
      return false;
    }
    
    if (new Date() > tokenData.expiresAt) {
      this.playerReconnectionTokens.delete(playerId);
      return false;
    }
    
    return tokenData.roomId;
  }

  // Manejar reconexión de jugador
  handleReconnection(socket, data) {
    try {
      const { playerId, token } = data;
      const roomId = this.validateReconnectionToken(playerId, token);
      
      if (!roomId) {
        throw new Error('Token de reconexión inválido o expirado');
      }
      
      const game = this.games.get(roomId);
      if (!game) {
        throw new Error('Juego no encontrado');
      }
      
      const player = game.getPlayer(playerId);
      if (!player) {
        throw new Error('Jugador no encontrado en el juego');
      }
      
      // Actualizar socket del jugador
      player.socketId = socket.id;
      this.playerSockets.set(socket.id, { playerId, roomId });
      
      // Unir socket a la sala
      socket.join(roomId);
      
      // Limpiar datos de desconexión
      this.disconnectedPlayers.delete(playerId);
      this.playerReconnectionTokens.delete(playerId);
      
      // Cancelar timeout de inactividad
      const timeoutId = this.playerTimeouts.get(playerId);
      if (timeoutId) {
        clearTimeout(timeoutId);
        this.playerTimeouts.delete(playerId);
      }
      
      // Notificar reconexión exitosa
      socket.emit('reconnectionSuccess', {
        gameState: game.getGameState(playerId),
        message: 'Reconexión exitosa'
      });
      
      // Notificar a otros jugadores
      socket.to(roomId).emit('playerReconnected', {
        playerId,
        playerName: player.name
      });
      
      console.log(`✅ ${player.name} se reconectó a la sala ${roomId}`);
      
    } catch (error) {
      socket.emit('reconnectionFailed', { message: error.message });
    }
  }

  // Iniciar timeout de inactividad para un jugador
  startInactivityTimeout(playerId, roomId) {
    const timeoutId = setTimeout(() => {
      this.handlePlayerInactivity(playerId, roomId);
    }, this.INACTIVE_TIMEOUT);
    
    this.playerTimeouts.set(playerId, timeoutId);
  }

  // Manejar inactividad del jugador
  handlePlayerInactivity(playerId, roomId) {
    const game = this.games.get(roomId);
    if (!game) return;
    
    const player = game.getPlayer(playerId);
    if (!player) return;
    
    console.log(`⏰ Jugador ${player.name} inactivo, removiendo del juego`);
    
    // Remover jugador del juego
    game.removePlayer(playerId);
    
    // Notificar a otros jugadores
    this.io.to(roomId).emit('playerInactive', {
      playerId,
      playerName: player.name,
      message: 'Jugador removido por inactividad'
    });
    
    // Limpiar datos
    this.disconnectedPlayers.delete(playerId);
    this.playerTimeouts.delete(playerId);
    this.playerReconnectionTokens.delete(playerId);
    
    // Si el juego terminó, limpiar
    if (game.gameState === 'finished') {
      this.games.delete(roomId);
    }
  }

  // Validar estado del juego
  validateGameState(roomId) {
    const game = this.games.get(roomId);
    if (!game) return false;
    
    // Verificar que haya al menos 2 jugadores
    if (game.players.length < 2 && game.gameState === 'playing') {
      game.endGame();
      return false;
    }
    
    // Verificar que el jugador actual exista
    if (game.gameState === 'playing' && game.currentPlayerIndex >= game.players.length) {
      game.currentPlayerIndex = 0;
    }
    
    // Verificar timeouts de turno
    if (game.gameState === 'playing' && game.turnStartTime) {
      const timeSinceTurnStart = Date.now() - game.turnStartTime.getTime();
      if (timeSinceTurnStart > this.TURN_TIMEOUT) {
        const currentPlayer = game.players[game.currentPlayerIndex];
        if (currentPlayer) {
          console.log(`⏰ Timeout de turno para ${currentPlayer.name}`);
          game.nextTurn();
        }
      }
    }
    
    return true;
  }

  // Crear una nueva sala
  createRoom(socket, data) {
    try {
      const { playerName, maxPlayers = 6, deckType = THEMATIC_DECKS.ANGELS } = data;
      const roomId = uuidv4();
      const playerId = uuidv4();

      // Crear nuevo juego con mazo temático
      const game = new Game(roomId, maxPlayers, deckType);
      const player = game.addPlayer(playerId, playerName, socket.id);
      
      // Guardar referencias
      this.games.set(roomId, game);
      this.playerSockets.set(socket.id, { playerId, roomId });
      
      // Unir socket a la sala
      socket.join(roomId);
      
      // Notificar al jugador
      socket.emit('roomCreated', {
        roomId,
        playerId,
        gameState: game.getGameState(playerId)
      });

      console.log(`Sala creada: ${roomId} por ${playerName} con mazo ${deckType}`);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  }

  // Unirse a una sala
  joinRoom(socket, data) {
    try {
      const { roomId, playerName } = data;
      const game = this.games.get(roomId);
      
      if (!game) {
        throw new Error('Sala no encontrada');
      }

      const playerId = uuidv4();
      const player = game.addPlayer(playerId, playerName, socket.id);
      
      // Guardar referencias
      this.playerSockets.set(socket.id, { playerId, roomId });
      
      // Unir socket a la sala
      socket.join(roomId);
      
      // Notificar al jugador
      socket.emit('roomJoined', {
        roomId,
        playerId,
        gameState: game.getGameState(playerId)
      });

      // Notificar a otros jugadores
      socket.to(roomId).emit('playerJoined', {
        player: player.getPublicInfo()
      });

      console.log(`${playerName} se unió a la sala ${roomId}`);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  }

  // Jugar carta
  playCard(socket, data) {
    try {
      const { cardIndex, targetPlayerId } = data;
      const playerInfo = this.playerSockets.get(socket.id);
      
      if (!playerInfo) {
        throw new Error('Jugador no encontrado');
      }

      const { playerId, roomId } = playerInfo;
      const game = this.games.get(roomId);
      
      if (!game) {
        throw new Error('Juego no encontrado');
      }

      // Validar la jugada antes de ejecutarla
      const validation = this.validationService.validatePlay(game, playerId, cardIndex, targetPlayerId);
      
      if (!validation.isValid) {
        socket.emit('validationError', {
          errors: validation.errors,
          warnings: validation.warnings,
          playableCards: validation.playableCards
        });
        return;
      }

      // Si hay advertencias, enviarlas al jugador
      if (validation.warnings.length > 0) {
        socket.emit('validationWarning', {
          warnings: validation.warnings,
          card: validation.card.getPublicInfo()
        });
      }

      const card = game.playCard(playerId, cardIndex, targetPlayerId);
      
          // Verificar si hubo purificación
    const wasPurified = game.towerOfSins.cards.length === 0 && game.towerOfSins.lastPlayedCard === null;
      
      // Notificar a todos los jugadores en la sala
      game.players.forEach(player => {
        const gameState = game.getGameState(player.id);
        this.io.to(player.socketId).emit('gameStateUpdated', gameState);
      });

      // Notificar acción específica
      this.io.to(roomId).emit('cardPlayed', {
        playerId,
        card: card.getPublicInfo(),
        targetPlayerId,
        wasPurified,
        turnInfo: game.getTurnInfo()
      });

      // Notificar purificación si ocurrió
      if (wasPurified) {
        this.io.to(roomId).emit('pilePurified', {
          playerId,
          card: card.getPublicInfo(),
          message: 'La Torre de los Pecados ha sido purificada'
        });
      }

      // Notificar cambio de turno
      this.io.to(roomId).emit('turnChanged', {
        turnInfo: game.getTurnInfo(),
        previousPlayerId: playerId,
        nextPlayerId: game.players[game.currentPlayerIndex]?.id
      });

      // Verificar si el juego terminó
      if (game.gameState === 'finished') {
        console.log(`🎮 Juego terminado en sala ${roomId}`);
        
        this.io.to(roomId).emit('gameEnded', {
          winner: game.winner ? game.winner.getPublicInfo() : null,
          sinner: game.sinner ? game.sinner.getPublicInfo() : null,
          gameSummary: {
            totalTurns: game.turnNumber,
            finalDiscardPileSize: game.discardPile.length,
            playersStatus: game.players.map(p => ({
              id: p.id,
              name: p.name,
              status: p.hasWon() ? 'winner' : p.isSinner ? 'sinner' : 'active',
              cardsRemaining: p.getTotalCardsRemaining(),
              score: p.score
            }))
          }
        });
      }

      console.log(`Carta jugada en sala ${roomId}: ${card.name} por ${playerId}`);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  }

  // Tomar Torre de los Pecados
  takeDiscardPile(socket) {
    try {
      const playerInfo = this.playerSockets.get(socket.id);
      
      if (!playerInfo) {
        throw new Error('Jugador no encontrado');
      }

      const { playerId, roomId } = playerInfo;
      const game = this.games.get(roomId);
      
      if (!game) {
        throw new Error('Juego no encontrado');
      }

      game.takeDiscardPile(playerId);
      
      // Notificar a todos los jugadores
      game.players.forEach(player => {
        const gameState = game.getGameState(player.id);
        this.io.to(player.socketId).emit('gameStateUpdated', gameState);
      });

      this.io.to(roomId).emit('discardPileTaken', {
        playerId,
        cardCount: game.towerOfSins.cards.length
      });

      console.log(`Jugador ${playerId} tomó la Torre de los Pecados en sala ${roomId}`);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  }

  // Marcar jugador como listo
  setPlayerReady(socket, data) {
    try {
      const { isReady } = data;
      const playerInfo = this.playerSockets.get(socket.id);
      
      if (!playerInfo) {
        throw new Error('Jugador no encontrado');
      }

      const { playerId, roomId } = playerInfo;
      const game = this.games.get(roomId);
      
      if (!game) {
        throw new Error('Juego no encontrado');
      }

      const player = game.players.find(p => p.id === playerId);
      player.isReady = isReady;

      // Notificar a todos los jugadores
      game.players.forEach(player => {
        const gameState = game.getGameState(player.id);
        this.io.to(player.socketId).emit('gameStateUpdated', gameState);
      });

      // Verificar si todos están listos para iniciar
      const allReady = game.players.every(p => p.isReady);
      if (allReady && game.players.length >= 2) {
        this.io.to(roomId).emit('allPlayersReady');
      }
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  }

  // Iniciar juego
  startGame(socket) {
    try {
      const playerInfo = this.playerSockets.get(socket.id);
      
      if (!playerInfo) {
        throw new Error('Jugador no encontrado');
      }

      const { roomId } = playerInfo;
      const game = this.games.get(roomId);
      
      if (!game) {
        throw new Error('Juego no encontrado');
      }

      game.startGame();

      // Notificar a todos los jugadores
      game.players.forEach(player => {
        const gameState = game.getGameState(player.id);
        this.io.to(player.socketId).emit('gameStarted', gameState);
      });

      console.log(`Juego iniciado en sala ${roomId} con mazo ${game.deckType}`);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  }

  // Obtener cartas jugables
  getPlayableCards(socket) {
    try {
      const playerInfo = this.playerSockets.get(socket.id);
      
      if (!playerInfo) {
        throw new Error('Jugador no encontrado');
      }

      const { playerId, roomId } = playerInfo;
      const game = this.games.get(roomId);
      
      if (!game) {
        throw new Error('Juego no encontrado');
      }

      // Usar el ValidationService para obtener información completa
      const validationInfo = this.validationService.getValidationInfo(game, playerId);
      
      socket.emit('playableCards', {
        cards: validationInfo.playableCards,
        canPlay: validationInfo.canPlay,
        currentPhase: validationInfo.currentPhase,
        handSize: validationInfo.handSize,
        faceUpSize: validationInfo.faceUpSize,
        faceDownSize: validationInfo.faceDownSize,
        soulWellSize: validationInfo.soulWellSize,
        isCurrentTurn: validationInfo.isCurrentTurn,
        nextPlayerCanPlayAnything: validationInfo.nextPlayerCanPlayAnything,
        lastPlayedCard: validationInfo.lastPlayedCard,
        discardPileSize: validationInfo.discardPileSize,
        shouldTakeDiscardPile: this.validationService.shouldTakeDiscardPile(game, playerId)
      });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  }

  // Manejar desconexión
  handleDisconnect(socket) {
    const playerInfo = this.playerSockets.get(socket.id);
    
    if (playerInfo) {
      const { playerId, roomId } = playerInfo;
      const game = this.games.get(roomId);
      
      if (game) {
        const player = game.getPlayer(playerId);
        
        if (player) {
          // Guardar estado del jugador para reconexión
          this.disconnectedPlayers.set(playerId, {
            roomId,
            disconnectedAt: new Date(),
            gameState: game.gameState
          });
          
          // Crear token de reconexión
          const reconnectionToken = this.createReconnectionToken(playerId, roomId);
          
          // Solo configurar timeout de inactividad si no estamos en modo test
          if (process.env.TEST_MODE !== 'true') {
            this.startInactivityTimeout(playerId, roomId);
          }
          
          // Marcar jugador como desconectado pero mantenerlo en el juego
          player.isDisconnected = true;
          player.socketId = null;
          
          // Notificar a otros jugadores
          socket.to(roomId).emit('playerDisconnected', {
            playerId,
            playerName: player.name,
            message: 'Jugador desconectado - puede reconectarse'
          });
          
          console.log(`📡 ${player.name} desconectado de la sala ${roomId}`);
          
          // Validar estado del juego
          this.validateGameState(roomId);
        }
      }
      
      this.playerSockets.delete(socket.id);
    }
  }

  // Obtener lista de salas públicas
  getPublicRooms() {
    const publicRooms = [];
    
    for (const [roomId, game] of this.games) {
      if (game.gameState === 'waiting') {
        publicRooms.push(game.getPublicInfo());
      }
    }
    
    return publicRooms;
  }

  // Obtener estadísticas del juego
  getGameStats() {
    const stats = {
      totalGames: 0,
      activeGames: 0,
      waitingGames: 0,
      finishedGames: 0,
      totalPlayers: 0,
      deckTypes: {
        angels: 0,
        demons: 0,
        dragons: 0,
        mages: 0
      }
    };
    
    for (const [roomId, game] of this.games) {
      stats.totalGames++;
      stats.deckTypes[game.deckType]++;
      
      switch (game.gameState) {
        case 'waiting':
          stats.waitingGames++;
          break;
        case 'playing':
          stats.activeGames++;
          break;
        case 'finished':
          stats.finishedGames++;
          break;
      }
      
      stats.totalPlayers += game.players.length;
    }
    
    return stats;
  }

  // Obtener lista de salas públicas
  getPublicRooms() {
    const publicRooms = [];
    
    for (const [roomId, game] of this.games) {
      // Solo incluir salas que no estén llenas y no estén en juego
      if (game.players.length < game.maxPlayers && game.gameState !== 'playing') {
        publicRooms.push({
          id: roomId,
          name: game.roomName || `Sala ${roomId.slice(0, 8)}`,
          playerCount: game.players.length,
          maxPlayers: game.maxPlayers,
          deckType: game.deckType,
          status: game.gameState,
          createdAt: game.createdAt,
          hostName: game.players[0]?.name || 'Desconocido',
          isPrivate: game.isPrivate || false,
          hasPassword: game.hasPassword || false,
          lastActivity: game.lastActivity || game.createdAt
        });
      }
    }
    
    // Ordenar por actividad reciente
    return publicRooms.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
  }

  // Obtener información detallada de una sala
  getRoomInfo(roomId) {
    const game = this.games.get(roomId);
    if (!game) return null;
    
    return {
      id: roomId,
      name: game.roomName || `Sala ${roomId.slice(0, 8)}`,
      playerCount: game.players.length,
      maxPlayers: game.maxPlayers,
      deckType: game.deckType,
      status: game.gameState,
      createdAt: game.createdAt,
      hostName: game.players[0]?.name || 'Desconocido',
      isPrivate: game.isPrivate || false,
      hasPassword: game.hasPassword || false,
      lastActivity: game.lastActivity || game.createdAt,
      players: game.players.map(player => ({
        id: player.id,
        name: player.name,
        isReady: player.isReady,
        isHost: player.id === game.players[0]?.id
      }))
    };
  }

  // Buscar salas por criterios
  searchRooms(criteria = {}) {
    const { deckType, minPlayers, maxPlayers, status, hostName } = criteria;
    let rooms = this.getPublicRooms();
    
    if (deckType) {
      rooms = rooms.filter(room => room.deckType === deckType);
    }
    
    if (minPlayers !== undefined) {
      rooms = rooms.filter(room => room.playerCount >= minPlayers);
    }
    
    if (maxPlayers !== undefined) {
      rooms = rooms.filter(room => room.maxPlayers <= maxPlayers);
    }
    
    if (status) {
      rooms = rooms.filter(room => room.status === 'waiting');
    }
    
    if (hostName) {
      rooms = rooms.filter(room => 
        room.hostName.toLowerCase().includes(hostName.toLowerCase())
      );
    }
    
    return rooms;
  }

  // Sistema de invitaciones por código

  // Generar código de invitación
  generateInvitationCode(roomId, createdBy, options = {}) {
    const { maxUses = 10, expiresIn = this.INVITATION_EXPIRY } = options;
    
    // Generar código único de 6 caracteres
    const code = this.generateUniqueCode();
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + expiresIn);
    
    const invitation = {
      roomId,
      createdBy,
      createdAt,
      expiresAt,
      maxUses,
      currentUses: 0,
      isActive: true
    };
    
    // Guardar invitación
    this.invitationCodes.set(code, invitation);
    
    // Agregar código a la sala
    if (!this.roomInvitations.has(roomId)) {
      this.roomInvitations.set(roomId, new Set());
    }
    this.roomInvitations.get(roomId).add(code);
    
    // Limpiar invitación expirada
    setTimeout(() => {
      this.cleanupExpiredInvitation(code);
    }, expiresIn);
    
    return code;
  }

  // Generar código único
  generateUniqueCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code;
    do {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (this.invitationCodes.has(code));
    
    return code;
  }

  // Validar código de invitación
  validateInvitationCode(code) {
    const invitation = this.invitationCodes.get(code);
    
    if (!invitation) {
      return { isValid: false, error: 'Código de invitación no encontrado' };
    }
    
    if (!invitation.isActive) {
      return { isValid: false, error: 'Código de invitación desactivado' };
    }
    
    if (new Date() > invitation.expiresAt) {
      this.cleanupExpiredInvitation(code);
      return { isValid: false, error: 'Código de invitación expirado' };
    }
    
    if (invitation.currentUses >= invitation.maxUses) {
      return { isValid: false, error: 'Código de invitación agotado' };
    }
    
    const game = this.games.get(invitation.roomId);
    if (!game) {
      this.cleanupExpiredInvitation(code);
      return { isValid: false, error: 'Sala no encontrada' };
    }
    
    if (game.gameState !== 'waiting') {
      return { isValid: false, error: 'La sala ya está en juego' };
    }
    
    if (game.players.length >= game.maxPlayers) {
      return { isValid: false, error: 'La sala está llena' };
    }
    
    return { 
      isValid: true, 
      invitation,
      roomInfo: this.getRoomInfo(invitation.roomId)
    };
  }

  // Usar código de invitación
  useInvitationCode(code, playerName, socketId) {
    const validation = this.validateInvitationCode(code);
    
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }
    
    const { invitation, roomInfo } = validation;
    
    try {
      // Unir jugador a la sala
      const playerId = uuidv4();
      const game = this.games.get(invitation.roomId);
      const player = game.addPlayer(playerId, playerName, socketId);
      
      // Incrementar uso del código
      invitation.currentUses++;
      
      // Desactivar código si se agotó
      if (invitation.currentUses >= invitation.maxUses) {
        invitation.isActive = false;
      }
      
      // Guardar referencias
      this.playerSockets.set(socketId, { playerId, roomId: invitation.roomId });
      
      return {
        success: true,
        roomId: invitation.roomId,
        playerId,
        gameState: game.getGameState(playerId),
        roomInfo
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Obtener invitaciones de una sala
  getRoomInvitations(roomId) {
    const codes = this.roomInvitations.get(roomId) || new Set();
    const invitations = [];
    
    for (const code of codes) {
      const invitation = this.invitationCodes.get(code);
      if (invitation && invitation.isActive) {
        invitations.push({
          code,
          createdAt: invitation.createdAt,
          expiresAt: invitation.expiresAt,
          maxUses: invitation.maxUses,
          currentUses: invitation.currentUses,
          createdBy: invitation.createdBy
        });
      }
    }
    
    return invitations;
  }

  // Desactivar código de invitación
  deactivateInvitationCode(code, deactivatedBy) {
    const invitation = this.invitationCodes.get(code);
    
    if (!invitation) {
      return { success: false, error: 'Código no encontrado' };
    }
    
    // Verificar permisos (solo el creador o anfitrión puede desactivar)
    const game = this.games.get(invitation.roomId);
    if (game && game.players.length > 0) {
      const host = game.players[0];
      if (invitation.createdBy !== deactivatedBy && host.id !== deactivatedBy) {
        return { success: false, error: 'No tienes permisos para desactivar este código' };
      }
    }
    
    invitation.isActive = false;
    
    return { success: true, message: 'Código desactivado exitosamente' };
  }

  // Limpiar invitación expirada
  cleanupExpiredInvitation(code) {
    const invitation = this.invitationCodes.get(code);
    if (invitation) {
      // Remover de la sala
      const roomCodes = this.roomInvitations.get(invitation.roomId);
      if (roomCodes) {
        roomCodes.delete(code);
        if (roomCodes.size === 0) {
          this.roomInvitations.delete(invitation.roomId);
        }
      }
      
      // Remover invitación
      this.invitationCodes.delete(code);
    }
  }

  // Limpiar todas las invitaciones expiradas
  cleanupAllExpiredInvitations() {
    const now = new Date();
    const expiredCodes = [];
    
    for (const [code, invitation] of this.invitationCodes) {
      if (now > invitation.expiresAt) {
        expiredCodes.push(code);
      }
    }
    
    expiredCodes.forEach(code => this.cleanupExpiredInvitation(code));
  }

  // Sistema de configuración de mazos temáticos
  getDeckConfigurations() {
    return this.deckConfigurationService.getAllDefaultConfigurations();
  }

  getEnabledDeckConfigurations() {
    return this.deckConfigurationService.getEnabledConfigurations();
  }

  getDeckConfiguration(deckType) {
    return this.deckConfigurationService.getDefaultConfiguration(deckType);
  }

  createRoomDeckConfiguration(roomId, deckType, customizations = {}) {
    return this.deckConfigurationService.createRoomConfiguration(roomId, deckType, customizations);
  }

  getRoomDeckConfiguration(roomId) {
    return this.deckConfigurationService.getRoomConfiguration(roomId);
  }

  updateRoomDeckConfiguration(roomId, updates) {
    return this.deckConfigurationService.updateRoomConfiguration(roomId, updates);
  }

  modifyDeckCard(roomId, cardId, modifications) {
    return this.deckConfigurationService.modifyCard(roomId, cardId, modifications);
  }

  addDeckCustomRule(roomId, rule) {
    return this.deckConfigurationService.addCustomRule(roomId, rule);
  }

  removeDeckCustomRule(roomId, ruleId) {
    return this.deckConfigurationService.removeCustomRule(roomId, ruleId);
  }

  getConfiguredDeck(roomId) {
    return this.deckConfigurationService.getConfiguredDeck(roomId);
  }

  validateDeckConfiguration(configuration) {
    return this.deckConfigurationService.validateConfiguration(configuration);
  }

  getDeckConfigurationStats() {
    return this.deckConfigurationService.getConfigurationStats();
  }

  exportDeckConfiguration(roomId) {
    return this.deckConfigurationService.exportConfiguration(roomId);
  }

  importDeckConfiguration(roomId, importedConfig) {
    return this.deckConfigurationService.importConfiguration(roomId, importedConfig);
  }

  // Sistema de chat básico en lobby
  createChatRoom(roomId, options = {}) {
    return this.chatService.createChatRoom(roomId, options);
  }

  joinChatRoom(roomId, userId, userInfo = {}) {
    return this.chatService.joinChatRoom(roomId, userId, userInfo);
  }

  leaveChatRoom(roomId, userId) {
    return this.chatService.leaveChatRoom(roomId, userId);
  }

  sendChatMessage(roomId, userId, messageData) {
    return this.chatService.sendMessage(roomId, userId, messageData);
  }

  getChatMessages(roomId, options = {}) {
    return this.chatService.getMessages(roomId, options);
  }

  editChatMessage(roomId, messageId, userId, newContent) {
    return this.chatService.editMessage(roomId, messageId, userId, newContent);
  }

  deleteChatMessage(roomId, messageId, userId, isModerator = false) {
    return this.chatService.deleteMessage(roomId, messageId, userId, isModerator);
  }

  getChatRoomUsers(roomId) {
    return this.chatService.getRoomUsers(roomId);
  }

  getUserChatRooms(userId) {
    return this.chatService.getUserChatRooms(userId);
  }

  searchChatMessages(roomId, query, options = {}) {
    return this.chatService.searchMessages(roomId, query, options);
  }

  updateChatRoomSettings(roomId, settings, userId) {
    return this.chatService.updateRoomSettings(roomId, settings, userId);
  }

  addChatModerator(roomId, userId, addedBy) {
    return this.chatService.addModerator(roomId, userId, addedBy);
  }

  removeChatModerator(roomId, userId, removedBy) {
    return this.chatService.removeModerator(roomId, userId, removedBy);
  }

  getChatStats() {
    return this.chatService.getChatStats();
  }

  // Obtener información de validación
  getValidationInfo(socket) {
    try {
      const playerInfo = this.playerSockets.get(socket.id);
      
      if (!playerInfo) {
        throw new Error('Jugador no encontrado');
      }

      const { playerId, roomId } = playerInfo;
      const game = this.games.get(roomId);
      
      if (!game) {
        throw new Error('Juego no encontrado');
      }

      const validationInfo = this.validationService.getValidationInfo(game, playerId);
      const validationStats = this.validationService.getValidationStats(game);
      
      socket.emit('validationInfo', {
        playerInfo: validationInfo,
        gameStats: validationStats
      });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  }

  // Limpiar juegos antiguos y jugadores desconectados
  cleanupOldGames() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    // Limpiar jugadores desconectados permanentemente
    for (const [playerId, disconnectData] of this.disconnectedPlayers) {
      if (disconnectData.disconnectedAt < fiveMinutesAgo) {
        const game = this.games.get(disconnectData.roomId);
        if (game) {
          const player = game.getPlayer(playerId);
          if (player && player.isDisconnected) {
            console.log(`🧹 Removiendo jugador desconectado permanentemente: ${player.name}`);
            game.removePlayer(playerId);
            
            // Notificar a otros jugadores
            this.io.to(disconnectData.roomId).emit('playerRemoved', {
              playerId,
              playerName: player.name,
              message: 'Jugador removido por desconexión prolongada'
            });
            
            // Si el juego terminó, limpiar
            if (game.gameState === 'finished') {
              this.games.delete(disconnectData.roomId);
            }
          }
        }
        
        // Limpiar datos de desconexión
        this.disconnectedPlayers.delete(playerId);
        this.playerTimeouts.delete(playerId);
        this.playerReconnectionTokens.delete(playerId);
      }
    }
    
    // Limpiar juegos terminados hace más de 1 hora
    for (const [roomId, game] of this.games) {
      if (game.gameState === 'finished' && game.endTime && game.endTime < oneHourAgo) {
        this.games.delete(roomId);
        console.log(`🧹 Juego terminado limpiado: ${roomId}`);
      }
      
      // Limpiar salas vacías en espera
      if (game.gameState === 'waiting' && game.players.length === 0) {
        this.games.delete(roomId);
        console.log(`🧹 Sala vacía limpiada: ${roomId}`);
      }
      
      // Validar estado de juegos activos
      if (game.gameState === 'playing') {
        this.validateGameState(roomId);
      }
    }
  }
}

module.exports = GameService;
