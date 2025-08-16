'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Brain, 
  Settings, 
  Play, 
  Crown, 
  Zap, 
  Target, 
  Sparkles,
  Sword,
  Shield,
  Flame,
  Star,
  ArrowRight,
  Loader2,
  AlertTriangle
} from 'lucide-react'
import { ChallengeGameConfig } from '@/hooks/useChallengeGame'
import clsx from 'clsx'

interface ChallengeGameSetupProps {
  onCreateGame: (config: ChallengeGameConfig) => void
  isCreating: boolean
  error: string | null
  onClearError: () => void
  className?: string
}

export default function ChallengeGameSetup({
  onCreateGame,
  isCreating,
  error,
  onClearError,
  className = ''
}: ChallengeGameSetupProps) {
  const [config, setConfig] = useState<ChallengeGameConfig>({
    playerName: '',
    deckType: 'angels',
    challengeLevel: 'expert'
  })

  const deckTypes = [
    { value: 'angels', label: 'Ángeles', icon: '👼', description: 'Estrategia celestial y defensiva', boss: 'Arcángel Miguel' },
    { value: 'demons', label: 'Demonios', icon: '😈', description: 'Estrategia infernal y agresiva', boss: 'Lucifer' },
    { value: 'dragons', label: 'Dragones', icon: '🐉', description: 'Estrategia draconiana y poderosa', boss: 'Bahamut' },
    { value: 'mages', label: 'Magos', icon: '🧙‍♂️', description: 'Estrategia arcana y táctica', boss: 'Merlín' }
  ]

  const challengeLevels = [
    { 
      value: 'expert', 
      label: 'Experto', 
      icon: <Crown className="w-4 h-4" />, 
      description: 'IA experta con estrategia avanzada',
      difficulty: 'Difícil',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-500'
    },
    { 
      value: 'master', 
      label: 'Maestro', 
      icon: <Star className="w-4 h-4" />, 
      description: 'IA maestra con dominio total',
      difficulty: 'Muy Difícil',
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500'
    },
    { 
      value: 'legendary', 
      label: 'Legendario', 
      icon: <Flame className="w-4 h-4" />, 
      description: 'IA legendaria con poder absoluto',
      difficulty: 'Extremo',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
      borderColor: 'border-orange-500'
    }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (config.playerName.trim()) {
      onCreateGame(config)
    }
  }

  const getDeckTypeInfo = (deckType: string) => {
    return deckTypes.find(dt => dt.value === deckType) || deckTypes[0]
  }

  const getChallengeLevelInfo = (level: string) => {
    return challengeLevels.find(cl => cl.value === level) || challengeLevels[0]
  }

  const selectedDeck = getDeckTypeInfo(config.deckType)
  const selectedLevel = getChallengeLevelInfo(config.challengeLevel)

  return (
    <div className={clsx('relative', className)}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/90 backdrop-blur-sm border border-gray-600 rounded-lg p-6"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sword className="w-6 h-6 text-red-400" />
            <h2 className="text-2xl font-bold text-white">Modo Desafío</h2>
          </div>
          <p className="text-gray-400">
            Enfréntate a una IA experta en un duelo épico 1 vs 1
          </p>
        </div>

        {/* Advertencia */}
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <div>
              <h3 className="text-sm font-medium text-red-400">¡Desafío Extremo!</h3>
              <p className="text-xs text-red-300 mt-1">
                Este modo está diseñado para jugadores experimentados. La IA será implacable.
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm text-red-400">{error}</span>
              <button
                onClick={onClearError}
                className="ml-auto p-1 rounded hover:bg-red-500/20"
              >
                <span className="text-red-400">×</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre del jugador */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Tu Nombre
            </label>
            <input
              type="text"
              value={config.playerName}
              onChange={(e) => setConfig(prev => ({ ...prev, playerName: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Ingresa tu nombre"
              required
              disabled={isCreating}
            />
          </div>

          {/* Tipo de mazo */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              <Sparkles className="w-4 h-4 inline mr-2" />
              Mazo Temático (Tu Oponente)
            </label>
            <div className="grid grid-cols-2 gap-3">
              {deckTypes.map((deckType) => (
                <button
                  key={deckType.value}
                  type="button"
                  onClick={() => setConfig(prev => ({ ...prev, deckType: deckType.value as any }))}
                  className={clsx(
                    'p-3 rounded-lg border-2 transition-all text-left',
                    config.deckType === deckType.value
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-gray-600 bg-gray-700/50 hover:border-gray-500 hover:bg-gray-700'
                  )}
                  disabled={isCreating}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{deckType.icon}</span>
                    <span className="font-medium text-white">{deckType.label}</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-1">{deckType.description}</p>
                  <p className="text-xs text-blue-400">Boss: {deckType.boss}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Nivel de desafío */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              <Sword className="w-4 h-4 inline mr-2" />
              Nivel de Desafío
            </label>
            <div className="space-y-3">
              {challengeLevels.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setConfig(prev => ({ ...prev, challengeLevel: level.value as any }))}
                  className={clsx(
                    'w-full p-4 rounded-lg border-2 transition-all text-left',
                    config.challengeLevel === level.value
                      ? `${level.borderColor} ${level.bgColor}`
                      : 'border-gray-600 bg-gray-700/50 hover:border-gray-500 hover:bg-gray-700'
                  )}
                  disabled={isCreating}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={level.color}>{level.icon}</div>
                      <div>
                        <span className="font-medium text-white">{level.label}</span>
                        <span className={clsx('ml-2 px-2 py-1 rounded text-xs', level.bgColor, level.color)}>
                          {level.difficulty}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">{level.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Información del desafío */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Configuración del Desafío
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Tu oponente:</span>
                <span className="text-white">{selectedDeck.boss}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Nivel de desafío:</span>
                <span className={selectedLevel.color}>{selectedLevel.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Dificultad:</span>
                <span className="text-red-400">{selectedLevel.difficulty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Modo:</span>
                <span className="text-red-400">Desafío 1 vs 1</span>
              </div>
            </div>
          </div>

          {/* Advertencia específica del nivel */}
          <div className={clsx('p-3 rounded-lg border', selectedLevel.bgColor, selectedLevel.borderColor)}>
            <div className="flex items-center gap-2">
              <AlertTriangle className={clsx('w-4 h-4', selectedLevel.color)} />
              <div>
                <p className={clsx('text-sm font-medium', selectedLevel.color)}>
                  Desafío {selectedLevel.label}
                </p>
                <p className="text-xs text-gray-300 mt-1">
                  {selectedLevel.description}. Prepárate para una batalla épica.
                </p>
              </div>
            </div>
          </div>

          {/* Botón de inicio */}
          <button
            type="submit"
            disabled={!config.playerName.trim() || isCreating}
            className={clsx(
              'w-full py-4 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2',
              isCreating || !config.playerName.trim()
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 text-white hover:scale-105'
            )}
          >
            {isCreating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creando desafío...
              </>
            ) : (
              <>
                <Sword className="w-5 h-5" />
                Iniciar Desafío Épico
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Información adicional */}
        <div className="mt-6 pt-4 border-t border-gray-600">
          <div className="text-xs text-gray-400 space-y-1">
            <p>• Este es un duelo directo 1 vs 1 contra una IA experta</p>
            <p>• La IA tendrá personalidad única y estrategia avanzada</p>
            <p>• Cada nivel de desafío aumenta la dificultad significativamente</p>
            <p>• Solo los mejores jugadores sobrevivirán al modo Legendario</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
