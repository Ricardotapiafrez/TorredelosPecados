import { useState, useEffect, useCallback, useRef } from 'react'
import { Socket } from 'socket.io-client'

export interface ChatMessage {
  id: string
  userId: string
  content: string
  type: 'text' | 'system' | 'emote' | 'image'
  replyTo?: string | null
  timestamp: Date
  edited: boolean
  deleted: boolean
  metadata?: any
}

export interface ChatRoom {
  id: string
  name: string
  type: 'lobby' | 'game' | 'private'
  userCount: number
  maxUsers: number
  isPrivate: boolean
  lastActivity: Date
  settings: {
    allowEmojis: boolean
    allowLinks: boolean
    allowImages: boolean
    requireModeration: boolean
    slowMode: boolean
    slowModeInterval: number
  }
}

export interface ChatUser {
  userId: string
  isModerator: boolean
  joinedAt: Date
}

export interface MessageData {
  content: string
  type?: 'text' | 'system' | 'emote' | 'image'
  replyTo?: string | null
  metadata?: any
}

interface UseChatOptions {
  socket: Socket | null
  roomId: string
  userId: string
  userInfo?: any
  onMessageReceived?: (message: ChatMessage) => void
  onUserJoined?: (user: ChatUser) => void
  onUserLeft?: (userId: string) => void
  onRoomJoined?: (room: ChatRoom) => void
  onRoomLeft?: (roomId: string) => void
}

export function useChat(options: UseChatOptions) {
  const {
    socket,
    roomId,
    userId,
    userInfo = {},
    onMessageReceived,
    onUserJoined,
    onUserLeft,
    onRoomJoined,
    onRoomLeft
  } = options

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [users, setUsers] = useState<ChatUser[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [roomInfo, setRoomInfo] = useState<ChatRoom | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<ChatMessage[]>([])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-scroll al final de los mensajes
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Unirse a la sala de chat
  const joinRoom = useCallback(() => {
    if (!socket || !roomId || !userId) return

    setIsLoading(true)
    setError(null)

    socket.emit('joinChatRoom', { roomId, userId, userInfo })
  }, [socket, roomId, userId, userInfo])

  // Salir de la sala de chat
  const leaveRoom = useCallback(() => {
    if (!socket || !roomId || !userId) return

    socket.emit('leaveChatRoom', { roomId, userId })
  }, [socket, roomId, userId])

  // Enviar mensaje
  const sendMessage = useCallback((messageData: MessageData) => {
    if (!socket || !roomId || !userId) return

    setError(null)

    socket.emit('sendChatMessage', {
      roomId,
      userId,
      messageData
    })
  }, [socket, roomId, userId])

  // Cargar mensajes
  const loadMessages = useCallback((options = {}) => {
    if (!socket || !roomId) return

    socket.emit('getChatMessages', { roomId, options })
  }, [socket, roomId])

  // Editar mensaje
  const editMessage = useCallback((messageId: string, newContent: string) => {
    if (!socket || !roomId || !userId) return

    setError(null)

    socket.emit('editChatMessage', {
      roomId,
      messageId,
      userId,
      newContent
    })
  }, [socket, roomId, userId])

  // Eliminar mensaje
  const deleteMessage = useCallback((messageId: string, isModerator = false) => {
    if (!socket || !roomId || !userId) return

    setError(null)

    socket.emit('deleteChatMessage', {
      roomId,
      messageId,
      userId,
      isModerator
    })
  }, [socket, roomId, userId])

  // Cargar usuarios de la sala
  const loadUsers = useCallback(() => {
    if (!socket || !roomId) return

    socket.emit('getChatRoomUsers', { roomId })
  }, [socket, roomId])

  // Buscar mensajes
  const searchMessages = useCallback((query: string, options = {}) => {
    if (!socket || !roomId || !query.trim()) return

    socket.emit('searchChatMessages', { roomId, query, options })
  }, [socket, roomId])

  // Indicar que está escribiendo
  const setTyping = useCallback((isTyping: boolean) => {
    if (!socket || !roomId || !userId) return

    if (isTyping) {
      socket.emit('typing', { roomId, userId, isTyping: true })
      
      // Limpiar timeout anterior
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      
      // Establecer timeout para dejar de escribir
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', { roomId, userId, isTyping: false })
      }, 3000)
    } else {
      socket.emit('typing', { roomId, userId, isTyping: false })
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = null
      }
    }
  }, [socket, roomId, userId])

  // Enviar emote
  const sendEmote = useCallback((emote: string) => {
    sendMessage({
      content: `/me ${emote}`,
      type: 'emote'
    })
  }, [sendMessage])

  // Enviar mensaje del sistema (solo moderadores)
  const sendSystemMessage = useCallback((content: string) => {
    sendMessage({
      content,
      type: 'system'
    })
  }, [sendMessage])

  // Formatear timestamp
  const formatTimestamp = useCallback((timestamp: Date) => {
    const now = new Date()
    const messageTime = new Date(timestamp)
    const diff = now.getTime() - messageTime.getTime()
    
    if (diff < 60000) { // Menos de 1 minuto
      return 'Ahora'
    } else if (diff < 3600000) { // Menos de 1 hora
      const minutes = Math.floor(diff / 60000)
      return `Hace ${minutes} min`
    } else if (diff < 86400000) { // Menos de 1 día
      const hours = Math.floor(diff / 3600000)
      return `Hace ${hours}h`
    } else {
      return messageTime.toLocaleDateString()
    }
  }, [])

  // Verificar si un mensaje es del usuario actual
  const isOwnMessage = useCallback((message: ChatMessage) => {
    return message.userId === userId
  }, [userId])

  // Verificar si un usuario es moderador
  const isModerator = useCallback((user: ChatUser) => {
    return user.isModerator
  }, [])

  // Configurar event listeners del socket
  useEffect(() => {
    if (!socket) return

    const handleChatRoomJoined = (data: { room: ChatRoom, message: string }) => {
      setRoomInfo(data.room)
      setIsConnected(true)
      setIsLoading(false)
      onRoomJoined?.(data.room)
    }

    const handleChatRoomLeft = (data: { message: string }) => {
      setIsConnected(false)
      setRoomInfo(null)
      setMessages([])
      setUsers([])
      onRoomLeft?.(roomId)
    }

    const handleChatMessageSent = (data: { message: ChatMessage }) => {
      const message = {
        ...data.message,
        timestamp: new Date(data.message.timestamp)
      }
      
      setMessages(prev => [...prev, message])
      scrollToBottom()
    }

    const handleChatMessageReceived = (data: { message: ChatMessage }) => {
      const message = {
        ...data.message,
        timestamp: new Date(data.message.timestamp)
      }
      
      setMessages(prev => [...prev, message])
      onMessageReceived?.(message)
      scrollToBottom()
    }

    const handleChatMessageEdited = (data: { message: ChatMessage }) => {
      const message = {
        ...data.message,
        timestamp: new Date(data.message.timestamp)
      }
      
      setMessages(prev => prev.map(msg => 
        msg.id === message.id ? message : msg
      ))
    }

    const handleChatMessageDeleted = (data: { messageId: string, deletedBy: string }) => {
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId 
          ? { ...msg, deleted: true, content: '[Mensaje eliminado]' }
          : msg
      ))
    }

    const handleChatMessagesList = (data: { roomId: string, messages: ChatMessage[] }) => {
      const formattedMessages = data.messages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
      
      setMessages(formattedMessages)
      scrollToBottom()
    }

    const handleChatRoomUsersList = (data: { roomId: string, users: ChatUser[] }) => {
      const formattedUsers = data.users.map(user => ({
        ...user,
        joinedAt: new Date(user.joinedAt)
      }))
      
      setUsers(formattedUsers)
    }

    const handleUserJoinedChat = (data: { userId: string, userInfo: any, timestamp: Date }) => {
      const newUser: ChatUser = {
        userId: data.userId,
        isModerator: false,
        joinedAt: new Date(data.timestamp)
      }
      
      setUsers(prev => [...prev, newUser])
      onUserJoined?.(newUser)
    }

    const handleUserLeftChat = (data: { userId: string, timestamp: Date }) => {
      setUsers(prev => prev.filter(user => user.userId !== data.userId))
      onUserLeft?.(data.userId)
    }

    const handleChatMessagesSearchResult = (data: { roomId: string, query: string, results: ChatMessage[] }) => {
      const formattedResults = data.results.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
      
      setSearchResults(formattedResults)
    }

    const handleTyping = (data: { userId: string, isTyping: boolean }) => {
      if (data.userId === userId) return // No mostrar nuestro propio typing
      
      setTypingUsers(prev => {
        const newSet = new Set(prev)
        if (data.isTyping) {
          newSet.add(data.userId)
        } else {
          newSet.delete(data.userId)
        }
        return newSet
      })
    }

    const handleError = (data: { message: string }) => {
      setError(data.message)
      setIsLoading(false)
    }

    // Event listeners
    socket.on('chatRoomJoined', handleChatRoomJoined)
    socket.on('chatRoomLeft', handleChatRoomLeft)
    socket.on('chatMessageSent', handleChatMessageSent)
    socket.on('chatMessageReceived', handleChatMessageReceived)
    socket.on('chatMessageEdited', handleChatMessageEdited)
    socket.on('chatMessageDeleted', handleChatMessageDeleted)
    socket.on('chatMessagesList', handleChatMessagesList)
    socket.on('chatRoomUsersList', handleChatRoomUsersList)
    socket.on('userJoinedChat', handleUserJoinedChat)
    socket.on('userLeftChat', handleUserLeftChat)
    socket.on('chatMessagesSearchResult', handleChatMessagesSearchResult)
    socket.on('typing', handleTyping)
    socket.on('error', handleError)

    return () => {
      socket.off('chatRoomJoined', handleChatRoomJoined)
      socket.off('chatRoomLeft', handleChatRoomLeft)
      socket.off('chatMessageSent', handleChatMessageSent)
      socket.off('chatMessageReceived', handleChatMessageReceived)
      socket.off('chatMessageEdited', handleChatMessageEdited)
      socket.off('chatMessageDeleted', handleChatMessageDeleted)
      socket.off('chatMessagesList', handleChatMessagesList)
      socket.off('chatRoomUsersList', handleChatRoomUsersList)
      socket.off('userJoinedChat', handleUserJoinedChat)
      socket.off('userLeftChat', handleUserLeftChat)
      socket.off('chatMessagesSearchResult', handleChatMessagesSearchResult)
      socket.off('typing', handleTyping)
      socket.off('error', handleError)
    }
  }, [socket, roomId, userId, onMessageReceived, onUserJoined, onUserLeft, onRoomJoined, onRoomLeft, scrollToBottom])

  // Unirse automáticamente al montar el componente
  useEffect(() => {
    if (socket && roomId && userId && !isConnected) {
      joinRoom()
    }
  }, [socket, roomId, userId, isConnected, joinRoom])

  // Salir automáticamente al desmontar
  useEffect(() => {
    return () => {
      if (isConnected) {
        leaveRoom()
      }
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [isConnected, leaveRoom])

  // Cargar mensajes y usuarios al conectarse
  useEffect(() => {
    if (isConnected) {
      loadMessages()
      loadUsers()
    }
  }, [isConnected, loadMessages, loadUsers])

  // Limpiar error después de 5 segundos
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  // Limpiar usuarios escribiendo después de 5 segundos
  useEffect(() => {
    if (typingUsers.size > 0) {
      const timer = setTimeout(() => setTypingUsers(new Set()), 5000)
      return () => clearTimeout(timer)
    }
  }, [typingUsers])

  return {
    // Estado
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

    // Acciones
    joinRoom,
    leaveRoom,
    sendMessage,
    loadMessages,
    editMessage,
    deleteMessage,
    loadUsers,
    searchMessages,
    setTyping,
    sendEmote,
    sendSystemMessage,

    // Utilidades
    formatTimestamp,
    isOwnMessage,
    isModerator,
    setSearchQuery,
    setSearchResults,
    scrollToBottom,

    // Limpiar estado
    clearError: () => setError(null),
    clearSearch: () => {
      setSearchQuery('')
      setSearchResults([])
    }
  }
}
