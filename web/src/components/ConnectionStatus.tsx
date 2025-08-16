'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Wifi, 
  WifiOff, 
  Signal, 
  SignalHigh, 
  SignalMedium, 
  SignalLow,
  Clock,
  Users,
  Server,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { Socket } from 'socket.io-client'
import clsx from 'clsx'

interface ConnectionStatusProps {
  socket: Socket | null
  playerId?: string | null
  roomId?: string | null
  isVisible?: boolean
  className?: string
}

interface ConnectionInfo {
  status: 'connected' | 'disconnected' | 'connecting' | 'error'
  latency: number
  playersOnline?: number
  serverStatus: 'online' | 'offline' | 'maintenance'
  lastPing?: number
  connectionTime?: number
}

export default function ConnectionStatus({
  socket,
  playerId,
  roomId,
  isVisible = true,
  className = ''
}: ConnectionStatusProps) {
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>({
    status: 'disconnected',
    latency: 0,
    serverStatus: 'offline'
  })
  const [showDetails, setShowDetails] = useState(false)
  const [pingHistory, setPingHistory] = useState<number[]>([])

  // Medir latencia
  useEffect(() => {
    if (!socket) return

    const measureLatency = () => {
      const start = Date.now()
      socket.emit('ping', () => {
        const end = Date.now()
        const latency = end - start
        
        setConnectionInfo(prev => ({
          ...prev,
          latency,
          lastPing: end
        }))

        setPingHistory(prev => {
          const updated = [...prev, latency].slice(-10) // Mantener últimos 10 pings
          return updated
        })
      })
    }

    // Medir latencia cada 5 segundos
    const interval = setInterval(measureLatency, 5000)
    measureLatency() // Medición inicial

    return () => clearInterval(interval)
  }, [socket])

  // Monitorear estado de conexión
  useEffect(() => {
    if (!socket) return

    const handleConnect = () => {
      setConnectionInfo(prev => ({
        ...prev,
        status: 'connected',
        serverStatus: 'online',
        connectionTime: Date.now()
      }))
    }

    const handleDisconnect = () => {
      setConnectionInfo(prev => ({
        ...prev,
        status: 'disconnected',
        serverStatus: 'offline'
      }))
    }

    const handleConnecting = () => {
      setConnectionInfo(prev => ({
        ...prev,
        status: 'connecting'
      }))
    }

    const handleError = () => {
      setConnectionInfo(prev => ({
        ...prev,
        status: 'error',
        serverStatus: 'offline'
      }))
    }

    const handleServerStatus = (data: any) => {
      setConnectionInfo(prev => ({
        ...prev,
        serverStatus: data.status,
        playersOnline: data.playersOnline
      }))
    }

    // Event listeners
    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('connecting', handleConnecting)
    socket.on('error', handleError)
    socket.on('serverStatus', handleServerStatus)

    // Estado inicial
    if (socket.connected) {
      handleConnect()
    }

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('connecting', handleConnecting)
      socket.off('error', handleError)
      socket.off('serverStatus', handleServerStatus)
    }
  }, [socket])

  const getStatusIcon = () => {
    switch (connectionInfo.status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'disconnected':
        return <XCircle className="w-4 h-4 text-red-400" />
      case 'connecting':
        return <Clock className="w-4 h-4 text-yellow-400" />
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-400" />
      default:
        return <WifiOff className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = () => {
    switch (connectionInfo.status) {
      case 'connected':
        return 'border-green-500 bg-green-500/10 text-green-400'
      case 'disconnected':
        return 'border-red-500 bg-red-500/10 text-red-400'
      case 'connecting':
        return 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
      case 'error':
        return 'border-red-500 bg-red-500/10 text-red-400'
      default:
        return 'border-gray-500 bg-gray-500/10 text-gray-400'
    }
  }

  const getLatencyIcon = () => {
    if (connectionInfo.latency < 50) {
      return <SignalHigh className="w-3 h-3 text-green-400" />
    } else if (connectionInfo.latency < 100) {
      return <SignalMedium className="w-3 h-3 text-yellow-400" />
    } else {
      return <SignalLow className="w-3 h-3 text-red-400" />
    }
  }

  const getLatencyColor = () => {
    if (connectionInfo.latency < 50) {
      return 'text-green-400'
    } else if (connectionInfo.latency < 100) {
      return 'text-yellow-400'
    } else {
      return 'text-red-400'
    }
  }

  const getAverageLatency = () => {
    if (pingHistory.length === 0) return 0
    return Math.round(pingHistory.reduce((a, b) => a + b, 0) / pingHistory.length)
  }

  const formatConnectionTime = () => {
    if (!connectionInfo.connectionTime) return 'N/A'
    
    const now = Date.now()
    const diff = now - connectionInfo.connectionTime
    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${seconds}s`
    }
  }

  if (!isVisible) return null

  return (
    <div className={clsx('fixed top-4 right-4 z-50', className)}>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.8 }}
          transition={{ duration: 0.3 }}
        >
          {/* Botón principal */}
          <motion.button
            onClick={() => setShowDetails(!showDetails)}
            className={clsx(
              'relative bg-gray-800 border rounded-lg p-3 shadow-xl hover:bg-gray-700 transition-colors',
              getStatusColor()
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <span className="text-xs font-medium">
                {connectionInfo.status === 'connected' ? 'Online' : 'Offline'}
              </span>
            </div>

            {/* Indicador de latencia */}
            {connectionInfo.status === 'connected' && (
              <div className="absolute -bottom-1 -right-1 bg-gray-700 rounded-full px-1 py-0.5">
                <div className="flex items-center space-x-1">
                  {getLatencyIcon()}
                  <span className={clsx('text-xs', getLatencyColor())}>
                    {connectionInfo.latency}ms
                  </span>
                </div>
              </div>
            )}
          </motion.button>

          {/* Panel de detalles */}
          <AnimatePresence>
            {showDetails && (
              <motion.div
                className="absolute top-full right-0 mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-xl p-4 min-w-[280px]"
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Server className="w-4 h-4 text-gray-300" />
                    <h3 className="text-sm font-semibold text-white">
                      Estado de Conexión
                    </h3>
                  </div>
                  
                  <div className={clsx(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    connectionInfo.status === 'connected' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  )}>
                    {connectionInfo.status === 'connected' ? 'Conectado' : 'Desconectado'}
                  </div>
                </div>

                {/* Información de conexión */}
                <div className="space-y-3">
                  {/* Latencia */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Latencia</span>
                    <div className="flex items-center space-x-2">
                      {getLatencyIcon()}
                      <span className={clsx('text-sm font-medium', getLatencyColor())}>
                        {connectionInfo.latency}ms
                      </span>
                    </div>
                  </div>

                  {/* Latencia promedio */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Promedio</span>
                    <span className="text-sm text-gray-300">
                      {getAverageLatency()}ms
                    </span>
                  </div>

                  {/* Tiempo conectado */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Tiempo</span>
                    <span className="text-sm text-gray-300">
                      {formatConnectionTime()}
                    </span>
                  </div>

                  {/* Jugadores online */}
                  {connectionInfo.playersOnline !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Jugadores</span>
                      <div className="flex items-center space-x-1">
                        <Users className="w-3 h-3 text-blue-400" />
                        <span className="text-sm text-gray-300">
                          {connectionInfo.playersOnline}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Estado del servidor */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Servidor</span>
                    <div className="flex items-center space-x-1">
                      <div className={clsx(
                        'w-2 h-2 rounded-full',
                        connectionInfo.serverStatus === 'online' 
                          ? 'bg-green-400' 
                          : connectionInfo.serverStatus === 'maintenance'
                          ? 'bg-yellow-400'
                          : 'bg-red-400'
                      )} />
                      <span className="text-sm text-gray-300 capitalize">
                        {connectionInfo.serverStatus}
                      </span>
                    </div>
                  </div>

                  {/* Información del jugador */}
                  {playerId && (
                    <div className="pt-3 border-t border-gray-600">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Tu ID</span>
                        <span className="text-sm text-gray-300 font-mono">
                          {playerId.slice(0, 8)}...
                        </span>
                      </div>
                      
                      {roomId && (
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-400">Sala</span>
                          <span className="text-sm text-gray-300 font-mono">
                            {roomId.slice(0, 8)}...
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Historial de ping */}
                {pingHistory.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-600">
                    <h4 className="text-xs font-medium text-gray-300 mb-2">Historial de Ping</h4>
                    <div className="flex space-x-1">
                      {pingHistory.map((ping, index) => (
                        <div
                          key={index}
                          className={clsx(
                            'flex-1 h-8 rounded',
                            ping < 50 ? 'bg-green-500/30' :
                            ping < 100 ? 'bg-yellow-500/30' : 'bg-red-500/30'
                          )}
                          title={`${ping}ms`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
