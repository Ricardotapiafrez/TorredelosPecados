import { useState, useEffect, useCallback } from 'react'
import { Socket } from 'socket.io-client'

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

export interface SoloGameInfo {
  roomId: string
  gameMode: 'solo'
  humanPlayer: {
    id: string
    name: string
    handSize: number
    score: number
  }
  aiPlayers: AIPlayer[]
  gameState: string
  currentPlayerId: string
  deckType: string
}

export interface SoloGameConfig {
  playerName: string
  deckType: 'angels' | 'demons' | 'dragons' | 'mages'
  aiDifficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
}

interface UseSoloGameOptions {
  socket: Socket | null
  enabled?: boolean
}

export function useSoloGame({ socket, enabled = true }: UseSoloGameOptions) {
  const [gameInfo, setGameInfo] = useState<SoloGameInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [aiActions, setAiActions] = useState<any[]>([])

  // Crear juego solitario
  const createSoloGame = useCallback((config: SoloGameConfig) => {
    if (!socket || !enabled) return

    setIsCreating(true)
    setError(null)
    setAiActions([])

    socket.emit('createSoloGame', config)

    socket.once('soloGameCreated', (data: {
      roomId: string
      playerId: string
      gameState: any
      aiPlayers: AIPlayer[]
    }) => {
      setGameInfo({
        roomId: data.roomId,
        gameMode: 'solo',
        humanPlayer: {
          id: data.playerId,
          name: config.playerName,
          handSize: data.gameState.players.find((p: any) => p.id === data.playerId)?.hand.length || 0,
          score: 0
        },
        aiPlayers: data.aiPlayers.map(ai => ({
          ...ai,
          handSize: data.gameState.players.find((p: any) => p.id === ai.id)?.hand.length || 0,
          score: 0
        })),
        gameState: data.gameState.gameState,
        currentPlayerId: data.gameState.currentPlayerId,
        deckType: config.deckType
      })
      setIsCreating(false)
    })

    socket.once('error', (data: { message: string }) => {
      setError(data.message)
      setIsCreating(false)
    })
  }, [socket, enabled])

  // Obtener información del juego solitario
  const getSoloGameInfo = useCallback((roomId: string) => {
    if (!socket || !enabled) return

    setLoading(true)
    setError(null)

    socket.emit('getSoloGameInfo', { roomId })

    socket.once('soloGameInfo', (data: { info: SoloGameInfo }) => {
      setGameInfo(data.info)
      setLoading(false)
    })

    socket.once('error', (data: { message: string }) => {
      setError(data.message)
      setLoading(false)
    })
  }, [socket, enabled])

  // Limpiar juego solitario
  const clearSoloGame = useCallback(() => {
    setGameInfo(null)
    setError(null)
    setAiActions([])
  }, [])

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Escuchar eventos de IA en modo solitario
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
          humanPlayer: {
            ...prev.humanPlayer,
            handSize: gameState.players.find((p: any) => p.id === prev.humanPlayer.id)?.hand.length || 0,
            score: gameState.players.find((p: any) => p.id === prev.humanPlayer.id)?.score || 0
          },
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

    socket.on('aiAction', handleAIAction)
    socket.on('gameStateUpdated', handleGameStateUpdated)
    socket.on('gameEnded', handleGameEnded)

    return () => {
      socket.off('aiAction', handleAIAction)
      socket.off('gameStateUpdated', handleGameStateUpdated)
      socket.off('gameEnded', handleGameEnded)
    }
  }, [socket, enabled, gameInfo])

  // Utilidades
  const isHumanTurn = gameInfo?.currentPlayerId === gameInfo?.humanPlayer.id
  const currentAIPlayer = gameInfo?.aiPlayers.find(ai => ai.id === gameInfo?.currentPlayerId)
  const isGameActive = gameInfo?.gameState === 'playing'
  const isGameFinished = gameInfo?.gameState === 'finished'

  return {
    // Estado
    gameInfo,
    loading,
    error,
    isCreating,
    aiActions,

    // Acciones
    createSoloGame,
    getSoloGameInfo,
    clearSoloGame,
    clearError,

    // Utilidades
    isHumanTurn,
    currentAIPlayer,
    isGameActive,
    isGameFinished,
    hasGame: gameInfo !== null,
    isEnabled: enabled
  }
}
