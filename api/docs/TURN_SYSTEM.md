# 🎯 Sistema de Turnos y Validación - Torre de los Pecados

## 📋 Resumen

El sistema de turnos y validación es el núcleo que controla el flujo del juego, asegurando que cada jugador juegue en el momento correcto y que todas las acciones sean válidas según las reglas del juego.

---

## 🎮 Gestión de Turnos

### 📊 Estado del Turno
```javascript
class Game {
  constructor() {
    this.currentPlayerIndex = 0; // Índice del jugador actual
    this.turnNumber = 0; // Número del turno actual
    this.turnTime = 30; // Segundos por turno
    this.turnTimer = null; // Timer del turno actual
    this.turnStartTime = null; // Momento de inicio del turno
  }
}
```

### 🔄 Flujo de Turnos
1. **Inicio de turno**: Se verifica que el jugador pueda jugar
2. **Timer activo**: Se inicia un timer de 30 segundos
3. **Jugada**: El jugador realiza su acción
4. **Transición**: Se pasa al siguiente jugador
5. **Efectos especiales**: Se aplican efectos de cartas (salto, etc.)

### ⏰ Timer de Turno
- **Duración**: 30 segundos por turno (configurable)
- **Timeout**: Si se agota el tiempo, el turno pasa automáticamente
- **Advertencias**: Se notifica cuando quedan menos de 10 segundos

---

## 🔍 Sistema de Validación

### 📋 Niveles de Validación
1. **Validación de Turno**: Verificar que sea el turno del jugador
2. **Validación de Carta**: Verificar que la carta se pueda jugar
3. **Validación de Fase**: Verificar que la carta esté disponible en la fase actual
4. **Validación de Reglas**: Verificar reglas específicas del juego

### 🎯 Validación de Turno
```javascript
validateTurn(game, playerId) {
  const result = { isValid: true, errors: [], warnings: [] };
  
  // Verificar que sea el turno del jugador
  if (playerId !== currentPlayer.id) {
    result.errors.push(`No es tu turno. Es el turno de ${currentPlayer.name}`);
    result.isValid = false;
  }
  
  // Verificar si puede jugar
  if (!canPlay) {
    result.warnings.push('No tienes cartas jugables. Debes tomar la Torre de los Pecados');
  }
  
  // Verificar tiempo restante
  if (timeRemaining < 10) {
    result.warnings.push(`⚠️ Solo quedan ${timeRemaining} segundos en tu turno`);
  }
  
  return result;
}
```

### 🃏 Validación de Cartas
```javascript
validateCardPlayability(game, card, playerId) {
  const result = { isValid: true, errors: [] };
  
  // Verificar si la carta puede ser jugada según las reglas
  if (!card.canBePlayed(game, playerId)) {
    result.errors.push(`No puedes jugar ${card.name} en este momento`);
    result.isValid = false;
  }
  
  return result;
}
```

---

## 🔄 Transiciones de Turno

### 📊 Método nextTurn()
```javascript
nextTurn() {
  const previousPlayer = this.players[this.currentPlayerIndex];
  
  // Avanzar al siguiente jugador
  this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
  
  // Aplicar efectos especiales (salto de carta 8)
  if (this.skippedPlayer) {
    const skipIndex = this.players.findIndex(p => p.id === this.skippedPlayer);
    if (skipIndex === this.currentPlayerIndex) {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    }
    this.skippedPlayer = null;
  }
  
  this.startTurn();
}
```

### ⏭️ Efectos Especiales en Turnos

#### 🃏 Carta 8 - Poder de Salto
- **Efecto**: Salta el turno del siguiente jugador
- **Implementación**: Se marca `skippedPlayer` y se salta en la siguiente transición
- **Logs**: `⏭️ Saltando turno de ${player.name} (efecto del 8)`

#### 🧹 Purificación - Mismo Turno
- **Efecto**: El mismo jugador continúa después de purificar
- **Implementación**: No se llama `nextTurn()` después de purificación
- **Logs**: `🔄 Mismo jugador continúa después de purificación`

---

## 📊 Información del Turno

### 🎯 getTurnInfo()
```javascript
getTurnInfo() {
  return {
    turnNumber: this.turnNumber,
    currentPlayer: {
      id: currentPlayer.id,
      name: currentPlayer.name,
      phase: currentPlayer.currentPhase
    },
    turnStartTime: this.turnStartTime,
    turnTimeRemaining: this.getTurnTimeRemaining(),
    turnTime: this.turnTime,
    skippedPlayer: this.skippedPlayer
  };
}
```

### ⏱️ getTurnTimeRemaining()
```javascript
getTurnTimeRemaining() {
  if (!this.turnStartTime || this.gameState !== 'playing') {
    return this.turnTime;
  }
  
  const elapsed = Math.floor((Date.now() - this.turnStartTime.getTime()) / 1000);
  const remaining = Math.max(0, this.turnTime - elapsed);
  
  return remaining;
}
```

---

## 🚨 Manejo de Errores

### 📥 Jugadores sin Cartas Jugables
```javascript
// En startTurn()
const canPlay = this.canPlayerPlay(currentPlayer.id);
if (!canPlay) {
  console.log(`⚠️ ${currentPlayer.name} no puede jugar, debe tomar la Torre de los Pecados`);
  this.forceTakeDiscardPile(currentPlayer.id);
}
```

### ⏰ Timeout de Turno
```javascript
// Timer automático
this.turnTimer = setTimeout(() => {
  console.log(`⏰ Timeout del turno para ${currentPlayer.name}`);
  this.endTurn();
}, this.turnTime * 1000);
```

### 🔄 Jugadores que ya Ganaron
```javascript
if (currentPlayer.hasWon()) {
  console.log(`🏆 ${currentPlayer.name} ya ganó, saltando turno`);
  this.nextTurn();
  return;
}
```

---

## 📢 Notificaciones en Tiempo Real

### 🎯 Eventos de Turno
```javascript
// Notificar cambio de turno
io.to(roomId).emit('turnChanged', {
  turnInfo: game.getTurnInfo(),
  previousPlayerId: playerId,
  nextPlayerId: game.players[game.currentPlayerIndex]?.id
});

// Notificar carta jugada con información de turno
io.to(roomId).emit('cardPlayed', {
  playerId,
  card: card.getPublicInfo(),
  targetPlayerId,
  wasPurified,
  turnInfo: game.getTurnInfo()
});
```

### 📊 Estado del Juego
```javascript
getGameState(playerId) {
  return {
    currentPlayerId: currentPlayer?.id,
    currentPlayerName: currentPlayer?.name,
    turnNumber: this.turnNumber,
    turnStartTime: this.turnStartTime,
    turnTimeRemaining: this.getTurnTimeRemaining(),
    // ... resto del estado
  };
}
```

---

## 🧪 Testing y Validación

### 📋 Archivos de Prueba
- `test_turn_system.js`: Pruebas completas del sistema de turnos
- `ValidationService.js`: Validación específica por tipo

### 🎯 Casos de Prueba
1. **Validación de turno**: Verificar que solo el jugador actual pueda jugar
2. **Transiciones**: Verificar que los turnos cambien correctamente
3. **Efectos especiales**: Verificar salto de turno con carta 8
4. **Timeout**: Verificar que el turno pase automáticamente
5. **Información**: Verificar que se proporcione información correcta del turno

### 🚀 Comando de Prueba
```bash
cd api && node test_turn_system.js
```

---

## 🎨 Integración con el Frontend

### 📊 Información de Estado
El frontend recibe información detallada sobre el turno:

```javascript
// En getGameState()
{
  currentPlayerId: 'player1',
  currentPlayerName: 'Jugador 1',
  turnNumber: 5,
  turnStartTime: '2024-01-15T14:30:00.000Z',
  turnTimeRemaining: 25,
  turnInfo: {
    turnNumber: 5,
    currentPlayer: { id: 'player1', name: 'Jugador 1', phase: 'hand' },
    turnTimeRemaining: 25,
    turnTime: 30,
    skippedPlayer: null
  }
}
```

### 🎮 Interfaz de Usuario
- **Indicador de turno**: Mostrar quién está jugando actualmente
- **Timer visual**: Mostrar tiempo restante del turno
- **Advertencias**: Mostrar cuando quedan pocos segundos
- **Validación en tiempo real**: Indicar si una acción es válida
- **Transiciones**: Animaciones al cambiar de turno

### 🎯 Feedback Visual
1. **Turno actual**: Resaltar el jugador que está jugando
2. **Timer**: Mostrar cuenta regresiva del turno
3. **Advertencias**: Mostrar mensajes de validación
4. **Efectos especiales**: Indicar cuando se salta un turno
5. **Transiciones**: Efectos visuales al cambiar de turno

---

## 📈 Estrategias de Turno

### 🎯 Gestión del Tiempo
- **Planificación**: Pensar la jugada antes de que sea tu turno
- **Decisión rápida**: Tener una estrategia clara para evitar timeout
- **Comunicación**: Coordinar con otros jugadores si es necesario

### 🎯 Efectos Especiales
- **Carta 8**: Usar estratégicamente para saltar jugadores problemáticos
- **Carta 2**: Dar libertad al siguiente jugador cuando convenga
- **Carta 10**: Purificar en momentos críticos del juego

### 🎯 Validación Preventiva
- **Verificar jugadas**: Antes de hacer una acción, verificar que sea válida
- **Planificar fases**: Pensar en las transiciones de fase
- **Gestionar recursos**: Mantener cartas útiles para momentos críticos

---

## 🐛 Debugging y Logs

### 📝 Logs del Sistema
```javascript
console.log(`🎯 Turno ${this.turnNumber}: ${currentPlayer.name} (Fase: ${currentPlayer.currentPhase})`);
console.log(`🔄 Turno: ${previousPlayer.name} → ${nextPlayer.name}`);
console.log(`⏭️ Saltando turno de ${player.name} (efecto del 8)`);
console.log(`⏰ Timeout del turno para ${currentPlayer.name}`);
console.log(`⚠️ ${currentPlayer.name} no puede jugar, debe tomar la Torre de los Pecados`);
```

### 🔍 Puntos de Verificación
1. **Inicio de turno**: Logs de verificación de jugador actual
2. **Transiciones**: Logs de cambio de turno
3. **Efectos especiales**: Logs de aplicación de efectos
4. **Timeouts**: Logs de finalización automática de turno
5. **Errores**: Logs de jugadores sin cartas jugables

---

## 🚀 Estado del Proyecto

### ✅ Completado
- [x] Sistema de turnos robusto con timer
- [x] Validación completa de jugadas
- [x] Manejo de efectos especiales en turnos
- [x] Información detallada del turno
- [x] Notificaciones en tiempo real
- [x] Manejo de errores y edge cases
- [x] Testing automatizado
- [x] Documentación completa

### 🎯 Próximos Pasos
- [ ] Integración con animaciones del frontend
- [ ] Sonidos específicos por turno
- [ ] Configuración de tiempo por jugador
- [ ] Estadísticas de tiempo por turno

---

*¡El sistema de turnos y validación está completamente implementado y listo para el juego! 🚀🎯*
