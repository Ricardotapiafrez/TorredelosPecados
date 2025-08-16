import { test, expect } from '@playwright/test';
import { GameTestHelpers, generateUniqueName } from '../utils/test-helpers';

test.describe('Componente GameBoard - Torre de los Pecados', () => {
  let helpers: GameTestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new GameTestHelpers(page);
    await helpers.navigateToLobby();
    await helpers.createGameRoom('Sala GameBoard Test');
  });

  test('Visualización correcta del tablero de juego', async ({ page }) => {
    await test.step('Verificar elementos principales del tablero', async () => {
      // Verificar que el tablero esté visible
      await expect(page.locator('[data-testid="game-board"]')).toBeVisible();
      
      // Verificar áreas de juego
      await expect(page.locator('[data-testid="hand-zone"]')).toBeVisible();
      await expect(page.locator('[data-testid="face-up-zone"]')).toBeVisible();
      await expect(page.locator('[data-testid="face-down-zone"]')).toBeVisible();
      await expect(page.locator('[data-testid="tower-zone"]')).toBeVisible();
      
      // Verificar área de jugadores
      await expect(page.locator('[data-testid="players-area"]')).toBeVisible();
      
      // Verificar controles de juego
      await expect(page.locator('[data-testid="draw-card-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="ready-button"]')).toBeVisible();
    });

    await test.step('Verificar información del juego', async () => {
      await expect(page.locator('[data-testid="game-phase"]')).toBeVisible();
      await expect(page.locator('[data-testid="current-player"]')).toBeVisible();
      await expect(page.locator('[data-testid="turn-indicator"]')).toBeVisible();
    });
  });

  test('Interacción con cartas en mano', async ({ page }) => {
    await test.step('Verificar que las cartas en mano son interactivas', async () => {
      // Esperar a que se carguen las cartas (esto dependería de la implementación)
      await page.waitForSelector('[data-testid="hand-card-0"]', { timeout: 10000 });
      
      // Verificar que las cartas son clickeables
      const firstCard = page.locator('[data-testid="hand-card-0"]');
      await expect(firstCard).toBeVisible();
      
      // Verificar que las cartas tienen información visible
      await expect(firstCard.locator('[data-testid="card-value"]')).toBeVisible();
      await expect(firstCard.locator('[data-testid="card-suit"]')).toBeVisible();
    });

    await test.step('Verificar hover effects en cartas', async () => {
      const firstCard = page.locator('[data-testid="hand-card-0"]');
      
      // Hacer hover sobre la carta
      await firstCard.hover();
      
      // Verificar que aparece información adicional
      await expect(page.locator('[data-testid="card-tooltip"]')).toBeVisible();
    });

    await test.step('Verificar selección de cartas', async () => {
      const firstCard = page.locator('[data-testid="hand-card-0"]');
      
      // Hacer click en la carta
      await firstCard.click();
      
      // Verificar que la carta se marca como seleccionada
      await expect(firstCard).toHaveClass(/selected/);
    });
  });

  test('Drag and drop de cartas', async ({ page }) => {
    await test.step('Verificar que las cartas son arrastrables', async () => {
      await page.waitForSelector('[data-testid="hand-card-0"]', { timeout: 10000 });
      
      const firstCard = page.locator('[data-testid="hand-card-0"]');
      const faceUpZone = page.locator('[data-testid="face-up-zone"]');
      
      // Verificar que la carta es arrastrable
      await expect(firstCard).toHaveAttribute('draggable', 'true');
      
      // Verificar que la zona de destino acepta drops
      await expect(faceUpZone).toHaveAttribute('data-drop-zone', 'true');
    });

    await test.step('Probar drag and drop a zona boca arriba', async () => {
      await page.waitForSelector('[data-testid="hand-card-0"]', { timeout: 10000 });
      
      await helpers.dragCardToZone(0, 'face-up');
      await helpers.waitForAnimation();
      
      // Verificar que la carta aparece en la zona boca arriba
      await expect(page.locator('[data-testid="face-up-zone"] [data-testid="played-card"]')).toBeVisible();
    });

    await test.step('Probar drag and drop a zona boca abajo', async () => {
      await page.waitForSelector('[data-testid="hand-card-1"]', { timeout: 10000 });
      
      await helpers.dragCardToZone(1, 'face-down');
      await helpers.waitForAnimation();
      
      // Verificar que la carta aparece en la zona boca abajo
      await expect(page.locator('[data-testid="face-down-zone"] [data-testid="played-card"]')).toBeVisible();
    });

    await test.step('Probar drag and drop a torre de pecados', async () => {
      await page.waitForSelector('[data-testid="hand-card-2"]', { timeout: 10000 });
      
      await helpers.dragCardToZone(2, 'tower');
      await helpers.waitForAnimation();
      
      // Verificar que la carta aparece en la torre
      await expect(page.locator('[data-testid="tower-zone"] [data-testid="tower-card"]')).toBeVisible();
    });
  });

  test('Validación visual de jugadas', async ({ page }) => {
    await test.step('Verificar indicadores de cartas jugables', async () => {
      await page.waitForSelector('[data-testid="hand-card-0"]', { timeout: 10000 });
      
      // Verificar que las cartas jugables tienen indicador visual
      const playableCards = page.locator('[data-testid="hand-card"].playable');
      await expect(playableCards).toBeVisible();
    });

    await test.step('Verificar feedback de jugadas inválidas', async () => {
      // Intentar jugar una carta inválida
      await page.waitForSelector('[data-testid="hand-card-0"]', { timeout: 10000 });
      
      const invalidCard = page.locator('[data-testid="hand-card"].invalid');
      if (await invalidCard.count() > 0) {
        await invalidCard.first().click();
        
        // Verificar que aparece mensaje de error
        await expect(page.locator('[data-testid="invalid-play-message"]')).toBeVisible();
      }
    });

    await test.step('Verificar feedback de jugadas válidas', async () => {
      await page.waitForSelector('[data-testid="hand-card-0"]', { timeout: 10000 });
      
      const validCard = page.locator('[data-testid="hand-card"].valid');
      if (await validCard.count() > 0) {
        await validCard.first().click();
        
        // Verificar que aparece feedback positivo
        await expect(page.locator('[data-testid="valid-play-feedback"]')).toBeVisible();
      }
    });
  });

  test('Visualización de la Torre de los Pecados', async ({ page }) => {
    await test.step('Verificar estructura de la torre', async () => {
      const towerZone = page.locator('[data-testid="tower-zone"]');
      await expect(towerZone).toBeVisible();
      
      // Verificar niveles de la torre
      await expect(page.locator('[data-testid="tower-level-1"]')).toBeVisible();
      await expect(page.locator('[data-testid="tower-level-2"]')).toBeVisible();
      await expect(page.locator('[data-testid="tower-level-3"]')).toBeVisible();
    });

    await test.step('Verificar efectos visuales de la torre', async () => {
      // Verificar que la torre tiene efectos visuales
      await expect(page.locator('[data-testid="tower-effects"]')).toBeVisible();
      
      // Verificar contador de cartas en la torre
      await expect(page.locator('[data-testid="tower-card-count"]')).toBeVisible();
    });
  });

  test('Información del estado del juego', async ({ page }) => {
    await test.step('Verificar información de la fase actual', async () => {
      const phaseIndicator = page.locator('[data-testid="game-phase"]');
      await expect(phaseIndicator).toBeVisible();
      
      // Verificar que muestra la fase correcta
      await expect(phaseIndicator).toContainText(/mano|boca arriba|boca abajo/i);
    });

    await test.step('Verificar información del jugador actual', async () => {
      const currentPlayer = page.locator('[data-testid="current-player"]');
      await expect(currentPlayer).toBeVisible();
      
      // Verificar que muestra el nombre del jugador
      await expect(currentPlayer).not.toBeEmpty();
    });

    await test.step('Verificar indicador de turno', async () => {
      const turnIndicator = page.locator('[data-testid="turn-indicator"]');
      await expect(turnIndicator).toBeVisible();
    });
  });

  test('Controles de juego', async ({ page }) => {
    await test.step('Verificar botón de robar carta', async () => {
      const drawButton = page.locator('[data-testid="draw-card-button"]');
      await expect(drawButton).toBeVisible();
      
      // Verificar que el botón es clickeable
      await expect(drawButton).toBeEnabled();
    });

    await test.step('Verificar botón de listo', async () => {
      const readyButton = page.locator('[data-testid="ready-button"]');
      await expect(readyButton).toBeVisible();
      
      // Hacer click en el botón de listo
      await readyButton.click();
      
      // Verificar que cambia de estado
      await expect(readyButton).toHaveClass(/ready/);
    });

    await test.step('Verificar botón de salir', async () => {
      const leaveButton = page.locator('[data-testid="leave-game-button"]');
      await expect(leaveButton).toBeVisible();
      
      // Verificar que el botón es clickeable
      await expect(leaveButton).toBeEnabled();
    });
  });

  test('Responsive design del tablero', async ({ page }) => {
    await test.step('Verificar layout en desktop', async () => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await helpers.takeScreenshot('game-board-desktop');
      
      // Verificar que todos los elementos están visibles
      await expect(page.locator('[data-testid="game-board"]')).toBeVisible();
    });

    await test.step('Verificar layout en tablet', async () => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await helpers.takeScreenshot('game-board-tablet');
      
      // Verificar que el layout se adapta
      await expect(page.locator('[data-testid="game-board"]')).toBeVisible();
    });

    await test.step('Verificar layout en móvil', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      await helpers.takeScreenshot('game-board-mobile');
      
      // Verificar que el layout se adapta
      await expect(page.locator('[data-testid="game-board"]')).toBeVisible();
      
      // Verificar que aparecen controles móviles
      await expect(page.locator('[data-testid="mobile-controls"]')).toBeVisible();
    });
  });
});
