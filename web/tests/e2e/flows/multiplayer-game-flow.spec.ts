import { test, expect } from '@playwright/test';
import { GameTestHelpers, generateUniqueName, TEST_CONSTANTS } from '../utils/test-helpers';

test.describe('Flujo de Juego Multiplayer - Torre de los Pecados', () => {
  test('Partida completa con 4 jugadores', async ({ browser }) => {
    const roomName = generateUniqueName('Sala_Multiplayer');
    const playerNames = [
      generateUniqueName('Jugador1'),
      generateUniqueName('Jugador2'),
      generateUniqueName('Jugador3'),
      generateUniqueName('Jugador4')
    ];

    // Crear 4 contextos de página para simular 4 jugadores
    const contexts = await Promise.all([
      browser.newContext(),
      browser.newContext(),
      browser.newContext(),
      browser.newContext()
    ]);

    const pages = await Promise.all(contexts.map(context => context.newPage()));
    const helpers = pages.map(page => new GameTestHelpers(page));

    try {
      // Jugador 1: Crear la sala
      await test.step('Jugador 1 crea la sala', async () => {
        await helpers[0].navigateToLobby();
        await helpers[0].createGameRoom(roomName);
        await helpers[0].configureDeck('angels');
        await helpers[0].setPlayerReady();
        await helpers[0].takeScreenshot('jugador1-sala-creada');
      });

      // Obtener código de la sala (esto requeriría implementación en el frontend)
      const roomCode = await pages[0].locator('[data-testid="room-code"]').textContent() || 'TEST123';

      // Jugadores 2, 3 y 4: Unirse a la sala
      await test.step('Jugadores 2, 3 y 4 se unen a la sala', async () => {
        for (let i = 1; i < 4; i++) {
          await helpers[i].navigateToLobby();
          await helpers[i].joinGameRoom(roomCode, playerNames[i]);
          await helpers[i].configureDeck(['demons', 'dragons', 'mages'][i - 1]);
          await helpers[i].setPlayerReady();
          await helpers[i].takeScreenshot(`jugador${i + 1}-unido`);
        }
      });

      // Verificar que todos los jugadores estén en el juego
      await test.step('Verificar que todos los jugadores estén conectados', async () => {
        for (let i = 0; i < 4; i++) {
          await helpers[i].expectConnected();
          await helpers[i].expectInGame();
        }
      });

      // Verificar que el juego pueda iniciar
      await test.step('Verificar que el juego puede iniciar', async () => {
        await expect(pages[0].locator('[data-testid="start-game-button"]')).toBeEnabled();
      });

      // Jugador 1: Iniciar el juego
      await test.step('Jugador 1 inicia el juego', async () => {
        await pages[0].click('[data-testid="start-game-button"]');
        
        // Esperar a que todos los jugadores reciban la notificación
        for (let i = 0; i < 4; i++) {
          await pages[i].waitForSelector('[data-testid="game-started"]', { timeout: 10000 });
        }
      });

      // Verificar que todos tienen cartas en mano
      await test.step('Verificar que todos los jugadores tienen cartas', async () => {
        for (let i = 0; i < 4; i++) {
          await helpers[i].expectHasCardsInHand();
          await helpers[i].expectGamePhase('hand');
        }
      });

      // Simular algunas jugadas básicas
      await test.step('Simular jugadas básicas', async () => {
        // Jugador 1 juega una carta
        await helpers[0].playCard(0);
        await helpers[0].waitForAnimation();

        // Verificar que el turno pasa al siguiente jugador
        await helpers[1].waitForPlayerTurn();
        await helpers[1].playCard(0);
        await helpers[1].waitForAnimation();

        // Continuar con los otros jugadores
        await helpers[2].waitForPlayerTurn();
        await helpers[2].playCard(0);
        await helpers[2].waitForAnimation();

        await helpers[3].waitForPlayerTurn();
        await helpers[3].playCard(0);
        await helpers[3].waitForAnimation();
      });

      // Verificar que el juego progresa a la siguiente fase
      await test.step('Verificar progresión del juego', async () => {
        // Esperar a que termine la fase de mano
        await pages[0].waitForSelector('[data-testid="phase-face-up"]', { timeout: 30000 });
        
        for (let i = 0; i < 4; i++) {
          await helpers[i].expectGamePhase('face-up');
        }
      });

    } finally {
      // Limpiar: cerrar todos los contextos
      await Promise.all(contexts.map(context => context.close()));
    }
  });

  test('Chat en tiempo real entre jugadores', async ({ browser }) => {
    const roomName = generateUniqueName('Sala_Chat');
    const playerNames = [
      generateUniqueName('Chat1'),
      generateUniqueName('Chat2')
    ];

    const contexts = await Promise.all([
      browser.newContext(),
      browser.newContext()
    ]);

    const pages = await Promise.all(contexts.map(context => context.newPage()));
    const helpers = pages.map(page => new GameTestHelpers(page));

    try {
      // Jugador 1 crea sala
      await test.step('Jugador 1 crea sala', async () => {
        await helpers[0].navigateToLobby();
        await helpers[0].createGameRoom(roomName);
        await helpers[0].setPlayerReady();
      });

      // Obtener código de sala
      const roomCode = await pages[0].locator('[data-testid="room-code"]').textContent() || 'TEST123';

      // Jugador 2 se une
      await test.step('Jugador 2 se une', async () => {
        await helpers[1].navigateToLobby();
        await helpers[1].joinGameRoom(roomCode, playerNames[1]);
        await helpers[1].setPlayerReady();
      });

      // Probar chat en tiempo real
      await test.step('Probar chat en tiempo real', async () => {
        const message1 = '¡Hola desde Jugador 1!';
        const message2 = '¡Hola desde Jugador 2!';

        // Jugador 1 envía mensaje
        await helpers[0].sendChatMessage(message1);
        
        // Verificar que Jugador 2 ve el mensaje
        await helpers[1].expectChatMessage(message1);

        // Jugador 2 responde
        await helpers[1].sendChatMessage(message2);
        
        // Verificar que Jugador 1 ve la respuesta
        await helpers[0].expectChatMessage(message2);
      });

    } finally {
      await Promise.all(contexts.map(context => context.close()));
    }
  });

  test('Manejo de desconexiones durante el juego', async ({ browser }) => {
    const roomName = generateUniqueName('Sala_Desconexion');
    const playerNames = [
      generateUniqueName('Jugador1'),
      generateUniqueName('Jugador2'),
      generateUniqueName('Jugador3'),
      generateUniqueName('Jugador4')
    ];

    const contexts = await Promise.all([
      browser.newContext(),
      browser.newContext(),
      browser.newContext(),
      browser.newContext()
    ]);

    const pages = await Promise.all(contexts.map(context => context.newPage()));
    const helpers = pages.map(page => new GameTestHelpers(page));

    try {
      // Configurar sala con 4 jugadores
      await test.step('Configurar sala con 4 jugadores', async () => {
        await helpers[0].navigateToLobby();
        await helpers[0].createGameRoom(roomName);
        await helpers[0].setPlayerReady();

        const roomCode = await pages[0].locator('[data-testid="room-code"]').textContent() || 'TEST123';

        for (let i = 1; i < 4; i++) {
          await helpers[i].navigateToLobby();
          await helpers[i].joinGameRoom(roomCode, playerNames[i]);
          await helpers[i].setPlayerReady();
        }
      });

      // Iniciar juego
      await test.step('Iniciar juego', async () => {
        await pages[0].click('[data-testid="start-game-button"]');
        
        for (let i = 0; i < 4; i++) {
          await pages[i].waitForSelector('[data-testid="game-started"]', { timeout: 10000 });
        }
      });

      // Simular desconexión del Jugador 2
      await test.step('Simular desconexión del Jugador 2', async () => {
        await contexts[1].close();
        
        // Verificar que los otros jugadores ven la desconexión
        await expect(pages[0].locator('[data-testid="player-disconnected"]')).toContainText(playerNames[1]);
        await expect(pages[2].locator('[data-testid="player-disconnected"]')).toContainText(playerNames[1]);
        await expect(pages[3].locator('[data-testid="player-disconnected"]')).toContainText(playerNames[1]);
      });

      // Verificar que el juego se pausa
      await test.step('Verificar que el juego se pausa', async () => {
        await expect(pages[0].locator('[data-testid="game-paused"]')).toBeVisible();
      });

    } finally {
      // Cerrar contextos restantes
      await Promise.all(contexts.slice(0, 1).concat(contexts.slice(2)).map(context => context.close()));
    }
  });
});
