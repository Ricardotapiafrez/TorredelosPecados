'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Copy, 
  Share2, 
  Plus, 
  Trash2, 
  Clock, 
  Users, 
  Link, 
  Check,
  AlertTriangle,
  Settings,
  RefreshCw
} from 'lucide-react'
import { InvitationCode, InvitationOptions } from '@/hooks/useInvitationCodes'
import clsx from 'clsx'

interface InvitationCodeManagerProps {
  roomId: string
  playerId: string
  playerName: string
  generatedCode: string | null
  isGenerating: boolean
  roomInvitations: InvitationCode[]
  error: string | null
  onGenerateCode: (roomId: string, playerId: string, options: InvitationOptions) => void
  onGetRoomInvitations: (roomId: string) => void
  onDeactivateCode: (code: string, playerId: string) => void
  onCopyToClipboard: (code: string) => Promise<boolean>
  onGenerateInvitationLink: (code: string) => string
  onFormatTimeRemaining: (expiresAt: Date) => string
  onIsExpiringSoon: (expiresAt: Date, threshold?: number) => boolean
  onClearError: () => void
  className?: string
}

export default function InvitationCodeManager({
  roomId,
  playerId,
  playerName,
  generatedCode,
  isGenerating,
  roomInvitations,
  error,
  onGenerateCode,
  onGetRoomInvitations,
  onDeactivateCode,
  onCopyToClipboard,
  onGenerateInvitationLink,
  onFormatTimeRemaining,
  onIsExpiringSoon,
  onClearError,
  className = ''
}: InvitationCodeManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [copiedLink, setCopiedLink] = useState<string | null>(null)
  const [invitationOptions, setInvitationOptions] = useState<InvitationOptions>({
    maxUses: 10,
    expiresIn: 24 * 60 * 60 * 1000 // 24 horas
  })

  // Cargar invitaciones al montar el componente
  useEffect(() => {
    onGetRoomInvitations(roomId)
  }, [roomId, onGetRoomInvitations])

  // Limpiar estado de copiado después de 2 segundos
  useEffect(() => {
    if (copiedCode) {
      const timer = setTimeout(() => setCopiedCode(null), 2000)
      return () => clearTimeout(timer)
    }
  }, [copiedCode])

  useEffect(() => {
    if (copiedLink) {
      const timer = setTimeout(() => setCopiedLink(null), 2000)
      return () => clearTimeout(timer)
    }
  }, [copiedLink])

  const handleGenerateCode = () => {
    onGenerateCode(roomId, playerId, invitationOptions)
    setShowCreateForm(false)
    setShowOptions(false)
  }

  const handleCopyCode = async (code: string) => {
    const success = await onCopyToClipboard(code)
    if (success) {
      setCopiedCode(code)
    }
  }

  const handleCopyLink = async (code: string) => {
    const link = onGenerateInvitationLink(code)
    const success = await onCopyToClipboard(link)
    if (success) {
      setCopiedLink(code)
    }
  }

  const handleShareCode = async (code: string) => {
    const link = onGenerateInvitationLink(code)
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Invitación a Torre de los Pecados',
          text: `${playerName} te ha invitado a jugar Torre de los Pecados`,
          url: link
        })
      } catch (error) {
        console.error('Error al compartir:', error)
        // Fallback a copiar enlace
        handleCopyLink(code)
      }
    } else {
      // Fallback a copiar enlace
      handleCopyLink(code)
    }
  }

  const handleDeactivateCode = (code: string) => {
    if (confirm('¿Estás seguro de que quieres desactivar este código de invitación?')) {
      onDeactivateCode(code, playerId)
    }
  }

  const getExpiryColor = (expiresAt: Date) => {
    if (onIsExpiringSoon(expiresAt, 60 * 60 * 1000)) { // 1 hora
      return 'text-red-400'
    } else if (onIsExpiringSoon(expiresAt, 6 * 60 * 60 * 1000)) { // 6 horas
      return 'text-yellow-400'
    } else {
      return 'text-green-400'
    }
  }

  const getUsageColor = (currentUses: number, maxUses: number) => {
    const percentage = (currentUses / maxUses) * 100
    if (percentage >= 90) {
      return 'text-red-400'
    } else if (percentage >= 70) {
      return 'text-yellow-400'
    } else {
      return 'text-green-400'
    }
  }

  return (
    <div className={clsx('bg-gray-800 rounded-lg border border-gray-600 p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Link className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-bold text-white">Códigos de Invitación</h2>
          <span className="text-sm text-gray-400">({roomInvitations.length} activos)</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onGetRoomInvitations(roomId)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Código</span>
          </button>
        </div>
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

      {/* Formulario para crear nuevo código */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            className="mb-6 p-4 bg-gray-700 rounded-lg border border-gray-600"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h3 className="text-lg font-semibold text-white mb-4">Crear Nuevo Código</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Máximo de usos
                </label>
                <select
                  value={invitationOptions.maxUses}
                  onChange={(e) => setInvitationOptions(prev => ({ ...prev, maxUses: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value={5}>5 usos</option>
                  <option value={10}>10 usos</option>
                  <option value={20}>20 usos</option>
                  <option value={50}>50 usos</option>
                  <option value={100}>100 usos</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tiempo de expiración
                </label>
                <select
                  value={invitationOptions.expiresIn}
                  onChange={(e) => setInvitationOptions(prev => ({ ...prev, expiresIn: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value={60 * 60 * 1000}>1 hora</option>
                  <option value={6 * 60 * 60 * 1000}>6 horas</option>
                  <option value={24 * 60 * 60 * 1000}>24 horas</option>
                  <option value={7 * 24 * 60 * 60 * 1000}>7 días</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowCreateForm(false)}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleGenerateCode}
                disabled={isGenerating}
                className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center space-x-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generando...</span>
                  </div>
                ) : (
                  'Generar Código'
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Código recién generado */}
      <AnimatePresence>
        {generatedCode && (
          <motion.div
            className="mb-6 p-4 bg-green-500/10 border border-green-500 rounded-lg"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="flex items-center space-x-2 mb-3">
              <Check className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold text-green-400">¡Código Generado!</h3>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4 mb-3">
              <div className="flex items-center justify-between">
                <code className="text-2xl font-mono font-bold text-white tracking-wider">
                  {generatedCode}
                </code>
                <button
                  onClick={() => handleCopyCode(generatedCode)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  {copiedCode === generatedCode ? (
                    <Check className="w-5 h-5 text-green-400" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleCopyLink(generatedCode)}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <Link className="w-4 h-4" />
                <span>
                  {copiedLink === generatedCode ? '¡Enlace copiado!' : 'Copiar enlace'}
                </span>
              </button>
              
              <button
                onClick={() => handleShareCode(generatedCode)}
                className="flex items-center space-x-2 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Compartir</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de códigos activos */}
      <div className="space-y-3">
        {roomInvitations.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Link className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay códigos de invitación activos</p>
            <p className="text-sm">Crea uno nuevo para invitar jugadores</p>
          </div>
        ) : (
          roomInvitations.map(invitation => (
            <motion.div
              key={invitation.code}
              className="p-4 bg-gray-700 rounded-lg border border-gray-600"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <code className="text-lg font-mono font-bold text-white tracking-wider">
                    {invitation.code}
                  </code>
                  <button
                    onClick={() => handleCopyCode(invitation.code)}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                  >
                    {copiedCode === invitation.code ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleShareCode(invitation.code)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => handleDeactivateCode(invitation.code)}
                    className="p-2 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">Usos:</span>
                  <span className={getUsageColor(invitation.currentUses, invitation.maxUses)}>
                    {invitation.currentUses}/{invitation.maxUses}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">Expira:</span>
                  <span className={getExpiryColor(invitation.expiresAt)}>
                    {onFormatTimeRemaining(invitation.expiresAt)}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">Creado:</span>
                  <span className="text-white">
                    {invitation.createdAt.toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">Por:</span>
                  <span className="text-white">{invitation.createdBy}</span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
