'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface Player {
  id: string
  name: string
  deckType: string
  isBot: boolean
  hand: number
  faceUpCreatures: number
  faceDownCreatures: number
  soulWell: number
  currentPhase: string
  isAlive: boolean
  isReady: boolean
}

interface GameState {
  gameState: 'waiting' | 'playing' | 'finished'
  currentPlayerId: string
  players: Player[]
  towerOfSins: {
    cards: any[]
    lastCard?: any
  }
  turnTime: number
  turnStartTime: number
}

export default function GamePlayPage() {
  const searchParams = useSearchParams()
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [autoStartCountdown, setAutoStartCountdown] = useState(3)

  // Obtener configuración de la URL
  const playerName = searchParams.get('playerName')
  const deckType = searchParams.get('deckType')
  const gameMode = searchParams.get('gameMode')
  const botCount = parseInt(searchParams.get('botCount') || '0')
  const botDifficulty = searchParams.get('botDifficulty')

  useEffect(() => {
    if (!playerName || !deckType) {
      setError('Configuración incompleta')
      setIsLoading(false)
      return
    }

    // Simular inicialización del juego
    initializeGame()

    // Cleanup function
    return () => {
      // Limpiar cualquier intervalo pendiente
    }
  }, [playerName, deckType, gameMode, botCount, botDifficulty])

  const initializeGame = () => {
    setIsLoading(true)
    
    // Simular tiempo de carga
    setTimeout(() => {
      // Crear estado inicial del juego
      const initialGameState: GameState = {
        gameState: 'waiting',
        currentPlayerId: 'player1',
        players: [
          {
            id: 'player1',
            name: playerName!,
            deckType: deckType!,
            isBot: false,
            hand: 3,
            faceUpCreatures: 3,
            faceDownCreatures: 3,
            soulWell: 6,
            currentPhase: 'hand',
            isAlive: true,
            isReady: true
          },
          // Crear bots
          ...Array.from({ length: botCount }, (_, i) => ({
            id: `bot${i + 1}`,
            name: `Bot ${i + 1} (${botDifficulty})`,
            deckType: getRandomDeckType(),
            isBot: true,
            hand: 3,
            faceUpCreatures: 3,
            faceDownCreatures: 3,
            soulWell: 6,
            currentPhase: 'hand',
            isAlive: true,
            isReady: true
          }))
        ],
        towerOfSins: {
          cards: [],
          lastCard: null
        },
        turnTime: 30,
        turnStartTime: Date.now()
      }

      setGameState(initialGameState)
      setIsLoading(false)

      // Iniciar countdown automático
      const countdownInterval = setInterval(() => {
        setAutoStartCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval)
            // Iniciar el juego
            setGameState(prev => {
              if (prev) {
                setGameStarted(true)
                return {
                  ...prev,
                  gameState: 'playing',
                  towerOfSins: {
                    cards: [getRandomInitialCard()],
                    lastCard: getRandomInitialCard()
                  }
                }
              }
              return prev
            })
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }, 1500)
  }

  const getRandomDeckType = () => {
    const deckTypes = ['angels', 'demons', 'dragons', 'mages', 'dark_elves', 'dwarves', 'elves', 'orcs']
    return deckTypes[Math.floor(Math.random() * deckTypes.length)]
  }

  const getRandomInitialCard = () => {
    const cards = [
      { id: 1, name: 'Dragón de Fuego', value: 8, type: 'criatura', image: '/images/cards/dragons/dragon_1.png', description: 'Una poderosa criatura que escupe fuego' },
      { id: 2, name: 'Goblin Ladrón', value: 2, type: 'criatura', image: '/images/cards/dragons/dragon_2.png', description: 'Un pequeño goblin que roba cartas' },
      { id: 3, name: 'Mago Oscuro', value: 6, type: 'criatura', image: '/images/cards/dragons/dragon_3.png', description: 'Un mago que domina las artes oscuras' },
      { id: 4, name: 'Bola de Fuego', value: 4, type: 'hechizo', image: '/images/cards/dragons/dragon_4.png', description: 'Elimina una criatura del oponente' },
      { id: 5, name: 'Escudo Mágico', value: 5, type: 'trampa', image: '/images/cards/dragons/dragon_5.png', description: 'Protege contra el próximo ataque' },
      { id: 6, name: 'Gigante de Piedra', value: 7, type: 'criatura', image: '/images/cards/dragons/dragon_6.png', description: 'Un gigante inmune a hechizos' },
      { id: 7, name: 'Hada Curandera', value: 3, type: 'criatura', image: '/images/cards/dragons/dragon_7.png', description: 'Cura una criatura herida' },
      { id: 8, name: 'Rayo', value: 9, type: 'hechizo', image: '/images/cards/dragons/dragon_8.png', description: 'Un poderoso hechizo destructivo' }
    ]
    return cards[Math.floor(Math.random() * cards.length)]
  }

  const getCardFromDeck = (deckType: string, value: number) => {
    const deckCards = {
      dark_elves: [
        { name: 'Asesina de Medianoche', description: 'Elfa entrenada en venenos, elimina objetivos solitarios' },
        { name: 'Murciélagos de Sangre', description: 'Criaturas menores que drenan vitalidad al enemigo' },
        { name: 'Espíritu de las Sombras', description: 'Entidad etérea que se desliza entre las sombras' },
        { name: 'Araña Venenosa', description: 'Teje telarañas de veneno mortal' },
        { name: 'Guardián de la Oscuridad', description: 'Protector de los secretos más profundos' },
        { name: 'Mago de las Tinieblas', description: 'Domina las artes oscuras de la magia' },
        { name: 'Demonio Menor', description: 'Criatura infernal al servicio de los elfos oscuros' },
        { name: 'Portador de la Peste', description: 'Siembra enfermedades y corrupción' },
        { name: 'Señor de las Sombras', description: 'Comanda ejércitos de criaturas oscuras' },
        { name: 'Destructor del Abismo', description: 'Anula toda la Torre con magia oscura' },
        { name: 'Barón de la Noche', description: 'Maestro del sigilo y manipulación' },
        { name: 'Reina de las Sombras', description: 'Controla corrupción y desorden' },
        { name: 'Emperador de la Oscuridad', description: 'Ser supremo de los elfos oscuros' }
      ],
      angels: [
        { name: 'El Querubín de la Esperanza', description: 'El primer destello de luz, guía en los comienzos inciertos' },
        { name: 'El Serafín de la Fe', description: 'Su pureza refuerza el corazón de los justos' },
        { name: 'El Guardián de la Caridad', description: 'Protege a los más débiles, dispuesto a sacrificarse' },
        { name: 'La Cohorte de la Prudencia', description: 'Legión sabia que planea cada movimiento' },
        { name: 'El Portador de la Justicia', description: 'Porta la balanza divina, equilibrando las fuerzas' },
        { name: 'El Arcángel de la Fortaleza', description: 'Su armadura resplandece con fuerza inquebrantable' },
        { name: 'La Llama de la Templanza', description: 'Modera los excesos, neutraliza habilidades extremas' },
        { name: 'El Emisario de la Fe y la Caridad', description: 'Fortalece la unión entre aliados' },
        { name: 'El Serafín de la Justicia Suprema', description: 'Su balanza brilla más que cualquier otra' },
        { name: 'El Trono de la Virtud', description: 'Máxima expresión de la perfección celestial' },
        { name: 'El Arcángel de la Estrategia', description: 'Dirige legiones con sabiduría y valor' },
        { name: 'La Bendición de la Caridad', description: 'Irradia luz sanadora, protegiendo a los caídos' },
        { name: 'El Creador de la Luz', description: 'La divinidad suprema, origen de todo' }
      ],
      demons: [
        { name: 'Larva de la Avaricia', description: 'Se alimenta del oro y del deseo' },
        { name: 'Demonio de la Ira', description: 'Encarnación del odio ardiente' },
        { name: 'Espectro de la Envidia', description: 'Drena el poder de los demás' },
        { name: 'Súcubo de la Lujuria', description: 'Esclaviza las mentes con engaños' },
        { name: 'Goliat de la Pereza', description: 'Gigante lento, poder inesperado' },
        { name: 'Glotón del Abismo', description: 'Bestia que devora aliados y enemigos' },
        { name: 'Incubo de la Lujuria', description: 'Complemento del súcubo' },
        { name: 'Portador de la Pestilencia', description: 'Siembra plagas, infecta criaturas' },
        { name: 'Tirano de la Soberbia', description: 'Se cree superior a sus iguales' },
        { name: 'Señor del Abismo', description: 'Demonio primordial, quebranta vínculos' },
        { name: 'Barón de las Sombras', description: 'Maestro del sigilo y manipulación' },
        { name: 'La Bruja del Caos', description: 'Controla corrupción y desorden' },
        { name: 'El Emperador del Infierno', description: 'Ser supremo del inframundo' }
      ],
      dragons: [
        { name: 'El Dragón Bebé', description: 'Recién salido del cascarón, anuncia su destino' },
        { name: 'El Dragón de la Peste', description: 'Su aliento envenenado corrompe el aire' },
        { name: 'El Dragón de Piedra', description: 'De escamas pétreas, casi indestructible' },
        { name: 'El Dragón de Hielo', description: 'Congela todo a su paso, ralentiza' },
        { name: 'El Dragón de Bronce', description: 'Noble guerrero que lucha con honor' },
        { name: 'El Dragón de las Colinas', description: 'Salvaje y territorial, protege dominios' },
        { name: 'El Dragón del Desierto', description: 'Astuto y paciente, maestro del engaño' },
        { name: 'El Dragón Etéreo', description: 'Espectro que atraviesa dimensiones' },
        { name: 'El Dragón de la Tormenta', description: 'Desde las nubes lanza rayos devastadores' },
        { name: 'El Dragón Dorado', description: 'Símbolo de perfección, arrasa la Torre' },
        { name: 'El Dragón de Jade', description: 'Antiguo y sabio, guardián de secretos' },
        { name: 'La Dracona Guardiana', description: 'Madre protectora de la estirpe' },
        { name: 'El Dragón Primigenio', description: 'El primero de todos los dragones' }
      ]
    }
    
    const deck = deckCards[deckType as keyof typeof deckCards] || deckCards.dark_elves
    const card = deck[value - 1] || deck[0]
    
    return {
      name: card.name,
      value: value,
      description: card.description,
      isSpecial: value === 2 || value === 8 || value === 10
    }
  }

  const getDeckColor = (deckType: string) => {
    const colors = {
      angels: 'from-blue-400 to-blue-600',
      demons: 'from-red-400 to-red-600',
      dragons: 'from-orange-400 to-orange-600',
      mages: 'from-purple-400 to-purple-600',
      dark_elves: 'from-gray-400 to-gray-600',
      dwarves: 'from-yellow-400 to-yellow-600',
      elves: 'from-green-400 to-green-600',
      orcs: 'from-red-500 to-red-700'
    }
    return colors[deckType as keyof typeof colors] || 'from-gray-400 to-gray-600'
  }

  const getDeckIcon = (deckType: string) => {
    const icons = {
      angels: '👼',
      demons: '👿',
      dragons: '🐉',
      mages: '🧙‍♂️',
      dark_elves: '🧝‍♀️',
      dwarves: '🧙‍♂️',
      elves: '🧝‍♂️',
      orcs: '👹'
    }
    return icons[deckType as keyof typeof icons] || '🎴'
  }

  const startGame = () => {
    setAutoStartCountdown(0) // Detener el countdown
    setGameState(prev => {
      if (prev) {
        setGameStarted(true)
        return {
          ...prev,
          gameState: 'playing',
          towerOfSins: {
            cards: [getRandomInitialCard()],
            lastCard: getRandomInitialCard()
          }
        }
      }
      return prev
    })
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto mb-8"></div>
            <h2 className="text-2xl font-bold text-white mb-4">Iniciando partida...</h2>
            <p className="text-gray-300">Preparando el tablero de juego</p>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
            <p className="text-gray-300 mb-8">{error}</p>
            <Link 
              href="/game"
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Volver a configurar
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (!gameState) {
    return null
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="relative z-10">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">T</span>
                </div>
                <h1 className="text-2xl font-bold text-white">Torre de los Pecados</h1>
              </Link>
              <div className="text-gray-300">
                | {gameState.gameState === 'waiting' ? 'Esperando...' : 'Jugando'}
              </div>
            </div>
            <Link 
              href="/game"
              className="text-gray-300 hover:text-white transition-colors"
            >
              ← Salir del juego
            </Link>
          </div>
        </nav>
      </header>

      {/* Game Board */}
      <div className="container mx-auto px-6 py-8">
                 {gameState.gameState === 'waiting' ? (
           <div className="text-center">
             <h2 className="text-3xl font-bold text-white mb-8">Esperando inicio del juego...</h2>
             <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-8">
               {gameState.players.map((player) => (
                 <div key={player.id} className="bg-gray-800 bg-opacity-50 p-6 rounded-lg border border-gray-700">
                   <div className="flex items-center justify-center mb-4">
                     <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${getDeckColor(player.deckType)} flex items-center justify-center text-2xl`}>
                       {getDeckIcon(player.deckType)}
                     </div>
                   </div>
                   <h3 className="text-xl font-bold text-white mb-2">{player.name}</h3>
                   <p className="text-gray-300 mb-2">Mazo: {player.deckType}</p>
                   <div className="flex items-center justify-center">
                     {player.isReady ? (
                       <span className="text-green-400">✓ Listo</span>
                     ) : (
                       <span className="text-yellow-400">⏳ Esperando...</span>
                     )}
                   </div>
                 </div>
               ))}
             </div>
             
             {/* Botón de inicio manual */}
             <div className="max-w-md mx-auto">
               <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg mb-4">
                 <p className="text-gray-300 text-sm mb-2">
                   {autoStartCountdown > 0 ? (
                     <span>El juego iniciará automáticamente en <span className="font-bold text-yellow-400">{autoStartCountdown}</span> segundos...</span>
                   ) : (
                     <span>Iniciando juego...</span>
                   )}
                 </p>
                 <div className="w-full bg-gray-600 rounded-full h-2">
                   <div 
                     className="bg-gradient-to-r from-purple-500 to-red-500 h-2 rounded-full transition-all duration-1000"
                     style={{ width: `${((3 - autoStartCountdown) / 3) * 100}%` }}
                   ></div>
                 </div>
               </div>
               
               <button
                 onClick={startGame}
                 className="bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 shadow-lg"
               >
                 🎮 Iniciar Juego Ahora
               </button>
               <p className="text-gray-400 text-sm mt-4">
                 O puedes hacer clic aquí para comenzar inmediatamente.
               </p>
             </div>
           </div>
        ) : (
          <div className="space-y-8">
                         {/* Rivals Section */}
             <div className="grid md:grid-cols-3 gap-6">
               {gameState.players.filter(p => p.isBot).map((player, index) => (
                 <div key={player.id} className="bg-gray-800 bg-opacity-50 p-6 rounded-lg border border-gray-700 hover:border-purple-500 transition-colors">
                   <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center space-x-3">
                       <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getDeckColor(player.deckType)} flex items-center justify-center text-xl shadow-lg`}>
                         {getDeckIcon(player.deckType)}
                       </div>
                       <div>
                         <h3 className="text-lg font-bold text-white">{player.name}</h3>
                         <p className="text-sm text-gray-300 capitalize">{player.deckType.replace('_', ' ')}</p>
                       </div>
                     </div>
                     <div className="text-right">
                       <div className="text-sm text-gray-400 mb-1">
                         <span className="font-semibold">Fase:</span> {player.currentPhase === 'hand' ? '✋ Mano' : player.currentPhase === 'faceUp' ? '📋 Boca Arriba' : '🃏 Boca Abajo'}
                       </div>
                       <div className="text-xs text-gray-500">
                         <span className="text-blue-400">Mano: {player.hand}</span> | 
                         <span className="text-green-400"> Arriba: {player.faceUpCreatures}</span> | 
                         <span className="text-red-400"> Abajo: {player.faceDownCreatures}</span>
                       </div>
                     </div>
                   </div>
                   
                   {/* Player Cards Visualization */}
                   <div className="space-y-3">
                     {/* Hand Cards */}
                     <div>
                       <div className="text-xs text-blue-400 mb-1">✋ Mano ({player.hand})</div>
                       <div className="flex space-x-1">
                         {Array.from({ length: player.hand }, (_, i) => (
                           <div key={i} className="w-8 h-12 bg-blue-600 rounded border-2 border-blue-400 shadow-md"></div>
                         ))}
                       </div>
                     </div>
                     
                     {/* Face Up Creatures */}
                     <div>
                       <div className="text-xs text-green-400 mb-1">📋 Boca Arriba ({player.faceUpCreatures})</div>
                       <div className="flex space-x-1">
                         {Array.from({ length: player.faceUpCreatures }, (_, i) => (
                           <div key={i} className="w-8 h-12 bg-green-600 rounded border-2 border-green-400 shadow-md"></div>
                         ))}
                       </div>
                     </div>
                     
                     {/* Face Down Creatures */}
                     <div>
                       <div className="text-xs text-red-400 mb-1">🃏 Boca Abajo ({player.faceDownCreatures})</div>
                       <div className="flex space-x-1">
                         {Array.from({ length: player.faceDownCreatures }, (_, i) => (
                           <div key={i} className="w-8 h-12 bg-red-600 rounded border-2 border-red-400 shadow-md"></div>
                         ))}
                       </div>
                     </div>
                   </div>
                 </div>
               ))}
             </div>

                         {/* Tower of Sins - Initial Card */}
             <div className="bg-gray-800 bg-opacity-50 p-8 rounded-lg border border-gray-700 text-center">
               <h3 className="text-2xl font-bold text-white mb-6">🏰 Torre de los Pecados</h3>
               
               {gameState.towerOfSins.lastCard ? (
                 <div className="max-w-lg mx-auto">
                   <div className="bg-gradient-to-r from-red-600 to-purple-600 p-6 rounded-lg mb-6">
                     <h4 className="text-xl font-bold text-white mb-4">🎴 Carta Inicial</h4>
                     <div className="bg-white rounded-lg p-6 shadow-lg">
                       <div className="text-4xl mb-3">🃏</div>
                       <div className="font-bold text-gray-800 text-lg mb-2">{gameState.towerOfSins.lastCard.name}</div>
                       <div className="text-sm text-gray-600 mb-1">Valor: <span className="font-semibold">{gameState.towerOfSins.lastCard.value}</span></div>
                       <div className="text-sm text-gray-600 mb-3">Tipo: <span className="font-semibold capitalize">{gameState.towerOfSins.lastCard.type}</span></div>
                       <div className="text-xs text-gray-500 italic">{gameState.towerOfSins.lastCard.description}</div>
                     </div>
                   </div>
                   <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg">
                     <p className="text-gray-300 text-sm">
                       <span className="font-semibold text-yellow-400">📋 Regla del juego:</span><br/>
                       Los jugadores deben jugar cartas de valor <span className="font-bold text-green-400">igual o mayor</span> a esta carta.
                     </p>
                   </div>
                 </div>
               ) : (
                 <div className="text-gray-400">
                   <div className="text-6xl mb-4">🏰</div>
                   <p className="text-lg mb-2">No hay cartas en la torre aún.</p>
                   <p>El primer jugador puede jugar cualquier carta.</p>
                 </div>
               )}
             </div>

                         {/* Current Player Info */}
             <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg border border-gray-700">
               <div className="flex items-center justify-between mb-6">
                 <h3 className="text-xl font-bold text-white">🎮 Tu Turno</h3>
                 <div className="flex items-center space-x-3">
                   <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getDeckColor(gameState.players.find(p => !p.isBot)?.deckType || '')} flex items-center justify-center text-lg`}>
                     {getDeckIcon(gameState.players.find(p => !p.isBot)?.deckType || '')}
                   </div>
                   <div className="text-right">
                     <div className="text-sm text-gray-300">{gameState.players.find(p => !p.isBot)?.name}</div>
                     <div className="text-xs text-gray-400 capitalize">{gameState.players.find(p => !p.isBot)?.deckType?.replace('_', ' ')}</div>
                   </div>
                 </div>
               </div>
               
               <div className="grid md:grid-cols-2 gap-6">
                 <div>
                   <h4 className="text-lg font-bold text-white mb-4">📊 Tu Estado</h4>
                   <div className="space-y-3 text-gray-300">
                     <div className="flex justify-between items-center">
                       <span>Fase actual:</span>
                       <span className="font-semibold text-purple-400">
                         {gameState.players.find(p => !p.isBot)?.currentPhase === 'hand' ? '✋ Mano' : 
                          gameState.players.find(p => !p.isBot)?.currentPhase === 'faceUp' ? '📋 Boca Arriba' : '🃏 Boca Abajo'}
                       </span>
                     </div>
                     <div className="flex justify-between items-center">
                       <span>Cartas en mano:</span>
                       <span className="font-semibold text-blue-400">{gameState.players.find(p => !p.isBot)?.hand}</span>
                     </div>
                     <div className="flex justify-between items-center">
                       <span>Criaturas boca arriba:</span>
                       <span className="font-semibold text-green-400">{gameState.players.find(p => !p.isBot)?.faceUpCreatures}</span>
                     </div>
                     <div className="flex justify-between items-center">
                       <span>Criaturas boca abajo:</span>
                       <span className="font-semibold text-red-400">{gameState.players.find(p => !p.isBot)?.faceDownCreatures}</span>
                     </div>
                     <div className="flex justify-between items-center">
                       <span>Pozo de almas:</span>
                       <span className="font-semibold text-yellow-400">{gameState.players.find(p => !p.isBot)?.soulWell}</span>
                     </div>
                   </div>
                 </div>
                 
                 <div>
                   <h4 className="text-lg font-bold text-white mb-4">⚡ Acciones Disponibles</h4>
                   <div className="space-y-3">
                     <button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg">
                       🎴 Jugar Carta
                     </button>
                     <button className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg">
                       🏰 Tomar Torre
                     </button>
                     <div className="text-xs text-gray-400 text-center mt-4">
                       <p>💡 Consejo: Juega cartas de valor igual o mayor a la carta de la torre</p>
                     </div>
                   </div>
                 </div>
               </div>
             </div>

             {/* Player Cards - All Phases */}
             <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg border border-gray-700">
               <h3 className="text-xl font-bold text-white mb-6">🃏 Tus Cartas</h3>
               
               <div className="grid md:grid-cols-3 gap-6">
                 {/* Fase 1: Mano */}
                 <div className={`p-4 rounded-lg border transition-all duration-300 ${
                   gameState.players.find(p => !p.isBot)?.currentPhase === 'hand' 
                     ? 'bg-blue-900 bg-opacity-50 border-blue-400 shadow-lg shadow-blue-500/25' 
                     : 'bg-blue-900 bg-opacity-30 border-blue-500'
                 }`}>
                   <div className="flex items-center justify-between mb-4">
                     <h4 className="text-lg font-bold text-blue-300">✋ Fase 1: Mano</h4>
                     <span className={`text-sm font-semibold px-2 py-1 rounded ${
                       gameState.players.find(p => !p.isBot)?.currentPhase === 'hand' 
                         ? 'bg-blue-500 text-white animate-pulse' 
                         : 'text-blue-400'
                     }`}>
                       {gameState.players.find(p => !p.isBot)?.currentPhase === 'hand' ? '🎯 ACTIVA' : ''}
                     </span>
                   </div>
                   
                   <div className="space-y-3">
                     {Array.from({ length: gameState.players.find(p => !p.isBot)?.hand || 0 }, (_, i) => {
                       const cardValue = Math.floor(Math.random() * 13) + 1
                       const card = getCardFromDeck(gameState.players.find(p => !p.isBot)?.deckType || 'dark_elves', cardValue)
                       return (
                         <div key={i} className="bg-white rounded-lg p-3 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                           <div className="flex items-center justify-between">
                             <div className="text-2xl">{card.isSpecial ? '⭐' : '🃏'}</div>
                             <div className="text-right">
                               <div className="font-bold text-gray-800 text-sm">{card.name}</div>
                               <div className="text-xs text-gray-600">Valor: {card.value}</div>
                             </div>
                           </div>
                           <div className="mt-2 text-xs text-gray-600 italic">
                             {card.description}
                           </div>
                           <div className="mt-2">
                             <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1 px-2 rounded transition-colors">
                               {card.isSpecial ? 'ESPECIAL' : 'JUGAR'}
                             </button>
                           </div>
                         </div>
                       )
                     })}
                     
                     {gameState.players.find(p => !p.isBot)?.hand === 0 && (
                       <div className="text-center text-gray-400 py-4">
                         <div className="text-2xl mb-2">✋</div>
                         <p className="text-sm">Sin cartas en mano</p>
                       </div>
                     )}
                   </div>
                   
                   <div className="mt-4 text-xs text-blue-300">
                     <p>💡 Robas una carta después de jugar</p>
                     <p>🎯 Fase activa: {gameState.players.find(p => !p.isBot)?.currentPhase === 'hand' ? 'SÍ' : 'NO'}</p>
                   </div>
                 </div>

                 {/* Fase 2: Boca Arriba */}
                 <div className={`p-4 rounded-lg border transition-all duration-300 ${
                   gameState.players.find(p => !p.isBot)?.currentPhase === 'faceUp' 
                     ? 'bg-green-900 bg-opacity-50 border-green-400 shadow-lg shadow-green-500/25' 
                     : 'bg-green-900 bg-opacity-30 border-green-500'
                 }`}>
                   <div className="flex items-center justify-between mb-4">
                     <h4 className="text-lg font-bold text-green-300">📋 Fase 2: Boca Arriba</h4>
                     <span className={`text-sm font-semibold px-2 py-1 rounded ${
                       gameState.players.find(p => !p.isBot)?.currentPhase === 'faceUp' 
                         ? 'bg-green-500 text-white animate-pulse' 
                         : 'text-green-400'
                     }`}>
                       {gameState.players.find(p => !p.isBot)?.currentPhase === 'faceUp' ? '🎯 ACTIVA' : ''}
                     </span>
                   </div>
                   
                   <div className="space-y-3">
                     {Array.from({ length: gameState.players.find(p => !p.isBot)?.faceUpCreatures || 0 }, (_, i) => {
                       const cardValue = Math.floor(Math.random() * 13) + 1
                       const card = getCardFromDeck(gameState.players.find(p => !p.isBot)?.deckType || 'dark_elves', cardValue)
                       return (
                         <div key={i} className="bg-white rounded-lg p-3 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                           <div className="flex items-center justify-between">
                             <div className="text-2xl">{card.isSpecial ? '⭐' : '📋'}</div>
                             <div className="text-right">
                               <div className="font-bold text-gray-800 text-sm">{card.name}</div>
                               <div className="text-xs text-gray-600">Valor: {card.value}</div>
                             </div>
                           </div>
                           <div className="mt-2 text-xs text-gray-600 italic">
                             {card.description}
                           </div>
                           <div className="mt-2">
                             <button className="w-full bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-1 px-2 rounded transition-colors">
                               {card.isSpecial ? 'ESPECIAL' : 'JUGAR'}
                             </button>
                           </div>
                         </div>
                       )
                     })}
                     
                     {gameState.players.find(p => !p.isBot)?.faceUpCreatures === 0 && (
                       <div className="text-center text-gray-400 py-4">
                         <div className="text-2xl mb-2">📋</div>
                         <p className="text-sm">Sin criaturas boca arriba</p>
                       </div>
                     )}
                   </div>
                   
                   <div className="mt-4 text-xs text-green-300">
                     <p>⚠️ No puedes robar del Pozo de Almas</p>
                     <p>🎯 Fase activa: {gameState.players.find(p => !p.isBot)?.currentPhase === 'faceUp' ? 'SÍ' : 'NO'}</p>
                   </div>
                 </div>

                 {/* Fase 3: Boca Abajo */}
                 <div className={`p-4 rounded-lg border transition-all duration-300 ${
                   gameState.players.find(p => !p.isBot)?.currentPhase === 'faceDown' 
                     ? 'bg-red-900 bg-opacity-50 border-red-400 shadow-lg shadow-red-500/25' 
                     : 'bg-red-900 bg-opacity-30 border-red-500'
                 }`}>
                   <div className="flex items-center justify-between mb-4">
                     <h4 className="text-lg font-bold text-red-300">🃏 Fase 3: Boca Abajo</h4>
                     <span className={`text-sm font-semibold px-2 py-1 rounded ${
                       gameState.players.find(p => !p.isBot)?.currentPhase === 'faceDown' 
                         ? 'bg-red-500 text-white animate-pulse' 
                         : 'text-red-400'
                     }`}>
                       {gameState.players.find(p => !p.isBot)?.currentPhase === 'faceDown' ? '🎯 ACTIVA' : ''}
                     </span>
                   </div>
                   
                   <div className="space-y-3">
                     {Array.from({ length: gameState.players.find(p => !p.isBot)?.faceDownCreatures || 0 }, (_, i) => (
                       <div key={i} className="bg-gray-800 rounded-lg p-3 shadow-md hover:shadow-lg transition-shadow cursor-pointer border-2 border-gray-600">
                         <div className="flex items-center justify-between">
                           <div className="text-2xl">❓</div>
                           <div className="text-right">
                             <div className="font-bold text-gray-300 text-sm">Criatura {i + 1}</div>
                             <div className="text-xs text-gray-400">Oculta</div>
                           </div>
                         </div>
                         <div className="mt-2">
                           <button className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1 px-2 rounded transition-colors">
                             JUGAR A CIEGAS
                           </button>
                         </div>
                       </div>
                     ))}
                     
                     {gameState.players.find(p => !p.isBot)?.faceDownCreatures === 0 && (
                       <div className="text-center text-gray-400 py-4">
                         <div className="text-2xl mb-2">🃏</div>
                         <p className="text-sm">Sin criaturas boca abajo</p>
                       </div>
                     )}
                   </div>
                   
                   <div className="mt-4 text-xs text-red-300">
                     <p>🎲 Si no es válida, tomas toda la Torre</p>
                     <p>🎯 Fase activa: {gameState.players.find(p => !p.isBot)?.currentPhase === 'faceDown' ? 'SÍ' : 'NO'}</p>
                   </div>
                 </div>
               </div>
             </div>
          </div>
        )}
      </div>
    </main>
  )
}
