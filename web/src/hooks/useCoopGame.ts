import { useState, useEffect, useCallback } from 'react'
import { Socket } from 'socket.io-client'

export interface HumanPlayer {
  id: string
  name: string
  isHost: boolean
  handSize: number
  score: number
}

export interface AIPlayer {
  id: string
  name: string
  difficulty: string
  personality: {
    name: string
    style: string
    aggression: number
  }
  handSize: number
  score: number
}

export interface CoopGameInfo {
  roomId: string
  gameMode: 'coop'
  humanPlayers: HumanPlayer[]
  aiPlayers: AIPlayer[]
  gameState: string
  currentPlayerId: string
  deckType: string
  maxHumanPlayers: number
  currentHumanPlayers: number
}

export interface CoopGameConfig {
  playerName: string
  deckType: 'angels' | 'demons' | 'dragons' | 'mages'
  aiDifficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  maxPlayers?: number
}

export interface AvailableCoopGame {
  roomId: string
  deckType: string
  aiDifficulty: string
  humanPlayers: number
  maxHumanPlayers: number
  hostName: string
  createdAt: Date
}

interface UseCoopGameOptions {
  socket: Socket | null
  enabled?: boolean
}

export function useCoopGame({ socket, enabled = true }: UseCoopGameOptions) {
  const [gameInfo, setGameInfo] = useState<CoopGameInfo | null>(null)
  const [availableGames, setAvailableGames] = useState<AvailableCoopGame[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [aiActions, setAiActions] = useState<any[]>([])

  // Crear juego cooperativo
  const createCoopGame = useCallback((config: CoopGameConfig) => {
    if (!socket || !enabled) return

    setIsCreating(true)
    setError(null)
    setAiActions([])

    socket.emit('createCoopGame', config)

    socket.once('coopGameCreated', (data: {
      roomId: string
      playerId: string
      gameState: any
      aiPlayers: AIPlayer[]
      maxHumanPlayers: number
      currentHumanPlayers: number
    }) => {
      setGameInfo({
        roomId: data.roomId,
        gameMode: 'coop',
        humanPlayers: [{
          id: data.playerId,
          name: config.playerName,
          isHost: true,
          handSize: data.gameState.players.find((p: any) => p.id === data.playerId)?.hand.length || 0,
          score: 0
        }],
        aiPlayers: data.aiPlayers.map(ai => ({
          ...ai,
          handSize: data.gameState.players.find((p: any) => p.id === ai.id)?.hand.length || 0,
          score: 0
        })),
        gameState: data.gameState.gameState,
        currentPlayerId: data.gameState.currentPlayerId,
        deckType: config.deckType,
        maxHumanPlayers: data.maxHumanPlayers,
        currentHumanPlayers: data.currentHumanPlayers
      })
      setIsCreating(false)
    })

    socket.once('error', (data: { message: string }) => {
      setError(data.message)
      setIsCreating(false)
    })
  }, [socket, enabled])

  // Unirse a juego cooperativo
  const joinCoopGame = useCallback((roomId: string, playerName: string) => {
    if (!socket || !enabled) return

    setIsJoining(true)
    setError(null)
    setAiActions([])

    socket.emit('joinCoopGame', { roomId, playerName })

    socket.once('joinedCoopGame', (data: {
      roomId: string
      playerId: string
      gameState: any
      aiPlayers: AIPlayer[]
      humanPlayers: HumanPlayer[]
    }) => {
      setGameInfo({
        roomId: data.roomId,
        gameMode: 'coop',
        humanPlayers: data.humanPlayers.map(hp => ({
          ...hp,
          handSize: data.gameState.players.find((p: any) => p.id === hp.id)?.hand.length || 0,
          score: 0
        })),
        aiPlayers: data.aiPlayers.map(ai => ({
          ...ai,
          handSize: data.gameState.players.find((p: any) => p.id === ai.id)?.hand.length || 0,
          score: 0
        })),
        gameState: data.gameState.gameState,
        currentPlayerId: data.gameState.currentPlayerId,
        deckType: data.gameState.deckType,
        maxHumanPlayers: 2,
        currentHumanPlayers: data.humanPlayers.length
      })
      setIsJoining(false)
    })

    socket.once('error', (data: { message: string }) => {
      setError(data.message)
      setIsJoining(false)
    })
  }, [socket, enabled])

  // Obtener información del juego cooperativo
  const getCoopGameInfo = useCallback((roomId: string) => {
    if (!socket || !enabled) return

    setLoading(true)
    setError(null)

    socket.emit('getCoopGameInfo', { roomId })

    socket.once('coopGameInfo', (data: { info: CoopGameInfo }) => {
      setGameInfo(data.info)
      setLoading(false)
    })

    socket.once('error', (data: { message: string }) => {
      setError(data.message)
      setLoading(false)
    })
  }, [socket, enabled])

  // Obtener juegos cooperativos disponibles
  const getAvailableCoopGames = useCallback(() => {
    if (!socket || !enabled) return

    setLoading(true)
    setError(null)

    socket.emit('getAvailableCoopGames')

    socket.once('availableCoopGames', (data: { games: AvailableCoopGame[] }) => {
      setAvailableGames(data.games)
      setLoading(false)
    })

    socket.once('error', (data: { message: string }) => {
      setError(data.message)
      setLoading(false)
    })
  }, [socket, enabled])

  // Limpiar juego cooperativo
  const clearCoopGame = useCallback(() => {
    setGameInfo(null)
    setError(null)
    setAiActions([])
  }, [])

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Escuchar eventos de IA en modo cooperativo
  useEffect(() => {
    if (!socket || !enabled) return

    const handleAIAction = (data: {
      playerId: string
      playerName: string
      personality: string
      action: string
      card?: any
      reason: string
      difficulty: string
    }) => {
      setAiActions(prev => [...prev, {
        ...data,
        timestamp: new Date()
      }])

      // Limpiar acciones antiguas (mantener solo las últimas 10)
      setAiActions(prev => prev.slice(-10))
    }

    const handleGameStateUpdated = (gameState: any) => {
      if (gameInfo) {
        setGameInfo(prev => prev ? {
          ...prev,
          gameState: gameState.gameState,
          currentPlayerId: gameState.currentPlayerId,
          humanPlayers: prev.humanPlayers.map(hp => ({
            ...hp,
            handSize: gameState.players.find((p: any) => p.id === hp.id)?.hand.length || 0,
            score: gameState.players.find((p: any) => p.id === hp.id)?.score || 0
          })),
          aiPlayers: prev.aiPlayers.map(ai => ({
            ...ai,
            handSize: gameState.players.find((p: any) => p.id === ai.id)?.hand.length || 0,
            score: gameState.players.find((p: any) => p.id === ai.id)?.score || 0
          }))
        } : null)
      }
    }

    const handleGameEnded = (data: any) => {
      if (gameInfo) {
        setGameInfo(prev => prev ? {
          ...prev,
          gameState: 'finished'
        } : null)
      }
    }

    const handlePlayerJoined = (data: {
      playerId: string
      playerName: string
      humanPlayers: HumanPlayer[]
    }) => {
      if (gameInfo) {
        setGameInfo(prev => prev ? {
          ...prev,
          humanPlayers: data.humanPlayers.map(hp => ({
            ...hp,
            handSize: 0,
            score: 0
          })),
          currentHumanPlayers: data.humanPlayers.length
        } : null)
      }
    }

    socket.on('aiAction', handleAIAction)
    socket.on('gameStateUpdated', handleGameStateUpdated)
    socket.on('gameEnded', handleGameEnded)
    socket.on('playerJoinedCoopGame', handlePlayerJoined)

    return () => {
      socket.off('aiAction', handleAIAction)
      socket.off('gameStateUpdated', handleGameStateUpdated)
      socket.off('gameEnded', handleGameEnded)
      socket.off('playerJoinedCoopGame', handlePlayerJoined)
    }
  }, [socket, enabled, gameInfo])

  // Utilidades
  const isHumanTurn = gameInfo?.currentPlayerId && gameInfo?.humanPlayers.some(hp => hp.id === gameInfo.currentPlayerId)
  const currentAIPlayer = gameInfo?.aiPlayers.find(ai => ai.id === gameInfo?.currentPlayerId)
  const isGameActive = gameInfo?.gameState === 'playing'
  const isGameFinished = gameInfo?.gameState === 'finished'
  const isWaitingForPlayers = gameInfo?.gameState === 'waiting'
  const canStartGame = gameInfo?.currentHumanPlayers >= 1 && gameInfo?.currentHumanPlayers <= gameInfo?.maxHumanPlayers

  return {
    // Estado
    gameInfo,
    availableGames,
    loading,
    error,
    isCreating,
    isJoining,
    aiActions,

    // Acciones
    createCoopGame,
    joinCoopGame,
    getCoopGameInfo,
    getAvailableCoopGames,
    clearCoopGame,
    clearError,

    // Utilidades
    isHumanTurn,
    currentAIPlayer,
    isGameActive,
    isGameFinished,
    isWaitingForPlayers,
    canStartGame,
    hasGame: gameInfo !== null,
    isEnabled: enabled
  }
}
