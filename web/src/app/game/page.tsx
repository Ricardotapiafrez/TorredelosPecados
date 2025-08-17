'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import DeckCard from '@/components/DeckCard'
import RoomSelector from '@/components/RoomSelector'
import BotConfiguration from '@/components/BotConfiguration'
import { GameConfig } from '@/types/game'
import { decks, gameTypes, availableRooms } from '@/data/gameData'

export default function GamePage() {
  const [config, setConfig] = useState<GameConfig>({
    gameType: 'human',
    deck: '',
    room: '',
    username: '',
    botCount: 1,
    botDifficulty: 'intermediate',
    maxPlayers: 4
  })

  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const handleConfigChange = (field: keyof GameConfig, value: string) => {
    setConfig(prev => {
      const newConfig = { ...prev }
      
      // Manejar campos numéricos
      if (field === 'botCount' || field === 'maxPlayers') {
        newConfig[field] = parseInt(value) || 1
      } else {
        newConfig[field] = value
      }
      
      // Ajustar botCount si maxPlayers cambia
      if (field === 'maxPlayers') {
        const maxBots = newConfig.maxPlayers - 1
        if (newConfig.botCount > maxBots) {
          newConfig.botCount = maxBots
        }
      }
      
      return newConfig
    })
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return config.gameType !== ''
      case 2:
        return config.deck !== ''
      case 3:
        return config.username.trim() !== ''
      case 4:
        if (config.gameType === 'bot') {
          return config.botCount && config.botCount >= 1 && config.botCount <= (config.maxPlayers || 4) - 1
        }
        return config.room.trim() !== ''
      case 5:
        if (config.gameType === 'human') {
          return config.room.trim() !== ''
        }
        return true
      default:
        return false
    }
  }

  const handleStartGame = async () => {
    setIsLoading(true)
    
    // Preparar configuración para el backend
    const gameConfig = {
      playerName: config.username,
      deckType: config.deck,
      gameMode: config.gameType,
      maxPlayers: config.maxPlayers,
      ...(config.gameType === 'bot' && {
        botCount: config.botCount,
        botDifficulty: config.botDifficulty
      }),
      ...(config.gameType === 'human' && {
        roomName: config.room
      })
    }
    
    console.log('Iniciando juego con configuración:', gameConfig)
    
    // Aquí se conectaría con el backend para iniciar el juego
    // Ejemplo de llamada a la API:
    // const response = await fetch('/api/game/create', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(gameConfig)
    // })
    
    // Simular carga
    setTimeout(() => {
      setIsLoading(false)
      // Redirigir al juego real
      // router.push('/game/play')
    }, 2000)
  }

  const handleRoomCreate = (roomName: string) => {
    const newRoomName = roomName || `Sala de ${config.username}`
    handleConfigChange('room', newRoomName)
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white mb-6">Selecciona el tipo de juego</h3>
      <div className="grid md:grid-cols-2 gap-6">
        {gameTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => handleConfigChange('gameType', type.id)}
            className={`p-6 rounded-lg border-2 transition-all duration-300 ${
              config.gameType === type.id
                ? 'border-purple-500 bg-purple-600 bg-opacity-20'
                : 'border-gray-600 bg-gray-800 bg-opacity-50 hover:border-purple-400'
            }`}
          >
            <div className="text-4xl mb-4">{type.icon}</div>
            <h4 className="text-xl font-bold text-white mb-2">{type.name}</h4>
            <p className="text-gray-300">{type.description}</p>
          </button>
        ))}
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white mb-6">Elige tu mazo</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {decks.map((deck) => (
          <DeckCard
            key={deck.id}
            id={deck.id}
            name={deck.name}
            color={deck.color}
            icon={deck.icon}
            isSelected={config.deck === deck.id}
            onClick={() => handleConfigChange('deck', deck.id)}
          />
        ))}
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white mb-6">Ingresa tu nombre de usuario</h3>
      <div className="max-w-md mx-auto">
        <input
          type="text"
          value={config.username}
          onChange={(e) => handleConfigChange('username', e.target.value)}
          placeholder="Tu nombre de usuario"
          className="w-full p-4 bg-gray-800 border-2 border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
          maxLength={20}
        />
        <p className="text-sm text-gray-400 mt-2">
          Máximo 20 caracteres
        </p>
      </div>
    </div>
  )

  const renderStep4 = () => {
    if (config.gameType === 'bot') {
      return (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-white mb-6">Configuración de bots</h3>
          <div className="max-w-4xl mx-auto">
            <BotConfiguration
              botCount={config.botCount || 1}
              botDifficulty={config.botDifficulty || 'intermediate'}
              maxPlayers={config.maxPlayers || 4}
              onBotCountChange={(count) => handleConfigChange('botCount', count.toString())}
              onBotDifficultyChange={(difficulty) => handleConfigChange('botDifficulty', difficulty)}
              onMaxPlayersChange={(max) => handleConfigChange('maxPlayers', max.toString())}
            />
          </div>
        </div>
      )
    }

    const filteredRooms = availableRooms.filter(room => room.gameType === config.gameType)
    
    return (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-white mb-6">Selecciona o crea una sala</h3>
        <div className="max-w-2xl mx-auto space-y-4">
          <input
            type="text"
            value={config.room}
            onChange={(e) => handleConfigChange('room', e.target.value)}
            placeholder="Nombre de la sala (opcional)"
            className="w-full p-4 bg-gray-800 border-2 border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
            maxLength={30}
          />
          
          <RoomSelector
            rooms={filteredRooms}
            selectedRoom={config.room}
            onRoomSelect={(roomName) => handleConfigChange('room', roomName)}
            onRoomCreate={handleRoomCreate}
          />
        </div>
      </div>
    )
  }

  const renderStep5 = () => {
    if (config.gameType === 'human') {
      const filteredRooms = availableRooms.filter(room => room.gameType === config.gameType)
      
      return (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-white mb-6">Selecciona o crea una sala</h3>
          <div className="max-w-2xl mx-auto space-y-4">
            <input
              type="text"
              value={config.room}
              onChange={(e) => handleConfigChange('room', e.target.value)}
              placeholder="Nombre de la sala (opcional)"
              className="w-full p-4 bg-gray-800 border-2 border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
              maxLength={30}
            />
            
            <RoomSelector
              rooms={filteredRooms}
              selectedRoom={config.room}
              onRoomSelect={(roomName) => handleConfigChange('room', roomName)}
              onRoomCreate={handleRoomCreate}
            />
          </div>
        </div>
      )
    }

    return null
  }

  const renderSummary = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white mb-6">Resumen de configuración</h3>
      <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg max-w-md mx-auto">
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-300">Tipo de juego:</span>
            <span className="text-white font-semibold">
              {gameTypes.find(t => t.id === config.gameType)?.name}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Mazo:</span>
            <span className="text-white font-semibold">
              {decks.find(d => d.id === config.deck)?.name}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Usuario:</span>
            <span className="text-white font-semibold">{config.username}</span>
          </div>
          {config.gameType === 'bot' ? (
            <>
              <div className="flex justify-between">
                <span className="text-gray-300">Número de bots:</span>
                <span className="text-white font-semibold">{config.botCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Dificultad:</span>
                <span className="text-white font-semibold">
                  {config.botDifficulty === 'beginner' && 'Principiante'}
                  {config.botDifficulty === 'intermediate' && 'Intermedio'}
                  {config.botDifficulty === 'advanced' && 'Avanzado'}
                  {config.botDifficulty === 'expert' && 'Experto'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Total jugadores:</span>
                <span className="text-white font-semibold">{config.maxPlayers}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between">
              <span className="text-gray-300">Sala:</span>
              <span className="text-white font-semibold">{config.room}</span>
            </div>
          )}
        </div>
      </div>
      
      <button
        onClick={handleStartGame}
        disabled={isLoading}
        className="w-full max-w-md mx-auto bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 disabled:opacity-50 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300"
      >
        {isLoading ? 'Iniciando juego...' : '¡Iniciar Juego!'}
      </button>
    </div>
  )

  const steps = [
    { title: 'Tipo de Juego', component: renderStep1 },
    { title: 'Mazo', component: renderStep2 },
    { title: 'Usuario', component: renderStep3 },
    { title: config.gameType === 'bot' ? 'Configuración de Bots' : 'Sala', component: renderStep4 },
    ...(config.gameType === 'human' ? [{ title: 'Sala', component: renderStep5 }] : []),
    { title: 'Resumen', component: renderSummary }
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="relative z-10">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Torre de los Pecados</h1>
            </Link>
            <Link 
              href="/"
              className="text-gray-300 hover:text-white transition-colors"
            >
              ← Volver al inicio
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              {steps.map((stepItem, index) => (
                <div key={index} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index + 1 <= step
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-600 text-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-1 mx-2 ${
                      index + 1 < step ? 'bg-purple-600' : 'bg-gray-600'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
            <h2 className="text-3xl font-bold text-white text-center mb-2">
              {steps[step - 1].title}
            </h2>
            <p className="text-gray-400 text-center">
              Paso {step} de {steps.length}
            </p>
          </div>

          {/* Step Content */}
          <div className="bg-gray-800 bg-opacity-30 p-8 rounded-lg border border-gray-700">
            {steps[step - 1].component()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Anterior
            </button>
            
            {step < steps.length ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Siguiente
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  )
}
