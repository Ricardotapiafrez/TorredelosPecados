import { Page, expect } from '@playwright/test';

/**
 * Utilidades para tests E2E del juego Torre de los Pecados
 */

export class GameTestHelpers {
  constructor(private page: Page) {}

  /**
   * Navega a la página principal
   */
  async navigateToHome() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navega al lobby
   */
  async navigateToLobby() {
    await this.page.goto('/lobby');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navega a las reglas
   */
  async navigateToRules() {
    await this.page.goto('/rules');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Crea una nueva sala de juego
   */
  async createGameRoom(roomName: string = 'Sala de Prueba') {
    await this.page.fill('[data-testid="room-name-input"]', roomName);
    await this.page.click('[data-testid="create-room-button"]');
    await this.page.waitForSelector('[data-testid="game-board"]', { timeout: 10000 });
  }

  /**
   * Se une a una sala existente
   */
  async joinGameRoom(roomCode: string, playerName: string = 'Jugador Test') {
    await this.page.fill('[data-testid="room-code-input"]', roomCode);
    await this.page.fill('[data-testid="player-name-input"]', playerName);
    await this.page.click('[data-testid="join-room-button"]');
    await this.page.waitForSelector('[data-testid="game-board"]', { timeout: 10000 });
  }

  /**
   * Configura el mazo temático
   */
  async configureDeck(deckType: 'angels' | 'demons' | 'dragons' | 'mages') {
    await this.page.click('[data-testid="deck-config-button"]');
    await this.page.click(`[data-testid="deck-${deckType}"]`);
    await this.page.click('[data-testid="save-deck-config"]');
  }

  /**
   * Marca al jugador como listo
   */
  async setPlayerReady() {
    await this.page.click('[data-testid="ready-button"]');
    await this.page.waitForSelector('[data-testid="ready-button"].ready', { timeout: 5000 });
  }

  /**
   * Juega una carta específica
   */
  async playCard(cardIndex: number) {
    const cardSelector = `[data-testid="hand-card-${cardIndex}"]`;
    await this.page.waitForSelector(cardSelector, { timeout: 5000 });
    await this.page.click(cardSelector);
  }

  /**
   * Arrastra una carta a una zona específica
   */
  async dragCardToZone(cardIndex: number, zoneType: 'face-up' | 'face-down' | 'tower') {
    const cardSelector = `[data-testid="hand-card-${cardIndex}"]`;
    const zoneSelector = `[data-testid="${zoneType}-zone"]`;
    
    await this.page.dragAndDrop(cardSelector, zoneSelector);
  }

  /**
   * Roba una carta
   */
  async drawCard() {
    await this.page.click('[data-testid="draw-card-button"]');
  }

  /**
   * Espera a que sea el turno del jugador
   */
  async waitForPlayerTurn() {
    await this.page.waitForSelector('[data-testid="player-turn-indicator"]', { timeout: 30000 });
  }

  /**
   * Verifica que el juego haya terminado
   */
  async waitForGameEnd() {
    await this.page.waitForSelector('[data-testid="game-end-modal"]', { timeout: 60000 });
  }

  /**
   * Envía un mensaje en el chat
   */
  async sendChatMessage(message: string) {
    await this.page.fill('[data-testid="chat-input"]', message);
    await this.page.press('[data-testid="chat-input"]', 'Enter');
  }

  /**
   * Verifica que un mensaje aparezca en el chat
   */
  async expectChatMessage(message: string) {
    await expect(this.page.locator('[data-testid="chat-message"]')).toContainText(message);
  }

  /**
   * Verifica el estado de conexión
   */
  async expectConnected() {
    await expect(this.page.locator('[data-testid="connection-status"]')).toHaveText(/conectado/i);
  }

  /**
   * Verifica que el jugador esté en el juego
   */
  async expectInGame() {
    await expect(this.page.locator('[data-testid="game-board"]')).toBeVisible();
  }

  /**
   * Verifica que el jugador tenga cartas en mano
   */
  async expectHasCardsInHand() {
    await expect(this.page.locator('[data-testid="hand-card-0"]')).toBeVisible();
  }

  /**
   * Verifica que el juego esté en una fase específica
   */
  async expectGamePhase(phase: 'hand' | 'face-up' | 'face-down') {
    await expect(this.page.locator('[data-testid="game-phase"]')).toHaveText(new RegExp(phase, 'i'));
  }

  /**
   * Verifica que el jugador haya ganado
   */
  async expectPlayerWon() {
    await expect(this.page.locator('[data-testid="game-end-modal"]')).toContainText(/ganador/i);
  }

  /**
   * Verifica que el jugador haya perdido
   */
  async expectPlayerLost() {
    await expect(this.page.locator('[data-testid="game-end-modal"]')).toContainText(/perdedor/i);
  }

  /**
   * Toma una captura de pantalla con nombre descriptivo
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `test-results/screenshots/${name}.png` });
  }

  /**
   * Espera un tiempo específico (útil para animaciones)
   */
  async waitForAnimation(ms: number = 1000) {
    await this.page.waitForTimeout(ms);
  }
}

/**
 * Genera nombres únicos para salas y jugadores
 */
export function generateUniqueName(prefix: string): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Genera códigos de sala únicos
 */
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Constantes para los tests
 */
export const TEST_CONSTANTS = {
  TIMEOUTS: {
    SHORT: 5000,
    MEDIUM: 10000,
    LONG: 30000,
    VERY_LONG: 60000
  },
  PLAYER_NAMES: {
    PLAYER_1: 'Jugador Test 1',
    PLAYER_2: 'Jugador Test 2',
    PLAYER_3: 'Jugador Test 3',
    PLAYER_4: 'Jugador Test 4'
  },
  ROOM_NAMES: {
    DEFAULT: 'Sala de Prueba E2E',
    QUICK_GAME: 'Partida Rápida',
    TOURNAMENT: 'Torneo Test'
  },
  DECK_TYPES: {
    ANGELS: 'angels',
    DEMONS: 'demons',
    DRAGONS: 'dragons',
    MAGES: 'mages'
  }
};
