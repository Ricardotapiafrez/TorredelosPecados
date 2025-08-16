'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  Clock, 
  X, 
  Eye, 
  EyeOff,
  Crown,
  Zap,
  Target,
  Sparkles,
  Gamepad2
} from 'lucide-react'
import clsx from 'clsx'

interface AIAction {
  playerId: string
  playerName: string
  personality: string
  action: string
  card?: any
  reason: string
  difficulty: string
  timestamp: Date
}

interface AIActionLogProps {
  actions: AIAction[]
  isVisible?: boolean
  onToggleVisibility?: () => void
  onClearActions?: () => void
  className?: string
}

export default function AIActionLog({
  actions,
  isVisible = true,
  onToggleVisibility,
  onClearActions,
  className = ''
}: AIActionLogProps) {
  const [showDetails, setShowDetails] = useState(false)

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return <Target className="w-4 h-4 text-green-400" />
      case 'intermediate':
        return <Zap className="w-4 h-4 text-blue-400" />
      case 'advanced':
        return <Brain className="w-4 h-4 text-purple-400" />
      case 'expert':
        return <Crown className="w-4 h-4 text-red-400" />
      default:
        return <Brain className="w-4 h-4 text-gray-400" />
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'playCard':
        return <Gamepad2 className="w-4 h-4 text-green-400" />
      case 'takeDiscardPile':
        return <Sparkles className="w-4 h-4 text-yellow-400" />
      default:
        return <Brain className="w-4 h-4 text-gray-400" />
    }
  }

  const getActionText = (action: string) => {
    switch (action) {
      case 'playCard':
        return 'Jugó carta'
      case 'takeDiscardPile':
        return 'Tomó mazo de descarte'
      default:
        return action
    }
  }

  const formatTime = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const seconds = Math.floor(diff / 1000)
    
    if (seconds < 60) {
      return `hace ${seconds}s`
    } else {
      const minutes = Math.floor(seconds / 60)
      return `hace ${minutes}m`
    }
  }

  const getPersonalityColor = (personality: string) => {
    if (personality.includes('Protector') || personality.includes('Guardián')) {
      return 'text-green-400'
    } else if (personality.includes('Demonio') || personality.includes('Infierno')) {
      return 'text-red-400'
    } else if (personality.includes('Dragón')) {
      return 'text-orange-400'
    } else if (personality.includes('Mago')) {
      return 'text-purple-400'
    } else {
      return 'text-blue-400'
    }
  }

  if (!isVisible) return null

  return (
    <div className={clsx('relative', className)}>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-gray-800/90 backdrop-blur-sm border border-gray-600 rounded-lg"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-600">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Acciones de IA</h3>
            {actions.length > 0 && (
              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                {actions.length}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {onToggleVisibility && (
              <button
                onClick={onToggleVisibility}
                className="p-1.5 rounded-md hover:bg-gray-700 transition-colors"
                title="Ocultar log"
              >
                <EyeOff className="w-4 h-4 text-gray-400" />
              </button>
            )}
            
            {onClearActions && actions.length > 0 && (
              <button
                onClick={onClearActions}
                className="p-1.5 rounded-md hover:bg-gray-700 transition-colors"
                title="Limpiar log"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Contenido */}
        <div className="max-h-96 overflow-y-auto">
          {actions.length === 0 ? (
            <div className="p-6 text-center">
              <Brain className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">No hay acciones de IA registradas</p>
              <p className="text-xs text-gray-500 mt-1">
                Las acciones aparecerán aquí cuando las IA jueguen
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {actions.slice().reverse().map((action, index) => (
                <motion.div
                  key={`${action.playerId}-${action.timestamp.getTime()}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-700/50 rounded-lg p-3 border border-gray-600"
                >
                  {/* Header de la acción */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getActionIcon(action.action)}
                      <span className="text-sm font-medium text-white">
                        {getActionText(action.action)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {formatTime(action.timestamp)}
                    </div>
                  </div>

                  {/* Información del jugador */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">
                        {action.playerName}
                      </span>
                      <span className={clsx('text-xs', getPersonalityColor(action.personality))}>
                        {action.personality}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {getDifficultyIcon(action.difficulty)}
                      <span className="text-xs text-gray-400 capitalize">
                        {action.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Detalles de la acción */}
                  <AnimatePresence>
                    {showDetails && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 pt-2 border-t border-gray-600"
                      >
                        {action.card && (
                          <div className="mb-2">
                            <span className="text-xs text-gray-400">Carta:</span>
                            <span className="text-xs text-white ml-1">
                              {action.card.name} (valor: {action.card.value})
                            </span>
                          </div>
                        )}
                        <div>
                          <span className="text-xs text-gray-400">Razón:</span>
                          <span className="text-xs text-gray-300 ml-1">
                            {action.reason}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Botón para mostrar/ocultar detalles */}
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="mt-2 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    {showDetails ? 'Ocultar detalles' : 'Ver detalles'}
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {actions.length > 0 && (
          <div className="p-3 border-t border-gray-600 bg-gray-700/30">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Mostrando últimas {actions.length} acciones</span>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                {showDetails ? 'Ocultar todos' : 'Mostrar todos'}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
