interface BotDifficulty {
  id: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  name: string
  description: string
  icon: string
  color: string
}

interface BotConfigurationProps {
  botCount: number
  botDifficulty: string
  maxPlayers: number
  onBotCountChange: (count: number) => void
  onBotDifficultyChange: (difficulty: string) => void
  onMaxPlayersChange: (max: number) => void
}

export default function BotConfiguration({
  botCount,
  botDifficulty,
  maxPlayers,
  onBotCountChange,
  onBotDifficultyChange,
  onMaxPlayersChange
}: BotConfigurationProps) {
  const botDifficulties: BotDifficulty[] = [
    { 
      id: 'beginner', 
      name: 'Principiante', 
      description: 'Decisiones aleatorias, ideal para práctica',
      icon: '🌱',
      color: 'bg-green-600'
    },
    { 
      id: 'intermediate', 
      name: 'Intermedio', 
      description: 'Estrategia básica con algunas decisiones inteligentes',
      icon: '🌿',
      color: 'bg-blue-600'
    },
    { 
      id: 'advanced', 
      name: 'Avanzado', 
      description: 'Estrategia compleja con análisis de probabilidades',
      icon: '🔥',
      color: 'bg-orange-600'
    },
    { 
      id: 'expert', 
      name: 'Experto', 
      description: 'Análisis profundo y estrategia óptima',
      icon: '⚡',
      color: 'bg-red-600'
    }
  ]

  const maxBots = maxPlayers - 1 // Un jugador humano + bots

  return (
    <div className="space-y-6">
      {/* Número de bots */}
      <div className="space-y-4">
        <h4 className="text-lg font-bold text-white">Número de bots</h4>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onBotCountChange(Math.max(1, botCount - 1))}
            disabled={botCount <= 1}
            className="w-10 h-10 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-colors"
          >
            -
          </button>
          
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-white">{botCount}</span>
            <span className="text-gray-300">bots</span>
          </div>
          
          <button
            onClick={() => onBotCountChange(Math.min(maxBots, botCount + 1))}
            disabled={botCount >= maxBots}
            className="w-10 h-10 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-colors"
          >
            +
          </button>
        </div>
        
        <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg">
          <div className="flex items-center justify-between text-sm text-gray-300">
            <span>Total de jugadores: {botCount + 1}</span>
            <span>Máximo: {maxPlayers}</span>
          </div>
          <div className="flex space-x-1 mt-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white">👤</span>
            </div>
            {Array.from({ length: botCount }, (_, i) => (
              <div key={i} className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white">🤖</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dificultad de bots */}
      <div className="space-y-4">
        <h4 className="text-lg font-bold text-white">Dificultad de los bots</h4>
        <div className="grid md:grid-cols-2 gap-4">
          {botDifficulties.map((difficulty) => (
            <button
              key={difficulty.id}
              onClick={() => onBotDifficultyChange(difficulty.id)}
              className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                botDifficulty === difficulty.id
                  ? 'border-purple-500 bg-purple-600 bg-opacity-20'
                  : 'border-gray-600 bg-gray-800 bg-opacity-50 hover:border-purple-400'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${difficulty.color} rounded-lg flex items-center justify-center`}>
                  <span className="text-xl">{difficulty.icon}</span>
                </div>
                <div className="text-left">
                  <h5 className="text-white font-semibold">{difficulty.name}</h5>
                  <p className="text-sm text-gray-300">{difficulty.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Número máximo de jugadores */}
      <div className="space-y-4">
        <h4 className="text-lg font-bold text-white">Número máximo de jugadores</h4>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onMaxPlayersChange(Math.max(2, maxPlayers - 1))}
            disabled={maxPlayers <= 2}
            className="w-10 h-10 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-colors"
          >
            -
          </button>
          
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-white">{maxPlayers}</span>
            <span className="text-gray-300">jugadores</span>
          </div>
          
          <button
            onClick={() => onMaxPlayersChange(Math.min(6, maxPlayers + 1))}
            disabled={maxPlayers >= 6}
            className="w-10 h-10 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-colors"
          >
            +
          </button>
        </div>
        
        <p className="text-sm text-gray-400">
          Ajusta el número máximo de jugadores para permitir más o menos bots en el juego.
        </p>
      </div>
    </div>
  )
}
