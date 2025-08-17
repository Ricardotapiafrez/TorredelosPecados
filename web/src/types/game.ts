export interface GameConfig {
  gameType: 'human' | 'bot'
  deck: string
  room: string
  username: string
  botCount?: number
  botDifficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  maxPlayers?: number
}

export interface Room {
  name: string
  players: number
  maxPlayers: number
  isPrivate: boolean
  gameType: 'multiplayer' | 'bot'
}

export interface Deck {
  id: string
  name: string
  color: string
  icon: string
  description?: string
}

export interface GameType {
  id: 'multiplayer' | 'bot'
  name: string
  description: string
  icon: string
}
