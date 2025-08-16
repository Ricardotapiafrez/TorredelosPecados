'use client'

import { motion } from 'framer-motion'
import { Heart, Shield, Crown, User, Clock, AlertCircle, Play } from 'lucide-react'
import GameCard from './GameCard'

interface Player {
  id: string
  name: string
  hand?: any[]
  faceUpCreatures?: any[]
  faceDownCreatures?: any[]
  soulWell?: any[]
  currentPhase?: 'hand' | 'faceUp' | 'faceDown'
  health?: number
  hasShield?: boolean
  isReady?: boolean
  isAlive?: boolean
  score?: number
  handSize?: number
  soulWellSize?: number
  isSinner?: boolean
  isDisconnected?: boolean
}

interface PlayerAreaProps {
  player: Player
  isCurrentPlayer?: boolean
  isMyTurn?: boolean
  onCardClick?: (cardIndex: number) => void
  onCardDrop?: (card: any, targetZone: string) => void
  showHand?: boolean
  validationInfo?: any
  showValidation?: boolean
}

export default function PlayerArea({ 
  player, 
  isCurrentPlayer = false, 
  isMyTurn = false,
  onCardClick,
  onCardDrop,
  showHand = false,
  validationInfo,
  showValidation = false
}: PlayerAreaProps) {
  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'hand':
        return '✋'
      case 'faceUp':
        return '👁️'
      case 'faceDown':
        return '🃏'
      default:
        return '❓'
    }
  }

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'hand':
        return 'text-blue-400'
      case 'faceUp':
        return 'text-green-400'
      case 'faceDown':
        return 'text-purple-400'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <motion.div
      className={`player-area p-6 rounded-lg border-2 ${
        isCurrentPlayer 
          ? 'border-accent-400 bg-accent-900/20' 
          : isMyTurn 
          ? 'border-yellow-400 bg-yellow-900/20' 
          : 'border-gray-600 bg-gray-800/50'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Player Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <User className="w-8 h-8 text-secondary-300" />
            {player.isReady && (
              <motion.div
                className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
            {player.isDisconnected && (
              <motion.div
                className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </div>
          <div>
            <h3 className="font-bold text-white flex items-center space-x-2">
              <span>{player.name}</span>
              {player.isAlive === false && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-red-500"
                >
                  💀
                </motion.div>
              )}
              {player.isSinner && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-red-500"
                >
                  😈
                </motion.div>
              )}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-secondary-300">
              <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4 text-red-400" />
                <span>{player.health || 0}</span>
              </div>
              {player.hasShield && (
                <div className="flex items-center space-x-1">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span>Escudo</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Crown className="w-4 h-4 text-yellow-400" />
                <span>{player.score || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Turn Indicator */}
        {isMyTurn && (
          <motion.div
            className="bg-accent-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Play className="w-4 h-4" />
            <span>Tu Turno</span>
          </motion.div>
        )}

        {/* Status Indicators */}
        <div className="flex items-center space-x-2">
          {player.isDisconnected && (
            <div className="flex items-center space-x-1 text-yellow-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Desconectado</span>
            </div>
          )}
          
          {/* Phase Indicator */}
          <div className={`flex items-center space-x-1 text-sm ${getPhaseColor(player.currentPhase || 'hand')}`}>
            <span>{getPhaseIcon(player.currentPhase || 'hand')}</span>
            <span className="capitalize">{player.currentPhase || 'hand'}</span>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-2 bg-gray-700/50 rounded">
          <div className="text-lg font-bold text-white">{player.handSize || 0}</div>
          <div className="text-xs text-gray-400">Mano</div>
        </div>
        <div className="text-center p-2 bg-gray-700/50 rounded">
          <div className="text-lg font-bold text-white">{player.soulWellSize || 0}</div>
          <div className="text-xs text-gray-400">Pozo</div>
        </div>
        <div className="text-center p-2 bg-gray-700/50 rounded">
          <div className="text-lg font-bold text-white">
            {(player.faceUpCreatures?.length || 0) + (player.faceDownCreatures?.length || 0)}
          </div>
          <div className="text-xs text-gray-400">Criaturas</div>
        </div>
      </div>

      {/* Face Up Creatures Area */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-secondary-300 mb-3 flex items-center space-x-2">
          <span>👁️</span>
          <span>Criaturas Boca Arriba ({player.faceUpCreatures?.length || 0})</span>
        </h4>
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {player.faceUpCreatures?.map((creature, index) => (
            <motion.div
              key={`${creature.id}-${index}`}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <GameCard
                card={creature}
                className="w-20 h-28"
              />
            </motion.div>
          ))}
          {(!player.faceUpCreatures || player.faceUpCreatures.length === 0) && (
            <div className="w-20 h-28 border-2 border-dashed border-secondary-500 rounded-lg flex items-center justify-center">
              <span className="text-secondary-500 text-xs">Vacío</span>
            </div>
          )}
        </div>
      </div>

      {/* Face Down Creatures Area */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-secondary-300 mb-3 flex items-center space-x-2">
          <span>🃏</span>
          <span>Criaturas Boca Abajo ({player.faceDownCreatures?.length || 0})</span>
        </h4>
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {player.faceDownCreatures?.map((creature, index) => (
            <motion.div
              key={`${creature.id}-${index}`}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <GameCard
                card={creature}
                className="w-20 h-28"
                showBack={true}
              />
            </motion.div>
          ))}
          {(!player.faceDownCreatures || player.faceDownCreatures.length === 0) && (
            <div className="w-20 h-28 border-2 border-dashed border-secondary-500 rounded-lg flex items-center justify-center">
              <span className="text-secondary-500 text-xs">Vacío</span>
            </div>
          )}
        </div>
      </div>

      {/* Hand Area */}
      {showHand && (
        <div>
          <h4 className="text-sm font-semibold text-secondary-300 mb-3 flex items-center space-x-2">
            <span>✋</span>
            <span>Mano ({player.handSize || 0})</span>
          </h4>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {player.hand?.map((card, index) => {
              // Obtener validación para esta carta
              const cardValidation = validationInfo?.playableCards?.find((c: any) => c.id === card.id)
              const validation = cardValidation ? {
                isValid: true,
                isPlayable: true,
                errors: [],
                warnings: [],
                reason: 'Carta jugable',
                isSpecial: card.value === 2 || card.value === 8 || card.value === 10,
                requiresTarget: card.value === 2 || card.value === 8 || card.value === 10,
                willPurify: card.value === 10 || card.value === validationInfo?.lastPlayedCard?.value
              } : {
                isValid: false,
                isPlayable: false,
                errors: ['No puedes jugar esta carta'],
                warnings: [],
                reason: 'Valor insuficiente'
              }

              return (
                <motion.div
                  key={`${card.id}-${index}`}
                  initial={{ scale: 0, y: 50 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <GameCard
                    card={card}
                    onClick={() => onCardClick?.(index)}
                    isPlayable={isCurrentPlayer && isMyTurn}
                    isDraggable={isCurrentPlayer && isMyTurn}
                    validation={validation}
                    showValidation={showValidation}
                    onDragStart={(card, event) => {
                      // Agregar efecto visual al arrastrar
                      event.currentTarget.style.opacity = '0.5'
                    }}
                    onDragEnd={(card, event) => {
                      // Restaurar opacidad
                      event.currentTarget.style.opacity = '1'
                    }}
                    className="w-20 h-28"
                  />
                </motion.div>
              )
            })}
            {(!player.hand || player.hand.length === 0) && (
              <div className="w-20 h-28 border-2 border-dashed border-secondary-500 rounded-lg flex items-center justify-center">
                <span className="text-secondary-500 text-xs">Vacío</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hand Size Indicator (when not showing hand) */}
      {!showHand && (
        <div className="flex items-center space-x-2 text-sm text-secondary-300">
          <span>✋ Cartas en mano: {player.handSize}</span>
        </div>
      )}
    </motion.div>
  )
}
