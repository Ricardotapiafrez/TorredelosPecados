'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Socket } from 'socket.io-client'
import { io } from 'socket.io-client'
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  BarChart3,
  Settings,
  RefreshCw,
  Home,
  Cards,
  Key,
  MessageCircle
} from 'lucide-react'
import PublicRoomsList from '@/components/PublicRoomsList'
import RoomStats from '@/components/RoomStats'
import InvitationCodeManager from '@/components/InvitationCodeManager'
import JoinWithCode from '@/components/JoinWithCode'
import DeckConfigurationPanel from '@/components/DeckConfigurationPanel'
import DeckSelectionPanel from '@/components/DeckSelectionPanel'
import ChatPanel from '@/components/ChatPanel'
import { usePublicRooms } from '@/hooks/usePublicRooms'
import { useInvitationCodes } from '@/hooks/useInvitationCodes'
import { useDeckConfiguration } from '@/hooks/useDeckConfiguration'
import { PublicRoom, RoomInfo } from '@/hooks/usePublicRooms'
import Link from 'next/link'

export default function LobbyPage() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [playerName, setPlayerName] = useState('')
  const [showCreateRoom, setShowCreateRoom] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [showInvitations, setShowInvitations] = useState(false)
  const [showJoinWithCode, setShowJoinWithCode] = useState(false)
  const [showDeckConfiguration, setShowDeckConfiguration] = useState(false)
  const [showDeckSelection, setShowDeckSelection] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<RoomInfo | null>(null)
  const [joinModal, setJoinModal] = useState<{ roomId: string; roomName: string } | null>(null)

  // Inicializar socket
  useEffect(() => {
    const newSocket = io('http://localhost:5001')
    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  // Hook para manejar salas públicas
  const {
    rooms,
    loading,
    error,
    selectedRoom: hookSelectedRoom,
    loadPublicRooms,
    getRoomInfo,
    searchRooms,
    joinRoom,
    filterRooms,
    sortRooms,
    setSelectedRoom: setHookSelectedRoom,
    getRoomStats,
    getRecommendedRooms,
    isRoomAvailable,
    clearError,
    clearSearchResults
  } = usePublicRooms({
    socket,
    autoRefresh: true,
    refreshInterval: 10000, // Actualizar cada 10 segundos
    onRoomsUpdate: (rooms) => {
      console.log('Salas actualizadas:', rooms.length)
    },
    onRoomInfoUpdate: (roomInfo) => {
      console.log('Información de sala actualizada:', roomInfo.name)
    }
  })

  // Hook para manejar códigos de invitación
  const {
    generatedCode,
    isGenerating,
    isValidating,
    isUsing,
    validation,
    roomInvitations,
    error: invitationError,
    generateCode,
    validateCode,
    useCode,
    getRoomInvitations,
    deactivateCode,
    copyToClipboard,
    generateInvitationLink,
    formatTimeRemaining,
    isExpiringSoon,
    clearState: clearInvitationState,
    clearError: clearInvitationError
  } = useInvitationCodes({
    socket,
    onCodeGenerated: (code, roomId) => {
      console.log('Código generado:', code, 'para sala:', roomId)
    },
    onCodeUsed: (roomId, playerId) => {
      console.log('Código usado para unirse a sala:', roomId, 'jugador:', playerId)
      // Redirigir al juego
      window.location.href = `/game?roomId=${roomId}&playerId=${playerId}`
    },
    onCodeError: (error) => {
      console.error('Error con código de invitación:', error)
    }
  })

  // Hook para manejar configuración de mazos
  const {
    configurations,
    selectedConfiguration,
    roomConfiguration,
    loading: deckLoading,
    error: deckError,
    loadDeckConfigurations,
    getDeckConfiguration,
    createRoomConfiguration,
    getRoomConfiguration,
    updateRoomConfiguration,
    modifyCard,
    addCustomRule,
    removeCustomRule,
    validateConfiguration,
    exportConfiguration,
    importConfiguration,
    getDifficultyInfo,
    getThemeInfo,
    canModifyCard,
    clearState: clearDeckState,
    clearError: clearDeckError
  } = useDeckConfiguration({
    socket,
    onConfigurationCreated: (configuration) => {
      console.log('Configuración de mazo creada:', configuration.name)
    },
    onConfigurationUpdated: (configuration) => {
      console.log('Configuración de mazo actualizada:', configuration.name)
    },
    onCardModified: (modifiedCard) => {
      console.log('Carta modificada:', modifiedCard.name)
    },
    onCustomRuleAdded: (rule) => {
      console.log('Regla personalizada agregada:', rule.description)
    },
    onCustomRuleRemoved: (ruleId) => {
      console.log('Regla personalizada removida:', ruleId)
    }
  })

  // Manejar selección de sala
  const handleRoomSelect = (room: PublicRoom) => {
    setSelectedRoom(null)
    getRoomInfo(room.id)
  }

  // Manejar unirse a sala
  const handleRoomJoin = (roomId: string, playerName: string) => {
    if (!playerName.trim()) {
      setJoinModal({ roomId, roomName: rooms.find(r => r.id === roomId)?.name || 'Sala' })
      return
    }

    joinRoom(roomId, playerName)
  }

  // Manejar búsqueda
  const handleSearch = (criteria: any) => {
    searchRooms(criteria)
  }

  // Manejar filtros
  const handleFilter = (criteria: any) => {
    const filteredRooms = filterRooms(criteria)
    // Aquí podrías actualizar el estado local con las salas filtradas
  }

  // Manejar ordenamiento
  const handleSort = (sortBy: 'activity' | 'players' | 'created' | 'name') => {
    const sortedRooms = sortRooms(rooms, sortBy)
    // Aquí podrías actualizar el estado local con las salas ordenadas
  }

  // Manejar refresh
  const handleRefresh = () => {
    loadPublicRooms()
    clearError()
  }

  // Manejar unirse desde modal
  const handleJoinFromModal = () => {
    if (joinModal && playerName.trim()) {
      joinRoom(joinModal.roomId, playerName.trim())
      setJoinModal(null)
      setPlayerName('')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-600">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors">
                <Home className="w-5 h-5" />
                <span>Inicio</span>
              </Link>
              
              <div className="flex items-center space-x-2">
                <Users className="w-6 h-6 text-blue-400" />
                <h1 className="text-2xl font-bold">Lobby de Salas</h1>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowStats(!showStats)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Estadísticas</span>
              </button>

              <button
                onClick={() => setShowJoinWithCode(!showJoinWithCode)}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors"
              >
                <Key className="w-4 h-4" />
                <span>Unirse con Código</span>
              </button>

              <button
                onClick={() => setShowDeckConfiguration(!showDeckConfiguration)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
              >
                <Cards className="w-4 h-4" />
                <span>Configurar Mazos</span>
              </button>

              <button
                onClick={() => setShowDeckSelection(!showDeckSelection)}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Seleccionar Mazos</span>
              </button>

              <button
                onClick={() => setShowChat(!showChat)}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat</span>
              </button>

              <button
                onClick={() => setShowCreateRoom(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Sala</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="container mx-auto px-4 py-6">
        {/* Unirse con código */}
        <AnimatePresence>
          {showJoinWithCode && (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <JoinWithCode
                validation={validation}
                isValidating={isValidating}
                isUsing={isUsing}
                error={invitationError}
                onValidateCode={validateCode}
                onUseCode={useCode}
                onClearError={clearInvitationError}
                onCopyToClipboard={copyToClipboard}
                onGenerateInvitationLink={generateInvitationLink}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Configuración de mazos */}
        <AnimatePresence>
          {showDeckConfiguration && (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <DeckConfigurationPanel
                configurations={configurations}
                selectedConfiguration={selectedConfiguration}
                roomConfiguration={roomConfiguration}
                loading={deckLoading}
                error={deckError}
                onLoadConfigurations={loadDeckConfigurations}
                onGetConfiguration={getDeckConfiguration}
                onCreateRoomConfiguration={createRoomConfiguration}
                onGetRoomConfiguration={getRoomConfiguration}
                onUpdateRoomConfiguration={updateRoomConfiguration}
                onModifyCard={modifyCard}
                onAddCustomRule={addCustomRule}
                onRemoveCustomRule={removeCustomRule}
                onValidateConfiguration={validateConfiguration}
                onExportConfiguration={exportConfiguration}
                onImportConfiguration={importConfiguration}
                getDifficultyInfo={getDifficultyInfo}
                getThemeInfo={getThemeInfo}
                canModifyCard={canModifyCard}
                onClearError={clearDeckError}
                roomId={selectedRoom?.id}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selección de mazos */}
        <AnimatePresence>
          {showDeckSelection && (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <DeckSelectionPanel
                socket={socket}
                currentPlayerId="current-player-id" // Esto debería venir del contexto del usuario
                isHost={true} // Esto debería venir del contexto del usuario
                onDeckChanged={(playerId, deckType, deckInfo) => {
                  console.log(`Mazo cambiado para ${playerId}: ${deckType}`)
                }}
                onClose={() => setShowDeckSelection(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <ChatPanel
                socket={socket}
                roomId="lobby"
                userId={playerName || 'Anónimo'}
                userInfo={{ name: playerName || 'Anónimo' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de salas */}
          <div className="lg:col-span-2">
            <PublicRoomsList
              rooms={rooms}
              loading={loading}
              error={error}
              selectedRoom={selectedRoom}
              onRoomSelect={handleRoomSelect}
              onRoomJoin={handleRoomJoin}
              onRefresh={handleRefresh}
              onSearch={handleSearch}
              onFilter={handleFilter}
              onSort={handleSort}
            />
          </div>

          {/* Panel lateral */}
          <div className="space-y-6">
            {/* Estadísticas */}
            <AnimatePresence>
              {showStats && (
                <motion.div
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ duration: 0.3 }}
                >
                  <RoomStats rooms={rooms} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Salas recomendadas */}
            {getRecommendedRooms().length > 0 && (
              <div className="bg-gray-800 rounded-lg border border-gray-600 p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Salas Recomendadas</h3>
                <div className="space-y-3">
                  {getRecommendedRooms().map(room => (
                    <motion.div
                      key={room.id}
                      className="p-3 bg-gray-700 rounded-lg border border-gray-600 hover:border-blue-500 transition-colors cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      onClick={() => handleRoomSelect(room)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white truncate">{room.name}</span>
                        <span className="text-sm text-green-400">{room.playerCount}/{room.maxPlayers}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-400">
                        <span>👑 {room.hostName}</span>
                        <span>•</span>
                        <span>{room.deckType}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Gestión de invitaciones */}
            {selectedRoom && (
              <div className="bg-gray-800 rounded-lg border border-gray-600 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Invitaciones</h3>
                  <button
                    onClick={() => setShowInvitations(!showInvitations)}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    {showInvitations ? 'Ocultar' : 'Gestionar'}
                  </button>
                </div>
                
                <AnimatePresence>
                  {showInvitations && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <InvitationCodeManager
                        roomId={selectedRoom.id}
                        playerId="current-player-id" // Esto debería venir del contexto del usuario
                        playerName="Jugador Actual" // Esto debería venir del contexto del usuario
                        generatedCode={generatedCode}
                        isGenerating={isGenerating}
                        roomInvitations={roomInvitations}
                        error={invitationError}
                        onGenerateCode={generateCode}
                        onGetRoomInvitations={getRoomInvitations}
                        onDeactivateCode={deactivateCode}
                        onCopyToClipboard={copyToClipboard}
                        onGenerateInvitationLink={generateInvitationLink}
                        onFormatTimeRemaining={formatTimeRemaining}
                        onIsExpiringSoon={isExpiringSoon}
                        onClearError={clearInvitationError}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Información de conexión */}
            <div className="bg-gray-800 rounded-lg border border-gray-600 p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Estado del Servidor</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Estado</span>
                  <span className="text-green-400">Conectado</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Salas activas</span>
                  <span className="text-white">{rooms.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Última actualización</span>
                  <span className="text-white">{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de unirse a sala */}
      <AnimatePresence>
        {joinModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-800 rounded-lg border border-gray-600 p-6 max-w-md w-full mx-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <h3 className="text-xl font-bold text-white mb-4">
                Unirse a {joinModal.roomName}
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tu nombre
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Ingresa tu nombre..."
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  autoFocus
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setJoinModal(null)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleJoinFromModal}
                  disabled={!playerName.trim()}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  Unirse
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de crear sala */}
      <AnimatePresence>
        {showCreateRoom && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-800 rounded-lg border border-gray-600 p-6 max-w-md w-full mx-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <h3 className="text-xl font-bold text-white mb-4">Crear Nueva Sala</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tu nombre
                  </label>
                  <input
                    type="text"
                    placeholder="Ingresa tu nombre..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre de la sala (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Mi sala épica..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo de mazo
                  </label>
                  <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                    <option value="angels">👼 Ángeles</option>
                    <option value="demons">😈 Demonios</option>
                    <option value="dragons">🐉 Dragones</option>
                    <option value="mages">🧙‍♂️ Magos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Máximo de jugadores
                  </label>
                  <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                    <option value="2">2 jugadores</option>
                    <option value="3">3 jugadores</option>
                    <option value="4">4 jugadores</option>
                    <option value="5">5 jugadores</option>
                    <option value="6">6 jugadores</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateRoom(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    // Aquí iría la lógica para crear sala
                    setShowCreateRoom(false)
                  }}
                  className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  Crear Sala
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
