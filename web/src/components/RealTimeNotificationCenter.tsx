'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  X, 
  Settings, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  XCircle,
  Gamepad2,
  Wifi,
  Users,
  Clock,
  Volume2,
  VolumeX
} from 'lucide-react'
import { RealTimeNotification } from '@/hooks/useRealTimeNotifications'
import clsx from 'clsx'

interface RealTimeNotificationCenterProps {
  notifications: RealTimeNotification[]
  onRemove: (id: string) => void
  onClearAll: () => void
  onSettingsChange?: (settings: any) => void
  settings?: any
  isVisible?: boolean
  onToggleVisibility?: () => void
  className?: string
}

export default function RealTimeNotificationCenter({
  notifications,
  onRemove,
  onClearAll,
  onSettingsChange,
  settings,
  isVisible = true,
  onToggleVisibility,
  className = ''
}: RealTimeNotificationCenterProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4" />
      case 'error':
        return <XCircle className="w-4 h-4" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />
      case 'info':
        return <Info className="w-4 h-4" />
      case 'game':
        return <Gamepad2 className="w-4 h-4" />
      case 'system':
        return <Wifi className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-500 bg-green-500/10 text-green-400'
      case 'error':
        return 'border-red-500 bg-red-500/10 text-red-400'
      case 'warning':
        return 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
      case 'info':
        return 'border-blue-500 bg-blue-500/10 text-blue-400'
      case 'game':
        return 'border-purple-500 bg-purple-500/10 text-purple-400'
      case 'system':
        return 'border-gray-500 bg-gray-500/10 text-gray-400'
      default:
        return 'border-gray-500 bg-gray-500/10 text-gray-400'
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)

    if (minutes > 0) {
      return `hace ${minutes}m ${seconds}s`
    } else {
      return `hace ${seconds}s`
    }
  }

  const getNotificationCount = () => {
    return notifications.length
  }

  const getUnreadCount = () => {
    return notifications.filter(n => !n.persistent).length
  }

  if (!isVisible) return null

  return (
    <div className={clsx('fixed top-4 left-4 z-50', className)}>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.8 }}
          transition={{ duration: 0.3 }}
        >
          {/* Botón principal */}
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            className="relative bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-xl hover:bg-gray-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell className="w-5 h-5 text-gray-300" />
            
            {/* Badge de notificaciones */}
            {getNotificationCount() > 0 && (
              <motion.div
                className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                {getNotificationCount() > 9 ? '9+' : getNotificationCount()}
              </motion.div>
            )}
          </motion.button>

          {/* Panel expandido */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                className="absolute top-full left-0 mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-xl p-4 min-w-[320px] max-w-[400px]"
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-gray-300" />
                    <h3 className="text-sm font-semibold text-white">
                      Notificaciones ({getNotificationCount()})
                    </h3>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className="text-gray-400 hover:text-white transition-colors p-1"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    
                    {getNotificationCount() > 0 && (
                      <button
                        onClick={onClearAll}
                        className="text-gray-400 hover:text-white transition-colors p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Configuración */}
                <AnimatePresence>
                  {showSettings && (
                    <motion.div
                      className="mb-4 p-3 bg-gray-700 rounded-lg"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <h4 className="text-xs font-medium text-gray-300 mb-2">Configuración</h4>
                      <div className="space-y-2">
                        {settings && Object.entries(settings).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between">
                            <span className="text-xs text-gray-400 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                            </span>
                            <button
                              onClick={() => onSettingsChange?.({ ...settings, [key]: !value })}
                              className={clsx(
                                'relative w-8 h-4 rounded-full transition-colors',
                                value ? 'bg-green-500' : 'bg-gray-600'
                              )}
                            >
                              <motion.div
                                className="absolute top-0.5 w-3 h-3 bg-white rounded-full shadow"
                                animate={{ x: value ? 16 : 2 }}
                                transition={{ duration: 0.2 }}
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Lista de notificaciones */}
                <div className="max-h-64 overflow-y-auto space-y-2">
                  <AnimatePresence mode="popLayout">
                    {notifications.length === 0 ? (
                      <motion.div
                        className="text-center py-8 text-gray-400"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No hay notificaciones</p>
                      </motion.div>
                    ) : (
                      notifications.map((notification, index) => (
                        <motion.div
                          key={notification.id}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                          className={clsx(
                            'relative rounded-lg border p-3',
                            getNotificationColor(notification.type)
                          )}
                        >
                          {/* Header */}
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              {getNotificationIcon(notification.type)}
                              <h4 className="text-sm font-medium">
                                {notification.title}
                              </h4>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-400">
                                {formatTimestamp(notification.timestamp)}
                              </span>
                              
                              <button
                                onClick={() => onRemove(notification.id)}
                                className="text-gray-400 hover:text-white transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Mensaje */}
                          <p className="text-sm text-gray-300 mb-2">
                            {notification.message}
                          </p>

                          {/* Acción */}
                          {notification.action && (
                            <button
                              onClick={notification.action.onClick}
                              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              {notification.action.label}
                            </button>
                          )}

                          {/* Indicador de persistente */}
                          {notification.persistent && (
                            <div className="absolute top-2 right-2">
                              <Clock className="w-3 h-3 text-yellow-400" />
                            </div>
                          )}
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-600">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>
                        {getUnreadCount()} sin leer de {getNotificationCount()} total
                      </span>
                      <button
                        onClick={onClearAll}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Limpiar todas
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// Componente para mostrar notificaciones flotantes
interface FloatingNotificationProps {
  notification: RealTimeNotification
  onRemove: (id: string) => void
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

export function FloatingNotification({ 
  notification, 
  onRemove, 
  position = 'top-right' 
}: FloatingNotificationProps) {
  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4'
      case 'top-left':
        return 'top-4 left-4'
      case 'bottom-right':
        return 'bottom-4 right-4'
      case 'bottom-left':
        return 'bottom-4 left-4'
      default:
        return 'top-4 right-4'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-500 bg-green-500/10 text-green-400'
      case 'error':
        return 'border-red-500 bg-red-500/10 text-red-400'
      case 'warning':
        return 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
      case 'info':
        return 'border-blue-500 bg-blue-500/10 text-blue-400'
      case 'game':
        return 'border-purple-500 bg-purple-500/10 text-purple-400'
      case 'system':
        return 'border-gray-500 bg-gray-500/10 text-gray-400'
      default:
        return 'border-gray-500 bg-gray-500/10 text-gray-400'
    }
  }

  return (
    <motion.div
      className={clsx(
        'fixed z-50 max-w-sm w-full',
        getPositionClasses()
      )}
      initial={{ opacity: 0, x: position.includes('right') ? 100 : -100, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: position.includes('right') ? 100 : -100, scale: 0.8 }}
      transition={{ duration: 0.3 }}
    >
      <div className={clsx(
        'rounded-lg border p-4 shadow-xl backdrop-blur-sm',
        getNotificationColor(notification.type)
      )}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-1">
              {notification.title}
            </h4>
            <p className="text-sm text-gray-300">
              {notification.message}
            </p>
          </div>
          
          <button
            onClick={() => onRemove(notification.id)}
            className="text-gray-400 hover:text-white transition-colors ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
