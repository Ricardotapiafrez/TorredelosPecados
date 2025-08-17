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
      { id: 1, name: 'Dragón de Fuego', value: 8, type: 'criatura', image: '/images/cards/dragons/dragon_8.png', description: 'Una poderosa criatura que escupe fuego' },
      { id: 2, name: 'Goblin Ladrón', value: 2, type: 'criatura', image: '/images/cards/dragons/dragon_2.png', description: 'Un pequeño goblin que roba cartas' },
      { id: 3, name: 'Mago Oscuro', value: 6, type: 'criatura', image: '/images/cards/dragons/dragon_6.png', description: 'Un mago que domina las artes oscuras' },
      { id: 4, name: 'Bola de Fuego', value: 4, type: 'hechizo', image: '/images/cards/dragons/dragon_4.png', description: 'Elimina una criatura del oponente' },
      { id: 5, name: 'Escudo Mágico', value: 5, type: 'trampa', image: '/images/cards/dragons/dragon_5.png', description: 'Protege contra el próximo ataque' },
      { id: 6, name: 'Gigante de Piedra', value: 7, type: 'criatura', image: '/images/cards/dragons/dragon_7.png', description: 'Un gigante inmune a hechizos' },
      { id: 7, name: 'Hada Curandera', value: 3, type: 'criatura', image: '/images/cards/dragons/dragon_3.png', description: 'Cura una criatura herida' },
      { id: 8, name: 'Rayo', value: 9, type: 'hechizo', image: '/images/cards/dragons/dragon_9.png', description: 'Un poderoso hechizo destructivo' }
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
      isSpecial: value === 2 || value === 8 || value === 10,
      imagePath: getCardImagePath(deckType, value)
    }
  }

  const getCardImagePath = (deckType: string, value: number) => {
    // Mapear nombres de mazos a carpetas de imágenes y nombres de archivo
    const deckImageMap = {
      angels: { folder: 'angels', prefix: 'angel' },
      demons: { folder: 'demons', prefix: 'demon' }, 
      dragons: { folder: 'dragons', prefix: 'dragon' },
      mages: { folder: 'mages', prefix: 'mage' },
      dark_elves: { folder: 'dark_elves', prefix: 'dark_elf' },
      dwarves: { folder: 'dwarves', prefix: 'dwarf' },
      elves: { folder: 'elves', prefix: 'elf' },
      orcs: { folder: 'orcs', prefix: 'orc' }
    }
    
    const deckInfo = deckImageMap[deckType as keyof typeof deckImageMap]
    if (!deckInfo) return null
    
    // Verificar si la imagen existe (todos los mazos ahora tienen imágenes)
    const availableDecks = ['angels', 'demons', 'dragons', 'mages', 'dark_elves', 'dwarves', 'elves', 'orcs']
    if (availableDecks.includes(deckType)) {
      return `/images/cards/${deckInfo.folder}/${deckInfo.prefix}_${value}.png`
    }
    
    return null
  }

  const getCardBackImagePath = (deckType: string) => {
    const backImageMap = {
      angels: 'card_back_angels.png',
      demons: 'card_back_demons.png',
      dragons: 'card_back_dragons.png',
      mages: 'card_back_mages.png',
      dark_elves: 'card_back_dark_elves.png',
      dwarves: 'card_back_dwarves.png',
      elves: 'card_back_elves.png',
      orcs: 'card_back_orcs.png'
    }
    
    const backImage = backImageMap[deckType as keyof typeof backImageMap] || 'card_back_default.png'
    return `/images/cards/backs/${backImage}`
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
      <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 via-red-900/20 to-black relative overflow-hidden">
        {/* Atmospheric Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(120,0,0,0.1)_0%,_transparent_70%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_rgba(120,0,0,0.15)_0%,_transparent_50%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_rgba(75,0,130,0.1)_0%,_transparent_50%)] pointer-events-none"></div>
        
        {/* Fog Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-800/5 to-gray-900/10 pointer-events-none"></div>
        
        <div className="flex items-center justify-center min-h-screen relative z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto mb-8 shadow-lg shadow-red-900/50"></div>
            <h2 className="text-2xl font-bold text-red-100 mb-4 drop-shadow-lg">Iniciando partida...</h2>
            <p className="text-gray-300 font-medium">Preparando el tablero de juego</p>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 via-red-900/20 to-black relative overflow-hidden">
        {/* Atmospheric Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(120,0,0,0.1)_0%,_transparent_70%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_rgba(120,0,0,0.15)_0%,_transparent_50%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_rgba(75,0,130,0.1)_0%,_transparent_50%)] pointer-events-none"></div>
        
        {/* Fog Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-800/5 to-gray-900/10 pointer-events-none"></div>
        
        <div className="flex items-center justify-center min-h-screen relative z-10">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-400 mb-4 drop-shadow-lg">Error</h2>
            <p className="text-gray-300 mb-8 font-medium">{error}</p>
            <Link 
              href="/game"
              className="bg-gradient-to-r from-red-800 via-red-700 to-red-800 hover:from-red-700 hover:via-red-600 hover:to-red-700 text-red-100 font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-xl shadow-red-900/50 border border-red-600/50 hover:shadow-2xl hover:shadow-red-800/70"
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
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 via-red-900/20 to-black relative overflow-hidden">
      {/* Atmospheric Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(120,0,0,0.1)_0%,_transparent_70%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_rgba(120,0,0,0.15)_0%,_transparent_50%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_rgba(75,0,130,0.1)_0%,_transparent_50%)] pointer-events-none"></div>
      
      {/* Fog Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-800/5 to-gray-900/10 pointer-events-none"></div>
      
      {/* Header */}
      <header className="relative z-10">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 group">
                <div className="w-10 h-10 bg-gradient-to-br from-red-800 to-red-900 rounded-lg flex items-center justify-center shadow-lg shadow-red-900/50 border border-red-700/50 group-hover:shadow-red-800/70 transition-all duration-300">
                  <span className="text-red-100 font-bold text-xl drop-shadow-lg">T</span>
                </div>
                <h1 className="text-2xl font-bold text-red-100 drop-shadow-lg">Torre de los Pecados</h1>
              </Link>
              <div className="text-gray-400 font-medium">
                | {gameState.gameState === 'waiting' ? 'Esperando...' : 'Jugando'}
              </div>
            </div>
            <Link 
              href="/game"
              className="text-gray-400 hover:text-red-200 transition-colors font-medium"
            >
              ← Salir del juego
            </Link>
          </div>
        </nav>
      </header>

            {/* Game Board */}
      <div className="container mx-auto px-6 py-8 relative z-10">
        {gameState.gameState === 'waiting' ? (
          <div className="text-center">
            <h2 className="text-4xl font-bold text-red-100 mb-8 drop-shadow-lg">Esperando inicio del juego...</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-8">
              {gameState.players.map((player) => (
                <div key={player.id} className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 p-6 rounded-lg border border-gray-700/50 backdrop-blur-sm shadow-xl shadow-black/50 hover:shadow-2xl hover:shadow-red-900/20 transition-all duration-300">
                  <div className="flex items-center justify-center mb-4">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${getDeckColor(player.deckType)} flex items-center justify-center text-2xl shadow-lg shadow-black/50 border border-gray-600/30`}>
                      {getDeckIcon(player.deckType)}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-red-100 mb-2 drop-shadow-md">{player.name}</h3>
                  <p className="text-gray-400 mb-2 font-medium">Mazo: {player.deckType}</p>
                  <div className="flex items-center justify-center">
                    {player.isReady ? (
                      <span className="text-green-300 font-semibold drop-shadow-md">✓ Listo</span>
                    ) : (
                      <span className="text-yellow-300 font-semibold drop-shadow-md">⏳ Esperando...</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
             
             {/* Botón de inicio manual */}
             <div className="max-w-md mx-auto">
               <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/40 p-4 rounded-lg mb-4 border border-gray-700/50 backdrop-blur-sm shadow-lg shadow-black/30">
                 <p className="text-gray-300 text-sm mb-2 font-medium">
                   {autoStartCountdown > 0 ? (
                     <span>El juego iniciará automáticamente en <span className="font-bold text-red-300 drop-shadow-md">{autoStartCountdown}</span> segundos...</span>
                   ) : (
                     <span>Iniciando juego...</span>
                   )}
                 </p>
                 <div className="w-full bg-gray-800 rounded-full h-2 border border-gray-700/50">
                   <div 
                     className="bg-gradient-to-r from-red-600 via-purple-600 to-red-700 h-2 rounded-full transition-all duration-1000 shadow-lg shadow-red-900/50"
                     style={{ width: `${((3 - autoStartCountdown) / 3) * 100}%` }}
                   ></div>
                 </div>
               </div>
               
               <button
                 onClick={startGame}
                 className="bg-gradient-to-r from-red-800 via-red-700 to-red-800 hover:from-red-700 hover:via-red-600 hover:to-red-700 text-red-100 font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 shadow-xl shadow-red-900/50 border border-red-600/50 hover:shadow-2xl hover:shadow-red-800/70 hover:border-red-500/70"
               >
                 🎮 Iniciar Juego Ahora
               </button>
               <p className="text-gray-400 text-sm mt-4 font-medium">
                 O puedes hacer clic aquí para comenzar inmediatamente.
               </p>
             </div>
           </div>
                 ) : (
           <div className="space-y-8">
             {/* Rivals Section */}
             <div className="grid md:grid-cols-3 gap-6">
               {gameState.players.filter(p => p.isBot).map((player, index) => (
                 <div key={player.id} className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 p-6 rounded-lg border border-gray-700/50 backdrop-blur-sm shadow-xl shadow-black/50 hover:shadow-2xl hover:shadow-red-900/20 hover:border-red-700/50 transition-all duration-300">
                   <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center space-x-3">
                       <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getDeckColor(player.deckType)} flex items-center justify-center text-xl shadow-lg shadow-black/50 border border-gray-600/30`}>
                         {getDeckIcon(player.deckType)}
                       </div>
                       <div>
                         <h3 className="text-lg font-bold text-red-100 drop-shadow-md">{player.name}</h3>
                         <p className="text-sm text-gray-400 capitalize font-medium">{player.deckType.replace('_', ' ')}</p>
                       </div>
                     </div>
                     <div className="text-right">
                       <div className="text-sm text-gray-400 mb-1 font-medium">
                         <span className="font-semibold text-red-200">Fase:</span> {player.currentPhase === 'hand' ? '✋ Mano' : player.currentPhase === 'faceUp' ? '📋 Boca Arriba' : '🃏 Boca Abajo'}
                       </div>
                       <div className="text-xs text-gray-500">
                         <span className="text-blue-300">Mano: {player.hand}</span> | 
                         <span className="text-green-300"> Arriba: {player.faceUpCreatures}</span> | 
                         <span className="text-red-300"> Abajo: {player.faceDownCreatures}</span>
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
                           <div key={i} className="w-8 h-12 bg-blue-600 rounded border-2 border-blue-400 shadow-md flex items-center justify-center">
                             <span className="text-xs text-white">🃏</span>
                           </div>
                         ))}
                       </div>
                     </div>
                     
                     {/* Face Up Creatures */}
                     <div>
                       <div className="text-xs text-green-400 mb-1">📋 Boca Arriba ({player.faceUpCreatures})</div>
                       <div className="flex space-x-1">
                         {Array.from({ length: player.faceUpCreatures }, (_, i) => (
                           <div key={i} className="w-8 h-12 bg-green-600 rounded border-2 border-green-400 shadow-md flex items-center justify-center">
                             <span className="text-xs text-white">📋</span>
                           </div>
                         ))}
                       </div>
                     </div>
                     
                     {/* Face Down Creatures */}
                     <div>
                       <div className="text-xs text-red-400 mb-1">🃏 Boca Abajo ({player.faceDownCreatures})</div>
                       <div className="flex space-x-1">
                         {Array.from({ length: player.faceDownCreatures }, (_, i) => {
                           const cardBackPath = getCardBackImagePath(player.deckType)
                           return (
                             <div key={i} className="w-8 h-12 relative rounded border-2 border-red-400 shadow-md overflow-hidden">
                               <Image
                                 src={cardBackPath}
                                 alt="Carta boca abajo"
                                 fill
                                 className="object-cover"
                                 sizes="32px"
                               />
                             </div>
                           )
                         })}
                       </div>
                     </div>
                   </div>
                 </div>
               ))}
             </div>

                         {/* Tower of Sins - Initial Card */}
             <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 p-8 rounded-lg border border-gray-700/50 backdrop-blur-sm shadow-xl shadow-black/50 text-center">
               <h3 className="text-3xl font-bold text-red-100 mb-6 drop-shadow-lg">🏰 Torre de los Pecados</h3>
               
               {gameState.towerOfSins.lastCard ? (
                 <div className="max-w-lg mx-auto">
                   <div className="bg-gradient-to-br from-red-900/80 via-red-800/60 to-purple-900/40 p-6 rounded-lg mb-6 border border-red-700/50 shadow-xl shadow-red-900/30">
                     <h4 className="text-xl font-bold text-red-100 mb-4 drop-shadow-md">🎴 Carta Inicial</h4>
                     <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-6 shadow-xl shadow-black/30 border border-gray-300/50">
                       <div className="flex items-center justify-center mb-4">
                         <div className="w-24 h-32 relative">
                           <Image
                             src={gameState.towerOfSins.lastCard.image || '/images/cards/backs/card_back_default.png'}
                             alt={gameState.towerOfSins.lastCard.name}
                             fill
                             className="object-cover rounded shadow-lg"
                             sizes="96px"
                           />
                         </div>
                       </div>
                       <div className="font-bold text-gray-800 text-lg mb-2 drop-shadow-sm">{gameState.towerOfSins.lastCard.name}</div>
                       <div className="text-sm text-gray-600 mb-1">Valor: <span className="font-semibold text-red-700">{gameState.towerOfSins.lastCard.value}</span></div>
                       <div className="text-sm text-gray-600 mb-3">Tipo: <span className="font-semibold capitalize text-purple-700">{gameState.towerOfSins.lastCard.type}</span></div>
                       <div className="text-xs text-gray-500 italic">{gameState.towerOfSins.lastCard.description}</div>
                     </div>
                   </div>
                   <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/40 p-4 rounded-lg border border-gray-700/50 backdrop-blur-sm shadow-lg shadow-black/30">
                     <p className="text-gray-300 text-sm font-medium">
                       <span className="font-semibold text-red-300 drop-shadow-md">📋 Regla del juego:</span><br/>
                       Los jugadores deben jugar cartas de valor <span className="font-bold text-green-300 drop-shadow-md">igual o mayor</span> a esta carta.
                     </p>
                   </div>
                 </div>
               ) : (
                 <div className="text-gray-400">
                   <div className="text-6xl mb-4 drop-shadow-lg">🏰</div>
                   <p className="text-lg mb-2 font-medium">No hay cartas en la torre aún.</p>
                   <p className="font-medium">El primer jugador puede jugar cualquier carta.</p>
                 </div>
               )}
             </div>

                         {/* Current Player Info */}
             <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 p-6 rounded-lg border border-gray-700/50 backdrop-blur-sm shadow-xl shadow-black/50">
               <div className="flex items-center justify-between mb-6">
                 <h3 className="text-xl font-bold text-red-100 drop-shadow-md">🎮 Tu Turno</h3>
                 <div className="flex items-center space-x-3">
                   <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getDeckColor(gameState.players.find(p => !p.isBot)?.deckType || '')} flex items-center justify-center text-lg shadow-lg shadow-black/50 border border-gray-600/30`}>
                     {getDeckIcon(gameState.players.find(p => !p.isBot)?.deckType || '')}
                   </div>
                   <div className="text-right">
                     <div className="text-sm text-red-100 font-medium">{gameState.players.find(p => !p.isBot)?.name}</div>
                     <div className="text-xs text-gray-400 capitalize font-medium">{gameState.players.find(p => !p.isBot)?.deckType?.replace('_', ' ')}</div>
                   </div>
                 </div>
               </div>
               
               <div className="grid md:grid-cols-2 gap-6">
                 <div>
                   <h4 className="text-lg font-bold text-red-100 mb-4 drop-shadow-md">📊 Tu Estado</h4>
                   <div className="space-y-3 text-gray-300 font-medium">
                     <div className="flex justify-between items-center">
                       <span>Fase actual:</span>
                       <span className="font-semibold text-red-300 drop-shadow-md">
                         {gameState.players.find(p => !p.isBot)?.currentPhase === 'hand' ? '✋ Mano' : 
                          gameState.players.find(p => !p.isBot)?.currentPhase === 'faceUp' ? '📋 Boca Arriba' : '🃏 Boca Abajo'}
                       </span>
                     </div>
                     <div className="flex justify-between items-center">
                       <span>Cartas en mano:</span>
                       <span className="font-semibold text-blue-300 drop-shadow-md">{gameState.players.find(p => !p.isBot)?.hand}</span>
                     </div>
                     <div className="flex justify-between items-center">
                       <span>Criaturas boca arriba:</span>
                       <span className="font-semibold text-green-300 drop-shadow-md">{gameState.players.find(p => !p.isBot)?.faceUpCreatures}</span>
                     </div>
                     <div className="flex justify-between items-center">
                       <span>Criaturas boca abajo:</span>
                       <span className="font-semibold text-red-300 drop-shadow-md">{gameState.players.find(p => !p.isBot)?.faceDownCreatures}</span>
                     </div>
                     <div className="flex justify-between items-center">
                       <span>Pozo de almas:</span>
                       <span className="font-semibold text-yellow-300 drop-shadow-md">{gameState.players.find(p => !p.isBot)?.soulWell}</span>
                     </div>
                   </div>
                 </div>
                 
                 <div>
                   <h4 className="text-lg font-bold text-red-100 mb-4 drop-shadow-md">⚡ Acciones Disponibles</h4>
                   <div className="space-y-3">
                     <button className="w-full bg-gradient-to-r from-red-800 via-red-700 to-red-800 hover:from-red-700 hover:via-red-600 hover:to-red-700 text-red-100 font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-xl shadow-red-900/50 border border-red-600/50 hover:shadow-2xl hover:shadow-red-800/70 hover:border-red-500/70">
                       🏰 Tomar Torre
                     </button>
                     <div className="text-xs text-gray-400 text-center mt-4 font-medium">
                       <p>💡 Consejo: Juega cartas de valor igual o mayor a la carta de la torre</p>
                       <p>🎴 Selecciona una carta específica para jugarla</p>
                     </div>
                   </div>
                 </div>
               </div>
             </div>

             {/* Player Cards - All Phases */}
             <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 p-6 rounded-lg border border-gray-700/50 backdrop-blur-sm shadow-xl shadow-black/50">
               <h3 className="text-xl font-bold text-red-100 mb-6 drop-shadow-lg">🃏 Tus Cartas</h3>
               
               <div className="grid md:grid-cols-3 gap-6">
                 {/* Fase 1: Mano */}
                 <div className={`p-4 rounded-lg border transition-all duration-300 ${
                   gameState.players.find(p => !p.isBot)?.currentPhase === 'hand' 
                     ? 'bg-gradient-to-br from-blue-900/60 to-blue-800/40 border-blue-400/70 shadow-xl shadow-blue-900/30' 
                     : 'bg-gradient-to-br from-blue-900/40 to-blue-800/20 border-blue-500/50'
                 }`}>
                   <div className="flex items-center justify-between mb-4">
                     <h4 className="text-lg font-bold text-blue-200 drop-shadow-md">✋ Fase 1: Mano</h4>
                     <span className={`text-sm font-semibold px-2 py-1 rounded ${
                       gameState.players.find(p => !p.isBot)?.currentPhase === 'hand' 
                         ? 'bg-blue-600 text-white animate-pulse shadow-lg shadow-blue-900/50' 
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
                             {card.imagePath ? (
                               <div className="w-12 h-16 relative">
                                 <Image
                                   src={card.imagePath}
                                   alt={card.name}
                                   fill
                                   className="object-cover rounded"
                                   sizes="48px"
                                 />
                               </div>
                             ) : (
                               <div className="w-12 h-16 bg-gradient-to-br from-gray-300 to-gray-500 rounded flex items-center justify-center">
                                 <span className="text-2xl">{card.isSpecial ? '⭐' : '🃏'}</span>
                               </div>
                             )}
                             <div className="text-right flex-1 ml-3">
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
                   
                   <div className="mt-4 text-xs text-blue-200 font-medium">
                     <p>💡 Robas una carta después de jugar</p>
                     <p>🎯 Fase activa: {gameState.players.find(p => !p.isBot)?.currentPhase === 'hand' ? 'SÍ' : 'NO'}</p>
                   </div>
                 </div>

                 {/* Fase 2: Boca Arriba */}
                 <div className={`p-4 rounded-lg border transition-all duration-300 ${
                   gameState.players.find(p => !p.isBot)?.currentPhase === 'faceUp' 
                     ? 'bg-gradient-to-br from-green-900/60 to-green-800/40 border-green-400/70 shadow-xl shadow-green-900/30' 
                     : 'bg-gradient-to-br from-green-900/40 to-green-800/20 border-green-500/50'
                 }`}>
                   <div className="flex items-center justify-between mb-4">
                     <h4 className="text-lg font-bold text-green-200 drop-shadow-md">📋 Fase 2: Boca Arriba</h4>
                     <span className={`text-sm font-semibold px-2 py-1 rounded ${
                       gameState.players.find(p => !p.isBot)?.currentPhase === 'faceUp' 
                         ? 'bg-green-600 text-white animate-pulse shadow-lg shadow-green-900/50' 
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
                             {card.imagePath ? (
                               <div className="w-12 h-16 relative">
                                 <Image
                                   src={card.imagePath}
                                   alt={card.name}
                                   fill
                                   className="object-cover rounded"
                                   sizes="48px"
                                 />
                               </div>
                             ) : (
                               <div className="w-12 h-16 bg-gradient-to-br from-gray-300 to-gray-500 rounded flex items-center justify-center">
                                 <span className="text-2xl">{card.isSpecial ? '⭐' : '📋'}</span>
                               </div>
                             )}
                             <div className="text-right flex-1 ml-3">
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
                   
                   <div className="mt-4 text-xs text-green-200 font-medium">
                     <p>⚠️ No puedes robar del Pozo de Almas</p>
                     <p>🎯 Fase activa: {gameState.players.find(p => !p.isBot)?.currentPhase === 'faceUp' ? 'SÍ' : 'NO'}</p>
                   </div>
                 </div>

                 {/* Fase 3: Boca Abajo */}
                 <div className={`p-4 rounded-lg border transition-all duration-300 ${
                   gameState.players.find(p => !p.isBot)?.currentPhase === 'faceDown' 
                     ? 'bg-gradient-to-br from-red-900/60 to-red-800/40 border-red-400/70 shadow-xl shadow-red-900/30' 
                     : 'bg-gradient-to-br from-red-900/40 to-red-800/20 border-red-500/50'
                 }`}>
                   <div className="flex items-center justify-between mb-4">
                     <h4 className="text-lg font-bold text-red-200 drop-shadow-md">🃏 Fase 3: Boca Abajo</h4>
                     <span className={`text-sm font-semibold px-2 py-1 rounded ${
                       gameState.players.find(p => !p.isBot)?.currentPhase === 'faceDown' 
                         ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-900/50' 
                         : 'text-red-400'
                     }`}>
                       {gameState.players.find(p => !p.isBot)?.currentPhase === 'faceDown' ? '🎯 ACTIVA' : ''}
                     </span>
                   </div>
                   
                   <div className="space-y-3">
                     {Array.from({ length: gameState.players.find(p => !p.isBot)?.faceDownCreatures || 0 }, (_, i) => {
                       const cardBackPath = getCardBackImagePath(gameState.players.find(p => !p.isBot)?.deckType || 'dark_elves')
                       return (
                         <div key={i} className="bg-gray-800 rounded-lg p-3 shadow-md hover:shadow-lg transition-shadow cursor-pointer border-2 border-gray-600">
                           <div className="flex items-center justify-between">
                             <div className="w-12 h-16 relative">
                               <Image
                                 src={cardBackPath}
                                 alt="Carta boca abajo"
                                 fill
                                 className="object-cover rounded"
                                 sizes="48px"
                               />
                             </div>
                             <div className="text-right flex-1 ml-3">
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
                       )
                     })}
                     
                     {gameState.players.find(p => !p.isBot)?.faceDownCreatures === 0 && (
                       <div className="text-center text-gray-400 py-4">
                         <div className="text-2xl mb-2">🃏</div>
                         <p className="text-sm">Sin criaturas boca abajo</p>
                       </div>
                     )}
                   </div>
                   
                   <div className="mt-4 text-xs text-red-200 font-medium">
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
