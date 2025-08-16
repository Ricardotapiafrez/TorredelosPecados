'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

interface SoundWave {
  id: string
  type: 'cardPlay' | 'cardDrop' | 'pileTake' | 'purification' | 'victory' | 'error'
  duration: number
  intensity: number
  position: { x: number; y: number }
}

interface SoundEffectsProps {
  waves: SoundWave[]
  onWaveComplete?: (waveId: string) => void
  className?: string
}

export default function SoundEffects({
  waves,
  onWaveComplete,
  className = ''
}: SoundEffectsProps) {
  const getWaveColor = (type: string) => {
    switch (type) {
      case 'cardPlay':
        return 'border-green-400'
      case 'cardDrop':
        return 'border-blue-400'
      case 'pileTake':
        return 'border-yellow-400'
      case 'purification':
        return 'border-purple-400'
      case 'victory':
        return 'border-gold-400'
      case 'error':
        return 'border-red-400'
      default:
        return 'border-white'
    }
  }

  const getWaveSize = (intensity: number) => {
    return Math.max(20, intensity * 10)
  }

  return (
    <div className={clsx('fixed inset-0 pointer-events-none z-40', className)}>
      <AnimatePresence>
        {waves.map((wave) => (
          <motion.div
            key={wave.id}
            className={clsx(
              'absolute rounded-full border-2',
              getWaveColor(wave.type)
            )}
            style={{
              left: wave.position.x - getWaveSize(wave.intensity) / 2,
              top: wave.position.y - getWaveSize(wave.intensity) / 2,
              width: getWaveSize(wave.intensity),
              height: getWaveSize(wave.intensity)
            }}
            initial={{
              scale: 0,
              opacity: 1
            }}
            animate={{
              scale: [0, 1, 2, 3],
              opacity: [1, 0.8, 0.4, 0]
            }}
            transition={{
              duration: wave.duration / 1000,
              ease: 'easeOut'
            }}
            onAnimationComplete={() => {
              onWaveComplete?.(wave.id)
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

// Hook para manejar efectos de sonido
export function useSoundEffects() {
  const [soundWaves, setSoundWaves] = useState<SoundWave[]>([])

  const addSoundWave = (type: SoundWave['type'], position: { x: number; y: number }, intensity = 1) => {
    const wave: SoundWave = {
      id: `wave-${Date.now()}-${Math.random()}`,
      type,
      duration: 1000 + intensity * 500,
      intensity,
      position
    }

    setSoundWaves(prev => [...prev, wave])

    // Auto-remover después de la duración
    setTimeout(() => {
      setSoundWaves(prev => prev.filter(w => w.id !== wave.id))
    }, wave.duration)
  }

  const addCardPlaySound = (position: { x: number; y: number }) => {
    addSoundWave('cardPlay', position, 1)
  }

  const addCardDropSound = (position: { x: number; y: number }) => {
    addSoundWave('cardDrop', position, 1.5)
  }

  const addPileTakeSound = (position: { x: number; y: number }) => {
    addSoundWave('pileTake', position, 2)
  }

  const addPurificationSound = (position: { x: number; y: number }) => {
    addSoundWave('purification', position, 3)
  }

  const addVictorySound = (position: { x: number; y: number }) => {
    addSoundWave('victory', position, 4)
  }

  const addErrorSound = (position: { x: number; y: number }) => {
    addSoundWave('error', position, 1)
  }

  return {
    soundWaves,
    addSoundWave,
    addCardPlaySound,
    addCardDropSound,
    addPileTakeSound,
    addPurificationSound,
    addVictorySound,
    addErrorSound
  }
}

// Componente para efectos de sonido en el centro de la pantalla
interface CenterSoundEffectProps {
  type: SoundWave['type']
  intensity?: number
  onComplete?: () => void
}

export function CenterSoundEffect({ type, intensity = 1, onComplete }: CenterSoundEffectProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    const timer = setTimeout(() => {
      setIsVisible(false)
      onComplete?.()
    }, 1000 + intensity * 500)

    return () => clearTimeout(timer)
  }, [type, intensity, onComplete])

  const getWaveColor = (type: string) => {
    switch (type) {
      case 'cardPlay':
        return 'border-green-400'
      case 'cardDrop':
        return 'border-blue-400'
      case 'pileTake':
        return 'border-yellow-400'
      case 'purification':
        return 'border-purple-400'
      case 'victory':
        return 'border-gold-400'
      case 'error':
        return 'border-red-400'
      default:
        return 'border-white'
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={clsx(
            'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full border-2 pointer-events-none z-50',
            getWaveColor(type)
          )}
          style={{
            width: 20 + intensity * 20,
            height: 20 + intensity * 20
          }}
          initial={{
            scale: 0,
            opacity: 1
          }}
          animate={{
            scale: [0, 1, 2, 3, 4],
            opacity: [1, 0.8, 0.6, 0.3, 0]
          }}
          transition={{
            duration: (1000 + intensity * 500) / 1000,
            ease: 'easeOut'
          }}
        />
      )}
    </AnimatePresence>
  )
}
