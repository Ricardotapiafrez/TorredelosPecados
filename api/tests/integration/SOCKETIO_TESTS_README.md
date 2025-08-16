# Tests de Integración para Socket.io

## 📋 Resumen de Implementación

Se han implementado exitosamente tests de integración completos para Socket.io que cubren:

- ✅ Conexiones básicas de clientes
- ✅ Manejo de múltiples conexiones
- ✅ Creación y unión a salas
- ✅ Manejo de eventos del juego
- ✅ Gestión de estado del juego
- ✅ Manejo de errores
- ✅ Timeouts y desconexiones

## 🏗️ Arquitectura de Tests

### Estructura de Archivos

```
tests/integration/
├── setup/
│   ├── global.setup.js          # Setup global para todos los tests
│   ├── global.teardown.js       # Teardown global
│   └── socketio.setup.js        # Setup específico para Socket.io
├── helpers/
│   └── socketTestHelper.js      # Helper para tests de Socket.io
└── socketIoBasic.test.js        # Tests básicos de integración
```

### Configuración

#### jest.socketio.config.js
- Configuración específica para tests de Socket.io
- Timeouts extendidos (60 segundos)
- Coverage de servicios principales
- Setup y teardown globales

#### Variables de Entorno para Tests
- `NODE_ENV=test`
- `TEST_MODE=true` (timeouts reducidos)
- `PORT=0` (puerto aleatorio)
- `LOG_LEVEL=error`

## 🧪 Tests Implementados

### 1. Basic Connection Tests
- **should connect client successfully**: Verifica conexión básica
- **should handle multiple client connections**: Prueba múltiples conexiones simultáneas
- **should handle client disconnection**: Verifica desconexión limpia

### 2. Basic Event Tests
- **should respond to ping event**: Prueba evento básico de ping/pong
- **should handle room creation**: Verifica creación de salas
- **should handle room joining**: Prueba unión a salas existentes

### 3. Error Handling Tests
- **should handle invalid event data**: Verifica manejo de datos inválidos
- **should handle non-existent events gracefully**: Prueba eventos inexistentes

### 4. Game State Tests
- **should maintain game state after room creation**: Verifica persistencia del estado
- **should handle player ready status**: Prueba actualización de estado de jugadores

## 🔧 Helper Functions

### SocketTestHelper Class

#### Métodos Principales
- `startServer()`: Inicia servidor de prueba
- `createClient()`: Crea cliente Socket.io
- `waitForConnection()`: Espera conexión del cliente
- `emitAndWait()`: Emite evento y espera respuesta
- `waitForEvent()`: Espera evento específico
- `getGameState()`: Obtiene estado del juego

#### Métodos de Limpieza
- `cleanupClients()`: Limpia todos los clientes
- `clearAllInactivityTimeouts()`: Limpia timeouts de inactividad
- `stopServer()`: Detiene servidor y limpia recursos

## ⚙️ Configuración de Timeouts

### Modo Test vs Producción
```javascript
// En modo test (timeouts reducidos)
TURN_TIMEOUT = 5000;        // 5 segundos
RECONNECTION_TIMEOUT = 10000; // 10 segundos
INACTIVE_TIMEOUT = 15000;   // 15 segundos

// En producción (timeouts normales)
TURN_TIMEOUT = 30000;       // 30 segundos
RECONNECTION_TIMEOUT = 60000; // 1 minuto
INACTIVE_TIMEOUT = 120000;  // 2 minutos
```

### Manejo de Desconexiones
- **Modo Test**: No se configuran timeouts de inactividad
- **Evento cleanDisconnect**: Limpieza inmediata sin timeouts
- **Limpieza automática**: Todos los timeouts se limpian al finalizar tests

## 📊 Cobertura de Código

### Servicios Cubiertos
- `GameService.js`: 22.27% statements, 11% branches
- `ChatService.js`: 3.44% statements
- `DeckConfigurationService.js`: 4.62% statements
- `ValidationService.js`: 1.43% statements

### Áreas de Mejora
- Aumentar cobertura de servicios individuales
- Agregar tests para casos edge
- Implementar tests de rendimiento

## 🚀 Ejecución de Tests

### Comando Principal
```bash
npm run test:socketio
```

### Configuración
- **Timeout**: 60 segundos por test
- **Workers**: 1 (ejecución secuencial)
- **Coverage**: HTML, LCOV, texto
- **Directorio**: `coverage/socketio/`

## 🔍 Debugging

### Logs de Debug
```javascript
// Habilitar logs de debug
socketHelper.debugGameState(roomId);
socketHelper.debugPlayerSockets();
```

### Eventos de Debug
- `cleanDisconnect`: Limpieza inmediata en modo test
- `gameStateUpdated`: Actualizaciones de estado
- `playerReadyStatusChanged`: Cambios de estado de jugadores

## 🛠️ Mantenimiento

### Agregar Nuevos Tests
1. Crear test en `socketIoBasic.test.js`
2. Usar `SocketTestHelper` para setup
3. Implementar cleanup en `afterEach`
4. Verificar cobertura

### Modificar Configuración
1. Actualizar `jest.socketio.config.js`
2. Modificar timeouts en `GameService.js`
3. Actualizar setup/teardown según necesidad

## ✅ Estado Actual

- **Tests**: 10/10 pasando
- **Cobertura**: 12.69% statements
- **Tiempo**: ~4 segundos
- **Estabilidad**: Alta (sin errores de timers)

## 🎯 Próximos Pasos

1. **Aumentar Cobertura**: Agregar tests para más funcionalidades
2. **Tests de Rendimiento**: Implementar tests de carga
3. **Tests E2E**: Crear tests de flujo completo
4. **CI/CD**: Integrar con pipeline de integración continua
