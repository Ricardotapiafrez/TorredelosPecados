'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Sparkles,
  X,
  Play,
  Skip,
  Target,
  Crown,
  Shield
} from 'lucide-react'
import { ActionFeedback } from '@/hooks/useActionFeedback'
import clsx from 'clsx'

interface ActionFeedbackNotificationsProps {
  notifications: ActionFeedback[]
  onRemove: (id: string) => void
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center'
  maxHeight?: string
  className?: string
}

export default function ActionFeedbackNotifications({
  notifications,
  onRemove,
  position = 'top-right',
  maxHeight = '80vh',
  className = ''
}: ActionFeedbackNotificationsProps) {
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4'
      case 'top-right':
        return 'top-4 right-4'
      case 'bottom-left':
        return 'bottom-4 left-4'
      case 'bottom-right':
        return 'bottom-4 right-4'
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2'
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2'
      default:
        return 'top-4 right-4'
    }
  }

  const getFeedbackIcon = (feedback: ActionFeedback) => {
    if (feedback.icon) {
      return <span className="text-lg">{feedback.icon}</span>
    }

    switch (feedback.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />
      case 'error':
        return <XCircle className="w-5 h-5" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />
      case 'info':
        return <Info className="w-5 h-5" />
      case 'special':
        return <Sparkles className="w-5 h-5" />
      default:
        return <Info className="w-5 h-5" />
    }
  }

  const getFeedbackColor = (feedback: ActionFeedback) => {
    switch (feedback.type) {
      case 'success':
        return 'border-green-500 bg-green-500/10 text-green-400'
      case 'error':
        return 'border-red-500 bg-red-500/10 text-red-400'
      case 'warning':
        return 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
      case 'info':
        return 'border-blue-500 bg-blue-500/10 text-blue-400'
      case 'special':
        return 'border-purple-500 bg-purple-500/10 text-purple-400'
      default:
        return 'border-gray-500 bg-gray-500/10 text-gray-400'
    }
  }

  const getActionIcon = (action?: string) => {
    switch (action) {
      case 'cardPlayed':
        return <Play className="w-4 h-4" />
      case 'pileTaken':
        return <Skip className="w-4 h-4" />
      case 'turnChanged':
        return <Target className="w-4 h-4" />
      case 'purified':
        return <Sparkles className="w-4 h-4" />
      case 'gameEnded':
        return <Crown className="w-4 h-4" />
      case 'playerJoined':
      case 'playerLeft':
        return <Shield className="w-4 h-4" />
      default:
        return null
    }
  }

  const getProgressColor = (feedback: ActionFeedback) => {
    switch (feedback.type) {
      case 'success':
        return 'bg-green-400'
      case 'error':
        return 'bg-red-400'
      case 'warning':
        return 'bg-yellow-400'
      case 'info':
        return 'bg-blue-400'
      case 'special':
        return 'bg-purple-400'
      default:
        return 'bg-gray-400'
    }
  }

  return (
    <div className={clsx(
      'fixed z-50 max-w-sm w-full',
      getPositionClasses(),
      className
    )}>
      <div 
        className="space-y-2 overflow-y-auto"
        style={{ maxHeight }}
      >
        <AnimatePresence mode="popLayout">
          {notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              layout
              initial={{ 
                opacity: 0, 
                x: position.includes('right') ? 100 : position.includes('left') ? -100 : 0,
                y: position.includes('top') ? -50 : position.includes('bottom') ? 50 : 0,
                scale: 0.8 
              }}
              animate={{ 
                opacity: 1, 
                x: 0, 
                y: 0, 
                scale: 1 
              }}
              exit={{ 
                opacity: 0, 
                x: position.includes('right') ? 100 : position.includes('left') ? -100 : 0,
                y: position.includes('top') ? -50 : position.includes('bottom') ? 50 : 0,
                scale: 0.8 
              }}
              transition={{ 
                duration: 0.3,
                delay: index * 0.1 
              }}
              className={clsx(
                'relative rounded-lg border-2 p-4 shadow-xl backdrop-blur-sm',
                getFeedbackColor(notification)
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getFeedbackIcon(notification)}
                  <h3 className="font-semibold text-sm">
                    {notification.title}
                  </h3>
                  {getActionIcon(notification.action)}
                </div>
                
                {notification.duration !== 0 && (
                  <button
                    onClick={() => onRemove(notification.id)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Message */}
              <p className="text-sm text-gray-300 mb-3">
                {notification.message}
              </p>

              {/* Progress bar for auto-dismiss */}
              {notification.duration && notification.duration > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700 rounded-b-lg overflow-hidden">
                  <motion.div
                    className={clsx('h-full', getProgressColor(notification))}
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ 
                      duration: notification.duration / 1000,
                      ease: 'linear'
                    }}
                  />
                </div>
              )}

              {/* Special effects for certain actions */}
              {notification.action === 'purified' && (
                <motion.div
                  className="absolute inset-0 rounded-lg"
                  animate={{
                    boxShadow: [
                      '0 0 0 0 rgba(168, 85, 247, 0.4)',
                      '0 0 0 10px rgba(168, 85, 247, 0)',
                      '0 0 0 0 rgba(168, 85, 247, 0)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}

              {notification.action === 'gameEnded' && (
                <motion.div
                  className="absolute inset-0 rounded-lg"
                  animate={{
                    background: [
                      'linear-gradient(45deg, rgba(168, 85, 247, 0.1), rgba(34, 197, 94, 0.1))',
                      'linear-gradient(45deg, rgba(34, 197, 94, 0.1), rgba(168, 85, 247, 0.1))',
                      'linear-gradient(45deg, rgba(168, 85, 247, 0.1), rgba(34, 197, 94, 0.1))'
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
