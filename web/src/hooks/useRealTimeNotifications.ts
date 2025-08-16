import { useState, useCallback, useRef, useEffect } from 'react'
import { Socket } from 'socket.io-client'

export interface RealTimeNotification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error' | 'game' | 'system'
  title: string
  message: string
  timestamp: Date
  duration?: number
  persistent?: boolean
  action?: {
    label: string
    onClick: () => void
  }
  data?: any
}

interface NotificationSettings {
  enabled: boolean
  sound: boolean
  desktop: boolean
  gameEvents: boolean
  systemEvents: boolean
  playerEvents: boolean
  maxNotifications: number
  autoDismiss: boolean
  autoDismissDelay: number
}

interface UseRealTimeNotificationsOptions {
  socket: Socket | null
  playerId?: string | null
  settings?: Partial<NotificationSettings>
  onNotificationAdd?: (notification: RealTimeNotification) => void
  onNotificationRemove?: (notificationId: string) => void
}

export function useRealTimeNotifications(options: UseRealTimeNotificationsOptions) {
  const {
    socket,
    playerId,
    settings: userSettings = {},
    onNotificationAdd,
    onNotificationRemove
  } = options

  const [notifications, setNotifications] = useState<RealTimeNotification[]>([])
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    sound: true,
    desktop: true,
    gameEvents: true,
    systemEvents: true,
    playerEvents: true,
    maxNotifications: 10,
    autoDismiss: true,
    autoDismissDelay: 5000,
    ...userSettings
  })

  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map())
  const notificationCount = useRef(0)

  // Agregar notificación
  const addNotification = useCallback((notification: Omit<RealTimeNotification, 'id' | 'timestamp'>) => {
    if (!settings.enabled) return

    const id = `notification-${Date.now()}-${notificationCount.current++}`
    const newNotification: RealTimeNotification = {
      id,
      timestamp: new Date(),
      ...notification
    }

    setNotifications(prev => {
      const updated = [newNotification, ...prev].slice(0, settings.maxNotifications)
      return updated
    })

    onNotificationAdd?.(newNotification)

    // Auto-dismiss si está habilitado
    if (settings.autoDismiss && !notification.persistent && notification.duration !== 0) {
      const timeout = setTimeout(() => {
        removeNotification(id)
      }, notification.duration || settings.autoDismissDelay)
      
      timeoutRefs.current.set(id, timeout)
    }

    // Notificación de escritorio si está habilitado
    if (settings.desktop && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: id
      })
    }

    return id
  }, [settings, onNotificationAdd])

  // Remover notificación
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    
    const timeout = timeoutRefs.current.get(id)
    if (timeout) {
      clearTimeout(timeout)
      timeoutRefs.current.delete(id)
    }

    onNotificationRemove?.(id)
  }, [onNotificationRemove])

  // Limpiar todas las notificaciones
  const clearAllNotifications = useCallback(() => {
    setNotifications([])
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout))
    timeoutRefs.current.clear()
  }, [])

  // Solicitar permisos de notificación de escritorio
  const requestDesktopPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        setSettings(prev => ({ ...prev, desktop: true }))
        addNotification({
          type: 'success',
          title: 'Notificaciones Activadas',
          message: 'Ahora recibirás notificaciones de escritorio',
          duration: 3000
        })
      }
    }
  }, [addNotification])

  // Notificaciones específicas del juego
  const addGameNotification = useCallback((data: any) => {
    if (!settings.gameEvents) return

    const { type, playerName, cardName, targetPlayerName, roomId } = data

    switch (type) {
      case 'cardPlayed':
        addNotification({
          type: 'game',
          title: 'Carta Jugada',
          message: `${playerName} jugó ${cardName}`,
          duration: 4000,
          data
        })
        break

      case 'pileTaken':
        addNotification({
          type: 'warning',
          title: 'Torre Tomada',
          message: `${playerName} tomó la Torre de los Pecados`,
          duration: 3000,
          data
        })
        break

      case 'purification':
        addNotification({
          type: 'success',
          title: '¡Purificación!',
          message: 'La Torre de los Pecados ha sido purificada',
          duration: 5000,
          data
        })
        break

      case 'turnChanged':
        addNotification({
          type: 'info',
          title: 'Turno Cambiado',
          message: `Es el turno de ${playerName}`,
          duration: 2000,
          data
        })
        break

      case 'gameEnded':
        addNotification({
          type: 'success',
          title: 'Juego Terminado',
          message: data.winner ? `${data.winner.name} ganó!` : 'Juego terminado',
          persistent: true,
          data
        })
        break

      default:
        addNotification({
          type: 'game',
          title: 'Evento del Juego',
          message: `Nuevo evento: ${type}`,
          duration: 3000,
          data
        })
    }
  }, [settings.gameEvents, addNotification])

  // Notificaciones de sistema
  const addSystemNotification = useCallback((data: any) => {
    if (!settings.systemEvents) return

    const { type, message, error } = data

    switch (type) {
      case 'connection':
        addNotification({
          type: 'info',
          title: 'Conexión',
          message: message,
          duration: 3000,
          data
        })
        break

      case 'error':
        addNotification({
          type: 'error',
          title: 'Error del Sistema',
          message: error || message,
          duration: 5000,
          data
        })
        break

      case 'maintenance':
        addNotification({
          type: 'warning',
          title: 'Mantenimiento',
          message: message,
          persistent: true,
          data
        })
        break

      default:
        addNotification({
          type: 'system',
          title: 'Sistema',
          message: message,
          duration: 3000,
          data
        })
    }
  }, [settings.systemEvents, addNotification])

  // Notificaciones de jugadores
  const addPlayerNotification = useCallback((data: any) => {
    if (!settings.playerEvents) return

    const { type, playerName, playerId } = data

    switch (type) {
      case 'playerJoined':
        addNotification({
          type: 'success',
          title: 'Jugador Conectado',
          message: `${playerName} se unió al juego`,
          duration: 3000,
          data
        })
        break

      case 'playerLeft':
        addNotification({
          type: 'warning',
          title: 'Jugador Desconectado',
          message: `${playerName} se desconectó`,
          duration: 4000,
          data
        })
        break

      case 'playerReconnected':
        addNotification({
          type: 'success',
          title: 'Jugador Reconectado',
          message: `${playerName} se reconectó`,
          duration: 3000,
          data
        })
        break

      case 'playerInactive':
        addNotification({
          type: 'error',
          title: 'Jugador Inactivo',
          message: `${playerName} fue removido por inactividad`,
          duration: 5000,
          data
        })
        break

      default:
        addNotification({
          type: 'info',
          title: 'Jugador',
          message: `Evento de jugador: ${type}`,
          duration: 3000,
          data
        })
    }
  }, [settings.playerEvents, addNotification])

  // Configurar event listeners del socket
  useEffect(() => {
    if (!socket) return

    // Eventos del juego
    const handleCardPlayed = (data: any) => {
      addGameNotification({ type: 'cardPlayed', ...data })
    }

    const handleDiscardPileTaken = (data: any) => {
      addGameNotification({ type: 'pileTaken', ...data })
    }

    const handlePilePurified = (data: any) => {
      addGameNotification({ type: 'purification', ...data })
    }

    const handleTurnChanged = (data: any) => {
      addGameNotification({ type: 'turnChanged', ...data })
    }

    const handleGameEnded = (data: any) => {
      addGameNotification({ type: 'gameEnded', ...data })
    }

    // Eventos de jugadores
    const handlePlayerJoined = (data: any) => {
      addPlayerNotification({ type: 'playerJoined', ...data })
    }

    const handlePlayerLeft = (data: any) => {
      addPlayerNotification({ type: 'playerLeft', ...data })
    }

    const handlePlayerReconnected = (data: any) => {
      addPlayerNotification({ type: 'playerReconnected', ...data })
    }

    const handlePlayerInactive = (data: any) => {
      addPlayerNotification({ type: 'playerInactive', ...data })
    }

    // Eventos de sistema
    const handleConnect = () => {
      addSystemNotification({ type: 'connection', message: 'Conectado al servidor' })
    }

    const handleDisconnect = () => {
      addSystemNotification({ type: 'connection', message: 'Desconectado del servidor' })
    }

    const handleError = (data: any) => {
      addSystemNotification({ type: 'error', error: data.message })
    }

    // Registrar event listeners
    socket.on('cardPlayed', handleCardPlayed)
    socket.on('discardPileTaken', handleDiscardPileTaken)
    socket.on('pilePurified', handlePilePurified)
    socket.on('turnChanged', handleTurnChanged)
    socket.on('gameEnded', handleGameEnded)
    socket.on('playerJoined', handlePlayerJoined)
    socket.on('playerLeft', handlePlayerLeft)
    socket.on('playerReconnected', handlePlayerReconnected)
    socket.on('playerInactive', handlePlayerInactive)
    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('error', handleError)

    // Cleanup
    return () => {
      socket.off('cardPlayed', handleCardPlayed)
      socket.off('discardPileTaken', handleDiscardPileTaken)
      socket.off('pilePurified', handlePilePurified)
      socket.off('turnChanged', handleTurnChanged)
      socket.off('gameEnded', handleGameEnded)
      socket.off('playerJoined', handlePlayerJoined)
      socket.off('playerLeft', handlePlayerLeft)
      socket.off('playerReconnected', handlePlayerReconnected)
      socket.off('playerInactive', handlePlayerInactive)
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('error', handleError)
    }
  }, [socket, addGameNotification, addPlayerNotification, addSystemNotification])

  // Limpiar timeouts al desmontar
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout))
      timeoutRefs.current.clear()
    }
  }, [])

  return {
    notifications,
    settings,
    addNotification,
    removeNotification,
    clearAllNotifications,
    addGameNotification,
    addSystemNotification,
    addPlayerNotification,
    requestDesktopPermission,
    setSettings
  }
}
