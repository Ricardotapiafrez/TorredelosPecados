import { useState, useEffect, useCallback } from 'react'
import { Socket } from 'socket.io-client'

export interface InvitationCode {
  code: string
  roomId: string
  createdBy: string
  createdAt: Date
  expiresAt: Date
  maxUses: number
  currentUses: number
  isActive: boolean
}

export interface InvitationOptions {
  maxUses?: number
  expiresIn?: number // en milisegundos
}

export interface InvitationValidation {
  isValid: boolean
  error?: string
  invitation?: InvitationCode
  roomInfo?: any
}

interface UseInvitationCodesOptions {
  socket: Socket | null
  onCodeGenerated?: (code: string, roomId: string) => void
  onCodeUsed?: (roomId: string, playerId: string) => void
  onCodeError?: (error: string) => void
}

export function useInvitationCodes(options: UseInvitationCodesOptions) {
  const {
    socket,
    onCodeGenerated,
    onCodeUsed,
    onCodeError
  } = options

  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [isUsing, setIsUsing] = useState(false)
  const [validation, setValidation] = useState<InvitationValidation | null>(null)
  const [roomInvitations, setRoomInvitations] = useState<InvitationCode[]>([])
  const [error, setError] = useState<string | null>(null)

  // Generar código de invitación
  const generateCode = useCallback((roomId: string, playerId: string, options: InvitationOptions = {}) => {
    if (!socket) return

    setIsGenerating(true)
    setError(null)

    socket.emit('generateInvitationCode', {
      roomId,
      playerId,
      options: {
        maxUses: options.maxUses || 10,
        expiresIn: options.expiresIn || 24 * 60 * 60 * 1000 // 24 horas por defecto
      }
    })
  }, [socket])

  // Validar código de invitación
  const validateCode = useCallback((code: string) => {
    if (!socket) return

    setIsValidating(true)
    setError(null)

    socket.emit('validateInvitationCode', { code })
  }, [socket])

  // Usar código de invitación
  const useCode = useCallback((code: string, playerName: string) => {
    if (!socket) return

    setIsUsing(true)
    setError(null)

    socket.emit('useInvitationCode', { code, playerName })
  }, [socket])

  // Obtener invitaciones de una sala
  const getRoomInvitations = useCallback((roomId: string) => {
    if (!socket) return

    socket.emit('getRoomInvitations', { roomId })
  }, [socket])

  // Desactivar código de invitación
  const deactivateCode = useCallback((code: string, playerId: string) => {
    if (!socket) return

    setError(null)

    socket.emit('deactivateInvitationCode', { code, playerId })
  }, [socket])

  // Copiar código al portapapeles
  const copyToClipboard = useCallback(async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      return true
    } catch (error) {
      console.error('Error al copiar al portapapeles:', error)
      return false
    }
  }, [])

  // Generar enlace de invitación
  const generateInvitationLink = useCallback((code: string) => {
    const baseUrl = window.location.origin
    return `${baseUrl}/join?code=${code}`
  }, [])

  // Formatear tiempo restante
  const formatTimeRemaining = useCallback((expiresAt: Date) => {
    const now = new Date()
    const diff = expiresAt.getTime() - now.getTime()
    
    if (diff <= 0) {
      return 'Expirado'
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }, [])

  // Verificar si un código está próximo a expirar
  const isExpiringSoon = useCallback((expiresAt: Date, threshold = 60 * 60 * 1000) => {
    const now = new Date()
    const diff = expiresAt.getTime() - now.getTime()
    return diff > 0 && diff <= threshold
  }, [])

  // Configurar event listeners del socket
  useEffect(() => {
    if (!socket) return

    const handleCodeGenerated = (data: { code: string, roomId: string }) => {
      setGeneratedCode(data.code)
      setIsGenerating(false)
      onCodeGenerated?.(data.code, data.roomId)
    }

    const handleCodeValidated = (data: InvitationValidation) => {
      setValidation(data)
      setIsValidating(false)
      
      if (!data.isValid) {
        setError(data.error || 'Código inválido')
      }
    }

    const handleCodeUsed = (data: { roomId: string, playerId: string, gameState: any, roomInfo: any }) => {
      setIsUsing(false)
      setGeneratedCode(null)
      setValidation(null)
      onCodeUsed?.(data.roomId, data.playerId)
    }

    const handleCodeError = (data: { error: string }) => {
      setIsUsing(false)
      setError(data.error)
      onCodeError?.(data.error)
    }

    const handleRoomInvitationsList = (data: { roomId: string, invitations: InvitationCode[] }) => {
      setRoomInvitations(data.invitations.map(inv => ({
        ...inv,
        createdAt: new Date(inv.createdAt),
        expiresAt: new Date(inv.expiresAt)
      })))
    }

    const handleCodeDeactivated = (data: { success: boolean, message?: string, error?: string }) => {
      if (data.success) {
        // Actualizar la lista de invitaciones
        setRoomInvitations(prev => prev.filter(inv => inv.code !== generatedCode))
      } else {
        setError(data.error || 'Error al desactivar código')
      }
    }

    const handleError = (data: { message: string }) => {
      setError(data.message)
      setIsGenerating(false)
      setIsValidating(false)
      setIsUsing(false)
    }

    // Event listeners
    socket.on('invitationCodeGenerated', handleCodeGenerated)
    socket.on('invitationCodeValidated', handleCodeValidated)
    socket.on('invitationCodeUsed', handleCodeUsed)
    socket.on('invitationCodeError', handleCodeError)
    socket.on('roomInvitationsList', handleRoomInvitationsList)
    socket.on('invitationCodeDeactivated', handleCodeDeactivated)
    socket.on('error', handleError)

    return () => {
      socket.off('invitationCodeGenerated', handleCodeGenerated)
      socket.off('invitationCodeValidated', handleCodeValidated)
      socket.off('invitationCodeUsed', handleCodeUsed)
      socket.off('invitationCodeError', handleCodeError)
      socket.off('roomInvitationsList', handleRoomInvitationsList)
      socket.off('invitationCodeDeactivated', handleCodeDeactivated)
      socket.off('error', handleError)
    }
  }, [socket, onCodeGenerated, onCodeUsed, onCodeError, generatedCode])

  // Limpiar estado
  const clearState = useCallback(() => {
    setGeneratedCode(null)
    setValidation(null)
    setError(null)
    setRoomInvitations([])
  }, [])

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    // Estado
    generatedCode,
    isGenerating,
    isValidating,
    isUsing,
    validation,
    roomInvitations,
    error,

    // Acciones
    generateCode,
    validateCode,
    useCode,
    getRoomInvitations,
    deactivateCode,
    copyToClipboard,
    generateInvitationLink,
    formatTimeRemaining,
    isExpiringSoon,

    // Utilidades
    clearState,
    clearError
  }
}
