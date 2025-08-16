'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import clsx from 'clsx'
import CardImage from './CardImage'
import CardValidationIndicator from './CardValidationIndicator'
import { CardEffect } from './VisualEffects'

interface Card {
  id: number
  name: string
  type: 'criatura' | 'hechizo' | 'trampa'
  power: number
  description: string
  image?: string
  deck?: 'angels' | 'demons' | 'dragons' | 'mages'
}

interface GameCardProps {
  card: Card
  onClick?: () => void
  isPlayable?: boolean
  isSelected?: boolean
  isFlipped?: boolean
  showBack?: boolean
  backImage?: string
  className?: string
  isDraggable?: boolean
  onDragStart?: (card: Card, event: React.DragEvent) => void
  onDragEnd?: (card: Card, event: React.DragEvent) => void
  validation?: {
    isValid: boolean
    isPlayable: boolean
    errors: string[]
    warnings: string[]
    reason?: string
    willPurify?: boolean
    requiresTarget?: boolean
    isSpecial?: boolean
  }
  showValidation?: boolean
  visualEffect?: {
    type: 'sparkle' | 'pulse' | 'shake' | 'bounce' | 'glow' | 'ripple' | 'particles'
    duration: number
    color?: string
    size?: 'sm' | 'md' | 'lg'
    intensity?: 'low' | 'medium' | 'high'
  }
  onEffectComplete?: () => void
}

export default function GameCard({ 
  card, 
  onClick, 
  isPlayable = false, 
  isSelected = false,
  isFlipped = false,
  showBack = false,
  backImage,
  className = '',
  isDraggable = false,
  onDragStart,
  onDragEnd,
  validation,
  showValidation = false,
  visualEffect,
  onEffectComplete
}: GameCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getCardColor = () => {
    // Si tiene un mazo específico, usar colores del mazo
    if (card.deck) {
      switch (card.deck) {
        case 'angels':
          return 'border-yellow-400 hover:border-yellow-300'
        case 'demons':
          return 'border-red-600 hover:border-red-500'
        case 'dragons':
          return 'border-green-500 hover:border-green-400'
        case 'mages':
          return 'border-blue-500 hover:border-blue-400'
      }
    }
    
    // Fallback a colores por tipo
    switch (card.type) {
      case 'criatura':
        return 'game-card-creature'
      case 'hechizo':
        return 'game-card-spell'
      case 'trampa':
        return 'game-card-trap'
      default:
        return ''
    }
  }

  const getCardIcon = () => {
    // Si tiene un mazo específico, usar iconos del mazo
    if (card.deck) {
      switch (card.deck) {
        case 'angels':
          return '👼'
        case 'demons':
          return '😈'
        case 'dragons':
          return '🐉'
        case 'mages':
          return '🧙‍♂️'
      }
    }
    
    // Fallback a iconos por tipo
    switch (card.type) {
      case 'criatura':
        return '🐉'
      case 'hechizo':
        return '✨'
      case 'trampa':
        return '🛡️'
      default:
        return '🃏'
    }
  }

  const getCardImage = () => {
    if (card.image) {
      return card.image
    }
    
    // Si tiene un mazo específico, construir la ruta de la imagen
    if (card.deck) {
      const cardNumber = card.id.toString().padStart(2, '0')
      const cardName = card.name.toLowerCase().replace(/\s+/g, '_').replace(/[áéíóúñ]/g, (match) => {
        const accents: { [key: string]: string } = {
          'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ñ': 'n'
        }
        return accents[match] || match
      })
      return `/images/cards/${card.deck}/${card.deck}_${cardNumber}_${cardName}.png`
    }
    
    return null
  }

  const getBackImage = () => {
    if (backImage) {
      return backImage
    }
    
    // Si tiene un mazo específico, usar el reverso correspondiente
    if (card.deck) {
      return `/images/cards/backs/card_back_${card.deck}.png`
    }
    
    // Reverso por defecto
    return '/images/cards/backs/card_back_default.png'
  }

  const handleDragStart = (event: React.DragEvent) => {
    if (!isDraggable) return
    
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('application/json', JSON.stringify(card))
    
    // Crear imagen fantasma personalizada
    const ghostElement = event.currentTarget.cloneNode(true) as HTMLElement
    ghostElement.style.opacity = '0.5'
    ghostElement.style.transform = 'rotate(5deg)'
    ghostElement.style.pointerEvents = 'none'
    document.body.appendChild(ghostElement)
    event.dataTransfer.setDragImage(ghostElement, 0, 0)
    
    // Remover imagen fantasma después de un momento
    setTimeout(() => {
      if (document.body.contains(ghostElement)) {
        document.body.removeChild(ghostElement)
      }
    }, 0)

    onDragStart?.(card, event)
  }

  const handleDragEnd = (event: React.DragEvent) => {
    onDragEnd?.(card, event)
  }

  return (
      <motion.div
        className={clsx(
          'game-card w-24 h-36 md:w-32 md:h-44 relative',
          getCardColor(),
          isPlayable && 'cursor-pointer',
          isDraggable && 'cursor-grab active:cursor-grabbing',
          isSelected && 'ring-4 ring-accent-400 ring-opacity-75',
          className
        )}
        onClick={isPlayable ? onClick : undefined}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        draggable={isDraggable}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        whileHover={isPlayable || isDraggable ? { scale: 1.05, y: -5 } : {}}
        whileTap={isPlayable ? { scale: 0.95 } : {}}
        animate={isFlipped ? { rotateY: 180 } : { rotateY: 0 }}
        transition={{ duration: 0.3 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Indicador de validación */}
        {showValidation && validation && (
          <CardValidationIndicator
            validation={validation}
            isHovered={isHovered}
            showDetails={true}
          />
        )}

        {/* Efecto visual */}
        {visualEffect && (
          <CardEffect
            cardId={card.id.toString()}
            effect={{
              id: `effect-${card.id}`,
              ...visualEffect
            }}
            onComplete={onEffectComplete}
          />
        )}
        {/* Card Front */}
        <div 
          className="w-full h-full p-2 flex flex-col absolute inset-0 backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Card Image (if available) */}
          {getCardImage() && (
            <div className="w-full h-24 mb-2 rounded overflow-hidden">
              <CardImage
                src={getCardImage()}
                alt={card.name}
                className="w-full h-full"
                sizes="(max-width: 768px) 100px, 150px"
              />
            </div>
          )}

          {/* Card Header */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-lg">{getCardIcon()}</span>
            {card.power > 0 && (
              <span className="text-sm font-bold bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                {card.power}
              </span>
            )}
          </div>

          {/* Card Name */}
          <h3 className="text-xs md:text-sm font-bold text-gray-800 mb-2 leading-tight">
            {card.name}
          </h3>

          {/* Card Type */}
          <div className="text-xs text-gray-600 mb-2">
            <span className="capitalize font-semibold">{card.type}</span>
          </div>

          {/* Card Description */}
          <p className="text-xs text-gray-700 leading-tight flex-1">
            {card.description}
          </p>

          {/* Card Footer */}
          <div className="text-center mt-2">
            <div className="text-xs text-gray-500 font-mono">
              #{card.id.toString().padStart(3, '0')}
            </div>
          </div>
        </div>

        {/* Card Back */}
        {(showBack || isFlipped) && (
          <div 
            className="w-full h-full absolute inset-0 backface-hidden"
            style={{ 
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            <CardImage
              src={getBackImage()}
              alt="Reverso de carta"
              className="w-full h-full rounded"
              sizes="(max-width: 768px) 100px, 150px"
            />
          </div>
        )}

      {/* Hover Tooltip */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50"
        >
          <div className="bg-secondary-900 text-white p-3 rounded-lg shadow-xl border border-secondary-600 max-w-xs">
            <h4 className="font-bold text-sm mb-1">{card.name}</h4>
            <p className="text-xs text-secondary-300">{card.description}</p>
            <div className="flex items-center justify-between mt-2 text-xs">
              <span className="capitalize">{card.type}</span>
              {card.power > 0 && (
                <span className="bg-primary-500 px-2 py-1 rounded">Poder: {card.power}</span>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Playable Indicator */}
      {isPlayable && (
        <motion.div
          className="absolute -top-2 -right-2 w-4 h-4 bg-accent-500 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </motion.div>
  )
}
