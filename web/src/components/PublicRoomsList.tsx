'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  Clock, 
  Search, 
  Filter, 
  RefreshCw, 
  Star,
  Lock,
  Crown,
  Gamepad2,
  Calendar,
  TrendingUp,
  Eye,
  Plus,
  Settings
} from 'lucide-react'
import { PublicRoom, RoomInfo, RoomSearchCriteria } from '@/hooks/usePublicRooms'
import clsx from 'clsx'

interface PublicRoomsListProps {
  rooms: PublicRoom[]
  loading: boolean
  error: string | null
  selectedRoom: RoomInfo | null
  onRoomSelect: (room: PublicRoom) => void
  onRoomJoin: (roomId: string, playerName: string) => void
  onRefresh: () => void
  onSearch: (criteria: RoomSearchCriteria) => void
  onFilter: (criteria: RoomSearchCriteria) => void
  onSort: (sortBy: 'activity' | 'players' | 'created' | 'name') => void
  className?: string
}

export default function PublicRoomsList({
  rooms,
  loading,
  error,
  selectedRoom,
  onRoomSelect,
  onRoomJoin,
  onRefresh,
  onSearch,
  onFilter,
  onSort,
  className = ''
}: PublicRoomsListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<'activity' | 'players' | 'created' | 'name'>('activity')
  const [selectedDeckType, setSelectedDeckType] = useState<string>('')
  const [showRoomDetails, setShowRoomDetails] = useState<string | null>(null)

  const deckTypes = [
    { value: 'angels', label: 'Ángeles', icon: '👼' },
    { value: 'demons', label: 'Demonios', icon: '😈' },
    { value: 'dragons', label: 'Dragones', icon: '🐉' },
    { value: 'mages', label: 'Magos', icon: '🧙‍♂️' }
  ]

  const getDeckTypeInfo = (deckType: string) => {
    return deckTypes.find(dt => dt.value === deckType) || { label: deckType, icon: '🎴' }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'text-green-400 bg-green-500/10 border-green-500'
      case 'playing':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500'
      case 'finished':
        return 'text-gray-400 bg-gray-500/10 border-gray-500'
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'waiting':
        return <Clock className="w-4 h-4" />
      case 'playing':
        return <Gamepad2 className="w-4 h-4" />
      case 'finished':
        return <Crown className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) {
      return `hace ${days}d`
    } else if (hours > 0) {
      return `hace ${hours}h`
    } else if (minutes > 0) {
      return `hace ${minutes}m`
    } else {
      return 'ahora'
    }
  }

  const handleSearch = () => {
    if (searchTerm.trim()) {
      onSearch({ hostName: searchTerm.trim() })
    }
  }

  const handleFilter = () => {
    const criteria: RoomSearchCriteria = {}
    if (selectedDeckType) criteria.deckType = selectedDeckType
    onFilter(criteria)
  }

  const handleSort = (newSortBy: 'activity' | 'players' | 'created' | 'name') => {
    setSortBy(newSortBy)
    onSort(newSortBy)
  }

  const getRecommendedRooms = () => {
    return rooms
      .filter(room => room.status === 'waiting' && room.playerCount > 0)
      .sort((a, b) => {
        const aScore = a.playerCount / a.maxPlayers
        const bScore = b.playerCount / b.maxPlayers
        return bScore - aScore
      })
      .slice(0, 3)
  }

  return (
    <div className={clsx('bg-gray-800 rounded-lg border border-gray-600 p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Users className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-bold text-white">Salas Públicas</h2>
          <span className="text-sm text-gray-400">({rooms.length} disponibles)</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={clsx('w-4 h-4', loading && 'animate-spin')} />
          </button>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filtros */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            className="mb-6 p-4 bg-gray-700 rounded-lg border border-gray-600"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Búsqueda */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Buscar por anfitrión
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nombre del anfitrión..."
                    className="flex-1 px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tipo de mazo */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo de mazo
                </label>
                <select
                  value={selectedDeckType}
                  onChange={(e) => setSelectedDeckType(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Todos los mazos</option>
                  {deckTypes.map(deckType => (
                    <option key={deckType.value} value={deckType.value}>
                      {deckType.icon} {deckType.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ordenar por */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ordenar por
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => handleSort(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="activity">Actividad reciente</option>
                  <option value="players">Más jugadores</option>
                  <option value="created">Recién creadas</option>
                  <option value="name">Nombre</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleFilter}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                Aplicar filtros
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Salas recomendadas */}
      {getRecommendedRooms().length > 0 && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <Star className="w-4 h-4 text-yellow-400" />
            <h3 className="text-sm font-medium text-gray-300">Salas recomendadas</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {getRecommendedRooms().map(room => (
              <motion.div
                key={room.id}
                className="p-3 bg-gray-700 rounded-lg border border-gray-600 hover:border-blue-500 transition-colors cursor-pointer"
                whileHover={{ scale: 1.02 }}
                onClick={() => onRoomSelect(room)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white truncate">
                    {room.name}
                  </span>
                  {room.hasPassword && <Lock className="w-3 h-3 text-yellow-400" />}
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <Users className="w-3 h-3" />
                  <span>{room.playerCount}/{room.maxPlayers}</span>
                  <span>•</span>
                  <span>{getDeckTypeInfo(room.deckType).icon}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Lista de salas */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
            <span className="ml-2 text-gray-400">Cargando salas...</span>
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay salas públicas disponibles</p>
            <p className="text-sm">¡Crea una nueva sala para empezar!</p>
          </div>
        ) : (
          rooms.map(room => (
            <motion.div
              key={room.id}
              className="p-4 bg-gray-700 rounded-lg border border-gray-600 hover:border-blue-500 transition-colors cursor-pointer"
              whileHover={{ scale: 1.01 }}
              onClick={() => onRoomSelect(room)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-medium text-white">{room.name}</h3>
                    {room.hasPassword && <Lock className="w-4 h-4 text-yellow-400" />}
                    <div className={clsx(
                      'px-2 py-1 rounded-full text-xs border flex items-center space-x-1',
                      getStatusColor(room.status)
                    )}>
                      {getStatusIcon(room.status)}
                      <span className="capitalize">{room.status}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{room.playerCount}/{room.maxPlayers} jugadores</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <span>{getDeckTypeInfo(room.deckType).icon}</span>
                      <span>{getDeckTypeInfo(room.deckType).label}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Crown className="w-4 h-4" />
                      <span>{room.hostName}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-right text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatTimeAgo(room.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>{formatTimeAgo(room.lastActivity)}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowRoomDetails(showRoomDetails === room.id ? null : room.id)
                    }}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Detalles expandibles */}
              <AnimatePresence>
                {showRoomDetails === room.id && (
                  <motion.div
                    className="mt-3 pt-3 border-t border-gray-600"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-400">
                        <p>ID: {room.id.slice(0, 8)}...</p>
                        <p>Creada: {room.createdAt.toLocaleString()}</p>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onRoomJoin(room.id, '')
                        }}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                      >
                        Unirse
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
