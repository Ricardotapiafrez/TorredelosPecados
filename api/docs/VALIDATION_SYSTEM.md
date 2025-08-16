# 🎯 Sistema de Validación de Jugadas - Torre de los Pecados

## 📋 Resumen

Este documento describe el sistema de validación de jugadas implementado para el juego "Torre de los Pecados". El sistema garantiza que todas las jugadas cumplan con las reglas del juego y proporciona información detallada sobre el estado de validación.

---

## 🏗️ Arquitectura del Sistema

### 📦 Componentes Principales

1. **ValidationService**: Servicio principal de validación
2. **GameService**: Integración con el sistema de juego
3. **Card Model**: Validación de cartas individuales
4. **Game Model**: Validación de estado del juego
5. **Player Model**: Validación de fases del jugador

---

## 🔧 ValidationService

### 🎯 Funcionalidades Principales

#### `validatePlay(game, playerId, cardIndex, targetPlayerId)`
Valida una jugada completa antes de ejecutarla.

**Parámetros:**
- `game`: Instancia del juego
- `playerId`: ID del jugador
- `cardIndex`: Índice de la carta a jugar
- `targetPlayerId`: ID del jugador objetivo (opcional)

**Retorna:**
```javascript
{
  isValid: boolean,
  errors: string[],
  warnings: string[],
  card: Card,
  canPlay: boolean,
  playableCards: Card[]
}
```

#### `getPlayableCardsForPlayer(game, playerId)`
Obtiene todas las cartas que un jugador puede jugar.

#### `canPlayerPlay(game, playerId)`
Verifica si un jugador tiene cartas jugables.

#### `getValidationInfo(game, playerId)`
Obtiene información completa de validación para el frontend.

---

## 📋 Reglas de Validación

### 🎮 Reglas Básicas

1. **Estado del Juego**: El juego debe estar en estado 'playing'
2. **Jugador Válido**: El jugador debe existir y estar vivo
3. **Turno Correcto**: Solo el jugador actual puede jugar
4. **Índice Válido**: El índice de carta debe ser válido

### 🃏 Reglas de Cartas

1. **Cartas Especiales**: Las cartas 2, 8, 10 siempre se pueden jugar
2. **Poder Universal**: Cuando está activo, cualquier carta se puede jugar
3. **Regla Normal**: Las cartas deben tener valor igual o mayor a la última carta jugada

### 📊 Reglas de Fase

1. **Fase de Mano**: Solo se pueden jugar cartas de la mano
2. **Fase Boca Arriba**: Solo se pueden jugar criaturas boca arriba
3. **Fase Boca Abajo**: Solo se pueden jugar criaturas boca abajo

### ✨ Reglas de Purificación

1. **Mismo Valor**: Si la carta tiene el mismo valor que la última jugada
2. **Cuatro Cartas**: Si hay 4 cartas del mismo valor en la Torre

---

## 🔄 Flujo de Validación

### 📋 Proceso de Validación

1. **Validación Básica**: Verificar estado del juego y jugador
2. **Validación de Turno**: Verificar que sea el turno del jugador
3. **Validación de Carta**: Verificar que la carta pueda ser jugada
4. **Validación de Fase**: Verificar que la carta esté disponible en la fase actual
5. **Validación de Purificación**: Verificar si la carta purificará la Torre

### 🎯 Ejemplo de Uso

```javascript
const validationService = new ValidationService();

// Validar una jugada
const validation = validationService.validatePlay(game, 'player1', 0);

if (validation.isValid) {
  // Ejecutar la jugada
  game.playCard('player1', 0);
} else {
  // Mostrar errores al jugador
  console.log('Errores:', validation.errors);
}
```

---

## 📡 Integración con GameService

### 🎮 Eventos de Validación

#### `validationError`
Se emite cuando una jugada no es válida.

```javascript
socket.emit('validationError', {
  errors: ['No es tu turno'],
  warnings: [],
  playableCards: []
});
```

#### `validationWarning`
Se emite cuando hay advertencias sobre una jugada.

```javascript
socket.emit('validationWarning', {
  warnings: ['Esta carta purificará la Torre de los Pecados'],
  card: cardInfo
});
```

#### `playableCards`
Se emite con información completa de cartas jugables.

```javascript
socket.emit('playableCards', {
  cards: playableCards,
  canPlay: true,
  currentPhase: 'hand',
  handSize: 3,
  faceUpSize: 3,
  faceDownSize: 3,
  soulWellSize: 3,
  isCurrentTurn: true,
  nextPlayerCanPlayAnything: false,
  lastPlayedCard: null,
  discardPileSize: 0,
  shouldTakeDiscardPile: false
});
```

---

## 📊 Información de Validación

### 🎯 Estado del Jugador

```javascript
{
  canPlay: boolean,           // Si puede jugar
  playableCards: Card[],      // Cartas jugables
  currentPhase: string,       // Fase actual (hand/faceUp/faceDown)
  handSize: number,           // Cartas en mano
  faceUpSize: number,         // Criaturas boca arriba
  faceDownSize: number,       // Criaturas boca abajo
  soulWellSize: number,       // Cartas en Pozo de Almas
  isCurrentTurn: boolean,     // Si es su turno
  nextPlayerCanPlayAnything: boolean,  // Poder universal activo
  lastPlayedCard: Card,       // Última carta jugada
  discardPileSize: number     // Tamaño de la Torre
}
```

### 📈 Estadísticas del Juego

```javascript
{
  totalPlayers: number,           // Total de jugadores
  playersWithPlayableCards: number,  // Jugadores con cartas jugables
  playersWhoMustTakePile: number,    // Jugadores que deben tomar Torre
  currentTurnPlayer: string,      // ID del jugador actual
  gamePhase: string,              // Fase del juego
  discardPileSize: number,        // Tamaño de la Torre
  lastPlayedCard: string,         // Nombre de la última carta
  nextPlayerCanPlayAnything: boolean,  // Poder universal activo
  skippedPlayer: string           // Jugador saltado (efecto del 8)
}
```

---

## 🧪 Testing

### 📋 Archivos de Prueba

- `test_validation_system.js`: Pruebas completas del sistema de validación

### 🎯 Comandos de Prueba

```bash
# Ejecutar pruebas del sistema de validación
node test_validation_system.js
```

### 📊 Casos de Prueba

1. **Jugada Válida**: Verificar que una jugada correcta sea validada
2. **Jugada Inválida**: Verificar que jugadas incorrectas sean rechazadas
3. **Validación de Turno**: Verificar que solo el jugador actual pueda jugar
4. **Validación de Índice**: Verificar que índices inválidos sean rechazados
5. **Cartas Jugables**: Verificar que se obtengan las cartas correctas
6. **Información de Validación**: Verificar que se proporcione información completa
7. **Estadísticas**: Verificar que las estadísticas sean correctas
8. **Purificación**: Verificar la detección de purificación
9. **Torre de los Pecados**: Verificar cuándo un jugador debe tomar la Torre

---

## 🔧 Configuración

### ⚙️ Configuración del ValidationService

```javascript
const validationService = new ValidationService();

// El servicio se configura automáticamente con todas las reglas
// No requiere configuración adicional
```

### 🎮 Integración en GameService

```javascript
class GameService {
  constructor(io) {
    this.validationService = new ValidationService();
  }
  
  // Usar en métodos de juego
  playCard(socket, data) {
    const validation = this.validationService.validatePlay(game, playerId, cardIndex);
    if (!validation.isValid) {
      socket.emit('validationError', validation);
      return;
    }
    // Continuar con la jugada...
  }
}
```

---

## 📊 Estado del Proyecto

### ✅ Completado
- [x] ValidationService completo
- [x] Integración con GameService
- [x] Validación de reglas básicas
- [x] Validación de cartas especiales
- [x] Validación de fases del juego
- [x] Validación de purificación
- [x] Información de validación para frontend
- [x] Estadísticas de validación
- [x] Pruebas completas
- [x] Documentación detallada

### 🎯 Próximos Pasos
- [ ] Integración con la interfaz de usuario
- [ ] Validación en tiempo real
- [ ] Sugerencias de jugadas
- [ ] Tutorial de validación
- [ ] Animaciones de validación

---

## 🚀 Uso en Producción

### 📋 Implementación Completa

El sistema de validación está completamente implementado y listo para producción. Proporciona:

1. **Validación Robusta**: Todas las reglas del juego están validadas
2. **Información Detallada**: Feedback completo para el frontend
3. **Integración Completa**: Funciona con todos los componentes del juego
4. **Pruebas Exhaustivas**: Cobertura completa de casos de uso
5. **Documentación Clara**: Guía completa para desarrolladores

### 🎮 Beneficios

- **Prevención de Errores**: Evita jugadas inválidas
- **Experiencia de Usuario**: Feedback inmediato y claro
- **Mantenibilidad**: Código organizado y documentado
- **Escalabilidad**: Fácil agregar nuevas reglas de validación

---

*¡El sistema de validación está completamente implementado y listo para el juego! 🎯*
