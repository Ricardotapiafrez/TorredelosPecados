# 👥 Implementación del Modo Cooperativo (2 vs 2 IA)

## 📋 Resumen

Se ha implementado exitosamente el **modo cooperativo** para Torre de los Pecados, permitiendo a 2 jugadores humanos jugar juntos contra 2 jugadores controlados por IA. Este modo fomenta la colaboración y estrategia en equipo.

## ✅ Características Implementadas

### 🤝 Sistema Cooperativo
- **2 jugadores humanos vs 2 IA**: Configuración equilibrada para cooperación
- **Sistema de host**: El primer jugador que crea el juego es el host
- **Unión a juegos existentes**: Los jugadores pueden unirse a salas creadas por otros
- **Lista de juegos disponibles**: Interfaz para ver y unirse a juegos activos
- **Turnos automáticos de IA**: Las IA juegan automáticamente cuando es su turno

### 🎯 Modo de Juego
- **Creación de salas**: Los jugadores pueden crear nuevas salas cooperativas
- **Unión a salas**: Sistema para unirse a juegos existentes
- **Espera de jugadores**: El juego espera hasta que se unan los jugadores
- **Inicio cooperativo**: El host puede iniciar el juego cuando esté listo
- **Log de acciones**: Registro en tiempo real de todas las acciones de IA

### 🎨 Interfaz de Usuario
- **Configuración dual**: Formulario para crear o unirse a juegos
- **Lista de juegos**: Muestra juegos disponibles con información detallada
- **Panel de información**: Muestra estado del juego y jugadores
- **Log de acciones**: Panel lateral con historial de acciones de IA
- **Indicadores visuales**: Muestra qué jugador está jugando actualmente

## 🏗️ Arquitectura Técnica

### Backend (Node.js + Socket.io)

#### GameService.js - Nuevos Métodos
```javascript
// Crear juego cooperativo
createCoopGame(socket, data)

// Unirse a juego cooperativo existente
joinCoopGame(socket, data)

// Obtener información del modo cooperativo
getCoopGameInfo(roomId)

// Obtener lista de juegos cooperativos disponibles
getAvailableCoopGames()

// Métodos de IA compartidos (solitario y cooperativo)
executeAITurn(game, playerId)
handleAITurns(game, roomId)
processAITurns(game, roomId)
applyPersonalityToDecision(decision, personality, gameState)
```

#### Características del Sistema
- **IDs únicos**: Las salas cooperativas usan prefijo `coop_`
- **Límite de jugadores**: Máximo 2 jugadores humanos por sala
- **Validación de unión**: Verifica espacio disponible y estado del juego
- **Notificaciones en tiempo real**: Informa a todos los jugadores sobre uniones
- **Gestión de host**: El primer jugador tiene privilegios de host

### Frontend (Next.js + React)

#### Nuevos Hooks
```typescript
// useCoopGame.ts
export function useCoopGame({ socket, enabled = true })

// Funcionalidades:
- createCoopGame(config)
- joinCoopGame(roomId, playerName)
- getCoopGameInfo(roomId)
- getAvailableCoopGames()
- clearCoopGame()
- Manejo de eventos de IA y jugadores
- Estado del juego en tiempo real
```

#### Nuevos Componentes
```typescript
// CoopGameSetup.tsx
- Configuración de nombre del jugador
- Selección de mazo temático y dificultad de IA
- Lista de juegos disponibles para unirse
- Tabs para crear o unirse a juegos
- Información detallada de cada juego

// Página /coop/page.tsx
- Interfaz completa del modo cooperativo
- Integración con GameBoard
- Panel lateral con información de jugadores
- Navegación y controles específicos
```

#### GameBoard Modificado
```typescript
// Soporte para modo cooperativo
interface GameBoardProps {
  socket: any
  roomId: string
  playerId: string
  isSoloMode?: boolean
  isCoopMode?: boolean
  // ... otras props
}

// Nuevas funciones:
- handlePlayCard()
- handleTakeDiscardPile()
- handleSetReady()
- handleStartGame()
```

### Socket.io Events

#### Nuevos Eventos
```javascript
// Cliente → Servidor
socket.emit('createCoopGame', config)
socket.emit('joinCoopGame', { roomId, playerName })
socket.emit('getCoopGameInfo', { roomId })
socket.emit('getAvailableCoopGames')

// Servidor → Cliente
socket.emit('coopGameCreated', data)
socket.emit('joinedCoopGame', data)
socket.emit('playerJoinedCoopGame', data)
socket.emit('coopGameInfo', { info })
socket.emit('availableCoopGames', { games })
```

## 🎮 Flujo de Juego

### 1. Creación de Juego
1. Jugador accede a `/coop`
2. Completa formulario de configuración
3. Sistema crea sala con ID único (`coop_${uuid}`)
4. Se agrega primer jugador humano como host
5. Se agregan 2 jugadores IA automáticamente
6. Sala queda en espera de más jugadores

### 2. Unión de Jugadores
1. Otros jugadores ven la lista de juegos disponibles
2. Seleccionan un juego y proporcionan su nombre
3. Sistema valida espacio disponible y estado
4. Jugador se une a la sala
5. Se notifica a todos los jugadores existentes

### 3. Inicio del Juego
1. Host puede iniciar el juego cuando esté listo
2. Sistema distribuye cartas a todos los jugadores
3. Juego comienza con el primer jugador
4. Turnos se ejecutan automáticamente para IA

### 4. Desarrollo del Juego
1. Jugadores humanos juegan en sus turnos
2. IA toman decisiones automáticamente
3. Acciones se registran en log en tiempo real
4. Interfaz se actualiza automáticamente

### 5. Finalización
1. Juego termina cuando hay ganador o perdedor
2. Se muestra resumen del juego
3. Jugadores pueden crear nuevo juego

## 🔧 Configuración y Personalización

### Gestión de Jugadores
- **Host**: Primer jugador con privilegios especiales
- **Jugadores regulares**: Pueden unirse a juegos existentes
- **Límites**: Máximo 2 jugadores humanos por sala
- **Validaciones**: Verificación de espacio y estado del juego

### Sistema de IA Compartido
- **Personalidades**: Mismas personalidades que modo solitario
- **Dificultades**: 4 niveles de dificultad disponibles
- **Estrategias**: IA adaptan comportamiento según personalidad
- **Turnos automáticos**: Manejo unificado para ambos modos

## 📊 Métricas y Monitoreo

### Logs del Servidor
```javascript
console.log(`🎮 Modo cooperativo creado: ${playerName} vs 2 IA (${deckType})`)
console.log(`👥 Jugador ${playerName} se unió al modo cooperativo en ${roomId}`)
console.log(`🤖 Turno de IA: ${player.name} (${personality.name})`)
console.log(`🎮 Juego cooperativo terminado en sala ${roomId}`)
```

### Eventos de Jugadores
- Uniones registradas con timestamp
- Información de host y jugadores mostrada
- Estado de sala actualizado en tiempo real
- Notificaciones de cambios de estado

## 🚀 Próximos Pasos

### Mejoras Planificadas
1. **Chat cooperativo**: Sistema de comunicación entre jugadores
2. **Estrategias en equipo**: IA que coordinen entre sí
3. **Modo desafío**: 1 vs 1 IA experta
4. **Estadísticas cooperativas**: Rendimiento en equipo
5. **Personalización avanzada**: Configuración de IA por jugador

### Optimizaciones
1. **Performance**: Optimizar manejo de múltiples jugadores
2. **UX**: Mejorar feedback visual para cooperación
3. **Accesibilidad**: Soporte para comunicación por voz
4. **Mobile**: Optimización para dispositivos móviles

## 🎯 Resultados

### ✅ Completado
- [x] Modo cooperativo funcional (2 vs 2 IA)
- [x] Sistema de creación y unión a juegos
- [x] Lista de juegos disponibles
- [x] Interfaz de usuario completa
- [x] Log de acciones en tiempo real
- [x] Integración con sistema existente
- [x] Tests de funcionalidad básica

### 📈 Impacto
- **Cooperación**: Los jugadores pueden jugar juntos contra IA
- **Socialización**: Fomenta la interacción entre jugadores
- **Estrategia en equipo**: Requiere coordinación y comunicación
- **Escalabilidad**: Base para futuros modos multijugador

## 🔄 Integración con Modo Solitario

### Sistema Unificado
- **IA compartida**: Mismos algoritmos y personalidades
- **Eventos unificados**: Mismo sistema de eventos Socket.io
- **Interfaz consistente**: Mismos componentes y estilos
- **Código reutilizable**: Lógica compartida entre modos

### Diferencias Clave
- **Número de jugadores**: 1 vs 3 (solitario) vs 2 vs 2 (cooperativo)
- **Gestión de salas**: Creación directa vs creación/uniones
- **Privilegios**: Sin host vs sistema de host
- **Espera**: Sin espera vs espera de jugadores

---

*¡El modo cooperativo está listo para fomentar la colaboración y estrategia en equipo! 👥🎮*
