import { useState, useEffect, useCallback } from 'react'
import { Socket } from 'socket.io-client'

export interface AISuggestion {
  bestMove: {
    index: number
    card: any
    score: number
  } | null
  analysis: {
    totalCards: number
    playableCards: number
    bestCard: string | null
    bestScore: number
    reasoning: string
    alternatives: Array<{
      card: string
      score: number
      reason: string
    }>
  }
  recommendation: 'playCard' | 'takeDiscardPile'
}

export interface DifficultyInfo {
  name: string
  description: string
  randomFactor: number
  strategyWeight: number
}

export interface DeckStrategy {
  name: string
  description: string
  priorities: string[]
  preferredCards: number[]
  riskTolerance: number
}

export interface AIDifficulties {
  difficulties: Record<string, DifficultyInfo>
  available: string[]
}

export interface DeckStrategies {
  strategies: Record<string, DeckStrategy>
  available: string[]
}

interface UseAIOptions {
  socket: Socket | null
  enabled?: boolean
}

export function useAI({ socket, enabled = true }: UseAIOptions) {
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null)
  const [difficulties, setDifficulties] = useState<AIDifficulties | null>(null)
  const [strategies, setStrategies] = useState<DeckStrategies | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentDifficulty, setCurrentDifficulty] = useState<string>('intermediate')

  // Cargar dificultades disponibles
  const loadDifficulties = useCallback(() => {
    if (!socket || !enabled) return

    setLoading(true)
    setError(null)

    socket.emit('getAIDifficulties')

    socket.once('aiDifficulties', (data: AIDifficulties) => {
      setDifficulties(data)
      setLoading(false)
    })

    socket.once('error', (data: { message: string }) => {
      setError(data.message)
      setLoading(false)
    })
  }, [socket, enabled])

  // Cargar estrategias de mazo
  const loadStrategies = useCallback(() => {
    if (!socket || !enabled) return

    setLoading(true)
    setError(null)

    socket.emit('getDeckStrategies')

    socket.once('deckStrategies', (data: DeckStrategies) => {
      setStrategies(data)
      setLoading(false)
    })

    socket.once('error', (data: { message: string }) => {
      setError(data.message)
      setLoading(false)
    })
  }, [socket, enabled])

  // Obtener sugerencia de IA
  const getSuggestion = useCallback((difficulty?: string) => {
    if (!socket || !enabled) return

    setLoading(true)
    setError(null)

    const selectedDifficulty = difficulty || currentDifficulty
    setCurrentDifficulty(selectedDifficulty)

    socket.emit('getAISuggestion', { difficulty: selectedDifficulty })

    socket.once('aiSuggestion', (data: { analysis: AISuggestion; difficulty: string; timestamp: Date }) => {
      setSuggestion(data.analysis)
      setLoading(false)
    })

    socket.once('error', (data: { message: string }) => {
      setError(data.message)
      setLoading(false)
    })
  }, [socket, enabled, currentDifficulty])

  // Configurar jugador como IA
  const setPlayerAsAI = useCallback((roomId: string, playerId: string, difficulty: string) => {
    if (!socket || !enabled) return

    setLoading(true)
    setError(null)

    socket.emit('setPlayerAsAI', { roomId, playerId, difficulty })

    socket.once('playerSetAsAISuccess', (data: { playerId: string; difficulty: string; message: string }) => {
      setLoading(false)
      // Aquí podrías mostrar una notificación de éxito
    })

    socket.once('error', (data: { message: string }) => {
      setError(data.message)
      setLoading(false)
    })
  }, [socket, enabled])

  // Limpiar sugerencia
  const clearSuggestion = useCallback(() => {
    setSuggestion(null)
    setError(null)
  }, [])

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Cargar datos iniciales
  useEffect(() => {
    if (enabled) {
      loadDifficulties()
      loadStrategies()
    }
  }, [enabled, loadDifficulties, loadStrategies])

  // Escuchar eventos de IA
  useEffect(() => {
    if (!socket || !enabled) return

    const handlePlayerSetAsAI = (data: { playerId: string; playerName: string; difficulty: string; message: string }) => {
      // Aquí podrías mostrar una notificación cuando un jugador se convierte en IA
      console.log(`🤖 ${data.playerName} ahora es controlado por IA (${data.difficulty})`)
    }

    socket.on('playerSetAsAI', handlePlayerSetAsAI)

    return () => {
      socket.off('playerSetAsAI', handlePlayerSetAsAI)
    }
  }, [socket, enabled])

  return {
    // Estado
    suggestion,
    difficulties,
    strategies,
    loading,
    error,
    currentDifficulty,

    // Acciones
    getSuggestion,
    setPlayerAsAI,
    loadDifficulties,
    loadStrategies,
    clearSuggestion,
    clearError,
    setCurrentDifficulty,

    // Utilidades
    hasSuggestion: suggestion !== null,
    hasDifficulties: difficulties !== null,
    hasStrategies: strategies !== null,
    isEnabled: enabled
  }
}
