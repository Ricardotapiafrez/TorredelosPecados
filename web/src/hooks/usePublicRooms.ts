import { useState, useEffect, useCallback } from 'react'
import { Socket } from 'socket.io-client'

export interface PublicRoom {
  id: string
  name: string
  playerCount: number
  maxPlayers: number
  deckType: string
  status: 'waiting' | 'playing' | 'finished'
  createdAt: Date
  hostName: string
  isPrivate: boolean
  hasPassword: boolean
  lastActivity: Date
}

export interface RoomInfo extends PublicRoom {
  players: Array<{
    id: string
    name: string
    isReady: boolean
    isHost: boolean
  }>
}

export interface RoomSearchCriteria {
  deckType?: string
  minPlayers?: number
  maxPlayers?: number
  status?: 'waiting' | 'playing' | 'finished'
  hostName?: string
}

interface UsePublicRoomsOptions {
  socket: Socket | null
  autoRefresh?: boolean
  refreshInterval?: number
  onRoomsUpdate?: (rooms: PublicRoom[]) => void
  onRoomInfoUpdate?: (roomInfo: RoomInfo) => void
}

export function usePublicRooms(options: UsePublicRoomsOptions) {
  const {
    socket,
    autoRefresh = true,
    refreshInterval = 5000,
    onRoomsUpdate,
    onRoomInfoUpdate
  } = options

  const [rooms, setRooms] = useState<PublicRoom[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<RoomInfo | null>(null)
  const [searchResults, setSearchResults] = useState<PublicRoom[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Cargar lista de salas públicas
  const loadPublicRooms = useCallback(() => {
    if (!socket) return

    setLoading(true)
    setError(null)

    socket.emit('getPublicRooms')
  }, [socket])

  // Obtener información de una sala específica
  const getRoomInfo = useCallback((roomId: string) => {
    if (!socket) return

    setLoading(true)
    setError(null)

    socket.emit('getRoomInfo', { roomId })
  }, [socket])

  // Buscar salas por criterios
  const searchRooms = useCallback((criteria: RoomSearchCriteria) => {
    if (!socket) return

    setIsSearching(true)
    setError(null)

    socket.emit('searchRooms', { criteria })
  }, [socket])

  // Unirse a una sala
  const joinRoom = useCallback((roomId: string, playerName: string) => {
    if (!socket) return

    setError(null)
    socket.emit('joinRoom', { roomId, playerName })
  }, [socket])

  // Filtrar salas localmente
  const filterRooms = useCallback((criteria: RoomSearchCriteria) => {
    let filteredRooms = [...rooms]

    if (criteria.deckType) {
      filteredRooms = filteredRooms.filter(room => room.deckType === criteria.deckType)
    }

    if (criteria.minPlayers !== undefined) {
      filteredRooms = filteredRooms.filter(room => room.playerCount >= criteria.minPlayers!)
    }

    if (criteria.maxPlayers !== undefined) {
      filteredRooms = filteredRooms.filter(room => room.maxPlayers <= criteria.maxPlayers!)
    }

    if (criteria.status) {
      filteredRooms = filteredRooms.filter(room => room.status === criteria.status)
    }

    if (criteria.hostName) {
      filteredRooms = filteredRooms.filter(room => 
        room.hostName.toLowerCase().includes(criteria.hostName!.toLowerCase())
      )
    }

    return filteredRooms
  }, [rooms])

  // Ordenar salas
  const sortRooms = useCallback((rooms: PublicRoom[], sortBy: 'activity' | 'players' | 'created' | 'name' = 'activity') => {
    const sortedRooms = [...rooms]

    switch (sortBy) {
      case 'activity':
        return sortedRooms.sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
      
      case 'players':
        return sortedRooms.sort((a, b) => b.playerCount - a.playerCount)
      
      case 'created':
        return sortedRooms.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      
      case 'name':
        return sortedRooms.sort((a, b) => a.name.localeCompare(b.name))
      
      default:
        return sortedRooms
    }
  }, [])

  // Configurar event listeners del socket
  useEffect(() => {
    if (!socket) return

    const handlePublicRoomsList = (data: { rooms: PublicRoom[] }) => {
      setRooms(data.rooms.map(room => ({
        ...room,
        createdAt: new Date(room.createdAt),
        lastActivity: new Date(room.lastActivity)
      })))
      setLoading(false)
      onRoomsUpdate?.(data.rooms)
    }

    const handleRoomInfo = (data: { roomInfo: RoomInfo }) => {
      const roomInfo = {
        ...data.roomInfo,
        createdAt: new Date(data.roomInfo.createdAt),
        lastActivity: new Date(data.roomInfo.lastActivity)
      }
      setSelectedRoom(roomInfo)
      setLoading(false)
      onRoomInfoUpdate?.(roomInfo)
    }

    const handleRoomsSearchResult = (data: { rooms: PublicRoom[], criteria: RoomSearchCriteria }) => {
      setSearchResults(data.rooms.map(room => ({
        ...room,
        createdAt: new Date(room.createdAt),
        lastActivity: new Date(room.lastActivity)
      })))
      setIsSearching(false)
    }

    const handleError = (data: { message: string }) => {
      setError(data.message)
      setLoading(false)
      setIsSearching(false)
    }

    const handleRoomJoined = (data: { roomId: string, playerId: string, gameState: any }) => {
      // Limpiar estado al unirse a una sala
      setSelectedRoom(null)
      setError(null)
    }

    // Event listeners
    socket.on('publicRoomsList', handlePublicRoomsList)
    socket.on('roomInfo', handleRoomInfo)
    socket.on('roomsSearchResult', handleRoomsSearchResult)
    socket.on('error', handleError)
    socket.on('roomJoined', handleRoomJoined)

    // Cargar salas inicialmente
    loadPublicRooms()

    return () => {
      socket.off('publicRoomsList', handlePublicRoomsList)
      socket.off('roomInfo', handleRoomInfo)
      socket.off('roomsSearchResult', handleRoomsSearchResult)
      socket.off('error', handleError)
      socket.off('roomJoined', handleRoomJoined)
    }
  }, [socket, loadPublicRooms, onRoomsUpdate, onRoomInfoUpdate])

  // Auto-refresh si está habilitado
  useEffect(() => {
    if (!autoRefresh || !socket) return

    const interval = setInterval(() => {
      loadPublicRooms()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, socket, refreshInterval, loadPublicRooms])

  // Estadísticas de las salas
  const getRoomStats = useCallback(() => {
    const stats = {
      total: rooms.length,
      waiting: rooms.filter(room => room.status === 'waiting').length,
      playing: rooms.filter(room => room.status === 'playing').length,
      finished: rooms.filter(room => room.status === 'finished').length,
      byDeckType: rooms.reduce((acc, room) => {
        acc[room.deckType] = (acc[room.deckType] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      averagePlayers: rooms.length > 0 
        ? Math.round(rooms.reduce((sum, room) => sum + room.playerCount, 0) / rooms.length)
        : 0
    }

    return stats
  }, [rooms])

  // Obtener salas recomendadas
  const getRecommendedRooms = useCallback(() => {
    return rooms
      .filter(room => room.status === 'waiting' && room.playerCount > 0)
      .sort((a, b) => {
        // Priorizar salas con más jugadores pero no llenas
        const aScore = a.playerCount / a.maxPlayers
        const bScore = b.playerCount / b.maxPlayers
        return bScore - aScore
      })
      .slice(0, 5)
  }, [rooms])

  // Verificar si una sala está disponible
  const isRoomAvailable = useCallback((roomId: string) => {
    const room = rooms.find(r => r.id === roomId)
    return room && room.status === 'waiting' && room.playerCount < room.maxPlayers
  }, [rooms])

  return {
    // Estado
    rooms,
    loading,
    error,
    selectedRoom,
    searchResults,
    isSearching,

    // Acciones
    loadPublicRooms,
    getRoomInfo,
    searchRooms,
    joinRoom,
    filterRooms,
    sortRooms,
    setSelectedRoom,

    // Utilidades
    getRoomStats,
    getRecommendedRooms,
    isRoomAvailable,

    // Limpiar estado
    clearError: () => setError(null),
    clearSearchResults: () => setSearchResults([])
  }
}
