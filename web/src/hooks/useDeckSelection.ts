import { useState, useCallback } from 'react'
import { Socket } from 'socket.io-client'

export interface DeckInfo {
  id: string
  name: string
  icon: string
  description: string
  theme: string
  strategy: string
}

export interface PlayerDeckInfo {
  id: string
  name: string
  selectedDeck: string
  deckInfo: {
    name: string
    icon: string
    description: string
  }
  isBot: boolean
}

interface UseDeckSelectionOptions {
  socket: Socket | null
  onDeckChanged?: (playerId: string, deckType: string, deckInfo: any) => void
  onPlayersDeckInfoReceived?: (players: PlayerDeckInfo[]) => void
}

export function useDeckSelection(options: UseDeckSelectionOptions) {
  const { socket, onDeckChanged, onPlayersDeckInfoReceived } = options

  const [playersDeckInfo, setPlayersDeckInfo] = useState<PlayerDeckInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Información de los mazos disponibles
  const availableDecks: DeckInfo[] = [
    {
      id: 'angels',
      name: 'Mazo de Ángeles',
      icon: '👼',
      description: 'La Luz Divina - Pureza, justicia y orden divino',
      theme: 'Defensa y control',
      strategy: 'Usa cartas protectoras y purificadoras'
    },
    {
      id: 'demons',
      name: 'Mazo de Demonios',
      icon: '😈',
      description: 'La Oscuridad del Abismo - Los siete pecados capitales',
      theme: 'Agresión y caos',
      strategy: 'Aplica presión constante con cartas destructivas'
    },
    {
      id: 'dragons',
      name: 'Mazo de Dragones',
      icon: '🐉',
      description: 'Los Señores del Cielo - Poder primitivo y sabiduría ancestral',
      theme: 'Poderío y dominio',
      strategy: 'Acumula fuerza y usa ataques directos'
    },
    {
      id: 'mages',
      name: 'Mazo de Magos',
      icon: '🧙‍♂️',
      description: 'Los Maestros del Arcano - Conocimiento arcano y manipulación de la realidad',
      theme: 'Versatilidad y control',
      strategy: 'Adapta tu juego según la situación'
    }
  ]

  // Cambiar mazo de un jugador
  const changePlayerDeck = useCallback((playerId: string, deckType: string) => {
    if (!socket) {
      setError('No hay conexión con el servidor')
      return
    }

    setLoading(true)
    setError(null)

    socket.emit('changePlayerDeck', { playerId, deckType })
  }, [socket])

  // Obtener información de mazos de todos los jugadores
  const getPlayersDeckInfo = useCallback(() => {
    if (!socket) {
      setError('No hay conexión con el servidor')
      return
    }

    setLoading(true)
    setError(null)

    socket.emit('getPlayersDeckInfo')
  }, [socket])

  // Obtener información de un mazo específico
  const getDeckInfo = useCallback((deckType: string): DeckInfo | null => {
    return availableDecks.find(deck => deck.id === deckType) || null
  }, [availableDecks])

  // Configurar listeners de socket
  const setupSocketListeners = useCallback(() => {
    if (!socket) return

    // Escuchar cambios de mazo
    socket.on('deckChanged', (data: { playerId: string, deckType: string, deckInfo: any }) => {
      setLoading(false)
      onDeckChanged?.(data.playerId, data.deckType, data.deckInfo)
    })

    // Escuchar información de mazos de jugadores
    socket.on('playersDeckInfo', (data: { players: PlayerDeckInfo[] }) => {
      setLoading(false)
      setPlayersDeckInfo(data.players)
      onPlayersDeckInfoReceived?.(data.players)
    })

    // Escuchar cambios de mazo de otros jugadores
    socket.on('playerDeckChanged', (data: { playerId: string, deckType: string, deckInfo: any }) => {
      setPlayersDeckInfo(prev => 
        prev.map(player => 
          player.id === data.playerId 
            ? { ...player, selectedDeck: data.deckType, deckInfo: data.deckInfo }
            : player
        )
      )
    })

    // Escuchar errores
    socket.on('error', (data: { message: string }) => {
      setLoading(false)
      setError(data.message)
    })
  }, [socket, onDeckChanged, onPlayersDeckInfoReceived])

  // Limpiar listeners
  const cleanupSocketListeners = useCallback(() => {
    if (!socket) return

    socket.off('deckChanged')
    socket.off('playersDeckInfo')
    socket.off('playerDeckChanged')
    socket.off('error')
  }, [socket])

  // Limpiar estado
  const clearState = useCallback(() => {
    setPlayersDeckInfo([])
    setLoading(false)
    setError(null)
  }, [])

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    // Estado
    playersDeckInfo,
    loading,
    error,
    availableDecks,

    // Acciones
    changePlayerDeck,
    getPlayersDeckInfo,
    getDeckInfo,
    setupSocketListeners,
    cleanupSocketListeners,
    clearState,
    clearError
  }
}
