export interface Card {
  id: number
  name: string
  type: 'criatura' | 'hechizo' | 'trampa'
  power: number
  value: number
  description: string
  image?: string
  deck?: 'angels' | 'demons' | 'dragons' | 'mages'
  isSpecial?: boolean
}

export interface Player {
  id: string
  name: string
  socketId: string
  hand: Card[]
  faceUpCreatures: Card[]
  faceDownCreatures: Card[]
  soulWell: Card[]
  currentPhase: 'hand' | 'faceUp' | 'faceDown'
  health: number
  hasShield: boolean
  isReady: boolean
  isAlive: boolean
  score: number
  isSinner: boolean
}

export interface GameState {
  roomId: string
  gameState: 'waiting' | 'playing' | 'finished'
  currentPlayerId: string | null
  players: Player[]
  discardPile: Card[]
  lastPlayedCard: Card | null
  nextPlayerCanPlayAnything: boolean
  skippedPlayer: string | null
  winner: Player | null
  sinner: Player | null
  turnTime: number
  deckType: string
}

export interface GameRoom {
  roomId: string
  maxPlayers: number
  currentPlayers: number
  gameState: 'waiting' | 'playing' | 'finished'
  createdAt: Date
  deckType: string
}

export interface GameStats {
  totalGames: number
  activeGames: number
  waitingGames: number
  finishedGames: number
  totalPlayers: number
  deckTypes: {
    angels: number
    demons: number
    dragons: number
    mages: number
  }
}

export interface GameRules {
  title: string
  description: string
  objective: string
  setup: {
    cardsPerPlayer: number
    faceUpCreatures: number
    faceDownCreatures: number
    soulWell: number
  }
  phases: Array<{
    name: string
    description: string
  }>
  specialCards: Array<{
    value: number
    name: string
    description: string
  }>
  rules: string[]
  victory: string
  defeat: string
}

export interface ThematicDeck {
  id: string
  name: string
  description: string
  theme: string
  strategy: string
  cards: Array<{
    id: number
    name: string
    value: number
    description: string
    isSpecial: boolean
  }>
}

export interface DeckInfo {
  available: ThematicDeck[]
}

export interface SocketEvents {
  // Cliente -> Servidor
  createRoom: (data: { playerName: string; maxPlayers?: number; deckType?: string }) => void
  joinRoom: (data: { roomId: string; playerName: string }) => void
  playCard: (data: { cardIndex: number; targetPlayerId?: string }) => void
  takeDiscardPile: () => void
  setPlayerReady: (data: { isReady: boolean }) => void
  startGame: () => void
  getPlayableCards: () => void

  // Servidor -> Cliente
  roomCreated: (data: { roomId: string; playerId: string; gameState: GameState }) => void
  roomJoined: (data: { roomId: string; playerId: string; gameState: GameState }) => void
  playerJoined: (data: { player: Player }) => void
  playerLeft: (data: { playerId: string; playerName: string }) => void
  gameStateUpdated: (gameState: GameState) => void
  gameStarted: (gameState: GameState) => void
  gameEnded: (data: { winner: Player | null; sinner: Player | null }) => void
  cardPlayed: (data: { playerId: string; card: Card; targetPlayerId?: string }) => void
  discardPileTaken: (data: { playerId: string; cardCount: number }) => void
  allPlayersReady: () => void
  playableCards: (data: { cards: Card[] }) => void
  error: (data: { message: string }) => void
}

export type GamePhase = 'hand' | 'faceUp' | 'faceDown'

export type DeckType = 'angels' | 'demons' | 'dragons' | 'mages'

export type CardType = 'criatura' | 'hechizo' | 'trampa'

export type GameStatus = 'waiting' | 'playing' | 'finished'
