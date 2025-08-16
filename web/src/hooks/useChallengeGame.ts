import { useState, useEffect, useCallback } from 'react'
import { Socket } from 'socket.io-client'

export interface HumanPlayer {
  id: string
  name: string
  handSize: number
  score: number
}

export interface ChallengeAIPlayer {
  id: string
  name: string
  difficulty: string
  personality: {
    name: string
    style: string
    aggression: number
    special: string
    challengeLevel: string
    isChallengeAI: boolean
  }
  handSize: number
  score: number
  challengeLevel: string
}

export interface ChallengeGameInfo {
  roomId: string
  gameMode: 'challenge'
  humanPlayer: HumanPlayer
  aiPlayer: ChallengeAIPlayer
  gameState: string
  currentPlayerId: string
  deckType: string
  challengeLevel: string
}

export interface ChallengeGameConfig {
  playerName: string
  deckType: 'angels' | 'demons' | 'dragons' | 'mages'
  challengeLevel: 'expert' | 'master' | 'legendary'
}

interface UseChallengeGameOptions {
  socket: Socket | null
  enabled?: boolean
}

export function useChallengeGame({ socket, enabled = true }: UseChallengeGameOptions) {
  const [gameInfo, setGameInfo] = useState<ChallengeGameInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [aiActions, setAiActions] = useState<any[]>([])

  // Crear juego de desafío
  const createChallengeGame = useCallback((config: ChallengeGameConfig) => {
    if (!socket || !enabled) return

    setIsCreating(true)
    setError(null)
    setAiActions([])

    socket.emit('createChallengeGame', config)

    socket.once('challengeGameCreated', (data: {
      roomId: string
      playerId: string
      gameState: any
      aiPlayer: ChallengeAIPlayer
      challengeLevel: string
    }) => {
      setGameInfo({
        roomId: data.roomId,
        gameMode: 'challenge',
        humanPlayer: {
          id: data.playerId,
          name: config.playerName,
          handSize: data.gameState.players.find((p: any) => p.id === data.playerId)?.hand.length || 0,
          score: 0
        },
        aiPlayer: {
          ...data.aiPlayer,
          handSize: data.gameState.players.find((p: any) => p.id === data.aiPlayer.id)?.hand.length || 0,
          score: 0
        },
        gameState: data.gameState.gameState,
        currentPlayerId: data.gameState.currentPlayerId,
        deckType: config.deckType,
        challengeLevel: data.challengeLevel
      })
      setIsCreating(false)
    })

    socket.once('error', (data: { message: string }) => {
      setError(data.message)
      setIsCreating(false)
    })
  }, [socket, enabled])

  // Obtener información del juego de desafío
  const getChallengeGameInfo = useCallback((roomId: string) => {
    if (!socket || !enabled) return

    setLoading(true)
    setError(null)

    socket.emit('getChallengeGameInfo', { roomId })

    socket.once('challengeGameInfo', (data: { info: ChallengeGameInfo }) => {
      setGameInfo(data.info)
      setLoading(false)
    })

    socket.once('error', (data: { message: string }) => {
      setError(data.message)
      setLoading(false)
    })
  }, [socket, enabled])

  // Limpiar juego de desafío
  const clearChallengeGame = useCallback(() => {
    setGameInfo(null)
    setError(null)
    setAiActions([])
  }, [])

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Escuchar eventos de IA en modo desafío
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
      challengeLevel?: string
      isChallengeAI?: boolean
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
          aiPlayer: {
            ...prev.aiPlayer,
            handSize: gameState.players.find((p: any) => p.id === prev.aiPlayer.id)?.hand.length || 0,
            score: gameState.players.find((p: any) => p.id === prev.aiPlayer.id)?.score || 0
          }
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
  const currentAIPlayer = gameInfo?.currentPlayerId === gameInfo?.aiPlayer.id ? gameInfo?.aiPlayer : null
  const isGameActive = gameInfo?.gameState === 'playing'
  const isGameFinished = gameInfo?.gameState === 'finished'
  const isWaitingForStart = gameInfo?.gameState === 'waiting'

  return {
    // Estado
    gameInfo,
    loading,
    error,
    isCreating,
    aiActions,

    // Acciones
    createChallengeGame,
    getChallengeGameInfo,
    clearChallengeGame,
    clearError,

    // Utilidades
    isHumanTurn,
    currentAIPlayer,
    isGameActive,
    isGameFinished,
    isWaitingForStart,
    hasGame: gameInfo !== null,
    isEnabled: enabled
  }
}
