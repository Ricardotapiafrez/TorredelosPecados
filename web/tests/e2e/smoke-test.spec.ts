import { test, expect } from '@playwright/test';

test.describe('Smoke Test - Torre de los Pecados', () => {
  test('La aplicación se carga correctamente', async ({ page }) => {
    await test.step('Navegar a la página principal', async () => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Verificar que la página se carga', async () => {
      // Verificar que el título de la página es correcto
      await expect(page).toHaveTitle(/Torre de los Pecados/i);
      
      // Verificar que el contenido principal está presente
      await expect(page.locator('body')).toBeVisible();
    });

    await test.step('Verificar que no hay errores en consola', async () => {
      const consoleErrors: string[] = [];
      
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      // Recargar la página para capturar errores
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Verificar que no hay errores críticos
      expect(consoleErrors.length).toBe(0);
    });
  });

  test('Navegación básica funciona', async ({ page }) => {
    await test.step('Navegar al lobby', async () => {
      await page.goto('/lobby');
      await page.waitForLoadState('networkidle');
      
      // Verificar que estamos en la página del lobby
      await expect(page.url()).toContain('/lobby');
    });

    await test.step('Navegar a las reglas', async () => {
      await page.goto('/rules');
      await page.waitForLoadState('networkidle');
      
      // Verificar que estamos en la página de reglas
      await expect(page.url()).toContain('/rules');
    });

    await test.step('Navegar al juego', async () => {
      await page.goto('/game');
      await page.waitForLoadState('networkidle');
      
      // Verificar que estamos en la página del juego
      await expect(page.url()).toContain('/game');
    });
  });

  test('Responsive design básico', async ({ page }) => {
    await test.step('Verificar en desktop', async () => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Verificar que la página se renderiza correctamente
      await expect(page.locator('body')).toBeVisible();
    });

    await test.step('Verificar en tablet', async () => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Verificar que la página se renderiza correctamente
      await expect(page.locator('body')).toBeVisible();
    });

    await test.step('Verificar en móvil', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Verificar que la página se renderiza correctamente
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test('Performance básica', async ({ page }) => {
    await test.step('Medir tiempo de carga', async () => {
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Verificar que la página carga en menos de 5 segundos
      expect(loadTime).toBeLessThan(5000);
    });

    await test.step('Verificar que no hay recursos bloqueantes', async () => {
      await page.goto('/');
      
      // Verificar que no hay errores de red
      const failedRequests: string[] = [];
      
      page.on('requestfailed', request => {
        failedRequests.push(request.url());
      });

      await page.waitForLoadState('networkidle');
      
      // Verificar que no hay requests fallidos críticos
      const criticalFailures = failedRequests.filter(url => 
        !url.includes('analytics') && 
        !url.includes('ads') && 
        !url.includes('tracking')
      );
      
      expect(criticalFailures.length).toBe(0);
    });
  });
});
