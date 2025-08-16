'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Target, AlertCircle, CheckCircle, Hand } from 'lucide-react'
import GameCard from './GameCard'
import { Card } from '@/types/game'

interface PlayableCardsProps {
  cards: Card[]
  onCardClick: (cardIndex: number) => void
  onCardDrop?: (card: Card, targetZone: string) => void
  onTargetSelect?: (cardIndex: number, targetPlayerId: string) => void
  targetPlayers?: Array<{ id: string; name: string }>
  isMyTurn: boolean
  className?: string
}

export default function PlayableCards({
  cards,
  onCardClick,
  onCardDrop,
  onTargetSelect,
  targetPlayers = [],
  isMyTurn,
  className = ''
}: PlayableCardsProps) {
  const [selectedCard, setSelectedCard] = useState<number | null>(null)
  const [showTargetModal, setShowTargetModal] = useState(false)

  const handleCardClick = (cardIndex: number) => {
    if (!isMyTurn) return

    const card = cards[cardIndex]
    if (!card) return

    // Verificar si la carta requiere selección de objetivo
    if (card.value === 2 || card.value === 8 || card.value === 10) {
      setSelectedCard(cardIndex)
      setShowTargetModal(true)
    } else {
      // Jugar carta directamente
      onCardClick(cardIndex)
    }
  }

  const handleCardDragStart = (card: Card, event: React.DragEvent) => {
    if (!isMyTurn) {
      event.preventDefault()
      return
    }
    
    // Agregar efecto visual al arrastrar
    event.currentTarget.style.opacity = '0.5'
  }

  const handleCardDragEnd = (card: Card, event: React.DragEvent) => {
    // Restaurar opacidad
    event.currentTarget.style.opacity = '1'
  }

  const handleTargetSelect = (targetPlayerId: string) => {
    if (selectedCard !== null && onTargetSelect) {
      onTargetSelect(selectedCard, targetPlayerId)
      setSelectedCard(null)
      setShowTargetModal(false)
    }
  }

  const getCardEffect = (card: Card) => {
    switch (card.value) {
      case 2:
        return 'Puedes jugar otra carta'
      case 8:
        return 'El siguiente jugador pierde su turno'
      case 10:
        return 'Cambia la dirección del juego'
      default:
        return null
    }
  }

  const isSpecialCard = (card: Card) => {
    return card.value === 2 || card.value === 8 || card.value === 10
  }

  if (!isMyTurn || cards.length === 0) {
    return null
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <Play className="w-5 h-5 text-accent-400" />
          <span>Cartas Jugables ({cards.length})</span>
        </h3>
        <div className="text-sm text-gray-400">
          Selecciona una carta para jugar
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {cards.map((card, index) => (
          <motion.div
            key={`${card.id}-${index}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            <GameCard
              card={card}
              onClick={() => handleCardClick(index)}
              isPlayable={true}
              isDraggable={isMyTurn}
              onDragStart={handleCardDragStart}
              onDragEnd={handleCardDragEnd}
              className="w-full h-auto"
            />
            
            {/* Special Card Indicator */}
            {isSpecialCard(card) && (
              <motion.div
                className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Target className="w-3 h-3 text-white" />
              </motion.div>
            )}

            {/* Card Effect Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 hover:opacity-100 transition-opacity">
              <div className="bg-gray-800 text-white p-2 rounded text-xs whitespace-nowrap border border-gray-600">
                {getCardEffect(card)}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 bg-gray-800/50 rounded border border-gray-600">
        <div className="flex items-center space-x-2 text-sm text-gray-300">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <span>
            {cards.some(card => isSpecialCard(card)) 
              ? 'Algunas cartas requieren seleccionar un objetivo'
              : 'Todas las cartas se pueden jugar directamente'
            }
          </span>
        </div>
      </div>

      {/* Target Selection Modal */}
      <AnimatePresence>
        {showTargetModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
            >
              <div className="flex items-center space-x-2 mb-4">
                <Target className="w-6 h-6 text-purple-400" />
                <h3 className="text-xl font-bold text-white">
                  Seleccionar Objetivo
                </h3>
              </div>
              
              {selectedCard !== null && (
                <div className="mb-4">
                  <p className="text-gray-300 mb-2">
                    Carta: <span className="font-semibold">{cards[selectedCard].name}</span>
                  </p>
                  <p className="text-sm text-gray-400">
                    {getCardEffect(cards[selectedCard])}
                  </p>
                </div>
              )}
              
              <p className="text-gray-300 mb-4">
                Selecciona el jugador objetivo:
              </p>
              
              <div className="space-y-2 mb-4">
                {targetPlayers.map((player) => (
                  <motion.button
                    key={player.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleTargetSelect(player.id)}
                    className="w-full p-3 text-left bg-gray-700 hover:bg-gray-600 rounded border border-gray-600 transition-colors"
                  >
                    <span className="text-white font-semibold">{player.name}</span>
                  </motion.button>
                ))}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowTargetModal(false)
                  setSelectedCard(null)
                }}
                className="w-full btn-secondary"
              >
                Cancelar
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
