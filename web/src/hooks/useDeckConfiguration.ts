import { useState, useEffect, useCallback } from 'react'
import { Socket } from 'socket.io-client'

export interface DeckConfiguration {
  id: string
  name: string
  description: string
  icon: string
  color: string
  theme: 'light' | 'dark' | 'fire' | 'magic'
  cards: any[]
  specialRules: string[]
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  recommendedPlayers: number[]
  isEnabled: boolean
  customizations: {
    allowCardRemoval: boolean
    allowCardAddition: boolean
    allowPowerModification: boolean
    allowEffectModification: boolean
  }
  roomId?: string
  modifiedCards?: Array<{
    cardId: number
    modifications: any
    modifiedAt: Date
  }>
  customRules?: Array<{
    id: string
    description: string
    effect: string
    conditions: string[]
    createdAt: Date
  }>
  createdAt?: Date
  modifiedAt?: Date
}

export interface CardModification {
  power?: number
  effect?: any
  description?: string
  name?: string
}

export interface CustomRule {
  description: string
  effect: string
  conditions?: string[]
}

interface UseDeckConfigurationOptions {
  socket: Socket | null
  onConfigurationCreated?: (configuration: DeckConfiguration) => void
  onConfigurationUpdated?: (configuration: DeckConfiguration) => void
  onCardModified?: (modifiedCard: any) => void
  onCustomRuleAdded?: (rule: any) => void
  onCustomRuleRemoved?: (ruleId: string) => void
}

export function useDeckConfiguration(options: UseDeckConfigurationOptions) {
  const {
    socket,
    onConfigurationCreated,
    onConfigurationUpdated,
    onCardModified,
    onCustomRuleAdded,
    onCustomRuleRemoved
  } = options

  const [configurations, setConfigurations] = useState<DeckConfiguration[]>([])
  const [selectedConfiguration, setSelectedConfiguration] = useState<DeckConfiguration | null>(null)
  const [roomConfiguration, setRoomConfiguration] = useState<DeckConfiguration | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar configuraciones disponibles
  const loadDeckConfigurations = useCallback(() => {
    if (!socket) return

    setLoading(true)
    setError(null)

    socket.emit('getDeckConfigurations')
  }, [socket])

  // Obtener configuración específica
  const getDeckConfiguration = useCallback((deckType: string) => {
    if (!socket) return

    setLoading(true)
    setError(null)

    socket.emit('getDeckConfiguration', { deckType })
  }, [socket])

  // Crear configuración para una sala
  const createRoomConfiguration = useCallback((roomId: string, deckType: string, customizations = {}) => {
    if (!socket) return

    setLoading(true)
    setError(null)

    socket.emit('createRoomDeckConfiguration', { roomId, deckType, customizations })
  }, [socket])

  // Obtener configuración de una sala
  const getRoomConfiguration = useCallback((roomId: string) => {
    if (!socket) return

    setLoading(true)
    setError(null)

    socket.emit('getRoomDeckConfiguration', { roomId })
  }, [socket])

  // Actualizar configuración de sala
  const updateRoomConfiguration = useCallback((roomId: string, updates: Partial<DeckConfiguration>) => {
    if (!socket) return

    setError(null)

    socket.emit('updateRoomDeckConfiguration', { roomId, updates })
  }, [socket])

  // Modificar una carta
  const modifyCard = useCallback((roomId: string, cardId: number, modifications: CardModification) => {
    if (!socket) return

    setError(null)

    socket.emit('modifyDeckCard', { roomId, cardId, modifications })
  }, [socket])

  // Agregar regla personalizada
  const addCustomRule = useCallback((roomId: string, rule: CustomRule) => {
    if (!socket) return

    setError(null)

    socket.emit('addDeckCustomRule', { roomId, rule })
  }, [socket])

  // Remover regla personalizada
  const removeCustomRule = useCallback((roomId: string, ruleId: string) => {
    if (!socket) return

    setError(null)

    socket.emit('removeDeckCustomRule', { roomId, ruleId })
  }, [socket])

  // Validar configuración
  const validateConfiguration = useCallback((configuration: DeckConfiguration) => {
    if (!socket) return

    setError(null)

    socket.emit('validateDeckConfiguration', { configuration })
  }, [socket])

  // Exportar configuración
  const exportConfiguration = useCallback((roomId: string) => {
    if (!socket) return

    setError(null)

    socket.emit('exportDeckConfiguration', { roomId })
  }, [socket])

  // Importar configuración
  const importConfiguration = useCallback((roomId: string, importedConfig: any) => {
    if (!socket) return

    setError(null)

    socket.emit('importDeckConfiguration', { roomId, importedConfig })
  }, [socket])

  // Obtener información de dificultad
  const getDifficultyInfo = useCallback((difficulty: string) => {
    const difficulties = {
      easy: { label: 'Fácil', color: 'text-green-400', icon: '😊' },
      medium: { label: 'Medio', color: 'text-yellow-400', icon: '😐' },
      hard: { label: 'Difícil', color: 'text-orange-400', icon: '😰' },
      expert: { label: 'Experto', color: 'text-red-400', icon: '😱' }
    }
    return difficulties[difficulty as keyof typeof difficulties] || difficulties.medium
  }, [])

  // Obtener información de tema
  const getThemeInfo = useCallback((theme: string) => {
    const themes = {
      light: { label: 'Luz', color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
      dark: { label: 'Oscuridad', color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
      fire: { label: 'Fuego', color: 'text-orange-400', bgColor: 'bg-orange-500/10' },
      magic: { label: 'Magia', color: 'text-pink-400', bgColor: 'bg-pink-500/10' }
    }
    return themes[theme as keyof typeof themes] || themes.light
  }, [])

  // Verificar si una carta puede ser modificada
  const canModifyCard = useCallback((configuration: DeckConfiguration, modificationType: 'power' | 'effect' | 'removal' | 'addition') => {
    if (!configuration.customizations) return false

    switch (modificationType) {
      case 'power':
        return configuration.customizations.allowPowerModification
      case 'effect':
        return configuration.customizations.allowEffectModification
      case 'removal':
        return configuration.customizations.allowCardRemoval
      case 'addition':
        return configuration.customizations.allowCardAddition
      default:
        return false
    }
  }, [])

  // Configurar event listeners del socket
  useEffect(() => {
    if (!socket) return

    const handleDeckConfigurationsList = (data: { configurations: DeckConfiguration[] }) => {
      setConfigurations(data.configurations)
      setLoading(false)
    }

    const handleDeckConfiguration = (data: { configuration: DeckConfiguration }) => {
      setSelectedConfiguration(data.configuration)
      setLoading(false)
    }

    const handleRoomDeckConfigurationCreated = (data: { configuration: DeckConfiguration }) => {
      setRoomConfiguration(data.configuration)
      setLoading(false)
      onConfigurationCreated?.(data.configuration)
    }

    const handleRoomDeckConfiguration = (data: { configuration: DeckConfiguration }) => {
      setRoomConfiguration(data.configuration)
      setLoading(false)
    }

    const handleRoomDeckConfigurationUpdated = (data: { configuration: DeckConfiguration }) => {
      setRoomConfiguration(data.configuration)
      onConfigurationUpdated?.(data.configuration)
    }

    const handleDeckCardModified = (data: { modifiedCard: any }) => {
      // Actualizar la configuración de la sala con la carta modificada
      if (roomConfiguration) {
        const updatedCards = roomConfiguration.cards.map(card => 
          card.id === data.modifiedCard.id ? data.modifiedCard : card
        )
        setRoomConfiguration({
          ...roomConfiguration,
          cards: updatedCards
        })
      }
      onCardModified?.(data.modifiedCard)
    }

    const handleDeckCustomRuleAdded = (data: { customRule: any }) => {
      if (roomConfiguration) {
        setRoomConfiguration({
          ...roomConfiguration,
          customRules: [...(roomConfiguration.customRules || []), data.customRule]
        })
      }
      onCustomRuleAdded?.(data.customRule)
    }

    const handleDeckCustomRuleRemoved = (data: { ruleId: string, result: boolean }) => {
      if (roomConfiguration && data.result) {
        setRoomConfiguration({
          ...roomConfiguration,
          customRules: (roomConfiguration.customRules || []).filter(rule => rule.id !== data.ruleId)
        })
      }
      onCustomRuleRemoved?.(data.ruleId)
    }

    const handleDeckConfigurationValidated = (data: { validation: { isValid: boolean, errors: string[] } }) => {
      if (!data.validation.isValid) {
        setError(data.validation.errors.join(', '))
      }
    }

    const handleDeckConfigurationExported = (data: { exportedConfig: any }) => {
      // Aquí podrías manejar la descarga del archivo
      console.log('Configuración exportada:', data.exportedConfig)
    }

    const handleDeckConfigurationImported = (data: { configuration: DeckConfiguration }) => {
      setRoomConfiguration(data.configuration)
    }

    const handleError = (data: { message: string }) => {
      setError(data.message)
      setLoading(false)
    }

    // Event listeners
    socket.on('deckConfigurationsList', handleDeckConfigurationsList)
    socket.on('deckConfiguration', handleDeckConfiguration)
    socket.on('roomDeckConfigurationCreated', handleRoomDeckConfigurationCreated)
    socket.on('roomDeckConfiguration', handleRoomDeckConfiguration)
    socket.on('roomDeckConfigurationUpdated', handleRoomDeckConfigurationUpdated)
    socket.on('deckCardModified', handleDeckCardModified)
    socket.on('deckCustomRuleAdded', handleDeckCustomRuleAdded)
    socket.on('deckCustomRuleRemoved', handleDeckCustomRuleRemoved)
    socket.on('deckConfigurationValidated', handleDeckConfigurationValidated)
    socket.on('deckConfigurationExported', handleDeckConfigurationExported)
    socket.on('deckConfigurationImported', handleDeckConfigurationImported)
    socket.on('error', handleError)

    return () => {
      socket.off('deckConfigurationsList', handleDeckConfigurationsList)
      socket.off('deckConfiguration', handleDeckConfiguration)
      socket.off('roomDeckConfigurationCreated', handleRoomDeckConfigurationCreated)
      socket.off('roomDeckConfiguration', handleRoomDeckConfiguration)
      socket.off('roomDeckConfigurationUpdated', handleRoomDeckConfigurationUpdated)
      socket.off('deckCardModified', handleDeckCardModified)
      socket.off('deckCustomRuleAdded', handleDeckCustomRuleAdded)
      socket.off('deckCustomRuleRemoved', handleDeckCustomRuleRemoved)
      socket.off('deckConfigurationValidated', handleDeckConfigurationValidated)
      socket.off('deckConfigurationExported', handleDeckConfigurationExported)
      socket.off('deckConfigurationImported', handleDeckConfigurationImported)
      socket.off('error', handleError)
    }
  }, [socket, roomConfiguration, onConfigurationCreated, onConfigurationUpdated, onCardModified, onCustomRuleAdded, onCustomRuleRemoved])

  // Limpiar estado
  const clearState = useCallback(() => {
    setSelectedConfiguration(null)
    setRoomConfiguration(null)
    setError(null)
  }, [])

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    // Estado
    configurations,
    selectedConfiguration,
    roomConfiguration,
    loading,
    error,

    // Acciones
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

    // Utilidades
    getDifficultyInfo,
    getThemeInfo,
    canModifyCard,
    setSelectedConfiguration,
    setRoomConfiguration,

    // Limpiar estado
    clearState,
    clearError
  }
}
