import { useState, useEffect, useCallback } from 'react'
import { Socket } from 'socket.io-client'

export interface GameState {
  roomId: string
  gameState: 'waiting' | 'playing' | 'finished'
  currentPlayerId: string | null
  players: Player[]
  deckSize: number
  discardPile: any[]
  lastPlayedCard: any | null
  nextPlayerCanPlayAnything: boolean
  skippedPlayer: string | null
  winner: Player | null
  sinner: Player | null
  turnTime: number
  deckType: string
  towerOfSins: {
    cardCount: number
    lastPlayedCard: any | null
    purificationCount: number
    isDangerous: boolean
  }
}

export interface Player {
  id: string
  name: string
  hand: any[]
  faceUpCreatures: any[]
  faceDownCreatures: any[]
  soulWell: any[]
  currentPhase: 'hand' | 'faceUp' | 'faceDown'
  health: number
  hasShield: boolean
  isReady: boolean
  isAlive: boolean
  score: number
  isSinner: boolean
  handSize: number
  soulWellSize: number
  isDisconnected?: boolean
}

interface UseGameOptions {
  socket: Socket | null
  enabled?: boolean
}

export function useGame({ socket, enabled = true }: UseGameOptions) {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [playableCards, setPlayableCards] = useState<any[]>([])
  const [validationInfo, setValidationInfo] = useState<any>(null)

  // Socket event listeners
  useEffect(() => {
    if (!socket || !enabled) return

    const handleGameStateUpdate = (data: GameState) => {
      setGameState(data)
      setError(null)
    }

    const handleRoomCreated = (data: { roomId: string; playerId: string; gameState: GameState }) => {
      setCurrentPlayerId(data.playerId)
      setGameState(data.gameState)
      setError(null)
    }

    const handleRoomJoined = (data: { roomId: string; playerId: string; gameState: GameState }) => {
      setCurrentPlayerId(data.playerId)
      setGameState(data.gameState)
      setError(null)
    }

    const handleGameStarted = (data: GameState) => {
      setGameState(data)
      setError(null)
    }

    const handlePlayableCards = (data: {
      cards: any[]
      canPlay: boolean
      currentPhase: string
      handSize: number
      faceUpSize: number
      faceDownSize: number
      soulWellSize: number
      isCurrentTurn: boolean
      nextPlayerCanPlayAnything: boolean
      lastPlayedCard: any
      discardPileSize: number
      shouldTakeDiscardPile: boolean
    }) => {
      setPlayableCards(data.cards)
      setValidationInfo(data)
      console.log('📋 Cartas jugables recibidas:', data)
    }

    const handleError = (data: { message: string }) => {
      setError(data.message)
    }

    socket.on('gameStateUpdate', handleGameStateUpdate)
    socket.on('roomCreated', handleRoomCreated)
    socket.on('roomJoined', handleRoomJoined)
    socket.on('gameStarted', handleGameStarted)
    socket.on('playableCards', handlePlayableCards)
    socket.on('error', handleError)

    return () => {
      socket.off('gameStateUpdate', handleGameStateUpdate)
      socket.off('roomCreated', handleRoomCreated)
      socket.off('roomJoined', handleRoomJoined)
      socket.off('gameStarted', handleGameStarted)
      socket.off('playableCards', handlePlayableCards)
      socket.off('error', handleError)
    }
  }, [socket, enabled])

  // Solicitar cartas jugables cuando es el turno del jugador
  useEffect(() => {
    if (socket && gameState && currentPlayerId && gameState.currentPlayerId === currentPlayerId) {
      socket.emit('getPlayableCards')
    }
  }, [socket, gameState?.currentPlayerId, currentPlayerId])

  // Acciones del juego
  const playCard = useCallback((cardIndex: number, targetPlayerId?: string) => {
    if (!socket) return
    socket.emit('playCard', { cardIndex, targetPlayerId })
  }, [socket])

  const takeDiscardPile = useCallback(() => {
    if (!socket) return
    socket.emit('takeDiscardPile')
  }, [socket])

  const setReady = useCallback((ready: boolean) => {
    if (!socket) return
    socket.emit('setPlayerReady', { ready })
  }, [socket])

  const startGame = useCallback(() => {
    if (!socket) return
    socket.emit('startGame')
  }, [socket])

  // Utilidades
  const currentPlayer = gameState?.players.find(p => p.id === currentPlayerId)
  const isMyTurn = gameState?.currentPlayerId === currentPlayerId
  const isGameActive = gameState?.gameState === 'playing'
  const isGameFinished = gameState?.gameState === 'finished'

  return {
    // Estado
    gameState,
    currentPlayerId,
    loading,
    error,
    playableCards,
    validationInfo,

    // Acciones
    playCard,
    takeDiscardPile,
    setReady,
    startGame,

    // Utilidades
    currentPlayer,
    isMyTurn,
    isGameActive,
    isGameFinished,
    hasGame: gameState !== null,
    isEnabled: enabled
  }
}
