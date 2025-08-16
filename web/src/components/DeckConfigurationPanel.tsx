'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Settings, 
  Cards, 
  Edit3, 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Download, 
  Upload,
  Check,
  AlertTriangle,
  Users,
  Zap,
  Shield,
  Sword,
  Eye,
  RefreshCw
} from 'lucide-react'
import { DeckConfiguration, CardModification, CustomRule } from '@/hooks/useDeckConfiguration'
import clsx from 'clsx'

interface DeckConfigurationPanelProps {
  configurations: DeckConfiguration[]
  selectedConfiguration: DeckConfiguration | null
  roomConfiguration: DeckConfiguration | null
  loading: boolean
  error: string | null
  onLoadConfigurations: () => void
  onGetConfiguration: (deckType: string) => void
  onCreateRoomConfiguration: (roomId: string, deckType: string, customizations: any) => void
  onGetRoomConfiguration: (roomId: string) => void
  onUpdateRoomConfiguration: (roomId: string, updates: Partial<DeckConfiguration>) => void
  onModifyCard: (roomId: string, cardId: number, modifications: CardModification) => void
  onAddCustomRule: (roomId: string, rule: CustomRule) => void
  onRemoveCustomRule: (roomId: string, ruleId: string) => void
  onValidateConfiguration: (configuration: DeckConfiguration) => void
  onExportConfiguration: (roomId: string) => void
  onImportConfiguration: (roomId: string, importedConfig: any) => void
  getDifficultyInfo: (difficulty: string) => any
  getThemeInfo: (theme: string) => any
  canModifyCard: (configuration: DeckConfiguration, modificationType: 'power' | 'effect' | 'removal' | 'addition') => boolean
  onClearError: () => void
  roomId?: string
  className?: string
}

export default function DeckConfigurationPanel({
  configurations,
  selectedConfiguration,
  roomConfiguration,
  loading,
  error,
  onLoadConfigurations,
  onGetConfiguration,
  onCreateRoomConfiguration,
  onGetRoomConfiguration,
  onUpdateRoomConfiguration,
  onModifyCard,
  onAddCustomRule,
  onRemoveCustomRule,
  onValidateConfiguration,
  onExportConfiguration,
  onImportConfiguration,
  getDifficultyInfo,
  getThemeInfo,
  canModifyCard,
  onClearError,
  roomId,
  className = ''
}: DeckConfigurationPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'cards' | 'rules' | 'customization'>('overview')
  const [showCardEditor, setShowCardEditor] = useState<number | null>(null)
  const [showRuleEditor, setShowRuleEditor] = useState(false)
  const [editingCard, setEditingCard] = useState<any>(null)
  const [newRule, setNewRule] = useState<CustomRule>({ description: '', effect: '' })

  // Cargar configuraciones al montar el componente
  useEffect(() => {
    onLoadConfigurations()
  }, [onLoadConfigurations])

  // Cargar configuración de sala si hay roomId
  useEffect(() => {
    if (roomId) {
      onGetRoomConfiguration(roomId)
    }
  }, [roomId, onGetRoomConfiguration])

  const handleSelectConfiguration = (deckType: string) => {
    onGetConfiguration(deckType)
  }

  const handleCreateRoomConfiguration = (deckType: string) => {
    if (roomId) {
      onCreateRoomConfiguration(roomId, deckType, {})
    }
  }

  const handleModifyCard = (cardId: number, modifications: CardModification) => {
    if (roomId && roomConfiguration) {
      onModifyCard(roomId, cardId, modifications)
      setShowCardEditor(null)
      setEditingCard(null)
    }
  }

  const handleAddCustomRule = () => {
    if (roomId && newRule.description && newRule.effect) {
      onAddCustomRule(roomId, newRule)
      setNewRule({ description: '', effect: '' })
      setShowRuleEditor(false)
    }
  }

  const handleRemoveCustomRule = (ruleId: string) => {
    if (roomId && confirm('¿Estás seguro de que quieres eliminar esta regla?')) {
      onRemoveCustomRule(roomId, ruleId)
    }
  }

  const handleExportConfiguration = () => {
    if (roomId) {
      onExportConfiguration(roomId)
    }
  }

  const handleImportConfiguration = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && roomId) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedConfig = JSON.parse(e.target?.result as string)
          onImportConfiguration(roomId, importedConfig)
        } catch (error) {
          console.error('Error al importar configuración:', error)
        }
      }
      reader.readAsText(file)
    }
  }

  const currentConfiguration = roomConfiguration || selectedConfiguration

  return (
    <div className={clsx('bg-gray-800 rounded-lg border border-gray-600 p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Settings className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-bold text-white">Configuración de Mazos</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onLoadConfigurations}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={clsx('w-4 h-4', loading && 'animate-spin')} />
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

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-700 rounded-lg p-1">
        {[
          { id: 'overview', label: 'Vista General', icon: Eye },
          { id: 'cards', label: 'Cartas', icon: Cards },
          { id: 'rules', label: 'Reglas', icon: Shield },
          { id: 'customization', label: 'Personalización', icon: Edit3 }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={clsx(
              'flex items-center space-x-2 px-4 py-2 rounded-md transition-colors',
              activeTab === id
                ? 'bg-blue-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-600'
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Contenido de tabs */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Configuraciones disponibles */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Mazos Disponibles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {configurations.map(config => (
                  <motion.div
                    key={config.id}
                    className="p-4 bg-gray-700 rounded-lg border border-gray-600 hover:border-blue-500 transition-colors cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleSelectConfiguration(config.id)}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-2xl">{config.icon}</span>
                      <div>
                        <h4 className="font-semibold text-white">{config.name}</h4>
                        <p className="text-sm text-gray-400">{config.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <span className={getDifficultyInfo(config.difficulty).color}>
                          {getDifficultyInfo(config.difficulty).icon} {getDifficultyInfo(config.difficulty).label}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-400">{config.recommendedPlayers.join(', ')} jugadores</span>
                      </div>
                    </div>

                    {roomId && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCreateRoomConfiguration(config.id)
                        }}
                        className="w-full mt-3 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                      >
                        Usar este mazo
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Configuración actual */}
            {currentConfiguration && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Configuración Actual</h3>
                <div className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-2xl">{currentConfiguration.icon}</span>
                    <div>
                      <h4 className="font-semibold text-white">{currentConfiguration.name}</h4>
                      <p className="text-sm text-gray-400">{currentConfiguration.description}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Dificultad:</span>
                      <div className={getDifficultyInfo(currentConfiguration.difficulty).color}>
                        {getDifficultyInfo(currentConfiguration.difficulty).icon} {getDifficultyInfo(currentConfiguration.difficulty).label}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-gray-400">Tema:</span>
                      <div className={getThemeInfo(currentConfiguration.theme).color}>
                        {getThemeInfo(currentConfiguration.theme).label}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-gray-400">Cartas:</span>
                      <div className="text-white">{currentConfiguration.cards.length}</div>
                    </div>
                    
                    <div>
                      <span className="text-gray-400">Reglas especiales:</span>
                      <div className="text-white">{currentConfiguration.specialRules.length}</div>
                    </div>
                  </div>

                  {roomConfiguration && (
                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={handleExportConfiguration}
                        className="flex items-center space-x-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Exportar</span>
                      </button>
                      
                      <label className="flex items-center space-x-2 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors cursor-pointer">
                        <Upload className="w-4 h-4" />
                        <span>Importar</span>
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImportConfiguration}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'cards' && currentConfiguration && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Cartas del Mazo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentConfiguration.cards.map(card => (
                <motion.div
                  key={card.id}
                  className="p-3 bg-gray-700 rounded-lg border border-gray-600"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-white">{card.value}</span>
                      <span className="text-white font-medium">{card.name}</span>
                    </div>
                    
                    {roomConfiguration && canModifyCard(roomConfiguration, 'power') && (
                      <button
                        onClick={() => {
                          setEditingCard(card)
                          setShowCardEditor(card.id)
                        }}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-2">{card.description}</p>
                  
                  {card.isModified && (
                    <div className="text-xs text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded">
                      Modificada
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'rules' && currentConfiguration && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Reglas del Mazo</h3>
            
            {/* Reglas especiales */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-white mb-3">Reglas Especiales</h4>
              <div className="space-y-2">
                {currentConfiguration.specialRules.map((rule, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-gray-700 rounded-lg">
                    <Shield className="w-4 h-4 text-blue-400" />
                    <span className="text-white">{rule}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reglas personalizadas */}
            {roomConfiguration && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-md font-medium text-white">Reglas Personalizadas</h4>
                  <button
                    onClick={() => setShowRuleEditor(true)}
                    className="flex items-center space-x-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar Regla</span>
                  </button>
                </div>
                
                <div className="space-y-2">
                  {roomConfiguration.customRules?.map(rule => (
                    <div key={rule.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-white">{rule.description}</div>
                        <div className="text-sm text-gray-400">{rule.effect}</div>
                      </div>
                      
                      <button
                        onClick={() => handleRemoveCustomRule(rule.id)}
                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'customization' && currentConfiguration && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Personalización</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Permisos de personalización */}
              <div>
                <h4 className="text-md font-medium text-white mb-3">Permisos de Modificación</h4>
                <div className="space-y-3">
                  {[
                    { key: 'allowPowerModification', label: 'Modificar poder de cartas', icon: Sword },
                    { key: 'allowEffectModification', label: 'Modificar efectos', icon: Zap },
                    { key: 'allowCardRemoval', label: 'Remover cartas', icon: Trash2 },
                    { key: 'allowCardAddition', label: 'Agregar cartas', icon: Plus }
                  ].map(({ key, label, icon: Icon }) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4 text-gray-400" />
                        <span className="text-white">{label}</span>
                      </div>
                      
                      <div className={currentConfiguration.customizations[key as keyof typeof currentConfiguration.customizations] ? 'text-green-400' : 'text-red-400'}>
                        {currentConfiguration.customizations[key as keyof typeof currentConfiguration.customizations] ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Estadísticas de personalización */}
              <div>
                <h4 className="text-md font-medium text-white mb-3">Estadísticas</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-700 rounded-lg">
                    <div className="text-sm text-gray-400">Cartas modificadas</div>
                    <div className="text-white font-semibold">
                      {roomConfiguration?.modifiedCards?.length || 0}
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-700 rounded-lg">
                    <div className="text-sm text-gray-400">Reglas personalizadas</div>
                    <div className="text-white font-semibold">
                      {roomConfiguration?.customRules?.length || 0}
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-700 rounded-lg">
                    <div className="text-sm text-gray-400">Última modificación</div>
                    <div className="text-white font-semibold">
                      {roomConfiguration?.modifiedAt ? new Date(roomConfiguration.modifiedAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Editor de carta */}
      <AnimatePresence>
        {showCardEditor && editingCard && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-800 rounded-lg border border-gray-600 p-6 max-w-md w-full mx-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <h3 className="text-lg font-semibold text-white mb-4">Modificar Carta</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Poder
                  </label>
                  <input
                    type="number"
                    defaultValue={editingCard.power}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    onChange={(e) => setEditingCard({ ...editingCard, power: parseInt(e.target.value) })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descripción
                  </label>
                  <textarea
                    defaultValue={editingCard.description}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    rows={3}
                    onChange={(e) => setEditingCard({ ...editingCard, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCardEditor(null)
                    setEditingCard(null)
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleModifyCard(editingCard.id, {
                    power: editingCard.power,
                    description: editingCard.description
                  })}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Guardar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor de regla */}
      <AnimatePresence>
        {showRuleEditor && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-800 rounded-lg border border-gray-600 p-6 max-w-md w-full mx-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <h3 className="text-lg font-semibold text-white mb-4">Agregar Regla Personalizada</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descripción
                  </label>
                  <input
                    type="text"
                    value={newRule.description}
                    onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="Descripción de la regla..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Efecto
                  </label>
                  <textarea
                    value={newRule.effect}
                    onChange={(e) => setNewRule({ ...newRule, effect: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    rows={3}
                    placeholder="Efecto de la regla..."
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowRuleEditor(false)
                    setNewRule({ description: '', effect: '' })
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddCustomRule}
                  disabled={!newRule.description || !newRule.effect}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  Agregar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
