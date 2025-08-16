'use client'

import React, { useState, useEffect } from 'react'
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
  Loader2,
  Search,
  Clock,
  UserPlus,
  Crown as CrownIcon
} from 'lucide-react'
import { CoopGameConfig, AvailableCoopGame } from '@/hooks/useCoopGame'
import clsx from 'clsx'

interface CoopGameSetupProps {
  onCreateGame: (config: CoopGameConfig) => void
  onJoinGame: (roomId: string, playerName: string) => void
  onGetAvailableGames: () => void
  availableGames: AvailableCoopGame[]
  isCreating: boolean
  isJoining: boolean
  loading: boolean
  error: string | null
  onClearError: () => void
  className?: string
}

export default function CoopGameSetup({
  onCreateGame,
  onJoinGame,
  onGetAvailableGames,
  availableGames,
  isCreating,
  isJoining,
  loading,
  error,
  onClearError,
  className = ''
}: CoopGameSetupProps) {
  const [config, setConfig] = useState<CoopGameConfig>({
    playerName: '',
    deckType: 'angels',
    aiDifficulty: 'intermediate'
  })
  const [joinConfig, setJoinConfig] = useState({
    playerName: '',
    selectedRoomId: ''
  })
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create')

  // Cargar juegos disponibles al montar el componente
  useEffect(() => {
    onGetAvailableGames()
  }, [onGetAvailableGames])

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

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (config.playerName.trim()) {
      onCreateGame(config)
    }
  }

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (joinConfig.playerName.trim() && joinConfig.selectedRoomId) {
      onJoinGame(joinConfig.selectedRoomId, joinConfig.playerName)
    }
  }

  const getDeckTypeInfo = (deckType: string) => {
    return deckTypes.find(dt => dt.value === deckType) || deckTypes[0]
  }

  const getDifficultyInfo = (difficulty: string) => {
    return difficulties.find(d => d.value === difficulty) || difficulties[1]
  }

  const formatTime = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) {
      return 'Ahora mismo'
    } else if (minutes < 60) {
      return `hace ${minutes}m`
    } else {
      const hours = Math.floor(minutes / 60)
      return `hace ${hours}h`
    }
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
            <Users className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Modo Cooperativo</h2>
          </div>
          <p className="text-gray-400">
            Juega con un amigo contra 2 jugadores controlados por IA
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

        {/* Tabs */}
        <div className="flex mb-6 bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('create')}
            className={clsx(
              'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors',
              activeTab === 'create'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            )}
          >
            <Play className="w-4 h-4 inline mr-2" />
            Crear Juego
          </button>
          <button
            onClick={() => setActiveTab('join')}
            className={clsx(
              'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors',
              activeTab === 'join'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            )}
          >
            <UserPlus className="w-4 h-4 inline mr-2" />
            Unirse a Juego
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'create' ? (
            // Formulario de creación
            <motion.form
              key="create"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleCreateSubmit}
              className="space-y-6"
            >
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
                          ? 'border-blue-500 bg-blue-500/20'
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
                          ? 'border-purple-500 bg-purple-500/20'
                          : 'border-gray-600 bg-gray-700/50 hover:border-gray-500 hover:bg-gray-700'
                      )}
                      disabled={isCreating}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-purple-400">{difficulty.icon}</div>
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
                    <span className="text-white">2 humanos vs 2 IA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Modo:</span>
                    <span className="text-blue-400">Cooperativo</span>
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
                    : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105'
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
                    Crear Juego Cooperativo
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.form>
          ) : (
            // Formulario de unión
            <motion.div
              key="join"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Nombre del jugador */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Tu Nombre
                </label>
                <input
                  type="text"
                  value={joinConfig.playerName}
                  onChange={(e) => setJoinConfig(prev => ({ ...prev, playerName: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Ingresa tu nombre"
                  required
                  disabled={isJoining}
                />
              </div>

              {/* Lista de juegos disponibles */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-300">
                    <Search className="w-4 h-4 inline mr-2" />
                    Juegos Disponibles
                  </label>
                  <button
                    type="button"
                    onClick={onGetAvailableGames}
                    disabled={loading}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Actualizar'}
                  </button>
                </div>

                {availableGames.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No hay juegos cooperativos disponibles</p>
                    <p className="text-sm mt-1">Crea uno nuevo o espera a que alguien más cree uno</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {availableGames.map((game) => (
                      <button
                        key={game.roomId}
                        type="button"
                        onClick={() => setJoinConfig(prev => ({ ...prev, selectedRoomId: game.roomId }))}
                        className={clsx(
                          'w-full p-3 rounded-lg border-2 transition-all text-left',
                          joinConfig.selectedRoomId === game.roomId
                            ? 'border-blue-500 bg-blue-500/20'
                            : 'border-gray-600 bg-gray-700/50 hover:border-gray-500 hover:bg-gray-700'
                        )}
                        disabled={isJoining}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getDeckTypeInfo(game.deckType).icon}</span>
                            <span className="font-medium text-white">{getDeckTypeInfo(game.deckType).label}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            {formatTime(game.createdAt)}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <CrownIcon className="w-4 h-4 text-yellow-400" />
                            <span className="text-gray-300">{game.hostName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">
                              {game.humanPlayers}/{game.maxHumanPlayers} jugadores
                            </span>
                            <span className={clsx(
                              'px-2 py-1 rounded text-xs',
                              getDifficultyInfo(game.aiDifficulty).value === 'beginner' ? 'bg-green-500/20 text-green-400' :
                              getDifficultyInfo(game.aiDifficulty).value === 'intermediate' ? 'bg-blue-500/20 text-blue-400' :
                              getDifficultyInfo(game.aiDifficulty).value === 'advanced' ? 'bg-purple-500/20 text-purple-400' :
                              'bg-red-500/20 text-red-400'
                            )}>
                              {getDifficultyInfo(game.aiDifficulty).label}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Botón de unión */}
              <button
                onClick={handleJoinSubmit}
                disabled={!joinConfig.playerName.trim() || !joinConfig.selectedRoomId || isJoining}
                className={clsx(
                  'w-full py-3 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2',
                  isJoining || !joinConfig.playerName.trim() || !joinConfig.selectedRoomId
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white hover:scale-105'
                )}
              >
                {isJoining ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Uniéndose al juego...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Unirse al Juego
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Información adicional */}
        <div className="mt-6 pt-4 border-t border-gray-600">
          <div className="text-xs text-gray-400 space-y-1">
            <p>• El primer jugador que crea el juego es el host</p>
            <p>• Puedes unirte a juegos existentes o crear uno nuevo</p>
            <p>• Los jugadores IA tienen personalidades únicas</p>
            <p>• El juego comienza cuando el host lo inicia</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
