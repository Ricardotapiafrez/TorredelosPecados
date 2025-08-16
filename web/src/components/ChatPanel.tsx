'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, 
  Send, 
  Search, 
  Users, 
  Settings, 
  MoreVertical,
  Edit3,
  Trash2,
  Smile,
  Mic,
  Paperclip,
  X,
  Check,
  AlertCircle,
  Crown,
  User
} from 'lucide-react'
import { useChat, ChatMessage, ChatUser } from '@/hooks/useChat'
import clsx from 'clsx'

interface ChatPanelProps {
  socket: any
  roomId: string
  userId: string
  userInfo?: any
  className?: string
}

export default function ChatPanel({
  socket,
  roomId,
  userId,
  userInfo = {},
  className = ''
}: ChatPanelProps) {
  const [message, setMessage] = useState('')
  const [showUsers, setShowUsers] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [editingMessage, setEditingMessage] = useState<string | null>(null)
  const [showEmotes, setShowEmotes] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const {
    messages,
    users,
    isConnected,
    isLoading,
    error,
    roomInfo,
    isTyping,
    typingUsers,
    searchQuery,
    searchResults,
    messagesEndRef,
    sendMessage,
    editMessage,
    deleteMessage,
    searchMessages,
    setTyping,
    sendEmote,
    formatTimestamp,
    isOwnMessage,
    isModerator,
    setSearchQuery,
    clearError,
    clearSearch
  } = useChat({
    socket,
    roomId,
    userId,
    userInfo,
    onMessageReceived: (message) => {
      // Notificación de sonido o visual si está en segundo plano
      if (document.hidden) {
        // Aquí podrías agregar notificaciones del navegador
      }
    }
  })

  // Emotes disponibles
  const emotes = [
    '😊', '😂', '😍', '🤔', '👍', '👎', '❤️', '🔥', '💯', '🎉',
    '😎', '🤯', '😱', '😭', '🤣', '😅', '😇', '🤗', '🤝', '🙏'
  ]

  // Manejar envío de mensaje
  const handleSendMessage = () => {
    if (!message.trim() || !isConnected) return

    if (editingMessage) {
      editMessage(editingMessage, message)
      setEditingMessage(null)
    } else {
      sendMessage({
        content: message,
        type: 'text'
      })
    }

    setMessage('')
    setTyping(false)
    inputRef.current?.focus()
  }

  // Manejar tecla Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    } else if (e.key === 'Escape') {
      setEditingMessage(null)
      setMessage('')
    }
  }

  // Manejar cambio en el input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value)
    setTyping(e.target.value.length > 0)
  }

  // Manejar búsqueda
  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchMessages(searchQuery)
    }
  }

  // Manejar emote
  const handleEmote = (emote: string) => {
    sendEmote(emote)
    setShowEmotes(false)
  }

  // Manejar edición de mensaje
  const handleEditMessage = (messageId: string, currentContent: string) => {
    setEditingMessage(messageId)
    setMessage(currentContent)
    inputRef.current?.focus()
  }

  // Manejar eliminación de mensaje
  const handleDeleteMessage = (messageId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este mensaje?')) {
      deleteMessage(messageId)
    }
  }

  // Obtener nombre de usuario
  const getUserName = (userId: string) => {
    const user = users.find(u => u.userId === userId)
    return user ? user.userId : userId
  }

  // Verificar si el usuario actual es moderador
  const currentUser = users.find(u => u.userId === userId)
  const isCurrentUserModerator = currentUser?.isModerator || false

  return (
    <div className={clsx('bg-gray-800 rounded-lg border border-gray-600 flex flex-col h-96', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-600">
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="font-semibold text-white">
              {roomInfo?.name || 'Chat del Lobby'}
            </h3>
            <p className="text-sm text-gray-400">
              {isConnected ? `${users.length} usuarios conectados` : 'Conectando...'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Indicador de conexión */}
          <div className={clsx(
            'w-2 h-2 rounded-full',
            isConnected ? 'bg-green-400' : 'bg-red-400'
          )} />

          {/* Botones de acción */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowUsers(!showUsers)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <Users className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Búsqueda */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            className="p-4 border-b border-gray-600"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Buscar mensajes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Buscar
              </button>
              <button
                onClick={() => {
                  setShowSearch(false)
                  clearSearch()
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Resultados de búsqueda */}
            {searchResults.length > 0 && (
              <div className="mt-3 max-h-32 overflow-y-auto">
                <p className="text-sm text-gray-400 mb-2">
                  {searchResults.length} resultado(s) encontrado(s)
                </p>
                {searchResults.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-2 bg-gray-700 rounded mb-1 cursor-pointer hover:bg-gray-600"
                    onClick={() => {
                      // Scroll al mensaje
                      const messageElement = document.getElementById(`message-${msg.id}`)
                      messageElement?.scrollIntoView({ behavior: 'smooth' })
                    }}
                  >
                    <p className="text-sm text-white">{msg.content}</p>
                    <p className="text-xs text-gray-400">
                      {getUserName(msg.userId)} • {formatTimestamp(msg.timestamp)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contenido principal */}
      <div className="flex flex-1 overflow-hidden">
        {/* Mensajes */}
        <div className="flex-1 flex flex-col">
          {/* Lista de mensajes */}
          <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-3"
          >
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                <p>No hay mensajes aún. ¡Sé el primero en escribir!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  id={`message-${msg.id}`}
                  className={clsx(
                    'group relative p-3 rounded-lg',
                    isOwnMessage(msg) 
                      ? 'bg-blue-500/20 border border-blue-500/30 ml-8' 
                      : 'bg-gray-700/50 border border-gray-600/30 mr-8'
                  )}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Header del mensaje */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {isModerator(users.find(u => u.userId === msg.userId) || { userId: '', isModerator: false }) ? (
                        <Crown className="w-4 h-4 text-yellow-400" />
                      ) : (
                        <User className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="font-medium text-white">
                        {getUserName(msg.userId)}
                      </span>
                      {isOwnMessage(msg) && (
                        <span className="text-xs text-blue-400">(Tú)</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-400">
                        {formatTimestamp(msg.timestamp)}
                      </span>
                      {msg.edited && (
                        <span className="text-xs text-gray-500">(editado)</span>
                      )}
                    </div>
                  </div>

                  {/* Contenido del mensaje */}
                  <div className="text-white">
                    {msg.type === 'emote' ? (
                      <span className="italic text-blue-300">
                        {msg.content}
                      </span>
                    ) : msg.type === 'system' ? (
                      <span className="text-yellow-300 font-medium">
                        {msg.content}
                      </span>
                    ) : (
                      <span className={msg.deleted ? 'text-gray-500 italic' : ''}>
                        {msg.content}
                      </span>
                    )}
                  </div>

                  {/* Acciones del mensaje */}
                  {!msg.deleted && isOwnMessage(msg) && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEditMessage(msg.id, msg.content)}
                          className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))
            )}

            {/* Indicador de usuarios escribiendo */}
            {typingUsers.size > 0 && (
              <motion.div
                className="text-sm text-gray-400 italic"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {Array.from(typingUsers).map(userId => getUserName(userId)).join(', ')} está escribiendo...
              </motion.div>
            )}

            {/* Referencia para auto-scroll */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input de mensaje */}
          <div className="p-4 border-t border-gray-600">
            {error && (
              <div className="mb-3 p-2 bg-red-500/10 border border-red-500 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <p className="text-red-400 text-sm">{error}</p>
                  <button
                    onClick={clearError}
                    className="ml-auto text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              {/* Botón de emotes */}
              <button
                onClick={() => setShowEmotes(!showEmotes)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <Smile className="w-4 h-4" />
              </button>

              {/* Input de mensaje */}
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={editingMessage ? "Editar mensaje..." : "Escribe un mensaje..."}
                  value={message}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  onBlur={() => setTyping(false)}
                  disabled={!isConnected}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                />
                {editingMessage && (
                  <button
                    onClick={() => setEditingMessage(null)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Botón de enviar */}
              <button
                onClick={handleSendMessage}
                disabled={!message.trim() || !isConnected}
                className="p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* Panel de emotes */}
            <AnimatePresence>
              {showEmotes && (
                <motion.div
                  className="mt-3 p-3 bg-gray-700 rounded-lg border border-gray-600"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="grid grid-cols-10 gap-2">
                    {emotes.map((emote, index) => (
                      <button
                        key={index}
                        onClick={() => handleEmote(emote)}
                        className="p-2 hover:bg-gray-600 rounded transition-colors text-lg"
                      >
                        {emote}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Panel de usuarios */}
        <AnimatePresence>
          {showUsers && (
            <motion.div
              className="w-64 border-l border-gray-600 bg-gray-800"
              initial={{ width: 0 }}
              animate={{ width: 256 }}
              exit={{ width: 0 }}
            >
              <div className="p-4 border-b border-gray-600">
                <h4 className="font-semibold text-white">Usuarios ({users.length})</h4>
              </div>
              <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                {users.map((user) => (
                  <div
                    key={user.userId}
                    className="flex items-center space-x-2 p-2 rounded hover:bg-gray-700"
                  >
                    {isModerator(user) ? (
                      <Crown className="w-4 h-4 text-yellow-400" />
                    ) : (
                      <User className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-white text-sm">
                      {user.userId}
                      {user.userId === userId && ' (Tú)'}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
