'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Crown, AlertCircle, CheckCircle, XCircle, Info, Trophy, Skull } from 'lucide-react'

interface GameStatusProps {
  gameState: 'waiting' | 'playing' | 'finished'
  currentPlayerId: string | null
  currentPlayerName?: string
  turnNumber: number
  timeLeft: number
  turnTime: number
  deckType: string
  phase: string
  notifications: Array<{
    id: string
    type: 'info' | 'success' | 'warning' | 'error'
    message: string
    timestamp: Date
  }>
  onDismissNotification: (id: string) => void
}

export default function GameStatus({
  gameState,
  currentPlayerId,
  currentPlayerName,
  turnNumber,
  timeLeft,
  turnTime,
  deckType,
  phase,
  notifications,
  onDismissNotification
}: GameStatusProps) {
  const [showNotifications, setShowNotifications] = useState(true)

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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-400" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />
      default:
        return <Info className="w-4 h-4 text-blue-400" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-500 bg-green-900/20'
      case 'warning':
        return 'border-yellow-500 bg-yellow-900/20'
      case 'error':
        return 'border-red-500 bg-red-900/20'
      default:
        return 'border-blue-500 bg-blue-900/20'
    }
  }

  // Auto-dismiss notifications after 5 seconds
  useEffect(() => {
    notifications.forEach(notification => {
      const timer = setTimeout(() => {
        onDismissNotification(notification.id)
      }, 5000)

      return () => clearTimeout(timer)
    })
  }, [notifications, onDismissNotification])

  return (
    <div className="fixed top-4 right-4 z-40 space-y-4">
      {/* Game Status Card */}
      <motion.div
        className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 border border-gray-600 shadow-xl"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Estado del Juego</h3>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400">Turno</span>
            <span className="text-sm font-bold text-accent-400">{turnNumber}</span>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Mazo:</span>
            <span className="text-white flex items-center space-x-1">
              <span>{getDeckIcon(deckType)}</span>
              <span className="capitalize">{deckType}</span>
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400">Fase:</span>
            <span className="text-white">{getPhaseName(phase)}</span>
          </div>

          {gameState === 'playing' && currentPlayerName && (
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Turno de:</span>
              <span className="text-accent-400 font-semibold">{currentPlayerName}</span>
            </div>
          )}

          {gameState === 'playing' && (
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Tiempo:</span>
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className={`font-mono ${timeLeft <= 10 ? 'text-red-400' : 'text-white'}`}>
                  {timeLeft}s
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar for Turn Time */}
        {gameState === 'playing' && (
          <div className="mt-3">
            <div className="w-full bg-gray-700 rounded-full h-1">
              <motion.div
                className="bg-accent-400 h-1 rounded-full"
                initial={{ width: '100%' }}
                animate={{ width: `${(timeLeft / turnTime) * 100}%` }}
                transition={{ duration: 1, ease: 'linear' }}
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Notifications */}
      <AnimatePresence>
        {showNotifications && notifications.length > 0 && (
          <div className="space-y-2">
            {notifications.slice(-3).map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: 100, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.8 }}
                className={`p-3 rounded-lg border ${getNotificationColor(notification.type)} shadow-xl max-w-sm`}
              >
                <div className="flex items-start space-x-2">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1">
                    <p className="text-sm text-white">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {notification.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  <button
                    onClick={() => onDismissNotification(notification.id)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Toggle Notifications Button */}
      {notifications.length > 0 && (
        <motion.button
          onClick={() => setShowNotifications(!showNotifications)}
          className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-2 border border-gray-600 shadow-xl text-white hover:bg-gray-700 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {showNotifications ? (
            <XCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
        </motion.button>
      )}
    </div>
  )
}
