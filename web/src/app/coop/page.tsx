'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  RefreshCw, 
  Settings, 
  Users,
  Gamepad2,
  Brain,
  Crown,
  Zap,
  Target,
  UserPlus,
  Crown as CrownIcon
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSocket } from '@/hooks/useSocket'
import { useCoopGame } from '@/hooks/useCoopGame'
import CoopGameSetup from '@/components/CoopGameSetup'
import AIActionLog from '@/components/AIActionLog'
import GameBoard from '@/components/GameBoard'
import clsx from 'clsx'

export default function CoopPage() {
  const router = useRouter()
  const { socket, isConnected } = useSocket()
  const [showActionLog, setShowActionLog] = useState(true)
  
  const {
    gameInfo,
    availableGames,
    loading,
    error,
    isCreating,
    isJoining,
    aiActions,
    createCoopGame,
    joinCoopGame,
    getAvailableCoopGames,
    clearCoopGame,
    clearError,
    isHumanTurn,
    currentAIPlayer,
    isGameActive,
    isGameFinished,
    isWaitingForPlayers,
    canStartGame,
    hasGame
  } = useCoopGame({ socket, enabled: isConnected })

  const handleCreateGame = (config: any) => {
    createCoopGame(config)
  }

  const handleJoinGame = (roomId: string, playerName: string) => {
    joinCoopGame(roomId, playerName)
  }

  const handleBackToLobby = () => {
    clearCoopGame()
    router.push('/lobby')
  }

  const handleNewGame = () => {
    clearCoopGame()
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-400'
      case 'intermediate':
        return 'text-blue-400'
      case 'advanced':
        return 'text-purple-400'
      case 'expert':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return <Target className="w-4 h-4" />
      case 'intermediate':
        return <Zap className="w-4 h-4" />
      case 'advanced':
        return <Brain className="w-4 h-4" />
      case 'expert':
        return <Crown className="w-4 h-4" />
      default:
        return <Brain className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
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
                <Users className="w-6 h-6 text-blue-400" />
                <h1 className="text-xl font-bold text-white">Modo Cooperativo</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {hasGame && (
                <button
                  onClick={handleNewGame}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Nuevo Juego</span>
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
              <CoopGameSetup
                onCreateGame={handleCreateGame}
                onJoinGame={handleJoinGame}
                onGetAvailableGames={getAvailableCoopGames}
                availableGames={availableGames}
                isCreating={isCreating}
                isJoining={isJoining}
                loading={loading}
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
              {/* Información del juego */}
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-600 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Jugadores humanos */}
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-400" />
                      Jugadores Humanos
                    </h3>
                    <div className="space-y-3">
                      {gameInfo?.humanPlayers.map((player) => (
                        <div
                          key={player.id}
                          className={clsx(
                            'p-3 rounded-lg border transition-all',
                            player.id === gameInfo?.currentPlayerId
                              ? 'border-blue-500 bg-blue-500/20'
                              : 'border-gray-600 bg-gray-700/50'
                          )}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-white">{player.name}</span>
                              {player.isHost && (
                                <CrownIcon className="w-4 h-4 text-yellow-400" />
                              )}
                            </div>
                            <span className="text-sm text-gray-400">
                              Cartas: {player.handSize} | Puntos: {player.score}
                            </span>
                          </div>
                          {player.id === gameInfo?.currentPlayerId && (
                            <p className="text-blue-400 text-sm">¡Tu turno!</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Estado del juego */}
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Estado del Juego
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-400">Mazo: {gameInfo?.deckType}</p>
                      <p className="text-gray-400">Modo: Cooperativo</p>
                      <p className={clsx(
                        'font-medium',
                        isGameActive ? 'text-green-400' : 
                        isWaitingForPlayers ? 'text-yellow-400' : 'text-gray-400'
                      )}>
                        {isGameActive ? 'En progreso' : 
                         isWaitingForPlayers ? 'Esperando jugadores' : 'Terminado'}
                      </p>
                      <p className="text-gray-400">
                        {gameInfo?.currentHumanPlayers}/{gameInfo?.maxHumanPlayers} humanos
                      </p>
                    </div>
                  </div>

                  {/* Jugador IA actual */}
                  <div className="text-center">
                    {currentAIPlayer ? (
                      <>
                        <h3 className="text-lg font-semibold text-white mb-2 flex items-center justify-center gap-2">
                          <Brain className="w-5 h-5 text-purple-400" />
                          IA Actual
                        </h3>
                        <div className="space-y-1 text-sm">
                          <p className="font-medium text-white">{currentAIPlayer.name}</p>
                          <p className={clsx('font-medium', getDifficultyColor(currentAIPlayer.difficulty))}>
                            {currentAIPlayer.personality.name}
                          </p>
                          <p className="text-gray-400">
                            Dificultad: {currentAIPlayer.difficulty}
                          </p>
                          <p className="text-gray-400">
                            Cartas: {currentAIPlayer.handSize}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="text-gray-400">
                        <p>Esperando...</p>
                      </div>
                    )}
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
                    playerId={gameInfo?.humanPlayers[0]?.id || ''}
                    isCoopMode={true}
                  />
                </div>

                {/* Panel lateral */}
                <div className="space-y-4">
                  {/* Lista de jugadores IA */}
                  <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-600 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-400" />
                      Jugadores IA
                    </h3>
                    <div className="space-y-3">
                      {gameInfo?.aiPlayers.map((ai) => (
                        <div
                          key={ai.id}
                          className={clsx(
                            'p-3 rounded-lg border transition-all',
                            ai.id === gameInfo?.currentPlayerId
                              ? 'border-purple-500 bg-purple-500/20'
                              : 'border-gray-600 bg-gray-700/50'
                          )}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-white">{ai.name}</span>
                            <div className={clsx('flex items-center gap-1', getDifficultyColor(ai.difficulty))}>
                              {getDifficultyIcon(ai.difficulty)}
                            </div>
                          </div>
                          <p className="text-xs text-gray-400 mb-1">
                            {ai.personality.name}
                          </p>
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>Cartas: {ai.handSize}</span>
                            <span>Puntos: {ai.score}</span>
                          </div>
                        </div>
                      ))}
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
