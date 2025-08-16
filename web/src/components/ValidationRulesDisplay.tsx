'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpen, 
  X, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Target,
  Sparkles,
  Shield,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'
import clsx from 'clsx'

interface ValidationRule {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  examples: string[]
}

interface ValidationRulesDisplayProps {
  isVisible?: boolean
  onClose?: () => void
  lastPlayedCard?: any
  nextPlayerCanPlayAnything?: boolean
  className?: string
}

export default function ValidationRulesDisplay({
  isVisible = false,
  onClose,
  lastPlayedCard,
  nextPlayerCanPlayAnything = false,
  className = ''
}: ValidationRulesDisplayProps) {
  const [activeTab, setActiveTab] = useState('basic')

  const validationRules: ValidationRule[] = [
    {
      id: 'basic',
      title: 'Reglas Básicas',
      description: 'Reglas fundamentales para jugar cartas',
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'text-green-400',
      examples: [
        'Debe ser tu turno para jugar',
        'La carta debe estar en la fase correcta',
        'El jugador debe estar vivo'
      ]
    },
    {
      id: 'values',
      title: 'Valores de Cartas',
      description: 'Reglas de comparación de valores',
      icon: <ArrowUp className="w-5 h-5" />,
      color: 'text-blue-400',
      examples: [
        lastPlayedCard 
          ? `Debe ser ≥ ${lastPlayedCard.value} (última carta: ${lastPlayedCard.name})`
          : 'Puedes jugar cualquier carta (primera jugada)',
        nextPlayerCanPlayAnything 
          ? 'Puedes jugar cualquier carta (efecto del 2)'
          : 'Valor debe ser igual o mayor al de la última carta'
      ]
    },
    {
      id: 'special',
      title: 'Cartas Especiales',
      description: 'Cartas con efectos especiales',
      icon: <Shield className="w-5 h-5" />,
      color: 'text-purple-400',
      examples: [
        '2: Poder Universal - Se puede jugar sobre cualquier carta',
        '8: Poder de Salto - Salta al siguiente jugador',
        '10: Poder de Purificación - Purifica la Torre de los Pecados'
      ]
    },
    {
      id: 'phases',
      title: 'Fases del Juego',
      description: 'Reglas específicas por fase',
      icon: <Target className="w-5 h-5" />,
      color: 'text-yellow-400',
      examples: [
        'Fase de Mano: Robarás una carta del Pozo de Almas',
        'Fase de Criaturas Boca Arriba: No puedes robar del Pozo',
        'Fase de Criaturas Boca Abajo: Si la carta es inválida, tomarás la Torre'
      ]
    },
    {
      id: 'purification',
      title: 'Purificación',
      description: 'Cuándo se purifica la Torre',
      icon: <Sparkles className="w-5 h-5" />,
      color: 'text-orange-400',
      examples: [
        'Carta 10 siempre purifica',
        'Mismo valor que la última carta jugada',
        '4 cartas del mismo valor en la Torre'
      ]
    }
  ]

  const getCurrentRule = () => {
    return validationRules.find(rule => rule.id === activeTab) || validationRules[0]
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        className={clsx(
          'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4',
          className
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
          initial={{ scale: 0.8, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-600">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-bold text-white">Reglas de Validación</h2>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-600">
            {validationRules.map((rule) => (
              <button
                key={rule.id}
                onClick={() => setActiveTab(rule.id)}
                className={clsx(
                  'flex-1 px-4 py-3 text-sm font-medium transition-colors',
                  activeTab === rule.id
                    ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'
                )}
              >
                <div className="flex items-center justify-center space-x-2">
                  {rule.icon}
                  <span className="hidden sm:inline">{rule.title}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <div className="space-y-6">
              {/* Regla actual */}
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className={clsx('p-2 rounded-lg bg-gray-700', getCurrentRule().color)}>
                    {getCurrentRule().icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {getCurrentRule().title}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {getCurrentRule().description}
                    </p>
                  </div>
                </div>

                {/* Ejemplos */}
                <div className="space-y-3">
                  {getCurrentRule().examples.map((example, index) => (
                    <motion.div
                      key={index}
                      className="flex items-start space-x-3 p-3 bg-gray-700/50 rounded-lg"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-300">{example}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Estado actual del juego */}
              <div className="border-t border-gray-600 pt-6">
                <h4 className="text-md font-semibold text-white mb-3">Estado Actual</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-gray-400 text-sm">Última carta:</span>
                      {lastPlayedCard ? (
                        <span className="text-white font-semibold">
                          {lastPlayedCard.name} ({lastPlayedCard.value})
                        </span>
                      ) : (
                        <span className="text-gray-500">Ninguna</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-gray-400 text-sm">Puedes jugar:</span>
                      {nextPlayerCanPlayAnything ? (
                        <span className="text-green-400 font-semibold">Cualquier carta</span>
                      ) : (
                        <span className="text-blue-400 font-semibold">Valor ≥ {lastPlayedCard?.value || 'cualquiera'}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-600 bg-gray-700/20">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">
                Las reglas se aplican automáticamente durante el juego
              </p>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <CheckCircle className="w-3 h-3 text-green-400" />
                <span>Validación en tiempo real</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
