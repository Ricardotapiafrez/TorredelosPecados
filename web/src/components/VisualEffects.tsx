'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Zap, Shield, Crown, Target } from 'lucide-react'
import clsx from 'clsx'

interface VisualEffect {
  id: string
  type: 'sparkle' | 'pulse' | 'shake' | 'bounce' | 'glow' | 'ripple' | 'particles'
  duration: number
  color?: string
  size?: 'sm' | 'md' | 'lg'
  position?: 'top' | 'center' | 'bottom'
  intensity?: 'low' | 'medium' | 'high'
}

interface VisualEffectsProps {
  effects: VisualEffect[]
  onEffectComplete?: (effectId: string) => void
  className?: string
}

export default function VisualEffects({
  effects,
  onEffectComplete,
  className = ''
}: VisualEffectsProps) {
  const getEffectAnimation = (effect: VisualEffect) => {
    const baseConfig = {
      duration: effect.duration / 1000,
      ease: 'easeOut'
    }

    switch (effect.type) {
      case 'sparkle':
        return {
          animate: {
            scale: [0, 1.2, 0],
            opacity: [0, 1, 0],
            rotate: [0, 180, 360]
          },
          transition: baseConfig
        }
      
      case 'pulse':
        return {
          animate: {
            scale: [1, 1.3, 1],
            opacity: [0.7, 1, 0.7]
          },
          transition: {
            ...baseConfig,
            repeat: Math.floor(effect.duration / 500),
            repeatType: 'reverse'
          }
        }
      
      case 'shake':
        return {
          animate: {
            x: [0, -5, 5, -5, 5, 0],
            rotate: [0, -2, 2, -2, 2, 0]
          },
          transition: baseConfig
        }
      
      case 'bounce':
        return {
          animate: {
            y: [0, -20, 0],
            scale: [1, 1.1, 1]
          },
          transition: {
            ...baseConfig,
            repeat: Math.floor(effect.duration / 800),
            repeatType: 'reverse'
          }
        }
      
      case 'glow':
        return {
          animate: {
            boxShadow: [
              '0 0 0 0 rgba(59, 130, 246, 0.4)',
              '0 0 0 10px rgba(59, 130, 246, 0)',
              '0 0 0 0 rgba(59, 130, 246, 0)'
            ]
          },
          transition: {
            ...baseConfig,
            repeat: Math.floor(effect.duration / 1000),
            repeatType: 'loop'
          }
        }
      
      case 'ripple':
        return {
          animate: {
            scale: [0, 1],
            opacity: [1, 0]
          },
          transition: baseConfig
        }
      
      case 'particles':
        return {
          animate: {
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
            y: [0, -50],
            x: [0, Math.random() * 20 - 10]
          },
          transition: baseConfig
        }
      
      default:
        return {
          animate: { scale: [1, 1.1, 1] },
          transition: baseConfig
        }
    }
  }

  const getEffectIcon = (effect: VisualEffect) => {
    switch (effect.type) {
      case 'sparkle':
        return <Sparkles className="w-full h-full" />
      case 'pulse':
        return <Zap className="w-full h-full" />
      case 'glow':
        return <Shield className="w-full h-full" />
      case 'particles':
        return <Crown className="w-full h-full" />
      case 'ripple':
        return <Target className="w-full h-full" />
      default:
        return <Sparkles className="w-full h-full" />
    }
  }

  const getEffectSize = (size?: string) => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4'
      case 'lg':
        return 'w-8 h-8'
      default:
        return 'w-6 h-6'
    }
  }

  const getEffectColor = (color?: string) => {
    switch (color) {
      case 'green':
        return 'text-green-400'
      case 'red':
        return 'text-red-400'
      case 'yellow':
        return 'text-yellow-400'
      case 'blue':
        return 'text-blue-400'
      case 'purple':
        return 'text-purple-400'
      case 'orange':
        return 'text-orange-400'
      default:
        return 'text-white'
    }
  }

  const getEffectIntensity = (intensity?: string) => {
    switch (intensity) {
      case 'low':
        return 'opacity-50'
      case 'high':
        return 'opacity-100'
      default:
        return 'opacity-75'
    }
  }

  return (
    <div className={className}>
      <AnimatePresence>
        {effects.map((effect) => {
          const animation = getEffectAnimation(effect)
          
          return (
            <motion.div
              key={effect.id}
              className={clsx(
                'absolute pointer-events-none',
                getEffectSize(effect.size),
                getEffectColor(effect.color),
                getEffectIntensity(effect.intensity)
              )}
              {...animation}
              onAnimationComplete={() => {
                onEffectComplete?.(effect.id)
              }}
            >
              {getEffectIcon(effect)}
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

// Componente para efectos en cartas específicas
interface CardEffectProps {
  cardId: string
  effect: VisualEffect
  onComplete?: () => void
  className?: string
}

export function CardEffect({ cardId, effect, onComplete, className = '' }: CardEffectProps) {
  return (
    <VisualEffects
      effects={[effect]}
      onEffectComplete={onComplete}
      className={clsx('absolute inset-0', className)}
    />
  )
}

// Componente para efectos en zonas de drop
interface DropZoneEffectProps {
  zoneId: string
  effect: VisualEffect
  onComplete?: () => void
  className?: string
}

export function DropZoneEffect({ zoneId, effect, onComplete, className = '' }: DropZoneEffectProps) {
  return (
    <VisualEffects
      effects={[effect]}
      onEffectComplete={onComplete}
      className={clsx('absolute inset-0', className)}
    />
  )
}

// Componente para efectos de partículas
interface ParticleEffectProps {
  count?: number
  duration?: number
  color?: string
  className?: string
}

export function ParticleEffect({ 
  count = 10, 
  duration = 2000, 
  color = 'white',
  className = '' 
}: ParticleEffectProps) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: `particle-${i}`,
    type: 'particles' as const,
    duration: duration + Math.random() * 1000,
    color,
    size: 'sm' as const,
    intensity: 'medium' as const
  }))

  return (
    <VisualEffects
      effects={particles}
      className={className}
    />
  )
}

// Componente para efectos de celebración
interface CelebrationEffectProps {
  type?: 'victory' | 'purification' | 'special'
  className?: string
}

export function CelebrationEffect({ type = 'victory', className = '' }: CelebrationEffectProps) {
  const getCelebrationEffects = () => {
    switch (type) {
      case 'victory':
        return [
          { id: 'victory-1', type: 'sparkle' as const, duration: 3000, color: 'yellow', size: 'lg' as const },
          { id: 'victory-2', type: 'particles' as const, duration: 2500, color: 'gold', size: 'md' as const },
          { id: 'victory-3', type: 'glow' as const, duration: 4000, color: 'purple', size: 'lg' as const }
        ]
      case 'purification':
        return [
          { id: 'purify-1', type: 'sparkle' as const, duration: 2000, color: 'white', size: 'md' as const },
          { id: 'purify-2', type: 'ripple' as const, duration: 1500, color: 'blue', size: 'lg' as const },
          { id: 'purify-3', type: 'pulse' as const, duration: 3000, color: 'purple', size: 'md' as const }
        ]
      case 'special':
        return [
          { id: 'special-1', type: 'bounce' as const, duration: 1000, color: 'green', size: 'sm' as const },
          { id: 'special-2', type: 'shake' as const, duration: 800, color: 'red', size: 'sm' as const },
          { id: 'special-3', type: 'sparkle' as const, duration: 1200, color: 'blue', size: 'sm' as const }
        ]
      default:
        return []
    }
  }

  return (
    <VisualEffects
      effects={getCelebrationEffects()}
      className={className}
    />
  )
}
