'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Crown, Shield, Heart, Users, AlertCircle, Play, Skip, Target, Trash2 } from 'lucide-react'
import GameCard from './GameCard'
import PlayerArea from './PlayerArea'
import DropZone from './DropZone'
import DragDropInstructions from './DragDropInstructions'
import GameValidationStatus from './GameValidationStatus'
import ValidationRulesDisplay from './ValidationRulesDisplay'
import ActionFeedbackNotifications from './ActionFeedbackNotifications'
import SoundEffects, { useSoundEffects } from './SoundEffects'
import { CelebrationEffect } from './VisualEffects'
import FeedbackControls from './FeedbackControls'
import RealTimeNotificationCenter from './RealTimeNotificationCenter'
import ConnectionStatus from './ConnectionStatus'
import AISuggestionPanel from './AISuggestionPanel'
import { usePlayValidation } from '@/hooks/usePlayValidation'
import { useActionFeedback } from '@/hooks/useActionFeedback'
import { useRealTimeNotifications } from '@/hooks/useRealTimeNotifications'
import { useAI } from '@/hooks/useAI'
import { Card } from '@/types/game'

interface Player {
  id: string
  name: string
  hand: Card[]
  faceUpCreatures: Card[]
  faceDownCreatures: { hidden: boolean }[]
  soulWell: Card[]
  currentPhase: 'hand' | 'faceUp' | 'faceDown'
  health: number
  hasShield: boolean
  isReady: boolean
  isAlive: boolean
  score: number
  handSize: number
  soulWellSize: number
  isSinner: boolean
  isDisconnected?: boolean
}

interface GameState {
  roomId: string
  gameState: 'waiting' | 'playing' | 'finished'
  currentPlayerId: string | null
  players: Player[]
  discardPile: Card[]
  lastPlayedCard: Card | null
  nextPlayerCanPlayAnything: boolean
  skippedPlayer: string | null
  winner: Player | null
  sinner: Player | null
  turnTime: number
  deckType: string
  turnNumber: number
  currentPhase: string
}

interface GameBoardProps {
  socket: any
  roomId: string
  playerId: string
  isSoloMode?: boolean
  isCoopMode?: boolean
  isChallengeMode?: boolean
  gameState?: GameState
  currentPlayerId?: string
  onPlayCard?: (cardIndex: number, targetPlayerId?: string) => void
  onCardDrop?: (card: Card, targetZone: string, targetPlayerId?: string) => void
  onTakeDiscardPile?: () => void
  onSetReady?: (isReady: boolean) => void
  onStartGame?: () => void
  onSkipTurn?: () => void
  onSelectTarget?: (targetPlayerId: string) => void
}

export default function GameBoard({
  socket,
  roomId,
  playerId,
  isSoloMode = false,
  isCoopMode = false,
  isChallengeMode = false,
  gameState: propGameState,
  currentPlayerId: propCurrentPlayerId,
  onPlayCard,
  onCardDrop,
  onTakeDiscardPile,
  onSetReady,
  onStartGame,
  onSkipTurn,
  onSelectTarget
}: GameBoardProps) {
  const [gameState, setGameState] = useState<GameState | null>(propGameState || null)
  const [currentPlayerId, setCurrentPlayerId] = useState<string>(propCurrentPlayerId || playerId)
  const [timeLeft, setTimeLeft] = useState(30)
  const [selectedCard, setSelectedCard] = useState<number | null>(null)
  const [showTargetSelection, setShowTargetSelection] = useState(false)
  const [playableCards, setPlayableCards] = useState<number[]>([])
  const [showHand, setShowHand] = useState(false)
  const [highlightedDropZone, setHighlightedDropZone] = useState<string | null>(null)
  const [showDragDropInstructions, setShowDragDropInstructions] = useState(false)
  const [showValidation, setShowValidation] = useState(true)
  const [showValidationRules, setShowValidationRules] = useState(false)
  const [showFeedback, setShowFeedback] = useState(true)
  const [showSoundEffects, setShowSoundEffects] = useState(true)
  const [showRealTimeNotifications, setShowRealTimeNotifications] = useState(true)
  const [showConnectionStatus, setShowConnectionStatus] = useState(true)
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [feedbackSettings, setFeedbackSettings] = useState({
    notifications: true,
    soundEffects: true,
  })
  const [showHelp, setShowHelp] = useState(false)

  // Hooks para el modo solitario, cooperativo y desafío
  const {
    suggestion,
    difficulties,
    currentDifficulty,
    loading: aiLoading,
    error: aiError,
    getSuggestion,
    clearSuggestion,
    clearAIError,
    setCurrentDifficulty
  } = useAI({ socket, enabled: !isSoloMode && !isCoopMode && !isChallengeMode })

  const {
    suggestion: soloSuggestion,
    difficulties: soloDifficulties,
    currentDifficulty: soloCurrentDifficulty,
    loading: soloAILoading,
    error: soloAIError,
    getSuggestion: getSoloSuggestion,
    clearSuggestion: clearSoloSuggestion,
    clearAIError: clearSoloAIError,
    setCurrentDifficulty: setSoloCurrentDifficulty
  } = useAI({ socket, enabled: isSoloMode || isCoopMode || isChallengeMode })
    visualEffects: true,
    validationIndicators: true,
    celebrationEffects: true
  })
  
  const currentPlayer = gameState.players.find(p => p.id === currentPlayerId)
  const isCurrentTurn = gameState.currentPlayerId === currentPlayerId
  const isMyTurn = isCurrentTurn && gameState.gameState === 'playing'

  // Hook de validación
  const { validationResult, validationInfo, validateCard } = usePlayValidation({
    gameState,
    currentPlayerId,
    onValidationChange: (validation) => {
      console.log('Validation changed:', validation)
    }
  })

  // Hook de feedback de acciones
  const {
    notifications,
    addFeedback,
    removeFeedback,
    addCardPlayedFeedback,
    addPileTakenFeedback,
    addTurnChangedFeedback,
    addGameEndedFeedback,
    addPlayerJoinedFeedback,
    addPlayerLeftFeedback,
    addValidationErrorFeedback,
    addCardEffect,
    addDropZoneEffect
  } = useActionFeedback({
    maxNotifications: 5,
    defaultDuration: 4000
  })

  // Hook de efectos de sonido
  const {
    soundWaves,
    addCardPlaySound,
    addCardDropSound,
    addPileTakeSound,
    addPurificationSound,
    addVictorySound,
    addErrorSound
  } = useSoundEffects()

  // Hook de notificaciones en tiempo real
  const {
    notifications: realTimeNotifications,
    settings: notificationSettings,
    addNotification,
    removeNotification,
    clearAllNotifications,
    addGameNotification,
    addSystemNotification,
    addPlayerNotification,
    requestDesktopPermission,
    setSettings: setNotificationSettings
  } = useRealTimeNotifications({
    socket,
    playerId: currentPlayerId,
    settings: {
      enabled: true,
      sound: true,
      desktop: true,
      gameEvents: true,
      systemEvents: true,
      playerEvents: true,
      maxNotifications: 10,
      autoDismiss: true,
      autoDismissDelay: 5000
    }
  })

  // Hook de IA (modo normal)
  const {
    suggestion,
    difficulties,
    strategies,
    loading: aiLoading,
    error: aiError,
    currentDifficulty,
    getSuggestion,
    setPlayerAsAI,
    loadDifficulties,
    loadStrategies,
    clearSuggestion,
    clearError: clearAIError,
    setCurrentDifficulty
  } = useAI({
    socket,
    enabled: !isSoloMode
  })

  // Hook de IA (modo solitario)
  const {
    suggestion: soloSuggestion,
    difficulties: soloDifficulties,
    strategies: soloStrategies,
    loading: soloAILoading,
    error: soloAIError,
    currentDifficulty: soloCurrentDifficulty,
    getSuggestion: getSoloSuggestion,
    setPlayerAsAI: setSoloPlayerAsAI,
    loadDifficulties: loadSoloDifficulties,
    loadStrategies: loadSoloStrategies,
    clearSuggestion: clearSoloSuggestion,
    clearError: clearSoloAIError,
    setCurrentDifficulty: setSoloCurrentDifficulty
  } = useAI({
    socket,
    enabled: isSoloMode
  })

  // Efectos para Socket.io en modo solitario, cooperativo y desafío
  useEffect(() => {
    if (!socket || (!isSoloMode && !isCoopMode && !isChallengeMode)) return

    const handleGameStateUpdated = (data: any) => {
      setGameState(data)
      setCurrentPlayerId(data.currentPlayerId)
    }

    const handleCardPlayed = (data: any) => {
      console.log('Carta jugada:', data)
      addCardPlayedFeedback(data.card, data.playerId)
    }

    const handleTurnChanged = (data: any) => {
      console.log('Turno cambiado:', data)
      setCurrentPlayerId(data.turnInfo.currentPlayerId)
      addTurnChangedFeedback(data.turnInfo)
    }

    const handleGameEnded = (data: any) => {
      console.log('Juego terminado:', data)
      addGameEndedFeedback(data.winner, data.sinner)
    }

    const handleAIAction = (data: any) => {
      console.log('Acción de IA:', data)
      addFeedback({
        type: 'info',
        message: `${data.playerName} (${data.personality}): ${data.action}`,
        duration: 3000
      })
    }

    socket.on('gameStateUpdated', handleGameStateUpdated)
    socket.on('cardPlayed', handleCardPlayed)
    socket.on('turnChanged', handleTurnChanged)
    socket.on('gameEnded', handleGameEnded)
    socket.on('aiAction', handleAIAction)

    return () => {
      socket.off('gameStateUpdated', handleGameStateUpdated)
      socket.off('cardPlayed', handleCardPlayed)
      socket.off('turnChanged', handleTurnChanged)
      socket.off('gameEnded', handleGameEnded)
      socket.off('aiAction', handleAIAction)
    }
  }, [socket, isSoloMode, isCoopMode, isChallengeMode, addCardPlayedFeedback, addTurnChangedFeedback, addGameEndedFeedback, addFeedback])

  // Timer del turno
  useEffect(() => {
    if (gameState?.gameState === 'playing' && isCurrentTurn) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            return gameState.turnTime || 30
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [gameState?.gameState, isCurrentTurn, gameState?.turnTime])

  // Calcular cartas jugables según las reglas del juego
  useEffect(() => {
    if (!currentPlayer || !isMyTurn || gameState.gameState !== 'playing') {
      setPlayableCards([])
      return
    }

    const playable: number[] = []
    const hand = currentPlayer.hand || []
    
    // Si no hay carta anterior jugada, todas las cartas son jugables
    if (!gameState.lastPlayedCard) {
      hand.forEach((_, index) => playable.push(index))
    } else {
      // Verificar cada carta según las reglas
      hand.forEach((card, index) => {
        // Cartas especiales (2, 8, 10) siempre son jugables
        if (card.value === 2 || card.value === 8 || card.value === 10) {
          playable.push(index)
          return
        }
        
        // Si el siguiente jugador puede jugar cualquier cosa (por efecto del 2)
        if (gameState.nextPlayerCanPlayAnything) {
          playable.push(index)
          return
        }
        
        // Regla normal: debe ser igual o mayor valor
        if (card.value >= gameState.lastPlayedCard.value) {
          playable.push(index)
        }
      })
    }

    console.log(`🎯 Cartas jugables para ${currentPlayer.name}:`, playable.map(i => hand[i]?.name))
    setPlayableCards(playable)
  }, [currentPlayer, isMyTurn, gameState.lastPlayedCard, gameState.nextPlayerCanPlayAnything, gameState.gameState])

  // Funciones para manejar drag & drop
  const handleCardDrop = (card: Card, targetZone: string, targetPlayerId?: string) => {
    if (!isMyTurn) return

    console.log(`Carta ${card.name} soltada en zona: ${targetZone}`, { targetPlayerId })
    
    // Encontrar el índice de la carta en la mano del jugador
    const cardIndex = currentPlayer?.hand.findIndex(c => c.id === card.id)
    if (cardIndex === undefined || cardIndex < 0) {
      console.log(`❌ Carta ${card.name} no encontrada en la mano`)
      return
    }

    // Verificar si la carta es jugable
    if (!playableCards.includes(cardIndex)) {
      console.log(`❌ Carta ${card.name} no es jugable en este momento`)
      addErrorSound({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
      return
    }
    
    // Efectos visuales y de sonido
    addCardDropSound({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
    addDropZoneEffect(targetZone, 'success')
    
    // Determinar la acción basada en la zona de destino
    switch (targetZone) {
      case 'discard-pile':
      case 'tower-of-sins':
        // Jugar carta en la torre de los pecados
        handlePlayCard(cardIndex)
        break
      case 'player-target':
        // Lógica para cartas que requieren objetivo
        if (targetPlayerId) {
          handlePlayCard(cardIndex, targetPlayerId)
        }
        break
      default:
        console.warn(`Zona de destino desconocida: ${targetZone}`)
        addErrorSound({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
    }

    // Llamar al callback personalizado si existe
    onCardDrop?.(card, targetZone, targetPlayerId)
  }

  // Funciones para modo solitario, cooperativo y desafío
  const handlePlayCard = (cardIndex: number, targetPlayerId?: string) => {
    if ((isSoloMode || isCoopMode || isChallengeMode) && socket) {
      socket.emit('playCard', { cardIndex, targetPlayerId })
    } else if (onPlayCard) {
      onPlayCard(cardIndex, targetPlayerId)
    }
  }

  const handleTakeDiscardPile = () => {
    if ((isSoloMode || isCoopMode || isChallengeMode) && socket) {
      socket.emit('takeDiscardPile')
    } else if (onTakeDiscardPile) {
      onTakeDiscardPile()
    }
  }

  const handleSetReady = (isReady: boolean) => {
    if ((isSoloMode || isCoopMode || isChallengeMode) && socket) {
      socket.emit('setPlayerReady', { isReady })
    } else if (onSetReady) {
      onSetReady(isReady)
    }
  }

  const handleStartGame = () => {
    if ((isSoloMode || isCoopMode || isChallengeMode) && socket) {
      socket.emit('startGame')
    } else if (onStartGame) {
      onStartGame()
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }

  const handleDropZoneHighlight = (zoneId: string | null) => {
    setHighlightedDropZone(zoneId)
  }

  // Mostrar instrucciones de drag & drop en el primer turno del jugador
  useEffect(() => {
    if (isMyTurn && !showDragDropInstructions) {
      setShowDragDropInstructions(true)
    }
  }, [isMyTurn, showDragDropInstructions])

  const getDeckIcon = (deckType: string) => {
    switch (deckType) {
      case 'angels':
        return '👼'
      case 'demons':
        return '😈'
      case 'dragons':
        return '🐉'
      case 'mages':
        return '🧙‍♂️'
      default:
        return '🃏'
    }
  }

  const getPhaseName = (phase: string) => {
    switch (phase) {
      case 'hand':
        return 'Mano'
      case 'faceUp':
        return 'Boca Arriba'
      case 'faceDown':
        return 'Boca Abajo'
      default:
        return phase
    }
  }

  const handleCardClick = (cardIndex: number) => {
    if (!isMyTurn || !playableCards.includes(cardIndex)) {
      console.log(`❌ Carta ${cardIndex} no es jugable en este momento`)
      return
    }

    const card = currentPlayer?.hand[cardIndex]
    if (!card) return

    console.log(`🎯 Jugando carta: ${card.name} (valor: ${card.value})`)

    // Verificar si la carta requiere selección de objetivo
    if (card.value === 2 || card.value === 8 || card.value === 10) {
      setSelectedCard(cardIndex)
      setShowTargetSelection(true)
    } else {
      // Jugar carta directamente
      onPlayCard(cardIndex)
      setSelectedCard(null)
    }
  }

  const handleTargetSelect = (targetPlayerId: string) => {
    if (selectedCard !== null) {
      onPlayCard(selectedCard, targetPlayerId)
      setSelectedCard(null)
      setShowTargetSelection(false)
    }
  }

  const handleTakeDiscardPile = () => {
    // Efectos visuales y de sonido
    addPileTakeSound({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
    addFeedback({
      type: 'warning',
      title: 'Tomando Torre',
      message: 'Has tomado la Torre de los Pecados',
      icon: '🏰',
      duration: 2000
    })
    
    onTakeDiscardPile()
    setSelectedCard(null)
    setShowTargetSelection(false)
  }

  const getPlayableCardsInfo = () => {
    if (!currentPlayer || !isMyTurn) return null
    
    const playableCardsList = playableCards.map(index => currentPlayer.hand[index]).filter(Boolean)
    
    if (playableCardsList.length === 0) {
      return {
        message: 'No tienes cartas jugables',
        action: 'Debes tomar la Torre de los Pecados',
        type: 'warning'
      }
    }
    
    return {
      message: `Tienes ${playableCardsList.length} carta(s) jugable(s)`,
      cards: playableCardsList.map(card => `${card.name} (${card.value})`),
      type: 'info'
    }
  }

  const playableInfo = getPlayableCardsInfo()

  // Pantalla de espera
  if (gameState.gameState === 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.h1 
              className="text-4xl font-fantasy font-bold text-primary-400 mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              🏰 Torre de los Pecados
            </motion.h1>
            <motion.p 
              className="text-gray-300 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Mazo: {getDeckIcon(gameState.deckType)} {gameState.deckType.toUpperCase()}
            </motion.p>
            <motion.p 
              className="text-gray-400 text-sm mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Sala: {gameState.roomId}
            </motion.p>
          </div>

          {/* Lista de jugadores */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {gameState.players.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-lg border-2 ${
                  player.id === currentPlayerId
                    ? 'border-accent-400 bg-accent-900/20'
                    : 'border-gray-600 bg-gray-800/50'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Users className="w-8 h-8 text-secondary-300" />
                      {player.isReady && (
                        <motion.div
                          className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{player.name}</h3>
                      <p className="text-sm text-gray-300">
                        {player.isReady ? '✅ Listo' : '⏳ Esperando'}
                      </p>
                    </div>
                  </div>
                  {player.id === currentPlayerId && (
                    <span className="text-xs bg-accent-500 text-white px-3 py-1 rounded-full">
                      Tú
                    </span>
                  )}
                </div>

                {player.isDisconnected && (
                  <div className="flex items-center space-x-2 text-yellow-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>Desconectado</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Controles */}
          <div className="text-center space-y-4">
            {currentPlayer && !currentPlayer.isReady && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSetReady(true)}
                className="btn-primary text-lg px-8 py-3"
              >
                Estoy Listo
              </motion.button>
            )}
            
            {gameState.players.every(p => p.isReady) && gameState.players.length >= 2 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onStartGame}
                className="btn-primary text-lg px-8 py-3 ml-4"
              >
                Iniciar Juego
              </motion.button>
            )}

            <div className="text-gray-400 text-sm">
              {gameState.players.length < 2 ? (
                <p>Esperando más jugadores... ({gameState.players.length}/6)</p>
              ) : (
                <p>Todos listos para comenzar la batalla</p>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Pantalla de juego terminado
  if (gameState.gameState === 'finished') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 p-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <h1 className="text-6xl font-fantasy font-bold text-primary-400 mb-4">
              ¡Juego Terminado!
            </h1>
            
            {gameState.winner && (
              <motion.div 
                className="mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-3xl font-bold text-green-400 mb-2">
                  🏆 Ganador: {gameState.winner.name}
                </h2>
                <p className="text-gray-300">¡Felicidades por deshacerte de todas tus criaturas!</p>
              </motion.div>
            )}
            
            {gameState.sinner && (
              <motion.div 
                className="mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h2 className="text-3xl font-bold text-red-400 mb-2">
                  😈 Pecador: {gameState.sinner.name}
                </h2>
                <p className="text-gray-300">Debes cargar con la Torre de los Pecados hasta la próxima partida</p>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <p className="text-gray-400 mb-4">
                Turno {gameState.turnNumber} • Mazo {gameState.deckType.toUpperCase()}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    )
  }

  // Pantalla de juego activo
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header del juego */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <motion.h1 
              className="text-3xl font-fantasy font-bold text-primary-400"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              🏰 Torre de los Pecados
            </motion.h1>
            <motion.div 
              className="text-sm text-secondary-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Mazo: {getDeckIcon(gameState.deckType)} {gameState.deckType.toUpperCase()}
            </motion.div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Botón de ayuda */}
            <motion.button
              onClick={() => setShowHelp(!showHelp)}
              className="btn-secondary text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ❓ Ayuda
            </motion.button>
            
            {/* Información del turno */}
            <motion.div 
              className="text-sm text-secondary-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Turno: {gameState.players.find(p => p.id === gameState.currentPlayerId)?.name || 'Desconocido'}
            </motion.div>
          </div>
        </div>

        {/* Resumen del estado del juego */}
        {currentPlayer && (
          <motion.div
            className="bg-gray-800/30 rounded-lg p-4 border border-gray-600 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
              <span>📊</span>
              <span>Estado del Juego</span>
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Información del jugador actual */}
              <div className="bg-gray-700/50 rounded p-3">
                <div className="text-sm text-gray-400 mb-1">Tu Estado</div>
                <div className="text-white font-semibold">{currentPlayer.name}</div>
                <div className="text-xs text-gray-300">
                  Fase: {getPhaseName(currentPlayer.currentPhase)}
                </div>
                <div className="text-xs text-gray-300">
                  Mano: {currentPlayer.handSize} • Pozo: {currentPlayer.soulWellSize}
                </div>
              </div>
              
              {/* Información del turno */}
              <div className="bg-gray-700/50 rounded p-3">
                <div className="text-sm text-gray-400 mb-1">Turno Actual</div>
                <div className="text-white font-semibold">
                  {gameState.currentPlayerId === currentPlayerId ? 'Tu turno' : 'Turno de otro'}
                </div>
                <div className="text-xs text-gray-300">
                  Jugador: {gameState.players.find(p => p.id === gameState.currentPlayerId)?.name || 'Desconocido'}
                </div>
                <div className="text-xs text-gray-300">
                  Tiempo: {gameState.turnTime}s
                </div>
              </div>
              
              {/* Información de la torre */}
              <div className="bg-gray-700/50 rounded p-3">
                <div className="text-sm text-gray-400 mb-1">Torre de los Pecados</div>
                <div className="text-white font-semibold">{gameState.discardPile.length} cartas</div>
                <div className="text-xs text-gray-300">
                  {gameState.lastPlayedCard ? (
                    <>
                      Última: {gameState.lastPlayedCard.name} (valor: {gameState.lastPlayedCard.value})
                    </>
                  ) : (
                    'Sin cartas jugadas'
                  )}
                </div>
                {gameState.nextPlayerCanPlayAnything && (
                  <div className="text-xs text-yellow-400 font-semibold">
                    ✨ Cualquier carta válida
                  </div>
                )}
              </div>
              
              {/* Información de cartas jugables */}
              <div className="bg-gray-700/50 rounded p-3">
                <div className="text-sm text-gray-400 mb-1">Tus Opciones</div>
                <div className="text-white font-semibold">
                  {isMyTurn ? `${playableCards.length} jugables` : 'No es tu turno'}
                </div>
                <div className="text-xs text-gray-300">
                  {isMyTurn && playableCards.length === 0 && (
                    <span className="text-red-400">Debes tomar la torre</span>
                  )}
                  {isMyTurn && playableCards.length > 0 && (
                    <span className="text-green-400">Puedes jugar cartas</span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Torre de los Pecados */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
            <span>🏰</span>
            <span>Torre de los Pecados</span>
            <span className="text-sm text-gray-400">({gameState.discardPile.length} cartas)</span>
          </h2>
          
          <DropZone
            id="tower-of-sins"
            title="Torre de los Pecados"
            description="Arrastra cartas aquí para jugarlas"
            icon={<span>🏰</span>}
            isActive={isMyTurn}
            isHighlighted={highlightedDropZone === 'tower-of-sins'}
            isValidDrop={isMyTurn}
            onDrop={(card) => handleCardDrop(card, 'tower-of-sins')}
            onDragOver={handleDragOver}
            className="mb-4"
          >
            <div className="flex flex-wrap gap-2">
              {gameState.discardPile.slice(-5).map((card, index) => {
                const isLastCard = index === gameState.discardPile.slice(-5).length - 1;
                const isFirstCard = gameState.discardPile.length === 1;
                
                return (
                  <motion.div
                    key={`${card.id}-${index}`}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative ${isLastCard ? 'ring-2 ring-yellow-400 ring-opacity-75' : ''}`}
                  >
                    <GameCard
                      card={card}
                      className="w-20 h-28"
                    />
                    {/* Indicador de carta activa */}
                    {isLastCard && (
                      <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs px-1 py-0.5 rounded-full font-bold">
                        {isFirstCard ? 'INICIAL' : 'ACTIVA'}
                      </div>
                    )}
                  </motion.div>
                );
              })}
              {gameState.discardPile.length === 0 && (
                <div className="w-20 h-28 border-2 border-dashed border-gray-600 rounded flex items-center justify-center text-gray-500">
                  Vacía
                </div>
              )}
            </div>
            
            {/* Información de la carta activa */}
            {gameState.lastPlayedCard && (
              <div className="mt-3 p-3 bg-gray-800/50 rounded-lg border border-gray-600">
                <div className="text-sm text-gray-300 mb-2">
                  <span className="font-semibold text-yellow-400">🎯 Carta Activa:</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <GameCard
                      card={gameState.lastPlayedCard}
                      className="w-16 h-22"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-semibold">{gameState.lastPlayedCard.name}</div>
                    <div className="text-gray-400 text-sm">Valor: {gameState.lastPlayedCard.value}</div>
                    <div className="text-gray-400 text-sm">Tipo: {gameState.lastPlayedCard.type}</div>
                    {gameState.nextPlayerCanPlayAnything && (
                      <div className="text-yellow-400 text-sm font-semibold mt-1">
                        ✨ Puedes jugar cualquier carta
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Instrucciones cuando no hay carta activa */}
            {!gameState.lastPlayedCard && gameState.discardPile.length === 0 && (
              <div className="mt-3 p-3 bg-blue-900/20 rounded-lg border border-blue-600">
                <div className="text-sm text-blue-300">
                  <span className="font-semibold">🚀 Inicio del Juego:</span> Puedes jugar cualquier carta para comenzar la Torre de los Pecados.
                </div>
              </div>
            )}
          </DropZone>
        </motion.div>

        {/* Área de jugadores */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {gameState.players
            .filter(player => player.id !== currentPlayerId)
            .map((player, index) => (
              <PlayerArea
                key={player.id}
                player={player}
                isMyTurn={player.id === gameState.currentPlayerId}
                onCardClick={player.id === currentPlayerId ? handleCardClick : undefined}
                onCardDrop={player.id === currentPlayerId ? handleCardDrop : undefined}
                showHand={false}
                validationInfo={{
                  playableCards: playableCards.map(index => currentPlayer?.hand[index]).filter(Boolean),
                  lastPlayedCard: gameState.lastPlayedCard,
                  nextPlayerCanPlayAnything: gameState.nextPlayerCanPlayAnything
                }}
                showValidation={false}
              />
            ))}
        </div>

        {/* Área del jugador actual */}
        {currentPlayer && (
          <PlayerArea
            player={currentPlayer}
            isCurrentPlayer={true}
            isMyTurn={isMyTurn}
            onCardClick={handleCardClick}
            onCardDrop={handleCardDrop}
            showHand={true}
            validationInfo={{
              playableCards: playableCards.map(index => currentPlayer.hand[index]).filter(Boolean),
              lastPlayedCard: gameState.lastPlayedCard,
              nextPlayerCanPlayAnything: gameState.nextPlayerCanPlayAnything
            }}
            showValidation={true}
          />
        )}

        {/* Área de acciones del jugador actual */}
        {currentPlayer && isMyTurn && (
          <motion.div 
            className="text-center space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Información de cartas jugables */}
            {playableInfo && (
              <motion.div
                className={`p-4 rounded-lg border-2 ${
                  playableInfo.type === 'warning' 
                    ? 'border-yellow-400 bg-yellow-900/20 text-yellow-300'
                    : 'border-green-400 bg-green-900/20 text-green-300'
                }`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <h3 className="font-semibold mb-2">{playableInfo.message}</h3>
                {playableInfo.action && (
                  <p className="text-sm opacity-90">{playableInfo.action}</p>
                )}
                {playableInfo.cards && playableInfo.cards.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-semibold mb-1">Cartas jugables:</p>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {playableInfo.cards.map((card, index) => (
                        <span key={index} className="text-xs bg-white/10 px-2 py-1 rounded">
                          {card.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Sección de cartas jugables con botones */}
            {playableCards.length > 0 && (
              <motion.div
                className="bg-gray-800/50 rounded-lg p-4 border border-gray-600"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-center space-x-2">
                  <span>🎯</span>
                  <span>Selecciona una carta para jugar</span>
                  <span className="text-sm text-gray-400">({playableCards.length} disponibles)</span>
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {playableCards.map((cardIndex) => {
                    const card = currentPlayer.hand[cardIndex];
                    if (!card) return null;
                    
                    const isSpecial = card.value === 2 || card.value === 8 || card.value === 10;
                    
                    return (
                      <motion.div
                        key={`playable-${cardIndex}`}
                        className="relative"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: cardIndex * 0.1 }}
                      >
                        <GameCard
                          card={card}
                          className="w-full h-auto"
                        />
                        
                        {/* Botón de jugar */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleCardClick(cardIndex)}
                          className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full font-bold text-sm shadow-lg ${
                            isSpecial 
                              ? 'bg-purple-600 hover:bg-purple-500 text-white' 
                              : 'bg-green-600 hover:bg-green-500 text-white'
                          }`}
                        >
                          {isSpecial ? 'ESPECIAL' : 'JUGAR'}
                        </motion.button>
                        
                        {/* Indicador de carta especial */}
                        {isSpecial && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{card.value}</span>
                          </div>
                        )}
                        
                        {/* Información de la carta */}
                        <div className="mt-2 text-center">
                          <div className="text-xs text-gray-300 font-semibold">{card.name}</div>
                          <div className="text-xs text-gray-400">Valor: {card.value}</div>
                          {isSpecial && (
                            <div className="text-xs text-purple-300 mt-1">
                              {card.value === 2 && 'Puedes jugar otra carta'}
                              {card.value === 8 && 'El siguiente jugador pierde su turno'}
                              {card.value === 10 && 'Purifica la Torre de los Pecados'}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                
                {/* Instrucciones adicionales */}
                <div className="mt-4 text-sm text-gray-400">
                  <p>💡 También puedes arrastrar las cartas hacia la Torre de los Pecados</p>
                </div>
              </motion.div>
            )}

            {/* Botón para tomar la torre cuando no hay cartas jugables */}
            {playableCards.length === 0 && (
              <motion.div
                className="bg-red-900/20 rounded-lg p-4 border border-red-600"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-lg font-semibold text-red-300 mb-2">
                  ⚠️ No puedes jugar ninguna carta
                </h3>
                <p className="text-sm text-red-200 mb-4">
                  Debes tomar toda la Torre de los Pecados
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleTakeDiscardPile}
                  className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  🏰 Tomar Torre de los Pecados
                </motion.button>
              </motion.div>
            )}

            {/* Zona de drop para cartas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <DropZone
                id="discard-pile"
                title="Jugar Carta"
                description="Arrastra una carta aquí para jugarla"
                icon={<Play className="w-5 h-5" />}
                isActive={isMyTurn}
                isHighlighted={highlightedDropZone === 'discard-pile'}
                isValidDrop={isMyTurn}
                onDrop={(card) => handleCardDrop(card, 'discard-pile')}
                onDragOver={handleDragOver}
                className="min-h-[100px]"
              />
              
              <DropZone
                id="take-pile"
                title="Tomar Torre"
                description="Haz clic o arrastra para tomar la torre"
                icon={<span>🏰</span>}
                isActive={isMyTurn}
                isHighlighted={highlightedDropZone === 'take-pile'}
                isValidDrop={false}
                onDrop={() => handleTakeDiscardPile()}
                onDragOver={handleDragOver}
                className="min-h-[100px] cursor-pointer"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleTakeDiscardPile}
                  className="btn-secondary text-lg px-6 py-3 flex items-center space-x-2 w-full h-full"
                >
                  <span>🏰</span>
                  <span>Tomar Torre de los Pecados</span>
                </motion.button>
              </DropZone>
            </div>

            <div className="flex justify-center space-x-4">
              {onSkipTurn && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onSkipTurn}
                  className="btn-secondary text-lg px-6 py-3 flex items-center space-x-2"
                >
                  <Skip className="w-5 h-5" />
                  <span>Saltar Turno</span>
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        {/* Modal de selección de objetivo */}
        <AnimatePresence>
          {showTargetSelection && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 20 }}
              >
                <h3 className="text-xl font-bold text-white mb-4">
                  Seleccionar Objetivo
                </h3>
                <p className="text-gray-300 mb-4">
                  Selecciona el jugador objetivo para tu carta:
                </p>
                
                <div className="space-y-2">
                  {gameState.players
                    .filter(p => p.id !== currentPlayerId)
                    .map((player) => (
                      <motion.button
                        key={player.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleTargetSelect(player.id)}
                        className="w-full p-3 text-left bg-gray-700 hover:bg-gray-600 rounded border border-gray-600"
                      >
                        <span className="text-white font-semibold">{player.name}</span>
                        <div className="text-sm text-gray-400">
                          Fase: {getPhaseName(player.currentPhase)} • 
                          Mano: {player.handSize} • 
                          Pozo: {player.soulWellSize}
                        </div>
                      </motion.button>
                    ))}
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowTargetSelection(false)
                    setSelectedCard(null)
                  }}
                  className="w-full mt-4 btn-secondary"
                >
                  Cancelar
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Instrucciones de Drag & Drop */}
      <DragDropInstructions
        isVisible={showDragDropInstructions}
        onClose={() => setShowDragDropInstructions(false)}
      />

      {/* Estado de Validación */}
      <GameValidationStatus
        validationInfo={validationInfo}
        isVisible={showValidation}
      />

      {/* Reglas de Validación */}
      <ValidationRulesDisplay
        isVisible={showValidationRules}
        onClose={() => setShowValidationRules(false)}
        lastPlayedCard={gameState.lastPlayedCard}
        nextPlayerCanPlayAnything={gameState.nextPlayerCanPlayAnything}
      />

      {/* Notificaciones de Feedback */}
      <ActionFeedbackNotifications
        notifications={notifications}
        onRemove={removeFeedback}
        position="top-right"
        isVisible={showFeedback}
      />

      {/* Efectos de Sonido */}
      <SoundEffects
        waves={soundWaves}
        isVisible={showSoundEffects}
      />

      {/* Efectos de Celebración */}
      {gameState.gameState === 'finished' && feedbackSettings.celebrationEffects && (
        <CelebrationEffect
          type="victory"
          className="fixed inset-0 pointer-events-none z-30"
        />
      )}

      {/* Controles de Feedback */}
      <FeedbackControls
        settings={feedbackSettings}
        onSettingsChange={setFeedbackSettings}
        isVisible={true}
        showAIPanel={showAIPanel}
        onToggleAIPanel={() => setShowAIPanel(!showAIPanel)}
        isMyTurn={isMyTurn}
      />

      {/* Centro de Notificaciones en Tiempo Real */}
      <RealTimeNotificationCenter
        notifications={realTimeNotifications}
        onRemove={removeNotification}
        onClearAll={clearAllNotifications}
        onSettingsChange={setNotificationSettings}
        settings={notificationSettings}
        isVisible={showRealTimeNotifications}
      />

      {/* Estado de Conexión */}
      <ConnectionStatus
        socket={socket}
        playerId={currentPlayerId}
        roomId={roomId}
        isVisible={showConnectionStatus}
      />

      {/* Panel de Sugerencias de IA */}
      <AISuggestionPanel
        suggestion={suggestion}
        difficulties={difficulties}
        currentDifficulty={currentDifficulty}
        loading={aiLoading}
        error={aiError}
        onGetSuggestion={getSuggestion}
        onClearSuggestion={clearSuggestion}
        onClearError={clearAIError}
        onSetDifficulty={setCurrentDifficulty}
        isVisible={showAIPanel && isMyTurn}
        className="fixed bottom-4 right-4 w-80 z-40"
      />

      {/* Modal de ayuda */}
      <AnimatePresence>
        {showHelp && (
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
              className="bg-secondary-800 p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-primary-400 mb-4">📖 Reglas del Juego</h2>
              
              <div className="space-y-4 text-sm">
                <div>
                  <h3 className="font-semibold text-accent-400 mb-2">🎯 Objetivo</h3>
                  <p className="text-secondary-300">
                    Deshazte de todas tus criaturas para no ser el último y cargar con la "Torre de los Pecados".
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-accent-400 mb-2">🎮 Cómo Jugar</h3>
                  <ul className="text-secondary-300 space-y-2">
                    <li>• <strong>Primer jugador:</strong> Puede descartar cualquier criatura</li>
                    <li>• <strong>Jugadores siguientes:</strong> Deben descartar una criatura de <strong>igual o mayor valor</strong></li>
                    <li>• <strong>Si no puedes jugar:</strong> Debes tomar toda la "Torre de los Pecados"</li>
                    <li>• <strong>Cartas especiales (2, 8, 10):</strong> Siempre se pueden jugar</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-accent-400 mb-2">🃏 Cartas Especiales</h3>
                  <ul className="text-secondary-300 space-y-2">
                    <li>• <strong>Valor 2:</strong> Poder Universal - Se puede jugar sobre cualquier carta</li>
                    <li>• <strong>Valor 8:</strong> Poder de Salto - El siguiente jugador pierde su turno</li>
                    <li>• <strong>Valor 10:</strong> Poder de Purificación - Limpia la Torre de los Pecados</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-accent-400 mb-2">🔄 Fases del Juego</h3>
                  <ul className="text-secondary-300 space-y-2">
                    <li>• <strong>Fase de Mano:</strong> Juegas con las cartas en tu mano</li>
                    <li>• <strong>Fase Boca Arriba:</strong> Juegas con las 3 cartas boca arriba</li>
                    <li>• <strong>Fase Boca Abajo:</strong> Juegas con las 3 cartas boca abajo (sin verlas)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-accent-400 mb-2">🏆 Victoria</h3>
                  <p className="text-secondary-300">
                    El primer jugador en deshacerse de todas sus criaturas gana. El último es el "Pecador".
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowHelp(false)}
                  className="btn-primary"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
