'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { io, Socket } from 'socket.io-client'
import { ArrowLeft, Users, Clock, Crown, AlertCircle, Cpu } from 'lucide-react'
import Link from 'next/link'
import PlayerArea from '@/components/PlayerArea'
import GameCard from '@/components/GameCard'

interface GameState {
  roomId: string;
  gameState: 'waiting' | 'playing' | 'finished';
  currentPlayerId: string | null;
  players: Player[];
  deckSize: number;
  discardPile: any[];
  lastPlayedCard: any | null;
  nextPlayerCanPlayAnything: boolean;
  skippedPlayer: string | null;
  winner: Player | null;
  sinner: Player | null;
  turnTime: number;
  deckType: string;
}

interface Player {
  id: string;
  name: string;
  hand: any[];
  faceUpCreatures: any[];
  faceDownCreatures: any[];
  soulWell: any[];
  currentPhase: 'hand' | 'faceUp' | 'faceDown';
  health: number;
  hasShield: boolean;
  isReady: boolean;
  isAlive: boolean;
  score: number;
  isSinner: boolean;
  handSize: number;
  soulWellSize: number;
}

export default function GamePage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [gameMode, setGameMode] = useState<'human' | 'bot'>('human');
  const [botCount, setBotCount] = useState(1);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io('http://localhost:5001');
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('gameStateUpdate', (data: GameState) => {
      setGameState(data);
      setError(null);
    });

    socket.on('roomCreated', (data: { roomId: string; playerId: string; gameState: GameState }) => {
      setRoomId(data.roomId);
      setCurrentPlayerId(data.playerId);
      setGameState(data.gameState);
      setError(null);
    });

    socket.on('roomJoined', (data: { roomId: string; playerId: string; gameState: GameState }) => {
      setRoomId(data.roomId);
      setCurrentPlayerId(data.playerId);
      setGameState(data.gameState);
      setError(null);
    });

    socket.on('gameStarted', (data: GameState) => {
      setGameState(data);
      setError(null);
    });

    socket.on('playerJoined', (data: { player: any }) => {
      // Actualizar el estado del juego cuando otro jugador se une
      if (gameState) {
        setGameState({ ...gameState });
      }
    });

    socket.on('timeUpdate', (data: { timeLeft: number }) => {
      setTimeLeft(data.timeLeft);
    });

    socket.on('error', (data: { message: string }) => {
      setError(data.message);
    });

    return () => {
      socket.off('gameStateUpdate');
      socket.off('roomCreated');
      socket.off('roomJoined');
      socket.off('gameStarted');
      socket.off('playerJoined');
      socket.off('timeUpdate');
      socket.off('error');
    };
  }, [socket]);
  const handleCardClick = (cardIndex: number) => {
    if (!gameState || gameState.gameState !== 'playing') return;
    const currentPlayer = gameState?.players?.find((p) => p.id === currentPlayerId);
    if (!currentPlayer || !currentPlayer.hand || currentPlayer.hand.length <= cardIndex) return;
    const card = currentPlayer.hand[cardIndex];
    if (card.type === 'hechizo' || card.type === 'trampa') {
      setSelectedCard(cardIndex);
    } else {
      handleDiscard(cardIndex);
    }
  };

  const handleTargetSelect = (targetPlayerId: string) => {
    if (selectedCard !== null) {
      playCard(selectedCard, targetPlayerId);
    }
  };

  const handleDiscard = (cardIndex: number) => {
    if (!socket || !gameState || gameState.gameState !== 'playing') return;
    socket.emit('discardCard', { cardIndex });
    setSelectedCard(null);
  };

  const playCard = (cardIndex: number, targetPlayerId?: string) => {
    if (!socket || !gameState || gameState.gameState !== 'playing') return;
    socket.emit('playCard', { cardIndex, targetPlayerId });
    setSelectedCard(null);
  };

  const setReady = (ready: boolean) => {
    if (!socket) return;
    socket.emit('setPlayerReady', { ready });
  };

  const startGame = () => {
    if (!socket) return;
    socket.emit('startGame');
  };

  const currentPlayer = gameState?.players?.find((p) => p.id === currentPlayerId);
  const isMyTurn = gameState?.currentPlayerId === currentPlayerId;

  // Loading or error state
  if (error) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="card p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p className="text-secondary-300 mb-4">{error}</p>
          <Link href="/" className="btn-primary">
            Volver al Menú
          </Link>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="card p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-center">Unirse al Juego</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tu Nombre</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Ingresa tu nombre"
                className="w-full p-3 bg-secondary-700 border border-secondary-600 rounded-lg focus:outline-none focus:border-primary-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">ID de Sala (opcional)</label>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Deja vacío para crear una nueva sala"
                className="w-full p-3 bg-secondary-700 border border-secondary-600 rounded-lg focus:outline-none focus:border-primary-400"
              />
            </div>

            {!roomId.trim() && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Modo de Juego</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setGameMode('human')}
                      className={`p-3 rounded-lg border transition-colors ${
                        gameMode === 'human'
                          ? 'bg-primary-600 border-primary-400 text-white'
                          : 'bg-secondary-700 border-secondary-600 text-secondary-300 hover:bg-secondary-600'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>Multijugador</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setGameMode('bot')}
                      className={`p-3 rounded-lg border transition-colors ${
                        gameMode === 'bot'
                          ? 'bg-primary-600 border-primary-400 text-white'
                          : 'bg-secondary-700 border-secondary-600 text-secondary-300 hover:bg-secondary-600'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <Cpu className="w-4 h-4" />
                        <span>vs Bots</span>
                      </div>
                    </button>
                  </div>
                </div>

                {gameMode === 'bot' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Número de Bots</label>
                    <div className="flex space-x-2">
                      {[1, 2, 3].map((count) => (
                        <button
                          key={count}
                          onClick={() => setBotCount(count)}
                          className={`flex-1 p-3 rounded-lg border transition-colors ${
                            botCount === count
                              ? 'bg-accent-600 border-accent-400 text-white'
                              : 'bg-secondary-700 border-secondary-600 text-secondary-300 hover:bg-secondary-600'
                          }`}
                        >
                          {count} Bot{count > 1 ? 'es' : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="flex space-x-4">
              <button
                onClick={() => {
                  if (!playerName.trim()) {
                    setError('Por favor ingresa tu nombre');
                    return;
                  }
                  if (roomId.trim()) {
                    // Unirse a sala existente
                    socket?.emit('joinRoom', { roomId: roomId.trim(), playerName: playerName.trim() });
                  } else {
                    // Crear nueva sala
                    const roomData: any = { 
                      playerName: playerName.trim(),
                      gameMode: gameMode
                    };
                    
                    if (gameMode === 'bot') {
                      roomData.botCount = botCount;
                    }
                    
                    socket?.emit('createRoom', roomData);
                  }
                }}
                disabled={!socket || !playerName.trim()}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {roomId.trim() ? 'Unirse a Sala' : 'Crear Sala'}
              </button>
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Game Screen
  return (
    <div className="min-h-screen p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link href="/" className="btn-secondary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Salir
          </Link>
          <div className="text-sm text-secondary-300">Sala: {roomId}</div>
        </div>
        <div className="flex items-center space-x-4">
          {gameState?.gameState === 'playing' && (
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="w-4 h-4" />
              <span>{timeLeft}s</span>
            </div>
          )}
          <div className="flex items-center space-x-2 text-sm">
            <Users className="w-4 h-4" />
            <span>{gameState?.players?.length || 0}/4</span>
          </div>
        </div>
      </div>

      <div className="game-board">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {gameState?.players
            ?.filter((player) => player.id !== currentPlayerId)
            .map((player, index) => (
              <PlayerArea key={player.id} player={player} isMyTurn={player.id === gameState.currentPlayerId} />
            ))}
        </div>

        {currentPlayer && (
          <PlayerArea
            player={currentPlayer}
            isCurrentPlayer={true}
            isMyTurn={isMyTurn}
            onCardClick={handleCardClick}
            showHand={true}
          />
        )}

        <AnimatePresence>
          {selectedCard !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="card p-6 max-w-md w-full mx-4"
              >
                <h3 className="text-xl font-bold mb-4">Selecciona un objetivo</h3>
                <div className="space-y-2">
                  {gameState?.players
                    ?.filter((player) => player.id !== currentPlayerId)
                    .map((player) => (
                      <button
                        key={player.id}
                        onClick={() => handleTargetSelect(player.id)}
                        className="w-full p-3 text-left bg-secondary-700 hover:bg-secondary-600 rounded-lg transition-colors"
                      >
                        {player.name}
                      </button>
                    ))}
                </div>
                <button onClick={() => setSelectedCard(null)} className="btn-secondary w-full mt-4">
                  Cancelar
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {gameState?.gameState === 'waiting' && (
          <div className="mt-6 flex justify-center space-x-4">
            <button onClick={() => setReady(!currentPlayer?.isReady)} className={`btn-${currentPlayer?.isReady ? 'accent' : 'primary'}`}>
              {currentPlayer?.isReady ? 'Listo ✓' : 'Marcar como Listo'}
            </button>
            {gameState?.players?.every((p) => p.isReady) && gameState?.players?.length >= 2 && (
              <button onClick={startGame} className="btn-accent">
                Iniciar Juego
              </button>
            )}
          </div>
        )}

        {gameState?.gameState === 'finished' && gameState.winner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <div className="card p-8 text-center max-w-md">
              <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">¡Juego Terminado!</h2>
              <p className="text-lg mb-4">
                Ganador: <span className="text-primary-400 font-bold">{gameState.winner.name}</span>
              </p>
              <Link href="/" className="btn-primary">
                Volver al Menú
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
