'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  RefreshCw, 
  Settings, 
  Sword,
  Gamepad2,
  Brain,
  Crown,
  Zap,
  Target,
  Flame,
  Star,
  Shield,
  AlertTriangle
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSocket } from '@/hooks/useSocket'
import { useChallengeGame } from '@/hooks/useChallengeGame'
import ChallengeGameSetup from '@/components/ChallengeGameSetup'
import AIActionLog from '@/components/AIActionLog'
import GameBoard from '@/components/GameBoard'
import clsx from 'clsx'

export default function ChallengePage() {
  const router = useRouter()
  const { socket, isConnected } = useSocket()
  const [showActionLog, setShowActionLog] = useState(true)
  
  const {
    gameInfo,
    loading,
    error,
    isCreating,
    aiActions,
    createChallengeGame,
    clearChallengeGame,
    clearError,
    isHumanTurn,
    currentAIPlayer,
    isGameActive,
    isGameFinished,
    isWaitingForStart,
    hasGame
  } = useChallengeGame({ socket, enabled: isConnected })

  const handleCreateGame = (config: any) => {
    createChallengeGame(config)
  }

  const handleBackToLobby = () => {
    clearChallengeGame()
    router.push('/lobby')
  }

  const handleNewGame = () => {
    clearChallengeGame()
  }

  const getChallengeLevelColor = (level: string) => {
    switch (level) {
      case 'expert':
        return 'text-purple-400'
      case 'master':
        return 'text-red-400'
      case 'legendary':
        return 'text-orange-400'
      default:
        return 'text-gray-400'
    }
  }

  const getChallengeLevelIcon = (level: string) => {
    switch (level) {
      case 'expert':
        return <Crown className="w-4 h-4" />
      case 'master':
        return <Star className="w-4 h-4" />
      case 'legendary':
        return <Flame className="w-4 h-4" />
      default:
        return <Brain className="w-4 h-4" />
    }
  }

  const getChallengeLevelBg = (level: string) => {
    switch (level) {
      case 'expert':
        return 'bg-purple-500/20'
      case 'master':
        return 'bg-red-500/20'
      case 'legendary':
        return 'bg-orange-500/20'
      default:
        return 'bg-gray-500/20'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToLobby}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver al Lobby</span>
              </button>
              
              <div className="flex items-center gap-2">
                <Sword className="w-6 h-6 text-red-400" />
                <h1 className="text-xl font-bold text-white">Modo Desafío</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {hasGame && (
                <button
                  onClick={handleNewGame}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Nuevo Desafío</span>
                </button>
              )}
              
              <button
                onClick={() => setShowActionLog(!showActionLog)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                  showActionLog
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-gray-700 hover:bg-gray-600'
                )}
              >
                <Brain className="w-4 h-4" />
                <span>Log de IA</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="container mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {!hasGame ? (
            // Pantalla de configuración
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <ChallengeGameSetup
                onCreateGame={handleCreateGame}
                isCreating={isCreating}
                error={error}
                onClearError={clearError}
              />
            </motion.div>
          ) : (
            // Pantalla del juego
            <motion.div
              key="game"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Información del desafío */}
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-600 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Jugador humano */}
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center justify-center gap-2">
                      <Shield className="w-5 h-5 text-blue-400" />
                      Tu Guerrero
                    </h3>
                    <div className={clsx(
                      'p-4 rounded-lg border transition-all',
                      gameInfo?.currentPlayerId === gameInfo?.humanPlayer.id
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-gray-600 bg-gray-700/50'
                    )}>
                      <p className="font-medium text-white text-lg">{gameInfo?.humanPlayer.name}</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Cartas: {gameInfo?.humanPlayer.handSize} | Puntos: {gameInfo?.humanPlayer.score}
                      </p>
                      {gameInfo?.currentPlayerId === gameInfo?.humanPlayer.id && (
                        <p className="text-blue-400 text-sm mt-2">¡Tu turno!</p>
                      )}
                    </div>
                  </div>

                  {/* Estado del desafío */}
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Estado del Desafío
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-400">Mazo: {gameInfo?.deckType}</p>
                      <p className="text-red-400 font-medium">Modo: Desafío 1 vs 1</p>
                      <p className={clsx(
                        'font-medium',
                        isGameActive ? 'text-green-400' : 
                        isWaitingForStart ? 'text-yellow-400' : 'text-gray-400'
                      )}>
                        {isGameActive ? 'En batalla' : 
                         isWaitingForStart ? 'Preparando' : 'Terminado'}
                      </p>
                      <div className={clsx(
                        'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs',
                        getChallengeLevelBg(gameInfo?.challengeLevel || 'expert'),
                        getChallengeLevelColor(gameInfo?.challengeLevel || 'expert')
                      )}>
                        {getChallengeLevelIcon(gameInfo?.challengeLevel || 'expert')}
                        <span>Nivel {gameInfo?.challengeLevel}</span>
                      </div>
                    </div>
                  </div>

                  {/* IA de desafío */}
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center justify-center gap-2">
                      <Sword className="w-5 h-5 text-red-400" />
                      Tu Oponente
                    </h3>
                    <div className={clsx(
                      'p-4 rounded-lg border transition-all',
                      gameInfo?.currentPlayerId === gameInfo?.aiPlayer.id
                        ? 'border-red-500 bg-red-500/20'
                        : 'border-gray-600 bg-gray-700/50'
                    )}>
                      <p className="font-medium text-white text-lg">{gameInfo?.aiPlayer.name}</p>
                      <p className={clsx('text-sm font-medium', getChallengeLevelColor(gameInfo?.aiPlayer.challengeLevel))}>
                        {gameInfo?.aiPlayer.personality.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Cartas: {gameInfo?.aiPlayer.handSize} | Puntos: {gameInfo?.aiPlayer.score}
                      </p>
                      <p className="text-xs text-gray-400">
                        {gameInfo?.aiPlayer.personality.special}
                      </p>
                      {gameInfo?.currentPlayerId === gameInfo?.aiPlayer.id && (
                        <p className="text-red-400 text-sm mt-2">¡Turno de la IA!</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Advertencia de desafío */}
              <div className={clsx(
                'p-4 rounded-lg border',
                getChallengeLevelBg(gameInfo?.challengeLevel || 'expert'),
                'border-red-500/50'
              )}>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <div>
                    <h3 className="text-sm font-medium text-red-400">
                      Desafío {gameInfo?.challengeLevel?.toUpperCase()} - {gameInfo?.aiPlayer.name}
                    </h3>
                    <p className="text-xs text-gray-300 mt-1">
                      Esta IA es implacable. Cada movimiento cuenta en esta batalla épica.
                    </p>
                  </div>
                </div>
              </div>

              {/* Tablero de juego */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Tablero principal */}
                <div className="lg:col-span-3">
                  <GameBoard
                    socket={socket}
                    roomId={gameInfo?.roomId || ''}
                    playerId={gameInfo?.humanPlayer.id || ''}
                    isChallengeMode={true}
                  />
                </div>

                {/* Panel lateral */}
                <div className="space-y-4">
                  {/* Información del oponente */}
                  <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-600 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Sword className="w-5 h-5 text-red-400" />
                      Información del Oponente
                    </h3>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-gray-700/50">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-white">{gameInfo?.aiPlayer.name}</span>
                          <div className={clsx('flex items-center gap-1', getChallengeLevelColor(gameInfo?.aiPlayer.challengeLevel))}>
                            {getChallengeLevelIcon(gameInfo?.aiPlayer.challengeLevel)}
                          </div>
                        </div>
                        <p className={clsx('text-sm font-medium', getChallengeLevelColor(gameInfo?.aiPlayer.challengeLevel))}>
                          {gameInfo?.aiPlayer.personality.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {gameInfo?.aiPlayer.personality.style}
                        </p>
                        <p className="text-xs text-blue-400 mt-1">
                          {gameInfo?.aiPlayer.personality.special}
                        </p>
                        <div className="flex justify-between text-xs text-gray-400 mt-2">
                          <span>Cartas: {gameInfo?.aiPlayer.handSize}</span>
                          <span>Puntos: {gameInfo?.aiPlayer.score}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Log de acciones de IA */}
                  <AIActionLog
                    actions={aiActions}
                    isVisible={showActionLog}
                    onToggleVisibility={() => setShowActionLog(!showActionLog)}
                    onClearActions={() => {/* Implementar limpieza */}}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
