'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Cards, 
  Users, 
  Bot, 
  User, 
  Settings, 
  RefreshCw,
  Check,
  X,
  AlertTriangle,
  Sparkles,
  Shield,
  Sword,
  Zap,
  Brain
} from 'lucide-react'
import { useDeckSelection, DeckInfo, PlayerDeckInfo } from '@/hooks/useDeckSelection'
import { Socket } from 'socket.io-client'
import clsx from 'clsx'

interface DeckSelectionPanelProps {
  socket: Socket | null
  currentPlayerId?: string
  isHost?: boolean
  onDeckChanged?: (playerId: string, deckType: string, deckInfo: any) => void
  onClose?: () => void
  className?: string
}

export default function DeckSelectionPanel({
  socket,
  currentPlayerId,
  isHost = false,
  onDeckChanged,
  onClose,
  className = ''
}: DeckSelectionPanelProps) {
  const [showPanel, setShowPanel] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerDeckInfo | null>(null)
  const [showDeckSelector, setShowDeckSelector] = useState(false)

  const {
    playersDeckInfo,
    loading,
    error,
    availableDecks,
    changePlayerDeck,
    getPlayersDeckInfo,
    getDeckInfo,
    setupSocketListeners,
    cleanupSocketListeners,
    clearState,
    clearError
  } = useDeckSelection({
    socket,
    onDeckChanged: (playerId, deckType, deckInfo) => {
      onDeckChanged?.(playerId, deckType, deckInfo)
      setShowDeckSelector(false)
      setSelectedPlayer(null)
    },
    onPlayersDeckInfoReceived: (players) => {
      console.log('Información de mazos recibida:', players)
    }
  })

  // Configurar listeners al montar
  useEffect(() => {
    setupSocketListeners()
    return () => cleanupSocketListeners()
  }, [setupSocketListeners, cleanupSocketListeners])

  // Cargar información de mazos al abrir el panel
  useEffect(() => {
    if (showPanel) {
      getPlayersDeckInfo()
    }
  }, [showPanel, getPlayersDeckInfo])

  const handleOpenPanel = () => {
    setShowPanel(true)
    clearError()
  }

  const handleClosePanel = () => {
    setShowPanel(false)
    setSelectedPlayer(null)
    setShowDeckSelector(false)
    onClose?.()
  }

  const handleSelectPlayer = (player: PlayerDeckInfo) => {
    // Solo permitir cambiar mazo propio o si es host
    if (player.id === currentPlayerId || isHost) {
      setSelectedPlayer(player)
      setShowDeckSelector(true)
    }
  }

  const handleDeckSelection = (deckType: string) => {
    if (selectedPlayer) {
      changePlayerDeck(selectedPlayer.id, deckType)
    }
  }

  const canChangePlayerDeck = (player: PlayerDeckInfo) => {
    return player.id === currentPlayerId || isHost
  }

  const getDeckIcon = (deckType: string) => {
    const deckInfo = getDeckInfo(deckType)
    return deckInfo?.icon || '🎴'
  }

  const getDeckName = (deckType: string) => {
    const deckInfo = getDeckInfo(deckType)
    return deckInfo?.name || 'Mazo Desconocido'
  }

  const getDeckTheme = (deckType: string) => {
    const deckInfo = getDeckInfo(deckType)
    return deckInfo?.theme || 'Tema Desconocido'
  }

  return (
    <div className={clsx('relative', className)}>
      {/* Botón para abrir panel */}
      <button
        onClick={handleOpenPanel}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
      >
        <Cards className="w-4 h-4" />
        <span>Seleccionar Mazos</span>
      </button>

      {/* Panel de selección de mazos */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={handleClosePanel}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Cards className="w-6 h-6 text-blue-400" />
                  <h2 className="text-xl font-bold text-white">Selección de Mazos</h2>
                </div>
                <button
                  onClick={handleClosePanel}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-red-400">{error}</span>
                  <button
                    onClick={clearError}
                    className="ml-auto p-1 hover:bg-red-500/20 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Loading */}
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
                  <span className="ml-2 text-gray-400">Cargando información de mazos...</span>
                </div>
              )}

              {/* Contenido principal */}
              {!loading && (
                <div className="space-y-6">
                  {/* Lista de jugadores */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Jugadores y sus Mazos
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {playersDeckInfo.map((player) => (
                        <motion.div
                          key={player.id}
                          className={clsx(
                            'p-4 rounded-lg border-2 transition-all cursor-pointer',
                            canChangePlayerDeck(player)
                              ? 'border-gray-600 bg-gray-700/50 hover:border-blue-500 hover:bg-gray-700'
                              : 'border-gray-600 bg-gray-700/30 opacity-75'
                          )}
                          whileHover={canChangePlayerDeck(player) ? { scale: 1.02 } : {}}
                          onClick={() => handleSelectPlayer(player)}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              {player.isBot ? (
                                <Bot className="w-4 h-4 text-purple-400" />
                              ) : (
                                <User className="w-4 h-4 text-blue-400" />
                              )}
                              <span className="font-medium text-white">{player.name}</span>
                              {player.id === currentPlayerId && (
                                <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">Tú</span>
                              )}
                            </div>
                            {canChangePlayerDeck(player) && (
                              <Settings className="w-4 h-4 text-gray-400" />
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{getDeckIcon(player.selectedDeck)}</span>
                            <div className="flex-1">
                              <p className="font-medium text-white">{getDeckName(player.selectedDeck)}</p>
                              <p className="text-sm text-gray-400">{getDeckTheme(player.selectedDeck)}</p>
                            </div>
                          </div>

                          {!canChangePlayerDeck(player) && (
                            <p className="text-xs text-gray-500 mt-2">
                              Solo el host puede cambiar mazos de otros jugadores
                            </p>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Información de mazos disponibles */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Mazos Disponibles
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {availableDecks.map((deck) => (
                        <div
                          key={deck.id}
                          className="p-4 bg-gray-700 rounded-lg border border-gray-600"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-2xl">{deck.icon}</span>
                            <div>
                              <h4 className="font-semibold text-white">{deck.name}</h4>
                              <p className="text-sm text-gray-400">{deck.description}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Shield className="w-4 h-4 text-blue-400" />
                              <span className="text-gray-300">Tema: {deck.theme}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Sword className="w-4 h-4 text-red-400" />
                              <span className="text-gray-300">Estrategia: {deck.strategy}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de selección de mazo */}
      <AnimatePresence>
        {showDeckSelector && selectedPlayer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowDeckSelector(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">
                  Seleccionar Mazo para {selectedPlayer.name}
                </h3>
                <button
                  onClick={() => setShowDeckSelector(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {availableDecks.map((deck) => (
                  <button
                    key={deck.id}
                    onClick={() => handleDeckSelection(deck.id)}
                    className={clsx(
                      'p-4 rounded-lg border-2 transition-all text-left',
                      selectedPlayer.selectedDeck === deck.id
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-gray-600 bg-gray-700/50 hover:border-gray-500 hover:bg-gray-700'
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{deck.icon}</span>
                      <span className="font-medium text-white">{deck.name}</span>
                      {selectedPlayer.selectedDeck === deck.id && (
                        <Check className="w-4 h-4 text-blue-400 ml-auto" />
                      )}
                    </div>
                    <p className="text-sm text-gray-400">{deck.description}</p>
                    <div className="mt-2 text-xs text-gray-500">
                      <p>Tema: {deck.theme}</p>
                      <p>Estrategia: {deck.strategy}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
