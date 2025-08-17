import { Deck, GameType, Room } from '@/types/game'

export const decks: Deck[] = [
  { 
    id: 'angels', 
    name: 'Ángeles', 
    color: 'bg-blue-600', 
    icon: '👼',
    description: 'Mazo de luz y justicia divina'
  },
  { 
    id: 'demons', 
    name: 'Demonios', 
    color: 'bg-red-600', 
    icon: '👿',
    description: 'Mazo de oscuridad y poder infernal'
  },
  { 
    id: 'dragons', 
    name: 'Dragones', 
    color: 'bg-orange-600', 
    icon: '🐉',
    description: 'Mazo de criaturas legendarias'
  },
  { 
    id: 'mages', 
    name: 'Magos', 
    color: 'bg-purple-600', 
    icon: '🧙‍♂️',
    description: 'Mazo de magia arcana'
  },
  { 
    id: 'elves', 
    name: 'Elfos', 
    color: 'bg-green-600', 
    icon: '🧝‍♀️',
    description: 'Mazo de naturaleza y sabiduría'
  },
  { 
    id: 'dark_elves', 
    name: 'Elfos Oscuros', 
    color: 'bg-gray-800', 
    icon: '🧝‍♂️',
    description: 'Mazo de sombras y traición'
  },
  { 
    id: 'dwarves', 
    name: 'Enanos', 
    color: 'bg-yellow-600', 
    icon: '🧙‍♀️',
    description: 'Mazo de artesanía y resistencia'
  },
  { 
    id: 'orcs', 
    name: 'Orcos', 
    color: 'bg-red-800', 
    icon: '👹',
    description: 'Mazo de fuerza bruta y guerra'
  }
]

export const gameTypes: GameType[] = [
  { 
    id: 'human', 
    name: 'Multijugador', 
    description: 'Juega con otros jugadores en tiempo real', 
    icon: '👥' 
  },
  { 
    id: 'bot', 
    name: 'Contra Bots', 
    description: 'Juega contra la inteligencia artificial', 
    icon: '🤖' 
  }
]

export const botDifficulties = [
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

export const availableRooms: Room[] = [
  { name: 'Sala General', players: 2, maxPlayers: 4, isPrivate: false, gameType: 'human' },
  { name: 'Sala Pro', players: 1, maxPlayers: 2, isPrivate: false, gameType: 'human' },
  { name: 'Sala Casual', players: 3, maxPlayers: 4, isPrivate: false, gameType: 'human' },
  { name: 'Sala Torneo', players: 0, maxPlayers: 4, isPrivate: true, gameType: 'human' },
  { name: 'Sala Bot Fácil', players: 0, maxPlayers: 1, isPrivate: false, gameType: 'bot' },
  { name: 'Sala Bot Difícil', players: 0, maxPlayers: 1, isPrivate: false, gameType: 'bot' }
]
