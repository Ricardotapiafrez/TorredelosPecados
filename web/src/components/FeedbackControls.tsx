'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Settings, 
  Bell, 
  Volume2, 
  Sparkles, 
  Eye, 
  EyeOff,
  X,
  Check
} from 'lucide-react'
import clsx from 'clsx'

interface FeedbackSettings {
  notifications: boolean
  soundEffects: boolean
  visualEffects: boolean
  validationIndicators: boolean
  celebrationEffects: boolean
}

interface FeedbackControlsProps {
  settings: FeedbackSettings
  onSettingsChange: (settings: FeedbackSettings) => void
  isVisible?: boolean
  onClose?: () => void
  className?: string
}

export default function FeedbackControls({
  settings,
  onSettingsChange,
  isVisible = false,
  onClose,
  className = ''
}: FeedbackControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSettingToggle = (key: keyof FeedbackSettings) => {
    const newSettings = {
      ...settings,
      [key]: !settings[key]
    }
    onSettingsChange(newSettings)
  }

  const getSettingIcon = (key: keyof FeedbackSettings) => {
    switch (key) {
      case 'notifications':
        return <Bell className="w-4 h-4" />
      case 'soundEffects':
        return <Volume2 className="w-4 h-4" />
      case 'visualEffects':
        return <Sparkles className="w-4 h-4" />
      case 'validationIndicators':
        return <Eye className="w-4 h-4" />
      case 'celebrationEffects':
        return <Sparkles className="w-4 h-4" />
      default:
        return <Settings className="w-4 h-4" />
    }
  }

  const getSettingLabel = (key: keyof FeedbackSettings) => {
    switch (key) {
      case 'notifications':
        return 'Notificaciones'
      case 'soundEffects':
        return 'Efectos de Sonido'
      case 'visualEffects':
        return 'Efectos Visuales'
      case 'validationIndicators':
        return 'Indicadores de Validación'
      case 'celebrationEffects':
        return 'Efectos de Celebración'
      default:
        return 'Configuración'
    }
  }

  const getSettingDescription = (key: keyof FeedbackSettings) => {
    switch (key) {
      case 'notifications':
        return 'Mostrar notificaciones de acciones'
      case 'soundEffects':
        return 'Reproducir efectos de sonido visuales'
      case 'visualEffects':
        return 'Mostrar efectos en cartas y elementos'
      case 'validationIndicators':
        return 'Mostrar indicadores de validación'
      case 'celebrationEffects':
        return 'Efectos especiales para eventos importantes'
      default:
        return 'Configuración general'
    }
  }

  if (!isVisible) return null

  return (
    <div className={clsx('fixed bottom-4 left-4 z-50', className)}>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          transition={{ duration: 0.3 }}
        >
          {/* Botón principal */}
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-xl hover:bg-gray-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Settings className="w-5 h-5 text-gray-300" />
          </motion.button>

          {/* Panel expandido */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                className="absolute bottom-full left-0 mb-2 bg-gray-800 border border-gray-600 rounded-lg shadow-xl p-4 min-w-[280px]"
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white">Configuración de Efectos</h3>
                  {onClose && (
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Configuraciones */}
                <div className="space-y-3">
                  {Object.entries(settings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={clsx(
                          'p-2 rounded-lg',
                          value ? 'bg-green-500/20 text-green-400' : 'bg-gray-700/50 text-gray-400'
                        )}>
                          {getSettingIcon(key as keyof FeedbackSettings)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">
                            {getSettingLabel(key as keyof FeedbackSettings)}
                          </div>
                          <div className="text-xs text-gray-400">
                            {getSettingDescription(key as keyof FeedbackSettings)}
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleSettingToggle(key as keyof FeedbackSettings)}
                        className={clsx(
                          'relative w-12 h-6 rounded-full transition-colors',
                          value ? 'bg-green-500' : 'bg-gray-600'
                        )}
                      >
                        <motion.div
                          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                          animate={{ x: value ? 24 : 2 }}
                          transition={{ duration: 0.2 }}
                        />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="mt-4 pt-3 border-t border-gray-600">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Efectos activos: {Object.values(settings).filter(Boolean).length}</span>
                    <div className="flex items-center space-x-1">
                      <Check className="w-3 h-3 text-green-400" />
                      <span>Guardado automáticamente</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// Componente para mostrar indicadores de estado
interface FeedbackStatusProps {
  settings: FeedbackSettings
  className?: string
}

export function FeedbackStatus({ settings, className = '' }: FeedbackStatusProps) {
  const activeCount = Object.values(settings).filter(Boolean).length

  return (
    <div className={clsx('flex items-center space-x-2 text-xs text-gray-400', className)}>
      <div className="flex items-center space-x-1">
        <Sparkles className="w-3 h-3" />
        <span>Efectos: {activeCount}/{Object.keys(settings).length}</span>
      </div>
      
      {activeCount === 0 && (
        <div className="flex items-center space-x-1 text-yellow-400">
          <EyeOff className="w-3 h-3" />
          <span>Desactivados</span>
        </div>
      )}
      
      {activeCount === Object.keys(settings).length && (
        <div className="flex items-center space-x-1 text-green-400">
          <Check className="w-3 h-3" />
          <span>Todos activos</span>
        </div>
      )}
    </div>
  )
}
