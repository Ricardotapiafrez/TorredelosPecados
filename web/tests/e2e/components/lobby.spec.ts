import { test, expect } from '@playwright/test';
import { GameTestHelpers, generateUniqueName, generateRoomCode } from '../utils/test-helpers';

test.describe('Sistema de Lobby - Torre de los Pecados', () => {
  let helpers: GameTestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new GameTestHelpers(page);
    await helpers.navigateToLobby();
  });

  test('Creación de nueva sala', async ({ page }) => {
    const roomName = generateUniqueName('Sala_Creacion');

    await test.step('Verificar formulario de creación de sala', async () => {
      await expect(page.locator('[data-testid="create-room-form"]')).toBeVisible();
      await expect(page.locator('[data-testid="room-name-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="create-room-button"]')).toBeVisible();
    });

    await test.step('Crear sala con nombre válido', async () => {
      await page.fill('[data-testid="room-name-input"]', roomName);
      await page.click('[data-testid="create-room-button"]');
      
      // Verificar que se navega al juego
      await helpers.expectInGame();
      await helpers.takeScreenshot('sala-creada-exitosamente');
    });

    await test.step('Verificar información de la sala creada', async () => {
      await expect(page.locator('[data-testid="room-name"]')).toContainText(roomName);
      await expect(page.locator('[data-testid="room-code"]')).toBeVisible();
      await expect(page.locator('[data-testid="room-code"]')).not.toBeEmpty();
    });
  });

  test('Unirse a sala existente', async ({ page }) => {
    const roomCode = generateRoomCode();
    const playerName = generateUniqueName('Jugador_Join');

    await test.step('Verificar formulario de unión a sala', async () => {
      await expect(page.locator('[data-testid="join-room-form"]')).toBeVisible();
      await expect(page.locator('[data-testid="room-code-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="player-name-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="join-room-button"]')).toBeVisible();
    });

    await test.step('Unirse a sala con datos válidos', async () => {
      await page.fill('[data-testid="room-code-input"]', roomCode);
      await page.fill('[data-testid="player-name-input"]', playerName);
      await page.click('[data-testid="join-room-button"]');
      
      // Verificar que se navega al juego
      await helpers.expectInGame();
      await helpers.takeScreenshot('unido-a-sala-exitosamente');
    });

    await test.step('Verificar información del jugador', async () => {
      await expect(page.locator('[data-testid="player-name"]')).toContainText(playerName);
      await expect(page.locator('[data-testid="room-code"]')).toContainText(roomCode);
    });
  });

  test('Lista de salas públicas', async ({ page }) => {
    await test.step('Verificar lista de salas públicas', async () => {
      await expect(page.locator('[data-testid="public-rooms-list"]')).toBeVisible();
      await expect(page.locator('[data-testid="rooms-list-header"]')).toBeVisible();
    });

    await test.step('Verificar información de salas', async () => {
      const roomItems = page.locator('[data-testid="room-item"]');
      
      if (await roomItems.count() > 0) {
        // Verificar que cada sala tiene información básica
        await expect(roomItems.first().locator('[data-testid="room-name"]')).toBeVisible();
        await expect(roomItems.first().locator('[data-testid="room-code"]')).toBeVisible();
        await expect(roomItems.first().locator('[data-testid="players-count"]')).toBeVisible();
        await expect(roomItems.first().locator('[data-testid="room-status"]')).toBeVisible();
      }
    });

    await test.step('Unirse a sala desde la lista', async () => {
      const roomItems = page.locator('[data-testid="room-item"]');
      
      if (await roomItems.count() > 0) {
        const firstRoom = roomItems.first();
        const roomCode = await firstRoom.locator('[data-testid="room-code"]').textContent();
        
        await firstRoom.click();
        
        // Verificar que se abre el formulario de unión
        await expect(page.locator('[data-testid="join-room-form"]')).toBeVisible();
        await expect(page.locator('[data-testid="room-code-input"]')).toHaveValue(roomCode || '');
      }
    });
  });

  test('Configuración de mazos temáticos', async ({ page }) => {
    await test.step('Crear sala para probar configuración', async () => {
      await helpers.createGameRoom('Sala Configuración');
    });

    await test.step('Verificar panel de configuración de mazos', async () => {
      await page.click('[data-testid="deck-config-button"]');
      await expect(page.locator('[data-testid="deck-config-panel"]')).toBeVisible();
    });

    await test.step('Probar selección de mazo de ángeles', async () => {
      await page.click('[data-testid="deck-angels"]');
      await expect(page.locator('[data-testid="selected-deck"]')).toContainText('ángeles');
      await expect(page.locator('[data-testid="deck-angels"]')).toHaveClass(/selected/);
    });

    await test.step('Probar selección de mazo de demonios', async () => {
      await page.click('[data-testid="deck-demons"]');
      await expect(page.locator('[data-testid="selected-deck"]')).toContainText('demonios');
      await expect(page.locator('[data-testid="deck-demons"]')).toHaveClass(/selected/);
    });

    await test.step('Probar selección de mazo de dragones', async () => {
      await page.click('[data-testid="deck-dragons"]');
      await expect(page.locator('[data-testid="selected-deck"]')).toContainText('dragones');
      await expect(page.locator('[data-testid="deck-dragons"]')).toHaveClass(/selected/);
    });

    await test.step('Probar selección de mazo de magos', async () => {
      await page.click('[data-testid="deck-mages"]');
      await expect(page.locator('[data-testid="selected-deck"]')).toContainText('magos');
      await expect(page.locator('[data-testid="deck-mages"]')).toHaveClass(/selected/);
    });

    await test.step('Guardar configuración', async () => {
      await page.click('[data-testid="save-deck-config"]');
      await expect(page.locator('[data-testid="deck-config-panel"]')).not.toBeVisible();
    });
  });

  test('Sistema de invitaciones por código', async ({ page }) => {
    await test.step('Crear sala y obtener código', async () => {
      await helpers.createGameRoom('Sala Invitaciones');
      const roomCode = await page.locator('[data-testid="room-code"]').textContent();
      expect(roomCode).toBeTruthy();
    });

    await test.step('Verificar botón de copiar código', async () => {
      await expect(page.locator('[data-testid="copy-room-code"]')).toBeVisible();
      
      // Simular click en copiar código
      await page.click('[data-testid="copy-room-code"]');
      
      // Verificar que aparece confirmación
      await expect(page.locator('[data-testid="code-copied-message"]')).toBeVisible();
    });

    await test.step('Verificar botón de compartir código', async () => {
      await expect(page.locator('[data-testid="share-room-code"]')).toBeVisible();
    });
  });

  test('Gestión de jugadores en sala', async ({ page }) => {
    await test.step('Crear sala', async () => {
      await helpers.createGameRoom('Sala Jugadores');
    });

    await test.step('Verificar área de jugadores', async () => {
      await expect(page.locator('[data-testid="players-area"]')).toBeVisible();
      await expect(page.locator('[data-testid="player-slots"]')).toBeVisible();
    });

    await test.step('Verificar slots de jugadores', async () => {
      const playerSlots = page.locator('[data-testid="player-slot"]');
      await expect(playerSlots).toHaveCount(4);
      
      // Verificar que el primer slot está ocupado por el creador
      await expect(playerSlots.first().locator('[data-testid="player-name"]')).toBeVisible();
      await expect(playerSlots.first()).toHaveClass(/occupied/);
      
      // Verificar que los otros slots están vacíos
      for (let i = 1; i < 4; i++) {
        await expect(playerSlots.nth(i)).toHaveClass(/empty/);
      }
    });

    await test.step('Verificar información del jugador', async () => {
      const playerSlot = page.locator('[data-testid="player-slot"]').first();
      await expect(playerSlot.locator('[data-testid="player-name"]')).toBeVisible();
      await expect(playerSlot.locator('[data-testid="player-status"]')).toBeVisible();
      await expect(playerSlot.locator('[data-testid="player-deck"]')).toBeVisible();
    });
  });

  test('Validación de formularios', async ({ page }) => {
    await test.step('Validar creación de sala sin nombre', async () => {
      await page.click('[data-testid="create-room-button"]');
      await expect(page.locator('[data-testid="error-message"]')).toContainText('nombre');
    });

    await test.step('Validar unión sin código', async () => {
      await page.fill('[data-testid="player-name-input"]', 'Test Player');
      await page.click('[data-testid="join-room-button"]');
      await expect(page.locator('[data-testid="error-message"]')).toContainText('código');
    });

    await test.step('Validar unión sin nombre', async () => {
      await page.fill('[data-testid="room-code-input"]', 'TEST123');
      await page.clear('[data-testid="player-name-input"]');
      await page.click('[data-testid="join-room-button"]');
      await expect(page.locator('[data-testid="error-message"]')).toContainText('nombre');
    });

    await test.step('Validar código de sala inválido', async () => {
      await page.fill('[data-testid="room-code-input"]', 'INVALID');
      await page.fill('[data-testid="player-name-input"]', 'Test Player');
      await page.click('[data-testid="join-room-button"]');
      await expect(page.locator('[data-testid="error-message"]')).toContainText('sala');
    });

    await test.step('Validar nombre de jugador muy largo', async () => {
      const longName = 'A'.repeat(51); // Más de 50 caracteres
      await page.fill('[data-testid="player-name-input"]', longName);
      await page.click('[data-testid="join-room-button"]');
      await expect(page.locator('[data-testid="error-message"]')).toContainText('largo');
    });
  });

  test('Navegación y controles del lobby', async ({ page }) => {
    await test.step('Verificar navegación a reglas', async () => {
      await page.click('[data-testid="rules-link"]');
      await expect(page.locator('[data-testid="rules-page"]')).toBeVisible();
    });

    await test.step('Verificar navegación a página principal', async () => {
      await page.click('[data-testid="home-link"]');
      await expect(page.locator('[data-testid="home-page"]')).toBeVisible();
    });

    await test.step('Verificar botón de actualizar lista', async () => {
      await helpers.navigateToLobby();
      await expect(page.locator('[data-testid="refresh-rooms"]')).toBeVisible();
      
      await page.click('[data-testid="refresh-rooms"]');
      // Verificar que la lista se actualiza
      await expect(page.locator('[data-testid="public-rooms-list"]')).toBeVisible();
    });
  });

  test('Responsive design del lobby', async ({ page }) => {
    await test.step('Verificar layout en desktop', async () => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await helpers.takeScreenshot('lobby-desktop');
      
      await expect(page.locator('[data-testid="lobby-page"]')).toBeVisible();
    });

    await test.step('Verificar layout en tablet', async () => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await helpers.takeScreenshot('lobby-tablet');
      
      await expect(page.locator('[data-testid="lobby-page"]')).toBeVisible();
    });

    await test.step('Verificar layout en móvil', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      await helpers.takeScreenshot('lobby-mobile');
      
      await expect(page.locator('[data-testid="lobby-page"]')).toBeVisible();
      
      // Verificar que aparecen controles móviles
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    });
  });

  test('Manejo de errores de conexión en lobby', async ({ page }) => {
    await test.step('Simular pérdida de conexión', async () => {
      // Simular desconexión del servidor
      await page.route('**/socket.io/**', route => route.abort());
      
      await helpers.navigateToLobby();
      await expect(page.locator('[data-testid="connection-error"]')).toBeVisible();
    });

    await test.step('Verificar mensaje de reconexión', async () => {
      await expect(page.locator('[data-testid="reconnect-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="connection-status"]')).toContainText('desconectado');
    });

    await test.step('Verificar que los formularios están deshabilitados', async () => {
      await expect(page.locator('[data-testid="create-room-button"]')).toBeDisabled();
      await expect(page.locator('[data-testid="join-room-button"]')).toBeDisabled();
    });
  });
});
