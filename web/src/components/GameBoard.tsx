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
import { usePlayValidation } from '@/hooks/usePlayValidation'
import { useActionFeedback } from '@/hooks/useActionFeedback'
import { useRealTimeNotifications } from '@/hooks/useRealTimeNotifications'
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
  gameState: GameState
  currentPlayerId: string
  onPlayCard: (cardIndex: number, targetPlayerId?: string) => void
  onCardDrop?: (card: Card, targetZone: string, targetPlayerId?: string) => void
  onTakeDiscardPile: () => void
  onSetReady: (isReady: boolean) => void
  onStartGame: () => void
  onSkipTurn?: () => void
  onSelectTarget?: (targetPlayerId: string) => void
}

export default function GameBoard({
  gameState,
  currentPlayerId,
  onPlayCard,
  onCardDrop,
  onTakeDiscardPile,
  onSetReady,
  onStartGame,
  onSkipTurn,
  onSelectTarget
}: GameBoardProps) {
  const [timeLeft, setTimeLeft] = useState(gameState.turnTime)
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
  const [feedbackSettings, setFeedbackSettings] = useState({
    notifications: true,
    soundEffects: true,
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

  // Timer del turno
  useEffect(() => {
    if (gameState.gameState === 'playing' && isCurrentTurn) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            return gameState.turnTime
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [gameState.gameState, isCurrentTurn, gameState.turnTime])

  // Actualizar cartas jugables
  useEffect(() => {
    if (currentPlayer && isMyTurn) {
      // Simular obtención de cartas jugables (esto vendría del servidor)
      const playable = currentPlayer.hand.map((_, index) => index)
      setPlayableCards(playable)
    }
  }, [currentPlayer, isMyTurn])

  // Funciones para manejar drag & drop
  const handleCardDrop = (card: Card, targetZone: string, targetPlayerId?: string) => {
    if (!isMyTurn) return

    console.log(`Carta ${card.name} soltada en zona: ${targetZone}`, { targetPlayerId })
    
    // Efectos visuales y de sonido
    addCardDropSound({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
    addDropZoneEffect(targetZone, 'success')
    
    // Determinar la acción basada en la zona de destino
    switch (targetZone) {
      case 'discard-pile':
        // Encontrar el índice de la carta en la mano del jugador
        const cardIndex = currentPlayer?.hand.findIndex(c => c.id === card.id)
        if (cardIndex !== undefined && cardIndex >= 0) {
          onPlayCard(cardIndex)
        }
        break
      case 'tower-of-sins':
        // Lógica para jugar carta en la torre de los pecados
        const towerCardIndex = currentPlayer?.hand.findIndex(c => c.id === card.id)
        if (towerCardIndex !== undefined && towerCardIndex >= 0) {
          onPlayCard(towerCardIndex)
        }
        break
      case 'player-target':
        // Lógica para cartas que requieren objetivo
        if (targetPlayerId) {
          const targetCardIndex = currentPlayer?.hand.findIndex(c => c.id === card.id)
          if (targetCardIndex !== undefined && targetCardIndex >= 0) {
            onPlayCard(targetCardIndex, targetPlayerId)
          }
        }
        break
      default:
        console.warn(`Zona de destino desconocida: ${targetZone}`)
        addErrorSound({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
    }

    // Llamar al callback personalizado si existe
    onCardDrop?.(card, targetZone, targetPlayerId)
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
    if (!isMyTurn || !playableCards.includes(cardIndex)) return

    const card = currentPlayer?.hand[cardIndex]
    if (!card) return

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
          <motion.div 
            className="flex justify-between items-center mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <h1 className="text-3xl font-fantasy font-bold text-primary-400">
                🏰 Torre de los Pecados
              </h1>
              <div className="flex items-center space-x-4 text-gray-300 mt-1">
                <span>Mazo: {getDeckIcon(gameState.deckType)} {gameState.deckType.toUpperCase()}</span>
                <span>Turno: {gameState.turnNumber}</span>
                <span>Fase: {getPhaseName(gameState.currentPhase)}</span>
              </div>
            </div>

            {/* Botón de reglas de validación */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowValidationRules(true)}
              className="btn-secondary text-sm px-4 py-2 flex items-center space-x-2"
            >
              <span>📖</span>
              <span>Reglas</span>
            </motion.button>
          
          {isCurrentTurn && (
            <motion.div 
              className="text-center"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="text-2xl font-bold text-accent-400 mb-1 flex items-center space-x-2">
                <Play className="w-6 h-6" />
                <span>Tu Turno</span>
              </div>
              <div className="text-lg text-white flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>{timeLeft}s</span>
              </div>
            </motion.div>
          )}
        </motion.div>

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
              {gameState.discardPile.slice(-5).map((card, index) => (
                <motion.div
                  key={`${card.id}-${index}`}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GameCard
                    card={card}
                    className="w-20 h-28"
                  />
                </motion.div>
              ))}
              {gameState.discardPile.length === 0 && (
                <div className="w-20 h-28 border-2 border-dashed border-gray-600 rounded flex items-center justify-center text-gray-500">
                  Vacía
                </div>
              )}
            </div>
            
            {gameState.lastPlayedCard && (
              <div className="mt-3 text-sm text-gray-300">
                Última carta: <span className="font-semibold">{gameState.lastPlayedCard.name}</span> 
                (Valor: {gameState.lastPlayedCard.value})
              </div>
            )}
          </DropZone>
        </motion.div>

        {/* Área de jugadores */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {gameState.players.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <PlayerArea
                player={player}
                isCurrentPlayer={player.id === currentPlayerId}
                isMyTurn={gameState.currentPlayerId === player.id}
                onCardClick={player.id === currentPlayerId ? handleCardClick : undefined}
                onCardDrop={player.id === currentPlayerId ? handleCardDrop : undefined}
                showHand={player.id === currentPlayerId}
                validationInfo={validationInfo}
                showValidation={showValidation && player.id === currentPlayerId}
              />
            </motion.div>
          ))}
        </div>

        {/* Área de acciones del jugador actual */}
        {currentPlayer && isMyTurn && (
          <motion.div 
            className="text-center space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
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

            {/* Información de cartas jugables */}
            {playableCards.length > 0 && (
              <p className="text-gray-300 text-sm">
                Cartas jugables: {playableCards.length} • Arrastra una carta a la zona de juego
              </p>
            )}
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
    </div>
  )
}
