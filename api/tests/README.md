# Tests Unitarios - Torre de los Pecados

## 📋 Descripción

Este directorio contiene todos los tests unitarios para la lógica del juego Torre de los Pecados. Los tests están organizados por categorías y cubren todos los modelos y servicios principales.

## 🏗️ Estructura

```
tests/
├── unit/
│   ├── models/
│   │   ├── Card.test.js          # Tests para el modelo Card
│   │   ├── Player.test.js        # Tests para el modelo Player
│   │   └── Game.test.js          # Tests para el modelo Game
│   └── services/
│       ├── ValidationService.test.js  # Tests para el servicio de validación
│       └── ChatService.test.js        # Tests para el servicio de chat
├── integration/                   # Tests de integración (futuro)
└── README.md                     # Esta documentación
```

## 🚀 Comandos de Testing

### Ejecutar todos los tests
```bash
npm test
```

### Ejecutar tests en modo watch
```bash
npm run test:watch
```

### Ejecutar tests con cobertura
```bash
npm run test:coverage
```

### Ejecutar tests específicos
```bash
# Solo tests de modelos
npm run test:models

# Solo tests de servicios
npm run test:services

# Solo tests de integración
npm run test:integration
```

### Ejecutar tests con verbosidad
```bash
npm run test:verbose
```

## 📊 Cobertura de Código

Los tests están configurados para generar reportes de cobertura que incluyen:

- **Cobertura de líneas**: 80% mínimo
- **Cobertura de funciones**: 80% mínimo
- **Cobertura de ramas**: 70% mínimo
- **Cobertura de statements**: 80% mínimo

### Ver cobertura
```bash
npm run test:coverage
```

Los reportes se generan en:
- `coverage/lcov-report/index.html` - Reporte HTML
- `coverage/lcov.info` - Reporte LCOV
- `coverage/coverage-summary.json` - Reporte JSON

## 🧪 Tests Implementados

### Modelos (Models)

#### Card.test.js
- ✅ Constructor y propiedades básicas
- ✅ Identificación de cartas especiales
- ✅ Validación de jugabilidad (`canBePlayed`)
- ✅ Detección de purificación (`willPurifyPile`)
- ✅ Aplicación de efectos (`applyEffect`)
- ✅ Información pública (`getPublicInfo`)
- ✅ Mazos temáticos y sus propiedades
- ✅ Funciones de utilidad (`getThematicDeck`, `shuffleDeck`)

#### Player.test.js
- ✅ Constructor y propiedades básicas
- ✅ Gestión de mano (`addCardToHand`, `removeCardFromHand`)
- ✅ Gestión de criaturas (`addCreature`, `removeCreature`)
- ✅ Cálculo de poder total (`getTotalPower`)
- ✅ Búsqueda de cartas (`hasCard`, `getCardById`)
- ✅ Gestión de estado (`setReady`, `setConnected`)
- ✅ Gestión de puntuación (`addScore`, `setScore`)
- ✅ Utilidades (`getHandSize`, `getCreatureCount`)
- ✅ Información pública (`getPublicInfo`)
- ✅ Clonación (`clone`)

#### Game.test.js
- ✅ Constructor y propiedades básicas
- ✅ Gestión de jugadores (`addPlayer`, `removePlayer`, `getPlayer`)
- ✅ Inicio de juego (`startGame`)
- ✅ Jugada de cartas (`playCard`)
- ✅ Robo de cartas (`drawCard`)
- ✅ Verificación de fin de juego (`checkGameEnd`)
- ✅ Estado del juego (`getGameState`)
- ✅ Gestión de turnos (`isPlayerTurn`, `getCurrentPlayer`, `advanceTurn`)
- ✅ Purificación de pila (`purifyPile`)
- ✅ Utilidades (`getPlayerCount`, `isFull`, `canStart`)

### Servicios (Services)

#### ValidationService.test.js
- ✅ Validación de jugada de cartas (`validatePlayCard`)
- ✅ Validación de robo de cartas (`validateDrawCard`)
- ✅ Validación de inicio de juego (`validateStartGame`)
- ✅ Validación de unión a juego (`validateJoinGame`)
- ✅ Validación de salida de juego (`validateLeaveGame`)
- ✅ Validación de estado listo (`validateReady`)
- ✅ Validación de estado del juego (`validateGameState`)
- ✅ Validación de estado del jugador (`validatePlayerState`)
- ✅ Validación de cartas (`validateCard`)
- ✅ Obtención de cartas jugables (`getPlayableCards`)
- ✅ Validación de acciones (`isValidGameAction`)
- ✅ Sanitización de nombres (`sanitizePlayerName`)

#### ChatService.test.js
- ✅ Constructor y inicialización
- ✅ Creación de salas de chat (`createChatRoom`)
- ✅ Unión y salida de salas (`joinChatRoom`, `leaveChatRoom`)
- ✅ Envío de mensajes (`sendMessage`)
- ✅ Obtención de mensajes (`getMessages`)
- ✅ Edición de mensajes (`editMessage`)
- ✅ Eliminación de mensajes (`deleteMessage`)
- ✅ Gestión de usuarios (`getRoomUsers`)
- ✅ Búsqueda de mensajes (`searchMessages`)
- ✅ Configuración de salas (`updateRoomSettings`)
- ✅ Estadísticas del chat (`getChatStats`)
- ✅ Limpieza de salas inactivas (`cleanupInactiveRooms`)
- ✅ Métodos de utilidad (sanitización, generación de IDs, validación)

## 📈 Métricas de Testing

### Tests Totales: ~200+
- **Card.test.js**: ~50 tests
- **Player.test.js**: ~40 tests
- **Game.test.js**: ~60 tests
- **ValidationService.test.js**: ~50 tests
- **ChatService.test.js**: ~60 tests

### Cobertura Objetivo
- **Líneas de código**: 80%+
- **Funciones**: 80%+
- **Ramas**: 70%+
- **Statements**: 80%+

## 🔧 Configuración

### Jest Configuration
El archivo `jest.config.js` incluye:

- **Entorno**: Node.js
- **Patrones de test**: `**/tests/**/*.test.js`
- **Cobertura**: Automática con umbrales
- **Timeout**: 10 segundos por test
- **Cache**: Habilitado para mejor rendimiento
- **Watch**: Configurado para desarrollo

### Dependencias
```json
{
  "jest": "^29.7.0"
}
```

## 🎯 Próximos Pasos

### Tests de Integración
- [ ] Tests de Socket.io events
- [ ] Tests de flujo completo de juego
- [ ] Tests de comunicación en tiempo real

### Tests E2E
- [ ] Tests de interfaz de usuario
- [ ] Tests de flujo de usuario completo
- [ ] Tests de rendimiento

### Mejoras
- [ ] Tests de carga y estrés
- [ ] Tests de seguridad
- [ ] Tests de accesibilidad

## 🐛 Debugging

### Ejecutar un test específico
```bash
npm test -- --testNamePattern="should create a card"
```

### Ejecutar tests de un archivo específico
```bash
npm test Card.test.js
```

### Ejecutar tests con más información
```bash
npm test -- --verbose --detectOpenHandles
```

### Ver reporte de cobertura detallado
```bash
npm run test:coverage
# Abrir coverage/lcov-report/index.html en el navegador
```

## 📝 Convenciones

### Nomenclatura
- **Archivos de test**: `[ComponentName].test.js`
- **Describe blocks**: `[ComponentName] [Functionality]`
- **Test cases**: `should [expected behavior]`

### Estructura de Test
```javascript
describe('[Component] [Functionality]', () => {
  let component;
  
  beforeEach(() => {
    // Setup
  });
  
  test('should [expected behavior]', () => {
    // Arrange
    // Act
    // Assert
  });
});
```

### Assertions
- Usar `toBe()` para valores primitivos
- Usar `toEqual()` para objetos y arrays
- Usar `toContain()` para arrays
- Usar `toHaveLength()` para verificar longitud
- Usar `toThrow()` para excepciones

## 🤝 Contribución

### Agregar nuevos tests
1. Crear archivo `[ComponentName].test.js` en el directorio apropiado
2. Seguir las convenciones de nomenclatura
3. Asegurar cobertura mínima del 80%
4. Ejecutar `npm test` para verificar que todo funcione

### Mantener tests existentes
1. Actualizar tests cuando se modifique la funcionalidad
2. Mantener cobertura de código
3. Refactorizar tests cuando sea necesario
4. Documentar cambios importantes

## 📚 Recursos

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://jestjs.io/docs/best-practices)
- [Mock Functions](https://jestjs.io/docs/mock-functions)
- [Snapshot Testing](https://jestjs.io/docs/snapshot-testing)
