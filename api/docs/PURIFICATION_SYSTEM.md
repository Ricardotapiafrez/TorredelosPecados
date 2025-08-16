# 🧹 Sistema de Purificación de Mazos - Torre de los Pecados

## 📋 Resumen

El sistema de purificación permite limpiar completamente la "Torre de los Pecados" (mazo de descarte) bajo ciertas condiciones, reiniciando el estado del juego y permitiendo nuevas estrategias.

---

## 🎯 Mecánicas de Purificación

### ✨ Carta 10 - Purificación Mágica
**Efecto**: La carta con valor 10 purifica instantáneamente la Torre de los Pecados.

**Condiciones**:
- Se activa automáticamente al jugar cualquier carta con valor 10
- Funciona independientemente del estado actual del mazo
- Es el método más directo de purificación

**Implementación**:
```javascript
// En el modelo Card
willPurifyPile(gameState) {
  // Si es una carta 10, siempre purifica
  if (this.value === 10) return true;
  // ... otras condiciones
}
```

### 🔄 Cartas del Mismo Valor - Purificación por Coincidencia
**Efecto**: Jugar una carta del mismo valor que la última carta jugada purifica el mazo.

**Condiciones**:
- La carta jugada debe tener el mismo valor que `lastPlayedCard`
- Funciona solo cuando hay una carta anterior en el mazo
- Es una estrategia táctica para limpiar el mazo

**Implementación**:
```javascript
// En el modelo Card
willPurifyPile(gameState) {
  const lastCard = gameState.lastPlayedCard;
  if (!lastCard) return false;
  
  // Si es el mismo valor que la última carta jugada, purifica
  if (this.value === lastCard.value) return true;
  // ... otras condiciones
}
```

### 📊 Acumulación de Cartas - Purificación por Cantidad
**Efecto**: Jugar una carta que completa 4 cartas del mismo valor en el mazo.

**Condiciones**:
- Debe haber exactamente 3 cartas del mismo valor en el mazo
- La carta jugada debe ser la 4ª del mismo valor
- Es la condición más compleja de lograr

**Implementación**:
```javascript
// En el modelo Card
willPurifyPile(gameState) {
  // Si hay 4 cartas del mismo valor en el mazo (incluyendo la actual)
  const sameValueCards = gameState.discardPile.filter(card => card.value === this.value);
  return sameValueCards.length >= 3; // + la carta actual = 4
}
```

---

## 🎮 Efectos de la Purificación

### 🧹 Limpieza del Mazo
Cuando ocurre una purificación:

1. **Torre de los Pecados**: Se vacía completamente (`discardPile = []`)
2. **Última Carta**: Se resetea (`lastPlayedCard = null`)
3. **Efectos Especiales**: Se cancelan todos los efectos activos
   - `nextPlayerCanPlayAnything = false`
   - `skippedPlayer = null`

### 🔄 Continuidad del Juego
- **Turno**: El mismo jugador mantiene su turno
- **Fase**: El jugador continúa en su fase actual
- **Estado**: El juego continúa normalmente

### 📢 Notificaciones
El sistema emite eventos específicos:

```javascript
// Evento de carta jugada con información de purificación
io.to(roomId).emit('cardPlayed', {
  playerId,
  card: card.getPublicInfo(),
  targetPlayerId,
  wasPurified: true
});

// Evento específico de purificación
io.to(roomId).emit('pilePurified', {
  playerId,
  card: card.getPublicInfo(),
  message: 'La Torre de los Pecados ha sido purificada'
});
```

---

## 🧪 Testing y Validación

### 📋 Archivos de Prueba
- `test_purification.js`: Pruebas completas del sistema de purificación
- `ValidationService.js`: Validación de jugadas que incluyen purificación

### 🎯 Casos de Prueba
1. **Purificación con carta 10**: Verificar que limpia el mazo instantáneamente
2. **Purificación por coincidencia**: Verificar que cartas del mismo valor purifican
3. **Purificación por acumulación**: Verificar que 4 cartas del mismo valor purifican
4. **Estado post-purificación**: Verificar que el juego continúa correctamente

### 🚀 Comando de Prueba
```bash
cd api && node test_purification.js
```

---

## 🔧 Integración con el Frontend

### 📊 Información de Estado
El frontend recibe información sobre la purificación a través del estado del juego:

```javascript
// En getGameState()
{
  discardPile: [], // Array vacío después de purificación
  lastPlayedCard: null, // Sin carta anterior
  nextPlayerCanPlayAnything: false, // Efectos reseteados
  // ... resto del estado
}
```

### 🎨 Feedback Visual
El frontend puede mostrar:

1. **Animación de purificación**: Efectos visuales cuando se purifica
2. **Notificación**: Mensaje informando la purificación
3. **Actualización de UI**: Limpiar visualización del mazo de descarte
4. **Indicadores**: Mostrar qué cartas pueden purificar

### 🎮 Interacción del Usuario
- **Hover sobre cartas**: Mostrar si una carta purificará el mazo
- **Validación en tiempo real**: Indicar cartas jugables que purifican
- **Confirmación**: Preguntar confirmación antes de purificar (opcional)

---

## 📈 Estrategias de Juego

### 🎯 Uso Táctico de la Purificación

#### 🃏 Carta 10 - Purificación Estratégica
- **Cuándo usar**: Cuando el mazo tiene muchas cartas o efectos desfavorables
- **Ventajas**: Limpieza instantánea y control del juego
- **Desventajas**: Usar una carta valiosa (valor 10)

#### 🔄 Coincidencia de Valores - Purificación Oportunista
- **Cuándo usar**: Cuando se tiene una carta del mismo valor que la última jugada
- **Ventajas**: Aprovechar oportunidades naturales
- **Desventajas**: Depende de la carta del oponente

#### 📊 Acumulación - Purificación Planificada
- **Cuándo usar**: Cuando se puede planificar 4 cartas del mismo valor
- **Ventajas**: Efecto devastador en el juego
- **Desventajas**: Requiere mucha planificación y suerte

### 🎮 Impacto en la Metagame
- **Control del ritmo**: La purificación puede cambiar el momentum del juego
- **Gestión de recursos**: Permite "resetear" el estado del mazo
- **Estrategia defensiva**: Evitar acumulación de cartas desfavorables
- **Estrategia ofensiva**: Limpiar efectos especiales del oponente

---

## 🐛 Debugging y Logs

### 📝 Logs del Sistema
El sistema genera logs detallados para debugging:

```
🎯 Carta El Trono del Creador (valor: 10) purificará la Torre de los Pecados
🧹 Purificando Torre de los Pecados (5 cartas eliminadas)
✅ Torre de los Pecados purificada. Nueva ronda iniciada.
```

### 🔍 Puntos de Verificación
1. **Verificación de condiciones**: Logs de cuándo se activa la purificación
2. **Estado del mazo**: Logs del tamaño del mazo antes y después
3. **Efectos especiales**: Logs de reset de efectos
4. **Notificaciones**: Logs de eventos enviados al frontend

---

## 🚀 Estado del Proyecto

### ✅ Completado
- [x] Implementación de purificación con carta 10
- [x] Implementación de purificación por coincidencia
- [x] Implementación de purificación por acumulación
- [x] Sistema de notificaciones
- [x] Validación completa
- [x] Testing automatizado
- [x] Documentación detallada

### 🎯 Próximos Pasos
- [ ] Integración con animaciones del frontend
- [ ] Sonidos para efectos de purificación
- [ ] Tutorial interactivo de purificación
- [ ] Estadísticas de purificación por jugador

---

*¡El sistema de purificación está completamente implementado y listo para el juego! 🚀🧹*
