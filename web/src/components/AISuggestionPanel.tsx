'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  Lightbulb, 
  Target, 
  Zap, 
  Settings, 
  X, 
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Info,
  Crown,
  Sparkles
} from 'lucide-react'
import { AISuggestion, DifficultyInfo } from '@/hooks/useAI'
import clsx from 'clsx'

interface AISuggestionPanelProps {
  suggestion: AISuggestion | null
  difficulties: Record<string, DifficultyInfo> | null
  currentDifficulty: string
  loading: boolean
  error: string | null
  onGetSuggestion: (difficulty?: string) => void
  onClearSuggestion: () => void
  onClearError: () => void
  onSetDifficulty: (difficulty: string) => void
  isVisible?: boolean
  className?: string
}

export default function AISuggestionPanel({
  suggestion,
  difficulties,
  currentDifficulty,
  loading,
  error,
  onGetSuggestion,
  onClearSuggestion,
  onClearError,
  onSetDifficulty,
  isVisible = true,
  className = ''
}: AISuggestionPanelProps) {
  const [showSettings, setShowSettings] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-400 bg-green-500/10 border-green-500'
      case 'intermediate':
        return 'text-blue-400 bg-blue-500/10 border-blue-500'
      case 'advanced':
        return 'text-purple-400 bg-purple-500/10 border-purple-500'
      case 'expert':
        return 'text-red-400 bg-red-500/10 border-red-500'
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500'
    }
  }

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return <Target className="w-4 h-4" />
      case 'intermediate':
        return <Zap className="w-4 h-4" />
      case 'advanced':
        return <Brain className="w-4 h-4" />
      case 'expert':
        return <Crown className="w-4 h-4" />
      default:
        return <Info className="w-4 h-4" />
    }
  }

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'playCard':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'takeDiscardPile':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      default:
        return <Info className="w-5 h-5 text-blue-400" />
    }
  }

  const getRecommendationText = (recommendation: string) => {
    switch (recommendation) {
      case 'playCard':
        return 'Jugar carta'
      case 'takeDiscardPile':
        return 'Tomar mazo de descarte'
      default:
        return 'Sin recomendación'
    }
  }

  if (!isVisible) return null

  return (
    <div className={clsx('relative', className)}>
      {/* Panel principal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/90 backdrop-blur-sm border border-gray-600 rounded-lg p-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Asistente IA</h3>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 rounded-md hover:bg-gray-700 transition-colors"
              title="Configuración de IA"
            >
              <Settings className="w-4 h-4 text-gray-400" />
            </button>
            
            {suggestion && (
              <button
                onClick={onClearSuggestion}
                className="p-1.5 rounded-md hover:bg-gray-700 transition-colors"
                title="Limpiar sugerencia"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Configuración de dificultad */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 bg-gray-700/50 rounded-md"
            >
              <h4 className="text-sm font-medium text-gray-300 mb-2">Nivel de Dificultad</h4>
              <div className="grid grid-cols-2 gap-2">
                {difficulties && Object.entries(difficulties).map(([key, info]) => (
                  <button
                    key={key}
                    onClick={() => {
                      onSetDifficulty(key)
                      setShowSettings(false)
                    }}
                    className={clsx(
                      'p-2 rounded-md border text-left transition-all',
                      currentDifficulty === key
                        ? getDifficultyColor(key)
                        : 'text-gray-400 bg-gray-700/50 border-gray-600 hover:bg-gray-700'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {getDifficultyIcon(key)}
                      <span className="text-sm font-medium">{info.name}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{info.description}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-400">{error}</span>
                <button
                  onClick={onClearError}
                  className="ml-auto p-1 rounded hover:bg-red-500/20"
                >
                  <X className="w-3 h-3 text-red-400" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contenido principal */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-purple-400 animate-spin" />
              <span className="text-gray-400">Analizando jugada...</span>
            </div>
          </div>
        ) : suggestion ? (
          <div className="space-y-4">
            {/* Recomendación principal */}
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                {getRecommendationIcon(suggestion.recommendation)}
                <h4 className="font-medium text-white">
                  {getRecommendationText(suggestion.recommendation)}
                </h4>
              </div>

              {suggestion.bestMove && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Carta recomendada:</span>
                    <span className="text-sm font-medium text-white">
                      {suggestion.bestMove.card.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Puntuación:</span>
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-medium text-yellow-400">
                        {suggestion.bestMove.score}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Análisis */}
              <div className="mt-4 pt-3 border-t border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">Análisis:</span>
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-xs text-purple-400 hover:text-purple-300"
                  >
                    {showDetails ? 'Ocultar' : 'Ver detalles'}
                  </button>
                </div>
                
                <p className="text-sm text-gray-400 leading-relaxed">
                  {suggestion.analysis.reasoning}
                </p>

                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 space-y-2"
                    >
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-gray-600/30 rounded p-2">
                          <span className="text-gray-400">Cartas totales:</span>
                          <div className="font-medium text-white">{suggestion.analysis.totalCards}</div>
                        </div>
                        <div className="bg-gray-600/30 rounded p-2">
                          <span className="text-gray-400">Cartas jugables:</span>
                          <div className="font-medium text-white">{suggestion.analysis.playableCards}</div>
                        </div>
                      </div>

                      {suggestion.analysis.alternatives.length > 0 && (
                        <div>
                          <span className="text-xs text-gray-400">Alternativas:</span>
                          <div className="mt-1 space-y-1">
                            {suggestion.analysis.alternatives.map((alt, index) => (
                              <div key={index} className="flex items-center justify-between text-xs">
                                <span className="text-gray-300">{alt.card}</span>
                                <div className="flex items-center gap-1">
                                  <span className="text-yellow-400">{alt.score}</span>
                                  <span className="text-gray-500">•</span>
                                  <span className="text-gray-400">{alt.reason}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Lightbulb className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400 mb-4">
              Obtén sugerencias inteligentes sobre qué carta jugar
            </p>
            <button
              onClick={() => onGetSuggestion()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors flex items-center gap-2 mx-auto"
            >
              <Brain className="w-4 h-4" />
              Obtener Sugerencia
            </button>
          </div>
        )}

        {/* Footer */}
        {difficulties && currentDifficulty && (
          <div className="mt-4 pt-3 border-t border-gray-600">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Nivel actual:</span>
              <div className={clsx(
                'px-2 py-1 rounded border text-xs',
                getDifficultyColor(currentDifficulty)
              )}>
                <div className="flex items-center gap-1">
                  {getDifficultyIcon(currentDifficulty)}
                  <span>{difficulties[currentDifficulty]?.name}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
