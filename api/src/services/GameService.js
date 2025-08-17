const { v4: uuidv4 } = require('uuid');
const Game = require('../models/Game');
const { THEMATIC_DECKS } = require('../models/Card');
const ValidationService = require('./ValidationService');
const DeckConfigurationService = require('./DeckConfigurationService');
const ChatService = require('./ChatService');
const AIService = require('./AIService');

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
    this.aiService = new AIService();
    
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

  // Agregar bots al juego
  addBotsToGame(game, botCount) {
    const botNames = ['Bot Alpha', 'Bot Beta', 'Bot Gamma', 'Bot Delta', 'Bot Epsilon', 'Bot Zeta'];
    const availableDecks = ['angels', 'demons', 'dragons', 'mages', 'dwarves', 'elves', 'dark_elves', 'orcs'];
    
    for (let i = 0; i < botCount; i++) {
      const botId = uuidv4();
      const botName = botNames[i] || `Bot ${i + 1}`;
      
      // Seleccionar mazo aleatorio para el bot
      const selectedDeck = availableDecks[Math.floor(Math.random() * availableDecks.length)];
      const bot = game.addPlayer(botId, botName, null, selectedDeck); // Los bots no tienen socket
      
      // Marcar bot como listo automáticamente
      bot.isReady = true;
      bot.isBot = true; // Marcar como bot
      
      console.log(`🤖 ${botName} agregado con mazo ${selectedDeck}`);
    }
    
    console.log(`🤖 ${botCount} bots agregados al juego con mazos variados`);
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
      const { playerName, maxPlayers = 6, deckType = THEMATIC_DECKS.ANGELS, gameMode = 'human', botCount = 1 } = data;
      const roomId = uuidv4();
      const playerId = uuidv4();

      // Crear nuevo juego con mazo temático
      const game = new Game(roomId, maxPlayers, deckType);
      const player = game.addPlayer(playerId, playerName, socket.id);
      
      // Actualizar socketId del jugador
      player.socketId = socket.id;
      
      // Guardar referencias
      this.games.set(roomId, game);
      this.playerSockets.set(socket.id, { playerId, roomId });
      
      // Unir socket a la sala
      socket.join(roomId);
      
      // Si es modo bot, agregar bots automáticamente
      if (gameMode === 'bot') {
        this.addBotsToGame(game, botCount);
      }
      
      // Notificar al jugador con el estado actualizado
      socket.emit('roomCreated', {
        roomId,
        playerId,
        gameState: game.getGameState(playerId)
      });

      console.log(`Sala creada: ${roomId} por ${playerName} con mazo ${deckType} (modo: ${gameMode}${gameMode === 'bot' ? `, ${botCount} bots` : ''})`);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  }

  // Unirse a una sala
  joinRoom(socket, data) {
    try {
      const { roomId, playerName, selectedDeck } = data;
      const game = this.games.get(roomId);
      
      if (!game) {
        throw new Error('Sala no encontrada');
      }

      const playerId = uuidv4();
      const player = game.addPlayer(playerId, playerName, socket.id, selectedDeck);
      
      // Actualizar socketId del jugador
      player.socketId = socket.id;
      
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

      console.log(`${playerName} se unió a la sala ${roomId} con mazo ${player.selectedDeck}`);
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

      // En modo solitario, cooperativo o desafío, ejecutar turnos de IA automáticamente
      if ((game.gameMode === 'solo' || game.gameMode === 'coop' || game.gameMode === 'challenge') && game.gameState === 'playing') {
        this.handleAITurns(game, roomId);
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
      const { ready } = data;
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
      player.isReady = ready;

      console.log(`🎯 ${player.name} marcado como ${ready ? 'listo' : 'no listo'}`);

      // Notificar a todos los jugadores
      game.players.forEach(player => {
        const gameState = game.getGameState(player.id);
        if (player.socketId) {
          this.io.to(player.socketId).emit('gameStateUpdate', gameState);
        }
      });

      // Verificar si todos están listos para iniciar
      const allReady = game.players.every(p => p.isReady);
      
      if (allReady && game.players.length >= 2) {
        console.log(`🎉 Todos los jugadores están listos, enviando allPlayersReady`);
        this.io.to(roomId).emit('allPlayersReady');
      }
    } catch (error) {
      console.error('❌ Error en setPlayerReady:', error.message);
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

  // Cambiar mazo de un jugador
  changePlayerDeck(socket, data) {
    try {
      const { playerId, deckType } = data;
      const playerInfo = this.playerSockets.get(socket.id);
      
      if (!playerInfo) {
        throw new Error('Jugador no encontrado');
      }

      const game = this.games.get(playerInfo.roomId);
      if (!game) {
        throw new Error('Juego no encontrado');
      }

      // Verificar que el jugador puede cambiar su propio mazo o es el host
      const requestingPlayer = game.getPlayer(playerInfo.playerId);
      const targetPlayer = game.getPlayer(playerId);
      
      if (!targetPlayer) {
        throw new Error('Jugador objetivo no encontrado');
      }

      if (requestingPlayer.id !== playerId && !requestingPlayer.isHost) {
        throw new Error('No tienes permisos para cambiar el mazo de otro jugador');
      }

      const success = game.changePlayerDeck(playerId, deckType);
      
      if (success) {
        // Notificar a todos los jugadores en la sala
        socket.to(playerInfo.roomId).emit('playerDeckChanged', {
          playerId,
          deckType,
          deckInfo: targetPlayer.getDeckInfo()
        });

        // Notificar al jugador que solicitó el cambio
        socket.emit('deckChanged', {
          playerId,
          deckType,
          deckInfo: targetPlayer.getDeckInfo()
        });

        console.log(`🎴 ${targetPlayer.name} cambió su mazo a: ${deckType}`);
      } else {
        throw new Error('No se pudo cambiar el mazo');
      }
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  }

  // Obtener información de mazos de todos los jugadores
  getPlayersDeckInfo(socket) {
    try {
      const playerInfo = this.playerSockets.get(socket.id);
      if (!playerInfo) {
        throw new Error('Jugador no encontrado');
      }

      const game = this.games.get(playerInfo.roomId);
      if (!game) {
        throw new Error('Juego no encontrado');
      }

      const playersDeckInfo = game.getPlayersDeckInfo();
      socket.emit('playersDeckInfo', { players: playersDeckInfo });
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

  // ==================== MÉTODOS DE IA ====================

  // Obtener sugerencia de IA para el jugador actual
  getAISuggestion(socket, data) {
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

      if (game.gameState !== 'playing') {
        throw new Error('El juego no está en progreso');
      }

      if (game.currentPlayerId !== playerId) {
        throw new Error('No es tu turno');
      }

      const difficulty = data.difficulty || 'intermediate';
      const analysis = this.aiService.analyzeHand(game.getGameState(), playerId, difficulty);
      
      socket.emit('aiSuggestion', {
        analysis,
        difficulty,
        timestamp: new Date()
      });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  }

  // Obtener información de dificultades de IA disponibles
  getAIDifficulties(socket) {
    try {
      const difficulties = this.aiService.getAvailableDifficulties();
      const difficultyInfo = {};
      
      for (const difficulty of difficulties) {
        difficultyInfo[difficulty] = this.aiService.getDifficultyInfo(difficulty);
      }
      
      socket.emit('aiDifficulties', {
        difficulties: difficultyInfo,
        available: difficulties
      });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  }

  // Obtener información de estrategias de mazo
  getDeckStrategies(socket) {
    try {
      const strategies = this.aiService.getAvailableDeckStrategies();
      const strategyInfo = {};
      
      for (const strategy of strategies) {
        strategyInfo[strategy] = this.aiService.getDeckStrategyInfo(strategy);
      }
      
      socket.emit('deckStrategies', {
        strategies: strategyInfo,
        available: strategies
      });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  }

  // Ejecutar turno de IA automáticamente
  executeAITurn(game, playerId, difficulty = 'intermediate') {
    try {
      const gameState = game.getGameState();
      const decision = this.aiService.decideCard(gameState, playerId, difficulty);
      
      if (!decision) {
        // Si no hay cartas jugables, tomar el mazo de descarte
        console.log(`🤖 IA ${playerId} no tiene cartas jugables, tomando mazo de descarte`);
        game.takeDiscardPile(playerId);
        return { action: 'takeDiscardPile', reason: 'No hay cartas jugables' };
      }

      // Jugar la carta seleccionada
      console.log(`🤖 IA ${playerId} jugando carta: ${decision.card.name} (puntuación: ${decision.score})`);
      game.playCard(playerId, decision.index);
      
      return { 
        action: 'playCard', 
        cardIndex: decision.index,
        card: decision.card,
        score: decision.score,
        reason: this.aiService.explainDecision(decision, gameState, difficulty)
      };
    } catch (error) {
      console.error(`Error ejecutando turno de IA: ${error.message}`);
      return { action: 'error', reason: error.message };
    }
  }

  // Configurar jugador como IA
  setPlayerAsAI(roomId, playerId, difficulty = 'intermediate') {
    try {
      const game = this.games.get(roomId);
      if (!game) {
        throw new Error('Juego no encontrado');
      }

      const player = game.getPlayer(playerId);
      if (!player) {
        throw new Error('Jugador no encontrado');
      }

      player.isAI = true;
      player.aiDifficulty = difficulty;
      
      console.log(`🤖 Jugador ${player.name} configurado como IA (${difficulty})`);
      
      // Notificar a otros jugadores
      this.io.to(roomId).emit('playerSetAsAI', {
        playerId,
        playerName: player.name,
        difficulty,
        message: `${player.name} ahora es controlado por IA (${difficulty})`
      });

      return true;
    } catch (error) {
      console.error(`Error configurando IA: ${error.message}`);
      return false;
    }
  }

  // ==================== MODO SOLITARIO ====================

  // Crear sala de modo solitario
  createSoloGame(socket, data) {
    try {
      const { playerName, deckType = 'angels', aiDifficulty = 'intermediate' } = data;
      
      if (!playerName || playerName.trim().length === 0) {
        throw new Error('Nombre de jugador requerido');
      }

      // Crear ID único para la sala
      const roomId = `solo_${uuidv4()}`;
      
      // Crear juego con 4 jugadores (1 humano + 3 IA)
      const game = new Game(roomId, 4, deckType);
      game.gameMode = 'solo'; // Marcar como modo solitario
      
      // Agregar jugador humano
      const humanPlayer = game.addPlayer(uuidv4(), playerName, socket.id);
      humanPlayer.isHuman = true;
      
      // Agregar 3 jugadores IA con mazos variados
      const aiNames = this.generateAINames(deckType);
      const aiDifficulties = this.generateAIDifficulties(aiDifficulty);
      const availableDecks = ['angels', 'demons', 'dragons', 'mages'];
      
      for (let i = 0; i < 3; i++) {
        // Seleccionar mazo aleatorio para cada IA
        const aiDeckType = availableDecks[Math.floor(Math.random() * availableDecks.length)];
        const aiPlayer = game.addPlayer(uuidv4(), aiNames[i], null, aiDeckType);
        aiPlayer.isAI = true;
        aiPlayer.aiDifficulty = aiDifficulties[i];
        aiPlayer.aiPersonality = this.generateAIPersonality(aiDeckType, aiDifficulties[i]);
      }
      
      // Guardar juego
      this.games.set(roomId, game);
      this.playerSockets.set(socket.id, { playerId: humanPlayer.id, roomId });
      
      // Unir socket a la sala
      socket.join(roomId);
      
      console.log(`🎮 Modo solitario creado: ${playerName} vs 3 IA (${deckType})`);
      
      // Notificar al jugador
      socket.emit('soloGameCreated', {
        roomId,
        playerId: humanPlayer.id,
        gameState: game.getGameState(),
        aiPlayers: game.players.filter(p => p.isAI).map(p => ({
          id: p.id,
          name: p.name,
          difficulty: p.aiDifficulty,
          personality: p.aiPersonality
        }))
      });

      return { roomId, playerId: humanPlayer.id };
    } catch (error) {
      console.error(`Error creando modo solitario: ${error.message}`);
      socket.emit('error', { message: error.message });
      return null;
    }
  }

  // Generar nombres para jugadores IA
  generateAINames(deckType) {
    const nameTemplates = {
      angels: ['Gabriel', 'Miguel', 'Rafael', 'Uriel', 'Azrael', 'Metatrón'],
      demons: ['Lucifer', 'Belial', 'Asmodeo', 'Mammón', 'Leviatán', 'Satanás'],
      dragons: ['Drakon', 'Fafnir', 'Smaug', 'Alduin', 'Bahamut', 'Tiamat'],
      mages: ['Merlín', 'Gandalf', 'Dumbledore', 'Morgana', 'Circe', 'Nostradamus']
    };

    const templates = nameTemplates[deckType] || nameTemplates.angels;
    const names = [];
    
    // Seleccionar 3 nombres únicos
    while (names.length < 3) {
      const randomName = templates[Math.floor(Math.random() * templates.length)];
      if (!names.includes(randomName)) {
        names.push(randomName);
      }
    }
    
    return names;
  }

  // Generar dificultades para IA
  generateAIDifficulties(baseDifficulty) {
    const difficulties = ['beginner', 'intermediate', 'advanced', 'expert'];
    const baseIndex = difficulties.indexOf(baseDifficulty);
    
    // Crear una distribución variada de dificultades
    const aiDifficulties = [];
    
    // Una IA con dificultad base
    aiDifficulties.push(baseDifficulty);
    
    // Una IA ligeramente más fácil
    const easierIndex = Math.max(0, baseIndex - 1);
    aiDifficulties.push(difficulties[easierIndex]);
    
    // Una IA ligeramente más difícil
    const harderIndex = Math.min(3, baseIndex + 1);
    aiDifficulties.push(difficulties[harderIndex]);
    
    // Mezclar el orden
    return this.shuffleArray(aiDifficulties);
  }

  // Generar personalidad para IA
  generateAIPersonality(deckType, difficulty) {
    const personalities = {
      angels: {
        beginner: { name: 'Protector Novato', style: 'defensive', aggression: 0.2 },
        intermediate: { name: 'Guardián Celestial', style: 'balanced', aggression: 0.4 },
        advanced: { name: 'Arcángel Estratégico', style: 'tactical', aggression: 0.6 },
        expert: { name: 'Serafín Supremo', style: 'master', aggression: 0.8 }
      },
      demons: {
        beginner: { name: 'Diablillo Aprendiz', style: 'chaotic', aggression: 0.6 },
        intermediate: { name: 'Demonio Astuto', style: 'aggressive', aggression: 0.7 },
        advanced: { name: 'Señor del Infierno', style: 'ruthless', aggression: 0.8 },
        expert: { name: 'Príncipe de las Tinieblas', style: 'brutal', aggression: 0.9 }
      },
      dragons: {
        beginner: { name: 'Dragón Joven', style: 'proud', aggression: 0.5 },
        intermediate: { name: 'Dragón Ancestral', style: 'dominant', aggression: 0.6 },
        advanced: { name: 'Dragón Sabio', style: 'calculated', aggression: 0.7 },
        expert: { name: 'Dragón Legendario', style: 'overwhelming', aggression: 0.8 }
      },
      mages: {
        beginner: { name: 'Aprendiz de Magia', style: 'curious', aggression: 0.3 },
        intermediate: { name: 'Mago Experto', style: 'strategic', aggression: 0.5 },
        advanced: { name: 'Archimago', style: 'manipulative', aggression: 0.6 },
        expert: { name: 'Mago Supremo', style: 'omniscient', aggression: 0.7 }
      }
    };

    return personalities[deckType]?.[difficulty] || personalities.angels.intermediate;
  }

  // Mezclar array
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Ejecutar turno de IA (solitario y cooperativo)
  executeAITurn(game, playerId) {
    try {
      const player = game.getPlayer(playerId);
      if (!player || !player.isAI) {
        return { action: 'error', reason: 'Jugador no es IA' };
      }

      // Aplicar personalidad de la IA
      const personality = player.aiPersonality;
      const baseDecision = this.aiService.decideCard(game.getGameState(), playerId, player.aiDifficulty);
      
      if (!baseDecision) {
        // Si no hay cartas jugables, tomar el mazo de descarte
        console.log(`🤖 ${player.name} (${personality.name}) no tiene cartas jugables, tomando mazo de descarte`);
        game.takeDiscardPile(playerId);
        return { 
          action: 'takeDiscardPile', 
          reason: 'No hay cartas jugables',
          playerName: player.name,
          personality: personality.name
        };
      }

      // Aplicar personalidad a la decisión
      const adjustedDecision = this.applyPersonalityToDecision(baseDecision, personality, game.getGameState());
      
      // Jugar la carta seleccionada
      console.log(`🤖 ${player.name} (${personality.name}) jugando carta: ${adjustedDecision.card.name} (${adjustedDecision.reason})`);
      game.playCard(playerId, adjustedDecision.index);
      
      return { 
        action: 'playCard', 
        cardIndex: adjustedDecision.index,
        card: adjustedDecision.card,
        reason: adjustedDecision.reason,
        playerName: player.name,
        personality: personality.name,
        difficulty: player.aiDifficulty
      };
    } catch (error) {
      console.error(`Error ejecutando turno de IA: ${error.message}`);
      return { action: 'error', reason: error.message };
    }
  }

  // Aplicar personalidad a la decisión de IA
  applyPersonalityToDecision(decision, personality, gameState) {
    let adjustedDecision = { ...decision };
    
    // Ajustar según el estilo de personalidad
    switch (personality.style) {
      case 'defensive':
        // Preferir cartas de bajo valor y defensivas
        if (decision.card.value <= 5) {
          adjustedDecision.reason = `${decision.reason} (estilo defensivo)`;
        }
        break;
        
      case 'aggressive':
        // Preferir cartas de alto valor y ofensivas
        if (decision.card.value >= 8) {
          adjustedDecision.reason = `${decision.reason} (estilo agresivo)`;
        }
        break;
        
      case 'tactical':
        // Preferir cartas especiales
        if (decision.card.isSpecial) {
          adjustedDecision.reason = `${decision.reason} (estilo táctico)`;
        }
        break;
        
      case 'chaotic':
        // A veces tomar decisiones aleatorias
        if (Math.random() < 0.3) {
          const playableCards = this.aiService.getPlayableCards(gameState, gameState.players.find(p => p.id === decision.playerId)?.hand || []);
          if (playableCards.length > 1) {
            const randomIndex = Math.floor(Math.random() * playableCards.length);
            adjustedDecision = playableCards[randomIndex];
            adjustedDecision.reason = 'Decisión caótica';
          }
        }
        break;
        
      default:
        adjustedDecision.reason = decision.reason;
    }
    
    return adjustedDecision;
  }

  // Obtener información del modo solitario
  getSoloGameInfo(roomId) {
    try {
      const game = this.games.get(roomId);
      if (!game || game.gameMode !== 'solo') {
        throw new Error('Juego solitario no encontrado');
      }

      const humanPlayer = game.players.find(p => p.isHuman);
      const aiPlayers = game.players.filter(p => p.isAI);

      return {
        roomId,
        gameMode: 'solo',
        humanPlayer: {
          id: humanPlayer.id,
          name: humanPlayer.name,
          handSize: humanPlayer.hand.length,
          score: humanPlayer.score
        },
        aiPlayers: aiPlayers.map(p => ({
          id: p.id,
          name: p.name,
          difficulty: p.aiDifficulty,
          personality: p.aiPersonality,
          handSize: p.hand.length,
          score: p.score
        })),
        gameState: game.gameState,
        currentPlayerId: game.currentPlayerId,
        deckType: game.deckType
      };
    } catch (error) {
      console.error(`Error obteniendo información de modo solitario: ${error.message}`);
      return null;
    }
  }

  // ==================== MODO COOPERATIVO ====================

  // Crear sala de modo cooperativo
  createCoopGame(socket, data) {
    try {
      const { playerName, deckType = 'angels', aiDifficulty = 'intermediate', maxPlayers = 2 } = data;
      
      if (!playerName || playerName.trim().length === 0) {
        throw new Error('Nombre de jugador requerido');
      }

      // Crear ID único para la sala
      const roomId = `coop_${uuidv4()}`;
      
      // Crear juego con 4 jugadores (2 humanos + 2 IA)
      const game = new Game(roomId, 4, deckType);
      game.gameMode = 'coop'; // Marcar como modo cooperativo
      game.maxHumanPlayers = maxPlayers; // Máximo 2 jugadores humanos
      
      // Agregar primer jugador humano
      const humanPlayer = game.addPlayer(uuidv4(), playerName, socket.id);
      humanPlayer.isHuman = true;
      humanPlayer.isHost = true; // El primer jugador es el host
      
      // Agregar 2 jugadores IA con mazos variados
      const aiNames = this.generateAINames(deckType);
      const aiDifficulties = this.generateAIDifficulties(aiDifficulty);
      const availableDecks = ['angels', 'demons', 'dragons', 'mages'];
      
      for (let i = 0; i < 2; i++) {
        // Seleccionar mazo aleatorio para cada IA
        const aiDeckType = availableDecks[Math.floor(Math.random() * availableDecks.length)];
        const aiPlayer = game.addPlayer(uuidv4(), aiNames[i], null, aiDeckType);
        aiPlayer.isAI = true;
        aiPlayer.aiDifficulty = aiDifficulties[i];
        aiPlayer.aiPersonality = this.generateAIPersonality(aiDeckType, aiDifficulties[i]);
      }
      
      // Guardar juego
      this.games.set(roomId, game);
      this.playerSockets.set(socket.id, { playerId: humanPlayer.id, roomId });
      
      // Unir socket a la sala
      socket.join(roomId);
      
      console.log(`🎮 Modo cooperativo creado: ${playerName} vs 2 IA (${deckType})`);
      
      // Notificar al jugador
      socket.emit('coopGameCreated', {
        roomId,
        playerId: humanPlayer.id,
        gameState: game.getGameState(),
        aiPlayers: game.players.filter(p => p.isAI).map(p => ({
          id: p.id,
          name: p.name,
          difficulty: p.aiDifficulty,
          personality: p.aiPersonality
        })),
        maxHumanPlayers: maxPlayers,
        currentHumanPlayers: 1
      });

      return { roomId, playerId: humanPlayer.id };
    } catch (error) {
      console.error(`Error creando modo cooperativo: ${error.message}`);
      socket.emit('error', { message: error.message });
      return null;
    }
  }

  // Unirse a juego cooperativo existente
  joinCoopGame(socket, data) {
    try {
      const { roomId, playerName } = data;
      
      if (!playerName || playerName.trim().length === 0) {
        throw new Error('Nombre de jugador requerido');
      }

      const game = this.games.get(roomId);
      if (!game || game.gameMode !== 'coop') {
        throw new Error('Juego cooperativo no encontrado');
      }

      // Verificar si hay espacio para más jugadores humanos
      const humanPlayers = game.players.filter(p => p.isHuman);
      if (humanPlayers.length >= game.maxHumanPlayers) {
        throw new Error('Sala llena de jugadores humanos');
      }

      // Verificar si el juego ya comenzó
      if (game.gameState !== 'waiting') {
        throw new Error('El juego ya ha comenzado');
      }

      // Agregar jugador humano
      const humanPlayer = game.addPlayer(uuidv4(), playerName, socket.id);
      humanPlayer.isHuman = true;
      
      // Guardar socket del jugador
      this.playerSockets.set(socket.id, { playerId: humanPlayer.id, roomId });
      
      // Unir socket a la sala
      socket.join(roomId);
      
      console.log(`👥 Jugador ${playerName} se unió al modo cooperativo en ${roomId}`);
      
      // Notificar al jugador que se unió
      socket.emit('joinedCoopGame', {
        roomId,
        playerId: humanPlayer.id,
        gameState: game.getGameState(),
        aiPlayers: game.players.filter(p => p.isAI).map(p => ({
          id: p.id,
          name: p.name,
          difficulty: p.aiDifficulty,
          personality: p.aiPersonality
        })),
        humanPlayers: game.players.filter(p => p.isHuman).map(p => ({
          id: p.id,
          name: p.name,
          isHost: p.isHost
        }))
      });

      // Notificar a otros jugadores
      socket.to(roomId).emit('playerJoinedCoopGame', {
        playerId: humanPlayer.id,
        playerName: humanPlayer.name,
        humanPlayers: game.players.filter(p => p.isHuman).map(p => ({
          id: p.id,
          name: p.name,
          isHost: p.isHost
        }))
      });

      return { roomId, playerId: humanPlayer.id };
    } catch (error) {
      console.error(`Error uniéndose al modo cooperativo: ${error.message}`);
      socket.emit('error', { message: error.message });
      return null;
    }
  }

  // Obtener información del modo cooperativo
  getCoopGameInfo(roomId) {
    try {
      const game = this.games.get(roomId);
      if (!game || game.gameMode !== 'coop') {
        throw new Error('Juego cooperativo no encontrado');
      }

      const humanPlayers = game.players.filter(p => p.isHuman);
      const aiPlayers = game.players.filter(p => p.isAI);

      return {
        roomId,
        gameMode: 'coop',
        humanPlayers: humanPlayers.map(p => ({
          id: p.id,
          name: p.name,
          isHost: p.isHost,
          handSize: p.hand.length,
          score: p.score
        })),
        aiPlayers: aiPlayers.map(p => ({
          id: p.id,
          name: p.name,
          difficulty: p.aiDifficulty,
          personality: p.aiPersonality,
          handSize: p.hand.length,
          score: p.score
        })),
        gameState: game.gameState,
        currentPlayerId: game.currentPlayerId,
        deckType: game.deckType,
        maxHumanPlayers: game.maxHumanPlayers,
        currentHumanPlayers: humanPlayers.length
      };
    } catch (error) {
      console.error(`Error obteniendo información de modo cooperativo: ${error.message}`);
      return null;
    }
  }

  // Obtener lista de juegos cooperativos disponibles
  getAvailableCoopGames() {
    const coopGames = [];
    
    for (const [roomId, game] of this.games) {
      if (game.gameMode === 'coop' && game.gameState === 'waiting') {
        const humanPlayers = game.players.filter(p => p.isHuman);
        const aiPlayers = game.players.filter(p => p.isAI);
        
        coopGames.push({
          roomId,
          deckType: game.deckType,
          aiDifficulty: aiPlayers[0]?.aiDifficulty || 'intermediate',
          humanPlayers: humanPlayers.length,
          maxHumanPlayers: game.maxHumanPlayers,
          hostName: humanPlayers.find(p => p.isHost)?.name || 'Desconocido',
          createdAt: game.createdAt || new Date()
        });
      }
    }
    
    return coopGames.sort((a, b) => b.createdAt - a.createdAt);
  }

  // ==================== MODO DESAFÍO ====================

  // Crear sala de modo desafío
  createChallengeGame(socket, data) {
    try {
      const { playerName, deckType = 'angels', challengeLevel = 'expert' } = data;
      
      if (!playerName || playerName.trim().length === 0) {
        throw new Error('Nombre de jugador requerido');
      }

      // Crear ID único para la sala
      const roomId = `challenge_${uuidv4()}`;
      
      // Crear juego con 2 jugadores (1 humano + 1 IA experta)
      const game = new Game(roomId, 2, deckType);
      game.gameMode = 'challenge'; // Marcar como modo desafío
      game.challengeLevel = challengeLevel; // Nivel de desafío
      
      // Agregar jugador humano
      const humanPlayer = game.addPlayer(uuidv4(), playerName, socket.id);
      humanPlayer.isHuman = true;
      
      // Agregar IA experta con personalidad especial
      const aiNames = this.generateAINames(deckType);
      const aiPlayer = game.addPlayer(uuidv4(), aiNames[0], null, deckType);
      aiPlayer.isAI = true;
      aiPlayer.aiDifficulty = challengeLevel;
      aiPlayer.aiPersonality = this.generateChallengePersonality(deckType, challengeLevel);
      aiPlayer.isChallengeAI = true; // Marcar como IA de desafío
      
      // Guardar juego
      this.games.set(roomId, game);
      this.playerSockets.set(socket.id, { playerId: humanPlayer.id, roomId });
      
      // Unir socket a la sala
      socket.join(roomId);
      
      console.log(`⚔️ Modo desafío creado: ${playerName} vs IA ${challengeLevel} (${deckType})`);
      
      // Notificar al jugador
      socket.emit('challengeGameCreated', {
        roomId,
        playerId: humanPlayer.id,
        gameState: game.getGameState(),
        aiPlayer: {
          id: aiPlayer.id,
          name: aiPlayer.name,
          difficulty: aiPlayer.aiDifficulty,
          personality: aiPlayer.aiPersonality,
          challengeLevel: challengeLevel
        },
        challengeLevel: challengeLevel
      });

      return { roomId, playerId: humanPlayer.id };
    } catch (error) {
      console.error(`Error creando modo desafío: ${error.message}`);
      socket.emit('error', { message: error.message });
      return null;
    }
  }

  // Generar personalidad especial para IA de desafío
  generateChallengePersonality(deckType, challengeLevel) {
    const basePersonalities = {
      angels: {
        name: 'Arcángel Miguel',
        style: 'Defensivo Celestial',
        aggression: 0.3,
        special: 'Purificación Divina'
      },
      demons: {
        name: 'Lucifer',
        style: 'Infernal Agresivo',
        aggression: 0.9,
        special: 'Corrupción Total'
      },
      dragons: {
        name: 'Bahamut',
        style: 'Destructor Supremo',
        aggression: 0.8,
        special: 'Aliento Devastador'
      },
      mages: {
        name: 'Merlín',
        style: 'Arcano Maestro',
        aggression: 0.6,
        special: 'Hechizos Prohibidos'
      }
    };

    const base = basePersonalities[deckType] || basePersonalities.angels;
    
    // Ajustar según nivel de desafío
    const levelMultipliers = {
      'expert': { aggression: 1.2, name: base.name },
      'master': { aggression: 1.5, name: `${base.name} (Maestro)` },
      'legendary': { aggression: 2.0, name: `${base.name} (Legendario)` }
    };

    const multiplier = levelMultipliers[challengeLevel] || levelMultipliers.expert;
    
    return {
      name: multiplier.name,
      style: base.style,
      aggression: Math.min(base.aggression * multiplier.aggression, 1.0),
      special: base.special,
      challengeLevel: challengeLevel,
      isChallengeAI: true
    };
  }

  // Obtener información del modo desafío
  getChallengeGameInfo(roomId) {
    try {
      const game = this.games.get(roomId);
      if (!game || game.gameMode !== 'challenge') {
        throw new Error('Juego de desafío no encontrado');
      }

      const humanPlayer = game.players.find(p => p.isHuman);
      const aiPlayer = game.players.find(p => p.isAI);

      return {
        roomId,
        gameMode: 'challenge',
        humanPlayer: {
          id: humanPlayer.id,
          name: humanPlayer.name,
          handSize: humanPlayer.hand.length,
          score: humanPlayer.score
        },
        aiPlayer: {
          id: aiPlayer.id,
          name: aiPlayer.name,
          difficulty: aiPlayer.aiDifficulty,
          personality: aiPlayer.aiPersonality,
          handSize: aiPlayer.hand.length,
          score: aiPlayer.score,
          challengeLevel: game.challengeLevel
        },
        gameState: game.gameState,
        currentPlayerId: game.currentPlayerId,
        deckType: game.deckType,
        challengeLevel: game.challengeLevel
      };
    } catch (error) {
      console.error(`Error obteniendo información de modo desafío: ${error.message}`);
      return null;
    }
  }

  // Ejecutar turno de IA en modo desafío (más agresivo)
  executeChallengeAITurn(game, playerId) {
    try {
      const player = game.getPlayer(playerId);
      if (!player || !player.isAI || !player.isChallengeAI) {
        return { action: 'error', reason: 'Jugador no es IA de desafío' };
      }

      // Personalidad especial de desafío
      const personality = player.aiPersonality;
      const baseDecision = this.aiService.decideCard(game.getGameState(), playerId, player.aiDifficulty);
      
      if (!baseDecision) {
        // En modo desafío, la IA es más agresiva al tomar el mazo
        console.log(`⚔️ ${player.name} (${personality.name}) no tiene cartas jugables, tomando mazo de descarte`);
        game.takeDiscardPile(playerId);
        return { 
          action: 'takeDiscardPile', 
          reason: 'Estrategia de desafío: acumular cartas',
          playerName: player.name,
          personality: personality.name,
          challengeLevel: personality.challengeLevel
        };
      }

      // Aplicar personalidad de desafío (más agresiva)
      const challengeDecision = this.applyChallengePersonality(baseDecision, personality, game.getGameState());
      
      // Jugar la carta seleccionada
      console.log(`⚔️ ${player.name} (${personality.name}) jugando carta: ${challengeDecision.card.name} (${challengeDecision.reason})`);
      game.playCard(playerId, challengeDecision.index);
      
      return { 
        action: 'playCard', 
        cardIndex: challengeDecision.index,
        card: challengeDecision.card,
        reason: challengeDecision.reason,
        playerName: player.name,
        personality: personality.name,
        difficulty: player.aiDifficulty,
        challengeLevel: personality.challengeLevel
      };
    } catch (error) {
      console.error(`Error ejecutando turno de IA de desafío: ${error.message}`);
      return { action: 'error', reason: error.message };
    }
  }

  // Aplicar personalidad de desafío a la decisión
  applyChallengePersonality(decision, personality, gameState) {
    const adjustedDecision = { ...decision };
    
    // En modo desafío, la IA es más agresiva
    if (personality.challengeLevel === 'master') {
      // Maestro: prioriza cartas de alto valor y efectos especiales
      adjustedDecision.reason = `[MAESTRO] ${decision.reason} - Estrategia superior`;
    } else if (personality.challengeLevel === 'legendary') {
      // Legendario: máxima agresividad y estrategia compleja
      adjustedDecision.reason = `[LEGENDARIO] ${decision.reason} - Dominio total`;
    } else {
      // Experto: estrategia avanzada
      adjustedDecision.reason = `[EXPERTA] ${decision.reason} - Desafío intenso`;
    }
    
    return adjustedDecision;
  }

  // Manejar turnos automáticos de IA (solitario y cooperativo)
  handleAITurns(game, roomId) {
    // Usar setTimeout para dar tiempo a que se procesen los eventos
    setTimeout(() => {
      this.processAITurns(game, roomId);
    }, 1000); // 1 segundo de delay entre turnos
  }

  // Procesar turnos de IA (solitario y cooperativo)
  processAITurns(game, roomId) {
    try {
      // Verificar si el juego sigue activo
      if (game.gameState !== 'playing') {
        return;
      }

      const currentPlayer = game.players[game.currentPlayerIndex];
      
      // Si el jugador actual es IA, ejecutar su turno
      if (currentPlayer && currentPlayer.isAI) {
        console.log(`🤖 Turno de IA: ${currentPlayer.name} (${currentPlayer.aiPersonality.name})`);
        
        let aiResult;
        if (currentPlayer.isChallengeAI) {
          // IA de desafío con comportamiento especial
          aiResult = this.executeChallengeAITurn(game, currentPlayer.id);
        } else {
          // IA normal
          aiResult = this.executeAITurn(game, currentPlayer.id);
        }
        
        // Notificar la acción de la IA
        this.io.to(roomId).emit('aiAction', {
          playerId: currentPlayer.id,
          playerName: currentPlayer.name,
          personality: currentPlayer.aiPersonality.name,
          action: aiResult.action,
          card: aiResult.card,
          reason: aiResult.reason,
          difficulty: currentPlayer.aiDifficulty,
          challengeLevel: currentPlayer.aiPersonality.challengeLevel,
          isChallengeAI: currentPlayer.isChallengeAI
        });

        // Actualizar estado del juego para todos los jugadores
        game.players.forEach(player => {
          if (player.socketId) { // Solo actualizar jugadores humanos
            const gameState = game.getGameState(player.id);
            this.io.to(player.socketId).emit('gameStateUpdated', gameState);
          }
        });

        // Notificar cambio de turno
        this.io.to(roomId).emit('turnChanged', {
          turnInfo: game.getTurnInfo(),
          previousPlayerId: currentPlayer.id,
          nextPlayerId: game.players[game.currentPlayerIndex]?.id
        });

        // Verificar si el juego terminó
        if (game.gameState === 'finished') {
          const gameMode = game.gameMode === 'solo' ? 'solitario' : 'cooperativo';
          console.log(`🎮 Juego ${gameMode} terminado en sala ${roomId}`);
          
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
          return;
        }

        // Continuar con el siguiente turno de IA si es necesario
        const nextPlayer = game.players[game.currentPlayerIndex];
        if (nextPlayer && nextPlayer.isAI) {
          // Delay antes del siguiente turno de IA
          setTimeout(() => {
            this.processAITurns(game, roomId);
          }, 2000); // 2 segundos entre turnos de IA
        }
      }
    } catch (error) {
      console.error(`Error procesando turnos de IA: ${error.message}`);
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
