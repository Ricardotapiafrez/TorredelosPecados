'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MousePointer, Hand, Target, Info, X } from 'lucide-react'

interface DragDropInstructionsProps {
  isVisible?: boolean
  onClose?: () => void
}

export default function DragDropInstructions({ 
  isVisible = false, 
  onClose 
}: DragDropInstructionsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-4 right-4 z-50"
        initial={{ opacity: 0, y: 20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.8 }}
      >
        <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-xl max-w-sm">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-600">
            <div className="flex items-center space-x-2">
              <Info className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold text-white">Drag & Drop</h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  ▼
                </motion.div>
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                className="p-4 space-y-3"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Hand className="w-5 h-5 text-green-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-white text-sm">Arrastrar Cartas</h4>
                      <p className="text-gray-400 text-xs">
                        Haz clic y arrastra las cartas de tu mano para jugarlas
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Target className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-white text-sm">Zonas de Destino</h4>
                      <p className="text-gray-400 text-xs">
                        Suelta las cartas en las zonas verdes para jugarlas
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <MousePointer className="w-5 h-5 text-purple-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-white text-sm">Clic Alternativo</h4>
                      <p className="text-gray-400 text-xs">
                        También puedes hacer clic en las cartas para jugarlas
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-700/50 rounded p-3">
                    <h4 className="font-medium text-yellow-400 text-sm mb-2">💡 Consejo</h4>
                    <p className="text-gray-300 text-xs">
                      Las cartas especiales (2, 8, 10) requieren seleccionar un objetivo después de soltarlas
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Collapsed Content */}
          {!isExpanded && (
            <div className="p-4">
              <p className="text-gray-300 text-sm">
                Arrastra las cartas de tu mano a las zonas de juego para jugarlas
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
