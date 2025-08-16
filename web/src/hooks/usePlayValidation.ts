import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/types/game'

interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  card?: Card
  canPlay: boolean
  playableCards: Card[]
  reason?: string
  willPurify?: boolean
  requiresTarget?: boolean
}

interface ValidationInfo {
  canPlay: boolean
  playableCards: Card[]
  currentPhase: string
  handSize: number
  faceUpSize: number
  faceDownSize: number
  soulWellSize: number
  isCurrentTurn: boolean
  turnInfo: any
  nextPlayerCanPlayAnything: boolean
  lastPlayedCard: Card | null
  discardPileSize: number
  shouldTakeDiscardPile: boolean
  turnValidation: any
}

interface UsePlayValidationOptions {
  gameState: any
  currentPlayerId: string
  onValidationChange?: (validation: ValidationResult) => void
}

export function usePlayValidation({
  gameState,
  currentPlayerId,
  onValidationChange
}: UsePlayValidationOptions) {
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: false,
    errors: [],
    warnings: [],
    canPlay: false,
    playableCards: []
  })

  const [validationInfo, setValidationInfo] = useState<ValidationInfo | null>(null)

  // Validar una carta específica
  const validateCard = useCallback((card: Card, cardIndex: number, targetPlayerId?: string): ValidationResult => {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      card,
      canPlay: false,
      playableCards: []
    }

    const currentPlayer = gameState.players.find((p: any) => p.id === currentPlayerId)
    const isCurrentTurn = gameState.currentPlayerId === currentPlayerId

    // Validaciones básicas
    if (!currentPlayer) {
      result.errors.push('Jugador no encontrado')
      result.isValid = false
      return result
    }

    if (gameState.gameState !== 'playing') {
      result.errors.push('El juego no está en progreso')
      result.isValid = false
      return result
    }

    if (!currentPlayer.isAlive) {
      result.errors.push('El jugador no está vivo')
      result.isValid = false
      return result
    }

    if (!isCurrentTurn) {
      result.errors.push('No es tu turno')
      result.isValid = false
      return result
    }

    // Validar si la carta puede ser jugada según las reglas
    const canPlayCard = validateCardPlayability(card, gameState)
    if (!canPlayCard.isValid) {
      result.errors.push(canPlayCard.reason || 'No puedes jugar esta carta')
      result.isValid = false
      return result
    }

    // Validar cartas especiales que requieren objetivo
    if (card.value === 2 || card.value === 8 || card.value === 10) {
      result.requiresTarget = true
      result.warnings.push('Esta carta requiere seleccionar un objetivo')
    }

    // Verificar si purificará la torre
    if (willPurifyPile(card, gameState)) {
      result.willPurify = true
      result.warnings.push('Esta carta purificará la Torre de los Pecados')
    }

    // Validar fase del juego
    const phaseValidation = validatePhase(card, currentPlayer, cardIndex, gameState)
    if (!phaseValidation.isValid) {
      result.errors.push(phaseValidation.reason || 'Carta no válida en esta fase')
      result.isValid = false
      return result
    }

    result.canPlay = true
    return result
  }, [gameState, currentPlayerId])

  // Validar todas las cartas del jugador
  const validateAllCards = useCallback(() => {
    const currentPlayer = gameState.players.find((p: any) => p.id === currentPlayerId)
    if (!currentPlayer) return

    const playableCards: Card[] = []
    const allCards = [
      ...currentPlayer.hand.map((card: any, index: number) => ({ card, index, phase: 'hand' })),
      ...currentPlayer.faceUpCreatures.map((card: any, index: number) => ({ card, index, phase: 'faceUp' })),
      ...currentPlayer.faceDownCreatures.map((card: any, index: number) => ({ card, index, phase: 'faceDown' }))
    ]

    allCards.forEach(({ card, index, phase }) => {
      const validation = validateCard(card, index)
      if (validation.isValid) {
        playableCards.push(card)
      }
    })

    const result: ValidationResult = {
      isValid: playableCards.length > 0,
      errors: [],
      warnings: [],
      canPlay: playableCards.length > 0,
      playableCards
    }

    if (playableCards.length === 0) {
      result.errors.push('No tienes cartas jugables')
      result.warnings.push('Debes tomar la Torre de los Pecados')
    }

    setValidationResult(result)
    onValidationChange?.(result)
  }, [gameState, currentPlayerId, validateCard, onValidationChange])

  // Validar si una carta puede ser jugada según las reglas del juego
  const validateCardPlayability = (card: Card, gameState: any) => {
    const lastCard = gameState.lastPlayedCard

    // Cartas especiales siempre se pueden jugar
    if (card.value === 2 || card.value === 8 || card.value === 10) {
      return { isValid: true, reason: 'Carta especial' }
    }

    // Si no hay carta anterior, se puede jugar cualquier cosa
    if (!lastCard) {
      return { isValid: true, reason: 'Primera carta' }
    }

    // Si el siguiente jugador puede jugar cualquier cosa (por efecto del 2)
    if (gameState.nextPlayerCanPlayAnything) {
      return { isValid: true, reason: 'Puedes jugar cualquier carta' }
    }

    // Regla normal: debe ser igual o mayor valor
    if (card.value >= lastCard.value) {
      return { isValid: true, reason: `Valor válido (${card.value} >= ${lastCard.value})` }
    }

    return { 
      isValid: false, 
      reason: `Valor insuficiente (${card.value} < ${lastCard.value})` 
    }
  }

  // Validar fase del juego
  const validatePhase = (card: Card, player: any, cardIndex: number, gameState: any) => {
    switch (player.currentPhase) {
      case 'hand':
        if (cardIndex >= player.hand.length) {
          return { isValid: false, reason: 'Carta no disponible en la mano' }
        }
        return { isValid: true, reason: 'Fase de la Mano' }
      
      case 'faceUp':
        if (cardIndex >= player.faceUpCreatures.length) {
          return { isValid: false, reason: 'Carta no disponible en criaturas boca arriba' }
        }
        return { isValid: true, reason: 'Fase de Criaturas Boca Arriba' }
      
      case 'faceDown':
        if (cardIndex >= player.faceDownCreatures.length) {
          return { isValid: false, reason: 'Carta no disponible en criaturas boca abajo' }
        }
        return { isValid: true, reason: 'Fase de Criaturas Boca Abajo' }
      
      default:
        return { isValid: false, reason: 'Fase de juego no válida' }
    }
  }

  // Verificar si la carta purificará el mazo
  const willPurifyPile = (card: Card, gameState: any) => {
    const lastCard = gameState.lastPlayedCard

    // Si es una carta 10, siempre purifica
    if (card.value === 10) return true

    if (!lastCard) return false

    // Si es el mismo valor que la última carta jugada, purifica
    if (card.value === lastCard.value) return true

    // Si hay 4 cartas del mismo valor en el mazo (incluyendo la actual)
    const sameValueCards = gameState.discardPile.filter((c: any) => c.value === card.value)
    return sameValueCards.length >= 3 // + la carta actual = 4
  }

  // Obtener información de validación del servidor
  const fetchValidationInfo = useCallback(async () => {
    try {
      // En una implementación real, esto haría una llamada al servidor
      // Por ahora, simulamos la respuesta
      const info: ValidationInfo = {
        canPlay: validationResult.canPlay,
        playableCards: validationResult.playableCards,
        currentPhase: gameState.players.find((p: any) => p.id === currentPlayerId)?.currentPhase || 'hand',
        handSize: gameState.players.find((p: any) => p.id === currentPlayerId)?.hand?.length || 0,
        faceUpSize: gameState.players.find((p: any) => p.id === currentPlayerId)?.faceUpCreatures?.length || 0,
        faceDownSize: gameState.players.find((p: any) => p.id === currentPlayerId)?.faceDownCreatures?.length || 0,
        soulWellSize: gameState.players.find((p: any) => p.id === currentPlayerId)?.soulWell?.length || 0,
        isCurrentTurn: gameState.currentPlayerId === currentPlayerId,
        turnInfo: { timeLeft: gameState.turnTime },
        nextPlayerCanPlayAnything: gameState.nextPlayerCanPlayAnything || false,
        lastPlayedCard: gameState.lastPlayedCard,
        discardPileSize: gameState.discardPile?.length || 0,
        shouldTakeDiscardPile: validationResult.playableCards.length === 0,
        turnValidation: null
      }

      setValidationInfo(info)
    } catch (error) {
      console.error('Error fetching validation info:', error)
    }
  }, [gameState, currentPlayerId, validationResult])

  // Actualizar validación cuando cambie el estado del juego
  useEffect(() => {
    validateAllCards()
    fetchValidationInfo()
  }, [gameState, currentPlayerId, validateAllCards, fetchValidationInfo])

  return {
    validationResult,
    validationInfo,
    validateCard,
    validateAllCards,
    fetchValidationInfo
  }
}
