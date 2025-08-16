'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Key, 
  Users, 
  Clock, 
  Gamepad2, 
  Crown, 
  Check, 
  X, 
  AlertTriangle,
  ArrowRight,
  Copy,
  Share2
} from 'lucide-react'
import { InvitationValidation } from '@/hooks/useInvitationCodes'
import clsx from 'clsx'

interface JoinWithCodeProps {
  validation: InvitationValidation | null
  isValidating: boolean
  isUsing: boolean
  error: string | null
  onValidateCode: (code: string) => void
  onUseCode: (code: string, playerName: string) => void
  onClearError: () => void
  onCopyToClipboard: (code: string) => Promise<boolean>
  onGenerateInvitationLink: (code: string) => string
  className?: string
}

export default function JoinWithCode({
  validation,
  isValidating,
  isUsing,
  error,
  onValidateCode,
  onUseCode,
  onClearError,
  onCopyToClipboard,
  onGenerateInvitationLink,
  className = ''
}: JoinWithCodeProps) {
  const [code, setCode] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [showJoinForm, setShowJoinForm] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // Limpiar estado de copiado después de 2 segundos
  useEffect(() => {
    if (copiedCode) {
      const timer = setTimeout(() => setCopiedCode(null), 2000)
      return () => clearTimeout(timer)
    }
  }, [copiedCode])

  const handleValidateCode = () => {
    if (code.trim()) {
      onValidateCode(code.trim().toUpperCase())
    }
  }

  const handleJoinRoom = () => {
    if (code.trim() && playerName.trim()) {
      onUseCode(code.trim().toUpperCase(), playerName.trim())
    }
  }

  const handleCopyCode = async () => {
    if (validation?.invitation?.code) {
      const success = await onCopyToClipboard(validation.invitation.code)
      if (success) {
        setCopiedCode(validation.invitation.code)
      }
    }
  }

  const handleShareCode = async () => {
    if (validation?.invitation?.code) {
      const link = onGenerateInvitationLink(validation.invitation.code)
      
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Invitación a Torre de los Pecados',
            text: 'Te han invitado a jugar Torre de los Pecados',
            url: link
          })
        } catch (error) {
          console.error('Error al compartir:', error)
          // Fallback a copiar enlace
          await onCopyToClipboard(link)
        }
      } else {
        // Fallback a copiar enlace
        await onCopyToClipboard(link)
      }
    }
  }

  const getDeckTypeInfo = (deckType: string) => {
    const deckTypes = {
      angels: { label: 'Ángeles', icon: '👼', color: 'text-blue-400' },
      demons: { label: 'Demonios', icon: '😈', color: 'text-red-400' },
      dragons: { label: 'Dragones', icon: '🐉', color: 'text-orange-400' },
      mages: { label: 'Magos', icon: '🧙‍♂️', color: 'text-purple-400' }
    }
    return deckTypes[deckType as keyof typeof deckTypes] || { label: deckType, icon: '🎴', color: 'text-gray-400' }
  }

  const formatTimeRemaining = (expiresAt: Date) => {
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
  }

  return (
    <div className={clsx('bg-gray-800 rounded-lg border border-gray-600 p-6', className)}>
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Key className="w-6 h-6 text-blue-400" />
        <h2 className="text-xl font-bold text-white">Unirse con Código</h2>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={onClearError}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Formulario de código */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Código de invitación
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ABCD12"
            maxLength={6}
            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 font-mono text-center text-lg tracking-wider"
          />
          <button
            onClick={handleValidateCode}
            disabled={!code.trim() || isValidating}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            {isValidating ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Validando...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4" />
                <span>Validar</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Resultado de validación */}
      <AnimatePresence>
        {validation && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {validation.isValid ? (
              <div className="p-4 bg-green-500/10 border border-green-500 rounded-lg">
                <div className="flex items-center space-x-2 mb-4">
                  <Check className="w-5 h-5 text-green-400" />
                  <h3 className="text-lg font-semibold text-green-400">¡Código Válido!</h3>
                </div>

                {/* Información de la sala */}
                {validation.roomInfo && (
                  <div className="bg-gray-700 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-white mb-2">{validation.roomInfo.name}</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-400">Jugadores:</span>
                            <span className="text-white">{validation.roomInfo.playerCount}/{validation.roomInfo.maxPlayers}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-400">Mazo:</span>
                            <span className={getDeckTypeInfo(validation.roomInfo.deckType).color}>
                              {getDeckTypeInfo(validation.roomInfo.deckType).icon} {getDeckTypeInfo(validation.roomInfo.deckType).label}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Crown className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-400">Anfitrión:</span>
                            <span className="text-white">{validation.roomInfo.hostName}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-white mb-2">Información del Código</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-400">Usos:</span>
                            <span className="text-white">{validation.invitation?.currentUses}/{validation.invitation?.maxUses}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-400">Expira:</span>
                            <span className="text-white">
                              {validation.invitation?.expiresAt ? formatTimeRemaining(validation.invitation.expiresAt) : 'N/A'}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-400">Creado:</span>
                            <span className="text-white">
                              {validation.invitation?.createdAt ? new Date(validation.invitation.createdAt).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Acciones */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowJoinForm(!showJoinForm)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>Unirse a la Sala</span>
                  </button>
                  
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center space-x-2 px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                  >
                    {copiedCode === validation.invitation?.code ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    <span>
                      {copiedCode === validation.invitation?.code ? '¡Copiado!' : 'Copiar código'}
                    </span>
                  </button>
                  
                  <button
                    onClick={handleShareCode}
                    className="flex items-center space-x-2 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Compartir</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg">
                <div className="flex items-center space-x-2">
                  <X className="w-5 h-5 text-red-400" />
                  <h3 className="text-lg font-semibold text-red-400">Código Inválido</h3>
                </div>
                <p className="text-red-400 text-sm mt-2">{validation.error}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Formulario para unirse */}
      <AnimatePresence>
        {showJoinForm && validation?.isValid && (
          <motion.div
            className="p-4 bg-gray-700 rounded-lg border border-gray-600"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h3 className="text-lg font-semibold text-white mb-4">Unirse a la Sala</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tu nombre
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Ingresa tu nombre..."
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowJoinForm(false)}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleJoinRoom}
                disabled={!playerName.trim() || isUsing}
                className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {isUsing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Uniéndose...</span>
                  </div>
                ) : (
                  'Unirse'
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
