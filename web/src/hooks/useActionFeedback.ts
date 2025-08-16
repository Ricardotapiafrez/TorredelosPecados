import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface ActionFeedback {
  id: string
  type: 'success' | 'error' | 'warning' | 'info' | 'special'
  title: string
  message: string
  icon?: string
  duration?: number
  position?: 'top' | 'center' | 'bottom'
  action?: 'cardPlayed' | 'pileTaken' | 'turnChanged' | 'purified' | 'gameEnded' | 'playerJoined' | 'playerLeft'
  data?: any
}

interface UseActionFeedbackOptions {
  maxNotifications?: number
  defaultDuration?: number
  onFeedbackAdd?: (feedback: ActionFeedback) => void
  onFeedbackRemove?: (feedbackId: string) => void
}

export function useActionFeedback(options: UseActionFeedbackOptions = {}) {
  const {
    maxNotifications = 5,
    defaultDuration = 4000,
    onFeedbackAdd,
    onFeedbackRemove
  } = options

  const [notifications, setNotifications] = useState<ActionFeedback[]>([])
  const [activeEffects, setActiveEffects] = useState<Map<string, any>>(new Map())
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Agregar notificación
  const addFeedback = useCallback((feedback: Omit<ActionFeedback, 'id'>) => {
    const id = `feedback-${Date.now()}-${Math.random()}`
    const newFeedback: ActionFeedback = {
      id,
      duration: defaultDuration,
      position: 'top',
      ...feedback
    }

    setNotifications(prev => {
      const updated = [newFeedback, ...prev].slice(0, maxNotifications)
      return updated
    })

    onFeedbackAdd?.(newFeedback)

    // Auto-remover después del tiempo especificado
    if (newFeedback.duration && newFeedback.duration > 0) {
      const timeout = setTimeout(() => {
        removeFeedback(id)
      }, newFeedback.duration)
      
      timeoutRefs.current.set(id, timeout)
    }

    return id
  }, [maxNotifications, defaultDuration, onFeedbackAdd])

  // Remover notificación
  const removeFeedback = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    
    const timeout = timeoutRefs.current.get(id)
    if (timeout) {
      clearTimeout(timeout)
      timeoutRefs.current.delete(id)
    }

    onFeedbackRemove?.(id)
  }, [onFeedbackRemove])

  // Limpiar todas las notificaciones
  const clearAllFeedback = useCallback(() => {
    setNotifications([])
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout))
    timeoutRefs.current.clear()
  }, [])

  // Efectos específicos para acciones del juego
  const addCardPlayedFeedback = useCallback((data: any) => {
    const { playerId, card, targetPlayerId, wasPurified } = data
    
    addFeedback({
      type: 'success',
      title: 'Carta Jugada',
      message: `${card.name} (${card.value})`,
      icon: '🎴',
      duration: 3000,
      action: 'cardPlayed',
      data
    })

    // Efecto especial para purificación
    if (wasPurified) {
      addFeedback({
        type: 'special',
        title: '¡Purificación!',
        message: 'La Torre de los Pecados ha sido purificada',
        icon: '✨',
        duration: 5000,
        action: 'purified',
        data
      })
    }
  }, [addFeedback])

  const addPileTakenFeedback = useCallback((data: any) => {
    const { playerId, cardCount } = data
    
    addFeedback({
      type: 'warning',
      title: 'Torre Tomada',
      message: `Se tomaron ${cardCount} cartas de la Torre de los Pecados`,
      icon: '🏰',
      duration: 3000,
      action: 'pileTaken',
      data
    })
  }, [addFeedback])

  const addTurnChangedFeedback = useCallback((data: any) => {
    const { turnInfo, previousPlayerId, nextPlayerId } = data
    
    addFeedback({
      type: 'info',
      title: 'Turno Cambiado',
      message: `Turno ${turnInfo.turnNumber}`,
      icon: '🔄',
      duration: 2000,
      action: 'turnChanged',
      data
    })
  }, [addFeedback])

  const addGameEndedFeedback = useCallback((data: any) => {
    const { winner, sinner, gameSummary } = data
    
    if (winner) {
      addFeedback({
        type: 'special',
        title: '¡Juego Terminado!',
        message: `Ganador: ${winner.name}`,
        icon: '🏆',
        duration: 0, // No auto-remover
        action: 'gameEnded',
        data
      })
    }

    if (sinner) {
      addFeedback({
        type: 'warning',
        title: 'Pecador Designado',
        message: `Pecador: ${sinner.name}`,
        icon: '😈',
        duration: 5000,
        action: 'gameEnded',
        data
      })
    }
  }, [addFeedback])

  const addPlayerJoinedFeedback = useCallback((data: any) => {
    const { player } = data
    
    addFeedback({
      type: 'info',
      title: 'Jugador Conectado',
      message: `${player.name} se unió al juego`,
      icon: '👋',
      duration: 3000,
      action: 'playerJoined',
      data
    })
  }, [addFeedback])

  const addPlayerLeftFeedback = useCallback((data: any) => {
    const { player } = data
    
    addFeedback({
      type: 'warning',
      title: 'Jugador Desconectado',
      message: `${player.name} se desconectó`,
      icon: '👋',
      duration: 4000,
      action: 'playerLeft',
      data
    })
  }, [addFeedback])

  const addValidationErrorFeedback = useCallback((data: any) => {
    const { errors, warnings } = data
    
    if (errors.length > 0) {
      addFeedback({
        type: 'error',
        title: 'Error de Validación',
        message: errors[0], // Mostrar solo el primer error
        icon: '❌',
        duration: 4000,
        data
      })
    }

    if (warnings.length > 0) {
      addFeedback({
        type: 'warning',
        title: 'Advertencia',
        message: warnings[0], // Mostrar solo la primera advertencia
        icon: '⚠️',
        duration: 3000,
        data
      })
    }
  }, [addFeedback])

  // Efectos visuales para elementos específicos
  const addElementEffect = useCallback((elementId: string, effect: any) => {
    setActiveEffects(prev => new Map(prev.set(elementId, effect)))
    
    // Remover efecto después de un tiempo
    setTimeout(() => {
      setActiveEffects(prev => {
        const newMap = new Map(prev)
        newMap.delete(elementId)
        return newMap
      })
    }, effect.duration || 1000)
  }, [])

  // Efectos específicos para cartas
  const addCardEffect = useCallback((cardId: string, effectType: 'played' | 'invalid' | 'special') => {
    const effects = {
      played: {
        animation: { scale: [1, 1.2, 0.8, 1], rotate: [0, 5, -5, 0] },
        duration: 800,
        color: 'green'
      },
      invalid: {
        animation: { x: [0, -10, 10, -10, 0], scale: [1, 0.95] },
        duration: 600,
        color: 'red'
      },
      special: {
        animation: { scale: [1, 1.3, 1], rotate: [0, 360] },
        duration: 1000,
        color: 'purple'
      }
    }

    addElementEffect(cardId, effects[effectType])
  }, [addElementEffect])

  // Efectos para zonas de drop
  const addDropZoneEffect = useCallback((zoneId: string, effectType: 'success' | 'error' | 'highlight') => {
    const effects = {
      success: {
        animation: { scale: [1, 1.05, 1], backgroundColor: ['rgba(34, 197, 94, 0.2)', 'rgba(34, 197, 94, 0.4)', 'rgba(34, 197, 94, 0.2)'] },
        duration: 1000
      },
      error: {
        animation: { scale: [1, 0.95, 1], backgroundColor: ['rgba(239, 68, 68, 0.2)', 'rgba(239, 68, 68, 0.4)', 'rgba(239, 68, 68, 0.2)'] },
        duration: 800
      },
      highlight: {
        animation: { scale: [1, 1.1, 1], borderColor: ['#3b82f6', '#1d4ed8', '#3b82f6'] },
        duration: 1500
      }
    }

    addElementEffect(zoneId, effects[effectType])
  }, [addElementEffect])

  return {
    notifications,
    activeEffects,
    addFeedback,
    removeFeedback,
    clearAllFeedback,
    addCardPlayedFeedback,
    addPileTakenFeedback,
    addTurnChangedFeedback,
    addGameEndedFeedback,
    addPlayerJoinedFeedback,
    addPlayerLeftFeedback,
    addValidationErrorFeedback,
    addCardEffect,
    addDropZoneEffect
  }
}
