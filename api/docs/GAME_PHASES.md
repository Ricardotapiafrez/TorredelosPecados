# 🎮 Las 3 Fases del Juego - Torre de los Pecados

## 📋 Resumen

El juego "Torre de los Pecados" se desarrolla en **3 fases progresivas** que cada jugador debe completar para ganar. Cada fase tiene reglas específicas y mecánicas únicas que añaden profundidad estratégica al juego.

---

## 🎯 Fase 1: La Mano

### 📖 Descripción
La primera fase del juego donde los jugadores juegan con las cartas que tienen en su mano.

### 🎮 Mecánicas
- **Cartas disponibles**: 3 cartas en mano (se mantiene constante)
- **Robo**: Después de cada jugada, se roba una carta del **Pozo de Almas**
- **Visibilidad**: Las cartas son completamente visibles
- **Estrategia**: Control total sobre qué carta jugar

### ⚡ Reglas Específicas
1. **Mantenimiento de mano**: Siempre se mantienen 3 cartas en mano
2. **Robo automático**: Después de jugar, se roba automáticamente del Pozo de Almas
3. **Transición**: Se pasa a la siguiente fase cuando la mano y el Pozo de Almas están vacíos

### 🔄 Transición a Fase 2
```javascript
// Condición de transición
if (this.hand.length === 0 && this.soulWell.length === 0) {
  this.currentPhase = 'faceUp';
}
```

---

## 📋 Fase 2: Criaturas Boca Arriba

### 📖 Descripción
La segunda fase donde los jugadores juegan con las 3 criaturas que tienen visibles frente a ellos.

### 🎮 Mecánicas
- **Cartas disponibles**: 3 cartas boca arriba (visibles)
- **Robo**: **NO se puede robar** del Pozo de Almas
- **Visibilidad**: Las cartas son completamente visibles
- **Estrategia**: Planificación con información completa

### ⚡ Reglas Específicas
1. **Sin robo**: No se puede robar del Pozo de Almas en esta fase
2. **Cartas fijas**: Las 3 cartas están predeterminadas desde el inicio
3. **Transición**: Se pasa a la siguiente fase cuando no quedan cartas boca arriba

### 🔄 Transición a Fase 3
```javascript
// Condición de transición
if (this.faceUpCreatures.length === 0) {
  this.currentPhase = 'faceDown';
}
```

---

## 🃏 Fase 3: Criaturas Boca Abajo

### 📖 Descripción
La fase más desafiante donde los jugadores juegan con las 3 criaturas ocultas sin saber qué son.

### 🎮 Mecánicas
- **Cartas disponibles**: 3 cartas boca abajo (ocultas)
- **Robo**: **NO se puede robar** del Pozo de Almas
- **Visibilidad**: Las cartas son completamente ocultas
- **Estrategia**: Juego de azar y memoria

### ⚡ Reglas Específicas
1. **Sin robo**: No se puede robar del Pozo de Almas en esta fase
2. **Validación estricta**: Si la carta jugada es inválida, se toma toda la Torre de los Pecados
3. **Regreso a Fase 1**: Al tomar la Torre, se regresa a la fase de mano
4. **Victoria**: Se gana al completar esta fase

### 🚨 Penalización por Carta Inválida
```javascript
// Si la carta boca abajo es inválida
if (playedCard.value < lastPlayedCard.value && !playedCard.isSpecial) {
  // El jugador debe tomar toda la Torre de los Pecados
  player.takeDiscardPile([...discardPile]);
  // Regresa a fase de mano
  player.currentPhase = 'hand';
}
```

---

## 🔄 Transiciones de Fase

### 📊 Flujo de Transiciones
```
Fase 1 (Mano) → Fase 2 (Boca Arriba) → Fase 3 (Boca Abajo) → Victoria
     ↑                                                           |
     └─────────── Regreso por carta inválida boca abajo ────────┘
```

### 🎯 Condiciones de Transición
1. **Mano → Boca Arriba**: Mano vacía + Pozo de Almas vacío
2. **Boca Arriba → Boca Abajo**: Sin cartas boca arriba
3. **Boca Abajo → Victoria**: Sin cartas boca abajo
4. **Boca Abajo → Mano**: Carta inválida jugada

### 📝 Logs de Transición
```javascript
console.log(`🔄 ${player.name} transición automática: Mano → Boca Arriba`);
console.log(`🔄 ${player.name} transición automática: Boca Arriba → Boca Abajo`);
console.log(`🔄 ${player.name} regresa a fase: Mano (por carta inválida boca abajo)`);
```

---

## 🎮 Implementación Técnica

### 📋 Modelo Player
```javascript
class Player {
  constructor() {
    this.hand = []; // Fase 1: Cartas en mano
    this.faceUpCreatures = []; // Fase 2: Cartas boca arriba
    this.faceDownCreatures = []; // Fase 3: Cartas boca abajo
    this.soulWell = []; // Pozo de Almas (robo)
    this.currentPhase = 'hand'; // Fase actual
  }
}
```

### 🎯 Método playCard
```javascript
playCard(cardIndex) {
  switch (this.currentPhase) {
    case 'hand':
      // Jugar de mano y robar del Pozo de Almas
      card = this.hand.splice(cardIndex, 1)[0];
      const drawnCard = this.drawFromSoulWell();
      if (drawnCard) this.hand.push(drawnCard);
      break;
      
    case 'faceUp':
      // Jugar boca arriba sin robar
      card = this.faceUpCreatures.splice(cardIndex, 1)[0];
      break;
      
    case 'faceDown':
      // Jugar boca abajo (validación posterior)
      card = this.faceDownCreatures.splice(cardIndex, 1)[0];
      break;
  }
}
```

### 🔍 Validación de Fases
```javascript
validatePhase(game, player, cardIndex) {
  switch (player.currentPhase) {
    case 'hand':
      warnings.push('Fase de la Mano: Robarás una carta del Pozo de Almas');
      break;
    case 'faceUp':
      warnings.push('Fase de Criaturas Boca Arriba: No puedes robar del Pozo de Almas');
      break;
    case 'faceDown':
      warnings.push('Fase de Criaturas Boca Abajo: Si la carta es inválida, tomarás la Torre de los Pecados');
      break;
  }
}
```

---

## 📊 Información de Fase

### 🎯 getPhaseInfo()
```javascript
getPhaseInfo() {
  return {
    current: this.currentPhase,
    description: 'Fase de la Mano',
    canDraw: true, // Solo en fase de mano
    cardsVisible: true, // Solo en fases 1 y 2
    nextPhase: 'faceUp' // Próxima fase
  };
}
```

### 📋 Estados por Fase
| Fase | Descripción | Puede Robar | Cartas Visibles | Próxima Fase |
|------|-------------|-------------|-----------------|--------------|
| `hand` | Fase de la Mano | ✅ Sí | ✅ Sí | `faceUp` |
| `faceUp` | Criaturas Boca Arriba | ❌ No | ✅ Sí | `faceDown` |
| `faceDown` | Criaturas Boca Abajo | ❌ No | ❌ No | `victory` |

---

## 🧪 Testing y Validación

### 📋 Archivos de Prueba
- `test_game_phases.js`: Pruebas completas de las 3 fases
- `ValidationService.js`: Validación específica por fase

### 🎯 Casos de Prueba
1. **Organización inicial**: Verificar distribución correcta de cartas
2. **Transiciones automáticas**: Verificar cambios de fase
3. **Robo en fase de mano**: Verificar robo automático
4. **Sin robo en fases 2-3**: Verificar que no se puede robar
5. **Penalización boca abajo**: Verificar regreso a fase de mano
6. **Victoria**: Verificar ganador al completar todas las fases

### 🚀 Comando de Prueba
```bash
cd api && node test_game_phases.js
```

---

## 🎨 Integración con el Frontend

### 📊 Información de Estado
El frontend recibe información detallada sobre las fases:

```javascript
// En getGameState()
{
  currentPhase: 'hand',
  phaseInfo: {
    current: 'hand',
    description: 'Fase de la Mano',
    canDraw: true,
    cardsVisible: true,
    nextPhase: 'faceUp'
  },
  hand: [...], // Solo para el jugador actual
  faceUpCreatures: [...], // Visibles para todos
  faceDownCreatures: [{ hidden: true }], // Ocultas para otros
  soulWellSize: 3
}
```

### 🎮 Interfaz de Usuario
- **Indicador de fase**: Mostrar fase actual y descripción
- **Cartas jugables**: Resaltar cartas disponibles según la fase
- **Información de robo**: Indicar si se puede robar
- **Advertencias**: Mostrar consecuencias de jugadas boca abajo
- **Transiciones**: Animaciones al cambiar de fase

### 🎯 Feedback Visual
1. **Fase de Mano**: Mostrar cartas en mano con opción de robo
2. **Fase Boca Arriba**: Mostrar criaturas visibles sin opción de robo
3. **Fase Boca Abajo**: Mostrar cartas ocultas con advertencias
4. **Transiciones**: Efectos visuales al cambiar de fase

---

## 📈 Estrategias por Fase

### 🎯 Fase 1: La Mano
- **Gestión de recursos**: Usar cartas estratégicamente
- **Control del robo**: Mantener cartas útiles en el Pozo de Almas
- **Preparación**: Organizar cartas para las siguientes fases

### 🎯 Fase 2: Boca Arriba
- **Planificación**: Usar cartas en orden óptimo
- **Sin red de seguridad**: No hay robo disponible
- **Estrategia final**: Preparar para la fase más difícil

### 🎯 Fase 3: Boca Abajo
- **Gestión de riesgo**: Jugar cartas sin saber qué son
- **Memoria**: Recordar qué cartas se han jugado
- **Recuperación**: Manejar regresos a fase de mano

---

## 🐛 Debugging y Logs

### 📝 Logs del Sistema
```javascript
console.log(`🎮 Organizando criaturas para ${player.name}...`);
console.log(`📋 Criaturas boca arriba: ${faceUpCreatures.map(c => c.name).join(', ')}`);
console.log(`🃏 Criaturas boca abajo: ${faceDownCreatures.length} cartas ocultas`);
console.log(`💎 Pozo de Almas: ${soulWell.length} cartas`);
console.log(`✋ Mano inicial: ${hand.map(c => c.name).join(', ')}`);
```

### 🔍 Puntos de Verificación
1. **Organización inicial**: Logs de distribución de cartas
2. **Transiciones**: Logs de cambios de fase
3. **Robo**: Logs de cartas robadas del Pozo de Almas
4. **Penalizaciones**: Logs de regresos a fase de mano
5. **Victoria**: Logs de jugadores que ganan

---

## 🚀 Estado del Proyecto

### ✅ Completado
- [x] Implementación de las 3 fases del juego
- [x] Transiciones automáticas entre fases
- [x] Sistema de robo en fase de mano
- [x] Validación específica por fase
- [x] Penalización por cartas inválidas boca abajo
- [x] Información detallada de fases
- [x] Testing automatizado
- [x] Documentación completa

### 🎯 Próximos Pasos
- [ ] Integración con animaciones del frontend
- [ ] Sonidos específicos por fase
- [ ] Tutorial interactivo de fases
- [ ] Estadísticas de fases por jugador

---

*¡Las 3 fases del juego están completamente implementadas y listas para el juego! 🚀🎮*
