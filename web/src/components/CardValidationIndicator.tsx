'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertTriangle, Target, Sparkles, Shield } from 'lucide-react'
import clsx from 'clsx'

interface ValidationState {
  isValid: boolean
  isPlayable: boolean
  errors: string[]
  warnings: string[]
  reason?: string
  willPurify?: boolean
  requiresTarget?: boolean
  isSpecial?: boolean
}

interface CardValidationIndicatorProps {
  validation: ValidationState
  isHovered?: boolean
  showDetails?: boolean
  className?: string
}

export default function CardValidationIndicator({
  validation,
  isHovered = false,
  showDetails = false,
  className = ''
}: CardValidationIndicatorProps) {
  const getValidationIcon = () => {
    if (!validation.isPlayable) {
      return <XCircle className="w-4 h-4 text-red-500" />
    }
    
    if (validation.willPurify) {
      return <Sparkles className="w-4 h-4 text-yellow-400" />
    }
    
    if (validation.requiresTarget) {
      return <Target className="w-4 h-4 text-purple-400" />
    }
    
    if (validation.isSpecial) {
      return <Shield className="w-4 h-4 text-blue-400" />
    }
    
    return <CheckCircle className="w-4 h-4 text-green-500" />
  }

  const getValidationColor = () => {
    if (!validation.isPlayable) {
      return 'border-red-500 bg-red-500/10'
    }
    
    if (validation.willPurify) {
      return 'border-yellow-400 bg-yellow-400/10'
    }
    
    if (validation.requiresTarget) {
      return 'border-purple-400 bg-purple-400/10'
    }
    
    if (validation.isSpecial) {
      return 'border-blue-400 bg-blue-400/10'
    }
    
    return 'border-green-500 bg-green-500/10'
  }

  const getValidationGlow = () => {
    if (!validation.isPlayable) {
      return 'shadow-red-500/50'
    }
    
    if (validation.willPurify) {
      return 'shadow-yellow-400/50'
    }
    
    if (validation.requiresTarget) {
      return 'shadow-purple-400/50'
    }
    
    if (validation.isSpecial) {
      return 'shadow-blue-400/50'
    }
    
    return 'shadow-green-500/50'
  }

  return (
    <div className={clsx('relative', className)}>
      {/* Indicador principal */}
      <AnimatePresence>
        {validation.isPlayable && (
          <motion.div
            className={clsx(
              'absolute -top-2 -right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center',
              getValidationColor(),
              getValidationGlow(),
              'z-10'
            )}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {getValidationIcon()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Indicador de carta no jugable */}
      <AnimatePresence>
        {!validation.isPlayable && (
          <motion.div
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full border-2 border-red-500 bg-red-500/10 flex items-center justify-center shadow-red-500/50 z-10"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <XCircle className="w-4 h-4 text-red-500" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tooltip de validación */}
      <AnimatePresence>
        {isHovered && showDetails && (
          <motion.div
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50"
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-xl max-w-xs">
              {/* Estado de validación */}
              <div className="flex items-center space-x-2 mb-2">
                {getValidationIcon()}
                <span className={clsx(
                  'font-semibold text-sm',
                  validation.isPlayable ? 'text-green-400' : 'text-red-400'
                )}>
                  {validation.isPlayable ? 'Carta Jugable' : 'Carta No Jugable'}
                </span>
              </div>

              {/* Razón */}
              {validation.reason && (
                <p className="text-xs text-gray-300 mb-2">
                  {validation.reason}
                </p>
              )}

              {/* Errores */}
              {validation.errors.length > 0 && (
                <div className="mb-2">
                  <div className="flex items-center space-x-1 mb-1">
                    <XCircle className="w-3 h-3 text-red-400" />
                    <span className="text-xs font-semibold text-red-400">Errores:</span>
                  </div>
                  <ul className="text-xs text-red-300 space-y-1">
                    {validation.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Advertencias */}
              {validation.warnings.length > 0 && (
                <div className="mb-2">
                  <div className="flex items-center space-x-1 mb-1">
                    <AlertTriangle className="w-3 h-3 text-yellow-400" />
                    <span className="text-xs font-semibold text-yellow-400">Advertencias:</span>
                  </div>
                  <ul className="text-xs text-yellow-300 space-y-1">
                    {validation.warnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Efectos especiales */}
              <div className="space-y-1">
                {validation.willPurify && (
                  <div className="flex items-center space-x-1 text-xs text-yellow-400">
                    <Sparkles className="w-3 h-3" />
                    <span>Purificará la Torre</span>
                  </div>
                )}
                
                {validation.requiresTarget && (
                  <div className="flex items-center space-x-1 text-xs text-purple-400">
                    <Target className="w-3 h-3" />
                    <span>Requiere objetivo</span>
                  </div>
                )}
                
                {validation.isSpecial && (
                  <div className="flex items-center space-x-1 text-xs text-blue-400">
                    <Shield className="w-3 h-3" />
                    <span>Carta especial</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay de carta no jugable */}
      <AnimatePresence>
        {!validation.isPlayable && (
          <motion.div
            className="absolute inset-0 bg-red-500/20 rounded pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      {/* Borde de validación */}
      <AnimatePresence>
        {validation.isPlayable && (
          <motion.div
            className={clsx(
              'absolute inset-0 rounded border-2 pointer-events-none',
              getValidationColor(),
              getValidationGlow()
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
