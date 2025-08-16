'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Brain, 
  Settings, 
  Play, 
  Crown, 
  Zap, 
  Target, 
  Sparkles,
  Users,
  Gamepad2,
  ArrowRight,
  Loader2
} from 'lucide-react'
import { SoloGameConfig } from '@/hooks/useSoloGame'
import clsx from 'clsx'

interface SoloGameSetupProps {
  onCreateGame: (config: SoloGameConfig) => void
  isCreating: boolean
  error: string | null
  onClearError: () => void
  className?: string
}

export default function SoloGameSetup({
  onCreateGame,
  isCreating,
  error,
  onClearError,
  className = ''
}: SoloGameSetupProps) {
  const [config, setConfig] = useState<SoloGameConfig>({
    playerName: '',
    deckType: 'angels',
    aiDifficulty: 'intermediate'
  })

  const deckTypes = [
    { value: 'angels', label: 'Ángeles', icon: '👼', description: 'Estrategia celestial y defensiva' },
    { value: 'demons', label: 'Demonios', icon: '😈', description: 'Estrategia infernal y agresiva' },
    { value: 'dragons', label: 'Dragones', icon: '🐉', description: 'Estrategia draconiana y poderosa' },
    { value: 'mages', label: 'Magos', icon: '🧙‍♂️', description: 'Estrategia arcana y táctica' }
  ]

  const difficulties = [
    { value: 'beginner', label: 'Principiante', icon: <Target className="w-4 h-4" />, description: 'IA con decisiones aleatorias' },
    { value: 'intermediate', label: 'Intermedio', icon: <Zap className="w-4 h-4" />, description: 'IA con estrategia básica' },
    { value: 'advanced', label: 'Avanzado', icon: <Brain className="w-4 h-4" />, description: 'IA con estrategia compleja' },
    { value: 'expert', label: 'Experto', icon: <Crown className="w-4 h-4" />, description: 'IA con análisis profundo' }
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

  const getDifficultyInfo = (difficulty: string) => {
    return difficulties.find(d => d.value === difficulty) || difficulties[1]
  }

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
            <Gamepad2 className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Modo Solitario</h2>
          </div>
          <p className="text-gray-400">
            Juega contra 3 jugadores controlados por IA
          </p>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
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
        </AnimatePresence>

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
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              placeholder="Ingresa tu nombre"
              required
              disabled={isCreating}
            />
          </div>

          {/* Tipo de mazo */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              <Sparkles className="w-4 h-4 inline mr-2" />
              Mazo Temático
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
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-gray-600 bg-gray-700/50 hover:border-gray-500 hover:bg-gray-700'
                  )}
                  disabled={isCreating}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{deckType.icon}</span>
                    <span className="font-medium text-white">{deckType.label}</span>
                  </div>
                  <p className="text-xs text-gray-400">{deckType.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Dificultad de IA */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              <Brain className="w-4 h-4 inline mr-2" />
              Dificultad de IA
            </label>
            <div className="grid grid-cols-2 gap-3">
              {difficulties.map((difficulty) => (
                <button
                  key={difficulty.value}
                  type="button"
                  onClick={() => setConfig(prev => ({ ...prev, aiDifficulty: difficulty.value as any }))}
                  className={clsx(
                    'p-3 rounded-lg border-2 transition-all text-left',
                    config.aiDifficulty === difficulty.value
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-gray-600 bg-gray-700/50 hover:border-gray-500 hover:bg-gray-700'
                  )}
                  disabled={isCreating}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-blue-400">{difficulty.icon}</div>
                    <span className="font-medium text-white">{difficulty.label}</span>
                  </div>
                  <p className="text-xs text-gray-400">{difficulty.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Información del juego */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Configuración del Juego
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Mazo seleccionado:</span>
                <span className="text-white">{getDeckTypeInfo(config.deckType).label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Dificultad IA:</span>
                <span className="text-white">{getDifficultyInfo(config.aiDifficulty).label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Jugadores:</span>
                <span className="text-white">1 humano vs 3 IA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Modo:</span>
                <span className="text-purple-400">Solitario</span>
              </div>
            </div>
          </div>

          {/* Botón de inicio */}
          <button
            type="submit"
            disabled={!config.playerName.trim() || isCreating}
            className={clsx(
              'w-full py-3 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2',
              isCreating || !config.playerName.trim()
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white hover:scale-105'
            )}
          >
            {isCreating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creando juego...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Iniciar Juego Solitario
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Información adicional */}
        <div className="mt-6 pt-4 border-t border-gray-600">
          <div className="text-xs text-gray-400 space-y-1">
            <p>• Los jugadores IA tendrán personalidades únicas según el mazo</p>
            <p>• La dificultad afecta la estrategia de todas las IA</p>
            <p>• Puedes usar el asistente de IA durante tu turno</p>
            <p>• El juego se guarda automáticamente</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
