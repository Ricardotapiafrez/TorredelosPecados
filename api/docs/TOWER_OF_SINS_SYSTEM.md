# 🏰 Sistema de Torre de los Pecados - Torre de los Pecados

## 📋 Resumen

El **Sistema de Torre de los Pecados** es el núcleo central del juego, manejando el mazo de descarte donde se acumulan todas las cartas jugadas. Este sistema implementa las reglas de descarte, purificación y penalizaciones que hacen único al juego.

---

## 🏗️ Arquitectura del Sistema

### 🎯 Clase TowerOfSins
La clase `TowerOfSins` es el componente principal que maneja toda la lógica de la Torre:

```javascript
class TowerOfSins {
  constructor() {
    this.id = uuidv4();
    this.cards = []; // Array de cartas en la Torre
    this.lastPlayedCard = null; // Última carta jugada
    this.purificationCount = 0; // Contador de purificaciones
    this.maxCardsBeforeWarning = 20; // Advertencia cuando hay muchas cartas
    this.createdAt = new Date();
    this.lastModified = new Date();
  }
}
```

### 🔗 Integración con Game
La Torre se integra completamente con el modelo `Game`:

```javascript
class Game {
  constructor(roomId, maxPlayers, deckType) {
    // ... otros atributos
    this.towerOfSins = new TowerOfSins();
  }
}
```

---

## 📥 Funcionalidades Principales

### 🎯 Agregar Cartas
```javascript
addCard(card, playerId) {
  // Agregar carta con metadatos
  this.cards.push({
    card: card,
    playerId: playerId,
    timestamp: new Date(),
    cardId: uuidv4()
  });
  
  // Actualizar última carta jugada
  this.lastPlayedCard = card;
  
  return {
    success: true,
    cardAdded: card.getPublicInfo(),
    towerSize: this.cards.length,
    message: `Carta ${card.name} agregada a la Torre de los Pecados`
  };
}
```

### 🧹 Purificación
La Torre se puede purificar por tres razones:

1. **Carta 10**: Purificación automática
2. **Mismo valor**: Carta igual a la última jugada
3. **Acumulación**: 4 cartas del mismo valor

```javascript
willPurify(card) {
  // Carta 10 siempre purifica
  if (card.value === 10) {
    return {
      willPurify: true,
      reason: 'Carta 10 - Purificación automática',
      type: 'card_10'
    };
  }
  
  // Mismo valor que la última carta
  if (card.value === this.lastPlayedCard.value) {
    return {
      willPurify: true,
      reason: `Mismo valor que la última carta (${card.value})`,
      type: 'same_value'
    };
  }
  
  // Acumulación de 4 cartas del mismo valor
  const sameValueCards = this.cards.filter(entry => entry.card.value === card.value);
  if (sameValueCards.length >= 3) {
    return {
      willPurify: true,
      reason: `Acumulación de 4 cartas del valor ${card.value}`,
      type: 'accumulation',
      count: sameValueCards.length + 1
    };
  }
}
```

### 📤 Tomar la Torre
```javascript
takeAllCards(playerId) {
  if (this.cards.length === 0) {
    return {
      success: false,
      message: 'La Torre de los Pecados está vacía',
      cardsTaken: []
    };
  }

  const cardsTaken = [...this.cards];
  const cardCount = cardsTaken.length;
  
  // Limpiar la Torre
  this.cards = [];
  this.lastPlayedCard = null;
  
  return {
    success: true,
    cardsTaken: cardsTaken.map(entry => entry.card),
    cardCount: cardCount,
    message: `Se tomaron ${cardCount} cartas de la Torre de los Pecados`
  };
}
```

---

## 🎯 Validación de Cartas

### 📋 Reglas de Validación
Una carta puede ser jugada si:

1. **Es la primera carta** del juego
2. **Es una carta especial** (2, 8, 10)
3. **Tiene valor igual o mayor** que la última carta jugada

```javascript
canPlayCard(card) {
  // Si no hay última carta jugada, cualquier carta es válida
  if (!this.lastPlayedCard) {
    return {
      canPlay: true,
      reason: 'Primera carta del juego'
    };
  }

  // Cartas especiales siempre se pueden jugar
  if (card.isSpecial) {
    return {
      canPlay: true,
      reason: 'Carta especial'
    };
  }

  // Verificar si el valor es igual o mayor
  if (card.value >= this.lastPlayedCard.value) {
    return {
      canPlay: true,
      reason: `Valor válido (${card.value} >= ${this.lastPlayedCard.value})`
    };
  }

  return {
    canPlay: false,
    reason: `Valor insuficiente (${card.value} < ${this.lastPlayedCard.value})`
  };
}
```

### ⚠️ Penalizaciones
Si un jugador no puede jugar una carta válida:

- **Debe tomar toda la Torre** de los Pecados
- **Regresa a la fase de mano** (si estaba en fase boca abajo)
- **No pasa el turno** (continúa el mismo jugador)

---

## 📊 Estadísticas y Monitoreo

### 📈 Estadísticas Detalladas
```javascript
getStats() {
  const valueCounts = {};
  const playerCounts = {};
  
  this.cards.forEach(entry => {
    // Contar por valor
    const value = entry.card.value;
    valueCounts[value] = (valueCounts[value] || 0) + 1;
    
    // Contar por jugador
    const playerId = entry.playerId;
    playerCounts[playerId] = (playerCounts[playerId] || 0) + 1;
  });

  return {
    totalCards: this.cards.length,
    lastPlayedCard: this.lastPlayedCard ? this.lastPlayedCard.getPublicInfo() : null,
    purificationCount: this.purificationCount,
    valueDistribution: valueCounts,
    playerDistribution: playerCounts,
    isDangerous: this.cards.length >= this.maxCardsBeforeWarning
  };
}
```

### 🚨 Sistema de Advertencias
- **Advertencia**: Cuando la Torre tiene 20+ cartas
- **Tendencia**: Vacía, pequeña, mediana, grande, peligrosa
- **Monitoreo**: Timestamps de creación y modificación

---

## 🔄 Integración con el Juego

### 🎮 En el Modelo Game
```javascript
// Jugar carta
playCard(playerId, cardIndex, targetPlayerId) {
  // ... lógica de jugar carta
  
  // Verificar si purifica el mazo
  const purificationCheck = this.towerOfSins.willPurify(playedCard);
  if (purificationCheck.willPurify) {
    this.purifyPile();
  } else {
    // Agregar a la Torre de los Pecados
    const addResult = this.towerOfSins.addCard(playedCard, playerId);
  }
}

// Tomar la Torre
takeDiscardPile(playerId) {
  const takeResult = this.towerOfSins.takeAllCards(playerId);
  if (takeResult.success) {
    player.takeDiscardPile(takeResult.cardsTaken);
  }
}
```

### 🎯 En el ValidationService
```javascript
// Verificar si un jugador debe tomar la Torre
shouldTakeDiscardPile(game, playerId) {
  const player = game.players.find(p => p.id === playerId);
  if (!player) return false;
  
  // Si el jugador no tiene cartas jugables, debe tomar la Torre
  return !this.canPlayerPlay(game, playerId) && game.towerOfSins.cards.length > 0;
}

// Validar cartas jugables
getPlayableCards(game, playerId) {
  const player = game.players.find(p => p.id === playerId);
  const playableCards = player.getPlayableCards();
  
  return playableCards.filter(card => {
    const towerValidation = game.towerOfSins.canPlayCard(card);
    return towerValidation.canPlay;
  });
}
```

---

## 📢 Notificaciones en Tiempo Real

### 🎮 Eventos de la Torre
```javascript
// Carta agregada
io.to(roomId).emit('cardPlayed', {
  playerId,
  card: card.getPublicInfo(),
  wasPurified: false,
  towerInfo: game.towerOfSins.getPublicInfo()
});

// Torre purificada
io.to(roomId).emit('pilePurified', {
  playerId,
  card: card.getPublicInfo(),
  message: 'La Torre de los Pecados ha sido purificada',
  purificationInfo: purifyResult
});

// Torre tomada
io.to(roomId).emit('discardPileTaken', {
  playerId,
  cardCount: game.towerOfSins.cards.length,
  message: `Se tomaron ${takeResult.cardCount} cartas`
});
```

### 📊 Estado del Juego
```javascript
getGameState(playerId) {
  return {
    // ... otros datos
    towerOfSins: this.towerOfSins.getPublicInfo(),
    // ... resto del estado
  };
}
```

---

## 🧪 Testing y Validación

### 📋 Archivos de Prueba
- `test_tower_of_sins.js`: Pruebas completas del sistema
- Casos de prueba en otros archivos de testing

### 🎯 Casos de Prueba
1. **Agregar cartas**: Verificar que las cartas se agregan correctamente
2. **Validación**: Probar reglas de validación de cartas
3. **Purificación**: Verificar los 3 tipos de purificación
4. **Tomar Torre**: Probar que los jugadores pueden tomar la Torre
5. **Estadísticas**: Verificar que las estadísticas son correctas
6. **Casos especiales**: Probar acumulación y otros casos límite

### 🚀 Comando de Prueba
```bash
cd api && node test_tower_of_sins.js
```

---

## 🎨 Integración con el Frontend

### 📊 Información de Estado
El frontend recibe información detallada sobre la Torre:

```javascript
// En getGameState()
{
  towerOfSins: {
    id: "uuid",
    cardCount: 5,
    lastPlayedCard: {
      name: "El Querubín de la Esperanza",
      value: 1,
      // ... otros datos
    },
    purificationCount: 2,
    isDangerous: false,
    lastModified: "2024-08-15T18:59:17.000Z"
  }
}
```

### 🎮 Interfaz de Usuario
- **Visualización de la Torre**: Mostrar cartas acumuladas
- **Última carta jugada**: Destacar la carta en la cima
- **Contador de cartas**: Mostrar cuántas cartas hay
- **Advertencias**: Alertar cuando la Torre es peligrosa
- **Animaciones**: Efectos de purificación y toma de cartas

### 🎯 Feedback Visual
1. **Torre pequeña**: Verde (0-4 cartas)
2. **Torre mediana**: Amarillo (5-9 cartas)
3. **Torre grande**: Naranja (10-19 cartas)
4. **Torre peligrosa**: Rojo (20+ cartas)

---

## 📈 Estrategias de la Torre

### 🎯 Gestión de la Torre
- **Purificación estratégica**: Usar cartas 10 en momentos clave
- **Acumulación controlada**: Jugar cartas del mismo valor para purificar
- **Presión sobre oponentes**: Dejar que la Torre crezca para forzar tomas

### 🎯 Uso de Cartas Especiales
- **Carta 2**: Dar libertad al siguiente jugador
- **Carta 8**: Saltar jugadores problemáticos
- **Carta 10**: Purificar cuando la Torre es peligrosa

### 🎯 Observación de Oponentes
- **Cartas boca arriba**: Ver qué pueden jugar
- **Conteo de cartas**: Llevar la cuenta de cartas jugadas
- **Predicción**: Anticipar movimientos de oponentes

---

## 🐛 Debugging y Logs

### 📝 Logs del Sistema
```javascript
console.log(`🏰 Torre de los Pecados creada (ID: ${this.id})`);
console.log(`📥 Agregando ${card.name} (valor: ${card.value}) a la Torre de los Pecados`);
console.log(`🧹 Purificando Torre de los Pecados (${cardsRemoved} cartas eliminadas)`);
console.log(`📤 Jugador ${playerId} toma toda la Torre de los Pecados (${cardCount} cartas)`);
console.log(`⚠️ ¡Advertencia! La Torre de los Pecados tiene ${this.cards.length} cartas`);
```

### 🔍 Puntos de Verificación
1. **Creación**: Logs cuando se crea la Torre
2. **Agregar cartas**: Logs de cada carta agregada
3. **Purificación**: Logs de purificación con razón
4. **Tomar cartas**: Logs cuando se toman cartas
5. **Advertencias**: Logs cuando la Torre es peligrosa
6. **Estadísticas**: Logs de información detallada

---

## 🚀 Estado del Proyecto

### ✅ Completado
- [x] Clase TowerOfSins completa
- [x] Integración con modelo Game
- [x] Validación de cartas
- [x] Sistema de purificación
- [x] Tomar la Torre
- [x] Estadísticas y monitoreo
- [x] Notificaciones en tiempo real
- [x] Testing automatizado
- [x] Documentación completa

### 🎯 Próximos Pasos
- [ ] Integración con animaciones del frontend
- [ ] Sonidos de la Torre
- [ ] Estadísticas avanzadas
- [ ] Sistema de rankings por Torre

---

## 📚 Referencias

### 🔗 Archivos Relacionados
- `api/src/models/TowerOfSins.js`: Clase principal
- `api/src/models/Game.js`: Integración con el juego
- `api/src/services/GameService.js`: Notificaciones
- `api/src/services/ValidationService.js`: Validaciones
- `api/test_tower_of_sins.js`: Pruebas

### 📖 Documentación Relacionada
- `PURIFICATION_SYSTEM.md`: Sistema de purificación
- `VALIDATION_SYSTEM.md`: Sistema de validación
- `GAME_PHASES.md`: Fases del juego
- `VICTORY_DEFEAT_SYSTEM.md`: Sistema de victoria/derrota

---

*¡El sistema de Torre de los Pecados está completamente implementado y listo para el juego! 🚀🏰*
