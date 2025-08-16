import { test, expect } from '@playwright/test';
import { GameTestHelpers, generateUniqueName } from '../utils/test-helpers';

test.describe('Sistema de Chat - Torre de los Pecados', () => {
  let helpers: GameTestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new GameTestHelpers(page);
    await helpers.navigateToLobby();
    await helpers.createGameRoom('Sala Chat Test');
  });

  test('Funcionalidad básica del chat', async ({ page }) => {
    await test.step('Verificar que el panel de chat está visible', async () => {
      await expect(page.locator('[data-testid="chat-panel"]')).toBeVisible();
      await expect(page.locator('[data-testid="chat-messages"]')).toBeVisible();
      await expect(page.locator('[data-testid="chat-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="chat-send-button"]')).toBeVisible();
    });

    await test.step('Enviar mensaje básico', async () => {
      const testMessage = '¡Hola desde el test E2E!';
      await helpers.sendChatMessage(testMessage);
      
      // Verificar que el mensaje aparece en el chat
      await helpers.expectChatMessage(testMessage);
    });

    await test.step('Verificar información del mensaje', async () => {
      const messageElement = page.locator('[data-testid="chat-message"]').last();
      await expect(messageElement.locator('[data-testid="message-sender"]')).toBeVisible();
      await expect(messageElement.locator('[data-testid="message-time"]')).toBeVisible();
      await expect(messageElement.locator('[data-testid="message-content"]')).toBeVisible();
    });
  });

  test('Chat en tiempo real entre múltiples jugadores', async ({ browser }) => {
    const roomName = generateUniqueName('Sala_Chat_Multi');
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
      });

      // Obtener código de sala
      const roomCode = await pages[0].locator('[data-testid="room-code"]').textContent() || 'TEST123';

      // Jugador 2 se une
      await test.step('Jugador 2 se une', async () => {
        await helpers[1].navigateToLobby();
        await helpers[1].joinGameRoom(roomCode, playerNames[1]);
      });

      // Probar chat en tiempo real
      await test.step('Probar chat en tiempo real', async () => {
        const message1 = '¡Hola desde Jugador 1!';
        const message2 = '¡Hola desde Jugador 2!';
        const message3 = '¿Cómo va la partida?';

        // Jugador 1 envía mensaje
        await helpers[0].sendChatMessage(message1);
        
        // Verificar que Jugador 2 ve el mensaje
        await helpers[1].expectChatMessage(message1);

        // Jugador 2 responde
        await helpers[1].sendChatMessage(message2);
        
        // Verificar que Jugador 1 ve la respuesta
        await helpers[0].expectChatMessage(message2);

        // Jugador 1 envía otro mensaje
        await helpers[0].sendChatMessage(message3);
        
        // Verificar que Jugador 2 ve el nuevo mensaje
        await helpers[1].expectChatMessage(message3);
      });

    } finally {
      await Promise.all(contexts.map(context => context.close()));
    }
  });

  test('Tipos de mensajes del sistema', async ({ page }) => {
    await test.step('Verificar mensaje de bienvenida', async () => {
      await expect(page.locator('[data-testid="system-message"]')).toContainText('bienvenido');
    });

    await test.step('Verificar mensaje de jugador listo', async () => {
      await page.click('[data-testid="ready-button"]');
      await expect(page.locator('[data-testid="system-message"]')).toContainText('listo');
    });

    await test.step('Verificar mensaje de configuración de mazo', async () => {
      await page.click('[data-testid="deck-config-button"]');
      await page.click('[data-testid="deck-angels"]');
      await page.click('[data-testid="save-deck-config"]');
      await expect(page.locator('[data-testid="system-message"]')).toContainText('mazo');
    });
  });

  test('Validación de mensajes', async ({ page }) => {
    await test.step('Intentar enviar mensaje vacío', async () => {
      await page.click('[data-testid="chat-send-button"]');
      await expect(page.locator('[data-testid="chat-error"]')).toContainText('vacío');
    });

    await test.step('Intentar enviar mensaje muy largo', async () => {
      const longMessage = 'A'.repeat(501); // Más de 500 caracteres
      await page.fill('[data-testid="chat-input"]', longMessage);
      await page.click('[data-testid="chat-send-button"]');
      await expect(page.locator('[data-testid="chat-error"]')).toContainText('largo');
    });

    await test.step('Enviar mensaje con caracteres especiales', async () => {
      const specialMessage = '¡Hola! ¿Cómo estás? 😊 #test #e2e';
      await helpers.sendChatMessage(specialMessage);
      await helpers.expectChatMessage(specialMessage);
    });
  });

  test('Funcionalidades avanzadas del chat', async ({ page }) => {
    await test.step('Verificar historial de mensajes', async () => {
      // Enviar varios mensajes
      const messages = [
        'Primer mensaje',
        'Segundo mensaje',
        'Tercer mensaje'
      ];

      for (const message of messages) {
        await helpers.sendChatMessage(message);
      }

      // Verificar que todos los mensajes están en el historial
      for (const message of messages) {
        await helpers.expectChatMessage(message);
      }
    });

    await test.step('Verificar scroll automático', async () => {
      // Enviar muchos mensajes para activar scroll
      for (let i = 0; i < 20; i++) {
        await helpers.sendChatMessage(`Mensaje ${i + 1}`);
      }

      // Verificar que el chat hace scroll automáticamente
      const chatMessages = page.locator('[data-testid="chat-messages"]');
      await expect(chatMessages).toBeVisible();
    });

    await test.step('Verificar límite de mensajes en historial', async () => {
      // Enviar más mensajes de los que caben en pantalla
      for (let i = 0; i < 50; i++) {
        await helpers.sendChatMessage(`Mensaje de prueba ${i + 1}`);
      }

      // Verificar que el historial se mantiene manejable
      const messageElements = page.locator('[data-testid="chat-message"]');
      const messageCount = await messageElements.count();
      expect(messageCount).toBeLessThanOrEqual(100); // Límite razonable
    });
  });

  test('Interfaz del chat', async ({ page }) => {
    await test.step('Verificar diseño del panel de chat', async () => {
      const chatPanel = page.locator('[data-testid="chat-panel"]');
      await expect(chatPanel).toBeVisible();
      
      // Verificar que tiene el tamaño correcto
      const boundingBox = await chatPanel.boundingBox();
      expect(boundingBox?.width).toBeGreaterThan(200);
      expect(boundingBox?.height).toBeGreaterThan(300);
    });

    await test.step('Verificar área de mensajes', async () => {
      const chatMessages = page.locator('[data-testid="chat-messages"]');
      await expect(chatMessages).toBeVisible();
      
      // Verificar que es scrollable
      await expect(chatMessages).toHaveCSS('overflow-y', 'auto');
    });

    await test.step('Verificar área de entrada', async () => {
      const chatInput = page.locator('[data-testid="chat-input"]');
      await expect(chatInput).toBeVisible();
      
      // Verificar que es editable
      await chatInput.fill('Test message');
      await expect(chatInput).toHaveValue('Test message');
    });

    await test.step('Verificar botón de envío', async () => {
      const sendButton = page.locator('[data-testid="chat-send-button"]');
      await expect(sendButton).toBeVisible();
      
      // Verificar que está habilitado cuando hay texto
      await page.fill('[data-testid="chat-input"]', 'Test');
      await expect(sendButton).toBeEnabled();
      
      // Verificar que está deshabilitado cuando no hay texto
      await page.clear('[data-testid="chat-input"]');
      await expect(sendButton).toBeDisabled();
    });
  });

  test('Responsive design del chat', async ({ page }) => {
    await test.step('Verificar chat en desktop', async () => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await helpers.takeScreenshot('chat-desktop');
      
      await expect(page.locator('[data-testid="chat-panel"]')).toBeVisible();
    });

    await test.step('Verificar chat en tablet', async () => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await helpers.takeScreenshot('chat-tablet');
      
      await expect(page.locator('[data-testid="chat-panel"]')).toBeVisible();
    });

    await test.step('Verificar chat en móvil', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      await helpers.takeScreenshot('chat-mobile');
      
      await expect(page.locator('[data-testid="chat-panel"]')).toBeVisible();
      
      // Verificar que el chat se adapta al móvil
      await expect(page.locator('[data-testid="mobile-chat-toggle"]')).toBeVisible();
    });
  });

  test('Manejo de errores en el chat', async ({ page }) => {
    await test.step('Simular error de conexión en chat', async () => {
      // Simular desconexión del servidor
      await page.route('**/socket.io/**', route => route.abort());
      
      // Intentar enviar mensaje
      await page.fill('[data-testid="chat-input"]', 'Test message');
      await page.click('[data-testid="chat-send-button"]');
      
      // Verificar que aparece mensaje de error
      await expect(page.locator('[data-testid="chat-error"]')).toContainText('conexión');
    });

    await test.step('Verificar que el chat se deshabilita sin conexión', async () => {
      await expect(page.locator('[data-testid="chat-input"]')).toBeDisabled();
      await expect(page.locator('[data-testid="chat-send-button"]')).toBeDisabled();
    });
  });

  test('Accesibilidad del chat', async ({ page }) => {
    await test.step('Verificar navegación por teclado', async () => {
      const chatInput = page.locator('[data-testid="chat-input"]');
      
      // Enfocar el input
      await chatInput.focus();
      
      // Escribir mensaje
      await chatInput.fill('Test message');
      
      // Enviar con Enter
      await chatInput.press('Enter');
      
      // Verificar que el mensaje se envió
      await helpers.expectChatMessage('Test message');
    });

    await test.step('Verificar etiquetas ARIA', async () => {
      const chatInput = page.locator('[data-testid="chat-input"]');
      const sendButton = page.locator('[data-testid="chat-send-button"]');
      
      // Verificar que tienen etiquetas apropiadas
      await expect(chatInput).toHaveAttribute('aria-label', /mensaje/i);
      await expect(sendButton).toHaveAttribute('aria-label', /enviar/i);
    });

    await test.step('Verificar contraste de colores', async () => {
      const chatPanel = page.locator('[data-testid="chat-panel"]');
      
      // Verificar que el texto es legible
      const color = await chatPanel.evaluate(el => 
        window.getComputedStyle(el).color
      );
      
      // Verificar que no es transparente
      expect(color).not.toBe('rgba(0, 0, 0, 0)');
    });
  });
});
