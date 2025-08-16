'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Clock, 
  Gamepad2, 
  Crown, 
  TrendingUp,
  BarChart3,
  Activity,
  Target
} from 'lucide-react'
import { PublicRoom } from '@/hooks/usePublicRooms'
import clsx from 'clsx'

interface RoomStatsProps {
  rooms: PublicRoom[]
  className?: string
}

export default function RoomStats({ rooms, className = '' }: RoomStatsProps) {
  const getStats = () => {
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
        : 0,
      totalPlayers: rooms.reduce((sum, room) => sum + room.playerCount, 0),
      maxCapacity: rooms.reduce((sum, room) => sum + room.maxPlayers, 0),
      occupancyRate: rooms.length > 0 
        ? Math.round((rooms.reduce((sum, room) => sum + room.playerCount, 0) / rooms.reduce((sum, room) => sum + room.maxPlayers, 0)) * 100)
        : 0
    }

    return stats
  }

  const stats = getStats()

  const deckTypes = [
    { value: 'angels', label: 'Ángeles', icon: '👼', color: 'text-blue-400' },
    { value: 'demons', label: 'Demonios', icon: '😈', color: 'text-red-400' },
    { value: 'dragons', label: 'Dragones', icon: '🐉', color: 'text-orange-400' },
    { value: 'mages', label: 'Magos', icon: '🧙‍♂️', color: 'text-purple-400' }
  ]

  const getDeckTypeInfo = (deckType: string) => {
    return deckTypes.find(dt => dt.value === deckType) || { label: deckType, icon: '🎴', color: 'text-gray-400' }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'text-green-400'
      case 'playing':
        return 'text-yellow-400'
      case 'finished':
        return 'text-gray-400'
      default:
        return 'text-gray-400'
    }
  }

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'bg-green-500/10'
      case 'playing':
        return 'bg-yellow-500/10'
      case 'finished':
        return 'bg-gray-500/10'
      default:
        return 'bg-gray-500/10'
    }
  }

  return (
    <div className={clsx('bg-gray-800 rounded-lg border border-gray-600 p-6', className)}>
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <BarChart3 className="w-6 h-6 text-blue-400" />
        <h2 className="text-xl font-bold text-white">Estadísticas de Salas</h2>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          className="p-4 bg-gray-700 rounded-lg border border-gray-600"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-sm text-gray-400">Total salas</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="p-4 bg-gray-700 rounded-lg border border-gray-600"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center space-x-3">
            <Clock className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-2xl font-bold text-white">{stats.waiting}</p>
              <p className="text-sm text-gray-400">Esperando</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="p-4 bg-gray-700 rounded-lg border border-gray-600"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center space-x-3">
            <Gamepad2 className="w-8 h-8 text-yellow-400" />
            <div>
              <p className="text-2xl font-bold text-white">{stats.playing}</p>
              <p className="text-sm text-gray-400">Jugando</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="p-4 bg-gray-700 rounded-lg border border-gray-600"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center space-x-3">
            <Crown className="w-8 h-8 text-purple-400" />
            <div>
              <p className="text-2xl font-bold text-white">{stats.finished}</p>
              <p className="text-sm text-gray-400">Terminadas</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Estadísticas de jugadores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div
          className="p-4 bg-gray-700 rounded-lg border border-gray-600"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Jugadores activos</p>
              <p className="text-2xl font-bold text-white">{stats.totalPlayers}</p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
          <div className="mt-2">
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.occupancyRate}%` }}
                />
              </div>
              <span className="text-xs text-gray-400">{stats.occupancyRate}%</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="p-4 bg-gray-700 rounded-lg border border-gray-600"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Promedio por sala</p>
              <p className="text-2xl font-bold text-white">{stats.averagePlayers}</p>
            </div>
            <Target className="w-8 h-8 text-green-400" />
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-400">
              Capacidad total: {stats.maxCapacity}
            </p>
          </div>
        </motion.div>

        <motion.div
          className="p-4 bg-gray-700 rounded-lg border border-gray-600"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Tasa de ocupación</p>
              <p className="text-2xl font-bold text-white">{stats.occupancyRate}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-yellow-400" />
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-400">
              {stats.totalPlayers}/{stats.maxCapacity} jugadores
            </p>
          </div>
        </motion.div>
      </div>

      {/* Distribución por tipo de mazo */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Distribución por Mazo</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {deckTypes.map(deckType => {
            const count = stats.byDeckType[deckType.value] || 0
            const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0
            
            return (
              <motion.div
                key={deckType.value}
                className="p-3 bg-gray-700 rounded-lg border border-gray-600"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">{deckType.icon}</span>
                  <span className={clsx('text-sm font-medium', deckType.color)}>
                    {deckType.label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-white">{count}</span>
                  <span className="text-xs text-gray-400">{percentage}%</span>
                </div>
                <div className="mt-2">
                  <div className="flex-1 bg-gray-600 rounded-full h-1">
                    <div 
                      className={clsx('h-1 rounded-full transition-all duration-300', {
                        'bg-blue-500': deckType.value === 'angels',
                        'bg-red-500': deckType.value === 'demons',
                        'bg-orange-500': deckType.value === 'dragons',
                        'bg-purple-500': deckType.value === 'mages'
                      })}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Estado de las salas */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Estado de las Salas</h3>
        <div className="space-y-3">
          {[
            { status: 'waiting', label: 'Esperando jugadores', icon: Clock },
            { status: 'playing', label: 'En juego', icon: Gamepad2 },
            { status: 'finished', label: 'Terminadas', icon: Crown }
          ].map(({ status, label, icon: Icon }) => {
            const count = stats[status as keyof typeof stats] as number
            const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0
            
            return (
              <motion.div
                key={status}
                className="flex items-center justify-between p-3 bg-gray-700 rounded-lg border border-gray-600"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center space-x-3">
                  <div className={clsx('p-2 rounded-lg', getStatusBgColor(status))}>
                    <Icon className={clsx('w-4 h-4', getStatusColor(status))} />
                  </div>
                  <div>
                    <p className="font-medium text-white">{label}</p>
                    <p className="text-sm text-gray-400">{count} salas</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-bold text-white">{percentage}%</span>
                  <div className="w-16 bg-gray-600 rounded-full h-2">
                    <div 
                      className={clsx('h-2 rounded-full transition-all duration-300', {
                        'bg-green-500': status === 'waiting',
                        'bg-yellow-500': status === 'playing',
                        'bg-gray-500': status === 'finished'
                      })}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
