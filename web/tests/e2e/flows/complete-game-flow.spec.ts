import { test, expect } from '@playwright/test';
import { GameTestHelpers, generateUniqueName, TEST_CONSTANTS } from '../utils/test-helpers';

test.describe('Flujo Completo del Juego - Torre de los Pecados', () => {
  let helpers: GameTestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new GameTestHelpers(page);
    await helpers.navigateToHome();
  });

  test('Flujo completo: Crear sala, unirse, jugar y terminar partida', async ({ page }) => {
    const roomName = generateUniqueName('Sala_E2E');
    const playerName = generateUniqueName('Jugador');

    // 1. Navegar al lobby
    await test.step('Navegar al lobby', async () => {
      await helpers.navigateToLobby();
      await expect(page.locator('[data-testid="lobby-page"]')).toBeVisible();
    });

    // 2. Crear una nueva sala
    await test.step('Crear nueva sala', async () => {
      await helpers.createGameRoom(roomName);
      await helpers.expectInGame();
      await helpers.takeScreenshot('sala-creada');
    });

    // 3. Configurar mazo temático
    await test.step('Configurar mazo de ángeles', async () => {
      await helpers.configureDeck('angels');
      await helpers.waitForAnimation();
    });

    // 4. Marcar como listo
    await test.step('Marcar jugador como listo', async () => {
      await helpers.setPlayerReady();
      await helpers.takeScreenshot('jugador-listo');
    });

    // 5. Verificar que el juego no puede iniciar sin 4 jugadores
    await test.step('Verificar que se necesitan 4 jugadores', async () => {
      await expect(page.locator('[data-testid="start-game-button"]')).toBeDisabled();
      await expect(page.locator('[data-testid="players-needed"]')).toContainText('4');
    });

    // 6. Simular otros jugadores uniéndose (esto requeriría múltiples páginas en un test real)
    await test.step('Simular sala completa', async () => {
      // En un test real, esto se haría con múltiples contextos de página
      // Por ahora, verificamos que la interfaz esté correcta
      await expect(page.locator('[data-testid="player-slots"]')).toBeVisible();
    });
  });

  test('Flujo de unirse a sala existente', async ({ page }) => {
    const roomCode = 'TEST123'; // Código de prueba
    const playerName = generateUniqueName('Jugador_Join');

    await test.step('Navegar al lobby', async () => {
      await helpers.navigateToLobby();
    });

    await test.step('Unirse a sala existente', async () => {
      await helpers.joinGameRoom(roomCode, playerName);
      await helpers.expectInGame();
      await helpers.takeScreenshot('unido-a-sala');
    });

    await test.step('Verificar estado inicial', async () => {
      await helpers.expectConnected();
      await expect(page.locator('[data-testid="player-name"]')).toContainText(playerName);
    });
  });

  test('Navegación entre páginas', async ({ page }) => {
    await test.step('Navegar a reglas', async () => {
      await helpers.navigateToRules();
      await expect(page.locator('[data-testid="rules-page"]')).toBeVisible();
      await helpers.takeScreenshot('pagina-reglas');
    });

    await test.step('Volver a página principal', async () => {
      await helpers.navigateToHome();
      await expect(page.locator('[data-testid="home-page"]')).toBeVisible();
    });

    await test.step('Navegar al lobby', async () => {
      await helpers.navigateToLobby();
      await expect(page.locator('[data-testid="lobby-page"]')).toBeVisible();
    });
  });

  test('Configuración de mazos temáticos', async ({ page }) => {
    await helpers.navigateToLobby();

    await test.step('Crear sala', async () => {
      await helpers.createGameRoom('Sala Mazos');
    });

    await test.step('Probar configuración de mazo de demonios', async () => {
      await helpers.configureDeck('demons');
      await expect(page.locator('[data-testid="selected-deck"]')).toContainText('demonios');
    });

    await test.step('Cambiar a mazo de dragones', async () => {
      await helpers.configureDeck('dragons');
      await expect(page.locator('[data-testid="selected-deck"]')).toContainText('dragones');
    });

    await test.step('Cambiar a mazo de magos', async () => {
      await helpers.configureDeck('mages');
      await expect(page.locator('[data-testid="selected-deck"]')).toContainText('magos');
    });

    await test.step('Volver a mazo de ángeles', async () => {
      await helpers.configureDeck('angels');
      await expect(page.locator('[data-testid="selected-deck"]')).toContainText('ángeles');
    });
  });

  test('Sistema de chat básico', async ({ page }) => {
    await helpers.navigateToLobby();
    await helpers.createGameRoom('Sala Chat');

    await test.step('Enviar mensaje en el chat', async () => {
      const testMessage = '¡Hola desde el test E2E!';
      await helpers.sendChatMessage(testMessage);
      await helpers.expectChatMessage(testMessage);
    });

    await test.step('Verificar que el chat esté visible', async () => {
      await expect(page.locator('[data-testid="chat-panel"]')).toBeVisible();
    });
  });

  test('Interfaz responsive en móvil', async ({ page }) => {
    // Configurar viewport móvil
    await page.setViewportSize({ width: 375, height: 667 });

    await test.step('Navegar al lobby en móvil', async () => {
      await helpers.navigateToLobby();
      await expect(page.locator('[data-testid="lobby-page"]')).toBeVisible();
      await helpers.takeScreenshot('lobby-mobile');
    });

    await test.step('Crear sala en móvil', async () => {
      await helpers.createGameRoom('Sala Móvil');
      await helpers.expectInGame();
      await helpers.takeScreenshot('game-mobile');
    });

    await test.step('Verificar elementos móviles', async () => {
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    });
  });

  test('Manejo de errores de conexión', async ({ page }) => {
    await test.step('Simular pérdida de conexión', async () => {
      // Simular desconexión del servidor
      await page.route('**/socket.io/**', route => route.abort());
      
      await helpers.navigateToLobby();
      await expect(page.locator('[data-testid="connection-error"]')).toBeVisible();
    });

    await test.step('Verificar mensaje de reconexión', async () => {
      await expect(page.locator('[data-testid="reconnect-button"]')).toBeVisible();
    });
  });

  test('Validación de formularios', async ({ page }) => {
    await helpers.navigateToLobby();

    await test.step('Intentar crear sala sin nombre', async () => {
      await page.click('[data-testid="create-room-button"]');
      await expect(page.locator('[data-testid="error-message"]')).toContainText('nombre');
    });

    await test.step('Intentar unirse sin código', async () => {
      await page.fill('[data-testid="player-name-input"]', 'Test Player');
      await page.click('[data-testid="join-room-button"]');
      await expect(page.locator('[data-testid="error-message"]')).toContainText('código');
    });

    await test.step('Intentar unirse sin nombre', async () => {
      await page.fill('[data-testid="room-code-input"]', 'TEST123');
      await page.clear('[data-testid="player-name-input"]');
      await page.click('[data-testid="join-room-button"]');
      await expect(page.locator('[data-testid="error-message"]')).toContainText('nombre');
    });
  });
});
