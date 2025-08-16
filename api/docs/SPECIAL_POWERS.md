# 🎮 Poderes Especiales de Cartas - Torre de los Pecados

## 📋 Resumen

Este documento describe los poderes especiales implementados para las cartas con valores 2, 8 y 10 en todos los mazos temáticos del juego.

---

## 🔄 Carta 2 - Poder Universal

### 🎯 Efecto
La carta con valor 2 puede jugarse sobre cualquier carta, sin importar su valor.

### ⚡ Mecánica
- **Activación**: Se activa automáticamente al jugar cualquier carta con valor 2
- **Duración**: Solo afecta al siguiente jugador
- **Efecto**: El siguiente jugador puede jugar cualquier carta, sin restricciones de valor

### 🎮 Implementación
```javascript
applyUniversalPower(gameState, playerId) {
  gameState.lastPlayedCard = this;
  gameState.nextPlayerCanPlayAnything = true;
  return gameState;
}
```

### 📚 Cartas por Mazo
- **Ángeles**: El Serafín del Juicio
- **Demonios**: El Archidemonio de la Ira
- **Dragones**: El Dragón de la Peste
- **Magos**: El Ilusionista

---

## ⏭️ Carta 8 - Poder de Salto

### 🎯 Efecto
La carta con valor 8 permite saltar el turno del siguiente jugador.

### ⚡ Mecánica
- **Activación**: Se activa automáticamente al jugar cualquier carta con valor 8
- **Duración**: Solo afecta al siguiente turno
- **Efecto**: El jugador que sigue al que jugó la carta 8 es saltado

### 🎮 Implementación
```javascript
applySkipPower(gameState, playerId) {
  const currentIndex = gameState.players.findIndex(p => p.id === playerId);
  const nextIndex = (currentIndex + 1) % gameState.players.length;
  const skipIndex = (nextIndex + 1) % gameState.players.length;
  
  gameState.skippedPlayer = gameState.players[skipIndex].id;
  gameState.currentPlayerIndex = skipIndex;
  return gameState;
}
```

### 📚 Cartas por Mazo
- **Ángeles**: El Emisario Divino
- **Demonios**: El Demonio de la Pestilencia
- **Dragones**: El Dragón Etéreo
- **Magos**: El Mago del Tiempo

---

## ✨ Carta 10 - Poder de Purificación

### 🎯 Efecto
La carta con valor 10 purifica completamente la Torre de los Pecados.

### ⚡ Mecánica
- **Activación**: Se activa automáticamente al jugar cualquier carta con valor 10
- **Duración**: Efecto inmediato y permanente
- **Efecto**: 
  - Vacía completamente la Torre de los Pecados
  - Elimina la última carta jugada
  - Resetea el estado de "poder universal"

### 🎮 Implementación
```javascript
applyPurificationPower(gameState, playerId) {
  gameState.discardPile = [];
  gameState.lastPlayedCard = null;
  gameState.nextPlayerCanPlayAnything = false;
  return gameState;
}
```

### 📚 Cartas por Mazo
- **Ángeles**: El Trono del Creador
- **Demonios**: El Señor del Abismo
- **Dragones**: El Dragón de Oro
- **Magos**: El Archmago de la Destrucción

---

## 🎯 Validación de Jugadas

### 📋 Reglas de Validación
1. **Cartas Especiales**: Las cartas 2, 8 y 10 siempre se pueden jugar
2. **Poder Universal**: Cuando está activo, cualquier carta se puede jugar
3. **Regla Normal**: Las cartas deben tener valor igual o mayor a la última carta jugada

### 🎮 Implementación
```javascript
canBePlayed(gameState, playerId) {
  const lastCard = gameState.lastPlayedCard;
  
  // Si es una carta especial (2, 8, 10) siempre se puede jugar
  if (this.isSpecial) return true;
  
  // Si no hay carta anterior, se puede jugar cualquier cosa
  if (!lastCard) return true;
  
  // Si el siguiente jugador puede jugar cualquier cosa (por efecto del 2)
  if (gameState.nextPlayerCanPlayAnything) return true;
  
  // Regla normal: debe ser igual o mayor valor
  return this.value >= lastCard.value;
}
```

---

## 🧪 Testing

### 📋 Archivos de Prueba
- `test_special_powers.js`: Pruebas completas de todos los poderes especiales
- `debug_special_powers.js`: Depuración detallada de efectos
- `debug_card_values.js`: Verificación de valores de cartas

### 🎯 Comandos de Prueba
```bash
# Ejecutar pruebas completas
node test_special_powers.js

# Depurar efectos especiales
node debug_special_powers.js

# Verificar valores de cartas
node debug_card_values.js
```

---

## 🔧 Integración con el Juego

### 📋 Flujo de Integración
1. **Jugada de Carta**: El jugador selecciona una carta para jugar
2. **Validación**: Se verifica si la carta puede ser jugada
3. **Aplicación de Efecto**: Si es una carta especial, se aplica su efecto
4. **Actualización de Estado**: El estado del juego se actualiza según el efecto
5. **Notificación**: Se notifica a todos los jugadores del cambio

### 🎮 Uso en GameService
```javascript
// En el método playCard del GameService
const card = game.playCard(playerId, cardIndex, targetPlayerId);

// El efecto se aplica automáticamente en el modelo Game
// y se notifica a todos los jugadores
```

---

## 📊 Estado del Proyecto

### ✅ Completado
- [x] Implementación de efectos especiales para cartas 2, 8, 10
- [x] Validación de jugadas con poderes especiales
- [x] Integración con el sistema de juego
- [x] Pruebas completas de funcionalidad
- [x] Documentación detallada

### 🎯 Próximos Pasos
- [ ] Integración con la interfaz de usuario
- [ ] Animaciones visuales para efectos especiales
- [ ] Sonidos para poderes especiales
- [ ] Tutorial interactivo de poderes especiales

---

*¡Los poderes especiales están completamente implementados y listos para el juego! 🚀*
