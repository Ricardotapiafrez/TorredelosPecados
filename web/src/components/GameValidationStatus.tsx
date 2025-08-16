'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Target, 
  Sparkles, 
  Shield,
  Info,
  Play,
  Skip
} from 'lucide-react'
import clsx from 'clsx'

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

interface GameValidationStatusProps {
  validationInfo: ValidationInfo | null
  isVisible?: boolean
  className?: string
}

export default function GameValidationStatus({
  validationInfo,
  isVisible = true,
  className = ''
}: GameValidationStatusProps) {
  if (!isVisible || !validationInfo) return null

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

  const getStatusColor = () => {
    if (!validationInfo.isCurrentTurn) {
      return 'border-gray-600 bg-gray-800/50'
    }
    
    if (validationInfo.canPlay) {
      return 'border-green-500 bg-green-500/10'
    }
    
    if (validationInfo.shouldTakeDiscardPile) {
      return 'border-yellow-500 bg-yellow-500/10'
    }
    
    return 'border-red-500 bg-red-500/10'
  }

  const getStatusIcon = () => {
    if (!validationInfo.isCurrentTurn) {
      return <Clock className="w-5 h-5 text-gray-400" />
    }
    
    if (validationInfo.canPlay) {
      return <CheckCircle className="w-5 h-5 text-green-400" />
    }
    
    if (validationInfo.shouldTakeDiscardPile) {
      return <Skip className="w-5 h-5 text-yellow-400" />
    }
    
    return <XCircle className="w-5 h-5 text-red-400" />
  }

  return (
    <AnimatePresence>
      <motion.div
        className={clsx(
          'fixed top-4 left-4 z-40 max-w-sm',
          className
        )}
        initial={{ opacity: 0, x: -20, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: -20, scale: 0.9 }}
        transition={{ duration: 0.3 }}
      >
        <div className={clsx(
          'rounded-lg border-2 p-4 shadow-xl backdrop-blur-sm',
          getStatusColor()
        )}>
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <h3 className="font-semibold text-white text-sm">
                Estado de Validación
              </h3>
            </div>
            <Info className="w-4 h-4 text-gray-400" />
          </div>

          {/* Turno actual */}
          <div className="mb-3">
            <div className="flex items-center space-x-2 text-sm">
              <span className={clsx(
                'font-medium',
                validationInfo.isCurrentTurn ? 'text-green-400' : 'text-gray-400'
              )}>
                {validationInfo.isCurrentTurn ? 'Tu Turno' : 'Esperando turno'}
              </span>
              {validationInfo.turnInfo?.timeLeft && (
                <span className="text-xs text-gray-400">
                  ({validationInfo.turnInfo.timeLeft}s)
                </span>
              )}
            </div>
          </div>

          {/* Fase actual */}
          <div className="mb-3">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-400">Fase:</span>
              <span className={clsx('font-medium', getPhaseColor(validationInfo.currentPhase))}>
                {getPhaseIcon(validationInfo.currentPhase)} {validationInfo.currentPhase}
              </span>
            </div>
          </div>

          {/* Estado de juego */}
          <div className="space-y-2 mb-3">
            {validationInfo.canPlay && (
              <div className="flex items-center space-x-2 text-sm text-green-400">
                <Play className="w-4 h-4" />
                <span>Puedes jugar {validationInfo.playableCards.length} carta(s)</span>
              </div>
            )}

            {validationInfo.shouldTakeDiscardPile && (
              <div className="flex items-center space-x-2 text-sm text-yellow-400">
                <Skip className="w-4 h-4" />
                <span>Debes tomar la Torre de los Pecados</span>
              </div>
            )}

            {validationInfo.nextPlayerCanPlayAnything && (
              <div className="flex items-center space-x-2 text-sm text-blue-400">
                <Shield className="w-4 h-4" />
                <span>Puedes jugar cualquier carta</span>
              </div>
            )}

            {validationInfo.lastPlayedCard && (
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <span>Última carta: {validationInfo.lastPlayedCard.name} ({validationInfo.lastPlayedCard.value})</span>
              </div>
            )}
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-700/50 rounded p-2">
              <div className="text-white font-semibold">{validationInfo.handSize}</div>
              <div className="text-gray-400">Mano</div>
            </div>
            <div className="bg-gray-700/50 rounded p-2">
              <div className="text-white font-semibold">{validationInfo.faceUpSize}</div>
              <div className="text-gray-400">Boca Arriba</div>
            </div>
            <div className="bg-gray-700/50 rounded p-2">
              <div className="text-white font-semibold">{validationInfo.faceDownSize}</div>
              <div className="text-gray-400">Boca Abajo</div>
            </div>
            <div className="bg-gray-700/50 rounded p-2">
              <div className="text-white font-semibold">{validationInfo.soulWellSize}</div>
              <div className="text-gray-400">Pozo</div>
            </div>
          </div>

          {/* Torre de los Pecados */}
          <div className="mt-3 pt-3 border-t border-gray-600">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Torre de los Pecados:</span>
              <span className="text-white font-semibold">{validationInfo.discardPileSize} cartas</span>
            </div>
          </div>

          {/* Advertencias */}
          <AnimatePresence>
            {validationInfo.turnValidation?.warnings?.length > 0 && (
              <motion.div
                className="mt-3 pt-3 border-t border-gray-600"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="flex items-center space-x-1 mb-2">
                  <AlertTriangle className="w-3 h-3 text-yellow-400" />
                  <span className="text-xs font-semibold text-yellow-400">Advertencias:</span>
                </div>
                <ul className="text-xs text-yellow-300 space-y-1">
                  {validationInfo.turnValidation.warnings.map((warning: string, index: number) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
