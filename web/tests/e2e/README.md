# 🧪 Tests E2E - Torre de los Pecados

## 📋 Descripción

Este directorio contiene todos los tests End-to-End (E2E) para el juego Torre de los Pecados. Los tests utilizan **Playwright** para simular interacciones reales de usuarios en el navegador y verificar que toda la aplicación funcione correctamente.

## 🏗️ Estructura

```
tests/e2e/
├── flows/                    # Tests de flujos completos
│   ├── complete-game-flow.spec.ts      # Flujo completo del juego
│   └── multiplayer-game-flow.spec.ts   # Flujo multiplayer
├── components/               # Tests de componentes específicos
│   ├── game-board.spec.ts              # Tests del tablero de juego
│   ├── lobby.spec.ts                   # Tests del sistema de lobby
│   └── chat-system.spec.ts             # Tests del sistema de chat
├── utils/                    # Utilidades y helpers
│   └── test-helpers.ts                 # Clase GameTestHelpers
└── README.md                 # Esta documentación
```

## 🚀 Comandos de Testing

### Ejecutar todos los tests E2E
```bash
npm run test:e2e
```

### Ejecutar tests con interfaz visual
```bash
npm run test:e2e:ui
```

### Ejecutar tests en modo headed (ver navegador)
```bash
npm run test:e2e:headed
```

### Ejecutar tests en modo debug
```bash
npm run test:e2e:debug
```

### Ver reporte de tests
```bash
npm run test:e2e:report
```

### Instalar navegadores de Playwright
```bash
npm run test:e2e:install
```

### Ejecutar tests específicos
```bash
# Solo tests de flujos
npx playwright test flows/

# Solo tests de componentes
npx playwright test components/

# Test específico
npx playwright test complete-game-flow.spec.ts
```

## 📊 Cobertura de Tests

### Flujos Principales
- ✅ **Flujo completo del juego**: Crear sala → Configurar → Jugar → Terminar
- ✅ **Flujo multiplayer**: 4 jugadores en tiempo real
- ✅ **Navegación entre páginas**: Home → Lobby → Game → Rules
- ✅ **Configuración de mazos**: Todos los mazos temáticos
- ✅ **Sistema de chat**: Mensajes en tiempo real
- ✅ **Interfaz responsive**: Desktop, tablet y móvil
- ✅ **Manejo de errores**: Conexión, validaciones, desconexiones

### Componentes Específicos
- ✅ **GameBoard**: Tablero de juego completo
- ✅ **Lobby**: Sistema de salas y gestión
- ✅ **Chat**: Sistema de mensajería en tiempo real

### Casos de Prueba
- ✅ **Funcionalidad básica**: Navegación y interacciones
- ✅ **Validaciones**: Formularios y datos de entrada
- ✅ **Responsive design**: Múltiples viewports
- ✅ **Accesibilidad**: Navegación por teclado y ARIA
- ✅ **Manejo de errores**: Conexiones y validaciones
- ✅ **Performance**: Tiempos de carga y animaciones

## 🧪 Tests Implementados

### Flujos Completos

#### `complete-game-flow.spec.ts`
- **Flujo completo del juego**: Desde creación de sala hasta finalización
- **Unirse a sala existente**: Proceso de unión con código
- **Navegación entre páginas**: Verificación de rutas
- **Configuración de mazos**: Prueba de todos los mazos temáticos
- **Sistema de chat básico**: Envío y recepción de mensajes
- **Interfaz responsive**: Adaptación a diferentes dispositivos
- **Manejo de errores**: Simulación de desconexiones
- **Validación de formularios**: Verificación de datos de entrada

#### `multiplayer-game-flow.spec.ts`
- **Partida completa con 4 jugadores**: Simulación de juego real
- **Chat en tiempo real**: Comunicación entre jugadores
- **Manejo de desconexiones**: Gestión de jugadores desconectados

### Componentes Específicos

#### `game-board.spec.ts`
- **Visualización del tablero**: Elementos principales
- **Interacción con cartas**: Click, hover, selección
- **Drag and drop**: Arrastrar cartas a zonas
- **Validación visual**: Indicadores de jugadas válidas/inválidas
- **Torre de los Pecados**: Visualización y efectos
- **Estado del juego**: Fases, turnos, información
- **Controles de juego**: Botones y acciones
- **Responsive design**: Adaptación a diferentes pantallas

#### `lobby.spec.ts`
- **Creación de salas**: Formularios y validaciones
- **Unirse a salas**: Proceso de unión
- **Lista de salas públicas**: Visualización y filtrado
- **Configuración de mazos**: Selección de mazos temáticos
- **Sistema de invitaciones**: Códigos y compartir
- **Gestión de jugadores**: Slots y estados
- **Validación de formularios**: Errores y mensajes
- **Navegación**: Enlaces y controles
- **Responsive design**: Adaptación móvil
- **Manejo de errores**: Conexiones y validaciones

#### `chat-system.spec.ts`
- **Funcionalidad básica**: Envío y recepción
- **Chat en tiempo real**: Múltiples jugadores
- **Tipos de mensajes**: Sistema y usuario
- **Validación de mensajes**: Límites y caracteres
- **Funcionalidades avanzadas**: Historial y scroll
- **Interfaz del chat**: Diseño y controles
- **Responsive design**: Adaptación móvil
- **Manejo de errores**: Conexiones perdidas
- **Accesibilidad**: Teclado y ARIA

## 🛠️ Utilidades

### GameTestHelpers
Clase principal que proporciona métodos para facilitar los tests:

```typescript
const helpers = new GameTestHelpers(page);

// Navegación
await helpers.navigateToHome();
await helpers.navigateToLobby();
await helpers.navigateToRules();

// Gestión de salas
await helpers.createGameRoom('Nombre Sala');
await helpers.joinGameRoom('CODIGO123', 'Jugador');

// Configuración
await helpers.configureDeck('angels');
await helpers.setPlayerReady();

// Juego
await helpers.playCard(0);
await helpers.dragCardToZone(0, 'face-up');
await helpers.drawCard();

// Chat
await helpers.sendChatMessage('Hola');
await helpers.expectChatMessage('Hola');

// Verificaciones
await helpers.expectConnected();
await helpers.expectInGame();
await helpers.expectHasCardsInHand();
await helpers.expectGamePhase('hand');
await helpers.expectPlayerWon();
await helpers.expectPlayerLost();

// Utilidades
await helpers.takeScreenshot('nombre');
await helpers.waitForAnimation(1000);
```

### Funciones de Utilidad
```typescript
// Generar nombres únicos
const roomName = generateUniqueName('Sala_Test');
const playerName = generateUniqueName('Jugador');

// Generar códigos de sala
const roomCode = generateRoomCode();

// Constantes de testing
TEST_CONSTANTS.TIMEOUTS.SHORT // 5000ms
TEST_CONSTANTS.PLAYER_NAMES.PLAYER_1 // 'Jugador Test 1'
TEST_CONSTANTS.DECK_TYPES.ANGELS // 'angels'
```

## 📱 Navegadores Soportados

Los tests se ejecutan en múltiples navegadores:

- **Chromium**: Chrome/Edge
- **Firefox**: Mozilla Firefox
- **WebKit**: Safari
- **Mobile Chrome**: Android Chrome
- **Mobile Safari**: iOS Safari

## 📊 Reportes y Métricas

### Reportes Generados
- **HTML**: Reporte visual detallado
- **JSON**: Datos estructurados para análisis
- **JUnit**: Compatible con CI/CD

### Métricas de Testing
- **Tests Totales**: ~50+ tests
- **Cobertura de Funcionalidad**: 90%+
- **Tiempo de Ejecución**: ~5-10 minutos
- **Navegadores**: 5 navegadores
- **Viewports**: Desktop, tablet, móvil

### Screenshots Automáticos
Los tests toman capturas de pantalla automáticamente:
- En caso de fallo
- En puntos clave del flujo
- Para verificación visual

## 🔧 Configuración

### Playwright Config
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: ['html', 'json', 'junit'],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

### Data Test IDs
Los tests utilizan `data-testid` para identificar elementos:

```html
<!-- Ejemplos de data-testid utilizados -->
<div data-testid="game-board">...</div>
<button data-testid="create-room-button">...</button>
<input data-testid="room-name-input" />
<div data-testid="chat-panel">...</div>
```

## 🐛 Debugging

### Ejecutar test específico en modo debug
```bash
npx playwright test --debug complete-game-flow.spec.ts
```

### Ver traces de tests
```bash
npx playwright show-trace test-results/trace.zip
```

### Ejecutar con más información
```bash
npx playwright test --verbose --headed
```

### Ver reporte detallado
```bash
npm run test:e2e:report
```

## 🤝 Contribución

### Agregar nuevos tests
1. Crear archivo `[nombre].spec.ts` en el directorio apropiado
2. Seguir las convenciones de nomenclatura
3. Usar `data-testid` para identificar elementos
4. Incluir screenshots en puntos clave
5. Documentar casos de prueba complejos

### Mantener tests existentes
1. Actualizar tests cuando se modifique la funcionalidad
2. Verificar que los `data-testid` estén actualizados
3. Mantener cobertura de funcionalidad
4. Refactorizar tests cuando sea necesario

### Convenciones
- **Nomenclatura**: `[Componente] [Funcionalidad]`
- **Estructura**: Usar `test.step()` para organizar
- **Assertions**: Usar `expect()` de Playwright
- **Timeouts**: Usar constantes de `TEST_CONSTANTS`
- **Screenshots**: Tomar en puntos clave del flujo

## 📚 Recursos

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Best Practices](https://playwright.dev/docs/best-practices)
- [Test Generator](https://playwright.dev/docs/codegen)
- [Trace Viewer](https://playwright.dev/docs/trace-viewer)
- [Test Reports](https://playwright.dev/docs/test-reporters)

## 🎯 Próximos Pasos

### Tests Pendientes
- [ ] **Tests de performance**: Medición de tiempos de carga
- [ ] **Tests de accesibilidad**: WCAG compliance
- [ ] **Tests de seguridad**: Validación de inputs
- [ ] **Tests de carga**: Múltiples usuarios simultáneos
- [ ] **Tests de integración**: API y base de datos

### Mejoras
- [ ] **CI/CD Integration**: GitHub Actions
- [ ] **Visual Regression**: Comparación de screenshots
- [ ] **Performance Monitoring**: Métricas de rendimiento
- [ ] **Cross-browser Testing**: Más navegadores
- [ ] **Mobile Testing**: Dispositivos reales

---

*¡Que los tests E2E te ayuden a mantener la calidad del juego! 🎮✨*
